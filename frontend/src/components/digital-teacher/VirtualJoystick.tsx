import React, { useRef, useCallback, useState, useEffect } from 'react'

interface Props {
  onMove: (dir: [number, number]) => void
  size?: number
}

export default function VirtualJoystick({ onMove, size = 120 }: Props) {
  const baseRef = useRef<HTMLDivElement>(null)
  const [touchId, setTouchId] = useState<number | null>(null)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [active, setActive] = useState(false)
  const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!baseRef.current) return
    const t = e.changedTouches[0]
    setTouchId(t.identifier)
    setActive(true)
    const rect = baseRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = t.clientX - cx
    const dy = t.clientY - cy
    const maxR = size / 2 - 16
    const dist = Math.sqrt(dx * dx + dy * dy)
    const clamped = Math.min(dist, maxR)
    const angle = Math.atan2(dy, dx)
    setPos({ x: Math.cos(angle) * clamped, y: Math.sin(angle) * clamped })
    const norm = Math.min(dist / maxR, 1)
    const fx = Math.cos(angle) * norm
    const fz = Math.sin(angle) * norm
    onMove([fx, fz])
  }, [onMove, size])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchId === null) return
    const t = Array.from(e.changedTouches).find(tc => tc.identifier === touchId)
    if (!t || !baseRef.current) return
    const rect = baseRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = t.clientX - cx
    const dy = t.clientY - cy
    const maxR = size / 2 - 16
    const dist = Math.sqrt(dx * dx + dy * dy)
    const clamped = Math.min(dist, maxR)
    const angle = dist > 1 ? Math.atan2(dy, dx) : 0
    setPos({ x: Math.cos(angle) * clamped, y: Math.sin(angle) * clamped })
    const norm = Math.min(dist / maxR, 1)
    const fx = Math.cos(angle) * norm
    const fz = Math.sin(angle) * norm
    onMove([fx, fz])
  }, [touchId, onMove, size])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const t = Array.from(e.changedTouches).find(tc => tc.identifier === touchId)
    if (!t) return
    setTouchId(null)
    setActive(false)
    setPos({ x: 0, y: 0 })
    onMove([0, 0])
  }, [touchId, onMove])

  if (!isMobile) return null

  return (
    <div
      ref={baseRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'absolute',
        bottom: 240,
        left: 30,
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(59,130,246,0.15)',
        border: '2px solid rgba(59,130,246,0.3)',
        zIndex: 200,
        touchAction: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: size - 32,
          height: size - 32,
          borderRadius: '50%',
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.15)',
          position: 'absolute',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: active ? 'rgba(59,130,246,0.6)' : 'rgba(59,130,246,0.3)',
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: active ? 'none' : 'transform 0.15s ease-out',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 18,
        }}
      >
        {active ? '⬤' : '○'}
      </div>
    </div>
  )
}
