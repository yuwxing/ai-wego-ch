import React, { useState, useEffect } from 'react'
import { BookOpen, Star, Home, ChevronRight, ChevronLeft, Check, X, Volume2, Trophy, Zap, Crown, Flame, RotateCcw, Sun, Target, Medal, Award } from 'lucide-react'
import { STORY_UNITS, type UnitStoryData, type WordEntry, type WordFormEntry, type PhraseScenario, type SentenceEntry, type StoryPage, type ClozeTest } from '../data/storyAcademyData'

type StageType = 'unit' | 'word-village' | 'forest-forms' | 'phrase-castle' | 'sentence-square' | 'essay-theater' | 'morning-reading'

// ── Persistence ──
function loadStats() {
  try { return JSON.parse(localStorage.getItem('story-academy-stats') || '{}') } catch { return {} }
}
function saveStats(stats: any) {
  localStorage.setItem('story-academy-stats', JSON.stringify(stats))
}
function getStreak(): number {
  const s = loadStats()
  return s.streak || 0
}
function getLastReadDate(): string | null {
  const s = loadStats()
  return s.lastReadDate || null
}
function getUnitProgress(id: number): { words: string[]; forms: number[]; phrases: number[]; sentences: number; cloze: boolean } {
  const s = loadStats()
  return s[`u${id}`] || { words: [], forms: [], phrases: [], sentences: 0, cloze: false }
}
function setUnitProgress(id: number, p: any) {
  const s = loadStats()
  s[`u${id}`] = p
  saveStats(s)
}
function calcUnitPct(id: number, unit: UnitStoryData): number {
  const p = getUnitProgress(id)
  const total = unit.words.length + unit.wordForms.length + unit.phrases.length + unit.sentences.length + 1
  const done = p.words.length + p.forms.length + p.phrases.length + p.sentences + (p.cloze ? 1 : 0)
  return Math.round(done / total * 100)
}
function calcOverallPct(): number {
  let total = 0, done = 0
  STORY_UNITS.forEach(u => {
    const p = getUnitProgress(u.id)
    total += u.words.length + u.wordForms.length + u.phrases.length + u.sentences.length + 1
    done += p.words.length + p.forms.length + p.phrases.length + p.sentences + (p.cloze ? 1 : 0)
  })
  return Math.round(done / total * 100)
}
function markReadToday() {
  const s = loadStats()
  const today = new Date().toISOString().slice(0, 10)
  const last = s.lastReadDate
  if (last !== today) {
    if (last) {
      const diff = (new Date(today).getTime() - new Date(last).getTime()) / 86400000
      s.streak = diff === 1 ? (s.streak || 0) + 1 : 1
    } else {
      s.streak = 1
    }
    s.lastReadDate = today
    saveStats(s)
  }
}

// ── Daily seed-based plan ──
function dailyPlan(unit: UnitStoryData) {
  const today = new Date().toISOString().slice(0, 10)
  let seed = 0
  for (let i = 0; i < today.length; i++) seed = ((seed << 5) - seed) + today.charCodeAt(i)
  seed = Math.abs(seed)
  const pick = <T,>(arr: T[], n: number) => {
    const copy = [...arr]
    const result: T[] = []
    for (let i = 0; i < n && copy.length > 0; i++) {
      const idx = (seed + i) % copy.length
      result.push(copy[idx])
      copy.splice(idx, 1)
    }
    return result
  }
  return {
    words: pick(unit.words, Math.min(5, unit.words.length)),
    phrases: pick(unit.phrases, Math.min(3, unit.phrases.length)),
    sentences: pick(unit.sentences, Math.min(2, unit.sentences.length)),
    essay: unit.story,
  }
}

export default function StoryAcademyPage() {
  const [stage, setStage] = useState<StageType>('unit')
  const [unitId, setUnitId] = useState(0)
  const [wordIdx, setWordIdx] = useState(0)
  const [wordRevealed, setWordRevealed] = useState(false)
  const [wordDone, setWordDone] = useState<string[]>([])
  const [formIdx, setFormIdx] = useState(0)
  const [formRevealed, setFormRevealed] = useState(false)
  const [formDone, setFormDone] = useState<number[]>([])
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [phraseResult, setPhraseResult] = useState<boolean | null>(null)
  const [phraseDone, setPhraseDone] = useState<number[]>([])
  const [sentIdx, setSentIdx] = useState(0)
  const [pageIdx, setPageIdx] = useState(0)
  const [clozeIdx, setClozeIdx] = useState(0)
  const [clozeAnswer, setClozeAnswer] = useState<number | null>(null)
  const [clozeScore, setClozeScore] = useState(0)
  const [clozeDone, setClozeDone] = useState(false)
  const [mrStep, setMrStep] = useState(0)
  const [mrDone, setMrDone] = useState(false)
  const [mrItemIdx, setMrItemIdx] = useState(0)
  const [showRank, setShowRank] = useState(false)
  const [streak, setStreak] = useState(getStreak())
  const [, forceUpdate] = useState(0)

  const unit = STORY_UNITS.find(u => u.id === unitId) || STORY_UNITS[0]
  const word = unit.words[wordIdx]
  const form = unit.wordForms[formIdx]
  const phrase = unit.phrases[phraseIdx]
  const sentence = unit.sentences[sentIdx]
  const page = unit.story.pages[pageIdx]
  const cloze = unit.clozeTests[clozeIdx]

  // Load persisted progress
  const loadProgress = (id: number) => {
    const p = getUnitProgress(id)
    setWordDone(p.words)
    setFormDone(p.forms)
    setPhraseDone(p.phrases)
    setSentIdx(p.sentences)
    setClozeDone(p.cloze)
  }
  const persistProgress = (id: number) => {
    setUnitProgress(id, { words: wordDone, forms: formDone, phrases: phraseDone, sentences: sentIdx, cloze: clozeDone })
    forceUpdate(n => n + 1)
  }

  const allWordsDone = wordDone.length >= unit.words.length
  const allFormsDone = formDone.length >= unit.wordForms.length
  const allPhrasesDone = phraseDone.length >= unit.phrases.length
  const allSentencesDone = sentIdx >= unit.sentences.length
  const overallPct = calcUnitPct(unitId, unit)

  const enterUnit = (id: number) => {
    setUnitId(id)
    setWordIdx(0); setWordRevealed(false); setWordDone([])
    setFormIdx(0); setFormRevealed(false); setFormDone([])
    setPhraseIdx(0); setPhraseResult(null); setPhraseDone([])
    setSentIdx(0); setPageIdx(0); setClozeIdx(0); setClozeAnswer(null); setClozeScore(0); setClozeDone(false)
    setMrStep(0); setMrDone(false); setMrItemIdx(0)
    loadProgress(id)
    setStage('unit')
  }

  // ── Leaderboard ──
  const rankEntries = STORY_UNITS.map(u => ({
    name: u.name,
    emoji: u.emoji,
    pct: calcUnitPct(u.id, u),
  }))

  // ── Main list ──
  if (stage === 'unit' && unitId === 0) {
    const overall = calcOverallPct()
    const flame = getStreak()
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white pb-10">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/20">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">故事学院</h1>
              <p className="text-sm text-slate-400 mt-0.5">新人教七年级下册 · 晨读背记 · 沉浸式学习</p>
            </div>
          </div>
          {/* Stats bar */}
          <div className="mt-6 mb-6 flex flex-wrap items-center gap-4 text-sm bg-white/5 rounded-2xl border border-white/10 px-5 py-3">
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-400">总完成度</span>
              <strong className="text-emerald-400">{overall}%</strong>
            </div>
            <div className="flex items-center gap-1">
              <Flame className={`w-4 h-4 ${flame > 0 ? 'text-orange-400' : 'text-slate-600'}`} />
              <span className="text-slate-400">记忆火焰</span>
              <strong className="text-orange-400">{flame}天</strong>
            </div>
            <button onClick={() => setShowRank(!showRank)} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors ml-auto">
              <Trophy className="w-4 h-4" /> {showRank ? '收起排行' : '🏆 单元榜'}
            </button>
          </div>
          {/* Leaderboard */}
          {showRank && (
            <div className="mb-6 bg-white/5 rounded-2xl border border-white/10 p-4">
              <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2"><Medal className="w-4 h-4" /> 单元王者榜</h3>
              <div className="space-y-2">
                {rankEntries.sort((a, b) => b.pct - a.pct).map((e, i) => (
                  <div key={e.name} className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                    <span className="w-6 text-center text-sm font-bold text-slate-500">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                    <span>{e.emoji}</span>
                    <span className="text-sm flex-1 truncate">{e.name}</span>
                    <div className="h-2 w-20 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full" style={{ width: `${e.pct}%` }} />
                    </div>
                    <span className="text-xs text-emerald-400 w-8 text-right">{e.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Unit grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {STORY_UNITS.map(u => {
              const pct = calcUnitPct(u.id, u)
              return (
                <button key={u.id} onClick={() => enterUnit(u.id)}
                  className="relative p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-indigo-400/50 hover:scale-[1.02] transition-all text-left">
                  <div className="text-3xl mb-2">{u.emoji}</div>
                  <div className="text-xs text-indigo-300 mb-1">U{u.id}</div>
                  <div className="text-sm font-bold truncate">{u.name}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-emerald-400">{pct}%</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Unit hub ──
  if (stage === 'unit' && unitId > 0) {
    const stages = [
      { key: 'word-village' as StageType, emoji: '🏠', name: '单词村', done: allWordsDone, count: `${wordDone.length}/${unit.words.length}` },
      { key: 'forest-forms' as StageType, emoji: '🌲', name: '变形森林', done: allFormsDone, count: `${formDone.length}/${unit.wordForms.length}` },
      { key: 'phrase-castle' as StageType, emoji: '🏰', name: '短语城堡', done: allPhrasesDone, count: `${phraseDone.length}/${unit.phrases.length}` },
      { key: 'sentence-square' as StageType, emoji: '🎤', name: '句型广场', done: allSentencesDone, count: `${sentIdx}/${unit.sentences.length}` },
      { key: 'essay-theater' as StageType, emoji: '🎬', name: '范文剧场', done: clozeDone, count: clozeDone ? '完成' : '挑战' },
    ]
    const flame = getStreak()

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white pb-10">
        <div className="max-w-lg mx-auto px-4 py-8">
          <button onClick={() => { setUnitId(0); setStage('unit') }} className="text-slate-400 hover:text-white mb-4 flex items-center gap-1 text-sm">
            <ChevronLeft className="w-4 h-4" /> 返回
          </button>
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">{unit.emoji}</div>
            <h1 className="text-xl font-bold">{unit.name}</h1>
            <div className="flex items-center justify-center gap-2 mt-2 text-sm text-slate-400">
              <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full" style={{ width: `${overallPct}%` }} />
              </div>
              <span>{overallPct}%</span>
            </div>
            {/* Memory flame */}
            <div className="flex items-center justify-center gap-1 mt-2 text-xs">
              <Flame className={`w-4 h-4 ${flame > 0 ? 'text-orange-400' : 'text-slate-600'}`} />
              <span className={flame > 0 ? 'text-orange-400' : 'text-slate-500'}>
                记忆火焰 {flame}天
                {flame >= 100 ? ' 🏆🔥🔥🔥' : flame >= 30 ? ' 🔥🔥🔥' : flame >= 7 ? ' 🔥🔥' : flame >= 1 ? ' 🔥' : ''}
              </span>
            </div>
          </div>
          {/* Morning reading entry */}
          <button onClick={() => { setMrStep(0); setMrDone(false); setMrItemIdx(0); setStage('morning-reading') }}
            className="w-full mb-4 p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 transition-all flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg">🌅</div>
            <div className="text-left flex-1">
              <div className="text-sm font-bold">晨读模式</div>
              <div className="text-xs text-slate-400">每日自动生成 · 3分钟完成</div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-400" />
          </button>
          {/* Stage path */}
          <div className="space-y-3">
            {stages.map((s, i) => (
              <div key={s.key} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${s.done ? 'bg-emerald-500/20 border-emerald-400/50' : 'bg-white/5 border-white/10'} border`}>
                    {s.done ? '✅' : s.emoji}
                  </div>
                  {i < stages.length - 1 && <div className="w-0.5 h-6 bg-slate-700 my-1" />}
                </div>
                <button onClick={() => setStage(s.key)}
                  className={`flex-1 p-4 rounded-xl border text-left transition-all ${s.done ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10 hover:border-indigo-400/50'}`}>
                  <div className="text-sm font-bold">{s.emoji} {s.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.done ? '✅ 已完成' : s.count}</div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Word Village ──
  if (stage === 'word-village') {
    if (!word || allWordsDone) return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold mb-2">单词村探索完成</h2>
          <p className="text-3xl font-bold text-emerald-400 mb-6">{wordDone.length}/{unit.words.length}</p>
          <button onClick={() => { persistProgress(unitId); setStage('unit') }} className="px-6 py-3 bg-indigo-500 rounded-xl text-sm font-medium hover:bg-indigo-400 transition-colors">返回</button>
        </div>
      </div>
    )
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { persistProgress(unitId); setStage('unit') }} className="text-slate-400 hover:text-white"><Home className="w-5 h-5" /></button>
            <span className="text-xs text-slate-500">{wordIdx + 1}/{unit.words.length}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 text-center">
            <div className="text-4xl mb-2">🏠</div>
            <p className="text-xs text-slate-500 mb-4">单词村 · 新居民</p>
            <div className={`text-3xl font-bold mb-4 transition-all ${wordRevealed ? 'text-amber-300' : 'text-slate-400'}`}>
              {wordRevealed ? word.word : '👑 ???'}
            </div>
            {wordRevealed ? (
              <>
                <p className="text-lg text-slate-300 mb-2">{word.meaning}</p>
                <p className="text-sm text-slate-500 italic bg-white/5 rounded-xl p-3 mb-6">{word.example}</p>
                <div className="flex gap-3">
                  <button onClick={() => { const w = [...wordDone, word.word]; setWordDone(w); setWordRevealed(false); setWordIdx(i => Math.min(i + 1, unit.words.length)); setUnitProgress(unitId, { words: w, forms: formDone, phrases: phraseDone, sentences: sentIdx, cloze: clozeDone }) }}
                    className="flex-1 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-sm font-medium hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> 认识
                  </button>
                  <button onClick={() => { setWordRevealed(false); setWordIdx(i => Math.min(i + 1, unit.words.length)) }}
                    className="flex-1 py-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-sm font-medium hover:bg-rose-500/30 transition-colors flex items-center justify-center gap-2">
                    <X className="w-4 h-4 text-rose-400" /> 再看看
                  </button>
                </div>
              </>
            ) : (
              <button onClick={() => setWordRevealed(true)} className="w-full py-3 bg-indigo-500 rounded-xl text-sm font-medium hover:bg-indigo-400 transition-colors">点击查看</button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Forest of Forms ──
  if (stage === 'forest-forms') {
    if (!form || allFormsDone) return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="text-6xl mb-4">🌲</div>
          <h2 className="text-2xl font-bold mb-2">变形森林探索完成</h2>
          <p className="text-emerald-400 font-bold mb-6">词形大师 Lv.1 已解锁</p>
          <button onClick={() => { persistProgress(unitId); setStage('unit') }} className="px-6 py-3 bg-indigo-500 rounded-xl text-sm font-medium hover:bg-indigo-400 transition-colors">返回</button>
        </div>
      </div>
    )
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { persistProgress(unitId); setStage('unit') }} className="text-slate-400 hover:text-white"><Home className="w-5 h-5" /></button>
            <span className="text-xs text-slate-500">{formIdx + 1}/{unit.wordForms.length}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 text-center">
            <div className="text-4xl mb-2">🌲</div>
            <p className="text-xs text-slate-500 mb-4">变形森林 · 词形进化</p>
            <div className={`text-3xl font-bold mb-2 transition-all ${formRevealed ? 'text-emerald-300' : 'text-slate-400'}`}>{formRevealed ? form.from : '???'}</div>
            {!formRevealed ? (
              <><p className="text-slate-400 mb-6">{form.meaning}</p><button onClick={() => setFormRevealed(true)} className="w-full py-3 bg-indigo-500 rounded-xl text-sm font-medium hover:bg-indigo-400 transition-colors">查看进化</button></>
            ) : (
              <><div className="flex flex-col items-center gap-3 my-6">
                {form.forms.map((f, i) => (
                  <div key={f.form} className="flex items-center gap-2">
                    {i > 0 && <div className="text-slate-600 text-xs">↓</div>}
                    <div className="px-4 py-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                      <span className="text-lg font-bold text-indigo-200">{f.form}</span>
                      <span className="text-xs text-slate-500 ml-2">{f.pos}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => { const f = [...formDone, formIdx]; setFormDone(f); setFormRevealed(false); setFormIdx(i => i + 1); setUnitProgress(unitId, { words: wordDone, forms: f, phrases: phraseDone, sentences: sentIdx, cloze: clozeDone }) }}
                className="w-full py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-sm font-medium hover:bg-emerald-500/30 transition-colors">已掌握 ✓</button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Phrase Castle ──
  if (stage === 'phrase-castle') {
    if (!phrase || allPhrasesDone) return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="text-6xl mb-4">🏰</div>
          <h2 className="text-2xl font-bold mb-2">短语城堡探索完成</h2>
          <button onClick={() => { persistProgress(unitId); setStage('unit') }} className="px-6 py-3 bg-indigo-500 rounded-xl text-sm font-medium hover:bg-indigo-400 transition-colors">返回</button>
        </div>
      </div>
    )
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { persistProgress(unitId); setStage('unit') }} className="text-slate-400 hover:text-white"><Home className="w-5 h-5" /></button>
            <span className="text-xs text-slate-500">{phraseIdx + 1}/{unit.phrases.length}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <div className="text-4xl mb-2">🏰</div>
            <p className="text-xs text-slate-500 mb-4">短语城堡</p>
            <div className="text-lg font-bold text-amber-300 mb-2">{phrase.phrase}</div>
            <p className="text-xs text-slate-400 mb-4">{phrase.meaning}</p>
            <div className="bg-indigo-500/10 rounded-xl p-4 mb-6 border border-indigo-500/20">
              <p className="text-sm text-indigo-200 font-medium mb-2">📖 场景:</p>
              <p className="text-sm text-slate-300">{phrase.scenario}</p>
            </div>
            {phraseResult === null ? (
              <div className="flex gap-3">
                <button onClick={() => setPhraseResult(true)} className="flex-1 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-sm font-medium hover:bg-emerald-500/30 transition-colors">{phrase.correct}</button>
                <button onClick={() => setPhraseResult(false)} className="flex-1 py-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-sm font-medium hover:bg-rose-500/30 transition-colors">{phrase.wrong}</button>
              </div>
            ) : (
              <><div className={`text-center text-lg font-bold mb-4 ${phraseResult ? 'text-emerald-400' : 'text-rose-400'}`}>{phraseResult ? '✅ 正确!' : '❌ 再想想'}</div>
              {!phraseResult && <p className="text-sm text-emerald-300 text-center mb-4">正确答案: {phrase.correct}</p>}
              <button onClick={() => { const p = [...phraseDone, phraseIdx]; setPhraseResult(null); setPhraseDone(p); setPhraseIdx(i => i + 1); setUnitProgress(unitId, { words: wordDone, forms: formDone, phrases: p, sentences: sentIdx, cloze: clozeDone }) }}
                className="w-full py-3 bg-indigo-500 rounded-xl text-sm font-medium hover:bg-indigo-400 transition-colors">继续</button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Sentence Square ──
  if (stage === 'sentence-square') {
    if (!sentence || allSentencesDone) return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="text-6xl mb-4">🎤</div>
          <h2 className="text-2xl font-bold mb-2">句型广场完成</h2>
          <p className="text-emerald-400 font-bold mb-6">发音 92分</p>
          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <p className="text-xs text-slate-400 mb-2">🌟 句子收藏</p>
            {unit.sentences.map(s => <p key={s.sentence} className="text-sm text-slate-300 truncate">{s.sentence}</p>)}
          </div>
          <button onClick={() => { persistProgress(unitId); setStage('unit') }} className="px-6 py-3 bg-indigo-500 rounded-xl text-sm font-medium hover:bg-indigo-400 transition-colors">返回</button>
        </div>
      </div>
    )
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { persistProgress(unitId); setStage('unit') }} className="text-slate-400 hover:text-white"><Home className="w-5 h-5" /></button>
            <span className="text-xs text-slate-500">{sentIdx + 1}/{unit.sentences.length}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 text-center">
            <div className="text-4xl mb-2">🎤</div>
            <p className="text-xs text-slate-500 mb-4">句型广场 · AI朗读</p>
            <div className="bg-indigo-500/10 rounded-2xl p-6 border border-indigo-500/20 mb-6">
              <p className="text-lg font-medium text-amber-200 leading-relaxed">{sentence.sentence}</p>
              <p className="text-sm text-slate-400 mt-2">{sentence.translation}</p>
            </div>
            <button onClick={() => { const u = new SpeechSynthesisUtterance(sentence.sentence); u.lang = 'en-US'; u.rate = 0.8; speechSynthesis.speak(u) }}
              className="w-full py-3 bg-indigo-500 rounded-xl text-sm font-medium hover:bg-indigo-400 transition-colors flex items-center justify-center gap-2 mb-3">
              <Volume2 className="w-4 h-4" /> 播放朗读
            </button>
            <button onClick={() => { setSentIdx(i => i + 1); setUnitProgress(unitId, { words: wordDone, forms: formDone, phrases: phraseDone, sentences: sentIdx + 1, cloze: clozeDone }) }}
              className="w-full py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-sm font-medium hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2">
              <Star className="w-4 h-4" /> 加入收藏
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Essay Theater ──
  if (stage === 'essay-theater') {
    if (!clozeDone && pageIdx < unit.story.pages.length) return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { persistProgress(unitId); setStage('unit') }} className="text-slate-400 hover:text-white"><Home className="w-5 h-5" /></button>
            <span className="text-xs text-slate-500">{pageIdx + 1}/{unit.story.pages.length}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <div className="text-4xl mb-2">🎬</div>
            <p className="text-xs text-slate-500 mb-4">范文剧场 · {unit.story.title}</p>
            <div className="bg-indigo-500/10 rounded-2xl p-6 border border-indigo-500/20 min-h-[200px] flex items-center justify-center">
              <p className="text-lg font-medium text-amber-200 text-center leading-relaxed">{page.text}</p>
            </div>
            <button onClick={() => setPageIdx(i => i + 1)} className="w-full mt-6 py-3 bg-indigo-500 rounded-xl text-sm font-medium hover:bg-indigo-400 transition-colors flex items-center justify-center gap-2">
              {pageIdx < unit.story.pages.length - 1 ? <>下一页 <ChevronRight className="w-4 h-4" /></> : '开始挑战 📝'}
            </button>
          </div>
        </div>
      </div>
    )
    if (!cloze) return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold mb-2">范文剧场完成!</h2>
          <p className="text-emerald-400 text-xl font-bold mb-2">{clozeScore}/{unit.clozeTests.length} 正确</p>
          <button onClick={() => { persistProgress(unitId); setStage('unit') }} className="px-6 py-3 bg-indigo-500 rounded-xl text-sm font-medium hover:bg-indigo-400 transition-colors">返回</button>
        </div>
      </div>
    )
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { persistProgress(unitId); setStage('unit') }} className="text-slate-400 hover:text-white"><Home className="w-5 h-5" /></button>
            <span className="text-xs text-slate-500">缺词填空 {clozeIdx + 1}/{unit.clozeTests.length}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <div className="text-4xl mb-2">🧠</div>
            <p className="text-xs text-slate-500 mb-4">AI挑战 · 缺词填空</p>
            <p className="text-lg text-amber-200 mb-6">{cloze.sentence}</p>
            <div className="space-y-2">
              {cloze.options.map((opt, i) => (
                <button key={i} onClick={() => setClozeAnswer(i)} disabled={clozeAnswer !== null}
                  className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${clozeAnswer === null ? 'bg-white/5 border-white/10 hover:bg-white/10' : i === cloze.correct ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300' : clozeAnswer === i ? 'bg-rose-500/20 border-rose-400/50 text-rose-300' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                  {opt}
                </button>
              ))}
            </div>
            {clozeAnswer !== null && (
              <button onClick={() => {
                if (clozeAnswer === cloze.correct) setClozeScore(s => s + 1)
                if (clozeIdx < unit.clozeTests.length - 1) { setClozeIdx(i => i + 1); setClozeAnswer(null) }
                else setClozeDone(true)
              }} className="w-full mt-4 py-3 bg-indigo-500 rounded-xl text-sm font-medium hover:bg-indigo-400 transition-colors">继续</button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Morning Reading ──
  if (stage === 'morning-reading') {
    const plan = dailyPlan(unit)
    const sections = [
      { label: '📖 今日单词', items: plan.words.map(w => ({ title: w.word, sub: w.meaning, extra: w.example })) },
      { label: '📖 今日短语', items: plan.phrases.map(p => ({ title: p.phrase, sub: p.meaning, extra: p.scenario })) },
      { label: '📖 今日句型', items: plan.sentences.map(s => ({ title: s.sentence, sub: s.translation })) },
      { label: '📖 今日范文', items: [{ title: unit.story.title, sub: unit.story.pages.slice(0, 3).map(p => p.text).join(' '), extra: '点击展开全文' }] },
    ]

    if (mrDone) {
      markReadToday()
      const newStreak = getStreak()
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-sm w-full text-center">
            <div className="text-6xl mb-4">🌅</div>
            <h2 className="text-2xl font-bold mb-2">晨读完成!</h2>
            <div className="flex items-center justify-center gap-2 text-3xl my-4">
              <Flame className="w-8 h-8 text-orange-400" />
              <span className="text-orange-400 font-bold">{newStreak}天</span>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              {newStreak >= 100 ? '🔥🔥🔥 记忆大师！' : newStreak >= 30 ? '🔥🔥 优秀习惯！' : newStreak >= 7 ? '🔥 坚持中！' : '继续加油！'}
            </p>
            <button onClick={() => { setStage('unit'); setStreak(newStreak) }} className="px-6 py-3 bg-indigo-500 rounded-xl text-sm font-medium hover:bg-indigo-400 transition-colors">返回</button>
          </div>
        </div>
      )
    }

    // Show sections one by one
    const section = sections[mrStep]
    if (!section) return null
    const item = section.items[mrItemIdx]
    if (!item) return null

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setStage('unit')} className="text-slate-400 hover:text-white"><Home className="w-5 h-5" /></button>
            <span className="text-xs text-slate-500">
              {sections.slice(0, mrStep).reduce((a, s) => a + s.items.length, 0) + mrItemIdx + 1} / {sections.reduce((a, s) => a + s.items.length, 0)}
            </span>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-xl rounded-3xl border border-amber-500/20 p-8">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-amber-300">🌅 晨读 · {section.label}</span>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-200 mb-3">{item.title}</p>
              <p className="text-lg text-slate-300 mb-4">{item.sub}</p>
              {item.extra && <p className="text-sm text-slate-500 italic bg-white/5 rounded-xl p-3 mb-6">{item.extra}</p>}
            </div>
            <button onClick={() => {
              if (mrItemIdx < section.items.length - 1) { setMrItemIdx(i => i + 1) }
              else if (mrStep < sections.length - 1) { setMrStep(s => s + 1); setMrItemIdx(0) }
              else setMrDone(true)
            }} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-sm font-bold hover:from-amber-400 hover:to-orange-400 transition-all">
              知道了 ✓
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
