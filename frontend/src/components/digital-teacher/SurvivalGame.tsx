import React, { useState, useEffect, useRef, useCallback } from 'react'
import SurvivalRobot from './SurvivalRobot'
import {
  EVENTS, RANDOM_EVENTS, STAGES, getStage, calcBaldness,
} from './survivalGameData'
import type { GameEvent, Choice } from './survivalGameData'

const TIME_SPEED = 3

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function gameMinutes(minutes: number): number {
  return 360 + minutes
}

function playTone(freq: number, duration: number, type: OscillatorType = 'square', vol = 0.08) {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.value = vol
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {}
}

function playMentalDown() {
  playTone(200, 0.3, 'sawtooth', 0.05)
}

type EventType = GameEvent & { isRandom?: boolean }

const fmt = (v: number) => v >= 0 ? `+${v}` : `${v}`

export default function SurvivalGame({ onBack }: { onBack: () => void }) {
  const [mental, setMental] = useState(100)
  const [material, setMaterial] = useState(0)
  const [complaints, setComplaints] = useState(0)
  const [sincerity, setSincerity] = useState(0)
  const [studentFavor, setStudentFavor] = useState(0)
  const [studentObedience, setStudentObedience] = useState(0)
  const [parentSatisfaction, setParentSatisfaction] = useState(0)
  const [colleague, setColleague] = useState(0)
  const [time, setTime] = useState(0)
  const [currentEvent, setCurrentEvent] = useState<EventType | null>(null)
  const [usedEvents, setUsedEvents] = useState<Set<number>>(new Set())
  const [log, setLog] = useState<string[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [shake, setShake] = useState(false)
  const [eventLog, setEventLog] = useState<string[]>([])
  const mentalRef = useRef(mental)
  mentalRef.current = mental

  useEffect(() => {
    if (gameOver) return
    const interval = setInterval(() => {
      setTime(t => {
        const nt = t + 3
        if (nt >= 1200) { setGameOver(true); return 1200 }
        return nt
      })
    }, TIME_SPEED * 1000 / 60)
    return () => clearInterval(interval)
  }, [gameOver])

  useEffect(() => {
    if (gameOver) return
    const cm = gameMinutes(time)
    const idx = EVENTS.findIndex((ev, i) => {
      const [h, m] = ev.time.split(':').map(Number)
      return Math.abs(cm - (h * 60 + m)) < 3 && !usedEvents.has(i)
    })
    if (idx >= 0) {
      setUsedEvents(p => new Set(p).add(idx))
      setCurrentEvent(EVENTS[idx])
      return
    }
    if (time > 30 && Math.random() < 0.003) {
      setCurrentEvent({ ...RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)], isRandom: true })
    }
  }, [time])

  const handleChoice = useCallback((choice: Choice) => {
    if (!currentEvent) return

    setMental(m => Math.max(0, m + choice.mental))
    setMaterial(m => m + choice.material)
    if (choice.parentComplaint) setComplaints(c => c + choice.parentComplaint)
    if (choice.sincerity) setSincerity(s => s + choice.sincerity)
    if (choice.studentFavor) setStudentFavor(s => s + choice.studentFavor)
    if (choice.studentObedience) setStudentObedience(s => s + choice.studentObedience)
    if (choice.parentSatisfaction) setParentSatisfaction(s => s + choice.parentSatisfaction)
    if (choice.colleague) setColleague(c => c + choice.colleague)

    const parts = [`🧠${fmt(choice.mental)}`, `📄${fmt(choice.material)}`]
    if (choice.parentComplaint) parts.push(`😤+${choice.parentComplaint}`)
    if (choice.sincerity) parts.push(`💛+${choice.sincerity}`)
    if (choice.studentFavor) parts.push(`👍+${choice.studentFavor}`)
    if (choice.studentObedience) parts.push(`👂+${choice.studentObedience}`)
    if (choice.parentSatisfaction) parts.push(`😊+${choice.parentSatisfaction}`)
    if (choice.colleague) parts.push(`🤝${fmt(choice.colleague)}`)
    setLog(prev => [`${currentEvent.title}: ${parts.join(' ')}`, ...prev].slice(0, 30))

    if (currentEvent.robotSays) {
      setEventLog(prev => [currentEvent.robotSays!, ...prev].slice(0, 5))
    }

    playTone(400, 0.08, 'square', 0.04)
    if (choice.mental < -10) playMentalDown()

    if (mentalRef.current + choice.mental <= 0) {
      setTimeout(() => { setGameOver(true); setShake(true); playTone(100, 0.5, 'sawtooth', 0.1); setTimeout(() => setShake(false), 500) }, 500)
    }

    setCurrentEvent(null)
  }, [currentEvent])

  useEffect(() => {
    if (mental <= 0 && gameOver) {
      const i = setInterval(() => setShake(s => !s), 100)
      setTimeout(() => { clearInterval(i); setShake(false) }, 2000)
      return () => clearInterval(i)
    }
  }, [mental, gameOver])

  const currentStage = getStage(mental)
  const baldness = calcBaldness(mental)
  const currentMinutes = gameMinutes(time)

  useEffect(() => {
    if (gameOver) return
    const hour = Math.floor(currentMinutes / 60)
    if (hour >= 22 || hour < 7) {
      const i = setInterval(() => playTone(110, 0.5, 'sine', 0.015), 5000)
      return () => clearInterval(i)
    }
  }, [time, gameOver])

  if (gameOver) {
    const isStrike = mental <= 0
    const finalScore = material + sincerity * 2 + studentFavor + parentSatisfaction - complaints * 3
    return (
      <div style={{
        width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: isStrike ? '#0a0a0a' : 'linear-gradient(135deg, #1a1a2e, #16213e)',
        color: '#e0d8c8', fontFamily: '"Noto Serif SC", serif', padding: 20, overflow: 'auto',
      }}>
        {isStrike ? (
          <>
            <div style={{ fontSize: 64, marginBottom: 20 }}>💥</div>
            <h1 style={{ color: '#e74c3c', fontSize: 24, marginBottom: 12 }}>机器人罢工了！</h1>
            <p style={{ color: '#888', fontSize: 13, textAlign: 'center', maxWidth: 300, marginBottom: 16 }}>
              全身冒烟 · 黑屏 · 只剩红灯闪烁<br />"今晚不批作业了！😤"
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🏆</div>
            <h1 style={{ color: '#f5e8c8', fontSize: 24, marginBottom: 8 }}>恭喜你撑过24小时！</h1>
            <p style={{ color: '#c8b898', fontSize: 12, marginBottom: 16, maxWidth: 280, textAlign: 'center' }}>
              "我撑是撑过去了……但我感觉自己老了10岁。"
            </p>
          </>
        )}
        <div style={{
          background: 'rgba(255,255,255,0.06)', padding: '16px 24px', borderRadius: 8,
          marginBottom: 20, minWidth: 220, textAlign: 'center',
        }}>
          <p style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>📊 最终结算</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 12 }}>
            <span>📄 材料分</span><span style={{ color: '#4fc3f7', fontWeight: 600 }}>{material}</span>
            <span>💛 真心值</span><span style={{ color: '#fdd835', fontWeight: 600 }}>{sincerity}</span>
            <span>👍 学生好感</span><span style={{ color: '#81c784', fontWeight: 600 }}>{studentFavor}</span>
            <span>😊 家长满意</span><span style={{ color: '#a5d6a7', fontWeight: 600 }}>{parentSatisfaction}</span>
            <span>😤 家长投诉</span><span style={{ color: '#ff5252', fontWeight: 600 }}>{complaints}</span>
            <span>🧑‍🦲 秃头进度</span><span style={{ color: '#ffab40', fontWeight: 600 }}>{baldness}%</span>
          </div>
          <p style={{ marginTop: 10, fontSize: 11, color: '#888' }}>称号：{currentStage.label}</p>
          {!isStrike && <p style={{ marginTop: 6, fontSize: 16, color: '#4fc3f7', fontWeight: 700 }}>总分：{finalScore}</p>}
        </div>
        {isStrike && (
          <div style={{
            background: 'rgba(231,76,60,0.1)', border: '1px solid #e74c3c', borderRadius: 6,
            padding: '10px 16px', marginBottom: 16, fontSize: 12, color: '#e74c3c', maxWidth: 280, textAlign: 'center',
          }}>
            ⚠️ 检测到教师精神状态严重透支<br />建议：立即放假三天！🏖️
          </div>
        )}
        <button onClick={onBack} style={{
          background: '#4fc3f7', border: 'none', color: '#0a0a1e', padding: '10px 32px',
          borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
          fontFamily: '"Noto Serif SC", serif',
        }}>返回</button>
      </div>
    )
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden',
      background: '#0f1923', fontFamily: '"Noto Serif SC", serif', color: '#e0d8c8',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: currentMinutes < 480 ? 'linear-gradient(180deg, #ffd6a5 0%, #87CEEB 30%, #4a90d9 60%)' :
          currentMinutes < 720 ? 'linear-gradient(180deg, #4a90d9 0%, #87CEEB 40%, #c8e6c9 70%)' :
          currentMinutes < 1020 ? 'linear-gradient(180deg, #ff8a65 0%, #ff6f00 40%, #1a237e 70%)' :
          'linear-gradient(180deg, #0d1b2a 0%, #1b2838 50%, #0a0a1a 100%)',
        opacity: 0.4, transition: 'background 1s ease',
      }} />

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(15,25,35,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12 }}>← 返回</button>
          <span style={{ fontSize: 14, color: '#4fc3f7', fontWeight: 600 }}>⏰ {formatTime(currentMinutes)}</span>
          <span style={{ fontSize: 11, color: '#666' }}>管理团队 · 生存挑战</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 70 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 2 }}>
              <span>🧠 精神</span><span style={{ color: mental < 30 ? '#ff5252' : mental < 60 ? '#ffab40' : '#69f0ae' }}>{mental}</span>
            </div>
            <div style={{ height: 5, background: '#2a2a3a', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${mental}%`, height: '100%', background: mental < 30 ? '#ff5252' : mental < 60 ? '#ffab40' : '#69f0ae', borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
          </div>
          <MiniStat label="📄" value={`+${material}`} color="#4fc3f7" />
          <MiniStat label="💛" value={`+${sincerity}`} color="#fdd835" />
          <MiniStat label="👍" value={`+${studentFavor}`} color="#81c784" />
          <MiniStat label="😤" value={`${complaints}`} color="#ff5252" />
          <div style={{
            background: mental < 30 ? 'rgba(255,82,82,0.15)' : 'rgba(79,195,247,0.1)',
            border: `1px solid ${mental < 30 ? '#ff5252' : '#4fc3f7'}`,
            padding: '2px 6px', borderRadius: 4, fontSize: 9, whiteSpace: 'nowrap',
            color: mental < 30 ? '#ff5252' : '#4fc3f7',
          }}>{currentStage.label}</div>
        </div>
        <div style={{ marginTop: 4, height: 2, background: '#2a2a3a', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${(time / 1200) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #4fc3f7, #ffab40, #ff5252)', borderRadius: 2, transition: 'width 0.5s' }} />
        </div>
      </div>

      {/* Main */}
      <div style={{
        position: 'absolute', top: 82, bottom: 0, left: 0, right: 0,
        display: 'flex',
      }}>
        <div style={{
          width: '30%', minWidth: 160, maxWidth: 220, padding: '16px 12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <SurvivalRobot stage={currentStage} mental={mental} baldness={baldness} shake={shake} />
          {eventLog.length > 0 && (
            <div style={{
              marginTop: 10, padding: '6px 10px', background: 'rgba(79,195,247,0.08)',
              borderLeft: '2px solid #4fc3f7', fontSize: 10, color: '#aaa',
              maxWidth: 180, lineHeight: 1.5, borderRadius: '0 4px 4px 0',
            }}>🤖 {eventLog[0]}</div>
          )}
        </div>

        <div style={{
          flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', position: 'relative',
        }}>
          {currentEvent ? (
            <div style={{
              width: '100%', maxWidth: 500,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, padding: '20px 18px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 10, color: '#888' }}>{currentEvent.isRandom ? '⚡ 随机事件' : currentEvent.time}</span>
                <span style={{ fontSize: 14 }}>📋</span>
              </div>
              <h2 style={{ fontSize: 15, marginBottom: 6, color: '#e0d8c8' }}>{currentEvent.title}</h2>
              <p style={{ fontSize: 12, color: '#aaa', lineHeight: 1.7, marginBottom: 14, whiteSpace: 'pre-wrap' }}>{currentEvent.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {currentEvent.choices.map((c, i) => (
                  <button key={i} onClick={() => handleChoice(c)} style={{
                    background: 'rgba(79,195,247,0.06)', border: '1px solid rgba(79,195,247,0.2)',
                    color: '#e0d8c8', padding: '8px 14px', borderRadius: 6, cursor: 'pointer',
                    fontSize: 12, textAlign: 'left', fontFamily: '"Noto Serif SC", serif',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,195,247,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,195,247,0.06)'}
                  >
                    <span style={{ color: '#4fc3f7', marginRight: 6, fontWeight: 600 }}>{['A', 'B', 'C', 'D'][i]}</span>
                    {c.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#555' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>⏳</div>
              <p style={{ fontSize: 13 }}>等待下一个事件……</p>
              {log.length > 0 && (
                <div style={{ marginTop: 16, maxWidth: 340 }}>
                  <p style={{ fontSize: 10, color: '#444', marginBottom: 6 }}>最近处理：</p>
                  {log.slice(0, 6).map((entry, i) => (
                    <p key={i} style={{ fontSize: 10, color: '#555', lineHeight: 1.5, margin: '1px 0' }}>▸ {entry}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ minWidth: 30, textAlign: 'center' }}>
      <div style={{ fontSize: 9 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color }}>{value}</div>
    </div>
  )
}
