import { useRef, useState } from 'react'
import { speak } from '../services/tts'
import { useReviewStore } from '../store/reviewStore'
import AudioPlayer from './AudioPlayer'
import MemoryTag from './MemoryTag'

export default function WordCard({ word, flipped: controlledFlipped, onFlip, showReview = true }) {
  const [localFlipped, setLocalFlipped] = useState(false)
  const flipped = controlledFlipped !== undefined ? controlledFlipped : localFlipped
  const level = useReviewStore(s => s.getWordLevel(word.id))

  const handleFlip = () => {
    if (onFlip) onFlip(!flipped)
    else setLocalFlipped(!flipped)
  }

  const speakWord = (e) => { e.stopPropagation(); speak(word.word) }

  return (
    <div
      onClick={handleFlip}
      style={{
        width: '100%', maxWidth: 360, minHeight: 200, cursor: 'pointer',
        perspective: 600, margin: '0 auto',
      }}
    >
      <div style={{
        width: '100%', minHeight: 200, transition: 'transform 0.4s',
        transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'none',
        position: 'relative',
      }}>
        <div style={{
          backfaceVisibility: 'hidden', position: 'absolute', inset: 0,
          background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{word.word}</div>
          <div style={{ color: '#6b7280', marginBottom: 8, fontFamily: 'serif' }}>{word.phonetic}</div>
          <AudioPlayer onPlay={speakWord} />
          {showReview && <MemoryTag level={level} />}
          <div style={{ marginTop: 12, fontSize: 13, color: '#9ca3af' }}>点击翻转</div>
        </div>
        <div style={{
          backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
          background: '#f0f9ff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: 200, border: '1px solid #bae6fd',
        }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#0369a1', marginBottom: 12 }}>{word.meaning}</div>
          {word.example && (
            <div style={{ color: '#4b5563', fontStyle: 'italic', fontSize: 14, textAlign: 'center' }}>
              {word.example}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
