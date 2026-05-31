import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const cb = 'bszCb_' + Date.now()
    ;(window as any)[cb] = (data: any) => {
      if (data && typeof data.site_pv === 'number') {
        setCount(data.site_pv)
      }
      delete (window as any)[cb]
    }

    const el = document.createElement('script')
    el.src = `https://busuanzi.ibruce.info/busuanzi?jsonpCallback=${cb}`
    el.async = true
    el.onerror = () => { setCount(null); delete (window as any)[cb] }
    document.head.appendChild(el)

    return () => { delete (window as any)[cb] }
  }, [])

  if (count === null) return null

  return (
    <div className="inline-flex items-center gap-1.5 text-slate-400 text-sm">
      <Eye className="w-4 h-4" />
      <span>访问人数 {(count + 10000).toLocaleString()}</span>
    </div>
  )
}
