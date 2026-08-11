import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVocabStore } from '../store/vocabStore'
import { useReviewStore } from '../store/reviewStore'

const GRADE_COLORS = {
  xiaoshengchu: '#8b5cf6',
  grade7a: '#3b82f6',
  grade7b: '#06b6d4',
  grade8a: '#10b981',
  grade8b: '#f59e0b',
}

export default function Home() {
  const navigate = useNavigate()
  const grades = useVocabStore(s => s.grades)
  const loadAll = useVocabStore(s => s.loadAll)
  const stats = useReviewStore(s => s.getStats())

  useEffect(() => { loadAll() }, [])

  return (
    <div style={{ padding: '20px 16px', maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Vocabulary OS</h1>
      <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>新人教版英语单词学习系统</p>

      {stats.total > 0 && (
        <div style={{
          background: '#f0fdf4', borderRadius: 12, padding: 16, marginBottom: 20,
          border: '1px solid #bbf7d0',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#166534' }}>
            学习统计
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#6b7280' }}>{stats.total}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>已学</div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>{stats.mastered}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>已掌握</div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6' }}>{stats.reviewing}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>复习中</div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{stats.learning}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>学习中</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/review')}
            style={{
              width: '100%', marginTop: 12, padding: '10px 0',
              background: '#10b981', color: '#fff', border: 'none',
              borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            开始复习 ({stats.learning + stats.reviewing} 个待复习)
          </button>
        </div>
      )}

      <div style={{ fontSize: 14, fontWeight: 600, color: '#4b5563', marginBottom: 12 }}>
        选择年级
      </div>

      {Object.entries(grades).map(([id, info]) => (
        <div
          key={id}
          onClick={() => navigate(`/grade/${id}`)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', marginBottom: 10,
            background: '#fff', borderRadius: 12, cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `4px solid ${GRADE_COLORS[id] || '#3b82f6'}`,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>{info.label}</span>
          <span style={{ color: '#9ca3af' }}>→</span>
        </div>
      ))}

      <button
        onClick={() => navigate('/search')}
        style={{
          width: '100%', marginTop: 16, padding: '12px 0',
          background: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db',
          borderRadius: 8, fontSize: 15, cursor: 'pointer',
        }}
      >
        搜索单词
      </button>
    </div>
  )
}
