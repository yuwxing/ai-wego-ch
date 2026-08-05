import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  FileImage, Brain, CheckCircle, Loader2,
  Upload, BarChart3, Sparkles,
  Award, ChevronRight, Trash2, Plus, ArrowLeft,
  Eye, X, MessageCircle, Send, Minimize2, ScanLine
} from 'lucide-react'
import { getApiKey, getSharedApiKey, sendToDeepSeek } from '../utils/deepseek'
import Tesseract from 'tesseract.js'

interface SheetResult {
  name: string
  dataUrl: string
  status: 'pending' | 'ocr' | 'grading' | 'completed' | 'failed'
  ocrText: string
  totalScore: number
  fullScore: number
  comment: string
  error: string
}

interface GradingTask {
  id: number
  title: string
  subject: string
  gradeLevel: string
  answerKey: string
  answerKeyImage: string
  sheets: SheetResult[]
  status: 'pending' | 'running' | 'completed'
  createdAt: string
}

const SUBJECTS = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '综合']
const GRADE_LEVELS = ['小学', '初中', '高中']

function genId() { return Date.now() + Math.floor(Math.random() * 1000) }

function buildGradingPrompt(subject: string, gradeLevel: string, answerKey: string, ocrText: string) {
  const keySection = answerKey
    ? `\n## 标准答案\n${answerKey}\n请严格按照标准答案判定对错。`
    : `\n客观题请自行判断，主观题酌情给分。`

  // truncate OCR text to avoid token overflow
  const truncated = ocrText.length > 3000 ? ocrText.slice(0, 3000) + '\n...(以下内容被截断)' : ocrText

  return `你是一位专业的${gradeLevel}${subject}阅卷老师。

以下是OCR从学生答题卡照片识别出的文字内容（可能有少量识别错误，请结合常识判断）：

\`\`\`
${truncated}
\`\`\`
${keySection}

请完成批改：
1. 判断每道题的对错，给出得分
2. 计算总分
3. 给出简短评语

务必返回严格合法的JSON格式，不要包含任何其他文字，不要在JSON末尾加逗号，确保JSON完整闭合：
{"totalScore":总分,"fullScore":试卷满分,"questions":[{"number":1,"score":得分,"maxScore":满分,"correct":true}],"comment":"评语"}`
}

const subjectsMeta: Record<string, { icon: string; color: string }> = {
  '语文': { icon: '📖', color: 'from-red-400 to-red-500' },
  '数学': { icon: '🔢', color: 'from-blue-400 to-blue-500' },
  '英语': { icon: '🔤', color: 'from-green-400 to-green-500' },
  '物理': { icon: '⚡', color: 'from-purple-400 to-purple-500' },
  '化学': { icon: '🧪', color: 'from-cyan-400 to-cyan-500' },
  '生物': { icon: '🧬', color: 'from-emerald-400 to-emerald-500' },
  '历史': { icon: '📜', color: 'from-amber-400 to-amber-500' },
  '地理': { icon: '🌍', color: 'from-teal-400 to-teal-500' },
  '政治': { icon: '⚖️', color: 'from-rose-400 to-rose-500' },
  '综合': { icon: '📚', color: 'from-gray-400 to-gray-500' },
}

export default function GradingPage() {
  const [tab, setTab] = useState<'dashboard' | 'tasks'>('dashboard')
  const [tasks, setTasks] = useState<GradingTask[]>([])
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [answerKey, setAnswerKey] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [ansKeyFile, setAnsKeyFile] = useState<File | null>(null)
  const [ansKeyPreview, setAnsKeyPreview] = useState('')
  const [ansKeyOcrText, setAnsKeyOcrText] = useState('')
  const [running, setRunning] = useState(false)
  const [ocrProgress, setOcrProgress] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [expandedTask, setExpandedTask] = useState<number | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMsgs, setChatMsgs] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: '你好！我是阅卷助手。\n\n你可以问：\n• 如何上传答题卡？\n• OCR识别不准怎么办？\n• 怎么填标准答案？' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const saveTasks = useCallback((ts: GradingTask[]) => {
    setTasks(ts)
    localStorage.setItem('grading_tasks', JSON.stringify(ts))
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('grading_tasks')
      if (saved) setTasks(JSON.parse(saved))
    } catch { }
  }, [])

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    sheets: tasks.reduce((s, t) => s + t.sheets.length, 0),
  }

  const handleFiles = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles?.length) return
    const imageFiles = Array.from(selectedFiles).filter(f =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    )
    if (imageFiles.length === 0) return
    setFiles(prev => [...prev, ...imageFiles])
    const newPreviews = await Promise.all(
      imageFiles.map(f => new Promise<string>((resolve) => {
        const url = URL.createObjectURL(f)
        resolve(url)
      }))
    )
    setPreviews(prev => [...prev, ...newPreviews])
  }, [])

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
    setPreviews(prev => {
      URL.revokeObjectURL(prev[idx])
      return prev.filter((_, i) => i !== idx)
    })
  }

  const handleStartGrading = async () => {
    const theKey = getApiKey() || getSharedApiKey()
    if (!theKey) {
      alert('请先在系统设置中配置 DeepSeek API Key')
      return
    }
    if (files.length === 0) return
    if (!subject) { alert('请选择科目'); return }

    setRunning(true)

    // capture local vars before any state changes
    const currentFiles = [...files]
    const currentPreviews = [...previews]
    const currentAnsKeyFile = ansKeyFile
    const currentAnsKeyPreview = ansKeyPreview
    const currentAnswerKey = answerKey
    const currentSubject = subject
    const currentGradeLevel = gradeLevel || '初中'
    const currentTitle = title

    // clear UI immediately
    setFiles([])
    setPreviews([])
    setAnsKeyFile(null)
    setAnsKeyPreview('')
    setTitle('')

    let extractedAnswerKey = currentAnswerKey

    // OCR answer key image if uploaded
    if (currentAnsKeyFile) {
      setOcrProgress('正在OCR识别标准答案答题卡...')
      try {
        const { data } = await Tesseract.recognize(
          currentAnsKeyFile, 'chi_sim+eng',
          { logger: (m) => { if (m.status === 'recognizing text') setOcrProgress(`识别标准答案中... ${Math.round(m.progress * 100)}%`) } }
        )
        extractedAnswerKey = data.text.trim()
        setAnsKeyOcrText(extractedAnswerKey)
        if (!currentAnswerKey) setAnswerKey(extractedAnswerKey)
        console.log('答案卡OCR成功:', extractedAnswerKey)
      } catch (e: any) {
        console.warn('答案卡OCR失败:', e)
        extractedAnswerKey = currentAnswerKey || '(OCR识别失败)'
      }
    }

    const sheets: SheetResult[] = currentFiles.map((f, i) => ({
      name: f.name,
      dataUrl: currentPreviews[i],
      status: 'pending' as const,
      ocrText: '',
      totalScore: 0,
      fullScore: 0,
      comment: '',
      error: '',
    }))

    const taskId = genId()
    const task: GradingTask = {
      id: taskId,
      title: currentTitle || `${currentSubject}阅卷 - ${currentFiles.length}份`,
      subject: currentSubject,
      gradeLevel: currentGradeLevel,
      answerKey: extractedAnswerKey,
      answerKeyImage: currentAnsKeyPreview,
      sheets,
      status: 'running',
      createdAt: new Date().toISOString(),
    }

    saveTasks([task, ...tasks])
    setTab('tasks')
    setOcrProgress('准备开始...')

    const updateSheet = (idx: number, patch: Partial<SheetResult>) => {
      setTasks(prev => prev.map(t => {
        if (t.id !== taskId) return t
        const newSheets = [...t.sheets]
        newSheets[idx] = { ...newSheets[idx], ...patch }
        const allDone = newSheets.every(s => s.status === 'completed' || s.status === 'failed')
        return { ...t, sheets: newSheets, status: allDone ? (newSheets.some(s => s.status === 'completed') ? 'completed' : 'failed') : 'running' }
      }))
    }

    for (let i = 0; i < currentFiles.length; i++) {
      setOcrProgress(`正在处理第 ${i + 1}/${currentFiles.length} 张...`)
      updateSheet(i, { status: 'ocr', error: '' })

      try {
        // Step 1: OCR
        setOcrProgress(`第 ${i + 1} 张 - OCR识别中...`)
        let ocrText = ''
        try {
          const { data } = await Tesseract.recognize(
            currentFiles[i], 'chi_sim+eng',
            { logger: (m) => { if (m.status === 'recognizing text') setOcrProgress(`第 ${i + 1} 张 - OCR ${Math.round(m.progress * 100)}%`) } }
          )
          ocrText = data.text.trim()
        } catch (ocrErr: any) {
          updateSheet(i, { status: 'failed', error: `OCR识别失败: ${ocrErr.message || '未知错误'}` })
          continue
        }

        if (!ocrText) {
          updateSheet(i, { status: 'failed', error: 'OCR未能识别出文字，请确认照片清晰' })
          continue
        }

        updateSheet(i, { status: 'grading', ocrText })

        // Step 2: DeepSeek grading
        setOcrProgress(`第 ${i + 1} 张 - AI批改中...`)
        const prompt = buildGradingPrompt(currentSubject, currentGradeLevel, extractedAnswerKey, ocrText)

        let result = ''
        try {
          result = await sendToDeepSeek(
            [{ role: 'user', content: prompt }],
            undefined,
            undefined,
            4096
          )
        } catch (apiErr: any) {
          updateSheet(i, { status: 'failed', error: `DeepSeek API 错误: ${apiErr.message || '请求失败'}` })
          continue
        }

        // Step 3: Parse JSON result
        const cleaned = result.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
        let parsed: any
        try { parsed = JSON.parse(cleaned) } catch {
          const match = cleaned.match(/\{[\s\S]*\}/)
          if (match) { try { parsed = JSON.parse(match[0]) } catch {} }
        }

        if (!parsed || typeof parsed.totalScore !== 'number') {
          updateSheet(i, { status: 'failed', error: `AI返回格式异常: ${result.slice(0, 100)}` })
          continue
        }

        updateSheet(i, {
          status: 'completed',
          totalScore: parsed.totalScore || 0,
          fullScore: parsed.fullScore || 100,
          comment: parsed.comment || '',
        })
      } catch (err: any) {
        updateSheet(i, { status: 'failed', error: err.message || '未知错误' })
      }
    }

    setOcrProgress('')
    setRunning(false)
  }

  const handleDelete = (taskId: number) => {
    saveTasks(tasks.filter(t => t.id !== taskId))
  }

  const handleChatSend = async () => {
    const msg = chatInput.trim()
    if (!msg || chatLoading) return
    setChatInput('')
    setChatMsgs(prev => [...prev, { role: 'user', content: msg }])
    setChatLoading(true)
    try {
      const newMsgs = [
        { role: 'system', content: `你是AI-Wego阅卷系统的助手，帮助老师使用阅卷系统。

阅卷系统功能：
- 上传答题卡照片 → OCR识别文字 → DeepSeek AI批改 → 显示分数
- 支持所有科目和学段
- 使用系统中已配置的 DeepSeek API Key
- 可选填标准答案（如 "1:A 2:B 3:120"）让批改更准确
- 结果保存在本地浏览器

使用建议：
1. 拍照要清晰，字迹工整，光线充足
2. 答题卡尽量拍正，不要倾斜
3. 如果OCR识别文字乱码，可能是照片不够清晰
4. 填写标准答案可以大大提高批改准确率
5. 批改结果是 AI 辅助判断，仅供参考

回答要简洁实用，用中文。` },
        ...chatMsgs.filter(m => m.role === 'user' || m.role === 'assistant').slice(-10),
        { role: 'user', content: msg },
      ]
      let full = ''
      await sendToDeepSeek(
        newMsgs.map(m => ({ role: m.role, content: m.content })),
        (chunk) => { full += chunk },
        undefined,
        1024
      )
      setChatMsgs(prev => [...prev, { role: 'assistant', content: full }])
    } catch (e: any) {
      setChatMsgs(prev => [...prev, { role: 'assistant', content: '出错了：' + (e.message || '') }])
    }
    setChatLoading(false)
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMsgs])

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'pending') return <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">等待</span>
    if (status === 'ocr') return <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 flex items-center gap-1"><ScanLine size={10} />识别中</span>
    if (status === 'grading') return <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-600 flex items-center gap-1"><Loader2 size={10} className="animate-spin" />批改中</span>
    if (status === 'completed') return <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">已完成</span>
    return <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">失败</span>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-white pb-12">
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Link to="/"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-indigo-600 mb-4">
          <ArrowLeft size={14} /> 返回首页
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AI-Wego阅卷</h1>
            <p className="text-sm text-gray-400">拍照上传 → OCR识别文字 → AI自动批改</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: BarChart3, label: '阅卷任务', value: stats.total, bg: 'bg-indigo-100', color: 'text-indigo-600' },
            { icon: CheckCircle, label: '已完成', value: stats.completed, bg: 'bg-emerald-100', color: 'text-emerald-600' },
            { icon: FileImage, label: '批改份数', value: stats.sheets, bg: 'bg-amber-100', color: 'text-amber-600' },
          ].map(({ icon: Icon, label, value, bg, color }) => (
            <div key={label}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 w-fit mb-6">
          <button onClick={() => setTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          ><Plus size={16} /> 新建阅卷</button>
          <button onClick={() => setTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'tasks' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          ><BarChart3 size={16} /> 任务列表 ({tasks.length})</button>
        </div>

        {tab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                <FileImage size={18} className="text-indigo-500" />
                <span>上传答题卡照片</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">支持 JPG / PNG / WebP，手机拍照即可。照片越清晰识别越准</p>

              <div className="grid grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">任务标题</label>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="例如: 期中考试"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-300"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">科目</label>
                  <select value={subject} onChange={e => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-300"
                  >
                    <option value="">选择科目</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">学段</label>
                  <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-300"
                  >
                    {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">标准答案 <span className="text-gray-300">(可选)</span></label>
                  <div className="flex gap-2">
                    <input value={answerKey} onChange={e => setAnswerKey(e.target.value)}
                      placeholder="1:A 2:B 3:120"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-300"
                    />
                    <button onClick={() => document.getElementById('ansKeyInput')?.click()}
                      className="px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 flex items-center gap-1">
                      <Upload size={14} />上传
                    </button>
                    <input id="ansKeyInput" type="file" accept="image/jpeg,image/png,image/webp"
                      onChange={e => {
                        const f = e.target.files?.[0]
                        if (f) { setAnsKeyFile(f); setAnsKeyPreview(URL.createObjectURL(f)) }
                      }}
                      className="hidden" />
                  </div>
                  {ansKeyPreview && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <img src={ansKeyPreview} className="h-8 rounded border" />
                      <span className="text-[11px] text-gray-400">{ansKeyFile?.name}</span>
                      <button onClick={() => { setAnsKeyFile(null); setAnsKeyPreview('') }}
                        className="text-[11px] text-red-400">移除</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-indigo-400', 'bg-indigo-50') }}
                onDragLeave={e => { e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50') }}
                onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50'); handleFiles(e.dataTransfer.files) }}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-indigo-300 transition cursor-pointer mb-4"
              >
                <Upload size={28} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">点击或拖拽上传答题卡照片</p>
                <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp"
                  onChange={e => handleFiles(e.target.files)} className="hidden" />
              </div>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">已选择 {previews.length} 张答题卡：</p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {previews.map((url, i) => (
                      <div key={i} className="relative flex-shrink-0 group">
                        <img src={url} alt={`答题卡 ${i + 1}`}
                          className="w-28 h-36 object-cover rounded-lg border border-gray-200" />
                        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => removeFile(i)}
                            className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                            <X size={12} />
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 truncate w-28">{files[i]?.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OCR Progress */}
              {ocrProgress && (
                <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-4 py-2 mb-3">
                  <Loader2 size={14} className="animate-spin" />
                  {ocrProgress}
                </div>
              )}

              <button onClick={handleStartGrading}
                disabled={files.length === 0 || running}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {running ? (
                  <><Loader2 size={18} className="animate-spin" /> 处理中...</>
                ) : (
                  <><ScanLine size={18} /> 开始OCR识别 + AI阅卷 ({files.length}份)</>
                )}
              </button>

              {!(getApiKey() || getSharedApiKey()) && (
                <p className="text-xs text-amber-600 mt-2 text-center">
                  请先在 <Link to="/settings/api-key" className="underline">系统设置</Link> 中配置 DeepSeek API Key
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: ScanLine, title: 'OCR识别', desc: '浏览器本地识别图片文字，无需上传服务器' },
                { icon: Brain, title: 'AI批改', desc: 'DeepSeek 智能批改，支持所有科目题型' },
                { icon: Eye, title: '结果可查', desc: '每张答题卡的识别结果和批改详情可查看' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title}
                  className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'tasks' && (
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                <FileImage size={40} className="mx-auto mb-3 text-gray-200" />
                <p className="text-gray-400 text-sm">暂无阅卷任务</p>
              </div>
            ) : tasks.map(t => {
              const meta = subjectsMeta[t.subject] || subjectsMeta['综合']
              const completedCount = t.sheets.filter(s => s.status === 'completed').length
              const failedCount = t.sheets.filter(s => s.status === 'failed').length
              const avgScore = completedCount > 0
                ? t.sheets.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.totalScore, 0) / completedCount
                : 0
              return (
                <div key={t.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:border-indigo-200 transition-colors cursor-pointer"
                  onClick={() => setExpandedTask(expandedTask === t.id ? null : t.id)}>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-lg shadow-sm flex-shrink-0`}>{meta.icon}</div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-800 truncate">{t.title}</h3>
                            <StatusBadge status={t.status} />
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                            <span>{t.subject} · {t.gradeLevel}</span>
                            <span>{completedCount + failedCount}/{t.sheets.length} 份</span>
                            {completedCount > 0 && <span className="text-green-600 font-medium">{completedCount}份成功</span>}
                            {failedCount > 0 && <span className="text-red-500 font-medium">{failedCount}份失败</span>}
                            {completedCount > 0 && (
                              <span>平均分 <strong className="text-indigo-600">{avgScore.toFixed(1)}</strong></span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(t.id) }}
                          className="p-1.5 text-gray-300 hover:text-red-500 transition"><Trash2 size={14} /></button>
                        <ChevronRight size={16}
                          className={`text-gray-300 transition-transform ${expandedTask === t.id ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                    {/* Show first error in collapsed view */}
                    {t.status !== 'running' && t.sheets.length > 0 && t.sheets.every(s => s.status === 'failed') && (
                      <p className="text-xs text-red-500 mt-2">{t.sheets[0].error}</p>
                    )}
                  </div>

                  {expandedTask === t.id && (
                    <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3 space-y-2">
                      {t.sheets.map((sheet, si) => (
                        <div key={si} className="bg-white rounded-lg border border-gray-100 p-3">
                          <div className="flex items-start gap-3">
                            <img src={sheet.dataUrl} alt={sheet.name}
                              className="w-16 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-700 truncate">{sheet.name}</span>
                                <StatusBadge status={sheet.status} />
                              </div>
                              {sheet.status === 'ocr' && (
                                <div className="flex items-center gap-2 text-xs text-blue-600">
                                  <Loader2 size={12} className="animate-spin" /> 正在OCR识别...
                                </div>
                              )}
                              {sheet.status === 'grading' && (
                                <div className="flex items-center gap-2 text-xs text-purple-600">
                                  <Loader2 size={12} className="animate-spin" /> AI批改中...
                                </div>
                              )}
                              {sheet.status === 'completed' && (
                                <>
                                  <div className="flex items-center gap-3 text-sm mb-1">
                                    <span className="font-bold text-indigo-600">{sheet.totalScore}分</span>
                                    <span className="text-gray-400">/ {sheet.fullScore}分</span>
                                  </div>
                                  {sheet.ocrText && (
                                    <details className="mt-1">
                                      <summary className="text-[11px] text-gray-400 cursor-pointer hover:text-gray-600">查看OCR识别文本</summary>
                                      <p className="text-[11px] text-gray-500 mt-1 bg-gray-50 rounded p-2 whitespace-pre-wrap max-h-24 overflow-y-auto">{sheet.ocrText}</p>
                                    </details>
                                  )}
                                  {sheet.comment && (
                                    <p className="text-xs text-gray-500 italic mt-1">{sheet.comment}</p>
                                  )}
                                </>
                              )}
                              {sheet.status === 'failed' && (
                                <p className="text-xs text-red-500">{sheet.error}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            {tasks.length > 0 && (
              <p className="text-xs text-gray-400 text-center pt-2">
                共 {tasks.length} 个任务
                <button onClick={() => {
                  try { const saved = localStorage.getItem('grading_tasks'); if (saved) setTasks(JSON.parse(saved)) } catch { }
                }} className="ml-2 text-indigo-500 hover:underline">刷新</button>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Chat Button */}
      <button onClick={() => setChatOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all flex items-center justify-center z-40 ${chatOpen ? 'hidden' : ''}`}>
        <MessageCircle size={24} />
      </button>

      {/* Chat Panel */}
      <div className={`fixed bottom-0 right-0 w-full sm:w-96 h-[60vh] sm:h-[80vh] bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col transition-transform duration-300 ${chatOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ bottom: 0, maxHeight: 'calc(100vh - 80px)' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} />
            <span className="font-medium text-sm">阅卷助手</span>
          </div>
          <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition"><Minimize2 size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
          {chatMsgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-md' : 'bg-white border border-gray-100 text-gray-700 rounded-bl-md shadow-sm'}`}>
                {m.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="border-t border-gray-100 p-3 bg-white">
          <div className="flex gap-2">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend() } }}
              placeholder="输入你的问题..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-300"
            />
            <button onClick={handleChatSend} disabled={chatLoading || !chatInput.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl disabled:opacity-50 flex items-center gap-1">
              {chatLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
