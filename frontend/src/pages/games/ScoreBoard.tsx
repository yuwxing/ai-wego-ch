import { useState } from 'react'
import { Plus, Minus, RotateCcw, Trash2 } from 'lucide-react'

interface Team {
  id: number
  name: string
  score: number
  color: string
}

const COLORS = [
  { bg: 'from-sky-500 to-blue-600', dot: 'bg-sky-500' },
  { bg: 'from-rose-500 to-pink-600', dot: 'bg-rose-500' },
  { bg: 'from-emerald-500 to-teal-600', dot: 'bg-emerald-500' },
  { bg: 'from-amber-500 to-orange-600', dot: 'bg-amber-500' },
  { bg: 'from-violet-500 to-purple-600', dot: 'bg-violet-500' },
  { bg: 'from-cyan-500 to-sky-600', dot: 'bg-cyan-500' },
]

export default function ScoreBoard() {
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: '第一组', score: 0, color: COLORS[0].bg },
    { id: 2, name: '第二组', score: 0, color: COLORS[1].bg },
    { id: 3, name: '第三组', score: 0, color: COLORS[2].bg },
    { id: 4, name: '第四组', score: 0, color: COLORS[3].bg },
  ])
  const [newTeamName, setNewTeamName] = useState('')

  const changeScore = (id: number, delta: number) => {
    setTeams(ts => ts.map(t => t.id === id ? { ...t, score: Math.max(0, t.score + delta) } : t))
  }

  const rename = (id: number, name: string) => {
    setTeams(ts => ts.map(t => t.id === id ? { ...t, name } : t))
  }

  const addTeam = () => {
    const name = newTeamName.trim() || `第${teams.length + 1}组`
    setTeams(ts => [...ts, { id: Date.now(), name, score: 0, color: COLORS[teams.length % COLORS.length].bg }])
    setNewTeamName('')
  }

  const removeTeam = (id: number) => {
    setTeams(ts => ts.filter(t => t.id !== id))
  }

  const reset = () => {
    setTeams(ts => ts.map(t => ({ ...t, score: 0 })))
  }

  const sorted = [...teams].sort((a, b) => b.score - a.score)
  const leader = sorted.length > 0 && sorted[0].score > 0 ? sorted[0] : null

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">🏅 分组计分板</h2>
          <p className="text-xs text-slate-400 mt-1">点击 +/- 加减分，大屏展示班级 PK 战况</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={newTeamName}
            onChange={e => setNewTeamName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTeam()}
            placeholder="新增小组名"
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <button onClick={addTeam} className="px-3 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">添加</button>
          <button onClick={reset} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors">
            <RotateCcw className="w-4 h-4" /> 清零
          </button>
        </div>
      </div>

      {leader && (
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-center">
          <p className="text-sm font-bold text-amber-700">👑 目前领先：{leader.name}（{leader.score} 分）</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {teams.map(team => (
          <div key={team.id} className={`rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm bg-gradient-to-br ${team.color} p-5 text-white relative`}>
            <div className="flex items-center justify-between mb-4">
              <input
                value={team.name}
                onChange={e => rename(team.id, e.target.value)}
                className="bg-transparent text-lg font-bold focus:outline-none focus:bg-white/10 rounded px-2 py-1 border border-transparent focus:border-white/30"
                style={{ color: 'white' }}
              />
              <button onClick={() => removeTeam(team.id)}
                className="opacity-50 hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => changeScore(team.id, -10)}
                  className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center text-xl font-bold">
                  <Minus className="w-5 h-5" />
                </button>
                <button onClick={() => changeScore(team.id, 10)}
                  className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center text-xl font-bold">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center">
                <p className="text-5xl font-extrabold tabular-nums">{team.score}</p>
                <p className="text-xs opacity-80 mt-1">分</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
