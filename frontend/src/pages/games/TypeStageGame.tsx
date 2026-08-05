import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { RefreshCw, ChevronRight } from 'lucide-react'
import type { VerbEntry } from '../../utils/irregularVerbsData'

function shuffle<T>(arr: T[]): T[] {
  const c = [...arr]
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]]
  }
  return c
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/[\/ ]+/g, '/')
}

function normalizeMulti(v: string): string[] {
  return v.split('/').map(s => s.trim().toLowerCase().replace(/[（(][^）)]*[）)]/g, '').trim()).filter(Boolean)
}

function matchAnswer(input: string, answer: string): boolean {
  const inputs = normalizeMulti(input)
  const answers = normalizeMulti(answer)
  return inputs.some(i => answers.some(a => i === a))
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine') {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {}
}

function playCorrect() {
  playTone(523, 0.1)
  setTimeout(() => playTone(659, 0.1), 80)
  setTimeout(() => playTone(784, 0.15), 160)
}

function playWrong() {
  playTone(200, 0.2, 'square')
}

export default function TypeStageGame({
  verbs,
  stageName,
  onComplete,
  onBack,
  showPp = true,
  timeLimit,
  allGradeVerbs,
}: {
  verbs: VerbEntry[]
  stageName: string
  onComplete: (score: number) => void
  onBack: () => void
  showPp?: boolean
  timeLimit?: number
  allGradeVerbs?: VerbEntry[]
}) {
  const [shuffledVerbs, setShuffledVerbs] = useState<VerbEntry[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [baseInput, setBaseInput] = useState('')
  const [pastInput, setPastInput] = useState('')
  const [ppInput, setPpInput] = useState('')
  const [feedback, setFeedback] = useState<{ base: boolean | null; past: boolean | null; pp: boolean | null }>({ base: null, past: null, pp: null })
  const [stageScore, setStageScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showingResult, setShowingResult] = useState(false)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit || 0)
  const scoreRef = useRef(0)
  const onCompleteRef = useRef(onComplete)

  const meaningGroups = useMemo(() => {
    const map: Record<string, VerbEntry[]> = {}
    const source = allGradeVerbs && allGradeVerbs.length > 0 ? allGradeVerbs : verbs
    for (const v of source) {
      if (!map[v.meaning]) map[v.meaning] = []
      map[v.meaning].push(v)
    }
    return map
  }, [verbs, allGradeVerbs])

  useEffect(() => { scoreRef.current = stageScore }, [stageScore])
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    setIsMobile(window.innerWidth < 600)
  }, [])

  const initGame = useCallback(() => {
    setShuffledVerbs(shuffle([...verbs]))
    setCurrentQ(0)
    setBaseInput('')
    setPastInput('')
    setPpInput('')
    setFeedback({ base: null, past: null, pp: null })
    setStageScore(0)
    setFinished(false)
    setShowingResult(false)
    setCombo(0)
    setTimeLeft(timeLimit || 0)
  }, [verbs, timeLimit])

  useEffect(() => { initGame() }, [initGame])

  useEffect(() => {
    if (!timeLimit || finished) return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer)
          setFinished(true)
          const maxPts = shuffledVerbs.length * 5
          const pct = Math.round((scoreRef.current / maxPts) * 100)
          onCompleteRef.current(pct)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLimit, finished, shuffledVerbs.length])

  const handleSubmit = () => {
    if (showingResult || !shuffledVerbs[currentQ]) return
    const verb = shuffledVerbs[currentQ]
    const group = meaningGroups[verb.meaning]
    const isGroup = group && group.length > 1
    let baseCorrect: boolean, pastCorrect: boolean, ppCorrect: boolean
    if (isGroup) {
      baseCorrect = pastCorrect = ppCorrect = false
      for (const v of group) {
        const b = matchAnswer(baseInput, v.base)
        const p = matchAnswer(pastInput, v.past)
        const pp = showPp ? matchAnswer(ppInput, v.pp) : true
        if (b && p && pp) { baseCorrect = b; pastCorrect = p; ppCorrect = pp; break }
      }
    } else {
      baseCorrect = matchAnswer(baseInput, verb.base)
      pastCorrect = matchAnswer(pastInput, verb.past)
      ppCorrect = showPp ? matchAnswer(ppInput, verb.pp) : true
    }

    setFeedback({ base: baseCorrect, past: pastCorrect, pp: showPp ? ppCorrect : null })

    let pts = 0
    if (baseCorrect) pts += showPp ? 1 : 2
    if (pastCorrect) pts += showPp ? 2 : 3
    if (showPp && ppCorrect) pts += 2

    const allCorrect = baseCorrect && pastCorrect && (!showPp || ppCorrect)
    if (allCorrect) {
      playCorrect()
      setCombo(c => c + 1)
    } else {
      playWrong()
      setCombo(0)
    }

    setStageScore(s => s + pts)
    setShowingResult(true)
  }

  const handleNext = () => {
    if (currentQ + 1 < shuffledVerbs.length) {
      setCurrentQ(q => q + 1)
      setBaseInput('')
      setPastInput('')
      setPpInput('')
      setFeedback({ base: null, past: null, pp: null })
      setShowingResult(false)
    } else {
      const totalPossible = shuffledVerbs.length * 5
      const pct = Math.round((stageScore / totalPossible) * 100)
      const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0
      for (let i = 0; i < stars; i++) setTimeout(() => playTone(880 + i * 120, 0.12), i * 200)
      setFinished(true)
      const maxPts = shuffledVerbs.length * 5
      const finalPct = Math.round((stageScore / maxPts) * 100)
      onComplete(finalPct)
    }
  }

  if (finished) {
    const totalPossible = shuffledVerbs.length * 5
    const pct = Math.round((stageScore / totalPossible) * 100)
    const timedOut = timeLimit > 0 && timeLeft === 0
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Noto Serif SC", serif', color: '#1e293b', padding: 24,
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{timedOut ? '⏰' : (pct >= 80 ? '🏆' : '🎉')}</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{timedOut ? '时间到！' : `${stageName} 完成！`}</h2>
        {timedOut && <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>已完成 {currentQ}/{shuffledVerbs.length} 题</p>}
        <div style={{ fontSize: 48, marginBottom: 12 }}>
          {[1, 2, 3].map(i => <span key={i} style={{ opacity: pct >= i * 30 ? 1 : 0.2 }}>⭐</span>)}
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, background: 'linear-gradient(135deg, #f7971e, #ffd200)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>{stageScore} 分</div>
        <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 24 }}>正确率 {pct}% · {shuffledVerbs.length} 题</p>
        <button onClick={initGame}
          style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: '"Noto Serif SC", serif', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <RefreshCw className="w-4 h-4" /> 再来一次
        </button>
      </div>
    )
  }

  const verb = shuffledVerbs[currentQ]
  if (!verb) return null
  const progressPct = ((currentQ + (showingResult ? 1 : 0)) / shuffledVerbs.length) * 100

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px',
      fontFamily: '"Noto Serif SC", serif', color: '#1e293b', boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 420, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <button onClick={onBack}
            style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid #e2e8f0', color: '#64748b', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>
            ← {stageName}
          </button>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {timeLimit > 0 && (
              <div style={{
                fontSize: 13, fontWeight: 700, fontFamily: 'monospace',
                color: timeLeft < 60 ? '#dc2626' : timeLeft < 180 ? '#f59e0b' : '#94a3b8',
              }}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
            )}
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{currentQ + 1} / {shuffledVerbs.length}</div>
          </div>
        </div>
        <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #f7971e, #ffd200)', borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Score */}
      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, display: 'flex', gap: 16 }}>
        <span>得分: <strong style={{ color: '#f59e0b' }}>{stageScore}</strong></span>
        {combo >= 2 && <span style={{ color: '#0ea5e9' }}>🔥 连击 x{combo}</span>}
      </div>

      {/* Question card */}
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'white', border: '1px solid #e2e8f0', borderRadius: 16,
        padding: isMobile ? '20px 16px' : '28px 24px',
        textAlign: 'center', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6, letterSpacing: 1 }}>请写出下列动词{showPp ? '的原形、过去式和过去分词' : '的原形和过去式'}</div>
        <div style={{ fontSize: isMobile ? 26 : 30, fontWeight: 700, color: '#1e293b' }}>{verb.meaning}</div>
      </div>

      {/* Input fields */}
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <div>
            <label style={{ fontSize: 11, color: '#64748b', marginBottom: 2, display: 'block' }}>原形 ({showPp ? 1 : 2}分)</label>
          <input value={baseInput} onChange={e => setBaseInput(e.target.value)}
            disabled={showingResult}
            placeholder="输入原形..."
            style={{
              width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 8,
              border: `1px solid ${feedback.base === null ? '#e2e8f0' : feedback.base ? '#4caf50' : '#f44336'}`,
              background: feedback.base === null ? 'white' : feedback.base ? '#f0fdf4' : '#fef2f2',
              color: '#1e293b', fontSize: 15, fontFamily: 'monospace', outline: 'none',
            }}
            onKeyDown={e => { if (e.key === 'Enter' && !showingResult) document.getElementById('t-pp-input')?.focus() }} />
          {feedback.base !== null && <div style={{ fontSize: 11, marginTop: 2, color: feedback.base ? '#16a34a' : '#dc2626' }}>{feedback.base ? '✓' : `✗ ${verb.base}`}</div>}
        </div>
        <div>
            <label style={{ fontSize: 11, color: '#64748b', marginBottom: 2, display: 'block' }}>过去式 ({showPp ? 2 : 3}分)</label>
          <input id="t-pp-input" value={pastInput} onChange={e => setPastInput(e.target.value)}
            disabled={showingResult}
            placeholder="输入过去式..."
            style={{
              width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 8,
              border: `1px solid ${feedback.past === null ? '#e2e8f0' : feedback.past ? '#4caf50' : '#f44336'}`,
              background: feedback.past === null ? 'white' : feedback.past ? '#f0fdf4' : '#fef2f2',
              color: '#1e293b', fontSize: 15, fontFamily: 'monospace', outline: 'none',
            }}
            onKeyDown={e => { if (e.key === 'Enter' && !showingResult) document.getElementById('t-pp-past')?.focus() }} />
          {feedback.past !== null && <div style={{ fontSize: 11, marginTop: 2, color: feedback.past ? '#16a34a' : '#dc2626' }}>{feedback.past ? '✓' : `✗ ${verb.past}`}</div>}
        </div>
          {showPp && <div>
            <label style={{ fontSize: 11, color: '#64748b', marginBottom: 2, display: 'block' }}>过去分词 (2分)</label>
            <input id="t-pp-past" value={ppInput} onChange={e => setPpInput(e.target.value)}
              disabled={showingResult}
              placeholder="输入过去分词..."
              style={{
                width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 8,
                border: `1px solid ${feedback.pp === null ? '#e2e8f0' : feedback.pp ? '#4caf50' : '#f44336'}`,
                background: feedback.pp === null ? 'white' : feedback.pp ? '#f0fdf4' : '#fef2f2',
                color: '#1e293b', fontSize: 15, fontFamily: 'monospace', outline: 'none',
              }}
              onKeyDown={e => { if (e.key === 'Enter' && !showingResult) handleSubmit() }} />
            {feedback.pp !== null && <div style={{ fontSize: 11, marginTop: 2, color: feedback.pp ? '#16a34a' : '#dc2626' }}>{feedback.pp ? '✓' : `✗ ${verb.pp}`}</div>}
          </div>}
      </div>

      {!showingResult ? (
        <button onClick={handleSubmit}
          disabled={!baseInput.trim() || !pastInput.trim() || (showPp && !ppInput.trim())}
          style={{
            width: '100%', maxWidth: 420, padding: '12px 0', borderRadius: 10,
            background: !baseInput.trim() || !pastInput.trim() || (showPp && !ppInput.trim()) ? '#e2e8f0' : 'linear-gradient(135deg, #f7971e, #ffd200)',
            border: 'none', color: !baseInput.trim() || !pastInput.trim() || (showPp && !ppInput.trim()) ? '#94a3b8' : '#1e293b',
            fontSize: 14, fontWeight: 600, cursor: !baseInput.trim() || !pastInput.trim() || (showPp && !ppInput.trim()) ? 'not-allowed' : 'pointer',
            fontFamily: '"Noto Serif SC", serif',
          }}>
          ✅ 提交
        </button>
      ) : (
        <button onClick={handleNext}
          style={{
            width: '100%', maxWidth: 420, padding: '12px 0', borderRadius: 10,
            background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
            border: 'none', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: '"Noto Serif SC", serif', boxShadow: '0 2px 8px rgba(14,165,233,0.3)',
          }}>
          {currentQ + 1 < shuffledVerbs.length ? '下一题 →' : '查看成绩 🏆'}
        </button>
      )}
    </div>
  )
}
