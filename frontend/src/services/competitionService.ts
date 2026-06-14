import { supabaseFetch, SUPABASE_KEY, SUPABASE_URL } from '../utils/supabase'

export interface Competition {
  id: string
  title: string
  subtitle?: string
  category: '英语' | '数学' | '编程' | 'AI' | '阅读'
  type: '每日挑战' | '周赛' | '月赛' | '全国活动'
  difficulty: '青铜' | '白银' | '黄金' | '大师'
  description?: string
  cover?: string
  organizer?: string
  publisher_id?: number
  startTime: string
  endTime: string
  rewardWEG: number
  participants?: number
  status: 'upcoming' | 'running' | 'ended'
  createdAt: string
}

const STORAGE_KEY = 'aiwego_competitions'

const API_HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
}

async function supabaseGet(path: string) {
  const res = await fetch(`${SUPABASE_URL}${path}`, { headers: API_HEADERS })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function supabasePost(path: string, body: any) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method: 'POST',
    headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

function taskToCompetition(task: any): Competition {
  const meta = Array.isArray(task.requirements)
    ? task.requirements.find((r: any) => r?._competition_meta) || {}
    : {}
  return {
    id: String(task.id),
    title: task.title || '',
    subtitle: task.description?.slice(0, 80) || '',
    category: meta.category || 'AI',
    type: meta.type || '每日挑战',
    difficulty: meta.difficulty || '青铜',
    description: task.description || '',
    organizer: meta.organizer || 'AI-WEGO',
    publisher_id: task.publisher_id,
    startTime: task.created_at || new Date().toISOString(),
    endTime: task.deadline || new Date(Date.now() + 7 * 86400000).toISOString(),
    rewardWEG: task.budget || 0,
    participants: task.claimed_by?.length || 0,
    status: task.status === 'open' || task.status === 'matched' || task.status === 'in_progress' || task.status === 'submitted' ? 'running'
      : task.status === 'cancelled' || task.status === 'approved' ? 'ended'
      : 'upcoming',
    createdAt: task.created_at || new Date().toISOString(),
  }
}

function getLocalCompetitions(): Competition[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function saveLocalCompetitions(list: Competition[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export async function getCompetitions(): Promise<Competition[]> {
  try {
    const tasks = await supabaseGet('tasks?source=eq.competition&order=id.desc&limit=50')
    const fromServer = (tasks || []).map(taskToCompetition)
    // Clear stale localStorage entries to avoid showing deleted/closed competitions
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    return fromServer
  } catch {
    // Supabase fetch failed - return empty, don't use stale localStorage
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    return []
  }
}

export async function saveCompetition(comp: Competition): Promise<void> {
  // Save to localStorage for immediate local access
  const list = getLocalCompetitions()
  const idx = list.findIndex(c => c.id === comp.id)
  if (idx >= 0) list[idx] = comp
  else list.unshift(comp)
  saveLocalCompetitions(list)

  // Try Supabase - store metadata in requirements
  try {
    await supabasePost('tasks', {
      title: comp.title,
      description: comp.description || '',
      publisher_id: comp.publisher_id || 18,
      budget: comp.rewardWEG,
      deadline: comp.endTime,
      source: 'competition',
      status: 'open',
      requirements: [
        { _competition_meta: true, category: comp.category, type: comp.type, difficulty: comp.difficulty, organizer: comp.organizer },
      ],
      created_at: comp.createdAt || new Date().toISOString(),
    })
  } catch {
    // Silently fail - localStorage fallback works
  }
}

export function deleteCompetition(id: string): void {
  saveLocalCompetitions(getLocalCompetitions().filter(c => c.id !== id))
}

export async function getCompetitionById(id: string): Promise<Competition | undefined> {
  // Try Supabase
  try {
    const tasks = await supabaseGet(`tasks?id=eq.${id}&source=eq.competition`)
    if (tasks && tasks.length > 0) return taskToCompetition(tasks[0])
  } catch {}
  // Fallback to localStorage
  return getLocalCompetitions().find(c => c.id === id)
}
