import React, { useRef, useState, useEffect } from 'react'

const sounds = [
  { id: 'ocean', label: '海浪', file: '/audio/ocean.mp3', icon: '🌊' },
  { id: 'birds', label: '笛声', file: '/audio/birds.mp3', icon: '🪈' },
]

export default function NatureSounds() {
  const [active, setActive] = useState<Record<string, boolean>>({})
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})

  useEffect(() => {
    sounds.forEach(s => {
      const a = new Audio(s.file)
      a.loop = true
      a.volume = 0.25
      a.preload = 'auto'
      audioRefs.current[s.id] = a
    })
    return () => {
      Object.values(audioRefs.current).forEach(a => { a.pause(); a.src = '' })
      audioRefs.current = {}
    }
  }, [])

  const toggle = (id: string) => {
    const next = !active[id]
    setActive(prev => ({ ...prev, [id]: next }))
    const el = audioRefs.current[id]
    if (el) {
      if (next) {
        el.currentTime = 0
        el.play().catch(e => console.warn('play error', id, e))
      } else {
        el.pause()
      }
    }
  }

  return (
    <div style={{
      position: 'absolute', bottom: 140, left: 16,
      zIndex: 90, display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      {sounds.map(s => (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => toggle(s.id)}
            style={{
              width: 44, height: 44, borderRadius: '50%', border: 'none',
              cursor: 'pointer', fontSize: 12, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 1, lineHeight: 1,
              background: active[s.id]
                ? 'rgba(56,189,248,0.3)'
                : 'rgba(19,19,26,0.8)',
              color: active[s.id] ? '#7dd3fc' : '#94a3b8',
              boxShadow: active[s.id]
                ? '0 0 14px rgba(56,189,248,0.4)'
                : '0 2px 8px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.25s',
            }}
            title={s.label}
          >
            <span style={{ fontSize: 16 }}>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        </div>
      ))}
    </div>
  )
}
