import { useState, useEffect, useRef } from 'react'
import { BookOpen, Search, Clock, Trash2, Loader2, ChevronDown, ChevronUp, Sparkles, BookMarked, FileText, AlertCircle, Cloud, Smartphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getApiKey, getSharedApiKey } from '../utils/deepseek'
import { supabaseFetch } from '../utils/supabase'
import ReactMarkdown from 'react-markdown'

interface NoteRecord {
  id: string
  topic: string
  content: string
  createdAt: string
  dbId?: number
}

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

const SYSTEM_PROMPT = `你是一位经验丰富的初中英语教师，精通人教版英语教材。请根据用户提供的课题或内容，生成一份详细、结构清晰的课堂笔记。

笔记必须包含以下两大板块：

## 一、知识梳理
- 列出本课的核心词汇、短语搭配、句型结构
- 按重要程度排列，标注考点
- 每个知识点配1-2个典型例句
- 包含易错点提示

## 二、语法聚焦
- 提炼本课的核心语法点
- 给出语法公式/结构
- 正误对比（正确用法 vs 常见错误）
- 配3-5个典型例句
- 相关中考真题或模拟题提示

要求：
1. 内容与教材（人教版）完全同步
2. 语言简洁明了，适合初中生理解
3. 重点内容用 **加粗** 标注
4. 使用清晰的层级结构
5. 如用户提供了具体课文内容，优先基于内容生成
6. 如用户只提供了课题，基于教材知识生成
7. 【关键】中英文对照例句必须写在同一行，不要将英文和中文拆到不同行。正确格式：\`\`Don't forget to close the door.（别忘了关门）\`\`，错误格式：\`\`Don't forget to close the door.\n别忘了关门。\`\``

export default function StudyNotesPage() {
  const [topic, setTopic] = useState('')
  const [content, setContent] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<NoteRecord[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<'topic' | 'content'>('topic')
  const [syncing, setSyncing] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  const currentUser = (() => {
    try {
      const u = localStorage.getItem('user')
      return u ? JSON.parse(u) : null
    } catch { return null }
  })()

  const loadHistory = async () => {
    if (currentUser?.id) {
      try {
        const data = await supabaseFetch(`study_notes?user_id=eq.${currentUser.id}&order=created_at.desc&limit=50`)
        if (Array.isArray(data)) {
          setHistory(data.map((r: any) => ({
            id: String(r.id),
            dbId: r.id,
            topic: r.topic,
            content: r.content,
            createdAt: new Date(r.created_at).toLocaleString('zh-CN'),
          })))
          return
        }
      } catch {}
    }
    try {
      const saved = localStorage.getItem('study_notes_history')
      if (saved) setHistory(JSON.parse(saved))
    } catch {}
  }

  useEffect(() => { loadHistory() }, [])

  const saveToHistory = async (topic: string, notes: string) => {
    const record: NoteRecord = {
      id: Date.now().toString(),
      topic,
      content: notes,
      createdAt: new Date().toLocaleString('zh-CN'),
    }

    if (currentUser?.id) {
      setSyncing(true)
      try {
        const res = await supabaseFetch('study_notes', {
          method: 'POST',
          body: JSON.stringify({ user_id: currentUser.id, topic, content }),
        })
        if (res?.id) record.dbId = res.id
      } catch {}
      setSyncing(false)
    }

    const updated = [record, ...history].slice(0, 50)
    setHistory(updated)
    if (!currentUser?.id) {
      localStorage.setItem('study_notes_history', JSON.stringify(updated))
    }
  }

  const deleteHistory = async (id: string) => {
    const record = history.find(h => h.id === id)
    if (record?.dbId && currentUser?.id) {
      try {
        await supabaseFetch(`study_notes?id=eq.${record.dbId}`, { method: 'DELETE' })
      } catch {}
    }
    const updated = history.filter(h => h.id !== id)
    setHistory(updated)
    if (!currentUser?.id) {
      localStorage.setItem('study_notes_history', JSON.stringify(updated))
    }
  }

  const clearHistory = async () => {
    if (currentUser?.id) {
      try {
        await supabaseFetch(`study_notes?user_id=eq.${currentUser.id}`, { method: 'DELETE' })
      } catch {}
    }
    setHistory([])
    if (!currentUser?.id) {
      localStorage.removeItem('study_notes_history')
    }
  }

  const generate = async () => {
    const apiKey = getApiKey() || getSharedApiKey()
    if (!apiKey) {
      setError('请先在 设置 > API Key 中配置 DeepSeek API Key')
      return
    }
    const input = mode === 'topic' ? topic.trim() : content.trim()
    if (!input) {
      setError('请输入课题或内容')
      return
    }

    setLoading(true)
    setError('')
    setNotes('')

    const userMessage = mode === 'topic'
      ? `请为课题"${input}"生成课堂笔记（知识梳理 + 语法聚焦）`
      : `请基于以下课文内容生成课堂笔记（知识梳理 + 语法聚焦）：\n\n${input}`

    try {
      const res = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 4096,
          temperature: 0.6,
        }),
      })

      if (!res.ok) {
        const errData = await res.text()
        throw new Error(`API 请求失败 (${res.status}): ${errData}`)
      }

      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || ''
      setNotes(reply)
      saveToHistory(mode === 'topic' ? topic : content.substring(0, 60) + '...', reply)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err: any) {
      setError(err.message || '生成失败，请检查网络和 API Key')
    } finally {
      setLoading(false)
    }
  }

  const copyNotes = async () => {
    try {
      await navigator.clipboard.writeText(notes)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const loadFromHistory = (record: NoteRecord) => {
    setNotes(record.content)
    setTopic(record.topic)
    setShowHistory(false)
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  return (
    <div className="min-h-screen bg-stone-100" style={{ background: 'linear-gradient(135deg, #f5f0eb 0%, #efe8e0 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/learn" className="flex items-center gap-2 text-stone-800 hover:text-stone-950 transition-colors">
            <BookOpen className="w-5 h-5" />
            <span className="font-semibold">学霸笔记</span>
          </Link>
          <div className="flex items-center gap-2">
            {currentUser?.id && (
              <span className="flex items-center gap-1 text-xs text-stone-400 mr-1">
                <Cloud className="w-3 h-3" />
                {syncing ? '同步中...' : '已同步'}
              </span>
            )}
            {!currentUser?.id && (
              <span className="flex items-center gap-1 text-xs text-stone-400 mr-1">
                <Smartphone className="w-3 h-3" />
                本地存储
              </span>
            )}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-stone-700 hover:bg-stone-200 transition-colors"
            >
              <Clock className="w-4 h-4" />
              历史记录
              {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="border-b border-stone-200 bg-stone-100">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-stone-700">笔记记录 ({history.length})</span>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> 清空
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-stone-500 py-2">暂无记录</p>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {history.map(record => (
                  <div
                    key={record.id}
                    className="flex-shrink-0 w-48 p-3 bg-white rounded-lg border border-stone-200 hover:border-stone-400 hover:shadow-sm transition-all text-left relative group"
                  >
                    <button
                      onClick={() => loadFromHistory(record)}
                      className="w-full text-left"
                    >
                      <div className="text-sm font-medium text-stone-800 truncate">{record.topic}</div>
                      <div className="text-xs text-stone-500 mt-1">{record.createdAt}</div>
                    </button>
                    <button
                      onClick={() => deleteHistory(record.id)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                      title="删除此记录"
                    >
                      <span className="text-xs leading-none">×</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Mode Toggle */}
        <div className="flex gap-1 mb-6 bg-white/90 rounded-xl p-1 border border-stone-200 w-fit">
          <button
            onClick={() => setMode('topic')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'topic' ? 'bg-stone-700 text-white shadow-sm' : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Search className="w-4 h-4 inline mr-1.5" />按课题
          </button>
          <button
            onClick={() => setMode('content')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'content' ? 'bg-stone-700 text-white shadow-sm' : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-1.5" />按内容
          </button>
        </div>

        {/* Input Area */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-stone-200 p-6 shadow-sm">
          {mode === 'topic' ? (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">输入课题名称</label>
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && generate()}
                placeholder="例如：七下 Unit 1 Section A、一般现在时、八年级上册 Unit 3 Reading..."
                className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none text-stone-900 placeholder:text-stone-400"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">粘贴课文内容</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={6}
                placeholder="将课文原文粘贴到这里，AI 将基于内容生成详细笔记..."
                className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none text-stone-900 placeholder:text-stone-400 resize-none"
              />
            </div>
          )}

          <button
            onClick={generate}
            disabled={loading || (mode === 'topic' ? !topic.trim() : !content.trim())}
            className="mt-4 w-full py-3 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-stone-700 text-white hover:bg-stone-800"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                正在生成笔记...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                生成笔记
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Notes Result */}
        {notes && (
          <div ref={resultRef} className="mt-8 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            {/* Notes Header */}
            <div className="sticky top-0 bg-stone-50 border-b border-stone-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-stone-600" />
                <span className="font-semibold text-stone-900">
                  {mode === 'topic' ? topic : '课文笔记'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyNotes}
                  className="px-3 py-1.5 rounded-lg text-sm text-stone-700 hover:bg-stone-200 transition-colors"
                >
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
            </div>

            {/* Notes Content */}
            <div className="px-6 py-6 prose prose-stone max-w-none">
              <ReactMarkdown>{notes}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!notes && !loading && (
          <div className="mt-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-stone-200 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-stone-500" />
            </div>
            <h3 className="text-lg font-semibold text-stone-800 mb-1">学霸笔记</h3>
            <p className="text-sm text-stone-600 max-w-md mx-auto">
              输入课题或粘贴课文内容，AI 自动生成结构化课堂笔记，包含知识梳理与语法聚焦两大板块，与教材完全同步。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
