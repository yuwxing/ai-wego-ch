import { useState, useEffect, useRef } from 'react'
import { RefreshCw, Play } from 'lucide-react'
import { getRandomWords } from '../../utils/gameWords'

export default function LuckyWheel() {
  const [items, setItems] = useState<string[]>([])
  const [nItems, setNItems] = useState(6)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [customText, setCustomText] = useState('')
  const [mode, setMode] = useState<'words' | 'students'>('words')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotationRef = useRef(0)
  const resultRef = useRef<string | null>(null)
  const anglePerRef = useRef(0)

  const genItems = () => {
    if (mode === 'words') {
      const ws = getRandomWords(nItems)
      setItems(ws.map(w => w.word))
    } else {
      const names = customText.split(/[,，\n、\s]+/).filter(Boolean)
      const list = names.slice(0, 12)
      if (list.length === 0) list.push('第1组', '第2组', '第3组', '第4组', '第5组', '第6组')
      setItems(list)
    }
    setResult(null)
    resultRef.current = null
  }

  useEffect(() => {
    genItems()
  }, [mode, nItems])

  useEffect(() => {
    drawWheel(items, 0)
  }, [items])

  const drawWheel = (list: string[], rotation: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const size = canvas.width
    const cx = size / 2
    const r = size / 2 - 4
    ctx.clearRect(0, 0, size, size)
    ctx.save()
    ctx.translate(cx, cx)
    ctx.rotate(rotation)
    anglePerRef.current = list.length > 0 ? (2 * Math.PI) / list.length : 0
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#F97316', '#14B8A6', '#6366F1', '#EC4899', '#84CC16', '#0EA5E9']
    list.forEach((item, i) => {
      const start = i * anglePerRef.current
      const end = start + anglePerRef.current
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, r, start, end)
      ctx.closePath()
      ctx.fillStyle = colors[i % colors.length]
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'
      ctx.lineWidth = 2
      ctx.stroke()
      // label
      ctx.save()
      ctx.rotate(start + anglePerRef.current / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 12px sans-serif'
      const label = item.length > 6 ? item.slice(0, 6) + '…' : item
      ctx.fillText(label, r - 14, 4)
      ctx.restore()
    })
    ctx.restore()
    // center circle
    ctx.beginPath()
    ctx.arc(cx, cx, 28, 0, 2 * Math.PI)
    ctx.fillStyle = '#1E293B'
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 13px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('GO', cx, cx)
    // pointer at top
    ctx.beginPath()
    ctx.moveTo(cx - 12, 6)
    ctx.lineTo(cx + 12, 6)
    ctx.lineTo(cx, 24)
    ctx.closePath()
    ctx.fillStyle = '#EF4444'
    ctx.fill()
  }

  const spin = () => {
    if (spinning || items.length === 0) return
    setSpinning(true)
    setResult(null)
    resultRef.current = null
    const targetAngle = anglePerRef.current
    const target = Math.floor(Math.random() * items.length)
    const spins = 5 + Math.floor(Math.random() * 3)
    const totalRotation = spins * 2 * Math.PI + target * targetAngle
    const startRotation = rotationRef.current
    const targetRotation = startRotation - totalRotation
    const startTime = Date.now()
    const duration = 3000

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const rot = startRotation + (targetRotation - startRotation) * eased
      rotationRef.current = rot
      drawWheel(items, rot)
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setSpinning(false)
        resultRef.current = items[target]
        setResult(items[target])
      }
    }
    requestAnimationFrame(animate)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            🎡 幸运大转盘
          </h2>
          <p className="text-xs text-slate-400 mt-1">随机抽选单词或小组，课堂互动神器</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
          <button onClick={() => setMode('words')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'words' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
            抽单词
          </button>
          <button onClick={() => setMode('students')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'students' ? 'bg-sky-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
            抽小组/名单
          </button>
        </div>
        {mode === 'words' ? (
          <select value={nItems} onChange={e => setNItems(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
            {[4, 6, 8, 10, 12].map(n => <option key={n} value={n}>{n} 个</option>)}
          </select>
        ) : (
          <input
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            placeholder="输入名单，用逗号或空格分隔（如：小明 小红 小刚）"
            className="flex-1 min-w-[220px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
        )}
        <button onClick={() => { genItems(); }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> 换一批
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div className="relative mx-auto">
          <canvas ref={canvasRef} width={340} height={340} className="w-full max-w-[340px] drop-shadow-xl" />
        </div>
        <div className="text-center md:text-left">
          <button onClick={spin} disabled={spinning || items.length === 0}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-lg font-bold shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-teal-600 transition-all active:scale-95 disabled:opacity-50 inline-flex items-center gap-2">
            <Play className="w-5 h-5" /> {spinning ? '转动中...' : '开始转'}
          </button>
          {result && (
            <div className="mt-6">
              <p className="text-xs text-slate-400 mb-1">🎉 抽到了</p>
              <p className="text-3xl font-extrabold text-emerald-600 break-all">{result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
