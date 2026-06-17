import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Settings, Bot, BookOpen, FileText, Sparkles, Loader2, Download } from 'lucide-react'

const SYSTEM_PROMPT = `你是初中英语多智能体协作教学团队，严格按照2026年高考英语命题方向（教育部教育考试院）生成教学内容。

你的团队成员：
🧠 总控教师 — 统筹分析教学任务，拆解子任务，协调各科教师协作
📚 备课组长 — 设计教案、课件、课堂活动、板书设计
📝 命题专家 — 编制练习题、试卷、测评方案，含听力/阅读/语法/写作
✅ 批改组长 — 批改作业、分析错题、生成反馈报告、针对性练习建议
🎯 辅导老师 — 一对一答疑、分层辅导、学习方法指导

2026年命题方向（必须遵循）：
1. 厚植家国情怀，讲好中国故事 — 融入中华优秀传统文化（如中国传统大集、太极拳等），展现中国乡土社会繁荣景象与独特风情
2. 涵养人文底蕴，塑造道德品格 — 融入人文关怀故事（如离开故乡后的感悟、追逐梦想的教师），传递感恩、坚韧、勇于追梦的价值观
3. 弘扬科学精神，培育探究能力 — 紧扣科学探究与科技创新前沿（如树种化学物质与汽车尾气结合、地铁再生制动能量回收），引导学生辩证思考、探究分析
4. 融入体美劳教育，促进全面发展 — 体育赛事资讯、配图创作、日常家务培养责任感等，贯彻五育并举
5. 强调关键能力，深化基础考查 — 听力、阅读、语言运用、写作四个维度，考查在真实交际情境中灵活运用英语的能力
6. 注重思维品质，创新考查方式 — 创设真实多元富有启发性的情境，考查批判性思维和创新意识（如对未来大学生活学习/社交/睡眠排序并阐述理由）

回复要求：
- 输出纯文本，不要使用 # 或 * 标记格式
- 按角色分工各司其职，不需要所有角色参与时只展示相关角色
- 所有内容用中文回答，英语示例保留英文
- 命题内容必须与当下（2026年）最新教材版本和考试方向同步`

const AGENTS = [
  { icon: '🧠', title: '总控教师', desc: '教学规划 · 任务分发 · 成果汇总', key: 'master' },
  { icon: '📚', title: '备课组长', desc: '教案设计 · PPT生成 · 课堂活动', key: 'lesson' },
  { icon: '📝', title: '命题专家', desc: '同步练习 · 单元测试 · 中考模拟', key: 'exam' },
  { icon: '✅', title: '批改组长', desc: '作文批改 · 错题分析 · 学情报告', key: 'grading' },
  { icon: '🎯', title: '辅导老师', desc: '答疑辅导 · 个性提升 · 学习规划', key: 'tutor' },
]

const TEMPLATES = [
  '2024人教版七下Unit 8 Once upon a time Section B 阅读课',
  '2026中考英语完形填空命题（家国情怀主题）',
  '九年级Unit 5写作课教案设计（说明文）',
  '2026中考英语阅读理解命题（科技创新主题）',
]

const ROLE_MARKERS = ['🧠【总控教师】', '📚【备课组长】', '📝【命题专家】', '✅【批改组长】', '🎯【辅导老师】']

function parseTeacherOutputs(text: string) {
  const teachers: { name: string; content: string; emoji: string }[] = []
  const lines = text.split('\n')
  let current: { name: string; content: string; emoji: string } | null = null
  for (const line of lines) {
    const marker = ROLE_MARKERS.find(r => line.includes(r))
    if (marker) {
      if (current) teachers.push(current)
      const emojiMatch = marker.match(/^(..)/)
      current = { name: marker, content: '', emoji: emojiMatch?.[1] || '📄' }
    } else if (current) {
      current.content += line + '\n'
    }
  }
  if (current) teachers.push(current)
  return teachers
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.md') ? filename : filename + '.md'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function getApiKey() {
  try {
    const key = localStorage.getItem('deepseek_api_key')
    return key || ''
  } catch { return '' }
}

export default function MultiAgentTeamPage() {
  const navigate = useNavigate()
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState(getApiKey())
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [agentProgress, setAgentProgress] = useState({ master: 0, lesson: 0, exam: 0, grading: 0, tutor: 0 })
  const [agentStatus, setAgentStatus] = useState<Record<string, string>>({})
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result])

  const startSimulation = () => {
    const keys = ['master', 'lesson', 'exam', 'grading', 'tutor']
    const status: Record<string, string> = { master: 'done' }
    keys.forEach(k => { if (k !== 'master') status[k] = 'working' })
    setAgentStatus(status)
    setAgentProgress({ master: 100, lesson: 0, exam: 0, grading: 0, tutor: 0 })

    keys.slice(1).forEach((key, i) => {
      const delay = 800 + i * 1200
      const duration = 3000 + Math.random() * 2000
      const startTime = Date.now()
      const interval = window.setInterval(() => {
        const elapsed = Date.now() - startTime - delay
        if (elapsed < 0) return
        const pct = Math.min(100, Math.round((elapsed / duration) * 100))
        setAgentProgress(prev => ({ ...prev, [key]: pct }))
        if (pct >= 100) {
          clearInterval(interval)
          setAgentStatus(prev => ({ ...prev, [key]: 'done' }))
        }
      }, 100)
    })
  }

  const handleGenerate = async (prompt: string) => {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setResult('')
    startSimulation()

    const key = getApiKey()
    if (!key) {
      setResult('请先配置 DeepSeek API 密钥后再使用')
      setLoading(false)
      setAgentProgress({ master: 0, lesson: 0, exam: 0, grading: 0, tutor: 0 })
      setAgentStatus({})
      return
    }

    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          max_tokens: 8192,
          temperature: 0.7,
        }),
      })
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content || '抱歉，团队暂时无法回复，请稍后重试'
      setResult(text)
    } catch {
      setResult('网络出错了，请检查网络连接后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('deepseek_api_key', apiKey.trim())
    } else {
      localStorage.removeItem('deepseek_api_key')
    }
    setShowSettings(false)
  }

  const teachers = parseTeacherOutputs(result)

  return (
    <div className="min-h-screen" style={{ background: '#FFF8E7' }}>
      <style>{`
        @media (max-width: 768px) {
          .team-grid { grid-template-columns: 1fr !important; text-align: center; }
          .team-buttons { justify-content: center; }
          .templates-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">&larr; 返回首页</Link>
            <span className="font-bold text-sm text-slate-700">🤖 WE-AIGO TEAM</span>
          </div>
          <button onClick={() => setShowSettings(true)}
            className="px-4 py-2 rounded-xl text-xs font-medium text-white transition-all"
            style={{ background: '#f59e0b' }}>
            <Settings className="w-3.5 h-3.5 inline mr-1" /> 模型设置
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6">
        {/* Hero */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center py-12 md:py-16 team-grid">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3" style={{ letterSpacing: -1 }}>
              🧠 AI英语教研团队
            </h1>
            <p className="text-lg text-slate-500 mb-1">5位AI教师实时协作</p>
            <p className="text-sm text-slate-400 mb-6">备课 · 命题 · 批改 · 辅导 · 教研</p>
            <div className="flex gap-3 team-buttons">
              <button onClick={() => inputRef.current?.focus()}
                className="px-7 py-3 rounded-2xl text-white font-medium text-sm transition-all"
                style={{ background: '#f59e0b' }}>
                🚀 开始协作
              </button>
              <button className="px-7 py-3 rounded-2xl text-slate-600 font-medium text-sm border border-slate-200 bg-white transition-all">
                📚 查看案例
              </button>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-8 shadow-lg text-center">
            <div className="text-5xl">🧠</div>
            <div className="font-bold mt-2 text-base text-slate-700">总控教师</div>
            <div className="my-4 mx-auto h-6" style={{ borderLeft: '2px dashed #ddd', width: 0 }} />
            <div className="grid grid-cols-4 gap-2.5">
              {AGENTS.slice(1).map(a => (
                <div key={a.key} className="rounded-2xl py-3.5 px-2 text-center" style={{ background: '#FFFBEB' }}>
                  <div className="text-2xl">{a.icon}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{a.title}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Templates */}
        <section className="pb-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-5">📖 教学任务模板</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 templates-grid">
            {TEMPLATES.map(t => (
              <div key={t} className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="font-semibold text-sm text-slate-700 mb-3">{t}</p>
                <button onClick={() => handleGenerate(t)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white transition-all"
                  style={{ background: '#f59e0b' }}>
                  立即生成
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Multi-agent Collaboration */}
        <section className="pb-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-5">🤖 多智能体实时协作</h2>
          <div className="space-y-2.5">
            {AGENTS.map(a => {
              const pct = agentProgress[a.key as keyof typeof agentProgress] || 0
              const status = agentStatus[a.key] || 'waiting'
              return (
                <div key={a.key} className="bg-white rounded-2xl px-5 py-3.5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-slate-700">{a.icon} {a.title}</span>
                    <span className="text-xs font-medium"
                      style={{
                        color: status === 'done' ? '#22c55e' : status === 'working' ? '#f59e0b' : '#ccc'
                      }}>
                      {status === 'done' ? '✅ 已完成' : status === 'working' ? `${pct}%` : '⏳ 等待中'}
                    </span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: '#f3f3f3' }}>
                    <div className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        background: status === 'done' ? '#22c55e' : '#f59e0b'
                      }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Custom Prompt Input */}
        <section className="pb-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-1">💬 自定义任务</h3>
            <p className="text-xs text-slate-400 mb-4">输入你的教学需求，AI团队将自动协作完成</p>
            <div className="flex gap-3">
              <input ref={inputRef} type="text" value={apiKey ? undefined : ''}
                placeholder={apiKey ? '例如：设计一节初三英语复习课' : '请先配置 API 密钥'}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-300 bg-slate-50"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value
                    if (val.trim()) handleGenerate(val.trim())
                  }
                }}
              />
              <button onClick={() => {
                const val = inputRef.current?.value
                if (val?.trim()) handleGenerate(val.trim())
              }}
                disabled={loading || !apiKey}
                className="px-6 py-3 rounded-xl text-white font-medium text-sm transition-all disabled:opacity-50"
                style={{ background: '#f59e0b' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '🚀 开始协作'}
              </button>
            </div>
          </div>
        </section>

        {/* Result */}
        {result && (
          <section ref={resultRef} className="pb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-5">📂 团队成果</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-600">
                {(expanded ? result : result.slice(0, 600)) + (result.length > 600 && !expanded ? '...' : '')}
              </div>
              {result.length > 600 && (
                <div className="text-center mt-4">
                  <button onClick={() => setExpanded(!expanded)}
                    className="text-xs" style={{ color: '#f59e0b', cursor: 'pointer' }}>
                    {expanded ? '🔼 收起' : '📄 展开全部'}
                  </button>
                </div>
              )}

              {teachers.length > 0 && (
                <>
                  <div className="mt-5 pt-4" style={{ borderTop: '1px solid #eee' }}>
                    <p className="text-xs text-slate-400 mb-2">📥 下载各教师产出：</p>
                    <div className="flex flex-wrap gap-1.5">
                      {teachers.map((t, i) => (
                        <button key={i} onClick={() => downloadFile(
                          t.emoji + ' ' + t.name + '\n' + t.content.trim(),
                          t.name.replace(/[【】\[\]]/g, '') + '.md'
                        )}
                          className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                          style={{ background: '#FFFBEB', border: '1px solid #fde68a', color: '#92400e' }}>
                          <Download className="w-3 h-3" /> {t.emoji} {t.name.replace(/[【】]/g, '')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-slate-400 mb-2">📦 打包下载：</p>
                    <button onClick={() => {
                      let all = ''
                      teachers.forEach(t => { all += t.emoji + ' ' + t.name + '\n' + t.content.trim() + '\n\n' })
                      downloadFile(all, '团队完整成果.md')
                    }}
                      className="text-xs px-3 py-1.5 rounded-lg text-white transition-all"
                      style={{ background: '#f59e0b' }}>
                      <Download className="w-3 h-3 inline mr-1" /> 打包下载全部
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-800">模型设置</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">输入你的 DeepSeek API 密钥</p>
            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
              placeholder="sk-..." autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-amber-300 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowSettings(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium">
                取消
              </button>
              <button onClick={handleSaveKey}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ background: '#f59e0b' }}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
