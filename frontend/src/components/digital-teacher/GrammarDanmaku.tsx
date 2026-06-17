import { useEffect, useRef, useState, memo } from 'react'

interface DanmakuItem {
  id: number
  text: string
  color: string
  speed: number
  createdAt: number
}

interface Props {
  items?: { text: string; color: string }[]
  mode?: 'grammar' | 'proverb'
}

function splitDanmaku(text: string): string[] {
  const MAX = 42
  if (text.length <= MAX) return [text]
  const mid = Math.floor(text.length / 2)
  const range = Math.floor(text.length * 0.3)
  const delimiters = [
    { ch: '；', prio: 1 }, { ch: '。', prio: 2 }, { ch: '！', prio: 3 },
    { ch: '？', prio: 4 }, { ch: ' vs ', prio: 5 },
  ]
  let bestIdx = -1, bestPrio = 999
  for (const d of delimiters) {
    let idx = text.indexOf(d.ch, Math.max(0, mid - range))
    while (idx > 0 && idx <= Math.min(text.length - 2, mid + range)) {
      const sp = idx + d.ch.length
      const first = text.slice(0, sp).trim()
      const second = text.slice(sp).trim()
      if (first.length >= 6 && second.length >= 4) {
        if (d.prio < bestPrio || (d.prio === bestPrio && Math.abs(sp - mid) < Math.abs(bestIdx - mid))) {
          bestIdx = sp; bestPrio = d.prio
        }
      }
      idx = text.indexOf(d.ch, idx + 1)
    }
  }
  if (bestIdx > 0) return [text.slice(0, bestIdx).trim(), text.slice(bestIdx).trim()]
  return [text]
}

const DanmakuLine = memo(function DanmakuLine({ item }: { item: DanmakuItem }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const startX = Math.random() * vw
    const startY = Math.random() * vh
    const endX = (Math.random() - 0.5) * vw * 2
    const endY = (Math.random() - 0.5) * vh * 2
    const rot = Math.random() * 720 - 360
    el.style.left = startX + 'px'
    el.style.top = startY + 'px'
    const anim = el.animate([
      { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${endX}px,${endY}px) rotate(${rot}deg)`, opacity: 0 },
    ], {
      duration: item.speed * 1000,
      fill: 'forwards',
      easing: 'linear',
    })
    return () => anim.cancel()
  }, [item.speed])

  return (
    <div ref={ref} style={{ position: 'absolute', maxWidth: 'clamp(280px, 80vw, 600px)' }}>
      <div style={{
        lineHeight: 1.4,
        padding: '6px 14px',
        background: 'rgba(0,0,0,0.55)',
        borderRadius: 10,
        color: item.color,
        fontSize: 'clamp(17px, 2.8vw, 28px)',
        fontWeight: 600,
        textShadow: '0 0 12px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)',
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
      }}>
        {item.text}
      </div>
    </div>
  )
})

export default function GrammarDanmaku({ items, mode = 'grammar' }: Props) {
  const [danmakuPool, setDanmakuPool] = useState<{ text: string; color: string }[]>([])
  const [displayItems, setDisplayItems] = useState<DanmakuItem[]>([])
  const idRef = useRef(0)
  const idxRef = useRef(0)
  const poolRef = useRef<{ text: string; color: string }[]>([])
  const pendingRef = useRef<{ text: string; color: string } | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const cleanupRef = useRef<ReturnType<typeof setInterval>>()
  const modeRef = useRef(mode)
  modeRef.current = mode

  useEffect(() => {
    setDanmakuPool([])
    setDisplayItems([])
    idxRef.current = 0
    pendingRef.current = null
  }, [mode])

  useEffect(() => {
    if (!items || items.length === 0) return
    setDisplayItems([])
    setDanmakuPool(items)
    idxRef.current = 0
    pendingRef.current = null
  }, [items])

  useEffect(() => {
    if (danmakuPool.length === 0) {
      if (modeRef.current === 'proverb') {
        import('./proverbData').then(m => {
          setDanmakuPool(m.PROVERBS)
          poolRef.current = m.PROVERBS
        })
      } else {
        import('./grammarData').then(m => {
          const all = m.default.flatMap((mod: any) =>
            mod.danmaku.map((text: string) => ({ text, color: mod.color }))
          )
          setDanmakuPool(all)
          poolRef.current = all
        })
      }
      return
    }
    poolRef.current = danmakuPool
  }, [danmakuPool])

  useEffect(() => {
    if (poolRef.current.length === 0) return

    if (intervalRef.current) clearInterval(intervalRef.current)
    if (cleanupRef.current) clearInterval(cleanupRef.current)

    intervalRef.current = setInterval(() => {
      const pool = poolRef.current
      if (pool.length === 0) return

      let entry: { text: string; color: string }
      if (pendingRef.current) {
        entry = pendingRef.current
        pendingRef.current = null
      } else {
        entry = pool[idxRef.current % pool.length]
        idxRef.current++
      }

      const parts = splitDanmaku(entry.text)
      const text = parts[0]
      if (parts.length > 1) {
        pendingRef.current = { text: parts[1], color: entry.color }
      }

      const newItem: DanmakuItem = {
        id: idRef.current++,
        text,
        color: entry.color,
        speed: 8 + Math.random() * 6,
        createdAt: Date.now(),
      }
      setDisplayItems(prev => [...prev.slice(-30), newItem])
    }, 2500)

    cleanupRef.current = setInterval(() => {
      setDisplayItems(prev => prev.filter(i => Date.now() - i.createdAt < 20000))
    }, 5000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (cleanupRef.current) clearInterval(cleanupRef.current)
    }
  }, [danmakuPool])

  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 50,
    }}>
      {displayItems.map(item => (
        <DanmakuLine key={item.id} item={item} />
      ))}
    </div>
  )
}
