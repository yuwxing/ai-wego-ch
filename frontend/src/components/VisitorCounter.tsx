import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import { visitCounterAPI } from '../utils/supabase'

const VISIT_COOLDOWN = 5000

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const last = localStorage.getItem('last_visit_time')
    const now = Date.now()
    if (!last || now - parseInt(last) > VISIT_COOLDOWN) {
      localStorage.setItem('last_visit_time', String(now))
      visitCounterAPI.increment(1).then(n => {
        if (n !== null) setCount(n)
        else setCount(0)
      })
    } else {
      visitCounterAPI.get().then(n => setCount(n))
    }
  }, [])

  if (count === null) return null

  return (
    <div className="inline-flex items-center gap-1.5 text-slate-400 text-sm">
      <Eye className="w-4 h-4" />
      <span>访问人数 {(count + 20000).toLocaleString()}</span>
    </div>
  )
}