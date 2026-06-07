import React, { useState } from 'react'
import RobotScene from '../components/digital-teacher/RobotScene'
import type { RobotAnim } from '../components/digital-teacher/RobotAvatar'

const ANIM_OPTIONS: { key: RobotAnim; label: string; icon: string }[] = [
  { key: 'idle', label: '待机', icon: '⚡' },
  { key: 'walk', label: '行走', icon: '🚶' },
  { key: 'talk', label: '说话', icon: '💬' },
  { key: 'wave', label: '挥手', icon: '👋' },
  { key: 'point', label: '指路', icon: '👉' },
]

export default function RobotPage() {
  const [anim, setAnim] = useState<RobotAnim>('idle')
  const [speed, setSpeed] = useState(1)

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#080818' }}>
      {/* 3D Scene */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <RobotScene animation={anim} animSpeed={speed} />
      </div>

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(8,8,24,0.88)', backdropFilter: 'blur(12px)',
        padding: '10px 24px', borderRadius: 16, border: '1px solid #3b82f6',
        display: 'flex', gap: 16, alignItems: 'center', zIndex: 100,
      }}>
        <span style={{ fontSize: 20 }}>🤖</span>
        <b style={{ color: '#e2e8f0' }}>AI 机器人</b>
        <span style={{ color: '#60a5fa', fontSize: 13 }}>
          {ANIM_OPTIONS.find(o => o.key === anim)?.label}
        </span>
      </div>

      {/* Animation controls */}
      <div style={{
        position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, display: 'flex', gap: 8,
      }}>
        {ANIM_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setAnim(opt.key)}
            style={{
              background: anim === opt.key ? '#3b82f6' : 'rgba(30,41,59,0.8)',
              border: anim === opt.key ? '1px solid #60a5fa' : '1px solid #334155',
              color: anim === opt.key ? 'white' : '#94a3b8',
              padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
              fontSize: 13, fontWeight: anim === opt.key ? 600 : 400,
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s',
            }}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
      </div>

      {/* Speed control */}
      <div style={{
        position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, display: 'flex', gap: 8, alignItems: 'center',
        background: 'rgba(8,8,24,0.8)', backdropFilter: 'blur(8px)',
        padding: '6px 16px', borderRadius: 10, border: '1px solid #334155',
      }}>
        <span style={{ color: '#94a3b8', fontSize: 12 }}>速度:</span>
        {[0.5, 1, 1.5, 2].map(v => (
          <button
            key={v}
            onClick={() => setSpeed(v)}
            style={{
              background: speed === v ? '#3b82f6' : 'transparent',
              border: 'none', color: speed === v ? 'white' : '#64748b',
              padding: '2px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
            }}
          >
            {v}x
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        color: '#475569', fontSize: 11, zIndex: 80, textAlign: 'center',
      }}>
        🖱 拖拽旋转 · 滚轮缩放 · 点击按钮切换动画
      </div>
    </div>
  )
}
