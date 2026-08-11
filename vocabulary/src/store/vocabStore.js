import { create } from 'zustand'

const GRADE_DATA = {
  xiaoshengchu: { label: '小升初衔接', path: 'xiaoshengchu' },
  grade7a: { label: '七年级上册', path: 'grade7a' },
  grade7b: { label: '七年级下册', path: 'grade7b' },
  grade8a: { label: '八年级上册', path: 'grade8a' },
  grade8b: { label: '八年级下册', path: 'grade8b' },
}

async function loadGradeData(gradeId) {
  const mod = await import(`../../data/${GRADE_DATA[gradeId].path}/units.json`)
  return mod.default
}

let cachedData = null
async function getAllUnits() {
  if (cachedData) return cachedData
  const entries = []
  for (const [gradeId, info] of Object.entries(GRADE_DATA)) {
    const units = await loadGradeData(gradeId)
    for (const unit of units) {
      for (let i = 0; i < unit.words.length; i++) {
        const w = unit.words[i]
        entries.push({
          id: `${gradeId}/${unit.id}/${i}`,
          gradeId,
          unitId: unit.id,
          unitTitle: unit.title,
          ...w,
        })
      }
    }
  }
  cachedData = entries
  return entries
}

export const useVocabStore = create((set, get) => ({
  grades: GRADE_DATA,
  units: {},
  currentGrade: null,
  currentUnit: null,
  allWords: [],
  searchResults: [],
  loaded: false,

  loadAll: async () => {
    if (get().loaded) return
    const all = await getAllUnits()
    set({ allWords: all, loaded: true })
  },

  selectGrade: async (gradeId) => {
    const units = await loadGradeData(gradeId)
    set({ currentGrade: gradeId, currentUnit: null, units: { [gradeId]: units } })
  },

  selectUnit: (unitId) => set({ currentUnit: unitId }),

  getWordsByGrade: (gradeId) => {
    const state = get()
    if (!state.units[gradeId]) return []
    return state.units[gradeId].flatMap(u => u.words.map((w, i) => ({
      id: `${gradeId}/${u.id}/${i}`, gradeId, unitId: u.id, unitTitle: u.title, ...w
    })))
  },

  getWordsByUnit: (gradeId, unitId) => {
    const state = get()
    const unit = state.units[gradeId]?.find(u => u.id === unitId)
    if (!unit) return []
    return unit.words.map((w, i) => ({
      id: `${gradeId}/${unit.id}/${i}`, gradeId, unitId: unit.id, unitTitle: unit.title, ...w
    }))
  },

  searchWords: async (query) => {
    const all = get().allWords.length ? get().allWords : await getAllUnits()
    if (!query.trim()) { set({ searchResults: [] }); return }
    const q = query.toLowerCase()
    const results = all.filter(w =>
      w.word.toLowerCase().includes(q) || w.meaning.includes(q)
    )
    set({ searchResults: results })
  },
}))
