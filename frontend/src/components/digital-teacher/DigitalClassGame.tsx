import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { generateClass, pickDailyEvent, getMilestone, formatDate, computeFinalOutcome, generateFutureCareer } from './DigitalClassData'
import type { Student, GameEvent } from './DigitalClassData'
import GrowthDiary from './GrowthDiary'

const TOTAL_DAYS = 150
const ROWS = 7
const COLS = 8
const SAVE_KEY = 'digital_class_game_save'

function loadSave<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

export default function DigitalClassGame({ onBack }: { onBack: () => void }) {
  const students = useMemo(() => generateClass(), [])
  const saved = loadSave(SAVE_KEY, null)
  const [screen, setScreen] = useState<'title' | 'classroom' | 'event' | 'graduation'>(
    saved?.screen === 'graduation' ? 'title' : (saved?.screen || 'title')
  )
  const [showDiary, setShowDiary] = useState(false)
  const [day, setDay] = useState(saved?.day || 1)
  const [month, setMonth] = useState(saved?.month || 9)
  const [year, setYear] = useState(saved?.year || 2026)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null)
  const [eventLog, setEventLog] = useState<string[]>(saved?.eventLog || [])
  const [studentsState, setStudentsState] = useState(saved?.studentsState || students)
  const [growth, setGrowth] = useState(saved?.growth || { responsibility: 50, courage: 50, integrity: 50, empathy: 50 })
  const [milestones, setMilestones] = useState<string[]>(saved?.milestones || [])
  const [paused, setPaused] = useState(false)
  const [choiceMade, setChoiceMade] = useState(false)
  const [choiceResult, setChoiceResult] = useState('')
  const [playerPos] = useState({ row: 3, col: 3 })
  const [studentChanges, setStudentChanges] = useState<Record<number, { label: string; value: number }[]>>(saved?.studentChanges || {})
  const [showTutorial, setShowTutorial] = useState(false)
  const [advancing, setAdvancing] = useState(false)

  // Time system: 1 real minute = 1 game day
  useEffect(() => {
    if (screen !== 'classroom' || paused || day >= TOTAL_DAYS) return
    const timer = setInterval(() => {
      setDay(d => {
        const next = d + 1
        if (next >= TOTAL_DAYS) {
          setScreen('graduation')
          return next
        }
        // Advance month every ~30 days
        if (next % 30 === 0) setMonth(m => m === 12 ? 1 : m + 1)
        if (next === 90) setYear(y => y + 1)
        return next
      })
    }, 60000)
    return () => clearInterval(timer)
  }, [screen, paused])

  // Auto-save progress
  useEffect(() => {
    if (screen === 'title') return
    const data = { screen, day, month, year, studentsState, growth, eventLog, milestones, studentChanges }
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  }, [screen, day, month, year, studentsState, growth, eventLog, milestones, studentChanges])

  // Daily event trigger
  useEffect(() => {
    if (screen !== 'classroom' || day <= 1 || day >= TOTAL_DAYS) return
    const milestone = getMilestone(day)
    if (milestone) {
      setPaused(true)
      setAdvancing(false)
      setMilestones(prev => [...prev, milestone.title])
      const names = ['王浩', '李明', '张伟', '陈静']
      setCurrentEvent({
        id: 999,
        title: milestone.title,
        desc: milestone.desc.replace(/\{student\}/g, names[Math.floor(Math.random() * names.length)]),
        choices: [
          { label: '继续', effect: {}, text: milestone.desc.includes('毕业典礼') ? '你深吸一口气。\n这一天终于来了。' : '你放下笔，认真听着。\n这是属于你们的记忆。' },
        ],
      })
      setChoiceMade(false)
      setChoiceResult('')
      return
    }
    // Daily event — always triggers
    setPaused(true)
    setAdvancing(false)
    const evt = pickDailyEvent(day)
    setCurrentEvent(evt)
    setChoiceMade(false)
    setChoiceResult('')
  }, [day, screen])

  // Auto-show tutorial on first enter
  useEffect(() => {
    if (screen === 'classroom' && day === 1) {
      setTimeout(() => setShowTutorial(true), 300)
    }
  }, [screen])

  const advanceDay = useCallback(() => {
    if (advancing || day >= TOTAL_DAYS) return
    setAdvancing(true)
    setPaused(false)
    setDay(d => {
      const next = d + 1
      if (next >= TOTAL_DAYS) {
        setScreen('graduation')
      } else {
        if (next % 30 === 0) setMonth(m => m === 12 ? 1 : m + 1)
        if (next === 90) setYear(y => y + 1)
      }
      return next
    })
  }, [advancing, day])

  const handleChoice = useCallback((choice: GameEvent['choices'][0], evt: GameEvent) => {
    const g = { ...growth }
    Object.entries(choice.effect).forEach(([key, val]) => {
      if (key in g) (g as any)[key] = Math.max(0, Math.min(100, (g as any)[key] + (val as number)))
    })
    setGrowth(g)
    setChoiceResult(choice.text)
    setChoiceMade(true)

    // Random student changes based on choice
    if (Math.random() > 0.4) {
      const luckyId = Math.floor(Math.random() * 50)
      setStudentsState(prev => prev.map((s, i) => {
        if (i !== luckyId) return s
        const bump = Math.floor(Math.random() * 8) + 3
        const subj = (['english', 'math', 'chinese'] as const)[Math.floor(Math.random() * 3)]
        const newScores = { ...s.scores, [subj]: Math.min(100, s.scores[subj] + bump) }
        setStudentChanges(c => {
          const existing = c[s.id] || []
          return { ...c, [s.id]: [...existing, { label: `${subj === 'english' ? '英语' : subj === 'math' ? '数学' : '语文'}`, value: bump }] }
        })
        return { ...s, scores: newScores }
      }))
    }

    setEventLog(prev => [`第${day}天 · ${evt.title}`, ...prev.slice(0, 30)])
  }, [growth, day])

  const closeEvent = useCallback(() => {
    setCurrentEvent(null)
    setChoiceResult('')
    setPaused(false)
  }, [])

  // Build seating chart grid
  const grid = useMemo(() => {
    const g: (Student | null)[][] = []
    let idx = 0
    for (let r = 0; r < ROWS; r++) {
      const row: (Student | null)[] = []
      for (let c = 0; c < COLS; c++) {
        if (r === playerPos.row && c === playerPos.col) {
          row.push(null)
        } else if (idx < studentsState.length) {
          row.push(studentsState[idx])
          idx++
        } else {
          row.push(null)
        }
      }
      g.push(row)
    }
    return g
  }, [studentsState, playerPos])

  if (screen === 'title') {
    return (
      <div style={{
        width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%)',
        fontFamily: '"Noto Serif SC", serif', color: '#e0d8c8', padding: 20,
      }}>
        <div style={{ fontSize: 48, marginBottom: 4, letterSpacing: 4 }}>初一（42）班</div>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>{formatDate(2026, 9, 1)}</div>
        <div style={{
          fontSize: 16, color: '#c8b898', lineHeight: 2.5, textAlign: 'center', marginBottom: 40,
        }}>
          初一开学第一天。
          <br />全班 50 人已到齐。
          <br />班主任：李老师
        </div>
        {saved && saved.day > 1 && saved.screen !== 'graduation' ? (
          <button onClick={() => { setScreen('classroom') }}
            style={{
              background: 'linear-gradient(135deg, #ffab40, #ff8a65)', border: 'none',
              color: '#0a0a1a', padding: '14px 48px', borderRadius: 8, cursor: 'pointer',
              fontSize: 16, fontWeight: 600, fontFamily: '"Noto Serif SC", serif',
              letterSpacing: 2,
            }}>
            ▶ 继续游戏（第{saved.day}天）
          </button>
        ) : (
          <button onClick={() => { setScreen('classroom') }}
            style={{
              background: 'linear-gradient(135deg, #4fc3f7, #29b6f6)', border: 'none',
              color: '#0a0a1a', padding: '14px 48px', borderRadius: 8, cursor: 'pointer',
              fontSize: 16, fontWeight: 600, fontFamily: '"Noto Serif SC", serif',
              letterSpacing: 2,
            }}>
            进入教室 →
          </button>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button onClick={onBack}
            style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 12 }}>
            ← 返回
          </button>
          {saved && saved.day > 1 && (
            <button onClick={() => { localStorage.removeItem(SAVE_KEY); window.location.reload() }}
              style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 12 }}>
              重新开始
            </button>
          )}
        </div>
      </div>
    )
  }

  if (showDiary) return <GrowthDiary day={day} onBack={() => setShowDiary(false)} />

  if (screen === 'graduation') {
    const sorted = [...studentsState].sort((a, b) => {
      const avgA = (a.scores.english + a.scores.math + a.scores.chinese) / 3
      const avgB = (b.scores.english + b.scores.math + b.scores.chinese) / 3
      return avgB - avgA
    })
    const best = sorted.slice(0, 3)
    return (
      <div style={{
        width: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%)',
        fontFamily: '"Noto Serif SC", serif', color: '#e0d8c8', padding: '40px 20px',
      }}>
        <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 4 }}>🎓</div>
        <h1 style={{ fontSize: 22, color: '#f0e8d8', fontWeight: 400, textAlign: 'center', marginBottom: 32, letterSpacing: 2 }}>
          毕业典礼 · 初一（42）班
        </h1>
        <p style={{ fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 32, lineHeight: 2 }}>
          三年了。<br />从 2026 年秋天，到 2029 年夏天。
        </p>

        {/* Growth stats */}
        <div style={{
          maxWidth: 400, margin: '0 auto 40px', width: '100%',
          background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '20px 24px',
        }}>
          <p style={{ fontSize: 12, color: '#ffab40', marginBottom: 12, letterSpacing: 1 }}>你的成长档案</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(['responsibility', 'courage', 'integrity', 'empathy'] as const).map(key => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#888', width: 56 }}>{ { responsibility: '责任感', courage: '勇气', integrity: '诚信', empathy: '同理心' }[key] }</span>
                <div style={{ flex: 1, height: 6, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${growth[key]}%`, height: '100%', background: '#4fc3f7', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 11, color: '#4fc3f7', width: 28, textAlign: 'right' }}>{growth[key]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top graduates */}
        <p style={{ fontSize: 14, color: '#c8b898', textAlign: 'center', marginBottom: 20 }}>🏆 班级前三名</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          {best.map((s, i) => {
            const avg = Math.round((s.scores.english + s.scores.math + s.scores.chinese) / 3)
            const future = generateFutureCareer(s, avg)
            return (
              <div key={s.id} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: '16px 20px', width: 160, textAlign: 'center',
              }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{['🥇', '🥈', '🥉'][i]}</div>
                <div style={{ fontSize: 16, color: '#f0e8d8', marginBottom: 4 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: '#888' }}>中考平均分：{avg}</div>
                <div style={{ fontSize: 13, color: '#ffab40', marginTop: 6 }}>{future}</div>
              </div>
            )
          })}
        </div>

        {/* All students */}
        <p style={{ fontSize: 14, color: '#c8b898', textAlign: 'center', marginBottom: 20 }}>📋 全班去向</p>
        <div style={{ maxWidth: 500, margin: '0 auto', width: '100%' }}>
          {sorted.map(s => {
            const avg = Math.round((s.scores.english + s.scores.math + s.scores.chinese) / 3)
            const outcome = computeFinalOutcome(s)
            const future = generateFutureCareer(s, avg)
            const changes = studentChanges[s.id] || []
            return (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <span style={{
                  fontSize: 13, color: '#e0d8c8', width: 60, flexShrink: 0,
                }}>{s.name}</span>
                <span style={{
                  fontSize: 11, color: outcome === '重点高中' ? '#4fc3f7' : outcome === '普通高中' ? '#ffab40' : '#888',
                  width: 70, flexShrink: 0,
                }}>{outcome}</span>
                <span style={{ fontSize: 11, color: '#666', flex: 1 }}>{future}</span>
                {changes.length > 0 && (
                  <span style={{ fontSize: 10, color: '#4caf50', flexShrink: 0 }}>
                    ↑{changes.reduce((s, c) => s + c.value, 0)}分
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Final message */}
        <div style={{ textAlign: 'center', margin: '40px 0', lineHeight: 2.4 }}>
          <p style={{ fontSize: 13, color: '#555', maxWidth: 360, margin: '0 auto' }}>
            那些你以为很漫长的三年，<br />
            其实转瞬即逝。
          </p>
          <p style={{ fontSize: 13, color: '#555', marginTop: 8 }}>
            但总有一些人、一些事，<br />
            留在了记忆里。
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', margin: '0 auto 40px', flexWrap: 'wrap' }}>
          <button onClick={() => { localStorage.removeItem(SAVE_KEY); onBack() }} style={{
            background: '#222', border: '1px solid #333', color: '#888',
            padding: '10px 32px', borderRadius: 4, cursor: 'pointer', fontSize: 13,
            fontFamily: '"Noto Serif SC", serif',
          }}>重新开始</button>
          <button onClick={onBack} style={{
            background: '#4fc3f7', border: 'none', color: '#0a0a1a',
            padding: '10px 32px', borderRadius: 4, cursor: 'pointer', fontSize: 13,
            fontFamily: '"Noto Serif SC", serif',
          }}>返回</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden',
      background: '#0d0d0d', fontFamily: '"Noto Serif SC", serif', color: '#e0d8c8',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(0,0,0,0.9)', borderBottom: '1px solid rgba(255,255,255,0.05)',
        zIndex: 20, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={onBack}
            style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 11 }}>
            ← 退出
          </button>
          <button onClick={() => setShowDiary(true)}
            style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#888',
              cursor: 'pointer', fontSize: 10, padding: '3px 10px', borderRadius: 4,
              fontFamily: '"Noto Serif SC", serif',
            }}>
            🌱 日记
          </button>
        </div>
        <span style={{ fontSize: 12, color: '#666' }}>
          初一（42）班 · {formatDate(year, month, day)}
        </span>
        <span style={{ fontSize: 11, color: '#333', width: 50, textAlign: 'right' }}>
          第{day}天
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', height: 2, background: '#1a1a1a', flexShrink: 0 }}>
        <div style={{
          width: `${(day / TOTAL_DAYS) * 100}%`, height: '100%',
          background: 'linear-gradient(90deg, #4fc3f7, #ffab40)',
          transition: 'width 0.5s',
        }} />
      </div>

      {/* Seating chart */}
      <div style={{
        flex: 1, overflow: 'auto', padding: '12px 8px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      }}>
        <p style={{ fontSize: 10, color: '#333', marginBottom: 4, letterSpacing: 1 }}>教 室 座 位 表</p>
        {grid.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
            {row.map((student, ci) => {
              if (ri === playerPos.row && ci === playerPos.col) {
                return (
                  <div key={`p-${ci}`} style={{
                    width: 44, height: 44, borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#4fc3f7', color: '#0a0a1a', fontSize: 10, fontWeight: 700,
                  }}>你</div>
                )
              }
              if (!student) return <div key={`e-${ci}`} style={{ width: 44, height: 44 }} />
              const avg = Math.round((student.scores.english + student.scores.math + student.scores.chinese) / 3)
              return (
                <div key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  style={{
                    width: 44, height: 44, borderRadius: 6,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: avg >= 80 ? 'rgba(79,195,247,0.15)' : avg >= 60 ? 'rgba(255,171,64,0.1)' : 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#4fc3f7')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                >
                  <span style={{ fontSize: 10, color: '#e0d8c8', lineHeight: 1.2 }}>{student.name}</span>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        padding: '8px 16px 12px', display: 'flex', justifyContent: 'center', gap: 10,
        borderTop: '1px solid rgba(255,255,255,0.03)', flexShrink: 0,
        alignItems: 'center',
      }}>
        <button onClick={advanceDay} disabled={advancing || currentEvent !== null || day >= TOTAL_DAYS}
          style={{
            background: 'linear-gradient(135deg, #4fc3f7, #29b6f6)', border: 'none',
            color: '#0a0a1a', padding: '8px 24px', borderRadius: 6, cursor: 'pointer',
            fontSize: 12, fontWeight: 600, fontFamily: '"Noto Serif SC", serif',
            opacity: (advancing || currentEvent !== null) ? 0.4 : 1,
          }}>
          ⏭ 下一天
        </button>
        <button onClick={() => setShowTutorial(true)}
          style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#555',
            padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 10,
            fontFamily: '"Noto Serif SC", serif',
          }}>
          ❓ 怎么玩
        </button>
      </div>

      {/* Student card modal */}
      {selectedStudent && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)', padding: 20,
        }} onClick={() => setSelectedStudent(null)}>
          <div style={{
            background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
            padding: '24px 28px', maxWidth: 320, width: '100%',
            maxHeight: '80vh', overflow: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 20, color: '#f0e8d8' }}>{selectedStudent.name}</span>
                <span style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>{selectedStudent.gender}</span>
              </div>
              <span style={{ fontSize: 11, color: '#888' }}>{selectedStudent.personality}</span>
            </div>

            {/* Scores */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {(['english', 'math', 'chinese'] as const).map(s => (
                <div key={s} style={{
                  flex: 1, textAlign: 'center', padding: '8px 4px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: 6,
                }}>
                  <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>
                    {s === 'english' ? '英语' : s === 'math' ? '数学' : '语文'}
                  </div>
                  <div style={{
                    fontSize: 16, fontWeight: 700,
                    color: selectedStudent.scores[s] >= 80 ? '#4fc3f7' : selectedStudent.scores[s] >= 60 ? '#ffab40' : '#888',
                  }}>{selectedStudent.scores[s]}</div>
                </div>
              ))}
            </div>

            {/* Changes */}
            {studentChanges[selectedStudent.id]?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, color: '#4caf50', marginBottom: 4 }}>成绩提升记录</p>
                {studentChanges[selectedStudent.id].map((c, i) => (
                  <span key={i} style={{ fontSize: 10, color: '#4caf50', marginRight: 6 }}>
                    {c.label} +{c.value}
                  </span>
                ))}
              </div>
            )}

            {/* Info rows */}
            {[
              ['状态', selectedStudent.status],
              ['最近', selectedStudent.recent],
              ['家庭', selectedStudent.family],
              ['人缘', selectedStudent.popularity],
              ['梦想', selectedStudent.dream],
            ].map(([k, v]) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12,
              }}>
                <span style={{ color: '#666' }}>{k}</span>
                <span style={{ color: k === '梦想' ? '#ffab40' : '#c8b898' }}>{v}</span>
              </div>
            ))}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              {[{ label: '💬 聊天', color: '#4fc3f7' }, { label: '🤝 组队', color: '#ffab40' }].map(btn => (
                <button key={btn.label}
                  onClick={() => {
                    setSelectedStudent(null)
                    setEventLog(prev => [`你和${selectedStudent.name}聊了一会儿`, ...prev.slice(0, 30)])
                    const bumped = Math.floor(Math.random() * 5) + 1
                    setStudentsState(prev => prev.map(s =>
                      s.id === selectedStudent.id
                        ? { ...s, scores: { ...s.scores, english: Math.min(100, s.scores.english + bumped) } }
                        : s
                    ))
                    setStudentChanges(c => ({
                      ...c,
                      [selectedStudent.id]: [...(c[selectedStudent.id] || []), { label: '互动', value: bumped }],
                    }))
                  }}
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#c8b898', padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
                    fontSize: 12, fontFamily: '"Noto Serif SC", serif',
                  }}>
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tutorial */}
      {showTutorial && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 110,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.85)', padding: 20,
        }} onClick={() => setShowTutorial(false)}>
          <div style={{
            background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
            padding: '28px 24px', maxWidth: 360, width: '100%',
          }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: 18, color: '#f0e8d8', textAlign: 'center', marginBottom: 16 }}>🏫 欢迎来到42班</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['点击同学', '查看档案 · 聊天互动'],
                ['点击「下一天」', '时间推进 → 触发日常事件'],
                ['在事件中做选择', '影响自己和他人的成长'],
                ['点击「日记」', '记录每天的心情和愿望'],
                ['坚持 150 天', '毕业结算 · 全班去向'],
              ].map(([a, b]) => (
                <div key={a} style={{ fontSize: 12, lineHeight: 1.6 }}>
                  <span style={{ color: '#4fc3f7' }}>{a}</span>
                  <br />
                  <span style={{ color: '#888' }}>{b}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowTutorial(false)}
              style={{
                marginTop: 20, width: '100%', background: '#4fc3f7', border: 'none',
                color: '#0a0a1a', padding: '10px', borderRadius: 8, cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: '"Noto Serif SC", serif',
              }}>
              知道了
            </button>
          </div>
        </div>
      )}

      {/* Event dialog */}
      {currentEvent && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 90,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.8)', padding: 20,
        }}>
          <div style={{
            background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
            padding: '28px 24px', maxWidth: 380, width: '100%',
            maxHeight: '80vh', overflow: 'auto',
          }}>
            <p style={{ fontSize: 14, color: '#ffab40', marginBottom: 14 }}>{currentEvent.title}</p>
            <p style={{
              fontSize: 14, color: '#c8b898', lineHeight: 2.2, whiteSpace: 'pre-wrap', marginBottom: 20,
            }}>{currentEvent.desc}</p>

            {!choiceMade ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {currentEvent.choices.map((c, i) => (
                  <button key={i} onClick={() => handleChoice(c, currentEvent)}
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#e0d8c8', padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
                      fontSize: 13, fontFamily: '"Noto Serif SC", serif', textAlign: 'left', lineHeight: 1.6,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#4fc3f7')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}>
                    {c.label}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <p style={{
                  fontSize: 13, color: '#888', lineHeight: 2, whiteSpace: 'pre-wrap', marginBottom: 16,
                }}>{choiceResult}</p>
                <button onClick={closeEvent}
                  style={{
                    background: '#4fc3f7', border: 'none', color: '#0a0a1a', padding: '8px 28px',
                    borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    fontFamily: '"Noto Serif SC", serif', width: '100%',
                  }}>
                  继续
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event log sidebar */}
      {eventLog.length > 0 && (
        <div style={{
          position: 'absolute', top: 64, right: 8, width: 160, zIndex: 15,
          maxHeight: 'calc(100vh - 160px)', overflow: 'hidden',
          pointerEvents: 'none',
        }}>
          {eventLog.slice(0, 6).map((log, i) => (
            <div key={i} style={{
              fontSize: 10, color: i === 0 ? '#ffab40' : '#333', padding: '3px 6px',
              textAlign: 'right', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{log}</div>
          ))}
        </div>
      )}
    </div>
  )
}
