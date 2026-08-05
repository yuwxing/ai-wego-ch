import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X } from 'lucide-react'

export default function MathVisualPage() {
  const navigate = useNavigate()
  const [a, setA] = useState(0)
  const [b, setB] = useState(0)
  const [mode, setMode] = useState<'add' | 'multiply' | null>(null)

  const count = mode === 'add' ? a + b : mode === 'multiply' ? a * b : 0
  const cols = mode === 'multiply' ? Math.max(b, 1) : 10
  const rows = mode === 'multiply' ? Math.ceil(count / cols) : Math.ceil(count / cols)

  return (
    <div className="page-wrapper">
      <div className="max-w-3xl mx-auto px-4 py-8 relative z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm mb-3">
            数形结合
          </div>
          <h1 className="text-3xl font-bold text-slate-800">数形结合学数学</h1>
          <p className="text-slate-500 mt-1">输入数字，用图形直观感受加减乘除</p>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">数字 A</label>
              <input type="number" value={a || ''} onChange={e => setA(Number(e.target.value))}
                placeholder="输入数字" min={0} max={50}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">数字 B</label>
              <input type="number" value={b || ''} onChange={e => setB(Number(e.target.value))}
                placeholder="输入数字" min={0} max={50}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setMode('add')}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${mode === 'add' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <Plus className="w-4 h-4 inline mr-1" />加法可视化
            </button>
            <button onClick={() => setMode('multiply')}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${mode === 'multiply' ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <X className="w-4 h-4 inline mr-1" />乘法可视化
            </button>
          </div>
        </div>

        {mode && (
          <div className="glass-card rounded-2xl p-6">
            <div className="text-center mb-4">
              <span className="text-lg font-bold text-slate-700">
                {a} {mode === 'add' ? '+' : '×'} {b}
                <span className="text-purple-500"> = {count}</span>
              </span>
            </div>

            {count > 200 ? (
              <div className="text-center py-8 text-slate-400">
                数字太大，换个小的试试 (≤ 200)
              </div>
            ) : count === 0 ? (
              <div className="text-center py-8 text-slate-400">
                输入数字开始吧
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 justify-center" style={{ maxWidth: `${cols * 36}px`, margin: '0 auto' }}>
                {mode === 'multiply' && b > 0
                  ? Array.from({ length: a }, (_, row) =>
                      Array.from({ length: b }, (_, col) => (
                        <div key={`${row}-${col}`}
                          className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-400 to-pink-400 shadow-sm transition-transform hover:scale-110" />
                      ))
                    ).flat()
                  : Array.from({ length: count }, (_, i) => (
                      <div key={i}
                        className="w-7 h-7 rounded-md bg-gradient-to-br from-green-400 to-emerald-400 shadow-sm transition-transform hover:scale-110" />
                    ))
                }
              </div>
            )}

            {mode === 'multiply' && count > 0 && count <= 200 && (
              <div className="mt-4 text-center text-xs text-slate-400">
                {a} 行 × {b} 列 = {count} 个方格
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
