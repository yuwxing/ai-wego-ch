import { useState, useEffect, useRef, useCallback } from 'react'
import { Shuffle, UserX, Upload, Save, Trash2, Plus, School, ClipboardPaste } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ClassRoster {
  id: string
  name: string
  names: string[]
}

const STORAGE_KEY = 'gameCarnival_rosters'
const ACTIVE_KEY = 'gameCarnival_activeClass'

const DEFAULT_NAMES = ['小明', '小红', '小刚', '小丽', '小华', '小芳', '小强', '小雪']
const genId = () => Math.random().toString(36).substring(2, 10)

const HEADER_NAMES = ['姓名', '名字', '学生', '学生姓名', '学生名单', '名单', 'name', 'Name', 'NAME', 'Student', 'student', '姓名(name)', '姓名（name）']

function loadRosters(): ClassRoster[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.filter(c => c && c.name && Array.isArray(c.names))
    }
  } catch {}
  return []
}

export default function RandomPicker() {
  const [rosters, setRosters] = useState<ClassRoster[]>(loadRosters)
  const [activeId, setActiveId] = useState<string>(() => {
    const saved = localStorage.getItem(ACTIVE_KEY)
    const list = loadRosters()
    if (saved && list.some(c => c.id === saved)) return saved
    return list[0]?.id || ''
  })
  const [classNames, setClassNames] = useState<string[]>(() => {
    const list = loadRosters()
    const active = list.find(c => c.id === localStorage.getItem(ACTIVE_KEY)) || list[0]
    return active ? active.names : []
  })
  const [newClassName, setNewClassName] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [showPaste, setShowPaste] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [rolling, setRolling] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const activeRoster = rosters.find(c => c.id === activeId)

  const saveRosters = (list: ClassRoster[]) => {
    setRosters(list)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }

  const setActive = (id: string, listOverride?: ClassRoster[]) => {
    setActiveId(id)
    localStorage.setItem(ACTIVE_KEY, id)
    const list = listOverride || rosters
    const c = list.find(r => r.id === id)
    setClassNames(c ? c.names : [])
    setPicked(null)
    setHistory([])
    setImportMsg('')
  }

  const addClass = () => {
    const name = newClassName.trim()
    if (!name) return
    const id = genId()
    const list = [...rosters, { id, name, names: [] }]
    saveRosters(list)
    setNewClassName('')
    setActiveId(id)
    localStorage.setItem(ACTIVE_KEY, id)
    setClassNames([])
    setPicked(null)
    setHistory([])
    setImportMsg('')
  }

  const removeClass = (id: string) => {
    if (!confirm(`删除班级「${rosters.find(c => c.id === id)?.name}」？名单将一并删除。`)) return
    const list = rosters.filter(c => c.id !== id)
    saveRosters(list)
    if (activeId === id) {
      const next = list[0]
      if (next) setActive(next.id, list)
      else {
        setActiveId('')
        setClassNames([])
        setPicked(null)
        setHistory([])
      }
    }
  }

  const applyNamesToClass = (names: string[]) => {
    const cleaned = names
      .map(n => n.trim())
      .filter((n, i, arr) => n && arr.indexOf(n) === i)
    if (cleaned.length === 0) return
    if (!activeRoster) {
      const id = genId()
      const list = [...rosters, { id, name: '新班级', names: cleaned }]
      saveRosters(list)
      setActiveId(id)
      localStorage.setItem(ACTIVE_KEY, id)
      setClassNames(cleaned)
      setPicked(null)
      setHistory([])
      return
    }
    const list = rosters.map(c => c.id === activeId ? { ...c, names: cleaned } : c)
    saveRosters(list)
    setClassNames(cleaned)
    setPicked(null)
    setHistory([])
  }

  const parseNameColumn = (rows: any[][]): string[] => {
    const first = rows[0] || []
    const EXCLUDE = ['学号', '序号', '编号', 'id', 'ID', 'No', 'no', 'NO', '编号']
    // 1) 精确匹配已知姓名表头
    let headerIdx = first.findIndex(cell => {
      const s = String(cell ?? '').trim()
      return HEADER_NAMES.some(h => h === s)
    })
    // 2) 模糊匹配：包含已知关键词且不含排除词
    if (headerIdx < 0) {
      headerIdx = first.findIndex(cell => {
        const s = String(cell ?? '').trim().toLowerCase()
        if (EXCLUDE.some(ex => ex.toLowerCase() === s)) return false
        return HEADER_NAMES.some(h => {
          const hh = h.toLowerCase()
          return h.length > 1 && s.includes(hh)
        })
      })
    }
    const col = headerIdx >= 0 ? headerIdx : 0
    const body = headerIdx >= 0 ? rows.slice(1) : rows
    const names = body
      .map(row => String(row[col] ?? '').trim())
      .filter(n => n && !/^\d{2,}$/.test(n) && !/^\d+[\.、）)]/.test(n))
    return names
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      setImportMsg('解析中...')
      const ext = file.name.split('.').pop()?.toLowerCase()
      let rows: any[][]
      if (ext === 'csv') {
        const text = await readCsvText(file)
        rows = text
          .split(/\r\n|\n|\r/)
          .filter(line => line.trim() !== '')
          .map(line => line.split(/[,，]/).map(c => c.trim()))
      } else {
        const buf = await file.arrayBuffer()
        const wb = XLSX.read(buf, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        if (!ws) throw new Error('未找到工作表')
        rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      }
      const names = parseNameColumn(rows)
      if (names.length === 0) {
        setImportMsg('❌ 未识别到姓名，请检查文件第一列为学生姓名')
        return
      }
      applyNamesToClass(names)
      setImportMsg(`✅ 成功导入 ${names.length} 名学生`)
    } catch (err: any) {
      setImportMsg(`❌ 导入失败：${err?.message || '文件格式错误'}`)
    }
  }

  const readCsvText = async (file: File): Promise<string> => {
    const buf = await file.arrayBuffer()
    const bom = new Uint8Array(buf.slice(0, 3))
    if (bom[0] === 0xEF && bom[1] === 0xBB && bom[2] === 0xBF) {
      return new TextDecoder('utf-8').decode(buf)
    }
    try {
      const utf8 = new TextDecoder('utf-8', { fatal: true }).decode(buf)
      if (!utf8.includes('\uFFFD')) return utf8
    } catch {}
    try {
      return new TextDecoder('gb18030').decode(buf)
    } catch {
      return new TextDecoder('utf-8').decode(buf)
    }
  }

  const handlePaste = () => {
    const arr = pasteText.split(/[,，、\n\r\t\s]+/).map(s => s.trim()).filter(Boolean)
    if (arr.length === 0) return
    applyNamesToClass(arr)
    setPasteText('')
    setShowPaste(false)
    setImportMsg(`✅ 成功导入 ${arr.length} 名学生`)
  }

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const pick = useCallback(() => {
    if (rolling) return
    const pool = classNames.filter(n => !history.includes(n) && n !== picked)
    if (pool.length === 0) {
      setHistory([])
      setPicked(null)
      setImportMsg('已全部点完，重新开始新一轮')
      return
    }
    setRolling(true)
    let count = 0
    intervalRef.current = setInterval(() => {
      setPicked(pool[Math.floor(Math.random() * pool.length)])
      count++
      if (count >= 18) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setRolling(false)
        const final = pool[Math.floor(Math.random() * pool.length)]
        setPicked(final)
        setHistory(h => [final, ...h].slice(0, 20))
      }
    }, 80)
  }, [rolling, classNames, history, picked])

  const resetAll = () => {
    setPicked(null)
    setHistory([])
    setImportMsg('')
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-1">🎲 随机点名</h2>
      <p className="text-xs text-slate-400 mb-5">支持多班级 · Excel/CSV导入 · 名单本地保存，点过不重复</p>

      {/* 班级管理 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <School className="w-4 h-4 text-sky-500" />
          <span className="text-sm font-bold text-slate-700">我的班级</span>
          <span className="text-[10px] text-slate-400 ml-auto">名单保存在本机，换设备需重新导入</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {rosters.length === 0 && (
            <span className="text-xs text-slate-400 py-1">还没有班级，先新建或导入名单</span>
          )}
          {rosters.map(c => (
            <div key={c.id}
              className={`group inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${activeId === c.id ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-200' : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'}`}>
              <button onClick={() => setActive(c.id)} className="flex items-center gap-1.5">
                {c.name}
                <span className={`text-[10px] ${activeId === c.id ? 'text-sky-100' : 'text-slate-400'}`}>({c.names.length}人)</span>
              </button>
              <button onClick={() => removeClass(c.id)} className={`opacity-40 hover:opacity-100 transition-opacity ${activeId === c.id ? 'text-white' : 'text-slate-400 hover:text-red-500'}`}>
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newClassName}
            onChange={e => setNewClassName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addClass()}
            placeholder="新班级名称，如：八年级3班"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
          <button onClick={addClass}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors shrink-0">
            <Plus className="w-4 h-4" /> 新建
          </button>
        </div>
      </div>

      {/* 导入区 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
          <button onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-600 transition-colors shadow-md shadow-sky-200">
            <Upload className="w-4 h-4" /> 导入 Excel
          </button>
          <button onClick={() => setShowPaste(!showPaste)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-sky-200 text-sky-600 text-sm font-bold hover:bg-sky-50 transition-colors">
            <ClipboardPaste className="w-4 h-4" /> 粘贴名单
          </button>
          {importMsg && <span className="text-xs text-slate-500">{importMsg}</span>}
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          无需模板：Excel 任意列头（姓名/名字/学生/name 等）或第一列都会被识别，自动忽略学号序号
        </p>
        {showPaste && (
          <div className="mt-3">
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder="从 Excel 复制姓名列，粘贴到这里（逗号、空格、换行分隔均可）"
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
            />
            <button onClick={handlePaste}
              className="mt-2 px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors">
              导入到当前班级
            </button>
          </div>
        )}
      </div>

      {/* 点名区 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center mb-6 shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-medium">
            {activeRoster ? activeRoster.name : '未选择班级'} · {classNames.length} 人
          </span>
        </div>
        <div className="min-h-[120px] flex flex-col items-center justify-center">
          {picked ? (
            <p className={`text-5xl font-extrabold break-all ${rolling ? 'text-sky-400' : 'text-sky-600 animate-bounce'}`}>{picked}</p>
          ) : (
            <p className="text-slate-300 text-lg">{classNames.length === 0 ? '请先导入班级名单' : '点击下方按钮开始点名'}</p>
          )}
        </div>
        <button onClick={pick} disabled={rolling || classNames.length === 0}
          className="mt-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-500 text-white text-lg font-bold shadow-lg shadow-sky-200 hover:from-sky-600 hover:to-blue-600 transition-all active:scale-95 disabled:opacity-50 inline-flex items-center gap-2">
          <Shuffle className="w-5 h-5" /> {rolling ? '转动中...' : '随机点名'}
        </button>
        <div className="mt-3">
          <button onClick={resetAll} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
            <UserX className="w-3.5 h-3.5" /> 清空已点记录
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-400">已点名记录（本轮不重复）</p>
            <button onClick={resetAll} className="text-[11px] text-sky-500 hover:text-sky-700 font-medium inline-flex items-center gap-1">
              <Save className="w-3 h-3" /> 重新开始
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((n, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-medium">{i + 1}. {n}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
