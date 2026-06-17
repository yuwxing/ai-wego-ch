import React, { useState, useCallback, useEffect, useRef } from 'react'
import { generateMoments } from './studentLessonData'
import type { Moment, AttentionSnapshot } from './studentLessonData'

export default function StudentLessonGame({ onBack }: { onBack: () => void }) {
  const [moments] = useState(() => generateMoments())
  const [idx, setIdx] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)
  const [finished, setFinished] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const scrollRef = useRef<HTMLDivElement>(null)

  const advance = useCallback(() => {
    if (idx < moments.length - 1) {
      setFadeIn(false)
      setTimeout(() => {
        setIdx(i => i + 1)
        setFadeIn(true)
      }, 80)
    } else {
      setFinished(true)
    }
  }, [idx, moments])

  // auto-advance for certain types
  useEffect(() => {
    const m = moments[idx]
    if (!m || finished) return
    if (m.type !== 'phase') return
    timerRef.current = setTimeout(advance, 600)
    return () => clearTimeout(timerRef.current)
  }, [idx, moments, finished])

  // scroll to top on new moment
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [idx])

  if (finished) {
    return (
      <div style={{
        width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#0d0d0d', color: '#e0d8c8',
        fontFamily: '"Noto Serif SC", "SimSun", serif', padding: 20,
      }}>
        <div style={{ fontSize: 14, color: '#666', lineHeight: 2.5, textAlign: 'center', maxWidth: 380 }}>
          <p style={{ color: '#c8b898', fontSize: 16, marginBottom: 20 }}>📖 《这节课》· 学生视角</p>
          <p style={{ color: '#888' }}>— 致每一个曾经坐在教室里的人 —</p>
          <div style={{ margin: '24px 0', height: 1, background: '#222' }} />
          <p style={{ color: '#555', fontSize: 13, lineHeight: 2 }}>
            那些年觉得好长的40分钟，<br />现在回头看，原来那么短。
          </p>
          <p style={{ color: '#555', fontSize: 13, marginTop: 12 }}>
            那时候以为只是普通的一天，<br />后来才发现，<br />那是最回不去的日子。
          </p>
        </div>
        <button onClick={onBack} style={{
          marginTop: 32, background: '#222', border: '1px solid #333', color: '#888',
          padding: '10px 32px', borderRadius: 4, cursor: 'pointer', fontSize: 13,
          fontFamily: '"Noto Serif SC", serif',
        }}>返回</button>
      </div>
    )
  }

  const m = moments[idx]

  return (
    <div style={{
      width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden',
      background: '#0d0d0d',
      fontFamily: '"Noto Serif SC", "SimSun", serif', color: '#e0d8c8',
      cursor: fadeIn ? 'pointer' : 'default',
      display: 'flex', flexDirection: 'column',
    }} onClick={() => { if (fadeIn) advance() }}>

      {/* Top bar */}
      <div style={{
        padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%)',
        zIndex: 10, flexShrink: 0,
      }}>
        <button onClick={(e) => { e.stopPropagation(); onBack() }}
          style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 12 }}>
          ← 退出
        </button>
        <span style={{ fontSize: 11, color: '#333' }}>
          {idx + 1} / {moments.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%', height: 2, background: '#1a1a1a', flexShrink: 0, position: 'relative',
      }}>
        <div style={{
          width: `${(idx / moments.length) * 100}%`, height: '100%',
          background: 'linear-gradient(90deg, #4fc3f7, #ffab40)',
          transition: 'width 0.3s',
        }} />
      </div>

      {/* Main content */}
      <div ref={scrollRef} style={{
        flex: 1, overflow: 'auto', padding: '20px 24px',
        display: 'flex', flexDirection: 'column', justifyContent: m.type === 'phase' ? 'center' : 'flex-start',
        transition: 'opacity 0.15s',
        opacity: fadeIn ? 1 : 0,
      }}>

        {/* Phase marker */}
        {m.type === 'phase' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{
              fontSize: 13, color: '#4fc3f7', letterSpacing: 2,
              whiteSpace: 'pre-wrap',
            }}>{m.text}</p>
          </div>
        )}

        {/* Attention snapshot */}
        {m.type === 'attention' && m.attention && (
          <AttentionDisplay data={m.attention} tag={m.tag} />
        )}

        {/* Narrator flow */}
        {m.type === 'narrator' && (
          <p style={{
            fontSize: 15, lineHeight: 2.4, color: '#c8b898',
            whiteSpace: 'pre-wrap', maxWidth: 380, margin: '0 auto',
          }}>{m.text}</p>
        )}

        {/* Teacher line */}
        {m.type === 'teacher' && (
          <p style={{
            fontSize: 14, color: '#ffab40', textAlign: 'center',
            fontStyle: 'italic', lineHeight: 2, maxWidth: 360, margin: '0 auto',
          }}>{m.text}</p>
        )}

        {/* Micro-behavior */}
        {m.type === 'micro' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontSize: 13, color: '#888', fontStyle: 'italic', lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
            }}>
              <span style={{ color: '#555', marginRight: 6 }}>✦</span>
              {m.text}
            </p>
          </div>
        )}

        {/* Whisper */}
        {m.type === 'whisper' && (
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8, padding: '12px 16px', maxWidth: 340, margin: '0 auto',
          }}>
            <p style={{
              fontSize: 12, color: '#777', fontStyle: 'italic',
              whiteSpace: 'pre-wrap', lineHeight: 1.8,
            }}>{m.text}</p>
          </div>
        )}

        {/* Memory hook */}
        {m.type === 'memory' && (
          <div style={{
            borderLeft: '2px solid #ffab40',
            padding: '6px 16px', maxWidth: 360, margin: '0 auto',
          }}>
            <p style={{ fontSize: 10, color: '#ffab40', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
              {m.tag || '💭 回忆碎片'}
            </p>
            <p style={{
              fontSize: 13, color: '#c8b898', lineHeight: 2,
              whiteSpace: 'pre-wrap',
            }}>{m.text}</p>
          </div>
        )}

        {/* Still / waiting */}
        {m.type === 'still' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{
              fontSize: 13, color: '#555', fontStyle: 'italic',
              whiteSpace: 'pre-wrap',
            }}>{m.text}</p>
            <p style={{ fontSize: 10, color: '#333', marginTop: 12 }}>· · ·</p>
          </div>
        )}

        {/* Emotion */}
        {m.type === 'emotion' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{
              fontSize: 14, color: '#f0e8d8', lineHeight: 2.2,
              whiteSpace: 'pre-wrap', maxWidth: 360, margin: '0 auto',
            }}>{m.text}</p>
          </div>
        )}
      </div>

      {/* Tag badge */}
      {m.tag && m.type !== 'memory' && (
        <div style={{
          position: 'absolute', top: 54, right: 16,
          fontSize: 10, color: '#333', letterSpacing: 1,
        }}>
          {m.tag}
        </div>
      )}

      {/* Click hint */}
      {fadeIn && (
        <div style={{
          position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
          color: '#333', fontSize: 11, zIndex: 50,
        }}>点击继续 ▸</div>
      )}

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
        background: 'linear-gradient(0deg, rgba(13,13,13,1) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 40,
      }} />
    </div>
  )
}

function AttentionDisplay({ data, tag }: { data: AttentionSnapshot; tag?: string }) {
  const total = data.following + data.half + data.drifting + data.disconnected
  const bar = (v: number) => (v / total) * 100

  return (
    <div style={{
      background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 8, padding: '12px 16px', maxWidth: 320, margin: '0 auto',
    }}>
      <p style={{ fontSize: 10, color: '#555', marginBottom: 8, letterSpacing: 1 }}>
        {tag || '注意力分布'}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <BarRow label="跟随" value={data.following} pct={bar(data.following)} color="#4fc3f7" />
        <BarRow label="半跟随" value={data.half} pct={bar(data.half)} color="#ffab40" />
        <BarRow label="游离" value={data.drifting} pct={bar(data.drifting)} color="#ff7043" />
        <BarRow label="断线" value={data.disconnected} pct={bar(data.disconnected)} color="#ef5350" />
      </div>
    </div>
  )
}

function BarRow({ label, value, pct, color }: { label: string; value: number; pct: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: '#888', width: 48, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: color, borderRadius: 3,
          transition: 'width 0.6s',
        }} />
      </div>
      <span style={{ fontSize: 11, color, width: 24, textAlign: 'right', flexShrink: 0 }}>{value}</span>
    </div>
  )
}
