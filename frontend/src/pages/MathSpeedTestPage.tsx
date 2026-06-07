import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Timer, TrendingUp, Zap, RefreshCw, Home, CheckCircle2, XCircle } from 'lucide-react'

type Operator = '+' | '-' | '×' | '÷'

interface LevelConfig {
  label: string
  range: [number, number]
  ops: Operator[]
  timeBonus: number
}

const levels: LevelConfig[] = [
  { label: 'Lv.1 入门', range: [1, 20], ops: ['+', '-'], timeBonus: 0 },
  { label: 'Lv.2 基础', range: [1, 50], ops: ['+', '-', '×'], timeBonus: 1 },
  { label: 'Lv.3 进阶', range: [5, 99], ops: ['+', '-', '×'], timeBonus: 2 },
  { label: 'Lv.4 挑战', range: [5, 99], ops: ['+', '-', '×', '÷'], timeBonus: 3 },
  { label: 'Lv.5 极限', range: [10, 999], ops: ['×', '÷'], timeBonus: 4 },
]

function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }

function genQuestion(level: LevelConfig): { text: string; answer: number } {
  const op = level.ops[randInt(0, level.ops.length - 1)]
  const [min, max] = level.range
  let a: number, b: number, text: string, answer: number
  switch (op) {
    case '+':
      a = randInt(min, max); b = randInt(min, max)
      text = `${a} + ${b}`; answer = a + b; break
    case '-':
      a = randInt(min, max); b = randInt(min, a)
      text = `${a} - ${b}`; answer = a - b; break
    case '×':
      a = randInt(min, Math.min(max, 50)); b = randInt(Math.max(2, min), Math.min(max, 20))
      text = `${a} × ${b}`; answer = a * b; break
    case '÷':
      b = randInt(Math.max(2, min), Math.min(max, 20)); answer = randInt(1, Math.min(max, 50)); a = b * answer
      text = `${a} ÷ ${b}`; break
    default: text = '1 + 1'; answer = 2
  }
  return { text, answer }
}

export default function MathSpeedTestPage() {
  const navigate = useNavigate()
  const [timeLeft, setTimeLeft] = useState(60)
  const [levelIdx, setLevelIdx] = useState(0)
  const [q, setQ] = useState(() => genQuestion(levels[0]))
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [streak, setStreak] = useState(0)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [history, setHistory] = useState<{ text: string; answer: number; correct: boolean }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval>>()

  const level = levels[Math.min(levelIdx, levels.length - 1)]

  const nextQuestion = useCallback(() => {
    setQ(genQuestion(level))
    setInput('')
    setFeedback(null)
    inputRef.current?.focus()
  }, [level])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (feedback !== null) return
    const val = input.trim()
    if (!val) return
    const userAns = parseInt(val, 10)
    if (isNaN(userAns)) return
    const correct = userAns === q.answer
    setHistory(h => [{ text: q.text, answer: q.answer, correct }, ...h].slice(0, 50))
    if (correct) {
      setScore(s => s + 1)
      setStreak(s => {
        const ns = s + 1
        if (ns > 0 && ns % 3 === 0) setLevelIdx(li => Math.min(li + 1, levels.length - 1))
        return ns
      })
      setFeedback('correct')
    } else {
      setWrong(w => w + 1)
      setStreak(0)
      setFeedback('wrong')
    }
    setTimeout(nextQuestion, 400)
  }, [input, q, feedback, nextQuestion])

  const startGame = useCallback(() => {
    setStarted(true)
    setTimeLeft(60)
    setScore(0)
    setWrong(0)
    setStreak(0)
    setLevelIdx(0)
    setHistory([])
    setQ(genQuestion(levels[0]))
    setInput('')
    setFeedback(null)
    setFinished(false)
    inputRef.current?.focus()
  }, [])

  // Timer
  useEffect(() => {
    if (!started || finished) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setFinished(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [started, finished])

  // Focus input on mount
  useEffect(() => { if (started) inputRef.current?.focus() }, [started])

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">数学速算挑战</h1>
          <p className="text-white/50 text-sm mb-8">60 秒内尽可能多地答对算术题，难度递增</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm font-medium mb-1">
                <Timer className="w-4 h-4" /> 限时速算
              </div>
              <p className="text-2xl font-bold text-white">60s</p>
              <p className="text-xs text-white/40">倒计时，快速答题</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-medium mb-1">
                <TrendingUp className="w-4 h-4" /> 难度递增
              </div>
              <p className="text-2xl font-bold text-white">5级</p>
              <p className="text-xs text-white/40">答对越多难度越高</p>
            </div>
          </div>

          <button onClick={startGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" /> 开始挑战
          </button>
        </div>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">时间到！</h2>
          <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 my-6">{score}</div>
          <p className="text-white/60 mb-2">答对 <span className="text-cyan-400 font-bold">{score}</span> 题 · 答错 <span className="text-red-400 font-bold">{wrong}</span> 题</p>
          <p className="text-white/40 text-sm mb-6">正确率：{score + wrong > 0 ? Math.round(score / (score + wrong) * 100) : 0}% · 最高等级：{levels[Math.min(levelIdx, levels.length - 1)].label}</p>

          {history.length > 0 && (
            <div className="mb-6 max-h-40 overflow-y-auto text-left space-y-1">
              {history.slice(0, 10).map((h, i) => (
                <div key={i} className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${h.correct ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {h.correct ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                  <span>{h.text} = {h.answer}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={startGame} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> 再来一局
            </button>
            <button onClick={() => navigate('/')} className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> 返回首页
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-white">数学速算</h1>
            <p className="text-xs text-white/40">键盘输入 · 回车确认</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white tabular-nums">{score}</div>
            <div className="text-xs text-white/40">得分</div>
          </div>
        </div>

        {/* Timer + Level */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1">
              <Timer className="w-3.5 h-3.5" /> 剩余时间
            </div>
            <div className="text-3xl font-bold tabular-nums text-white">{timeLeft}s</div>
            <div className="h-1 mt-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000" style={{ width: `${timeLeft / 60 * 100}%` }} />
            </div>
          </div>
          <div className="flex-1 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-amber-400 mb-1">
              <TrendingUp className="w-3.5 h-3.5" /> 等级
            </div>
            <div className="text-xl font-bold text-white">{level.label}</div>
            <div className="flex gap-1 mt-2">
              {levels.map((_, i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= levelIdx ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 mb-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2 font-mono tracking-wider">{q.text}</div>
            <div className="text-xs text-white/30 font-mono">= ?</div>
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative">
            <input ref={inputRef} type="number" value={input} onChange={e => setInput(e.target.value)}
              autoFocus
              className={`w-full text-center text-4xl font-bold py-6 rounded-2xl border-2 outline-none transition-all bg-white/5 text-white placeholder-white/20
                ${feedback === 'correct' ? 'border-green-500 bg-green-500/10' : feedback === 'wrong' ? 'border-red-500 bg-red-500/10' : 'border-white/20 focus:border-cyan-400'}`}
              placeholder="?"
            />
            {feedback === 'correct' && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
            )}
            {feedback === 'wrong' && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            )}
          </div>
          <p className="text-center text-xs text-white/30 mt-2">按 Enter 回车键确认答案 · 连续答对 3 题升级</p>
        </form>

        {/* Stats row */}
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-white/40">
            连对 <span className="text-cyan-400 font-bold">{streak}</span>
          </div>
          <div className="flex items-center gap-2 text-white/40">
            答错 <span className="text-red-400 font-bold">{wrong}</span>
          </div>
          <div className="flex items-center gap-2 text-white/40">
            正确率 <span className="text-white font-bold">{score + wrong > 0 ? Math.round(score / (score + wrong) * 100) : 100}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
