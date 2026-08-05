import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

export default function ClassTimer() {
  const [minutes, setMinutes] = useState(3)
  const [seconds, setSeconds] = useState(0)
  const [total, setTotal] = useState(180)
  const [remaining, setRemaining] = useState(180)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            setRunning(false)
            try { new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgMAEA==').play() } catch {}
            return 0
          }
          return r - 1
        })
      }, 1000)
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }
  }, [running])

  const applyTotal = () => {
    const t = minutes * 60 + seconds
    setTotal(t)
    setRemaining(t)
    setRunning(false)
  }

  const presets = [60, 180, 300, 600]

  const mm = Math.floor(remaining / 60)
  const ss = remaining % 60
  const pct = total > 0 ? remaining / total : 0

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 text-center">
      <h2 className="text-xl font-bold text-slate-800 mb-1">⏱️ 课堂计时器</h2>
      <p className="text-xs text-slate-400 mb-6">大屏投屏使用，时间到自动响铃</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs text-slate-400 block mb-1">分钟</label>
          <input type="number" min={0} max={99} value={minutes}
            onChange={e => setMinutes(Math.max(0, Number(e.target.value)))}
            className="w-full text-center py-3 rounded-2xl border border-slate-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300" />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">秒</label>
          <input type="number" min={0} max={59} value={seconds}
            onChange={e => setSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
            className="w-full text-center py-3 rounded-2xl border border-slate-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300" />
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {presets.map(p => (
          <button key={p} onClick={() => { setMinutes(Math.floor(p / 60)); setSeconds(p % 60); setTotal(p); setRemaining(p); setRunning(false) }}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors">
            {p >= 60 ? `${p / 60}分钟` : `${p}秒`}
          </button>
        ))}
      </div>

      <div className="relative w-56 h-56 mx-auto mb-6">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          <circle cx="100" cy="100" r="88" fill="none" stroke="#E2E8F0" strokeWidth="14" />
          <circle cx="100" cy="100" r="88" fill="none"
            stroke={pct > 0.2 ? '#10B981' : '#EF4444'}
            strokeWidth="14" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 88}
            strokeDashoffset={2 * Math.PI * 88 * (1 - pct)}
            className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-extrabold tabular-nums ${pct > 0.2 ? 'text-slate-800' : 'text-rose-500'}`}>
            {String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}
          </span>
          {remaining === 0 && <span className="text-xs font-bold text-rose-500 mt-1 animate-pulse">⏰ 时间到！</span>}
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button onClick={() => { if (remaining === 0) return; setRunning(r => !r) }}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-teal-600 transition-all active:scale-95 inline-flex items-center gap-2 disabled:opacity-50"
          disabled={remaining === 0}>
          {running ? <><Pause className="w-5 h-5" /> 暂停</> : <><Play className="w-5 h-5" /> 开始</>}
        </button>
        <button onClick={() => { setRemaining(total); setRunning(false) }}
          className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all inline-flex items-center gap-2">
          <RotateCcw className="w-5 h-5" /> 重置
        </button>
        <button onClick={applyTotal}
          className="px-6 py-3 rounded-2xl border border-emerald-200 text-emerald-600 font-bold hover:bg-emerald-50 transition-all">
          应用设定
        </button>
      </div>
    </div>
  )
}
