import { useState, useEffect, useRef } from 'react'
import { Shuffle, UserX } from 'lucide-react'

const DEFAULT_NAMES = ['小明', '小红', '小刚', '小丽', '小华', '小芳', '小强', '小雪']

export default function RandomPicker() {
  const [names, setNames] = useState(DEFAULT_NAMES.join('、'))
  const [list, setList] = useState<string[]>(DEFAULT_NAMES)
  const [picked, setPicked] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [rolling, setRolling] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const applyList = () => {
    const arr = names.split(/[,，、\n\s]+/).filter(Boolean)
    if (arr.length > 0) {
      setList(arr)
      setPicked(null)
      setHistory([])
    }
  }

  useEffect(() => { applyList() }, [])
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const pick = () => {
    if (rolling) return
    const pool = list.filter(n => !history.includes(n) && n !== picked)
    if (pool.length === 0) {
      setHistory([])
      setPicked(null)
      return
    }
    setRolling(true)
    let count = 0
    intervalRef.current = setInterval(() => {
      setPicked(pool[Math.floor(Math.random() * pool.length)])
      count++
      if (count >= 18) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setRolling(false)
        const final = pool[Math.floor(Math.random() * pool.length)]
        setPicked(final)
        setHistory(h => [final, ...h].slice(0, 12))
      }
    }, 80)
  }

  const resetAll = () => {
    setPicked(null)
    setHistory([])
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-1">🎲 随机点名</h2>
      <p className="text-xs text-slate-400 mb-6">全班名单输入，一键随机点名，点过不重复</p>

      <div className="flex gap-2 mb-4">
        <input
          value={names}
          onChange={e => setNames(e.target.value)}
          placeholder="输入学生名单，用逗号或空格分隔"
          className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
        <button onClick={applyList}
          className="px-4 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors shrink-0">
          应用名单
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center mb-6 shadow-sm">
        <div className="min-h-[120px] flex flex-col items-center justify-center">
          {picked ? (
            <p className={`text-5xl font-extrabold break-all ${rolling ? 'text-sky-400' : 'text-sky-600 animate-bounce'}`}>{picked}</p>
          ) : (
            <p className="text-slate-300 text-lg">点击下方按钮开始点名</p>
          )}
        </div>
        <button onClick={pick} disabled={rolling || list.length === 0}
          className="mt-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-500 text-white text-lg font-bold shadow-lg shadow-sky-200 hover:from-sky-600 hover:to-blue-600 transition-all active:scale-95 disabled:opacity-50 inline-flex items-center gap-2">
          <Shuffle className="w-5 h-5" /> {rolling ? '转动中...' : '随机点名'}
        </button>
        <div className="mt-3">
          <button onClick={resetAll} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
            <UserX className="w-3.5 h-3.5" /> 清空已点记录
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-400 mb-2">已点名记录（本轮不重复）</p>
          <div className="flex flex-wrap gap-2">
            {history.map((n, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-medium">{n}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
