import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'

type GameMode =
  | 'hub'
  | 'memory' | 'aim' | 'schulte' | 'chimp'
  | 'logic' | 'trail' | 'mot' | 'isometric' | 'musicbox'
  | 'seqreason' | 'mathspeed'

function shuffleArr<T>(a: T[]): T[] {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]]
  }
  return b
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
  playTone(523, 0.1, 'sine')
  setTimeout(() => playTone(659, 0.15, 'sine'), 80)
}

function playWrong() {
  playTone(200, 0.2, 'square')
}

const GAMES = [
  // Original 4
  { id: 'memory' as GameMode, emoji: '🧠', title: '瞬间记忆', desc: '记住亮起的方格位置，然后复现出来', color: '#7c3aed' },
  { id: 'aim' as GameMode, emoji: '🎯', title: '瞄准练习', desc: '点击随机出现的目标，测试手眼协调', color: '#ef4444' },
  { id: 'schulte' as GameMode, emoji: '🔢', title: '舒尔特方格', desc: '按顺序点击数字，训练注意力与视觉广度', color: '#f59e0b' },
  { id: 'chimp' as GameMode, emoji: '🐒', title: '黑猩猩测试', desc: '记住数字的位置，按顺序点出来', color: '#10b981' },
  // New 7 (5 + 2 moved from community)
  { id: 'logic' as GameMode, emoji: '🧩', title: '逻辑思维测试', desc: '观察规律，找出下一个图形', color: '#8b5cf6' },
  { id: 'trail' as GameMode, emoji: '📎', title: '连线测试', desc: '按顺序快速点击所有节点', color: '#ec4899' },
  { id: 'mot' as GameMode, emoji: '🎱', title: '多目标追踪', desc: '记住目标球，在运动中持续追踪', color: '#14b8a6' },
  { id: 'isometric' as GameMode, emoji: '🏗️', title: '等距小世界', desc: '在无限画布上搭建等距迷你城市', color: '#6366f1' },
  { id: 'musicbox' as GameMode, emoji: '🎵', title: '音乐盒', desc: '网格作曲 · 五声音阶步进音序器', color: '#e11d48' },
  { id: 'seqreason' as GameMode, emoji: '🔢', title: '序列推理', desc: '观察数列规律，推断下一个元素', color: '#a855f7' },
  { id: 'mathspeed' as GameMode, emoji: '🧮', title: '数学速算', desc: '60秒算术挑战，难度逐级递增', color: '#06b6d4' },
]

/* ========== Existing Games (memory, aim, schulte, chimp) ========== */

const MEMORY_LEVELS = [
  { grid: 4, cells: 4, label: '简单 4×4' },
  { grid: 5, cells: 5, label: '普通 5×5' },
  { grid: 6, cells: 6, label: '困难 6×6' },
  { grid: 6, cells: 8, label: '挑战 6×6' },
]

function MemoryGame({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(0)
  const [phase, setPhase] = useState<'show' | 'recall' | 'result'>('show')
  const [targets, setTargets] = useState<number[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const cfg = MEMORY_LEVELS[Math.min(level, MEMORY_LEVELS.length - 1)]
  const totalCells = cfg.grid * cfg.grid

  const [clicked, setClicked] = useState<Record<number, 'hit' | 'miss'>>({})

  const initRound = useCallback(() => {
    const all = shuffleArr(Array.from({ length: totalCells }, (_, i) => i)).slice(0, cfg.cells)
    setTargets(all)
    setSelected([])
    setClicked({})
    setPhase('show')
    setTimeout(() => setPhase('recall'), 1500)
  }, [cfg])

  useEffect(() => { initRound() }, [level, initRound])

  const handleClick = (idx: number) => {
    if (phase !== 'recall' || selected.includes(idx)) return
    const hit = targets.includes(idx)
    setClicked(prev => ({ ...prev, [idx]: hit ? 'hit' : 'miss' }))
    if (!hit) playWrong()
    const next = [...selected, idx]
    setSelected(next)
    if (next.length === cfg.cells) {
      const correct = next.filter(i => targets.includes(i)).length
      setTotal(t => t + cfg.cells)
      setScore(s => s + correct)
      if (correct / cfg.cells >= 0.8) playCorrect()
      setPhase('result')
    } else if (hit) {
      playCorrect()
    }
  }

  return (
    <GameLayout title="瞬间记忆" onBack={onBack}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <span style={{ color: '#94a3b8', fontSize: 12 }}>{cfg.label} · 记忆 {cfg.cells} 格</span>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>正确 {score}/{total}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cfg.grid}, 1fr)`, gap: 4, width: '100%', maxWidth: 340, margin: '0 auto' }}>
        {Array.from({ length: totalCells }, (_, i) => {
          const isTarget = phase === 'show' && targets.includes(i)
          const isCorrectTarget = phase === 'result' && targets.includes(i) && selected.includes(i)
          const isMissed = phase === 'result' && targets.includes(i) && !selected.includes(i)
          const isWrong = phase === 'result' && !targets.includes(i) && selected.includes(i)
          const clickState = phase === 'recall' ? clicked[i] : undefined
          let bg = '#f1f5f9'
          if (isTarget) bg = '#7c3aed'
          if (isCorrectTarget) bg = '#22c55e'
          if (isMissed) bg = '#f97316'
          if (isWrong) bg = '#ef4444'
          if (clickState === 'hit') bg = '#22c55e'
          if (clickState === 'miss') bg = '#ef4444'
          return (
            <div key={i} onClick={() => handleClick(i)}
              style={{ aspectRatio: '1', background: bg, borderRadius: 8, cursor: phase === 'recall' ? 'pointer' : 'default', transition: 'all 0.2s' }} />
          )
        })}
      </div>
      {phase === 'result' && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => setLevel(l => l + 1)}
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', border: 'none', color: 'white', padding: '10px 28px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: '"Noto Serif SC", serif' }}>下一关 →</button>
        </div>
      )}
    </GameLayout>
  )
}

type AimMode = 'multi' | 'single' | 'survival'
type AimDifficulty = 'easy' | 'standard' | 'hard'
const AIM_MODES: { id: AimMode; label: string; desc: string }[] = [
  { id: 'multi', label: '多目标', desc: '同时出现多个目标' },
  { id: 'single', label: '单目标', desc: '一次只出现一个' },
  { id: 'survival', label: '生存', desc: '漏掉即扣生命' },
]
const AIM_DIFFICULTY: { id: AimDifficulty; label: string }[] = [
  { id: 'easy', label: '简单' },
  { id: 'standard', label: '标准' },
  { id: 'hard', label: '困难' },
]
const AIM_TIMES = [10, 30, 60, 90]
const DIFF_CONFIG: Record<AimDifficulty, { size: number; spawnInterval: number }> = {
  easy: { size: 58, spawnInterval: 900 },
  standard: { size: 44, spawnInterval: 700 },
  hard: { size: 32, spawnInterval: 500 },
}

function AimGame({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<AimMode>('multi')
  const [diff, setDiff] = useState<AimDifficulty>('standard')
  const [duration, setDuration] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [targets, setTargets] = useState<{ x: number; y: number; id: number }[]>([])
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)
  const spawnTimer = useRef<number>(0)
  const cfg = DIFF_CONFIG[diff]

  // Countdown timer
  useEffect(() => {
    if (!playing || timeLeft <= 0) return
    const t = setInterval(() => setTimeLeft(v => v - 1), 1000)
    return () => clearInterval(t)
  }, [playing, timeLeft])

  useEffect(() => {
    if (!playing || timeLeft <= 0) return () => clearTimeout(spawnTimer.current)
    const maxX = (containerRef.current?.clientWidth || 340) - cfg.size
    const maxY = (containerRef.current?.clientHeight || 340) - cfg.size
    const scheduleSpawn = () => {
      if (mode === 'single') {
        setTargets([{ x: Math.max(0, Math.random() * maxX), y: Math.max(0, Math.random() * maxY), id: idRef.current++ }])
      } else {
        const count = diff === 'easy' ? 3 : diff === 'standard' ? 2 : 5
        const newTargets = Array.from({ length: count }, () => ({
          x: Math.max(0, Math.random() * maxX), y: Math.max(0, Math.random() * maxY), id: idRef.current++,
        }))
        setTargets(diff === 'hard' ? newTargets : prev => [...prev, ...newTargets])
      }
      if (mode === 'survival') {
        spawnTimer.current = window.setTimeout(scheduleSpawn, cfg.spawnInterval)
      } else {
        spawnTimer.current = window.setTimeout(scheduleSpawn, cfg.spawnInterval)
      }
    }
    scheduleSpawn()
    return () => clearTimeout(spawnTimer.current)
  }, [playing, timeLeft, mode, diff, cfg])

  const start = () => {
    setPlaying(true); setHits(0); setMisses(0); setLives(3); setTimeLeft(duration)
    setTargets([]); idRef.current = 0
  }

  const handleHit = (id: number) => {
    if (!playing) return
    playCorrect()
    setHits(h => h + 1)
    if (mode === 'single') setTargets([])
    else setTargets(prev => prev.filter(t => t.id !== id))
  }

  const handleMiss = () => {
    if (!playing) return
    if (mode === 'survival') {
      setLives(l => { if (l <= 1) { setPlaying(false); return 0 }; return l - 1 })
      playWrong()
    } else {
      setMisses(m => m + 1)
    }
  }

  const endGame = timeLeft <= 0 || lives <= 0
  const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0

  if (!playing || endGame) {
    return (
      <GameLayout title="瞄准练习" onBack={onBack}>
        <div className="px-4 py-6 text-center">
          {/* Mode selector */}
          <div className="flex gap-2 justify-center mb-4">
            {AIM_MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className="flex-1 max-w-28 px-3 py-2 rounded-xl border text-sm transition-all"
                style={{
                  background: mode === m.id ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                  borderColor: mode === m.id ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                  color: mode === m.id ? '#c4b5fd' : '#94a3b8',
                }}>
                <div className="font-bold">{m.label}</div>
                <div className="text-[10px] opacity-60">{m.desc}</div>
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <div className="flex gap-2 justify-center mb-4">
            {AIM_DIFFICULTY.map(d => (
              <button key={d.id} onClick={() => setDiff(d.id)}
                className="px-4 py-1.5 rounded-lg border text-xs transition-all"
                style={{
                  background: diff === d.id ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
                  borderColor: diff === d.id ? '#8b5cf6' : 'rgba(255,255,255,0.08)',
                  color: diff === d.id ? '#c4b5fd' : '#64748b',
                }}>
                {d.label}
              </button>
            ))}
          </div>

          {/* Duration */}
          <div className="flex gap-2 justify-center mb-5">
            {AIM_TIMES.map(t => (
              <button key={t} onClick={() => setDuration(t)}
                className="w-14 py-1.5 rounded-lg border text-sm font-mono transition-all"
                style={{
                  background: duration === t ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
                  borderColor: duration === t ? '#8b5cf6' : 'rgba(255,255,255,0.08)',
                  color: duration === t ? '#c4b5fd' : '#64748b',
                }}>
                {t}s
              </button>
            ))}
          </div>

          {endGame && (
            <div className="mb-4">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-xl font-bold text-slate-100">{hits} 次命中</div>
              <div className="text-xs text-slate-500 mt-1">命中率 {accuracy}%</div>
              {mode === 'survival' && lives <= 0 && (
                <div className="text-xs text-rose-400 mt-1">生命耗尽！</div>
              )}
            </div>
          )}

          <button onClick={start}
            className="w-full max-w-xs mx-auto py-3 rounded-xl text-sm font-bold transition-all border"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              border: 'none', color: 'white',
              boxShadow: '0 0 16px rgba(139,92,246,0.3)',
            }}>
            {endGame ? '再来一次' : '开始挑战'}
          </button>
        </div>
      </GameLayout>
    )
  }

  return (
    <GameLayout title="瞄准练习" onBack={onBack}>
      <div className="px-2">
        {/* HUD */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>命中 <strong className="text-emerald-400">{hits}</strong></span>
          <span>
            {mode === 'survival' ? (
              <span className="text-rose-400">{'❤️'.repeat(lives)}</span>
            ) : (
              <span>失误 <strong className="text-rose-400">{misses}</strong></span>
            )}
          </span>
          <span>剩余 <strong className={timeLeft <= 5 ? 'text-rose-400' : 'text-slate-300'}>{timeLeft}s</strong></span>
        </div>
        {/* Target area */}
        <div ref={containerRef} onClick={handleMiss}
          className="relative mx-auto overflow-hidden rounded-xl border"
          style={{
            width: '100%', maxWidth: 400, height: 380,
            background: 'radial-gradient(ellipse at center, rgba(30,27,75,0.6), rgba(15,23,42,0.9))',
            borderColor: 'rgba(139,92,246,0.15)',
            cursor: 'crosshair',
          }}>
          {targets.map(t => (
            <div key={t.id} onClick={e => { e.stopPropagation(); handleHit(t.id) }}
              className="absolute rounded-full transition-all duration-75"
              style={{
                left: t.x, top: t.y,
                width: cfg.size, height: cfg.size,
                background: 'radial-gradient(circle at 35% 35%, #c4b5fd, #8b5cf6 50%, #7c3aed)',
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(139,92,246,0.5), inset 0 -2px 4px rgba(0,0,0,0.2)',
              }} />
          ))}
        </div>
      </div>
    </GameLayout>
  )
}

const SCHULTE_SIZES = [{ grid: 3, label: '3×3' }, { grid: 4, label: '4×4' }, { grid: 5, label: '5×5' }, { grid: 6, label: '6×6' }]

function SchulteGame({ onBack }: { onBack: () => void }) {
  const [size, setSize] = useState(2); const cfg = SCHULTE_SIZES[size]
  const [nums, setNums] = useState<number[]>([]); const [next, setNext] = useState(1)
  const [startTime, setStartTime] = useState(0); const [elapsed, setElapsed] = useState(0); const [finished, setFinished] = useState(false); const [started, setStarted] = useState(false)
  const init = () => { const total = cfg.grid * cfg.grid; setNums(shuffleArr(Array.from({ length: total }, (_, i) => i + 1))); setNext(1); setFinished(false); setElapsed(0); setStarted(false) }
  useEffect(() => { init() }, [size])
  useEffect(() => { if (!started || finished) return; const id = setInterval(() => setElapsed(Date.now() - startTime), 100); return () => clearInterval(id) }, [started, finished, startTime])

  const handleClick = (n: number) => {
    if (!started) { setStarted(true); setStartTime(Date.now()) }
    if (n !== next) { playWrong(); return }
    playCorrect()
    if (n === cfg.grid * cfg.grid) { setFinished(true); setElapsed(Date.now() - startTime) }
    else setNext(n + 1)
  }

  return (
    <GameLayout title="舒尔特方格" onBack={onBack}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
          {SCHULTE_SIZES.map((s, i) => (
            <button key={i} onClick={() => setSize(i)} style={{ background: i === size ? '#fef3c7' : 'white', border: `1px solid ${i === size ? '#f59e0b' : '#e2e8f0'}`, color: i === size ? '#f59e0b' : '#64748b', padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontFamily: '"Noto Serif SC", serif' }}>{s.label}</button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>{finished ? `完成！用时 ${(elapsed / 1000).toFixed(1)}s` : started ? `用时 ${(elapsed / 1000).toFixed(1)}s · 下一个: ${next}` : '点击任意数字开始'}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cfg.grid}, 1fr)`, gap: 4, width: '100%', maxWidth: 340, margin: '0 auto' }}>
        {nums.map((n, i) => {
          const done = n < next
          return (
            <div key={i} onClick={() => { if (!done) handleClick(n) }} style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? '#f0fdf4' : n === next ? '#fef3c7' : 'white', borderRadius: 8, cursor: done ? 'default' : 'pointer', fontSize: cfg.grid <= 4 ? 20 : 16, fontWeight: 600, color: done ? '#16a34a' : n === next ? '#f59e0b' : '#1e293b', border: n === next ? '2px solid #f59e0b' : '2px solid transparent', transition: 'all 0.15s' }}>{n}</div>
          )
        })}
      </div>
      {finished && <div style={{ textAlign: 'center', marginTop: 16 }}><button onClick={init} style={{ background: 'linear-gradient(135deg, #f59e0b, #eab308)', border: 'none', color: '#0a0a1a', padding: '10px 28px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: '"Noto Serif SC", serif' }}>再来一次</button></div>}
    </GameLayout>
  )
}

function ChimpGame({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1); const [phase, setPhase] = useState<'show' | 'recall' | 'result'>('show')
  const [positions, setPositions] = useState<{ x: number; y: number; n: number }[]>([]); const [clicked, setClicked] = useState<number[]>([]); const [errors, setErrors] = useState(0)
  const cellW = 340; const cellH = 340; const margin = 20

  const init = useCallback(() => {
    const count = Math.min(level + 2, 12); const placed: { x: number; y: number; n: number }[] = []
    for (let i = 0; i < count; i++) {
      let x: number, y: number, ok: boolean
      do { x = margin + Math.random() * (cellW - margin * 2 - 44); y = margin + Math.random() * (cellH - margin * 2 - 44); ok = placed.every(p => Math.abs(p.x - x) > 40 || Math.abs(p.y - y) > 40) } while (!ok)
      placed.push({ x, y, n: i + 1 })
    }
    setPositions(placed); setClicked([]); setPhase('show'); setTimeout(() => setPhase('recall'), 1000 + count * 150)
  }, [level])
  useEffect(() => { init() }, [level, init])

  const handleClick = (n: number) => {
    if (phase !== 'recall') return
    if (n === clicked.length + 1) { playCorrect(); const next = [...clicked, n]; setClicked(next); if (next.length === positions.length) setPhase('result') }
    else { playWrong(); setErrors(e => e + 1); setPhase('result') }
  }

  return (
    <GameLayout title="黑猩猩测试" onBack={onBack}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}><span style={{ color: '#94a3b8', fontSize: 12 }}>第 {level} 关 · {Math.min(level + 2, 12)} 个数字</span>{errors > 0 && <span style={{ color: '#ef4444', fontSize: 12, marginLeft: 12 }}>错误 {errors} 次</span>}</div>
      <div style={{ width: '100%', maxWidth: cellW, height: cellH, margin: '0 auto', position: 'relative', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        {positions.map((p, i) => {
          const shown = phase === 'show'; const done = clicked.includes(p.n); const failed = phase === 'result' && !done
          let bg = 'rgba(16,185,129,0.2)'; if (shown) bg = 'rgba(16,185,129,0.8)'; if (done) bg = 'rgba(34,197,94,0.3)'; if (failed) bg = 'rgba(239,68,68,0.3)'
          return (
            <div key={i} onClick={() => handleClick(p.n)} style={{ position: 'absolute', left: p.x, top: p.y, width: 44, height: 44, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: phase === 'recall' && !done ? 'pointer' : 'default', fontSize: 16, fontWeight: 700, color: shown ? 'white' : done ? '#4ade80' : failed ? '#ef4444' : '#e0d8c8', border: done ? '2px solid #22c55e' : '2px solid transparent', transition: 'all 0.2s' }}>
              {shown ? p.n : done ? '✓' : ''}
            </div>
          )
        })}
      </div>
      {phase === 'result' && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          {clicked.length === positions.length
            ? <button onClick={() => setLevel(l => l + 1)} style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', border: 'none', color: 'white', padding: '10px 28px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: '"Noto Serif SC", serif' }}>下一关 →</button>
            : <div><div style={{ color: '#ef4444', fontSize: 13, marginBottom: 8 }}>点错了！</div><button onClick={() => { setLevel(1); init() }} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#e0d8c8', padding: '10px 28px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: '"Noto Serif SC", serif' }}>重新开始</button></div>}
        </div>
      )}
    </GameLayout>
  )
}

/* ========== 6. 逻辑思维测试 ========== */
const LOGIC_QUESTIONS = [
  { seq: ['●', '○', '●', '○'], choices: ['●', '○', '◐', '◑'], answer: 1 },
  { seq: ['△', '△', '□', '□'], choices: ['○', '□', '△', '☆'], answer: 1 },
  { seq: ['1', '2', '3', '4'], choices: ['3', '5', '6', '7'], answer: 1 },
  { seq: ['○', '◐', '●', '◑'], choices: ['○', '◐', '●', '◑'], answer: 0 },
  { seq: ['⬆', '➡', '⬇', '⬅'], choices: ['⬆', '➡', '⬇', '⬅'], answer: 0 },
  { seq: ['★', '★★', '★', '★★'], choices: ['★', '★★', '★★★', '★★★★'], answer: 1 },
  { seq: ['□', '△', '□', '△'], choices: ['○', '☆', '□', '△'], answer: 3 },
  { seq: ['1', '1', '2', '3'], choices: ['3', '4', '5', '6'], answer: 2 },
  { seq: ['●', '◑', '○', '◐'], choices: ['●', '◑', '○', '◐'], answer: 0 },
  { seq: ['A', 'B', 'C', 'D'], choices: ['D', 'E', 'F', 'G'], answer: 1 },
]

function LogicGame({ onBack }: { onBack: () => void }) {
  const [qIdx, setQIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [feedback, setFeedback] = useState<boolean | null>(null)

  const handleChoice = (idx: number) => {
    const correct = idx === LOGIC_QUESTIONS[qIdx].answer
    setFeedback(correct)
    if (correct) { playCorrect(); setScore(s => s + 1) } else playWrong()
    setTimeout(() => {
      setFeedback(null)
      if (qIdx + 1 >= LOGIC_QUESTIONS.length) setFinished(true)
      else setQIdx(i => i + 1)
    }, 600)
  }

  if (finished) {
    return (
      <GameLayout title="逻辑思维测试" onBack={onBack}>
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🧩</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{score}/{LOGIC_QUESTIONS.length}</div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>正确率 {Math.round((score / LOGIC_QUESTIONS.length) * 100)}%</div>
          <button onClick={() => { setQIdx(0); setScore(0); setFinished(false) }} style={{ marginTop: 20, background: 'linear-gradient(135deg, #8b5cf6, #a855f7)', border: 'none', color: 'white', padding: '10px 28px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: '"Noto Serif SC", serif' }}>再来一次</button>
        </div>
      </GameLayout>
    )
  }

  const q = LOGIC_QUESTIONS[qIdx]
  return (
    <GameLayout title="逻辑思维测试" onBack={onBack}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}><span style={{ color: '#94a3b8', fontSize: 12 }}>第 {qIdx + 1}/{LOGIC_QUESTIONS.length} 题</span></div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', fontSize: 32, marginBottom: 24, padding: '20px', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', color: '#1e293b' }}>
        {q.seq.map((s, i) => <span key={i} style={{ opacity: 0.7 }}>{s}</span>)}
        <span style={{ fontWeight: 700, color: '#8b5cf6' }}>?</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 300, margin: '0 auto' }}>
        {q.choices.map((c, i) => (
          <button key={i} onClick={() => handleChoice(i)} disabled={feedback !== null}
            style={{
              fontSize: 28, padding: '16px', borderRadius: 12, cursor: feedback !== null ? 'default' : 'pointer',
              border: feedback === null ? '1px solid #e2e8f0' : i === q.answer ? '2px solid #22c55e' : '2px solid #ef4444',
              background: feedback === null ? 'white' : i === q.answer ? '#f0fdf4' : '#fef2f2',
              color: '#1e293b', transition: 'all 0.2s',
            }}>{c}</button>
        ))}
      </div>
    </GameLayout>
  )
}

/* ========== 7. 连线测试 ========== */
function TrailGame({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<'A' | 'B'>('A')
  const [points, setPoints] = useState<{ x: number; y: number; label: string; order: number }[]>([])
  const [next, setNext] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [finished, setFinished] = useState(false)
  const [started, setStarted] = useState(false)
  const containerSize = 340
  const margin = 30

  const init = useCallback(() => {
    const count = 25
    const newPoints: { x: number; y: number; label: string; order: number }[] = []
    for (let i = 0; i < count; i++) {
      let x: number, y: number, ok: boolean
      do { x = margin + Math.random() * (containerSize - margin * 2); y = margin + Math.random() * (containerSize - margin * 2); ok = newPoints.every(p => Math.hypot(p.x - x, p.y - y) > 28) } while (!ok)
      newPoints.push({ x, y, label: mode === 'A' ? `${i + 1}` : i % 2 === 0 ? `${Math.floor(i / 2) + 1}` : String.fromCharCode(65 + Math.floor(i / 2)), order: i })
    }
    setPoints(newPoints); setNext(0); setFinished(false); setElapsed(0); setStarted(false)
  }, [mode])

  useEffect(() => { init() }, [init])

  useEffect(() => {
    if (!started || finished) return
    const id = setInterval(() => setElapsed(Date.now() - startTime), 100)
    return () => clearInterval(id)
  }, [started, finished, startTime])

  const handleClick = (order: number) => {
    if (order !== next) { playWrong(); return }
    if (!started) { setStarted(true); setStartTime(Date.now()) }
    playCorrect()
    if (next === 24) { setFinished(true); setElapsed(Date.now() - startTime) }
    else setNext(n => n + 1)
  }

  return (
    <GameLayout title="连线测试" onBack={onBack}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 6 }}>
          {(['A', 'B'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} disabled={started}
              style={{
                background: m === mode ? '#fdf2f8' : 'white', border: `1px solid ${m === mode ? '#ec4899' : '#e2e8f0'}`,
                color: m === mode ? '#ec4899' : '#64748b', padding: '4px 14px', borderRadius: 6, cursor: started ? 'not-allowed' : 'pointer', fontSize: 11, fontFamily: '"Noto Serif SC", serif',
              }}>{m} 模式</button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>{finished ? `完成！${(elapsed / 1000).toFixed(1)}s` : started ? `用时 ${(elapsed / 1000).toFixed(1)}s · 下一个: ${next + 1}` : '点击第一个节点开始'}</div>
      </div>
      <div style={{ width: containerSize, height: containerSize, margin: '0 auto', position: 'relative', background: '#fdf2f8', borderRadius: 12, border: '1px solid #fce7f3' }}>
        {(() => {
          const conn = points.filter(p => p.order < next).sort((a, b) => a.order - b.order)
          return conn.length > 1 ? conn.slice(1).map((p, i) => {
            const x1 = conn[i].x, y1 = conn[i].y, x2 = p.x, y2 = p.y
            const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy)
            return (
              <div key={'l' + i} style={{
                position: 'absolute', left: x1, top: y1, width: len, height: 3,
                background: '#ec4899', borderRadius: 1.5, zIndex: 0, pointerEvents: 'none',
                transformOrigin: '0 0',
                transform: `rotate(${Math.atan2(dy, dx)}rad)`,
              }} />
            )
          }) : null
        })()}
        {next > 0 && next < 25 && !finished && (() => {
          const last = points.find(p => p.order === next - 1)
          const target = points.find(p => p.order === next)
          if (last && target) {
            const dx = target.x - last.x, dy = target.y - last.y, len = Math.hypot(dx, dy)
            return (
              <div style={{
                position: 'absolute', left: last.x, top: last.y, width: len, height: 0,
                zIndex: 0, pointerEvents: 'none',
                borderTop: '2px dashed #f472b6',
                transformOrigin: '0 0',
                transform: `rotate(${Math.atan2(dy, dx)}rad)`,
              }} />
            )
          }
          return null
        })()}
        {points.map((p, i) => {
          const done = p.order < next
          const current = p.order === next
          return (
            <div key={i} onClick={() => { if (!finished) handleClick(p.order) }} style={{
              position: 'absolute', left: p.x - 14, top: p.y - 14, width: 28, height: 28, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: done ? '#fbcfe8' : current ? '#ec4899' : '#fce7f3',
              color: done ? '#ec4899' : current ? 'white' : '#db2777',
              fontSize: 10, fontWeight: 700, cursor: current ? 'pointer' : 'default',
              border: current ? '2px solid #be185d' : '2px solid transparent',
              transition: 'all 0.15s', boxShadow: done ? 'none' : current ? '0 0 8px rgba(236,72,153,0.4)' : 'none',
              zIndex: 1,
            }}>{p.label}</div>
          )
        })}
        {finished && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(253,242,248,0.9)', zIndex: 2, borderRadius: 12 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📎</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#ec4899' }}>{(elapsed / 1000).toFixed(1)}s</div>
            <button onClick={init} style={{ marginTop: 16, background: 'linear-gradient(135deg, #ec4899, #f472b6)', border: 'none', color: 'white', padding: '10px 28px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: '"Noto Serif SC", serif' }}>再来一次</button>
          </div>
        )}
      </div>
    </GameLayout>
  )
}

/* ========== 8. 多目标追踪测试 ========== */
function MOTGame({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'show' | 'move' | 'select' | 'result'>('idle')
  const [balls, setBalls] = useState<{ x: number; y: number; vx: number; vy: number; isTarget: boolean; id: number }[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [finished, setFinished] = useState(false)
  const animRef = useRef<number>(0)
  const ballRef = useRef<{ x: number; y: number; vx: number; vy: number; isTarget: boolean; id: number }[]>([])
  const size = 320
  const R = 18

  const startGame = () => {
    const count = 8 + round * 1
    const targetCount = Math.min(3 + Math.floor(round / 2), 5)
    const newBalls: typeof ballRef.current = []
    for (let i = 0; i < count; i++) {
      let x: number, y: number, ok: boolean
      do { x = R + Math.random() * (size - R * 2); y = R + Math.random() * (size - R * 2); ok = newBalls.every(b => Math.hypot(b.x - x, b.y - y) > R * 2.5) } while (!ok)
      newBalls.push({ x, y, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, isTarget: i < targetCount, id: i })
    }
    // Shuffle target positions
    const idx = shuffleArr(Array.from({ length: count }, (_, i) => i)).slice(0, targetCount)
    newBalls.forEach((b, i) => b.isTarget = idx.includes(i))
    ballRef.current = newBalls
    setBalls([...newBalls])
    setSelected([])
    setPhase('show')
    setTimeout(() => {
      setPhase('move')
      const loop = () => {
        const bs = ballRef.current
        for (const b of bs) {
          b.x += b.vx; b.y += b.vy
          if (b.x < R || b.x > size - R) b.vx *= -1
          if (b.y < R || b.y > size - R) b.vy *= -1
          b.x = Math.max(R, Math.min(size - R, b.x))
          b.y = Math.max(R, Math.min(size - R, b.y))
        }
        setBalls([...bs])
        animRef.current = requestAnimationFrame(loop)
      }
      animRef.current = requestAnimationFrame(loop)
      setTimeout(() => {
        cancelAnimationFrame(animRef.current)
        setPhase('select')
      }, 4000 + round * 500)
    }, 2000)
  }

  const handleSelect = (id: number) => {
    if (phase !== 'select') return
    setSelected(prev => prev.includes(id) ? prev : [...prev, id])
  }

  const submitSelection = () => {
    const correct = selected.filter(id => ballRef.current.find(b => b.id === id)?.isTarget).length
    const totalTargets = ballRef.current.filter(b => b.isTarget).length
    setScore(s => s + correct)
    setTotal(t => t + totalTargets)
    if (correct >= 2) {
      playCorrect()
      setRound(r => r + 1)
      setPhase('idle')
    } else {
      playWrong()
      setFinished(true)
    }
  }

  useEffect(() => { return () => cancelAnimationFrame(animRef.current) }, [])

  if (finished) {
    return (
      <GameLayout title="多目标追踪" onBack={onBack}>
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎱</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#14b8a6', marginBottom: 4 }}>{score}/{total}</div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>存活 {round} 轮 · 正确率 {total > 0 ? Math.round((score / total) * 100) : 0}%</div>
          <button onClick={() => { setRound(0); setScore(0); setTotal(0); setFinished(false); setPhase('idle') }} style={{ marginTop: 20, background: 'linear-gradient(135deg, #14b8a6, #2dd4bf)', border: 'none', color: 'white', padding: '10px 28px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: '"Noto Serif SC", serif' }}>再来一次</button>
        </div>
      </GameLayout>
    )
  }

  return (
    <GameLayout title="多目标追踪" onBack={onBack}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{ color: '#94a3b8', fontSize: 12 }}>第 {round + 1} 轮 · 追踪 {ballRef.current.filter(b => b.isTarget).length || 3} 个目标</span>
        {score > 0 && <span style={{ color: '#14b8a6', fontSize: 12, marginLeft: 12 }}>得分 {score}/{total}</span>}
      </div>
      <div style={{ width: size, height: size, margin: '0 auto', position: 'relative', background: '#f0fdfa', borderRadius: 12, border: '1px solid #ccfbf1' }}>
        {balls.map(b => {
          const isTargetHighlight = phase === 'show' && b.isTarget
          const isSelected = selected.includes(b.id)
          return (
            <div key={b.id} onClick={() => handleSelect(b.id)} style={{
              position: 'absolute', left: b.x - R, top: b.y - R, width: R * 2, height: R * 2, borderRadius: '50%',
              background: isTargetHighlight ? 'radial-gradient(circle, #fbbf24, #f59e0b)' : isSelected ? 'radial-gradient(circle, #14b8a6, #0d9488)' : 'radial-gradient(circle, #94a3b8, #64748b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 10, fontWeight: 700, cursor: phase === 'select' ? 'pointer' : 'default',
              border: isSelected ? '2px solid #0d9488' : '2px solid transparent',
              boxShadow: isTargetHighlight ? '0 0 16px rgba(251,191,36,0.6)' : isSelected ? '0 0 8px rgba(20,184,166,0.4)' : 'none',
              transition: 'all 0.15s',
            }}>
              {isTargetHighlight ? '★' : isSelected ? '✓' : ''}
            </div>
          )
        })}
      </div>
      {phase === 'idle' && (
        <button onClick={startGame} style={{ marginTop: 16, background: 'linear-gradient(135deg, #14b8a6, #2dd4bf)', border: 'none', color: 'white', padding: '12px 36px', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 600, fontFamily: '"Noto Serif SC", serif', display: 'block', margin: '16px auto 0' }}>开始追踪</button>
      )}
      {phase === 'select' && (
        <button onClick={submitSelection} disabled={selected.length === 0} style={{ marginTop: 16, background: selected.length === 0 ? '#e2e8f0' : 'linear-gradient(135deg, #14b8a6, #2dd4bf)', border: 'none', color: selected.length === 0 ? '#94a3b8' : 'white', padding: '10px 28px', borderRadius: 10, cursor: selected.length === 0 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, fontFamily: '"Noto Serif SC", serif', display: 'block', margin: '16px auto 0' }}>提交选择</button>
      )}
    </GameLayout>
  )
}

/* ========== 9. 等距小世界 (Isometric Builder) ========== */
const ISO_BLOCK_TYPES = [
  { id: 'grass', name: '草地', top: '#7ec850', left: '#5fa83e', right: '#4d8f32' },
  { id: 'dirt', name: '泥土', top: '#c49a6c', left: '#a87d52', right: '#8c663f' },
  { id: 'stone', name: '石砖', top: '#a8b8c8', left: '#8898a8', right: '#687888' },
  { id: 'wood', name: '木板', top: '#d4a56a', left: '#b8894f', right: '#9a6f3a' },
  { id: 'brick', name: '砖块', top: '#c97565', left: '#b05a4a', right: '#944537' },
  { id: 'roof', name: '屋顶', top: '#a04040', left: '#853030', right: '#6a2020' },
  { id: 'water', name: '水池', top: '#5ab0e8', left: '#4495cc', right: '#3579aa' },
  { id: 'glass', name: '玻璃', top: 'rgba(147,197,253,0.5)', left: 'rgba(96,165,250,0.5)', right: 'rgba(59,130,246,0.5)' },
  { id: 'gold', name: '金块', top: '#f7d44a', left: '#e0b830', right: '#c49c20' },
  { id: 'sand', name: '沙地', top: '#e8d5a3', left: '#d4bf8a', right: '#bfa872' },
  { id: 'leaves', name: '树叶', top: '#4a9e4a', left: '#3a7e3a', right: '#2d642d' },
  { id: 'snow', name: '雪块', top: '#eef2f6', left: '#d8dce4', right: '#c2c6ce' },
  { id: 'path', name: '石板', top: '#b8b0a0', left: '#9e9688', right: '#857e72' },
  { id: 'lava', name: '岩浆', top: '#e85a20', left: '#cc4410', right: '#aa3000' },
  { id: 'obsidian', name: '黑曜石', top: '#3a3048', left: '#282038', right: '#1a1428' },
]

const DEMO_PRESET: { x: number; y: number; z: number; type: string }[] = [
  { x: 0, y: 0, z: 0, type: 'grass' }, { x: 0, y: 0, z: 1, type: 'brick' }, { x: 0, y: 0, z: 2, type: 'brick' },
  { x: 0, y: 0, z: 3, type: 'roof' }, { x: 1, y: 0, z: 0, type: 'grass' }, { x: 0, y: 1, z: 0, type: 'grass' },
  { x: 0, y: -1, z: 0, type: 'grass' }, { x: -1, y: 0, z: 0, type: 'grass' },
  { x: -1, y: -1, z: 0, type: 'water' }, { x: 1, y: 1, z: 0, type: 'water' },
  { x: 2, y: 0, z: 0, type: 'wood' }, { x: 2, y: 0, z: 1, type: 'leaves' },
  { x: 0, y: 2, z: 0, type: 'stone' }, { x: 0, y: 2, z: 1, type: 'stone' },
  { x: 0, y: 2, z: 2, type: 'gold' }, { x: 1, y: -1, z: 0, type: 'path' },
  { x: 0, y: -1, z: 1, type: 'lamp' }, { x: 1, y: -1, z: 1, type: 'lamp' },
  { x: -1, y: 1, z: 0, type: 'dirt' }, { x: -1, y: 1, z: 1, type: 'dirt' },
  { x: -1, y: 1, z: 2, type: 'obsidian' }, { x: -2, y: 0, z: 0, type: 'sand' },
  { x: 0, y: -2, z: 0, type: 'sand' }, { x: 2, y: 1, z: 0, type: 'leaves' },
]

function IsoBuilder({ onBack }: { onBack: () => void }) {
  const [blocks, setBlocks] = useState<{ x: number; y: number; z: number; type: string }[]>([])
  const [selectedType, setSelectedType] = useState(ISO_BLOCK_TYPES[0].id)
  const [camX, setCamX] = useState(0)
  const [camY, setCamY] = useState(0)
  const [zoomLvl, setZoomLvl] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ down: false, sx: 0, sy: 0, cx: 0, cy: 0, moved: false })

  const TW = 64, TH = 32, BH = 26

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width, h = canvas.height

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, w, h)

    const cx = w / 2 + camX
    const cy = h / 2 + camY - 40

    // Grid
    const GR = 10
    ctx.strokeStyle = 'rgba(255,255,255,0.035)'
    ctx.lineWidth = 1
    for (let x = -GR; x <= GR; x++) {
      for (let y = -GR; y <= GR; y++) {
        const gx = cx + (x - y) * (TW / 2) * zoomLvl
        const gy = cy + (x + y) * (TH / 2) * zoomLvl
        ctx.beginPath()
        ctx.moveTo(gx, gy)
        ctx.lineTo(gx + TW / 2 * zoomLvl, gy + TH / 2 * zoomLvl)
        ctx.lineTo(gx, gy + TH * zoomLvl)
        ctx.lineTo(gx - TW / 2 * zoomLvl, gy + TH / 2 * zoomLvl)
        ctx.closePath()
        ctx.stroke()
      }
    }

    // Blocks
    const sorted = [...blocks].sort((a, b) => (a.x + a.y + a.z) - (b.x + b.y + b.z))
    for (const b of sorted) {
      const bt = ISO_BLOCK_TYPES.find(t => t.id === b.type)
      if (!bt) continue
      const sx = cx + (b.x - b.y) * (TW / 2) * zoomLvl
      const sy = cy + (b.x + b.y) * (TH / 2) * zoomLvl - b.z * BH * zoomLvl
      const tw = TW * zoomLvl, th = TH * zoomLvl, bh = BH * zoomLvl

      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.lineTo(sx + tw / 2, sy + th / 2)
      ctx.lineTo(sx, sy + th)
      ctx.lineTo(sx - tw / 2, sy + th / 2)
      ctx.closePath()
      ctx.fillStyle = bt.top
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.12)'
      ctx.lineWidth = 0.5
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(sx - tw / 2, sy + th / 2)
      ctx.lineTo(sx, sy + th)
      ctx.lineTo(sx, sy + th + bh)
      ctx.lineTo(sx - tw / 2, sy + th / 2 + bh)
      ctx.closePath()
      ctx.fillStyle = bt.left
      ctx.fill()
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(sx + tw / 2, sy + th / 2)
      ctx.lineTo(sx, sy + th)
      ctx.lineTo(sx, sy + th + bh)
      ctx.lineTo(sx + tw / 2, sy + th / 2 + bh)
      ctx.closePath()
      ctx.fillStyle = bt.right
      ctx.fill()
      ctx.stroke()
    }
  }, [blocks, camX, camY, zoomLvl])

  const drawRef = useRef(draw)
  drawRef.current = draw

  useEffect(() => { draw() }, [draw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const container = canvas.parentElement!
    const resize = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      drawRef.current()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(container)
    resize()
    return () => ro.disconnect()
  }, [])

  // Mouse
  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!
    const r = canvas.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const screenToGrid = (sx: number, sy: number) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const cx = canvas.width / 2 + camX
    const cy = canvas.height / 2 + camY - 40
    const lsx = sx - cx
    const lsy = sy - cy
    const u = lsx / (TW / 2 * zoomLvl)
    const v = lsy / (TH / 2 * zoomLvl)
    return { x: Math.round((v + u) / 2), y: Math.round((v - u) / 2) }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const p = getMousePos(e)
    dragRef.current = { down: true, sx: p.x, sy: p.y, cx: camX, cy: camY, moved: false }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.down) return
    const p = getMousePos(e)
    const dx = p.x - dragRef.current.sx
    const dy = p.y - dragRef.current.sy
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragRef.current.moved = true
      setCamX(dragRef.current.cx + dx)
      setCamY(dragRef.current.cy + dy)
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragRef.current.down) return
    const wasMoved = dragRef.current.moved
    dragRef.current.down = false
    if (wasMoved) return

    const p = getMousePos(e)
    const g = screenToGrid(p.x, p.y)
    if (!g || Math.abs(g.x) > 20 || Math.abs(g.y) > 20) return

    if (e.shiftKey) {
      // Stack: find max z at this cell
      const existing = blocks.filter(b => b.x === g.x && b.y === g.y)
      const maxZ = existing.length > 0 ? Math.max(...existing.map(b => b.z)) : -1
      setBlocks(prev => [...prev, { x: g.x, y: g.y, z: maxZ + 1, type: selectedType }])
      playCorrect()
    } else {
      // Toggle: remove top block or place at z=0
      const existing = blocks.filter(b => b.x === g.x && b.y === g.y)
      if (existing.length > 0) {
        const top = existing.reduce((a, b) => a.z > b.z ? a : b)
        setBlocks(prev => prev.filter(b => b !== top))
        playWrong()
      } else {
        setBlocks(prev => [...prev, { x: g.x, y: g.y, z: 0, type: selectedType }])
        playCorrect()
      }
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setZoomLvl(z => Math.max(0.4, Math.min(2, z - e.deltaY * 0.001)))
  }

  const exportPng = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'isometric-city.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const clearAll = () => { setBlocks([]); playCorrect(); setCamX(0); setCamY(0); setZoomLvl(1) }
  const loadDemo = () => { setBlocks(DEMO_PRESET.map(b => ({ ...b }))); playCorrect(); setCamX(0); setCamY(0); setZoomLvl(1) }
  const [paletteOpen, setPaletteOpen] = useState(true)

  return (
    <GameLayout title="等距小世界" onBack={onBack}>
      <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 120px)', minHeight: 400 }}>
        {/* Canvas */}
        <div ref={containerRef} className="flex-1 relative overflow-hidden rounded-xl border mx-2"
          style={{ borderColor: 'rgba(99,102,241,0.15)', minHeight: 280 }}>
          <canvas ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }} />
          {/* Floating controls */}
          <div className="absolute top-2 right-2 flex gap-1.5">
            <button onClick={loadDemo} title="示例城市"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all"
              style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
              🏘️
            </button>
            <button onClick={exportPng} title="导出 PNG"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}>
              ⬇
            </button>
            <button onClick={clearAll} title="清空"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              🗑
            </button>
          </div>
          <div className="absolute bottom-2 left-2 text-[10px] text-slate-600 pointer-events-none">
            点击放置 · 点击删除 · Shift+点击堆叠 · 拖拽平移 · 滚轮缩放
          </div>
        </div>

        {/* Palette */}
        <div className="mx-2 mt-2">
          <button onClick={() => setPaletteOpen(o => !o)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-400 mb-1.5 transition-all"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span>方块 palette ({ISO_BLOCK_TYPES.length} 种)</span>
            <span>{paletteOpen ? '▲' : '▼'}</span>
          </button>
          {paletteOpen && (
            <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
              {ISO_BLOCK_TYPES.map(bt => (
                <button key={bt.id} onClick={() => setSelectedType(bt.id)}
                  className="shrink-0 flex flex-col items-center gap-0.5 rounded-lg transition-all p-1.5"
                  style={{
                    background: selectedType === bt.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedType === bt.id ? '#6366f1' : 'rgba(255,255,255,0.06)'}`,
                    width: 56,
                  }}>
                  {/* Mini isometric preview */}
                  <svg width="28" height="18" viewBox="0 0 28 18">
                    <polygon points="14,2 26,10 14,17 2,10" fill={bt.top} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
                    <polygon points="14,17 26,10 26,13 14,20" fill={bt.right} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
                    <polygon points="14,17 2,10 2,13 14,20" fill={bt.left} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
                  </svg>
                  <span className="text-[9px] text-slate-400 truncate w-full text-center">{bt.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  )
}


/* ========== 11. 音乐盒 (Step Sequencer) ========== */
const PENTATONIC = [262, 294, 330, 392, 440] // 宫商角徵羽
const PENTA_NAMES = ['宫', '商', '角', '徵', '羽']
const INSTRUMENTS = [
  { id: 'kick', label: '底鼓', emoji: '🥁', color: '#ef4444' },
  { id: 'snare', label: '军鼓', emoji: '📀', color: '#f97316' },
  { id: 'hihat', label: '踩镲', emoji: '🔔', color: '#eab308' },
  { id: 'synth', label: '旋律', emoji: '🎹', color: '#8b5cf6' },
]
const STEPS = 16

function playKick(ctx: AudioContext, time: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(150, time)
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.08)
  gain.gain.setValueAtTime(0.8, time)
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15)
  osc.connect(gain).connect(ctx.destination)
  osc.start(time)
  osc.stop(time + 0.15)
}

function playSnare(ctx: AudioContext, time: number) {
  const noise = ctx.createBufferSource()
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  noise.buffer = buf
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.6, time)
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1)
  noise.connect(gain).connect(ctx.destination)
  noise.start(time)
  noise.stop(time + 0.1)
}

function playHihat(ctx: AudioContext, time: number) {
  const noise = ctx.createBufferSource()
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  noise.buffer = buf
  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 5000
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.3, time)
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05)
  noise.connect(filter).connect(gain).connect(ctx.destination)
  noise.start(time)
  noise.stop(time + 0.05)
}

function playSynth(ctx: AudioContext, freq: number, time: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.4, time)
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4)
  osc.connect(gain).connect(ctx.destination)
  osc.start(time)
  osc.stop(time + 0.4)
}

function MusicBoxGame({ onBack }: { onBack: () => void }) {
  const [grid, setGrid] = useState<boolean[][]>(() =>
    INSTRUMENTS.map(() => Array(STEPS).fill(false))
  )
  const [playing, setPlaying] = useState(false)
  const [bpm, setBpm] = useState(120)
  const [playStep, setPlayStep] = useState(-1)
  const [showReset, setShowReset] = useState(false)
  const seqTimer = useRef<number>(0)
  const stepRef = useRef(-1)
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }

  const toggleCell = (row: number, col: number) => {
    if (playing) return
    setGrid(g => {
      const next = g.map(r => [...r])
      next[row][col] = !next[row][col]
      return next
    })
  }

  useEffect(() => {
    if (!playing) { setPlayStep(-1); stepRef.current = -1; return }
    const interval = 60000 / bpm / 4 // 16th notes
    let step = -1
    const schedule = () => {
      step = (step + 1) % STEPS
      stepRef.current = step
      setPlayStep(step)
      const ctx = getCtx()
      const now = ctx.currentTime
      grid.forEach((row, ri) => {
        if (!row[step]) return
        if (ri === 0) playKick(ctx, now)
        else if (ri === 1) playSnare(ctx, now)
        else if (ri === 2) playHihat(ctx, now)
        else if (ri === 3) playSynth(ctx, now, PENTATONIC[step % 5])
      })
      seqTimer.current = window.setTimeout(schedule, interval)
    }
    seqTimer.current = window.setTimeout(schedule, 10)
    return () => clearTimeout(seqTimer.current)
  }, [playing, bpm, grid])

  const clearAll = () => {
    setGrid(INSTRUMENTS.map(() => Array(STEPS).fill(false)))
    setShowReset(false)
  }

  const presetPattern = () => {
    setGrid([
      // kick: strong beats
      [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      // snare: backbeat
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      // hihat: 8th notes
      [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      // synth: pentatonic melody
      [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false],
    ])
    setShowReset(false)
  }

  return (
    <GameLayout title="音乐盒" onBack={onBack}>
      <div className="text-center px-1">
        <p className="text-xs text-slate-400 mb-3">在网格上点击放置音符，创作你的旋律 🎶</p>

        {/* Transport & BPM */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button onClick={() => setPlaying(p => !p)}
            className="w-11 h-11 rounded-full flex items-center justify-center text-lg transition-all"
            style={{
              background: playing ? '#ef4444' : 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white', border: 'none', cursor: 'pointer',
              boxShadow: playing ? '0 0 16px rgba(239,68,68,0.4)' : '0 0 12px rgba(34,197,94,0.3)',
            }}>
            {playing ? '⏹' : '▶'}
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>BPM</span>
            <input type="range" min="60" max="180" value={bpm}
              onChange={e => setBpm(Number(e.target.value))}
              className="w-20 h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#8b5cf6' }} />
            <span className="w-8 text-right text-slate-300 font-mono">{bpm}</span>
          </div>
        </div>

        {/* Grid */}
        <div className="inline-flex flex-col gap-0.5 mx-auto"
          style={{ minWidth: Math.min(window.innerWidth - 32, 440) }}>
          {/* Step numbers */}
          <div className="flex gap-0.5 mb-0.5" style={{ paddingLeft: 44 }}>
            {Array.from({ length: STEPS }, (_, i) => (
              <div key={i} className="flex-1 text-[10px] text-slate-600 text-center font-mono"
                style={{ width: `${(Math.min(window.innerWidth - 32, 440) - 44) / STEPS}px` }}>
                {i + 1}
              </div>
            ))}
          </div>
          {INSTRUMENTS.map((inst, ri) => (
            <div key={inst.id} className="flex items-center gap-1.5">
              <div className="w-9 text-right text-xs text-slate-400 shrink-0">{inst.emoji}</div>
              <div className="flex gap-0.5 flex-1">
                {Array.from({ length: STEPS }, (_, ci) => {
                  const active = grid[ri][ci]
                  const isPlayhead = playing && ci === playStep
                  const isBeat = ci % 4 === 0
                  return (
                    <button key={ci}
                      onClick={() => toggleCell(ri, ci)}
                      className="flex-1 rounded-sm transition-all duration-75"
                      style={{
                        aspectRatio: '1',
                        background: isPlayhead
                          ? 'rgba(255,255,255,0.9)'
                          : active
                            ? inst.color
                            : isBeat
                              ? 'rgba(255,255,255,0.08)'
                              : 'rgba(255,255,255,0.04)',
                        border: isPlayhead
                          ? '1px solid white'
                          : active
                            ? '1px solid rgba(255,255,255,0.4)'
                            : '1px solid rgba(255,255,255,0.06)',
                        cursor: playing ? 'default' : 'pointer',
                        boxShadow: isPlayhead ? `0 0 8px rgba(255,255,255,0.5)` : 'none',
                      }} />
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mt-5">
          <button onClick={clearAll}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            清空
          </button>
          <button onClick={presetPattern}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
            示例旋律
          </button>
        </div>

        <p className="text-[10px] text-slate-600 mt-4 leading-tight">
          五声音阶 · 怎么点都好听！宫商角徵羽永远和谐
        </p>
      </div>
    </GameLayout>
  )
}

/* ========== 12. 序列推理 ========== */
const SEQ_PUZZLES = [
  { seq: [2, 4, 6, 8], options: [9, 10, 12, 14], answer: 1, hint: '看相邻两数的差', rule: '等差数列，每次 +2' },
  { seq: [1, 4, 9, 16], options: [20, 25, 24, 18], answer: 1, hint: '这些数字和某个数的平方有关', rule: '平方数序列：1², 2², 3², 4²…' },
  { seq: [1, 1, 2, 3, 5], options: [6, 7, 8, 10], answer: 2, hint: '看任意连续三项之间的关系', rule: '斐波那契数列，前两项之和等于下一项' },
  { seq: [3, 6, 12, 24], options: [36, 48, 30, 40], answer: 1, hint: '每次乘以相同的数', rule: '等比数列，每次 ×2' },
  { seq: [100, 90, 81, 73], options: [66, 65, 64, 67], answer: 0, hint: '每次减去的数在变化', rule: '递减：-10, -9, -8, -7…' },
  { seq: [16, 8, 4, 2], options: [0, 1, 0.5, 4], answer: 1, hint: '从大到小，除以同一个数', rule: '每次 ÷2' },
  { seq: [1, 2, 4, 7, 11], options: [15, 16, 14, 13], answer: 1, hint: '每次加的数递增 1', rule: '+1, +2, +3, +4, +5…' },
  { seq: [2, 3, 5, 7, 11], options: [12, 13, 14, 15], answer: 1, hint: '这些数只能被 1 和自身整除', rule: '质数（素数）序列' },
  { seq: [1, 4, 27, 256], options: [625, 3125, 1024, 729], answer: 1, hint: '底数和指数相等', rule: 'nⁿ：1¹, 2², 3³, 4⁴…' },
  { seq: [1, 2, 6, 24], options: [48, 96, 120, 60], answer: 2, hint: '和乘法递增有关', rule: '阶乘数列：1!, 2!, 3!, 4!…' },
]

function SequenceGame({ onBack }: { onBack: () => void }) {
  const [pool] = useState(() => shuffleArr(SEQ_PUZZLES).slice(0, 8))
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'hint' | 'options'>('hint')
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const puzzle = pool[index]

  const handleSelect = (optIdx: number) => {
    if (selected !== null) return
    setSelected(optIdx)
    if (optIdx === puzzle.answer) { playCorrect(); setScore(s => s + 1) } else playWrong()
  }

  const handleNext = () => {
    if (index >= pool.length - 1) { setDone(true); return }
    setIndex(i => i + 1); setPhase('hint'); setSelected(null)
  }

  if (done) {
    const pct = Math.round((score / pool.length) * 100)
    return (
      <GameLayout title="序列推理" onBack={onBack}>
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔢</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#a855f7', marginBottom: 4 }}>{score}/{pool.length}</div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>正确率 {pct}%</div>
          <button onClick={() => { window.location.reload() }} style={{ marginTop: 20, background: 'linear-gradient(135deg, #a855f7, #c084fc)', border: 'none', color: 'white', padding: '10px 28px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: '"Noto Serif SC", serif' }}>再来一轮</button>
        </div>
      </GameLayout>
    )
  }

  return (
    <GameLayout title="序列推理" onBack={onBack}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{ color: '#94a3b8', fontSize: 12 }}>第 {index + 1}/{pool.length} 题 · 得分 {score}</span>
      </div>
      {/* Sequence boxes */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        {puzzle.seq.map((item, i) => (
          <div key={i} style={{
            width: 50, height: 50, borderRadius: 12, background: '#f3e8ff', border: '1px solid #e9d5ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#7e22ce',
          }}>{item}</div>
        ))}
        <div style={{
          width: 50, height: 50, borderRadius: 12, border: '2px dashed #a855f7',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#a855f7',
        }}>?</div>
      </div>
      {/* Hint */}
      {phase === 'hint' && (
        <div style={{ textAlign: 'center', padding: '12px 16px', background: '#faf5ff', borderRadius: 10, border: '1px solid #e9d5ff', marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: '#a855f7', marginBottom: 4 }}>💡 提示</div>
          <div style={{ fontSize: 13, color: '#6b21a8' }}>{puzzle.hint}</div>
        </div>
      )}
      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 280, margin: '0 auto' }}>
        {puzzle.options.map((opt, i) => {
          const isCorrect = i === puzzle.answer
          const isSelected = selected === i
          let bg = 'white', bd = '1px solid #e2e8f0', cl = '#1e293b'
          if (isSelected && isCorrect) { bg = '#f0fdf4'; bd = '2px solid #22c55e'; cl = '#16a34a' }
          else if (isSelected && !isCorrect) { bg = '#fef2f2'; bd = '2px solid #ef4444'; cl = '#dc2626' }
          else if (selected !== null && isCorrect) { bg = '#f0fdf4'; bd = '2px solid #22c55e'; cl = '#16a34a' }
          return (
            <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null}
              style={{
                padding: '14px', borderRadius: 10, cursor: selected !== null ? 'default' : 'pointer',
                fontSize: 20, fontWeight: 700, background: bg, border: bd, color: cl,
                fontFamily: '"Noto Serif SC", serif', transition: 'all 0.2s',
              }}>{opt}</button>
          )
        })}
      </div>
      {selected !== null && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <div style={{ fontSize: 12, color: selected === puzzle.answer ? '#16a34a' : '#dc2626', marginBottom: 8 }}>
            {selected === puzzle.answer ? '✓ 正确！' : `✗ 正确答案是 ${puzzle.options[puzzle.answer]}`}
            <span style={{ color: '#94a3b8', marginLeft: 8 }}>{puzzle.rule}</span>
          </div>
          <button onClick={handleNext} style={{
            background: 'linear-gradient(135deg, #a855f7, #c084fc)', border: 'none', color: 'white',
            padding: '10px 28px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
            fontFamily: '"Noto Serif SC", serif',
          }}>{index >= pool.length - 1 ? '查看结果' : '下一题 →'}</button>
        </div>
      )}
    </GameLayout>
  )
}

/* ========== 13. 数学速算 ========== */
type Op = '+' | '-' | '×' | '÷'
const SPEED_LEVELS = [
  { label: 'Lv.1 入门', range: [1, 20] as [number, number], ops: ['+', '-'] as Op[] },
  { label: 'Lv.2 基础', range: [1, 50] as [number, number], ops: ['+', '-', '×'] as Op[] },
  { label: 'Lv.3 进阶', range: [5, 99] as [number, number], ops: ['+', '-', '×'] as Op[] },
  { label: 'Lv.4 挑战', range: [5, 99] as [number, number], ops: ['+', '-', '×', '÷'] as Op[] },
  { label: 'Lv.5 极限', range: [10, 999] as [number, number], ops: ['×', '÷'] as Op[] },
]

function genMathQ(lvl: typeof SPEED_LEVELS[0]): { text: string; answer: number } {
  const op = lvl.ops[Math.floor(Math.random() * lvl.ops.length)]
  const [mn, mx] = lvl.range
  let a: number, b: number, text: string, ans: number
  switch (op) {
    case '+': a = mn + Math.floor(Math.random() * (mx - mn)); b = mn + Math.floor(Math.random() * (mx - mn)); text = `${a} + ${b}`; ans = a + b; break
    case '-': a = mn + Math.floor(Math.random() * (mx - mn)); b = mn + Math.floor(Math.random() * (a - mn)); text = `${a} - ${b}`; ans = a - b; break
    case '×': a = mn + Math.floor(Math.random() * Math.min(mx - mn, 40)); b = 2 + Math.floor(Math.random() * 18); text = `${a} × ${b}`; ans = a * b; break
    default: b = 2 + Math.floor(Math.random() * 18); ans = 1 + Math.floor(Math.random() * 49); a = b * ans; text = `${a} ÷ ${b}`; break
  }
  return { text, answer: ans }
}

function MathSpeedGame({ onBack }: { onBack: () => void }) {
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [lvlIdx, setLvlIdx] = useState(0)
  const [q, setQ] = useState(() => genMathQ(SPEED_LEVELS[0]))
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const lvl = SPEED_LEVELS[Math.min(lvlIdx, SPEED_LEVELS.length - 1)]

  useEffect(() => {
    if (!started || finished) return
    const t = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(t); setFinished(true); return 0 } return t - 1 }), 1000)
    return () => clearInterval(t)
  }, [started, finished])

  const nextQ = useCallback(() => {
    setQ(genMathQ(lvl)); setInput(''); setFeedback(null); inputRef.current?.focus()
  }, [lvl])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (feedback !== null || !input.trim()) return
    const val = parseInt(input, 10)
    if (isNaN(val)) return
    const correct = val === q.answer
    if (correct) {
      setScore(s => s + 1); setStreak(s => { const ns = s + 1; if (ns % 3 === 0) setLvlIdx(i => Math.min(i + 1, SPEED_LEVELS.length - 1)); return ns })
      setFeedback('correct'); playCorrect()
    } else {
      setWrong(w => w + 1); setStreak(0); setFeedback('wrong'); playWrong()
    }
    setTimeout(nextQ, 350)
  }

  if (!started) {
    return (
      <GameLayout title="数学速算" onBack={onBack}>
        <div style={{ textAlign: 'center', paddingTop: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🧮</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>数学速算挑战</h2>
          <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>60 秒内尽可能多地答对算术题，难度递增</p>
          <button onClick={() => { setStarted(true); inputRef.current?.focus() }} style={{
            background: 'linear-gradient(135deg, #06b6d4, #22d3ee)', border: 'none', color: 'white',
            padding: '14px 40px', borderRadius: 12, cursor: 'pointer', fontSize: 16, fontWeight: 700,
            fontFamily: '"Noto Serif SC", serif', boxShadow: '0 2px 8px rgba(6,182,212,0.3)',
          }}>开始挑战！</button>
        </div>
      </GameLayout>
    )
  }

  if (finished) {
    const acc = score + wrong > 0 ? Math.round(score / (score + wrong) * 100) : 0
    return (
      <GameLayout title="数学速算" onBack={onBack}>
        <div style={{ textAlign: 'center', paddingTop: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🧮</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>时间到！</h2>
          <div style={{ fontSize: 48, fontWeight: 700, background: 'linear-gradient(135deg, #06b6d4, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>{score}</div>
          <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>答对 {score} 题 · 答错 {wrong} 题 · 正确率 {acc}%</p>
          <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 16 }}>最高等级：{SPEED_LEVELS[Math.min(lvlIdx, SPEED_LEVELS.length - 1)].label}</p>
          <button onClick={() => window.location.reload()} style={{
            background: 'linear-gradient(135deg, #06b6d4, #22d3ee)', border: 'none', color: 'white',
            padding: '10px 28px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
            fontFamily: '"Noto Serif SC", serif',
          }}>再来一局</button>
        </div>
      </GameLayout>
    )
  }

  return (
    <GameLayout title="数学速算" onBack={onBack}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 380, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1, padding: '10px 12px', background: '#ecfeff', borderRadius: 10, border: '1px solid #cffafe' }}>
            <div style={{ fontSize: 10, color: '#0891b2', marginBottom: 2 }}>剩余时间</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#155e75' }}>{timeLeft}s</div>
            <div style={{ height: 4, background: '#cffafe', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(timeLeft / 60) * 100}%`, background: 'linear-gradient(90deg, #06b6d4, #22d3ee)', borderRadius: 2, transition: 'width 1s' }} />
            </div>
          </div>
          <div style={{ flex: 1, padding: '10px 12px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a' }}>
            <div style={{ fontSize: 10, color: '#d97706', marginBottom: 2 }}>等级</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#92400e' }}>{lvl.label}</div>
            <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
              {SPEED_LEVELS.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= lvlIdx ? 'linear-gradient(90deg, #f59e0b, #f7971e)' : '#fde68a' }} />
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, fontSize: 12, color: '#94a3b8' }}>
          <span>得分 <strong style={{ color: '#06b6d4' }}>{score}</strong></span>
          <span>连对 <strong style={{ color: '#f59e0b' }}>{streak}</strong></span>
          <span>答错 <strong style={{ color: '#ef4444' }}>{wrong}</strong></span>
        </div>
      </div>
      {/* Question card */}
      <div style={{
        width: '100%', maxWidth: 380, textAlign: 'center', padding: '28px 20px',
        background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, marginBottom: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: '#1e293b', fontFamily: 'monospace', letterSpacing: 2 }}>{q.text}</div>
        <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>= ?</div>
      </div>
      {/* Input */}
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ position: 'relative' }}>
          <input ref={inputRef} type="number" value={input} onChange={e => setInput(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box', textAlign: 'center', fontSize: 28, fontWeight: 700,
              padding: '14px 16px', borderRadius: 12, border: feedback === 'correct' ? '2px solid #22c55e' : feedback === 'wrong' ? '2px solid #ef4444' : '1px solid #e2e8f0',
              background: feedback === 'correct' ? '#f0fdf4' : feedback === 'wrong' ? '#fef2f2' : 'white',
              color: '#1e293b', outline: 'none', fontFamily: 'monospace',
            }} placeholder="?" />
        </div>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 6 }}>按 Enter 确认 · 连续答对 3 题升级</p>
      </form>
    </GameLayout>
  )
}

/* ========== Layout wrapper ========== */
function GameLayout({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px',
      fontFamily: '"Noto Sans SC", "Exo 2", system-ui, sans-serif', color: '#e2e8f0', boxSizing: 'border-box',
      background: 'linear-gradient(135deg, #0f172a, #1e293b, #0f172a)',
    }}>
      <div style={{ width: '100%', maxWidth: 420, marginBottom: 16 }}>
        <button onClick={onBack}
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11, backdropFilter: 'blur(8px)' }}>
          ← {title}
        </button>
      </div>
      {children}
    </div>
  )
}

/* ========== Main Page ========== */
export default function BrainTrainPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<GameMode>('hub')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 600)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Stats persistence ──
  const STATS_KEY = 'brain-train-stats'
  const LEVELS = [
    { min: 0, title: '初级挑战者' },
    { min: 50, title: '记忆学徒' },
    { min: 150, title: '思维训练师' },
    { min: 300, title: '思维探索者' },
    { min: 500, title: '脑力大师' },
    { min: 800, title: '认知先锋' },
    { min: 1200, title: '智慧领主' },
  ]
  const loadStats = (): { totalXp: number; todayXp: number; lastDate: string; streak: number } => {
    try {
      const raw = localStorage.getItem(STATS_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    return { totalXp: 0, todayXp: 0, lastDate: '', streak: 0 }
  }
  const [stats, setStats] = useState(loadStats)
  const today = new Date().toDateString()
  const curLevel = LEVELS.reduce((a, l) => stats.totalXp >= l.min ? l : a, LEVELS[0])

  useEffect(() => { localStorage.setItem(STATS_KEY, JSON.stringify(stats)) }, [stats])

  const addXp = useCallback((xp: number) => {
    setStats(prev => {
      const t = new Date().toDateString()
      const isToday = prev.lastDate === t
      const newStreak = isToday ? prev.streak : prev.lastDate === new Date(Date.now() - 86400000).toDateString() ? prev.streak + 1 : 1
      return {
        totalXp: prev.totalXp + xp,
        todayXp: isToday ? prev.todayXp + xp : xp,
        lastDate: t,
        streak: newStreak,
      }
    })
  }, [])

  const handleGameBack = useCallback(() => {
    addXp(1)
    setMode('hub')
  }, [addXp])

  const nextLevel = LEVELS.find(l => l.min > stats.totalXp) || LEVELS[LEVELS.length - 1]
  const levelProgress = nextLevel.min > 0 ? (stats.totalXp / nextLevel.min) * 100 : 100

  if (mode === 'memory') return <MemoryGame onBack={handleGameBack} />
  if (mode === 'aim') return <AimGame onBack={handleGameBack} />
  if (mode === 'schulte') return <SchulteGame onBack={handleGameBack} />
  if (mode === 'chimp') return <ChimpGame onBack={handleGameBack} />
  if (mode === 'logic') return <LogicGame onBack={handleGameBack} />
  if (mode === 'trail') return <TrailGame onBack={handleGameBack} />
  if (mode === 'mot') return <MOTGame onBack={handleGameBack} />
  if (mode === 'isometric') return <IsoBuilder onBack={handleGameBack} />
  if (mode === 'musicbox') return <MusicBoxGame onBack={handleGameBack} />
  if (mode === 'seqreason') return <SequenceGame onBack={handleGameBack} />
  if (mode === 'mathspeed') return <MathSpeedGame onBack={handleGameBack} />

  return (
    <>
      <style>{`
        :root { --font-main: Inter, PingFang SC, sans-serif; }
        body { font-family: var(--font-main); font-size: 16px; line-height: 1.7; }
        .hero-title { font-size: ${isMobile ? 32 : 48}px; font-weight: 900; letter-spacing: -0.04em; }
        .hero-subtitle { font-size: ${isMobile ? 16 : 20}px; font-weight: 500; opacity: .75; }
        .card-title { font-size: 20px; font-weight: 700; }
        .card-desc { font-size: 15px; line-height: 1.8; }
      `}</style>
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px',
        fontFamily: 'var(--font-main)', color: '#e2e8f0',
        background: 'linear-gradient(135deg, #0f172a, #1e293b, #0f172a)',
      }}>
        <button onClick={() => navigate(-1)}
          style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, backdropFilter: 'blur(8px)' }}>
          ← 返回
        </button>

        {/* Hero */}
        <div className="hero-title" style={{
          background: 'linear-gradient(135deg, #c4b5fd, #818cf8, #6366f1)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 8, marginTop: 20, textAlign: 'center',
        }}>
          AI-Wego Brain Train
        </div>
        <div className="hero-subtitle" style={{ color: '#94a3b8', marginBottom: 28, textAlign: 'center' }}>
          反应 · 记忆 · 专注 · 协调 · 逻辑 — 全面认知训练
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, padding: '12px 18px', textAlign: 'center', minWidth: 130 }}>
            <div style={{ fontSize: 13, color: '#6ee7b7', fontWeight: 500, marginBottom: 2 }}>今日智力成长</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#34d399', letterSpacing: '-0.03em' }}>+{stats.todayXp}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14, padding: '12px 18px', textAlign: 'center', minWidth: 130 }}>
            <div style={{ fontSize: 13, color: '#fcd34d', fontWeight: 500, marginBottom: 2 }}>连续训练</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#fbbf24', letterSpacing: '-0.03em' }}>{stats.streak} 天</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 14, padding: '12px 18px', textAlign: 'center', minWidth: 130 }}>
            <div style={{ fontSize: 13, color: '#c4b5fd', fontWeight: 500, marginBottom: 2 }}>等级</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#a78bfa', letterSpacing: '-0.03em' }}>Lv.{LEVELS.indexOf(curLevel)}</div>
            <div style={{ fontSize: 11, color: '#8b7aaa', marginTop: 1 }}>{curLevel.title}</div>
          </div>
        </div>

        {/* Level progress bar */}
        {nextLevel.min > 0 && (
          <div style={{ width: '100%', maxWidth: 500, marginBottom: 32 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4, textAlign: 'center' }}>
              {stats.totalXp} / {nextLevel.min} XP → {nextLevel.title}
            </div>
            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, levelProgress)}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #a78bfa)', borderRadius: 2, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        )}

        {/* Game cards */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 155 : 170}px, 1fr))`, gap: 12, width: '100%', maxWidth: 720 }}>
          {GAMES.map(g => (
            <button key={g.id} onClick={() => setMode(g.id)}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18,
                padding: '22px 14px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = g.color; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{g.emoji}</div>
              <div className="card-title" style={{ color: g.color, marginBottom: 4 }}>{g.title}</div>
              <div className="card-desc" style={{ color: '#94a3b8', margin: 0 }}>{g.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
