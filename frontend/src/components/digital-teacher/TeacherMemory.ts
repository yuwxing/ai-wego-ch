// ── Long-term memory for the digital teacher ──

interface MemoryEntry {
  id: string
  timestamp: number
  type: 'interaction' | 'lesson' | 'homework' | 'observation'
  content: string
}

const STORAGE_KEY = 'teacher-memory'

export class TeacherMemory {
  private entries: MemoryEntry[] = []
  private loaded = false

  constructor() {
    this.load()
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) this.entries = JSON.parse(raw)
    } catch { this.entries = [] }
    this.loaded = true
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries.slice(-100)))
    } catch { /* quota exceeded — ignore */ }
  }

  /** Add a memory entry */
  add(type: MemoryEntry['type'], content: string) {
    this.entries.push({
      id: Date.now().toString(36),
      timestamp: Date.now(),
      type,
      content,
    })
    this.save()
  }

  /** Get recent memories for context */
  getRecent(count = 5): MemoryEntry[] {
    return this.entries.slice(-count)
  }

  /** Search memories by keyword */
  search(query: string): MemoryEntry[] {
    const q = query.toLowerCase()
    return this.entries.filter(e => e.content.toLowerCase().includes(q))
  }

  /** Get all interactions */
  getInteractions(): MemoryEntry[] {
    return this.entries.filter(e => e.type === 'interaction')
  }

  /** Build a context string for the AI */
  getContextString(): string {
    const recent = this.getRecent(3)
    if (recent.length === 0) return ''
    return '【记忆上下文】\n' + recent.map(e => {
      const d = new Date(e.timestamp).toLocaleString('zh-CN')
      return `[${d}] ${e.content}`
    }).join('\n')
  }
}

/** Singleton instance */
let _memory: TeacherMemory | null = null
export function getTeacherMemory(): TeacherMemory {
  if (!_memory) _memory = new TeacherMemory()
  return _memory
}
