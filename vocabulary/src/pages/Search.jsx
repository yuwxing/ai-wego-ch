import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVocabStore } from '../store/vocabStore'
import { useReviewStore } from '../store/reviewStore'
import { speak } from '../services/tts'
import MemoryTag from '../components/MemoryTag'

const GRADE_LABELS = {
  xiaoshengchu: '小升初', grade7a: '七上', grade7b: '七下',
  grade8a: '八上', grade8b: '八下',
}

export default function Search() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const results = useVocabStore(s => s.searchResults)
  const searchWords = useVocabStore(s => s.searchWords)
  const getWordLevel = useReviewStore(s => s.getWordLevel)

  const handleSearch = (e) => {
    const val = e.target.value
    setQuery(val)
    searchWords(val)
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: 480, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/')}
        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: 14, marginBottom: 12 }}
      >
        ← 返回
      </button>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>搜索单词</h1>
      <input
        value={query}
        onChange={handleSearch}
        placeholder="输入英文或中文..."
        autoFocus
        style={{
          width: '100%', padding: '12px 16px', border: '2px solid #3b82f6',
          borderRadius: 8, fontSize: 16, boxSizing: 'border-box', outline: 'none',
        }}
      />
      <div style={{ marginTop: 16 }}>
        {results.length === 0 && query.trim() && (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>未找到匹配的单词</div>
        )}
        {results.map((w, i) => {
          const level = getWordLevel(w.id)
          return (
            <div
              key={w.id}
              style={{
                padding: '12px 16px', marginBottom: 8, background: '#fff',
                borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>{w.word}</span>
                  <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'serif' }}>{w.phonetic}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); speak(w.word) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 0 }}
                  >
                    🔊
                  </button>
                </div>
                <div style={{ fontSize: 14, color: '#4b5563', marginTop: 2 }}>{w.meaning}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                  {GRADE_LABELS[w.gradeId] || w.gradeId} · {w.unitTitle}
                </div>
              </div>
              <MemoryTag level={level} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
