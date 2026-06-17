import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Play, Volume2, Home, ArrowLeft, Star, BookOpen, Beaker, Zap, Brain, Sparkles, ChevronRight } from 'lucide-react'
import { GRADE_VERBS, getStages, getGameMode, type StageData, type VerbEntry } from '../utils/irregularVerbsData'
import CardMatchGame from './games/CardMatchGame'
import TypingRaceGame from './games/TypingRaceGame'
import TypeStageGame from './games/TypeStageGame'
import { useUser } from '../contexts/UserContext'
import { supabaseFetch } from '../utils/supabase'

const GRADE_LABELS: Record<string, string> = { '七下': 'grade7-down', '八上': 'grade8-up', '八下': 'grade8-down' }
const GRADE_EMOJI: Record<string, string> = { '七下': '📘', '八上': '📗', '八下': '📕' }
const GRADES = ['七下', '八上', '八下']
const GRADES_EN = { '七下': 'Grade 7 Down', '八上': 'Grade 8 Up', '八下': 'Grade 8 Down' }

const STORAGE_KEY = 'irregular_verbs_progress'

interface GradeProgress {
  completed: number[]
  bestStars: Record<number, number>
  bestScore: Record<number, number>
}

function loadProgress(): Record<string, GradeProgress> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}

function saveProgress(data: Record<string, GradeProgress>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

async function saveProgressToServer(userId: number, data: Record<string, GradeProgress>) {
  try {
    const current = await supabaseFetch(`users?id=eq.${userId}&select=digital_avatar`)
    const avatar = current?.[0]?.digital_avatar || {}
    avatar.irregular_verbs_progress = data
    await supabaseFetch(`users?id=eq.${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ digital_avatar: avatar }),
    })
  } catch {}
}

async function loadProgressFromServer(userId: number): Promise<Record<string, GradeProgress> | null> {
  try {
    const data = await supabaseFetch(`users?id=eq.${userId}&select=digital_avatar`)
    return data?.[0]?.digital_avatar?.irregular_verbs_progress || null
  } catch { return null }
}

function speak(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'; u.rate = 0.9
    window.speechSynthesis.speak(u)
  }
}

export default function IrregularVerbsPage() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [grade, setGrade] = useState('七下')
  const [search, setSearch] = useState('')
  const [phase, setPhase] = useState<'table' | 'stages'>('table')
  const [currentStageIdx, setCurrentStageIdx] = useState(-1)
  const [progress, setProgress] = useState<Record<string, GradeProgress>>(loadProgress)

  // Load server progress on mount, merge with local
  useEffect(() => {
    const uid = user?.id
    if (!uid) return
    loadProgressFromServer(uid).then(serverData => {
      if (!serverData) return
      const local = loadProgress()
      const merged: Record<string, GradeProgress> = { ...local }
      for (const key of Object.keys(serverData)) {
        const s = serverData[key]
        const l = local[key]
        if (!l) {
          merged[key] = s
        } else {
          merged[key] = {
            completed: [...new Set([...l.completed, ...s.completed])],
            bestStars: { ...l.bestStars },
            bestScore: { ...l.bestScore },
          }
          for (const idxStr of Object.keys(s.bestStars)) {
            const idx = parseInt(idxStr)
            merged[key].bestStars[idx] = Math.max(merged[key].bestStars[idx] || 0, s.bestStars[idx])
          }
          for (const idxStr of Object.keys(s.bestScore)) {
            const idx = parseInt(idxStr)
            merged[key].bestScore[idx] = Math.max(merged[key].bestScore[idx] || 0, s.bestScore[idx])
          }
        }
      }
      setProgress(merged)
      saveProgress(merged)
    })
  }, [user?.id])

  const verbs = useMemo(() => {
    const list = GRADE_VERBS[grade] || []
    if (!search.trim()) return list
    const q = search.toLowerCase().trim()
    return list.filter(v =>
      v.base.toLowerCase().includes(q) ||
      v.past.toLowerCase().includes(q) ||
      v.pp.toLowerCase().includes(q) ||
      v.meaning.includes(q)
    )
  }, [grade, search])

  const stages = useMemo(() => getStages(grade), [grade])

  const handleStageComplete = (pct: number) => {
    const key = `${grade}_${currentStageIdx}`
    const updated = { ...progress }
    if (!updated[key]) updated[key] = { completed: [], bestStars: {}, bestScore: {} }
    if (!updated[key].completed.includes(currentStageIdx)) {
      updated[key].completed.push(currentStageIdx)
    }
    const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0
    updated[key].bestStars[currentStageIdx] = Math.max(updated[key].bestStars[currentStageIdx] || 0, stars)
    updated[key].bestScore[currentStageIdx] = Math.max(updated[key].bestScore[currentStageIdx] || 0, pct)
    setProgress(updated)
    saveProgress(updated)
    const uid = user?.id
    if (uid) saveProgressToServer(uid, updated)
  }

  // Game mode
  if (currentStageIdx >= 0) {
    const stage = stages[currentStageIdx]
    const isFinal = currentStageIdx === stages.length - 1
    const gameProps = {
      verbs: stage.verbs,
      stageName: stage.name,
      onComplete: handleStageComplete,
      onBack: () => setCurrentStageIdx(-1),
    }
    if (isFinal) {
      const shuffled = [...stage.verbs]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return <TypeStageGame {...gameProps} verbs={shuffled.slice(0, 20)} showPp={grade !== '七下'} timeLimit={600} />
    }
    const mode = getGameMode(grade)
    switch (mode) {
      case 'card': return <CardMatchGame {...gameProps} />
      case 'typing': return <TypingRaceGame {...gameProps} />
      case 'typeStage': return <TypeStageGame {...gameProps} />
    }
  }

  // Stage selection
  if (phase === 'stages') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setPhase('table')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="w-4 h-4" /> 返回动词表
            </button>
            <h2 className="text-xl font-bold text-gray-800">{GRADE_EMOJI[grade]} {grade} — 闯关练习</h2>
            <div />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {stages.map((s, i) => {
              const key = `${grade}_${i}`
              const p = progress[key]
              const completed = p?.completed.includes(i)
              const stars = p?.bestStars[i] || 0
              const prevUnlocked = i === 0 || progress[`${grade}_${i - 1}`]?.completed.includes(i - 1)
              const isFinal = i === stages.length - 1
              return (
                <button key={i} onClick={() => prevUnlocked && setCurrentStageIdx(i)}
                  disabled={!prevUnlocked}
                  className={`relative rounded-2xl p-4 text-center transition-all border-2 ${completed ? 'bg-amber-50 border-amber-300' : prevUnlocked ? 'bg-white border-gray-200 hover:border-teal-300 hover:shadow-md' : 'bg-gray-50 border-gray-100 opacity-40 cursor-not-allowed'}`}>
                  <div className="text-3xl mb-2">{completed ? '🏆' : prevUnlocked ? (isFinal ? '👑' : '📖') : '🔒'}</div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">{s.name}</h3>
                  <p className="text-xs text-gray-400">{s.verbs.length} 个动词</p>
                  {stars > 0 && <div className="mt-2 text-amber-400 text-sm">{'⭐'.repeat(stars)}</div>}
                  {completed && <p className="text-xs text-amber-600 mt-1">最高 {p?.bestScore[i]}分</p>}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Table view (default) ──
  const mode = getGameMode(grade)
  const modeLabels: Record<string, string> = { card: '配对记忆', typing: '时间竞赛', typeStage: '类型闯关' }
  const modeIcons: Record<string, any> = { card: Brain, typing: Zap, typeStage: Sparkles }
  const ModeIcon = modeIcons[mode]

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => navigate('/')}
              className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all">
              <Home className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center text-white text-lg">📘</div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-teal-600">AI-Wego</h1>
              <p className="text-[10px] text-gray-400 -mt-0.5">英语学习助手</p>
            </div>
          </div>
          <h2 className="hidden md:block text-lg font-semibold text-gray-800 tracking-wider">不规则动词</h2>
          <div className="relative flex-1 max-w-xs">
            <input type="text" placeholder="搜索（如 go, eat...）"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-teal-400 focus:bg-white outline-none text-sm" />
            <Search className="absolute right-4 top-3.5 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </header>

      {/* Grade Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-4">
        <div className="flex gap-3 bg-white rounded-2xl p-2 shadow-sm w-fit">
          {GRADES.map(g => (
            <button key={g} onClick={() => { setGrade(g); setSearch('') }}
              className={`px-6 sm:px-10 py-3 rounded-xl font-semibold text-base transition-all ${grade === g ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'text-gray-600 hover:bg-gray-100'}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-6">
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-3xl border border-teal-100 p-6 sm:p-10 flex items-center gap-8">
          <div className="flex-1">
            <p className="text-teal-600 font-medium text-sm mb-2">{GRADES_EN[grade]} · 人教版同步</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight mb-4">
              {GRADE_EMOJI[grade]} {grade} — {GRADE_VERBS[grade]?.length || 0} 个不规则动词
            </h3>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPhase('stages')}
                className="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white text-lg font-semibold rounded-2xl transition-all hover:shadow-xl flex items-center gap-3">
                <Play className="w-5 h-5" /> 开始练习
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-xl text-sm text-gray-500">
                <ModeIcon className="w-4 h-4 text-teal-500" /> {modeLabels[mode]}
              </div>
            </div>
          </div>
          <div className="hidden lg:block w-64 shrink-0">
            <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80"
              alt="学习" className="rounded-2xl shadow-lg" />
          </div>
        </div>
      </div>

      {/* Verb Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-12">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {verbs.length === 0 ? (
            <div className="p-12 text-center text-gray-400">没有找到匹配的动词</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-4 px-4 sm:px-6 font-semibold text-gray-500 w-[22%]">原形 Base</th>
                    <th className="text-left py-4 px-2 sm:px-4 font-semibold text-gray-500 w-[22%]">过去式 Past</th>
                    <th className="text-left py-4 px-2 sm:px-4 font-semibold text-gray-500 w-[24%]">过去分词 P.P.</th>
                    <th className="text-left py-4 px-2 sm:px-4 font-semibold text-gray-500">中文意思</th>
                    <th className="py-4 px-2 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {verbs.map((v, i) => (
                    <tr key={i} className="hover:bg-teal-50/50 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-gray-800">{v.base}</td>
                      <td className="py-3.5 px-2 sm:px-4 text-gray-700">{v.past}</td>
                      <td className="py-3.5 px-2 sm:px-4 text-gray-700">{v.pp}</td>
                      <td className="py-3.5 px-2 sm:px-4 text-teal-700">{v.meaning}</td>
                      <td className="py-3.5 px-2">
                        <button onClick={() => speak(v.base)}
                          className="w-8 h-8 rounded-lg bg-teal-50 text-teal-500 hover:bg-teal-100 flex items-center justify-center transition-all">
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          共 {verbs.length} 个动词，{GRADE_VERBS[grade]?.length || 0} 个总计
          {search ? `（搜索"${search}"）` : ''}
        </p>
      </div>
    </div>
  )
}
