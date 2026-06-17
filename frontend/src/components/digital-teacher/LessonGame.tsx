import React, { useState, useCallback, useEffect, useRef } from 'react'
import { generateScenes } from './lessonGameData'
import type { Line, Choice } from './lessonGameData'

export default function LessonGame({ onBack }: { onBack: () => void }) {
  const [scenes] = useState(() => generateScenes())
  const [sceneIdx, setSceneIdx] = useState(0)
  const [lineIdx, setLineIdx] = useState(0)
  const [blackout, setBlackout] = useState<string | null>(null)
  const [showChoice, setShowChoice] = useState<Choice | null>(null)
  const [choiceResult, setChoiceResult] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)
  const [revealNext, setRevealNext] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const scene = scenes[sceneIdx]
  const line: Line | undefined = scene?.lines[lineIdx]

  const advance = useCallback(() => {
    setRevealNext(true)
    setChoiceResult(null)
    if (!scene) return
    if (lineIdx < scene.lines.length - 1) {
      setLineIdx(i => i + 1)
    } else if (sceneIdx < scenes.length - 1) {
      setSceneIdx(i => i + 1)
      setLineIdx(0)
    } else {
      setFinished(true)
    }
  }, [scene, lineIdx, sceneIdx, scenes])

  useEffect(() => {
    if (!line || finished) return
    setRevealNext(false)
    setChoiceResult(null)

    if (line.type === 'blackout') {
      setBlackout((line as any).text ?? null)
      timerRef.current = setTimeout(() => { setBlackout(null); setRevealNext(true) }, 1000)
      return () => clearTimeout(timerRef.current)
    }
    if (line.type === 'choice') {
      setShowChoice((line as any).choice)
      return
    }
    if (line.type === 'divider') {
      timerRef.current = setTimeout(() => advance(), 350)
      return () => clearTimeout(timerRef.current)
    }
    const delay = (line as any).delay ?? (line.type === 'system' ? 500 : 1000)
    timerRef.current = setTimeout(() => setRevealNext(true), delay)
    return () => clearTimeout(timerRef.current)
  }, [line, finished])

  const handleChoice = useCallback((idx: number) => {
    if (!showChoice) return
    const opt = showChoice.options[idx]
    setChoiceResult(opt.reaction)
    setShowChoice(null)
    setRevealNext(true)
  }, [showChoice])

  if (finished) {
    return (
      <div style={{
        width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#000', color: '#e0d8c8',
        fontFamily: '"Noto Serif SC", "SimSun", serif', padding: 20,
      }}>
        <div style={{ fontSize: 14, color: '#666', lineHeight: 2.2, textAlign: 'center', maxWidth: 400 }}>
          <p style={{ color: '#f5e8c8', fontSize: 16, marginBottom: 20 }}>📖 《这节课》</p>
          <p>你教过：<span style={{ color: '#4fc3f7', fontSize: 20 }}>1268</span> 名学生</p>
          <p style={{ color: '#888', marginTop: 16 }}>你记得其中很多人，但更多人记得你。</p>
          <div style={{ margin: '24px 0', height: 1, background: '#333' }} />
          <p style={{ color: '#aaa', fontSize: 13, lineHeight: 2 }}>
            课堂从来不只是传授知识。<br />有些课讲完就忘了。<br />有些话会留在人一生里。
          </p>
        </div>
        <button onClick={onBack} style={{
          marginTop: 32, background: '#333', border: 'none', color: '#aaa',
          padding: '10px 32px', borderRadius: 4, cursor: 'pointer', fontSize: 13,
          fontFamily: '"Noto Serif SC", serif',
        }}>返回</button>
      </div>
    )
  }

  if (!line) return null

  return (
    <div style={{
      width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden',
      background: '#1a1a1a',
      fontFamily: '"Noto Serif SC", "SimSun", serif', color: '#e0d8c8',
      cursor: revealNext ? 'pointer' : 'default',
    }} onClick={() => { if (revealNext && !showChoice) advance() }}>
      {/* Blackout overlay */}
      {blackout !== null && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 200,
          background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <p style={{ color: '#888', fontSize: 16, letterSpacing: 2 }}>{blackout}</p>
        </div>
      )}

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 12 }}>← 退出</button>
        <span style={{ fontSize: 11, color: '#444' }}>{scene.title || '《这节课》'}</span>
        <span style={{ fontSize: 11, color: '#444' }}>{sceneIdx + 1}/{scenes.length}</span>
      </div>

      {/* Click hint */}
      {revealNext && !showChoice && (
        <div style={{
          position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 50,
          color: '#444', fontSize: 11,
        }}>点击继续 ▸</div>
      )}

      {/* Main content */}
      <div style={{
        position: 'absolute', inset: 0, top: 50,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '10px 24px 40px',
      }}>
        {/* Choice result */}
        {choiceResult && (
          <p style={{
            fontSize: 14, lineHeight: 2, color: '#ffab40', textAlign: 'center',
            whiteSpace: 'pre-wrap', maxWidth: 400, margin: '0 auto',
          }}>{choiceResult}</p>
        )}

        {!choiceResult && showChoice && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#888', marginBottom: 16 }}>{showChoice.prompt}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360, margin: '0 auto' }}>
              {showChoice.options.map((opt, i) => (
                <button key={i} onClick={() => handleChoice(i)} style={{
                  background: 'rgba(255,171,64,0.08)', border: '1px solid rgba(255,171,64,0.3)',
                  color: '#e0d8c8', padding: '10px 16px', borderRadius: 6, cursor: 'pointer',
                  fontSize: 13, fontFamily: '"Noto Serif SC", serif', textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,171,64,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,171,64,0.08)'}
                >
                  <span style={{ color: '#ffab40', fontWeight: 600, marginRight: 8 }}>{['A','B','C','D'][i]}</span>
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {!choiceResult && !showChoice && (
          <>
            {line.type === 'stats' && (
              <div style={{ textAlign: 'center' }}>
                {(line as any).data && Object.entries((line as any).data).map(([k, v]) => (
                  <p key={k as string} style={{ fontSize: 16, color: '#4fc3f7', margin: '6px 0' }}>{k}：<b>{v}</b></p>
                ))}
              </div>
            )}

            {line.type === 'narrator' && (
              <p style={{ fontSize: 15, lineHeight: 2.2, color: '#c8b898', textAlign: 'center', whiteSpace: 'pre-wrap' }}>
                {(line as any).text}
              </p>
            )}

            {line.type === 'system' && (
              <p style={{ fontSize: 13, lineHeight: 2, color: '#4fc3f7', textAlign: 'center' }}>
                {(line as any).text}
              </p>
            )}

            {line.type === 'dialogue' && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                  {(line as any).speaker === '你' ? '👩‍🏫 ' : ''}{(line as any).speaker}
                </p>
                <p style={{ fontSize: 16, lineHeight: 2, color: '#f0e8d8', maxWidth: 400, margin: '0 auto' }}>
                  "{(line as any).text}"
                </p>
              </div>
            )}

            {line.type === 'event' && (
              <p style={{ fontSize: 13, color: '#ffab40', textAlign: 'center', fontStyle: 'italic' }}>
                {(line as any).text}
              </p>
            )}

            {line.type === 'roast' && (
              <p style={{
                fontSize: 12, color: '#666', textAlign: 'center', fontStyle: 'italic',
                maxWidth: 340, margin: '0 auto',
              }}>
                💬 {(line as any).text}
              </p>
            )}
          </>
        )}
      </div>

      {/* Phase indicator */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 50,
        display: 'flex', gap: 4,
      }}>
        {scenes.map((_, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: i === sceneIdx ? '#4fc3f7' : '#333', transition: 'background 0.3s',
          }} />
        ))}
      </div>
    </div>
  )
}
