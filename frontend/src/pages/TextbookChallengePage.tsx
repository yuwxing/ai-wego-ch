import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { BookOpen, Star, Shield, Medal, Trophy, Zap, Home, RotateCcw, ChevronRight, Crown, Swords, ChevronDown, ChevronUp } from 'lucide-react'
import { ROUNDS, type ChallengeRound, type ChallengeQuestion, loadProgress, saveProgress } from '../data/textbookData'
import { ROUNDS_8 } from '../data/textbookData8'
import { UNIT_REFERENCES, type UnitReference } from '../data/textbookReference'

type Phase = 'select' | 'playing' | 'result' | 'roundComplete'

export default function TextbookChallengePage() {
  const [phase, setPhase] = useState<Phase>('select')
  const [refOpen, setRefOpen] = useState(false)
  const [refUnit, setRefUnit] = useState<number | null>(null)
  const [selectedRound, setSelectedRound] = useState<ChallengeRound | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [roundResults, setRoundResults] = useState<{ correct: boolean; points: number }[]>([])
  const [showResult, setShowResult] = useState(false)
  const [earnedStars, setEarnedStars] = useState(0)
  const [xpGained, setXpGained] = useState(0)
  const [progress, setProgress] = useState(loadProgress())

  const ALL_ROUNDS = useMemo(() => [...ROUNDS, ...ROUNDS_8], [])

  const question = selectedRound?.questions[currentQ]

  useEffect(() => { setProgress(loadProgress()) }, [])

  const startRound = useCallback((round: ChallengeRound) => {
    setSelectedRound(round)
    setCurrentQ(0)
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setAnswered(false)
    setSelectedAnswer(null)
    setRoundResults([])
    setShowResult(false)
    setPhase('playing')
  }, [])

  const handleAnswer = useCallback((idx: number) => {
    if (answered || !question) return
    setAnswered(true)
    setSelectedAnswer(idx)

    const correct = idx === question.correct
    if (correct) {
      const streakBonus = Math.min(streak, 5)
      const points = question.points + streakBonus * 2
      setScore(s => s + points)
      setStreak(s => s + 1)
      setBestStreak(s => Math.max(s, streak + 1))
      setRoundResults(r => [...r, { correct: true, points }])
    } else {
      setStreak(0)
      setRoundResults(r => [...r, { correct: false, points: 0 }])
    }

    setTimeout(() => {
      if (currentQ < (selectedRound?.questions.length ?? 1) - 1) {
        setCurrentQ(q => q + 1)
        setAnswered(false)
        setSelectedAnswer(null)
      } else {
        const totalScore = correct ? score + question.points + Math.min(streak, 5) * 2 : score
        setScore(totalScore)
        setShowResult(true)
      }
    }, correct ? 1200 : 2000)
  }, [answered, question, currentQ, selectedRound, score, streak])

  useEffect(() => {
    if (!showResult || !selectedRound) return
    const total = selectedRound.questions.length * 10
    const stars = saveProgress(selectedRound.id, score, total)
    setEarnedStars(stars)
    setXpGained(score * 2)
    const t = setTimeout(() => setPhase('roundComplete'), 300)
    return () => clearTimeout(t)
  }, [showResult])

  const defeatPercent = useMemo(() => {
    const maxScore = (selectedRound?.questions.length ?? 1) * 15
    const simulatedDefeat = Math.min(99, Math.max(1, Math.round((score - 50) * 1.2 + 50)))
    return Math.min(99, Math.max(1, simulatedDefeat))
  }, [score, selectedRound])

  // ── Selection screen ──
  if (phase === 'select') {
    const completedCount = progress.completed.length
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white pb-10">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/20">
              <Swords className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">课本闯关</h1>
              <p className="text-sm text-slate-400 mt-0.5">新人教七下 + 八下语法闯关 · 16个单元关卡</p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-6 mb-6 flex items-center gap-4 text-sm text-slate-400 bg-white/5 rounded-2xl border border-white/10 px-5 py-3">
            <span>已完成 <strong className="text-amber-400">{completedCount}</strong> / {ALL_ROUNDS.length} 关</span>
            <span className="text-slate-600">|</span>
            <span>总 XP <strong className="text-amber-400">{progress.totalXp}</strong></span>
            {progress.badges.length > 0 && (
              <>
                <span className="text-slate-600">|</span>
                <span className="flex gap-1">{progress.badges.map(b => <span key={b}>{b}</span>)}</span>
              </>
            )}
          </div>

          {/* 新人教单元同步折叠区 */}
          <div className="mt-8 mb-6 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <button onClick={() => setRefOpen(o => !o)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-lg">新人教单元同步</span>
                <span className="text-xs text-slate-500">晨读背记核心知识汇总</span>
              </div>
              {refOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            {refOpen && (
              <div className="px-5 pb-5 space-y-3">
                {UNIT_REFERENCES.map(u => (
                  <div key={u.id} className="border border-white/10 rounded-xl overflow-hidden">
                    <button onClick={() => setRefUnit(refUnit === u.id ? null : u.id)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left">
                      <span className="text-sm font-semibold">{u.name}</span>
                      <span className="text-xs text-slate-500">{refUnit === u.id ? '收起' : '展开'}</span>
                    </button>
                    {refUnit === u.id && (
                      <div className="px-4 pb-4 space-y-4 text-sm text-slate-300">
                        {u.sections.map(s => (
                          <div key={s.label}>
                            <h4 className="text-indigo-300 font-semibold mb-2 text-xs uppercase tracking-wider">{s.label}</h4>
                            {s.words && (
                              <div className="grid grid-cols-2 gap-1">
                                {s.words.map(w => (
                                  <div key={w.word} className="flex gap-1">
                                    <span className="text-amber-300">{w.word}</span>
                                    <span className="text-slate-500">{w.pos}</span>
                                    <span className="text-slate-400">{w.meaning}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {s.wordForms && (
                              <div className="space-y-0.5">
                                {s.wordForms.map(wf => (
                                  <div key={wf.from} className="text-slate-400">
                                    <span className="text-amber-300">{wf.from}</span>
                                    <span className="text-slate-600"> → </span>
                                    <span>{wf.to}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {s.phrases && (
                              <div className="space-y-0.5">
                                {s.phrases.map(p => (
                                  <div key={p.phrase} className="flex gap-2">
                                    <span className="text-emerald-300 shrink-0">{p.phrase}</span>
                                    <span className="text-slate-500">—</span>
                                    <span className="text-slate-400">{p.meaning}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {s.sentences && (
                              <div className="space-y-2">
                                {s.sentences.map(sen => (
                                  <div key={sen.sentence} className="bg-white/5 rounded-lg p-3">
                                    <p className="text-slate-200">{sen.sentence}</p>
                                    <p className="text-slate-500 text-xs mt-0.5">{sen.translation}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        {u.essay && (
                          <div>
                            <h4 className="text-indigo-300 font-semibold mb-2 text-xs uppercase tracking-wider">单元主题范文 — {u.essay.title}</h4>
                            <div className="bg-white/5 rounded-lg p-3 text-slate-300 whitespace-pre-line text-xs leading-relaxed">{u.essay.content}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grade sections */}
          {['7下', '8下'].map(grade => {
            const gradeRounds = ALL_ROUNDS.filter(r => r.grade === grade)
            return (
              <div key={grade} className="mt-6">
                <h2 className="text-lg font-bold text-white/80 mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  {grade === '7下' ? '人教版七年级下册' : '人教版八年级下册'}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {gradeRounds.map((round, i) => {
                    const completed = progress.completed.includes(round.id)
                    const prevCompleted = i === 0 || progress.completed.includes(gradeRounds[i - 1].id)
                    const locked = i > 0 && !prevCompleted && !completed
                    const stars = progress.stars[round.id] ?? 0

                    return (
                      <button
                        key={round.id}
                        onClick={() => !locked && startRound(round)}
                        disabled={locked}
                        className={`relative p-5 rounded-2xl border text-left transition-all duration-200
                          ${locked ? 'bg-slate-800/30 border-slate-700/30 opacity-40 cursor-not-allowed' :
                            completed ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 hover:border-amber-400/50 hover:scale-[1.02]' :
                            'bg-white/5 border-white/10 hover:border-indigo-400/50 hover:scale-[1.02] hover:bg-white/10'}`}
                      >
                        {locked && <div className="absolute inset-0 flex items-center justify-center text-2xl"><span>🔒</span></div>}
                        <div className={`${locked ? 'blur-sm' : ''}`}>
                          <div className="text-2xl mb-2">{round.emoji}</div>
                          <div className="text-xs text-indigo-300 mb-1">{round.unitLabel}</div>
                          <div className="text-sm font-bold truncate">{round.name}</div>
                          <div className="flex items-center gap-1 mt-3">
                            {[1, 2, 3].map(s => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                            ))}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Round Complete ──
  if (phase === 'roundComplete' || showResult) {
    const total = selectedRound?.questions.length ?? 1
    const correctCount = roundResults.filter(r => r.correct).length
    const pct = Math.round(correctCount / total * 100)
    const rank = pct >= 90 ? 'S' : pct >= 75 ? 'A' : pct >= 60 ? 'B' : pct >= 40 ? 'C' : 'D'
    const rankColor = pct >= 90 ? 'text-amber-400' : pct >= 75 ? 'text-emerald-400' : pct >= 60 ? 'text-blue-400' : pct >= 40 ? 'text-yellow-400' : 'text-rose-400'
    const rankLabel = pct >= 90 ? '卓越' : pct >= 75 ? '优秀' : pct >= 60 ? '良好' : pct >= 40 ? '继续努力' : '加油'

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 text-center">
          <div className="text-6xl mb-4">{selectedRound?.emoji}</div>
          <h2 className="text-2xl font-bold mb-2">{selectedRound?.name}</h2>

          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map(s => (
              <div key={s} className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-500
                ${s <= earnedStars ? 'bg-amber-400/20 scale-100' : 'bg-slate-800/50 scale-90'}`}>
                {s <= earnedStars ? '⭐' : '☆'}
              </div>
            ))}
          </div>

          <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2">
            {correctCount}/{total}
          </div>
          <div className={`text-lg font-bold ${rankColor} mb-2`}>{rank} — {rankLabel}</div>

          <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">你已击败</span>
              <span className="text-emerald-400 font-bold text-lg">{defeatPercent}%</span>
            </div>
            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-1000"
                style={{ width: `${defeatPercent}%` }} />
            </div>
            <p className="text-xs text-slate-500 mt-2">的同学</p>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-amber-400 font-bold">
            <Zap className="w-5 h-5" />
            +{xpGained} XP
          </div>

          <div className="mt-6 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-left">
            <p className="text-sm text-indigo-200 font-bold mb-1">AI老师说：</p>
            <p className="text-sm text-slate-300">
              {pct >= 90 ? `太棒了！你对 "${selectedRound?.name}" 的语法掌握得非常扎实！继续挑战下一关吧！` :
               pct >= 60 ? '做得不错！大部分语法点都掌握了，再复习一下错题会更棒！' :
               '继续加油！语法需要多练习，再试一次一定能做得更好！'}
            </p>
          </div>

          {bestStreak >= 3 && (
            <div className="mt-3 text-sm text-orange-400">🔥 最高连击 {bestStreak} 次！</div>
          )}

          <div className="flex gap-3 mt-8">
            <button onClick={() => setPhase('select')}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> 返回
            </button>
            <button onClick={() => selectedRound && startRound(selectedRound)}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> 再来一次
            </button>
          </div>

          {(() => {
            const idx = ALL_ROUNDS.findIndex(r => r.id === selectedRound?.id)
            const next = ALL_ROUNDS[idx + 1]
            if (!next) return null
            return (
              <button onClick={() => startRound(next)}
                className="mt-3 w-full py-3 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2">
                下一关：{next.emoji} {next.name} <ChevronRight className="w-4 h-4" />
              </button>
            )
          })()}
        </div>
      </div>
    )
  }

  // ── Playing ──
  if (!question || !selectedRound) return null
  const total = selectedRound.questions.length
  const isCorrect = answered && selectedAnswer === question.correct

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setPhase('select')} className="text-slate-400 hover:text-white transition-colors">
            <Home className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
              <Zap className="w-4 h-4" /> {score}
            </div>
            {streak >= 2 && (
              <div className="flex items-center gap-1 text-orange-400 text-sm font-bold">
                🔥 {streak}
              </div>
            )}
            <div className="text-sm text-slate-400">
              {currentQ + 1}/{total}
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{selectedRound.emoji}</div>
          <h2 className="text-lg font-bold">{selectedRound.name}</h2>
        </div>

        <div className="h-1.5 bg-slate-800 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentQ + 1) / total) * 100}%` }} />
        </div>

        <div className={`p-6 rounded-2xl border transition-all duration-300
          ${answered ? (isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30') : 'bg-white/5 border-white/10'}`}>
          <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">{question.theme}</div>
          <p className="text-lg font-medium mb-6 leading-relaxed">
            {question.question.split('____').map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="inline-block w-20 border-b-2 border-solid border-indigo-400 mx-1" />
                )}
              </React.Fragment>
            ))}
          </p>

          <div className="space-y-3">
            {question.options.map((opt, i) => {
              const isSelected = selectedAnswer === i
              const showCorrect = answered && i === question.correct
              const showWrong = answered && isSelected && !isCorrect

              let btnStyle = 'bg-white/5 border-white/10 hover:bg-white/10'
              if (showCorrect) btnStyle = 'bg-emerald-500/20 border-emerald-400/50'
              else if (showWrong) btnStyle = 'bg-rose-500/20 border-rose-400/50'

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={answered}
                  className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${btnStyle}
                    ${!answered ? 'hover:scale-[1.01] active:scale-[0.99] cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                      ${showCorrect ? 'bg-emerald-500 text-white' :
                        showWrong ? 'bg-rose-500 text-white' :
                        'bg-white/10 text-slate-300'}`}>
                      {showCorrect ? '✓' : showWrong ? '✗' : opt.label}
                    </span>
                    <span className={`text-sm ${showCorrect ? 'text-emerald-300 font-medium' : showWrong ? 'text-rose-300' : 'text-slate-200'}`}>
                      {opt.text}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {answered && (
            <div className={`mt-6 p-4 rounded-xl text-sm ${isCorrect ? 'bg-emerald-500/10 text-emerald-200' : 'bg-rose-500/10 text-rose-200'}`}>
              <p className="font-bold mb-1">{isCorrect ? '✅ 正确！' : '❌ 不对哦'}</p>
              <p>{question.explanation}</p>
              {isCorrect && streak >= 3 && (
                <p className="mt-1 text-amber-400">🔥 {streak}连击！+{Math.min(streak, 5) * 2}额外奖励分</p>
              )}
              {!isCorrect && streak >= 2 && (
                <p className="mt-1 text-amber-400">连击中断！最高连击：{streak}</p>
              )}
            </div>
          )}
        </div>

        {answered && isCorrect && (
          <div className="mt-3 text-center">
            <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 bg-amber-500/10 text-amber-300 rounded-full border border-amber-500/20">
              <Zap className="w-3 h-3" /> +{question.points + Math.min(streak, 5) * 2} XP
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
