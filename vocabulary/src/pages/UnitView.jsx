import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVocabStore } from '../store/vocabStore'
import { useReviewStore } from '../store/reviewStore'
import WordCard from '../components/WordCard'
import ProgressBar from '../components/ProgressBar'
import { generateAllReview } from '../services/aiReview'

const MODES = [
  { id: 'browse', label: '浏览' },
  { id: 'recall', label: '回忆' },
  { id: 'review', label: 'AI助学' },
]

export default function UnitView() {
  const { gradeId, unitId } = useParams()
  const navigate = useNavigate()
  const selectGrade = useVocabStore(s => s.selectGrade)
  const units = useVocabStore(s => s.units)[gradeId] || []
  const [loaded, setLoaded] = useState(false)
  const [mode, setMode] = useState('browse')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [recallInput, setRecallInput] = useState('')
  const [recallResult, setRecallResult] = useState(null)
  const [aiReview, setAiReview] = useState(null)
  const [completedSet, setCompletedSet] = useState(new Set())

  const unit = units.find(u => u.id === unitId)
  const words = useMemo(() => {
    if (!unit) return []
    return unit.words.map((w, i) => ({ ...w, id: `${gradeId}/${unit.id}/${i}` }))
  }, [unit])

  const currentWord = words[currentIdx] || null

  useEffect(() => {
    selectGrade(gradeId).then(() => setLoaded(true))
  }, [gradeId])

  useEffect(() => {
    setCurrentIdx(0)
    setFlipped(false)
    setRecallInput('')
    setRecallResult(null)
    setAiReview(null)
  }, [unitId, mode])

  const handleNext = () => {
    if (currentIdx < words.length - 1) {
      setCurrentIdx(currentIdx + 1)
      setFlipped(false)
      setRecallInput('')
      setRecallResult(null)
      setAiReview(null)
    }
  }

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1)
      setFlipped(false)
      setRecallInput('')
      setRecallResult(null)
      setAiReview(null)
    }
  }

  const handleRecallCheck = () => {
    if (!currentWord) return
    const correct = recallInput.trim().toLowerCase() === currentWord.meaning
    setRecallResult({ correct })
    useReviewStore.getState().recordAnswer(currentWord.id, correct)
    if (correct) setCompletedSet(new Set([...completedSet, currentWord.id]))
  }

  const handleAiReview = () => {
    if (!currentWord) return
    setAiReview(generateAllReview(currentWord))
  }

  if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>加载中...</div>
  if (!unit) return <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>未找到该单元</div>

  return (
    <div style={{ padding: '20px 16px', maxWidth: 480, margin: '0 auto' }}>
      <button
        onClick={() => navigate(`/grade/${gradeId}`)}
        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: 14, marginBottom: 12 }}
      >
        ← 返回
      </button>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{unit.title}</h1>
      <ProgressBar current={currentIdx + 1} total={words.length} />

      <div style={{ display: 'flex', gap: 8, margin: '16px 0', justifyContent: 'center' }}>
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              padding: '6px 16px', borderRadius: 16, border: '1px solid #d1d5db',
              background: mode === m.id ? '#3b82f6' : '#fff',
              color: mode === m.id ? '#fff' : '#4b5563', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'browse' && currentWord && (
        <WordCard word={currentWord} flipped={flipped} onFlip={setFlipped} />
      )}

      {mode === 'recall' && currentWord && (
        <div>
          <div style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
            {currentWord.word}
            <span style={{ fontSize: 14, color: '#9ca3af', marginLeft: 8, fontWeight: 400 }}>
              {currentWord.phonetic}
            </span>
          </div>
          <input
            value={recallInput}
            onChange={e => setRecallInput(e.target.value)}
            placeholder="输入中文意思..."
            style={{
              width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
              borderRadius: 8, fontSize: 16, marginBottom: 10, boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleRecallCheck}
            disabled={!recallInput.trim()}
            style={{
              width: '100%', padding: '10px 0', background: '#3b82f6', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
              cursor: recallInput.trim() ? 'pointer' : 'default', opacity: recallInput.trim() ? 1 : 0.5,
            }}
          >
            检查
          </button>
          {recallResult && (
            <div style={{
              marginTop: 12, padding: 12, borderRadius: 8, textAlign: 'center',
              background: recallResult.correct ? '#f0fdf4' : '#fef2f2',
              color: recallResult.correct ? '#166534' : '#991b1b',
            }}>
              {recallResult.correct ? '✓ 正确！' : `✗ 错误，正确答案：${currentWord.meaning}`}
            </div>
          )}
        </div>
      )}

      {mode === 'review' && currentWord && (
        <div>
          <WordCard word={currentWord} />
          <button
            onClick={handleAiReview}
            style={{
              width: '100%', marginTop: 12, padding: '10px 0',
              background: '#8b5cf6', color: '#fff', border: 'none',
              borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            生成 AI 助学内容
          </button>
          {aiReview && (
            <div style={{ marginTop: 12, background: '#f5f3ff', borderRadius: 12, padding: 16, border: '1px solid #ddd6fe' }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#6d28d9', marginBottom: 4 }}>释义</div>
                <div style={{ fontSize: 14, color: '#4b5563' }}>{aiReview.explanation}</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#6d28d9', marginBottom: 4 }}>例句</div>
                <div style={{ fontSize: 14, color: '#4b5563' }}>{aiReview.sentence}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#6d28d9', marginBottom: 4 }}>对话</div>
                <div style={{ fontSize: 14, color: '#4b5563', whiteSpace: 'pre-wrap' }}>{aiReview.dialogue}</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center' }}>
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          style={{
            padding: '10px 24px', borderRadius: 8, border: '1px solid #d1d5db',
            background: '#fff', color: currentIdx === 0 ? '#d1d5db' : '#4b5563',
            cursor: currentIdx === 0 ? 'default' : 'pointer', fontSize: 14,
          }}
        >
          上一个
        </button>
        <button
          onClick={handleNext}
          disabled={currentIdx >= words.length - 1}
          style={{
            padding: '10px 24px', borderRadius: 8, border: '1px solid #d1d5db',
            background: currentIdx >= words.length - 1 ? '#f3f4f6' : '#3b82f6',
            color: currentIdx >= words.length - 1 ? '#d1d5db' : '#fff',
            cursor: currentIdx >= words.length - 1 ? 'default' : 'pointer', fontSize: 14,
          }}
        >
          下一个
        </button>
      </div>
    </div>
  )
}
