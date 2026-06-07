import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lightbulb, Brain, ChevronRight, RefreshCw, CheckCircle2, XCircle, Sparkles } from 'lucide-react'

interface Puzzle {
  id: number
  sequence: (string | number)[]
  options: (string | number)[]
  answer: number
  rule: string
  hint: string
}

const puzzles: Puzzle[] = [
  {
    id: 1, sequence: [2, 4, 6, 8], options: [9, 10, 12, 14], answer: 1, rule: '等差数列，每次 +2', hint: '看相邻两数的差'
  },
  {
    id: 2, sequence: [1, 4, 9, 16], options: [20, 25, 24, 18], answer: 1, rule: '平方数序列：1², 2², 3², 4²…', hint: '这些数字和某个数的平方有关'
  },
  {
    id: 3, sequence: [1, 1, 2, 3, 5], options: [6, 7, 8, 10], answer: 2, rule: '斐波那契数列，前两项之和等于下一项', hint: '看任意连续三项之间的关系'
  },
  {
    id: 4, sequence: [3, 6, 12, 24], options: [36, 48, 30, 40], answer: 1, rule: '等比数列，每次 ×2', hint: '每次乘以相同的数'
  },
  {
    id: 5, sequence: ['○', '△', '□', '○', '△'], options: ['□', '○', '△', '◇'], answer: 0, rule: '图形循环：○△□ 重复', hint: '观察图形的排列顺序'
  },
  {
    id: 6, sequence: [1, 3, 6, 10], options: [12, 15, 14, 16], answer: 1, rule: '三角数：+2, +3, +4, +5…', hint: '每次增加的数在变大'
  },
  {
    id: 7, sequence: [100, 90, 81, 73], options: [66, 65, 64, 67], answer: 0, rule: '递减：-10, -9, -8, -7…', hint: '每次减去的数在变化'
  },
  {
    id: 8, sequence: [16, 8, 4, 2], options: [0, 1, 0.5, 4], answer: 1, rule: '每次 ÷2', hint: '从大到小，除以同一个数'
  },
  {
    id: 9, sequence: [1, 2, 4, 7, 11], options: [15, 16, 14, 13], answer: 1, rule: '+1, +2, +3, +4, +5…', hint: '每次加的数递增 1'
  },
  {
    id: 10, sequence: ['A', 'C', 'F', 'J'], options: ['K', 'L', 'M', 'N'], answer: 2, rule: '字母间隔递增：+2, +3, +4…', hint: '看相邻字母的距离'
  },
  {
    id: 11, sequence: ['→', '↑', '←', '↓'], options: ['←', '→', '↑', '↓'], answer: 1, rule: '方向顺时针旋转 90°', hint: '画个钟表想想'
  },
  {
    id: 12, sequence: [2, 3, 5, 7, 11], options: [12, 13, 14, 15], answer: 1, rule: '质数（素数）序列', hint: '这些数只能被 1 和自身整除'
  },
  {
    id: 13, sequence: ['▲', '▲', '△', '▲', '▲', '△'], options: ['▲', '△', '■', '◆'], answer: 0, rule: '两个实心加一个空心循环', hint: '看实心和空心的排列规律'
  },
  {
    id: 14, sequence: [1, 4, 27, 256], options: [625, 3125, 1024, 729], answer: 1, rule: 'nⁿ：1¹, 2², 3³, 4⁴…', hint: '底数和指数相等'
  },
  {
    id: 15, sequence: [1, 2, 6, 24], options: [48, 96, 120, 60], answer: 2, rule: '阶乘数列：1!, 2!, 3!, 4!…', hint: '和乘法递增有关'
  },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a
}

export default function SequenceTestPage() {
  const navigate = useNavigate()
  const [pool] = useState(() => shuffle(puzzles).slice(0, 10))
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'initial' | 'rule' | 'options'>('initial')
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [history, setHistory] = useState<{ puzzle: Puzzle; correct: boolean }[]>([])

  const puzzle = pool[index]
  const isLast = index >= pool.length - 1

  const handleRevealRule = useCallback(() => {
    setPhase('rule')
  }, [])

  const handleRevealOptions = useCallback(() => {
    setPhase('options')
  }, [])

  const handleSelect = useCallback((optIndex: number) => {
    if (selected !== null) return
    setSelected(optIndex)
    const correct = optIndex === puzzle.answer
    if (correct) setScore(s => s + 1)
    setHistory(h => [...h, { puzzle, correct }])
  }, [selected, puzzle])

  const handleNext = useCallback(() => {
    if (isLast) { setDone(true); return }
    setIndex(i => i + 1)
    setPhase('initial')
    setSelected(null)
  }, [isLast])

  const handleRestart = useCallback(() => {
    const newPool = shuffle(puzzles).slice(0, 10)
    // can't reassign pool, use key trick - just reset state
    setIndex(0); setPhase('initial'); setSelected(null); setScore(0); setDone(false); setHistory([])
    window.location.reload()
  }, [])

  const seqStr = (item: string | number) => typeof item === 'string' ? item : String(item)

  if (done) {
    const total = pool.length
    const pct = Math.round(score / total * 100)
    const grade = pct >= 80 ? '优秀' : pct >= 60 ? '良好' : pct >= 40 ? '一般' : '继续加油'
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">推理测试完成</h2>
          <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 my-6">{score}/{total}</div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm mb-6">
            等级：<span className="font-bold text-amber-400">{grade}</span>
          </div>
          <div className="space-y-2 mb-8 max-h-48 overflow-y-auto text-left">
            {history.map((h, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${h.correct ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {h.correct ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                <span className="truncate">{h.puzzle.sequence.join(', ')} → ?</span>
                <span className="ml-auto shrink-0 text-xs opacity-60">{h.puzzle.rule}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={handleRestart} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> 再来一轮
            </button>
            <button onClick={() => navigate('/')} className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              返回首页
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-md">1≡、2=</span>
                <span className="text-xs text-white/40">罗码术</span>
              </div>
              <h1 className="text-lg font-bold text-white mt-0.5">序列推理测试</h1>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/60">进度 <span className="text-white font-bold">{index + 1}</span><span className="text-white/30">/{pool.length}</span></div>
            <div className="text-xs text-white/40">得分 <span className="text-amber-400 font-bold">{score}</span></div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-white/5 mb-8 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500" style={{ width: `${(index + 1) / pool.length * 100}%` }} />
        </div>

        {/* Puzzle card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 mb-6">
          <p className="text-xs text-white/40 mb-1 font-mono">第 {index + 1} 题</p>
          <p className="text-sm text-white/50 mb-6">观察序列规律，选择下一个正确的元素</p>

          {/* Sequence display */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-8">
            {puzzle.sequence.map((item, i) => (
              <div key={i} className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                {seqStr(item)}
              </div>
            ))}
            <div className={`w-14 h-14 rounded-2xl border-2 border-dashed flex items-center justify-center text-2xl font-bold transition-all duration-300 ${phase === 'options' ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-white/20 text-white/30'}`}>
              ?
            </div>
          </div>

          {/* Rule reveal */}
          {phase === 'initial' && (
            <p className="text-center text-sm text-white/30">点击下方按钮，逐步分析序列</p>
          )}
          {phase === 'rule' && (
            <div className="text-center p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
              <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-medium mb-1">
                <Lightbulb className="w-4 h-4" /> 提示
              </div>
              <p className="text-white/80">{puzzle.hint}</p>
            </div>
          )}

          {/* Options (only visible after "推断下一项" is clicked) */}
          {phase === 'options' && (
            <div>
              <p className="text-xs text-white/40 mb-3 text-center">选择下一个元素：</p>
              <div className="grid grid-cols-2 gap-3">
                {puzzle.options.map((opt, i) => {
                  const isCorrect = i === puzzle.answer
                  const isSelected = selected === i
                  let btnStyle = 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  if (isSelected && isCorrect) btnStyle = 'bg-green-500/20 border-green-500/50 scale-105 shadow-lg shadow-green-500/20'
                  else if (isSelected && !isCorrect) btnStyle = 'bg-red-500/20 border-red-500/50'
                  else if (selected !== null && isCorrect) btnStyle = 'bg-green-500/10 border-green-500/30'
                  return (
                    <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null}
                      className={`h-16 rounded-2xl border-2 flex items-center justify-center text-xl font-bold text-white transition-all duration-300 ${btnStyle}`}>
                      {seqStr(opt)}
                    </button>
                  )
                })}
              </div>
              {selected !== null && (
                <div className={`mt-4 p-4 rounded-2xl text-center ${selected === puzzle.answer ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {selected === puzzle.answer ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                    <span className={`font-semibold ${selected === puzzle.answer ? 'text-green-400' : 'text-red-400'}`}>
                      {selected === puzzle.answer ? '回答正确！' : `正确答案是 ${seqStr(puzzle.options[puzzle.answer])}`}
                    </span>
                  </div>
                  <p className="text-xs text-white/40">规律：{puzzle.rule}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Control buttons */}
        <div className="flex gap-3 mb-4">
          <button onClick={handleRevealRule} disabled={phase !== 'initial'}
            className={`flex-1 py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${phase === 'initial' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}>
            <Lightbulb className="w-4 h-4" /> 寻找规律
          </button>
          <button onClick={handleRevealOptions} disabled={phase !== 'rule'}
            className={`flex-1 py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${phase === 'rule' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/30' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}>
            <Brain className="w-4 h-4" /> 推断下一项
          </button>
        </div>

        {/* Next / Restart */}
        <button onClick={handleNext} disabled={selected === null}
          className={`w-full py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${selected !== null ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-purple-500/30' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}>
          {isLast ? <><CheckCircle2 className="w-4 h-4" /> 查看结果</> : <><ChevronRight className="w-4 h-4" /> 开始挑战</>}
        </button>
      </div>
    </div>
  )
}
