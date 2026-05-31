import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, User, Loader2, Copy, Trash2, Check, Star, Bookmark, X } from 'lucide-react'
import { getApiKey } from '../utils/deepseek'
import { digitalAvatarAPI } from '../utils/supabase'
import { useUser } from '../contexts/UserContext'

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com'
const DEEPSEEK_MODEL = 'deepseek-chat'
const CHAT_HISTORY_KEY = 'avatarChatHistory'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const generateId = () => Math.random().toString(36).substring(2, 15)

export default function AvatarChatPage() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [showSaved, setShowSaved] = useState(false)
  const [savedItems, setSavedItems] = useState<any[]>([])
  const endRef = useRef<HTMLDivElement>(null)

  const avatar = (() => {
    try {
      const raw = localStorage.getItem('digitalAvatar')
      if (!raw) return null
      return JSON.parse(raw)
    } catch { return null }
  })()

  const saveHistory = useCallback((msgs: Message[]) => {
    try { localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(msgs)) } catch {}
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!avatar) { navigate('/register'); return }
    try {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
          return
        }
      }
    } catch {}
    const greeting = `你好！我是你的${avatar.companionTitle || 'AI助手'}${avatar.name ? ` ${avatar.name}` : ''}。\n\n有什么我可以帮你的吗？`
    setMessages([{ id: generateId(), role: 'assistant', content: greeting }])
  }, [avatar, navigate])

  // Load saved items from server
  useEffect(() => {
    if (user?.id && user.id > 0) {
      digitalAvatarAPI.loadSavedItems(user.id).then(items => {
        setSavedIds(new Set(items.map((i: any) => i.id)))
        setSavedItems(items)
      })
    }
  }, [user?.id])

  useEffect(() => {
    if (messages.length > 0) saveHistory(messages)
  }, [messages, saveHistory])

  const toggleSave = async (msg: Message) => {
    if (!user?.id || user.id < 0) return
    if (savedIds.has(msg.id)) {
      setSavedIds(prev => { const s = new Set(prev); s.delete(msg.id); return s })
      setSavedItems(prev => prev.filter(i => i.id !== msg.id))
      await digitalAvatarAPI.removeSavedItem(user.id, msg.id)
    } else {
      const item = { id: msg.id, content: msg.content, timestamp: Date.now() }
      setSavedIds(prev => { const s = new Set(prev); s.add(msg.id); return s })
      setSavedItems(prev => [...prev, item])
      await digitalAvatarAPI.saveSavedItem(user.id, item)
    }
  }

  const callApi = async (userMsg: string, history: Message[]) => {
    const recent = history.slice(-10).map(m => ({ role: m.role, content: m.content }))
    const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getApiKey()}` },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: avatar.prompt || '你是一个有用的AI助手。' },
          ...recent,
          { role: 'user', content: userMsg },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })
    if (!res.ok) throw new Error(`API请求失败: ${res.status}`)
    const data = await res.json()
    return data.choices[0]?.message?.content || ''
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg: Message = { id: generateId(), role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setLoading(true)
    try {
      const reply = await callApi(text, updated)
      setMessages([...updated, { id: generateId(), role: 'assistant', content: reply }])
    } catch (e: any) {
      setMessages([...updated, { id: generateId(), role: 'assistant', content: `出错了：${e.message}` }])
    }
    setLoading(false)
  }

  const handleExport = async () => {
    const text = messages.map(m =>
      `${m.role === 'user' ? '我' : (avatar.name || 'AI')}:\n${m.content}`
    ).join('\n\n---\n\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleClear = () => {
    if (!confirm('确定清空所有对话记录？')) return
    localStorage.removeItem(CHAT_HISTORY_KEY)
    const greeting = `你好！我是你的${avatar.companionTitle || 'AI助手'}${avatar.name ? ` ${avatar.name}` : ''}。\n\n有什么我可以帮你的吗？`
    setMessages([{ id: generateId(), role: 'assistant', content: greeting }])
  }

  if (!avatar) return null

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
            {avatar.name?.[0] || 'A'}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-800">{avatar.name || 'AI助手'}</div>
            <div className="text-xs text-slate-400">{avatar.companionTitle || ''}</div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => { setShowSaved(!showSaved) }} title="收藏夹" className={`p-2 rounded-lg transition-all ${showSaved ? 'bg-amber-100 text-amber-600' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}>
              <Bookmark className="w-4 h-4" />
              {savedItems.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{savedItems.length}</span>}
            </button>
            <button onClick={handleExport} title="导出对话" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button onClick={handleClear} title="清空对话" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 group ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' ? (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                  {avatar.name?.[0] || 'A'}
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-2xl rounded-tr-md px-4 py-2.5' : 'text-slate-700'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'assistant' && (
                <button onClick={() => toggleSave(msg)}
                  className={`self-start mt-1.5 p-1 rounded-lg transition-all flex-shrink-0 ${
                    savedIds.has(msg.id) ? 'text-amber-500' : 'text-slate-400 hover:text-amber-400'
                  }`}
                  title={savedIds.has(msg.id) ? '取消收藏' : '收藏此条'}
                >
                  <Star className="w-4 h-4" fill={savedIds.has(msg.id) ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                {avatar.name?.[0] || 'A'}
              </div>
              <div className="bg-slate-50 rounded-2xl rounded-tl-md px-4 py-3">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* 收藏夹面板 */}
      {showSaved && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/20" onClick={() => setShowSaved(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[60vh] sm:max-h-[70vh] shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">收藏的回复</h3>
              <button onClick={() => setShowSaved(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {savedItems.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">还没有收藏的内容<br/>在对话中点击消息旁的⭐收藏</p>
              ) : (
                savedItems.slice().reverse().map(item => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-6">{item.content}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleString('zh-CN')}</span>
                      <button onClick={async () => {
                        try { await navigator.clipboard.writeText(item.content); alert('已复制到剪贴板') } catch {}
                      }} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">复制</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="sticky bottom-0 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="输入你的问题..."
              rows={1}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent resize-none text-sm"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
