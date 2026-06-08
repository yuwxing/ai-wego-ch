import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronDown, ChevronRight, CheckCircle, XCircle, Sparkles, Target, RefreshCw, Loader2, Languages, FileText, Layers } from 'lucide-react'

const SUPABASE_URL = 'https://mzjmfyoemcsoqzoooiej.supabase.co/rest/v1/'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM'

interface LongSentence {
  sentence: string
  translation: string
  structure: string
  grammar_points: string[]
  breakdown: { part: string; detail: string }[]
}

interface DiscourseAnalysis {
  text_type: string
  structure: string
  main_idea: string
  key_transitions: { word: string; function: string }[]
  paragraph_flow: string[]
  author_attitude: string
}

interface Question {
  question: string
  options: string[]
  answer: string
  type: string
}

interface ReadingContent {
  date: string
  title_cn: string
  title_en: string
  source: string
  article: string
  translation: string
  long_sentences: LongSentence[]
  discourse_analysis: DiscourseAnalysis
  questions: Question[]
}

export default function ReadingIntensivePage() {
  const navigate = useNavigate()
  const [data, setData] = useState<ReadingContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTranslation, setShowTranslation] = useState(false)
  const [expandedSentences, setExpandedSentences] = useState<number[]>([])
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => { fetchContent() }, [])

  const fetchContent = async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await fetch(
        `${SUPABASE_URL}tasks?status=eq.reading_intensive&select=id,title,description&order=id.desc&limit=1`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' } }
      )
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const rows = await resp.json()
      if (rows.length > 0) {
        setData(JSON.parse(rows[0].description))
      } else {
        setError('暂无今日外刊内容')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const toggleSentence = (idx: number) => {
    setExpandedSentences(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  const handleAnswerSelect = (qIndex: number, optionLetter: string) => {
    if (submitted) return
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionLetter }))
  }

  const handleSubmitAnswers = () => {
    setSubmitted(true)
    let correct = 0
    if (data) {
      data.questions.forEach((q, i) => {
        if (selectedAnswers[i]?.[0] === q.answer) correct++
      })
    }
  }

  const handleRetry = () => {
    setSubmitted(false)
    setSelectedAnswers({})
  }

  const typeLabel = (type: string) => {
    const map: Record<string, string> = { main_idea: '主旨题', detail: '细节题', inference: '推断题', discourse: '语篇逻辑题' }
    return map[type] || type
  }

  const typeColor = (type: string) => {
    const map: Record<string, string> = { main_idea: 'bg-blue-100 text-blue-700', detail: 'bg-emerald-100 text-emerald-700', inference: 'bg-amber-100 text-amber-700', discourse: 'bg-purple-100 text-purple-700' }
    return map[type] || 'bg-slate-100 text-slate-600'
  }

  const correctCount = data ? data.questions.filter((q, i) => selectedAnswers[i]?.[0] === q.answer).length : 0

  if (loading) {
    return (
      <div className="page-wrapper min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
          <p className="text-sm text-slate-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-wrapper min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="glass-card rounded-2xl p-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">{error}</p>
            <button onClick={fetchContent} className="px-5 py-2.5 rounded-xl btn-gradient-primary text-sm font-bold">
              刷新
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100/50 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-500">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-slate-700">外刊精读</span>
        <span className="text-xs text-slate-400 ml-auto">{data?.source}</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-5">
          <div className="glass-card rounded-2xl p-5">
            <h1 className="text-lg font-bold text-slate-800 mb-1">{data?.title_cn}</h1>
            <p className="text-sm text-slate-500 italic mb-3">{data?.title_en}</p>
            <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
              <span>{data?.date}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{data?.source}</span>
            </div>

            <div className="bg-white/80 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500">正文</span>
                <button onClick={() => setShowTranslation(!showTranslation)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                  <Languages className="w-3 h-3" />
                  {showTranslation ? '隐藏翻译' : '显示翻译'}
                </button>
              </div>
              <p className="text-sm text-slate-700 leading-7 whitespace-pre-wrap">{data?.article}</p>
              {showTranslation && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-sm text-slate-500 leading-7 whitespace-pre-wrap">{data?.translation}</p>
                </div>
              )}
            </div>
          </div>

          {data?.long_sentences && data.long_sentences.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-semibold text-slate-700">长难句拆分</span>
                <span className="text-xs text-slate-400 ml-auto">{data.long_sentences.length} 句</span>
              </div>
              <div className="space-y-3">
                {data.long_sentences.map((ls, idx) => (
                  <div key={idx} className="bg-white/70 rounded-xl border border-slate-100 overflow-hidden">
                    <button onClick={() => toggleSentence(idx)}
                      className="w-full text-left p-3 flex items-start gap-2 hover:bg-slate-50/50 transition-colors">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{idx + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-700 leading-6 line-clamp-2">{ls.sentence}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{ls.translation}</p>
                      </div>
                      {expandedSentences.includes(idx) ? <ChevronDown className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" /> : <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />}
                    </button>
                    {expandedSentences.includes(idx) && (
                      <div className="px-3 pb-3 space-y-3">
                        <div className="bg-rose-50/50 rounded-lg p-3">
                          <p className="text-[11px] font-medium text-rose-600 mb-1">句子结构</p>
                          <p className="text-xs text-slate-600 leading-6">{ls.structure}</p>
                        </div>
                        {ls.grammar_points.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {ls.grammar_points.map((gp, gi) => (
                              <span key={gi} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">{gp}</span>
                            ))}
                          </div>
                        )}
                        {ls.breakdown.length > 0 && (
                          <div className="space-y-1.5">
                            {ls.breakdown.map((b, bi) => (
                              <div key={bi} className="flex items-start gap-2 text-xs">
                                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">{b.part}</span>
                                <span className="text-slate-600 leading-5">{b.detail}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data?.discourse_analysis && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-semibold text-slate-700">语篇分析</span>
                <span className="text-xs text-slate-400 ml-auto">{data.discourse_analysis.text_type}</span>
              </div>
              <div className="space-y-3">
                <div className="bg-purple-50/50 rounded-lg p-3">
                  <p className="text-[11px] font-medium text-purple-600 mb-1">主旨大意</p>
                  <p className="text-xs text-slate-600 leading-6">{data.discourse_analysis.main_idea}</p>
                </div>
                <div className="bg-purple-50/50 rounded-lg p-3">
                  <p className="text-[11px] font-medium text-purple-600 mb-1">文章结构</p>
                  <p className="text-xs text-slate-600 leading-6">{data.discourse_analysis.structure}</p>
                </div>
                {data.discourse_analysis.key_transitions.length > 0 && (
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 mb-2">关键衔接词</p>
                    <div className="flex flex-wrap gap-2">
                      {data.discourse_analysis.key_transitions.map((kt, ki) => (
                        <div key={ki} className="bg-white/80 rounded-lg px-3 py-1.5 border border-slate-100">
                          <span className="text-xs font-medium text-slate-700">{kt.word}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">— {kt.function}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {data.discourse_analysis.paragraph_flow.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-medium text-slate-500 mb-1">段落逻辑流</p>
                    {data.discourse_analysis.paragraph_flow.map((pf, pi) => (
                      <div key={pi} className="flex items-start gap-2 text-xs">
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0">{pi + 1}</span>
                        <span className="text-slate-600 leading-5">{pf}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="bg-purple-50/50 rounded-lg p-3">
                  <p className="text-[11px] font-medium text-purple-600 mb-1">作者态度</p>
                  <p className="text-xs text-slate-600 leading-6">{data.discourse_analysis.author_attitude}</p>
                </div>
              </div>
            </div>
          )}

          {data?.questions && data.questions.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-slate-700">阅读理解</span>
                {submitted && (
                  <span className={`text-xs font-medium ml-auto ${correctCount === data.questions.length ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {correctCount}/{data.questions.length} 正确
                  </span>
                )}
              </div>
              <div className="space-y-4">
                {data.questions.map((q, qi) => (
                  <div key={qi} className="bg-white/70 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-slate-400">{qi + 1}.</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColor(q.type)}`}>{typeLabel(q.type)}</span>
                      {submitted && (
                        selectedAnswers[qi]?.[0] === q.answer
                          ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 ml-auto" />
                          : <XCircle className="w-3.5 h-3.5 text-red-400 ml-auto" />
                      )}
                    </div>
                    <p className="text-xs text-slate-700 mb-2.5 leading-6">{q.question}</p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, oi) => {
                        const letter = String.fromCharCode(65 + oi)
                        const isSelected = selectedAnswers[qi]?.[0] === letter
                        const isCorrect = letter === q.answer
                        let btnStyle = 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                        if (submitted && isSelected && isCorrect) btnStyle = 'border-emerald-400 bg-emerald-50'
                        else if (submitted && isSelected && !isCorrect) btnStyle = 'border-red-300 bg-red-50'
                        else if (submitted && isCorrect) btnStyle = 'border-emerald-300 bg-emerald-50/50'
                        return (
                          <button key={oi} onClick={() => handleAnswerSelect(qi, letter)}
                            className={`w-full text-left px-3 py-2 rounded-lg border text-xs text-slate-600 transition-all ${btnStyle}`}>
                            <span className="font-medium text-slate-400 mr-2">{letter}.</span>
                            {opt.replace(/^[A-D]\.\s*/, '')}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                {!submitted ? (
                  <button onClick={handleSubmitAnswers}
                    disabled={Object.keys(selectedAnswers).length < data.questions.length}
                    className="w-full py-2.5 rounded-xl btn-gradient-primary text-sm font-bold disabled:opacity-50">
                    提交答案
                  </button>
                ) : (
                  <button onClick={handleRetry}
                    className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 flex items-center justify-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> 重新答题
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="text-center pb-6">
            <button onClick={fetchContent}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 transition-colors">
              <RefreshCw className="w-3 h-3" /> 刷新内容
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}