import { useState, useEffect, useRef } from 'react'
import { RefreshCw, Volume2, CheckCircle2 } from 'lucide-react'
import { getRandomWords, shuffle, Word } from '../../utils/gameWords'

interface Card {
  id: number
  type: 'word' | 'meaning'
  text: string
  pairId: number
  flipped: boolean
  matched: boolean
}

export default function FlipCards() {
  const [cards, setCards] = useState<Card[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [pairs, setPairs] = useState(6)
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [done, setDone] = useState(false)
  const [pronounce, setPronounce] = useState<Word | null>(null)
  const lockRef = useRef(false)

  const initGame = (n = pairs) => {
    const words = getRandomWords(n)
    const deck: Card[] = []
    words.forEach((w, i) => {
      deck.push({ id: i * 2, type: 'word', text: w.word, pairId: i, flipped: false, matched: false })
      deck.push({ id: i * 2 + 1, type: 'meaning', text: w.meaning, pairId: i, flipped: false, matched: false })
    })
    setCards(shuffle(deck))
    setSelected(null)
    setMoves(0)
    setMatches(0)
    setDone(false)
    setPronounce(null)
  }

  useEffect(() => { initGame(6) }, [])

  const speak = (text: string) => {
    try {
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'en-US'
      u.rate = 0.9
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    } catch {}
  }

  const handleFlip = (idx: number) => {
    if (lockRef.current || cards[idx].flipped || cards[idx].matched) return
    const next = cards.map((c, i) => (i === idx ? { ...c, flipped: true } : c))
    setCards(next)
    if (cards[idx].type === 'word') {
      setPronounce({ word: cards[idx].text, phonetic: '', meaning: '', unit: 0 })
    }
    if (selected === null) {
      setSelected(idx)
      return
    }
    // second card
    setMoves(m => m + 1)
    const first = next[selected]
    const second = next[idx]
    if (first.pairId === second.pairId) {
      const matched = next.map((c, i) => (c.pairId === first.pairId ? { ...c, matched: true } : c))
      setCards(matched)
      setSelected(null)
      setMatches(m => m + 1)
      if (matched.every(c => c.matched)) setDone(true)
    } else {
      setSelected(null)
      lockRef.current = true
      setTimeout(() => {
        setCards(c => c.map((card, i) => (i === idx || i === selected ? { ...card, flipped: false } : card)))
        lockRef.current = false
      }, 800)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> 单词翻卡配对
          </h2>
          <p className="text-xs text-slate-400 mt-1">翻开英文卡片，找到对应的中文释义，全部配对即获胜</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={pairs}
            onChange={e => { setPairs(Number(e.target.value)); initGame(Number(e.target.value)) }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            {[4, 6, 8, 10].map(n => <option key={n} value={n}>{n} 组</option>)}
          </select>
          <button onClick={() => initGame(pairs)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all">
            <RefreshCw className="w-4 h-4" /> 重新开始
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => handleFlip(idx)}
            className={`aspect-[4/5] rounded-2xl p-2 flex flex-col items-center justify-center text-center transition-all duration-300 shadow-sm border-2
              ${card.matched ? 'bg-emerald-50 border-emerald-300 opacity-80' :
                card.flipped ? 'bg-white border-emerald-400 shadow-md scale-[1.02]' : 'bg-gradient-to-br from-emerald-400 to-teal-500 border-transparent hover:shadow-lg hover:scale-[1.03]'}`}
          >
            {card.flipped || card.matched ? (
              <>
                <span className={`${card.type === 'word' ? 'text-base sm:text-lg font-bold text-emerald-700' : 'text-[11px] sm:text-xs text-slate-600 leading-snug'} ${card.matched ? 'line-through opacity-60' : ''}`}>
                  {card.text}
                </span>
                {card.matched && <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-1" />}
              </>
            ) : (
              <span className="text-2xl text-white/80 font-bold">?</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{matches}</p>
            <p className="text-[10px] text-slate-400">已配对</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{moves}</p>
            <p className="text-[10px] text-slate-400">步数</p>
          </div>
        </div>
        {done ? (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold animate-pulse">
            🎉 全部配对成功！共用了 {moves} 步
          </div>
        ) : (
          <p className="text-xs text-slate-400">翻开两张卡片，找到中英文配对</p>
        )}
        {pronounce && (
          <button onClick={() => speak(pronounce.word)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors">
            <Volume2 className="w-3.5 h-3.5" /> 朗读
          </button>
        )}
      </div>
    </div>
  )
}
