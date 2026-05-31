import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

const NAMESPACE = 'ai-wego.top'
const KEY = 'visitors'
const API_BASE = 'https://api.countapi.xyz'

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const counted = sessionStorage.getItem('vc_' + KEY)

    const url = counted
      ? `${API_BASE}/get/${NAMESPACE}/${KEY}`
      : `${API_BASE}/hit/${NAMESPACE}/${KEY}`

    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (typeof d.value === 'number') {
          setCount(d.value)
          if (!counted) sessionStorage.setItem('vc_' + KEY, '1')
        }
      })
      .catch(() => setCount(null))
  }, [])

  if (count === null) return null

  return (
    <div className="inline-flex items-center gap-1.5 text-slate-400 text-sm">
      <Eye className="w-4 h-4" />
      <span>访问人数 {count.toLocaleString()}</span>
    </div>
  )
}
