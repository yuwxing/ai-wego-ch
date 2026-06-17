import { useState, useEffect, useRef, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
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
  return s.trim().toLowerCase()
}

function normalizeMulti(v: string): string[] {
  return v.split('/').map(s => s.trim().toLowerCase())
}

function matchAnswer(input: string, answer: string): boolean {
  return normalizeMulti(answer).some(a => normalize(input) === a)
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

const TIME_LIMIT = 180

export default function TypingRaceGame({
  verbs,
  stageName,
  onComplete,
  onBack,
}: {
  verbs: VerbEntry[]
  stageName: string
  onComplete: (score: number) => void
  onBack: () => void
}) {
  const [shuffledVerbs, setShuffledVerbs] = useState<VerbEntry[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [pastInput, setPastInput] = useState('')
  const [ppInput, setPpInput] = useState('')
  const [feedback, setFeedback] = useState<{ past: boolean | null; pp: boolean | null }>({ past: null, pp: null })
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showingResult, setShowingResult] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scoreRef = useRef(score)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    setIsMobile(window.innerWidth < 600)
  }, [])

  const initGame = useCallback(() => {
    setShuffledVerbs(shuffle([...verbs]))
    setCurrentQ(0)
    setPastInput('')
    setPpInput('')
    setFeedback({ past: null, pp: null })
    setScore(0)
    setCombo(0)
    setTimeLeft(TIME_LIMIT)
    setStarted(false)
    setFinished(false)
    setShowingResult(false)
  }, [verbs])

  useEffect(() => { initGame() }, [initGame])

  useEffect(() => {
    if (!started || finished) return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer)
          setFinished(true)
          const maxScore = shuffledVerbs.length * 25
          const pct = Math.min(100, Math.round((scoreRef.current / maxScore) * 100))
          onCompleteRef.current(pct)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [started, finished])

  const startGame = () => setStarted(true)

  const handleSubmit = () => {
    if (showingResult || !shuffledVerbs[currentQ]) return
    const verb = shuffledVerbs[currentQ]
    const pastCorrect = matchAnswer(pastInput, verb.past)
    const ppCorrect = matchAnswer(ppInput, verb.pp)

    setFeedback({ past: pastCorrect, pp: ppCorrect })
    setShowingResult(true)

    let pts = 0
    if (pastCorrect) pts += 10
    if (ppCorrect) pts += 15
    if (pastCorrect && ppCorrect) {
      playTone(523, 0.08)
      setTimeout(() => playTone(659, 0.1), 60)
      setCombo(c => c + 1)
    } else {
      setCombo(0)
    }
    setScore(s => s + pts)
  }

  const handleNext = () => {
    if (currentQ + 1 < shuffledVerbs.length) {
      setCurrentQ(q => q + 1)
      setPastInput('')
      setPpInput('')
      setFeedback({ past: null, pp: null })
      setShowingResult(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setFinished(true)
      const maxScore = shuffledVerbs.length * 25
      const pct = Math.min(100, Math.round((score / maxScore) * 100))
      onComplete(pct)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, field: 'past' | 'pp') => {
    if (e.key === 'Enter' && !showingResult) {
      if (field === 'past' && ppInput.trim() === '') {
        document.getElementById('pp-input')?.focus()
      } else {
        handleSubmit()
      }
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progressPct = ((currentQ + (showingResult ? 1 : 0)) / shuffledVerbs.length) * 100

  if (finished) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Noto Serif SC", serif', color: '#1e293b', padding: 24,
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>⏱️</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>时间到！</h2>
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>{stageName}</p>
        <div style={{ fontSize: 48, marginBottom: 12 }}>
          {[1, 2, 3].map(i => <span key={i} style={{ opacity: score >= verbs.length * 20 ? 1 : i <= Math.ceil(score / (verbs.length * 10)) ? 0.8 : 0.2 }}>⭐</span>)}
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, background: 'linear-gradient(135deg, #f7971e, #ffd200)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>{score} 分</div>
        <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 24 }}>完成 {currentQ}/{shuffledVerbs.length} 题</p>
        <button onClick={initGame}
          style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: '"Noto Serif SC", serif', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <RefreshCw className="w-4 h-4" /> 再来一次
        </button>
      </div>
    )
  }

  if (!started) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Noto Serif SC", serif', color: '#1e293b', padding: 24,
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>⌨️</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>时间竞赛打字</h2>
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 24, textAlign: 'center' }}>
          在{TIME_LIMIT}秒内尽可能多地完成动词<br />
          输入过去式和过去分词，速度越快分越高！
        </p>
        <button onClick={startGame}
          style={{
            background: 'linear-gradient(135deg, #f7971e, #ffd200)', border: 'none', color: '#1e293b',
            padding: '14px 40px', borderRadius: 12, cursor: 'pointer', fontSize: 16, fontWeight: 700,
            fontFamily: '"Noto Serif SC", serif', boxShadow: '0 2px 8px rgba(247,151,30,0.3)',
          }}>
          开始挑战！
        </button>
      </div>
    )
  }

  const verb = shuffledVerbs[currentQ]
  if (!verb) return null

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px',
      fontFamily: '"Noto Serif SC", serif', color: '#1e293b', boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 420, marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <button onClick={onBack}
            style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid #e2e8f0', color: '#64748b', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>
            ← {stageName}
          </button>
          <div style={{
            fontSize: 13, fontWeight: 700, color: timeLeft < 30 ? '#dc2626' : '#f59e0b',
            fontFamily: 'monospace',
          }}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>
        <div style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #f7971e, #ffd200)', borderRadius: 2, transition: 'width 0.2s' }} />
        </div>
      </div>

      {/* Score and combo */}
      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, display: 'flex', gap: 16 }}>
        <span>得分: <strong style={{ color: '#f59e0b' }}>{score}</strong></span>
        {combo >= 2 && <span style={{ color: '#0ea5e9' }}>🔥 x{combo}</span>}
        <span style={{ color: '#94a3b8' }}>{currentQ + 1}/{shuffledVerbs.length}</span>
      </div>

      {/* Question card */}
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'white', border: '1px solid #e2e8f0', borderRadius: 16,
        padding: isMobile ? '20px 16px' : '28px 24px',
        textAlign: 'center', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6, letterSpacing: 1 }}>请在3分钟内输入过去式和过去分词</div>
        <div style={{ fontSize: isMobile ? 14 : 16, color: '#64748b', fontFamily: 'monospace', marginBottom: 4 }}>{verb.base}</div>
        <div style={{ fontSize: isMobile ? 26 : 30, fontWeight: 700, color: '#1e293b' }}>{verb.meaning}</div>
      </div>

      {/* Input fields */}
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 11, color: '#64748b', marginBottom: 2, display: 'block' }}>过去式 (10分)</label>
          <input value={pastInput} onChange={e => setPastInput(e.target.value)}
            ref={inputRef}
            disabled={showingResult}
            placeholder="输入过去式..."
            style={{
              width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 8,
              border: `1px solid ${feedback.past === null ? '#e2e8f0' : feedback.past ? '#4caf50' : '#f44336'}`,
              background: feedback.past === null ? 'white' : feedback.past ? '#f0fdf4' : '#fef2f2',
              color: '#1e293b', fontSize: 15, fontFamily: 'monospace', outline: 'none',
            }}
            onKeyDown={e => handleKeyDown(e, 'past')} />
          {feedback.past !== null && (
            <div style={{ fontSize: 11, marginTop: 2, color: feedback.past ? '#16a34a' : '#dc2626' }}>
              {feedback.past ? '✓' : `✗ ${verb.past}`}
            </div>
          )}
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#64748b', marginBottom: 2, display: 'block' }}>过去分词 (15分)</label>
          <input id="pp-input" value={ppInput} onChange={e => setPpInput(e.target.value)}
            disabled={showingResult}
            placeholder="输入过去分词..."
            style={{
              width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 8,
              border: `1px solid ${feedback.pp === null ? '#e2e8f0' : feedback.pp ? '#4caf50' : '#f44336'}`,
              background: feedback.pp === null ? 'white' : feedback.pp ? '#f0fdf4' : '#fef2f2',
              color: '#1e293b', fontSize: 15, fontFamily: 'monospace', outline: 'none',
            }}
            onKeyDown={e => handleKeyDown(e, 'pp')} />
          {feedback.pp !== null && (
            <div style={{ fontSize: 11, marginTop: 2, color: feedback.pp ? '#16a34a' : '#dc2626' }}>
              {feedback.pp ? '✓' : `✗ ${verb.pp}`}
            </div>
          )}
        </div>
      </div>

      {!showingResult ? (
        <button onClick={handleSubmit}
          disabled={!pastInput.trim() || !ppInput.trim()}
          style={{
            width: '100%', maxWidth: 420, padding: '12px 0', borderRadius: 10,
            background: !pastInput.trim() || !ppInput.trim() ? '#e2e8f0' : 'linear-gradient(135deg, #f7971e, #ffd200)',
            border: 'none', color: !pastInput.trim() || !ppInput.trim() ? '#94a3b8' : '#1e293b',
            fontSize: 14, fontWeight: 600, cursor: !pastInput.trim() || !ppInput.trim() ? 'not-allowed' : 'pointer',
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
