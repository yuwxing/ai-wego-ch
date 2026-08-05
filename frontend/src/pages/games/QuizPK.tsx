import { useState, useEffect, useRef } from 'react'
import { RefreshCw, Timer, Volume2 } from 'lucide-react'
import { getRandomWords, getMeaningPool, Word } from '../../utils/gameWords'

type Team = 'left' | 'right'

export default function QuizPK() {
  const [words, setWords] = useState<Word[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState({ left: 0, right: 0 })
  const [answered, setAnswered] = useState(false)
  const [correct, setCorrect] = useState<string | null>(null)
  const [wrongPick, setWrongPick] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(10)
  const [teamTurn, setTeamTurn] = useState<Team>('left')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [options, setOptions] = useState<string[]>([])

  const TOTAL = 10

  const initGame = () => {
    const ws = getRandomWords(TOTAL)
    setWords(ws)
    setIndex(0)
    setScore({ left: 0, right: 0 })
    setAnswered(false)
    setCorrect(null)
    setWrongPick(null)
    setTeamTurn('left')
    setTimeLeft(10)
    if (ws[0]) setOptions(getMeaningPool(ws, ws[0]))
  }

  useEffect(() => { initGame() }, [])

  const speak = (text: string) => {
    try {
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'en-US'
      u.rate = 0.85
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    } catch {}
  }

  useEffect(() => {
    if (answered || words.length === 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          // timeout, switch turn without point
          handleAnswer('timeout')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [index, answered, words.length])

  const handleAnswer = (pick: string) => {
    if (answered) return
    if (timerRef.current) clearInterval(timerRef.current)
    setAnswered(true)
    const current = words[index]
    if (!current) return
    const isCorrect = pick === current.meaning
    if (isCorrect) {
      setCorrect(pick)
      setScore(s => ({ ...s, [teamTurn]: s[teamTurn] + 1 }))
    } else if (pick !== 'timeout') {
      setWrongPick(pick)
    }
    if (pick === 'timeout') setCorrect(null)
  }

  const next = () => {
    if (index + 1 >= words.length) {
      // finish
      setIndex(words.length)
      return
    }
    setIndex(i => i + 1)
    setAnswered(false)
    setCorrect(null)
    setWrongPick(null)
    setTimeLeft(10)
    setTeamTurn(t => (t === 'left' ? 'right' : 'left'))
    const nw = words[index + 1]
    if (nw) setOptions(getMeaningPool(words, nw))
  }

  const finished = index >= words.length

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            ⚔️ 快闪答题 PK
          </h2>
          <p className="text-xs text-slate-400 mt-1">两队轮流答题，限时选中文释义，答对得分</p>
        </div>
        <button onClick={initGame}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-medium hover:from-indigo-600 hover:to-violet-600 transition-all">
          <RefreshCw className="w-4 h-4" /> 重新开局
        </button>
      </div>

      {/* score board */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className={`rounded-2xl border-2 p-4 text-center transition-colors ${teamTurn === 'left' && !finished ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-white'}`}>
          <p className="text-xs text-slate-400 mb-1">蓝队 (左)</p>
          <p className="text-4xl font-extrabold text-sky-500">{score.left}</p>
        </div>
        <div className={`rounded-2xl border-2 p-4 text-center transition-colors ${teamTurn === 'right' && !finished ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white'}`}>
          <p className="text-xs text-slate-400 mb-1">红队 (右)</p>
          <p className="text-4xl font-extrabold text-rose-500">{score.right}</p>
        </div>
      </div>

      {finished ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
          <p className="text-5xl mb-3">{score.left > score.right ? '🏆' : score.right > score.left ? '🏆' : '🤝'}</p>
          <p className="text-xl font-bold text-slate-800 mb-2">
            {score.left > score.right ? '蓝队获胜！' : score.right > score.left ? '红队获胜！' : '势均力敌！'}
          </p>
          <p className="text-slate-500 mb-5">最终比分 {score.left} : {score.right}</p>
          <button onClick={initGame} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold hover:from-indigo-600 hover:to-violet-600 transition-all">
            再来一局
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-500">
                {teamTurn === 'left' ? '🔵 蓝队作答' : '🔴 红队作答'} · 第 {index + 1}/{TOTAL} 题
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${timeLeft > 3 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600 animate-pulse'}`}>
                <Timer className="w-3.5 h-3.5" /> {timeLeft}s
              </span>
            </div>
            <div className="text-center mb-6">
              <p className="text-4xl font-extrabold text-slate-800 mb-2 tracking-wide">{words[index]?.word}</p>
              <p className="text-sm text-slate-400">{words[index]?.phonetic}</p>
              <button onClick={() => words[index] && speak(words[index].word)}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors">
                <Volume2 className="w-3.5 h-3.5" /> 朗读
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {options.map((opt, i) => {
                let cls = 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                if (answered) {
                  if (opt === correct) cls = 'bg-emerald-50 border-emerald-400 border-2'
                  else if (opt === wrongPick) cls = 'bg-rose-50 border-rose-400 border-2'
                  else cls = 'bg-slate-50 border-slate-200 opacity-50'
                }
                return (
                  <button key={i} onClick={() => handleAnswer(opt)} disabled={answered}
                    className={`${cls} border rounded-2xl p-4 text-sm font-medium text-slate-700 transition-all hover:shadow-md disabled:cursor-default`}>
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
          {answered && (
            <div className="mt-4 flex items-center justify-between">
              <p className={`text-sm font-bold ${correct ? 'text-emerald-600' : 'text-rose-500'}`}>
                {correct ? '✅ 答对啦！+1 分' : wrongPick ? `❌ 不对哦，正确答案是：${words[index]?.meaning}` : '⏰ 时间到！'}
              </p>
              <button onClick={next} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold hover:from-indigo-600 hover:to-violet-600 transition-all">
                {index + 1 >= words.length ? '查看结果' : '下一题 →'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
