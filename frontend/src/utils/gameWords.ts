import { WORD_DATA, GRADE_CONFIG } from '../data/wordData'

export interface Word {
  word: string
  phonetic: string
  meaning: string
  unit: number
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function getRandomWords(count: number, grade?: number): Word[] {
  let pool: Word[]
  if (grade && WORD_DATA[grade]) {
    pool = WORD_DATA[grade]
  } else {
    pool = Object.values(WORD_DATA).flat()
  }
  return shuffle(pool).slice(0, Math.max(count, pool.length))
}

export function getMeaningPool(words: Word[], target: Word): string[] {
  const others = shuffle(words.filter(w => w.word !== target.word)).slice(0, 3)
  const pool = [target.meaning, ...others.map(w => w.meaning)]
  return shuffle(pool)
}

export function getGradeOptions(): { value: string; label: string }[] {
  return [{ value: '', label: '全部年级' }, ...Object.entries(GRADE_CONFIG).map(([k, v]) => ({
    value: k,
    label: v.label,
  }))]
}

export function extractWord(text: string): string {
  return text.split('/')[0].trim().toLowerCase().replace(/[^a-z']/g, '')
}

export function normalizeAnswer(a: string): string {
  return a.trim().toLowerCase().replace(/\s+/g, ' ')
}
