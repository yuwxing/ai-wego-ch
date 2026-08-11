import { create } from 'zustand'

const STORAGE_KEY = 'vocab-os-review'

const LEVELS = [
  { level: 0, label: '新词', color: '#6b7280' },
  { level: 1, label: '学习中', color: '#f59e0b' },
  { level: 2, label: '复习中', color: '#3b82f6' },
  { level: 3, label: '已掌握', color: '#10b981' },
]

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveToStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const useReviewStore = create((set, get) => ({
  reviews: loadFromStorage(),

  getWordReview(wordId) {
    return get().reviews[wordId] || null
  },

  getWordLevel(wordId) {
    const r = get().reviews[wordId]
    if (!r) return LEVELS[0]
    return LEVELS[r.level] || LEVELS[0]
  },

  recordAnswer(wordId, correct) {
    const reviews = { ...get().reviews }
    let r = reviews[wordId]

    if (!r) {
      r = { level: 0, interval: 0, nextReview: 0, lastReviewed: 0, correctCount: 0, incorrectCount: 0 }
    }

    if (correct) {
      r.correctCount++
      if (r.level === 0) {
        r.level = 1; r.interval = 1
      } else if (r.level === 1) {
        r.level = 2; r.interval = 3
      } else if (r.level === 2) {
        if (r.correctCount >= 3) { r.level = 3; r.interval = 30 }
        else { r.interval = Math.min(r.interval * 2, 15) }
      } else {
        r.interval = Math.min(r.interval + 15, 90)
      }
    } else {
      r.incorrectCount++
      if (r.level > 1) {
        r.level = 1; r.interval = 1
      } else if (r.level === 1 && r.incorrectCount > 3) {
        r.level = 0; r.interval = 0
      }
    }

    r.lastReviewed = Date.now()
    r.nextReview = Date.now() + r.interval * 86400000
    reviews[wordId] = r
    set({ reviews })
    saveToStorage(reviews)
  },

  getDueReviews(wordIds) {
    const reviews = get().reviews
    const now = Date.now()
    return wordIds.filter(id => {
      const r = reviews[id]
      return !r || r.nextReview <= now
    })
  },

  getStats() {
    const reviews = Object.values(get().reviews)
    const total = reviews.length
    const mastered = reviews.filter(r => r.level === 3).length
    const learning = reviews.filter(r => r.level === 1).length
    const reviewing = reviews.filter(r => r.level === 2).length
    const newWords = reviews.filter(r => r.level === 0).length
    return { total, mastered, learning, reviewing, newWords }
  },

  resetWord(wordId) {
    const reviews = { ...get().reviews }
    delete reviews[wordId]
    set({ reviews })
    saveToStorage(reviews)
  },
}))
