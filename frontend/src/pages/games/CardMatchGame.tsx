import { useState, useEffect, useCallback, useRef } from 'react'
import { RefreshCw, ChevronRight } from 'lucide-react'
import type { VerbEntry } from '../../utils/irregularVerbsData'

interface CardData {
  id: number
  pairId: number
  text: string
  type: 'meaning' | 'past'
  flipped: boolean
  matched: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const c = [...arr]
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]]
  }
  return c
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

const PAIR_SIZE = 6
const FLIP_DELAY = 800

export default function CardMatchGame({
  verbs,
  stageName,
  onComplete,
  onBack,
}: {
  verbs: VerbEntry[]
  stageName: string
  onComplete: (score: number) => void
  onBack: () => void
}) {
  const [cards, setCards] = useState<CardData[]>([])
  const [flippedIds, setFlippedIds] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [flips, setFlips] = useState(0)
  const [finished, setFinished] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const lockRef = useRef(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 600)
  }, [])

  // Split verbs into groups of PAIR_SIZE, take first group
  const batchSize = PAIR_SIZE
  const [batchIdx, setBatchIdx] = useState(0)
  const totalBatches = Math.ceil(verbs.length / batchSize)
  const batchVerbs = verbs.slice(batchIdx * batchSize, (batchIdx + 1) * batchSize)

  const initCards = useCallback(() => {
    const bv = verbs.slice(0, PAIR_SIZE)
    const cardList: CardData[] = []
    bv.forEach((v, i) => {
      cardList.push({ id: i * 2, pairId: i, text: v.meaning, type: 'meaning', flipped: false, matched: false })
      cardList.push({ id: i * 2 + 1, pairId: i, text: v.past.split('/')[0].trim(), type: 'past', flipped: false, matched: false })
    })
    setCards(shuffle(cardList))
    setFlippedIds([])
    setMatched(new Set())
    setFlips(0)
    setFinished(false)
    setFeedback(null)
    lockRef.current = false
  }, [verbs])

  useEffect(() => { initCards() }, [initCards])

  const handleFlip = (id: number) => {
    if (lockRef.current || finished) return
    const card = cards.find(c => c.id === id)
    if (!card || card.flipped || card.matched) return
    if (flippedIds.length >= 2) return

    const newFlipped = [...flippedIds, id]
    setFlippedIds(newFlipped)
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c))

    if (newFlipped.length === 2) {
      lockRef.current = true
      setFlips(f => f + 1)
      const first = cards.find(c => c.id === newFlipped[0])!
      const second = cards.find(c => c.id === newFlipped[1])!

      if (first.pairId === second.pairId && first.type !== second.type) {
        setFeedback('correct')
        playTone(523, 0.1)
        setTimeout(() => playTone(659, 0.12), 80)
        const newMatched = new Set(matched)
        newMatched.add(first.pairId)
        setMatched(newMatched)
        setCards(prev => prev.map(c => c.pairId === first.pairId ? { ...c, matched: true } : c))
        setFlippedIds([])
        lockRef.current = false
        setFeedback(null)

        if (newMatched.size === batchVerbs.length) {
          setTimeout(() => {
            setFinished(true)
            const minFlips = batchVerbs.length
            const efficiency = minFlips / flips
            const pct = Math.min(100, Math.round(efficiency * 100))
            onComplete(pct)
          }, 400)
        }
      } else {
        setFeedback('wrong')
        playTone(200, 0.15, 'square')
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, flipped: false } : c))
          setFlippedIds([])
          lockRef.current = false
          setFeedback(null)
        }, FLIP_DELAY)
      }
    }
  }

  const gridCols = isMobile ? 3 : 4
  const rows = Math.ceil(PAIR_SIZE * 2 / gridCols)

  if (finished) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Noto Serif SC", serif', color: '#1e293b', padding: 24,
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{stageName} 完成！</h2>
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16 }}>翻牌次数: {flips} 次 · 配对: {PAIR_SIZE} 对</div>
        <div style={{ fontSize: 36, fontWeight: 700, background: 'linear-gradient(135deg, #f7971e, #ffd200)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 24 }}>
          {Math.min(100, Math.round((PAIR_SIZE / flips) * 100))}%
        </div>
        <button onClick={() => { initCards() }}
          style={{
            background: 'white', border: '1px solid #e2e8f0', color: '#64748b', padding: '10px 20px',
            borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: '"Noto Serif SC", serif',
            display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
          <RefreshCw className="w-4 h-4" /> 再来一次
        </button>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px',
      fontFamily: '"Noto Serif SC", serif', color: '#1e293b', boxSizing: 'border-box',
    }}>
      <div style={{ width: '100%', maxWidth: 480, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack}
          style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid #e2e8f0', color: '#64748b', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>
          ← {stageName}
        </button>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>已配对 {matched.size}/{PAIR_SIZE} · 翻牌 {flips} 次</div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: 8,
        width: '100%', maxWidth: 480,
      }}>
        {cards.map(card => {
          const isFlipped = card.flipped || card.matched
          return (
            <button key={card.id} onClick={() => handleFlip(card.id)}
              style={{
                aspectRatio: '1', borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${card.matched ? '#4caf50' : isFlipped ? '#f59e0b' : '#e2e8f0'}`,
                background: card.matched ? '#f0fdf4' : isFlipped ? '#fffbeb' : 'linear-gradient(135deg, #f7971e, #ffd200)',
                color: isFlipped ? '#1e293b' : 'white',
                fontSize: isFlipped ? (isMobile ? 12 : 14) : 20,
                fontWeight: isFlipped ? 600 : 400,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 4, transition: 'all 0.2s',
                boxShadow: card.matched ? '0 0 0 2px #4caf50' : isFlipped ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 8px rgba(247,151,30,0.3)',
                wordBreak: 'break-word',
              }}>
              {isFlipped ? card.text : '?'}
            </button>
          )
        })}
      </div>

      {feedback === 'correct' && (
        <div style={{ marginTop: 12, color: '#16a34a', fontSize: 14, fontWeight: 600 }}>✓ 配对成功！</div>
      )}
      {feedback === 'wrong' && (
        <div style={{ marginTop: 12, color: '#dc2626', fontSize: 14, fontWeight: 600 }}>✗ 不对应，再试一次</div>
      )}

      <p style={{ marginTop: 12, color: '#94a3b8', fontSize: 11, textAlign: 'center' }}>
        点击翻转两张卡片，将中文释义与对应的过去式配对
      </p>
    </div>
  )
}
