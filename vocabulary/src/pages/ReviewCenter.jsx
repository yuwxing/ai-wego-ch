import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVocabStore } from '../store/vocabStore'
import { useReviewStore } from '../store/reviewStore'
import WordCard from '../components/WordCard'
import ProgressBar from '../components/ProgressBar'

export default function ReviewCenter() {
  const navigate = useNavigate()
  const loadAll = useVocabStore(s => s.loadAll)
  const allWords = useVocabStore(s => s.allWords)
  const reviews = useReviewStore(s => s.reviews)
  const recordAnswer = useReviewStore(s => s.recordAnswer)

  const [step, setStep] = useState('loading')
  const [dueWords, setDueWords] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    loadAll().then(() => setStep('ready'))
  }, [])

  const computeDueWords = () => {
    if (!allWords.length) return []
    const wordIds = allWords.map(w => w.id)
    const dueIds = useReviewStore.getState().getDueReviews(wordIds)
    const newWords = wordIds.filter(id => !reviews[id] || reviews[id].level === 0)
    const mastered = wordIds.filter(id => reviews[id]?.level === 3)
    const due = wordIds.filter(id => {
      const r = reviews[id]
      return r && r.level > 0 && r.level < 3 && dueIds.includes(id)
    })
    const all = [...due, ...newWords]
    return all.sort(() => Math.random() - 0.5).slice(0, 20)
  }

  const handleStart = () => {
    const words = computeDueWords()
    setDueWords(words.map(id => allWords.find(w => w.id === id)).filter(Boolean))
    setCurrentIdx(0)
    setFlipped(false)
    setStep('reviewing')
  }

  const currentWord = dueWords[currentIdx] || null

  const handleAnswer = (correct) => {
    if (!currentWord) return
    recordAnswer(currentWord.id, correct)
    setShowFeedback(true)
    setTimeout(() => {
      setShowFeedback(false)
      if (currentIdx < dueWords.length - 1) {
        setCurrentIdx(currentIdx + 1)
        setFlipped(false)
      } else {
        setStep('done')
      }
    }, 800)
  }

  const stats = useReviewStore(s => s.getStats())

  if (step === 'loading') {
    return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>加载中...</div>
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: 480, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/')}
        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: 14, marginBottom: 12 }}
      >
        ← 返回
      </button>

      {step === 'ready' && (
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>智能复习</h1>
          <div style={{ background: '#eff6ff', borderRadius: 12, padding: 20, border: '1px solid #bfdbfe', marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: '#1e40af', marginBottom: 12 }}>
              基于间隔重复（SRS）算法，在最佳时间点提醒你复习单词。
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div style={{ background: '#fff', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{stats.mastered}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>已掌握</div>
              </div>
              <div style={{ background: '#fff', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>{stats.learning + stats.reviewing}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>待复习</div>
              </div>
            </div>
          </div>
          <button
            onClick={handleStart}
            style={{
              width: '100%', padding: '14px 0', background: '#10b981', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer',
            }}
          >
            开始复习
          </button>
        </div>
      )}

      {step === 'reviewing' && currentWord && (
        <div>
          <ProgressBar current={currentIdx + 1} total={dueWords.length} label="复习进度" />
          <div style={{ marginTop: 20 }}>
            <WordCard word={currentWord} flipped={flipped} onFlip={setFlipped} />
          </div>
          {!showFeedback && (
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button
                onClick={() => handleAnswer(false)}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 8, border: 'none',
                  background: '#fef2f2', color: '#991b1b', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                }}
              >
                忘了
              </button>
              <button
                onClick={() => handleAnswer(true)}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 8, border: 'none',
                  background: '#f0fdf4', color: '#166534', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                }}
              >
                记住了
              </button>
            </div>
          )}
          {showFeedback && (
            <div style={{
              textAlign: 'center', padding: 20, fontSize: 18, fontWeight: 600,
              color: '#6b7280', marginTop: 12,
            }}>
              继续...
            </div>
          )}
        </div>
      )}

      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>复习完成！</h2>
          <p style={{ color: '#6b7280', marginBottom: 20 }}>本次复习了 {dueWords.length} 个单词</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => { setStep('ready'); handleStart() }}
              style={{
                padding: '10px 24px', background: '#10b981', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              再来一轮
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '10px 24px', background: '#f3f4f6', color: '#4b5563',
                border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, cursor: 'pointer',
              }}
            >
              返回首页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
