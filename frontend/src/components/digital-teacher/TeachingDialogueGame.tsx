import React, { useState, useCallback } from 'react'
import { SCENES } from './teachingDialogueData'
import type { Choice, GameStats } from './teachingDialogueData'

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const fmt = (v: number) => v >= 0 ? `+${v}` : `${v}`

export default function TeachingDialogueGame({ onBack }: { onBack: () => void }) {
  const [sceneQueue, setSceneQueue] = useState(() => shuffleArray(SCENES))
  const [sceneIdx, setSceneIdx] = useState(0)
  const [lineIdx, setLineIdx] = useState(0)
  const [chosen, setChosen] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [stats, setStats] = useState<GameStats>({ atmosphere: 0, favor: 0, progress: 0, energy: 100 })
  const [log, setLog] = useState<string[]>([])
  const [finished, setFinished] = useState(false)

  const scene = sceneQueue[sceneIdx]

  const nextLine = useCallback(() => {
    if (lineIdx < scene.lines.length - 1) {
      setLineIdx(i => i + 1)
    } else {
      setChosen(true)
    }
  }, [lineIdx, scene])

  const handleChoice = useCallback((choice: Choice, i: number) => {
    setShowResult(true)
    setStats(s => ({
      atmosphere: s.atmosphere + choice.atmosphere,
      favor: s.favor + choice.favor,
      progress: s.progress + choice.progress,
      energy: s.energy + choice.energy,
    }))
    const parts = [`选择${['A','B','C','D'][i]}`]
    if (choice.atmosphere !== 0) parts.push(`氛围${fmt(choice.atmosphere)}`)
    if (choice.favor !== 0) parts.push(`好感${fmt(choice.favor)}`)
    if (choice.progress !== 0) parts.push(`进度${fmt(choice.progress)}`)
    if (choice.energy !== 0) parts.push(`精力${fmt(choice.energy)}`)
    setLog(prev => [`${scene.title}: ${parts.join(' ')}`, ...prev].slice(0, 20))
    setChosen(true)
  }, [scene])

  const nextScene = useCallback(() => {
    setShowResult(false)
    setChosen(false)
    setLineIdx(0)
    if (sceneIdx < sceneQueue.length - 1) {
      setSceneIdx(i => i + 1)
    } else {
      setFinished(true)
    }
  }, [sceneIdx, sceneQueue])

  if (finished) {
    const total = stats.atmosphere + stats.favor + stats.progress
    let grade: string, comment: string
    if (total >= 50) { grade = 'S'; comment = '💎 你简直是天生的教育家！' }
    else if (total >= 30) { grade = 'A'; comment = '🌟 优秀教师，学生们都很喜欢你！' }
    else if (total >= 10) { grade = 'B'; comment = '👍 还不错，继续努力哦！' }
    else if (total >= -10) { grade = 'C'; comment = '😅 勉强及格，教学之路任重道远' }
    else { grade = 'D'; comment = '😱 学生已集体申请换老师……' }

    return (
      <div style={{
        width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #fff5e6, #fce4d6)',
        fontFamily: '"Noto Serif SC", serif', padding: 20,
      }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>📚</div>
        <h1 style={{ fontSize: 24, color: '#8b6914', marginBottom: 4 }}>教学结束！</h1>
        <div style={{ fontSize: 48, fontWeight: 700, color: '#c0392b', margin: '8px 0' }}>{grade}</div>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 16, textAlign: 'center', maxWidth: 280 }}>{comment}</p>
        <div style={{
          background: 'rgba(255,255,255,0.6)', padding: '16px 24px', borderRadius: 8,
          marginBottom: 20, minWidth: 200, textAlign: 'center',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px', fontSize: 12 }}>
            <span>🎭 课堂氛围</span><span style={{ color: '#8e44ad', fontWeight: 600 }}>{stats.atmosphere}</span>
            <span>❤️ 学生好感</span><span style={{ color: '#e74c3c', fontWeight: 600 }}>{stats.favor}</span>
            <span>📈 教学进度</span><span style={{ color: '#2980b9', fontWeight: 600 }}>{stats.progress}</span>
            <span>⚡ 剩余精力</span><span style={{ color: '#27ae60', fontWeight: 600 }}>{stats.energy}</span>
          </div>
        </div>
        <button onClick={onBack} style={{
          background: '#8b6914', border: 'none', color: 'white', padding: '10px 32px',
          borderRadius: 6, cursor: 'pointer', fontSize: 14, fontFamily: '"Noto Serif SC", serif',
        }}>返回</button>
      </div>
    )
  }

  if (!scene) return null

  const currentLine = scene.lines[lineIdx]
  const isMe = currentLine.speaker === '你'

  return (
    <div style={{
      width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(180deg, #fef8f0 0%, #f8f0e0 100%)',
      fontFamily: '"Noto Serif SC", serif',
    }}>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,248,240,0.95)', borderBottom: '1px solid #e8dcc8',
        padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#8b6914', cursor: 'pointer', fontSize: 13 }}>← 返回</button>
        <span style={{ fontWeight: 600, fontSize: 13, color: '#8b6914' }}>📚 课堂对话 · {scene.title}</span>
        <span style={{ fontSize: 11, color: '#aaa' }}>{sceneIdx + 1}/{sceneQueue.length}</span>
      </div>

      {/* Stats bar */}
      <div style={{
        position: 'absolute', top: 44, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,248,240,0.9)', padding: '6px 16px',
        display: 'flex', gap: 16, fontSize: 11, color: '#666', borderBottom: '1px solid #f0e8d8',
      }}>
        <span>🎭 {stats.atmosphere}</span>
        <span>❤️ {stats.favor}</span>
        <span>📈 {stats.progress}</span>
        <span>⚡ {stats.energy}</span>
      </div>

      {/* Main area */}
      <div style={{
        position: 'absolute', top: 80, bottom: 0, left: 0, right: 0,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Scene description */}
        <div style={{
          padding: '20px 24px 12px', color: '#8b6914', fontSize: 13, fontStyle: 'italic',
          textAlign: 'center', lineHeight: 1.6,
        }}>
          {scene.setup}
        </div>

        {/* Dialogue area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px' }}>
          {!chosen ? (
            /* Dialogue display */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                background: isMe ? '#e8f5e9' : '#fff8e1',
                border: `1px solid ${isMe ? '#a5d6a7' : '#ffe082'}`,
                borderRadius: 12, padding: '16px 24px', maxWidth: 420,
                textAlign: 'left',
              }}>
                <div style={{ fontSize: 11, color: isMe ? '#388e3c' : '#f57f17', marginBottom: 6, fontWeight: 600 }}>
                  {isMe ? '👩‍🏫 ' : ''}{currentLine.speaker}
                </div>
                <p style={{ fontSize: 14, color: '#5d4037', lineHeight: 1.8, margin: 0 }}>
                  "{currentLine.text}"
                </p>
              </div>
              {lineIdx < scene.lines.length - 1 && (
                <button onClick={nextLine} style={{
                  marginTop: 16, background: '#8b6914', border: 'none', color: 'white',
                  padding: '8px 24px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
                  fontFamily: '"Noto Serif SC", serif',
                }}>继续 →</button>
              )}
            </div>
          ) : !showResult ? (
            /* Choices */
            <div>
              <p style={{ textAlign: 'center', color: '#8b6914', fontSize: 12, marginBottom: 12 }}>你该怎么做？</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400, margin: '0 auto' }}>
                {scene.choices.map((c, i) => (
                  <button key={i} onClick={() => handleChoice(c, i)} style={{
                    background: 'white', border: '1px solid #e0d5c0', borderRadius: 8,
                    padding: '10px 16px', cursor: 'pointer', textAlign: 'left',
                    fontFamily: '"Noto Serif SC", serif', fontSize: 13, color: '#5d4037',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b6914'; e.currentTarget.style.background = '#fffdf5' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0d5c0'; e.currentTarget.style.background = 'white' }}
                  >
                    <span style={{ color: '#8b6914', fontWeight: 700, marginRight: 8 }}>{['A', 'B', 'C', 'D'][i]}</span>
                    {c.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Result */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                background: '#e8f5e9', border: '1px solid #a5d6a7',
                borderRadius: 12, padding: '16px 24px', maxWidth: 400,
                textAlign: 'left',
              }}>
                <div style={{ fontSize: 11, color: '#388e3c', marginBottom: 6, fontWeight: 600 }}>
                  👩‍🏫 {scene.resultLine.speaker}
                </div>
                <p style={{ fontSize: 14, color: '#5d4037', lineHeight: 1.8, margin: 0 }}>
                  "{scene.resultLine.text}"
                </p>
              </div>
              <button onClick={nextScene} style={{
                marginTop: 16, background: '#8b6914', border: 'none', color: 'white',
                padding: '8px 24px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
                fontFamily: '"Noto Serif SC", serif',
              }}>{sceneIdx < sceneQueue.length - 1 ? '下一题 →' : '查看成绩 →'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
