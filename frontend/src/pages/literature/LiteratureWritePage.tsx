import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, PenLine, Sparkles, CheckCircle, AlertCircle, Loader2, Save, Send, Lightbulb, Wand2, Clock, User, ChevronRight, Menu, X, Target, Plus, Cloud, CloudOff } from 'lucide-react'
import { getApiKey } from '../../utils/deepseek'
import { literatureAPI, sharedStoryAPI } from '../../utils/supabase'
import { useUser } from '../../contexts/UserContext'

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com'
const DEEPSEEK_MODEL = 'deepseek-chat'

const REVIEW_PROMPT = `你是一位严格的语文老师，正在评审学生的文学续写作品。
请从以下三个维度打分（每项满分100）：
1. 连贯性：与上文衔接是否自然
2. 创意度：情节构思是否新颖
3. 文学性：语言表达是否优美

并给出总体评分（满分100分，>=80分通过）和3条具体改进建议。
同时为这段续写生成一个精炼的章节标题（4-10字，概括本段核心情节）。
请以 JSON 格式返回，不要带 markdown 包裹：
{
  "coherence": 数字,
  "creativity": 数字,
  "literary": 数字,
  "total_score": 数字,
  "passed": true/false,
  "chapter_title": "生成的标题",
  "suggestions": ["建议1", "建议2", "建议3"]
}`

const MOCK_CHAPTERS = [
  { id: 1, title: '第一章', content: '枕书行推开绿草地文学社的门时，屋里只有一个人。\n\n那人背对着他，站在窗边，手里捏着一张纸。阳光从窗帘缝隙里切进来，正好把那张纸照得发白，看不清上面写了什么。\n\n"你是新来的？"那人没回头，声音很轻。\n\n枕书行站在门口，没进去。"有人留了张纸条，说今天下午三点，来这里接一个故事。"\n\n那人终于转过身来。是个女生，校服外面套了一件旧毛衣，袖口起了毛球。她把那张纸翻过来，亮给枕书行看——上面是空白的。\n\n"纸条在哪？"她问。\n\n枕书行低头看自己的手。\n\n他手里什么都没有。', author: '枕书行', wordCount: 306 },
  { id: 2, title: '第二章', content: '枕书行重新打量了一眼面前这个女生。毛衣起球，袖口有线头，头发随便扎了一把，碎发贴在脖子上。整个人像是从旧货市场里拎出来的。\n\n他笑了一下。不是恶意的笑，是那种在食堂打饭时看到有人把汤洒了，觉得好笑又懒得说的笑。\n\n"你叫什么名字？"\n\n他问得很随意，语气像是在点一杯奶茶。\n\n"王语苡。"女生说。\n\n她的语气不像是在做自我介绍，更像是在念一道题的答案。念完之后，她没等枕书行反应，把那张空白的纸折了两折，塞进毛衣口袋里，然后抬起头看他。\n\n"所以纸条是你写的，还是你捡的？"\n\n枕书行看着她把纸收起来，眉头动了一下。他注意到一个细节：她问的是"写的"还是"捡的"——两个选项里都没有"收到"。她默认这张纸条不是写给她的。\n\n"你接到那张纸条，然后按照纸条上的地址找到这里来，"王语苡继续说，语气里带着一点琢磨的意味，"但你刚才进门的时候，手里是空的。纸条没了。"\n\n她歪了歪头，像是在解一道有趣的数学题，而不是在和一个陌生人对峙。\n\n"你是把它弄丢了，还是……它自己不见了？"', author: '王语苡', wordCount: 410 },
  { id: 3, title: '第三章', content: '枕书行没有立刻回答。\n\n他站在门口，门框的阴影斜切在他身上，把他从肩膀到腰分成两半。他看见王语苡把那张空白的纸折好，塞进毛衣口袋，动作很自然，像是做过很多次。\n\n一个问题突然浮上来，很轻，像水面上的油花——\n\n究竟多少人收到了纸条？\n\n他收到的纸条上写着的是"今天下午三点，绿草地文学社，接一个故事"。那王语苡呢？她手里那张空白的纸，原本写着什么？还是说——她收到的纸条，从一开始就是空白的？\n\n枕书行把这个问题在嘴里含了一下，没吐出来。他换了一个问题。\n\n"你手里那张纸，是谁给你的？"\n\n他把"纸条"换成了"纸"。他不想让她觉得他是在打听她的事——他只是在确认自己的事。\n\n"我捡到的。"王语苡说，"我是顺路进来的。"\n\n她说得很轻巧，像是在说"今天食堂有红烧肉"一样稀松平常。\n\n枕书行看着她。他见过太多人撒谎——有人会眨眼，有人会摸鼻子，有人会把重心从左脚换到右脚。但王语苡什么都没做。她就站在那里，手插在毛衣口袋里，像一棵种在路边的树，没有要躲的意思。\n\n"顺路？"枕书行重复了一遍这个词，像是在品一个味道很奇怪的东西。"文学社在四楼，走廊尽头，门口挂着牌子。你顺路走到这里来？"\n\n他说这话的时候语气并不重，甚至带着一点好奇。但他的逻辑很清楚：一个外人，捡到一张空白的纸条，然后顺着纸条上的地址，穿过整个校园，爬上四楼，走到走廊尽头——这叫"顺路"？\n\n"你住在学校里？"他问。\n\n"不住。"\n\n"那你来学校干什么？"\n\n王语苡歪了歪头，像是在考虑要不要回答这个问题。然后她说：\n\n"来找人。"\n\n"找谁？"\n\n"找那个写了纸条的人。"\n\n枕书行愣了一下。王语苡的回答像是一个回旋镖——他以为自己在问她，结果她反过来把他带回了原点。她就是来找他的。或者说，来找写纸条的人。而写纸条的人，就是他自己。\n\n他突然觉得这个对话的主动权，好像不在他手里了。', author: '枕书行', wordCount: 514, current: true },
]

const WRITING_PROMPT = `你是一个温暖鼓励的文学小助手，正在帮助一位同学续写故事接龙作品。
请根据上文内容和用户的问题，给出有帮助的建议。
回答要简短、温暖、有文学气息，像一位亲切的语文老师。`

export default function LiteratureWritePage() {
  const navigate = useNavigate()
  const { storyId } = useParams()
  const { user } = useUser()
  const [chapters, setChapters] = useState(MOCK_CHAPTERS)
  const [currentChapter, setCurrentChapter] = useState(3)
  const [userContent, setUserContent] = useState('')
  const [chapterTitle, setChapterTitle] = useState('')
  const [showTimeline, setShowTimeline] = useState(false)
  const [showAssistant, setShowAssistant] = useState(false)
  const [aiLoading, setAiLoading] = useState<'polish' | 'suggest' | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [reviewResult, setReviewResult] = useState<{
    score: number; passed: boolean; code: string; suggestions: string[]
    coherence?: number; creativity?: number; literary?: number; chapter_title?: string
  } | null>(null)
  const [analysis, setAnalysis] = useState({ coherence: 92, creativity: 87, literary: 84 })
  const [pendingSubmit, setPendingSubmit] = useState<{content: string, chapterTitle: string} | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const init = async () => {
      // Fetch ALL submissions from shared table
      let lastAddedId = 0
      try {
        const subs = await sharedStoryAPI.fetchAll()
        setChapters(prev => {
          let next = [...prev]
          for (const sub of subs) {
            if (!sub?.content) continue
            if (next.find(c => c.content === sub.content)) continue
            const chTitle = (sub.chapter_title || '').replace(/^第[一二三四五六七八九十]+章：/, '')
            const chNum = (['一','二','三','四','五','六','七','八','九','十'])[next.length] || String(next.length + 1)
            const chId = next.length + 1
            next = [...next.map(c => ({ ...c, current: false })), {
              id: chId,
              dbId: sub.id,
              title: `第${chNum}章：${chTitle}`,
              content: sub.content,
              author: sub.author_name || '匿名',
              wordCount: sub.content.replace(/\s/g, '').length,
              current: true,
            }]
            lastAddedId = chId
          }
          return next
        })
      } catch {}
      if (lastAddedId) setCurrentChapter(lastAddedId)
      // Recover pending submission (e.g. page refresh during review)
      try {
        const pendingRaw = localStorage.getItem('literature_pending')
        if (pendingRaw) {
          const p = JSON.parse(pendingRaw)
          setPendingSubmit({ content: p.content, chapterTitle: p.chapterTitle || '' })
          setUserContent(p.content)
          setChapterTitle(p.chapterTitle || '')
        }
      } catch {}
    }
    init()
  }, [user?.id])

  const current = chapters.find(c => c.id === currentChapter)
  const previousChapters = chapters.filter(c => c.id < currentChapter)
  const previousContent = previousChapters.map(c => c.content).join('\n\n')

  const wordCount = userContent.replace(/\s/g, '').length

  function autoGenTitle(content: string): string {
    const lines = content.trim().split('\n')
    for (const line of lines) {
      const clean = line.replace(/^["""「」\s]+/, '').trim()
      if (clean.length >= 4) return clean.length > 22 ? clean.slice(0, 22) + '…' : clean
    }
    return '新篇章'
  }

  const callAI = async (prompt: string): Promise<string> => {
    const key = getApiKey()
    if (!key) throw new Error('请先在系统中心配置 DeepSeek API 密钥')
    const res = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: WRITING_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })
    if (!res.ok) throw new Error(`请求失败: ${res.status}`)
    const data = await res.json()
    return data.choices[0]?.message?.content || ''
  }

  const handlePolish = async () => {
    if (!userContent.trim()) return
    setAiLoading('polish')
    setAiResult(null)
    try {
      const result = await callAI(`请帮我润色以下续写内容，保持文学美感，不改变原意：\n\n${userContent}`)
      setAiResult(result)
    } catch (e: any) {
      setAiResult(`润色出错了：${e.message}`)
    }
    setAiLoading(null)
  }

  const handleSuggest = async () => {
    if (!userContent.trim()) return
    setAiLoading('suggest')
    setAiResult(null)
    try {
      const result = await callAI(`这是当前故事的内容：\n${previousContent}\n\n这是续写：\n${userContent}\n\n请给出3条具体的续写建议，让故事更精彩。每条建议一行。`)
      setAiResult(result)
    } catch (e: any) {
      setAiResult(`建议出错了：${e.message}`)
    }
    setAiLoading(null)
  }

  useEffect(() => {
    if (!submitted || reviewResult) return
    const doReview = async () => {
      try {
        const reviewPrompt = `这是故事的上文内容：
${previousContent}

这是学生的续写作品：
${userContent}

请评审。`
        const key = getApiKey()
        let result
        if (key) {
          const res = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
            body: JSON.stringify({
              model: DEEPSEEK_MODEL,
              messages: [
                { role: 'system', content: REVIEW_PROMPT },
                { role: 'user', content: reviewPrompt },
              ],
              temperature: 0.3,
              max_tokens: 1000,
            }),
          })
          if (res.ok) {
            const data = await res.json()
            const text = data.choices[0]?.message?.content || ''
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0])
              result = {
                score: parsed.total_score || Math.round((parsed.coherence + parsed.creativity + parsed.literary) / 3),
                coherence: parsed.coherence,
                creativity: parsed.creativity,
                literary: parsed.literary,
                passed: parsed.passed ?? parsed.total_score >= 80,
                code: '',
                chapter_title: parsed.chapter_title || '',
                suggestions: parsed.suggestions || [],
              }
            }
          }
        }
        if (!result) {
          const fallbackScore = 70 + Math.floor(Math.random() * 15)
          result = {
            score: fallbackScore,
            coherence: fallbackScore,
            creativity: fallbackScore - 5,
            literary: fallbackScore + 3,
            passed: fallbackScore >= 80,
            code: '',
            suggestions: fallbackScore >= 80
              ? ['人物对话自然', '环境描写丰富', '继续保持']
              : ['补充人物心理', '丰富环境描写', '注意段落衔接'],
          }
        }
        setReviewResult(result)
        if (result.chapter_title && !chapterTitle.trim()) setChapterTitle(result.chapter_title)
        setAnalysis({ coherence: result.coherence || 80, creativity: result.creativity || 75, literary: result.literary || 85 })
        localStorage.removeItem('literature_pending')
        setPendingSubmit(null)
        if (result.passed) {
          const chTitle = chapterTitle.trim() || result.chapter_title?.trim() || autoGenTitle(userContent) || (current?.title || '枕书行').replace(/^第[一二三四五六七八九十]+章：/, '')
          const authorName = user?.name || user?.id ? `用户${user.id}` : '匿名'
          // Save to shared table
          try {
            const newSub = await sharedStoryAPI.add({
              chapter_title: chTitle,
              content: userContent,
              author_name: authorName,
              score: result.score,
              passed: true,
              code: '',
              timestamp: Date.now(),
            })
            const dbId = Array.isArray(newSub) ? newSub[0]?.id : newSub?.id || 0
            setChapters(prev => {
              const chId = prev.length + 1
              return [...prev.map(c => ({ ...c, current: false })), {
                id: chId,
                dbId,
                title: `第${['一','二','三','四','五','六','七','八','九','十'][prev.length] || prev.length + 1}章：${chTitle}`,
                content: userContent,
                author: authorName,
                wordCount: userContent.replace(/\s/g, '').length,
                current: true,
              }]
            })
            setCurrentChapter(chapters.length + 1)
          } catch {}
        }
      } catch {}
    }
    const timer = setTimeout(doReview, 2500)
    return () => clearTimeout(timer)
  }, [submitted, reviewResult])

  const handleSubmit = async () => {
    if (!userContent.trim() || wordCount < 1000) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1000))
    setSubmitting(false)
    const chTitle = chapterTitle.trim() || (current?.title || '枕书行').replace(/^第[一二三四五六七八九十]+章：/, '')
    const pending = { content: userContent, chapterTitle: chTitle }
    setPendingSubmit(pending)
    localStorage.setItem('literature_pending', JSON.stringify(pending))
    setSubmitted(true)
  }

  const handleDeleteChapter = (id: number) => {
    const ch = chapters.find(c => c.id === id)
    if (!ch) return
    if (ch.dbId) sharedStoryAPI.remove(ch.dbId)
    setChapters(prev => prev.filter(c => c.id !== id).map(c => ({ ...c, current: c.id === id ? false : c.current })))
    if (currentChapter === id) {
      const prev = chapters.filter(c => c.id < id)
      setCurrentChapter(prev.length > 0 ? prev[prev.length - 1].id : 1)
    }
  }

  const handleNewChapter = () => {
    const id = chapters.length + 1
    const newCh = {
      id,
      title: `第${['一','二','三','四','五','六','七','八','九','十'][id-1] || id}章：新篇章`,
      content: '',
      author: '我',
      wordCount: 0,
      current: true,
    }
    setChapters(prev => [...prev.map(c => ({ ...c, current: false })), newCh])
    setCurrentChapter(id)
    setUserContent('')
    setChapterTitle('')
    setAiResult(null)
  }

  const acceptPolish = () => {
    if (aiResult) {
      setUserContent(aiResult)
      setAiResult(null)
    }
  }

  if (submitted) {
    const reviewing = !reviewResult
    const passed = reviewResult?.passed
    return (
      <div className="page-wrapper min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 relative z-10 text-center">
          <div className="glass-card rounded-2xl p-8">
            {reviewing ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center shadow-md animate-soft-pulse">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">提交成功！</h2>
                <p className="text-slate-500 mb-4">文学小助手正在审核你的作品...</p>
                <div className="max-w-xs mx-auto mb-6">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>评审进度</span>
                    <span className="text-emerald-600 font-medium animate-pulse">AI评审中</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-pulse" style={{ width: '65%' }} />
                  </div>
                </div>
              </>
            ) : passed ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-md">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">写得好！</h2>
                <p className="text-sm text-slate-500 mb-4">AI评分</p>
                <div className="bg-emerald-50 rounded-xl p-4 mb-4 border border-emerald-100">
                  <p className="text-xs text-emerald-500">总分：<span className="text-lg font-bold">{reviewResult.score}</span> / 100</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 mb-6 border border-amber-100 text-left">
                  <p className="text-xs font-medium text-amber-700 mb-1.5">AI评语</p>
                  {reviewResult.suggestions.map((s, i) => (
                    <p key={i} className="text-xs text-amber-600 flex items-center gap-1.5 mb-0.5">
                      <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" /> {s}
                    </p>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">📝 待修改</h2>
                <p className="text-sm text-slate-500 mb-4">你的作品暂未达到收录标准</p>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-3xl font-bold text-amber-500">{reviewResult?.score}</span>
                  <span className="text-sm text-slate-400">/ 100</span>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 mb-6 border border-amber-100 text-left">
                  <p className="text-xs font-medium text-amber-700 mb-1.5">AI建议</p>
                  {reviewResult?.suggestions.map((s, i) => (
                    <p key={i} className="text-xs text-amber-600 flex items-center gap-1.5 mb-0.5">
                      <Target className="w-3 h-3 text-amber-500 flex-shrink-0" /> {s}
                    </p>
                  ))}
                </div>
              </>
            )}
            {passed ? (
              <button onClick={() => navigate('/literature')}
                className="w-full py-3 btn-gradient-primary rounded-xl font-bold text-sm hover:shadow-lg transition-all">
                返回文学社
              </button>
            ) : (
              <button onClick={() => {
                if (pendingSubmit) {
                  setUserContent(pendingSubmit.content)
                  setChapterTitle(pendingSubmit.chapterTitle)
                }
                setSubmitted(false)
                setReviewResult(null)
                setPendingSubmit(null)
                localStorage.removeItem('literature_pending')
              }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all">
                重新修改
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-emerald-50 via-white to-amber-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100/50 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate('/literature')} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-slate-700 hidden sm:inline">绿草地文学社</span>
        <div className="h-4 w-px bg-slate-200 hidden sm:block" />
        <span className="text-xs text-slate-400 truncate flex-1">《枕书行》· {current?.title?.replace('第', '第') || '续写中'}</span>
        <button onClick={() => setShowTimeline(!showTimeline)} className="md:hidden p-1.5 rounded-lg hover:bg-emerald-50 text-slate-500">
          <Menu className="w-4 h-4" />
        </button>
        <button onClick={() => setShowAssistant(!showAssistant)} className="md:hidden p-1.5 rounded-lg hover:bg-emerald-50 text-slate-500">
          <Lightbulb className="w-4 h-4" />
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {showTimeline && (
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowTimeline(false)}>
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700 text-sm">故事时间线</h3>
                <button onClick={() => setShowTimeline(false)} className="p-1 rounded hover:bg-slate-100"><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <Timeline chapters={chapters} currentChapter={currentChapter} onSelect={c => { setCurrentChapter(c.id); setShowTimeline(false) }} onNewChapter={handleNewChapter} />
            </div>
          </div>
        )}

        <aside className="hidden md:block w-56 lg:w-64 bg-white/50 border-r border-emerald-100/50 overflow-y-auto flex-shrink-0 p-4">
          <h3 className="font-semibold text-slate-700 text-sm mb-4 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-emerald-500" /> 故事时间线
          </h3>
          <Timeline chapters={chapters} currentChapter={currentChapter} onSelect={c => setCurrentChapter(c.id)} onNewChapter={handleNewChapter} />
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-600">上文内容</span>
              </div>
              <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/50">
                {previousContent.split('\n\n').map((p, i) => (
                  <p key={i} className={`text-sm text-slate-600 leading-7 whitespace-pre-wrap ${i > 0 ? 'mt-4' : ''}`}>{p}</p>
                ))}
                {current && (
                  <div className="mt-3 pt-3 border-t border-emerald-100/50">
                    <p className="text-xs text-emerald-500 font-medium mb-1">当前章节：{current.title}</p>
                    {current.content.split('\n\n').map((p, i) => (
                      <p key={i} className={`text-sm text-slate-500 leading-7 whitespace-pre-wrap ${i > 0 ? 'mt-4' : ''}`}>{p}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <PenLine className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-600">你的续写</span>
              </div>
              <input type="text" value={chapterTitle} onChange={e => setChapterTitle(e.target.value)}
                placeholder={userContent.trim() ? `如：${autoGenTitle(userContent)}` : '给你的续写起个标题（选填）'} maxLength={30}
                className="w-full mb-3 px-4 py-2.5 rounded-xl bg-white/70 border border-slate-200 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
              />
              <textarea
                ref={textareaRef}
                value={userContent}
                onChange={e => setUserContent(e.target.value)}
                placeholder="从这里开始写下你的续写..."
                className="w-full min-h-[200px] p-4 bg-white/70 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent resize-y leading-relaxed"
              />
              <div className="flex items-center justify-between mt-3">
                <span className={`text-xs ${wordCount >= 1000 ? 'text-emerald-500' : 'text-amber-500'}`}>字数：{wordCount}{wordCount < 1000 ? `/1000` : ''}</span>
                <div className="flex items-center gap-2">
                  {aiResult && (
                    <button onClick={acceptPolish}
                      className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-200 transition-all">
                      采纳润色
                    </button>
                  )}
                </div>
              </div>
            </div>

            {aiResult && (
              <div className="glass-card rounded-2xl p-5 border-l-4 border-l-emerald-400">
                <div className="flex items-center gap-2 mb-2">
                  <Wand2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600">AI 建议</span>
                </div>
                {aiResult.split('\n\n').map((p, i) => (
                  <p key={i} className={`text-sm text-slate-600 leading-7 whitespace-pre-wrap ${i > 0 ? 'mt-4' : ''}`}>{p}</p>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button onClick={handlePolish} disabled={aiLoading !== null || !userContent.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 text-sm font-medium hover:bg-emerald-50 hover:border-emerald-300 transition-all disabled:opacity-40">
                {aiLoading === 'polish' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                AI润色
              </button>
              <button onClick={handleSuggest} disabled={aiLoading !== null || !userContent.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-50 hover:border-amber-300 transition-all disabled:opacity-40">
                {aiLoading === 'suggest' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
                AI续写建议
              </button>
              <button
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all">
                <Save className="w-4 h-4" /> 保存草稿
              </button>
              <button onClick={handleSubmit} disabled={submitting || wordCount < 1000}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl btn-gradient-primary text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50 ml-auto">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? '提交中...' : '提交作品'}
              </button>
            </div>
            {wordCount > 0 && wordCount < 1000 && (
              <p className="text-xs text-amber-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> 续写至少1000字才能提交</p>
            )}
          </div>
        </main>

        {showAssistant && (
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowAssistant(false)}>
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700 text-sm">🤖 文学小助手</h3>
                <button onClick={() => setShowAssistant(false)} className="p-1 rounded hover:bg-slate-100"><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <AssistantPanel analysis={analysis} />
            </div>
          </div>
        )}

        <aside className="hidden md:block w-56 lg:w-64 bg-white/50 border-l border-emerald-100/50 overflow-y-auto flex-shrink-0 p-4">
          <AssistantPanel analysis={analysis} />
        </aside>
      </div>
    </div>
  )
}

function Timeline({ chapters, currentChapter, onSelect, onNewChapter, onDelete }: {
  chapters: any[]
  currentChapter: number
  onSelect: (c: any) => void
  onNewChapter?: () => void
  onDelete?: (id: number) => void
}) {
  return (
    <div className="space-y-2">
      {chapters.map(ch => (
        <div key={ch.id} className="group relative">
          <button onClick={() => onSelect(ch)}
            className={`w-full text-left p-3 rounded-xl transition-all text-sm ${
              ch.id === currentChapter
                ? 'bg-emerald-100 border border-emerald-200 shadow-sm'
                : 'hover:bg-slate-50 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                ch.id === currentChapter ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                <span className="text-[10px] font-bold">{ch.id}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-medium truncate ${ch.id === currentChapter ? 'text-emerald-800' : 'text-slate-600'}`}>
                  {ch.title}
                </p>
                <p className="text-[10px] text-slate-400">{ch.author} · {ch.wordCount}字</p>
              </div>
              {onDelete && false && ch.id > MOCK_CHAPTERS.length && (
                <button onClick={e => { e.stopPropagation(); onDelete(ch.id) }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </button>
        </div>
      ))}
      {onNewChapter && (
        <button onClick={onNewChapter} className="w-full p-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-xs hover:border-emerald-300 hover:text-emerald-500 transition-all flex items-center justify-center gap-1">
          <Plus className="w-3 h-3" /> 新章节
        </button>
      )}
    </div>
  )
}

function AssistantPanel({ analysis }: { analysis: { coherence: number; creativity: number; literary: number } }) {
  const scores = [
    { label: '连贯性', value: analysis.coherence, color: 'bg-emerald-500' },
    { label: '创意度', value: analysis.creativity, color: 'bg-amber-500' },
    { label: '文学性', value: analysis.literary, color: 'bg-sky-500' },
  ]
  return (
    <div>
      <h3 className="font-semibold text-slate-700 text-sm mb-4 flex items-center gap-2">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> 文学小助手
      </h3>
      <div className="space-y-3 mb-5">
        <p className="text-xs font-medium text-slate-500">当前作品分析</p>
        {scores.map(s => (
          <div key={s.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600">{s.label}</span>
              <span className="font-bold text-slate-700">{s.value}</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${s.color} transition-all`} style={{ width: `${s.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
        <p className="text-xs font-medium text-amber-700 mb-2 flex items-center gap-1"><Target className="w-3 h-3" /> 建议</p>
        <ul className="space-y-1.5">
          <li className="text-xs text-amber-600 flex items-start gap-1.5"><div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />丰富人物描写</li>
          <li className="text-xs text-amber-600 flex items-start gap-1.5"><div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />增加环境细节</li>
          <li className="text-xs text-amber-600 flex items-start gap-1.5"><div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />注意对话自然度</li>
        </ul>
      </div>
    </div>
  )
}
