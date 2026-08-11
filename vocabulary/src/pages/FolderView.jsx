import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVocabStore } from '../store/vocabStore'
import { useReviewStore } from '../store/reviewStore'

export default function FolderView() {
  const { gradeId } = useParams()
  const navigate = useNavigate()
  const selectGrade = useVocabStore(s => s.selectGrade)
  const grades = useVocabStore(s => s.grades)
  const storeUnits = useVocabStore(s => s.units)
  const units = storeUnits[gradeId] || []
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    selectGrade(gradeId).then(() => setLoading(false))
  }, [gradeId])

  const gradeLabel = grades[gradeId]?.label || gradeId
  const allWords = units.flatMap(u => u.words)

  return (
    <div style={{ padding: '20px 16px', maxWidth: 480, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/')}
        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: 14, marginBottom: 12 }}
      >
        ← 返回
      </button>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{gradeLabel}</h1>
      <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
        共 {allWords.length} 个单词，{units.length} 个单元
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>加载中...</div>
      ) : (
        units.map((unit) => {
          const wordIds = unit.words.map((_, i) => `${gradeId}/${unit.id}/${i}`)
          const dueCount = useReviewStore.getState().getDueReviews(wordIds).length

          return (
            <div
              key={unit.id}
              onClick={() => navigate(`/grade/${gradeId}/unit/${unit.id}`)}
              style={{
                padding: '16px 20px', marginBottom: 10, background: '#fff',
                borderRadius: 12, cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>{unit.title}</div>
                  <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>
                    {unit.words.length} 个单词
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {dueCount > 0 && (
                    <span style={{
                      background: '#fef3c7', color: '#92400e', fontSize: 12,
                      padding: '2px 8px', borderRadius: 10,
                    }}>
                      {dueCount} 待复习
                    </span>
                  )}
                  <span style={{ color: '#9ca3af' }}>→</span>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
