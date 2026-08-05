import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getApiKey } from '../utils/deepseek'

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
  { icon: '🧠', title: '总控教师', desc: '教学规划 · 任务分发 · 成果汇总', key: '总控教师' },
  { icon: '📚', title: '备课组长', desc: '教案设计 · PPT生成 · 课堂活动', key: '备课组长' },
  { icon: '📝', title: '命题专家', desc: '同步练习 · 单元测试 · 中考模拟', key: '命题专家' },
  { icon: '✅', title: '批改组长', desc: '作文批改 · 错题分析 · 学情报告', key: '批改组长' },
  { icon: '🎯', title: '辅导老师', desc: '答疑辅导 · 个性提升 · 学习规划', key: '辅导老师' },
]

const TEMPLATES = ['2024人教版七下Unit 8 Once upon a time Section B 阅读课', '2026中考英语完形填空命题（家国情怀主题）', '九年级Unit 5写作课教案设计（说明文）', '2026中考英语阅读理解命题（科技创新主题）']
const RESULT_TYPES: { icon: string; label: string; section: string; file: string }[] = [
  { icon: '📖', label: '教案', section: '备课组长', file: '教案.md' },
  { icon: '📄', label: 'PPT', section: '备课组长', file: '课件PPT.md' },
  { icon: '📝', label: '试卷', section: '命题专家', file: '试卷.md' },
  { icon: '📊', label: '学情分析', section: '批改组长', file: '学情分析.md' },
  { icon: '🎯', label: '个性化辅导', section: '辅导老师', file: '个性化辅导.md' },
]

const RESULT_CONTENT: Record<string, string> = {
  '教案': '# 📖 教案\n\n',
  'PPT': '# 📄 PPT 课件大纲\n\n',
  '试卷': '# 📝 试卷\n\n',
  '学情分析': '# 📊 学情分析报告\n\n',
  '个性化辅导': '# 🎯 个性化辅导方案\n\n',
}

const AGENT_HEADERS = ['🧠【总控教师】','📚【备课组长】','📝【命题专家】','✅【批改组长】','🎯【辅导老师】']

const genId = () => Math.random().toString(36).substring(2, 10)

function parseAgentSections(text: string) {
  const sections: { name: string; content: string; emoji: string }[] = []
  const lines = text.split('\n')
  let current: { name: string; content: string; emoji: string } | null = null
  for (const line of lines) {
    const header = AGENT_HEADERS.find(h => line.includes(h))
    if (header) {
      if (current) sections.push(current)
      current = { name: header, content: '', emoji: header.match(/^(..)/)?.[1] || '📄' }
    } else if (current) {
      current.content += line + '\n'
    }
  }
  if (current) sections.push(current)
  return sections
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

export default function MultiAgentEduTeam() {
  const navigate = useNavigate()
  const [apiModal, setApiModal] = useState(false)
  const [apiInput, setApiInput] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ master: 0, lesson: 0, exam: 0, grading: 0, tutor: 0 })
  const [agentStatus, setAgentStatus] = useState<Record<string, 'idle'|'working'|'done'>>({})
  const [showFull, setShowFull] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (aiResult && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [aiResult])

  const simulateProgress = () => {
    const ids = ['master','lesson','exam','grading','tutor']
    const statuses: Record<string, 'working'|'done'> = { master: 'done' }
    ids.forEach(id => { statuses[id] = id === 'master' ? 'done' : 'working' })
    setAgentStatus(statuses)

    setProgress({ master: 100, lesson: 0, exam: 0, grading: 0, tutor: 0 })
    const intervals: number[] = []
    ids.slice(1).forEach((id, idx) => {
      const delay = 800 + idx * 1200
      const dur = 3000 + Math.random() * 2000
      const startTime = Date.now()
      const iv = window.setInterval(() => {
        const elapsed = Date.now() - startTime - delay
        if (elapsed < 0) return
        const pct = Math.min(100, Math.round((elapsed / dur) * 100))
        setProgress(prev => ({ ...prev, [id]: pct }))
        if (pct >= 100) {
          clearInterval(iv)
          setAgentStatus(prev => ({ ...prev, [id]: 'done' }))
        }
      }, 100)
      intervals.push(iv)
    })
  }

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return
    setLoading(true)
    setAiResult('')
    simulateProgress()

    const apiKey = getApiKey()
    if (!apiKey) {
      setAiResult('请先配置 DeepSeek API 密钥后再使用 🗝️')
      setLoading(false)
      setProgress({ master: 0, lesson: 0, exam: 0, grading: 0, tutor: 0 })
      setAgentStatus({})
      return
    }

    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: text }
          ],
          max_tokens: 8192,
          temperature: 0.7
        })
      })
      const data = await res.json()
      setAiResult(data.choices?.[0]?.message?.content || '抱歉，团队暂时无法回复，请稍后重试。')
    } catch {
      setAiResult('网络出错了，请检查网络连接后重试。')
    }
    setLoading(false)
  }

  const getAgentProgress = (title: string) => {
    const map: Record<string, keyof typeof progress> = {
      '总控教师': 'master', '备课组长': 'lesson', '命题专家': 'exam', '批改组长': 'grading', '辅导老师': 'tutor'
    }
    return progress[map[title] || 'master']
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFF8E7', color: '#3d3d3d', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif', paddingBottom: 80 }}>
      <style>{`
        @media (max-width: 768px) {
          .team-hero { grid-template-columns: 1fr !important; text-align: center; }
          .team-hero-buttons { justify-content: center; }
          .team-templates { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #eee', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/" style={{ fontSize: 12, color: '#999', textDecoration: 'none' }}>← 返回首页</Link>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#333' }}>🤖 WE-AIGO TEAM</span>
          </div>
          <button onClick={() => setApiModal(true)}
            style={{ borderRadius: 12, background: '#f59e0b', color: '#fff', border: 'none', padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>
            ⚙️ 模型设置
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Hero */}
        <section className="team-hero" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', padding: '60px 0 48px' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.15, letterSpacing: -1 }}>🧠 AI英语教研团队</h1>
            <p style={{ fontSize: 18, color: '#666', margin: '0 0 8px' }}>5位AI教师实时协作</p>
            <p style={{ fontSize: 14, color: '#888', margin: '0 0 24px' }}>备课 · 命题 · 批改 · 辅导 · 教研</p>
            <div className="team-hero-buttons" style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => textareaRef.current?.focus()}
                style={{ borderRadius: 16, background: '#f59e0b', color: '#fff', border: 'none', padding: '12px 28px', fontSize: 15, cursor: 'pointer' }}>
                🚀 开始协作
              </button>
              <button style={{ borderRadius: 16, border: '1px solid #ddd', background: '#fff', padding: '12px 28px', fontSize: 15, cursor: 'pointer', color: '#555' }}>
                📚 查看案例
              </button>
            </div>
          </div>
          <div style={{ borderRadius: 24, background: '#fff', padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <div style={{ fontSize: 56 }}>🧠</div>
            <div style={{ fontWeight: 700, marginTop: 8, fontSize: 16 }}>总控教师</div>
            <div style={{ margin: '16px auto', height: 24, borderLeft: '2px dashed #ddd', width: 0 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {[{icon:'📚',label:'备课组长'},{icon:'📝',label:'命题专家'},{icon:'✅',label:'批改组长'},{icon:'🎯',label:'辅导老师'}].map((e, i) => (
                <div key={i} style={{ borderRadius: 16, background: '#FFFBEB', padding: '14px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28 }}>{e.icon}</div>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{e.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* Templates */}
        <section style={{ padding: '0 0 40px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>📖 教学任务模板</h2>
          <div className="team-templates" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {TEMPLATES.map(t => (
              <div key={t} style={{ background: '#fff', borderRadius: 20, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{t}</div>
                <button onClick={() => handleSend(t)}
                  style={{ borderRadius: 12, background: '#f59e0b', color: '#fff', border: 'none', padding: '8px 18px', fontSize: 13, cursor: 'pointer' }}>
                  立即生成
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Real-time Collaboration */}
        <section style={{ padding: '0 0 40px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>⚡ 多智能体实时协作</h2>
          {AGENTS.map(a => {
            const pct = getAgentProgress(a.title)
            const status = agentStatus[a.title === '总控教师' ? 'master' :
              a.title === '备课组长' ? 'lesson' : a.title === '命题专家' ? 'exam' :
              a.title === '批改组长' ? 'grading' : 'tutor']
            return (
              <div key={a.title} style={{ background: '#fff', borderRadius: 20, padding: '14px 20px', marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ fontWeight: 500 }}>{a.icon} {a.title}</span>
                  <span style={{ color: status === 'done' ? '#22c55e' : status === 'working' ? '#f59e0b' : '#ccc', fontSize: 13 }}>
                    {status === 'done' ? '✅ 已完成' : status === 'working' ? `${pct}%` : '⏳ 等待中'}
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 8, background: '#f3f3f3', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 8, background: status === 'done' ? '#22c55e' : '#f59e0b', width: `${pct}%`, transition: 'width 0.3s ease' }} />
                </div>
              </div>
            )
          })}
        </section>

        {/* AI Output */}
        {aiResult && (
          <section ref={resultRef} style={{ padding: '0 0 40px' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>📂 团队成果</h2>
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 13.5, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#444' }}>
                {(() => {
                  const cleaned = aiResult.replace(/[#*]/g, '').trim()
                  const display = showFull ? cleaned : cleaned.slice(0, 600)
                  return display + (cleaned.length > 600 && !showFull ? '...' : '')
                })()}
              </div>
              {aiResult.replace(/[#*]/g, '').trim().length > 600 && (
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <span onClick={() => setShowFull(!showFull)}
                    style={{ color: '#f59e0b', cursor: 'pointer', fontSize: 13 }}>
                    {showFull ? '▲ 收起' : '📄 展开全部'}
                  </span>
                </div>
              )}
              {(() => {
                const sections = parseAgentSections(aiResult)
                if (sections.length === 0) return null
                return (
                  <>
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #eee' }}>
                      <p style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>📥 下载各教师产出：</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {sections.map((sec, i) => (
                          <button key={i} onClick={() => downloadFile(sec.emoji + ' ' + sec.name + '\n' + sec.content.trim(), sec.name.replace(/[【】\[\]]/g,'') + '.md')}
                            style={{
                              fontSize: 12, padding: '6px 14px', borderRadius: 8, background: '#FFFBEB',
                              border: '1px solid #fde68a', color: '#92400e', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s'
                            }}>
                            📥 {sec.emoji} {sec.name.replace(/[【】]/g,'')}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <p style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>📦 打包下载：</p>
                      <button onClick={() => {
                        let fullContent = ''
                        sections.forEach(sec => { fullContent += sec.emoji + ' ' + sec.name + '\n' + sec.content.trim() + '\n\n' })
                        downloadFile(fullContent, '团队完整成果.md')
                      }}
                        style={{
                          fontSize: 12, padding: '6px 14px', borderRadius: 8, background: '#f59e0b',
                          border: 'none', color: '#fff', cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: 4
                        }}>
                        ⬇️ 全部下载
                      </button>
                    </div>
                  </>
                )
              })()}
            </div>
          </section>
        )}

        {/* 成果中心 */}
        {aiResult && (
          <section style={{ padding: '0 0 40px' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>📂 教学成果中心</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
              {RESULT_TYPES.map(r => {
                const sec = parseAgentSections(aiResult).find(s => s.name.includes(r.section))
                return (
                  <div key={r.label} style={{ background: '#fff', borderRadius: 20, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{r.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>{r.label}</div>
                    <button onClick={() => {
                      const header = `# ${r.icon} ${r.label}\n\n---\n\n`
                      if (sec) {
                        const cleanContent = sec.content
                          .replace(/教案设计[：:]\s*/i, '')
                          .replace(/课堂活动[：:]\s*/i, '## 课堂活动\n\n')
                          .replace(/练习题[：:]\s*/i, '## 练习题\n\n')
                          .replace(/测评建议[：:]\s*/i, '## 测评建议\n\n')
                          .replace(/评价标准[：:]\s*/i, '## 评价标准\n\n')
                          .replace(/反馈模板[：:]\s*/i, '## 反馈模板\n\n')
                          .replace(/辅导建议[：:]\s*/i, '## 辅导建议\n\n')
                          .replace(/分层指导[：:]\s*/i, '## 分层指导\n\n')
                        downloadFile(header + cleanContent.trim(), r.file)
                      } else {
                        downloadFile(header + '(暂无对应内容，请先发起教学任务)', r.file)
                      }
                    }}
                      style={{ borderRadius: 12, border: '1px solid #ddd', background: '#fff', padding: '8px 18px', fontSize: 13, cursor: 'pointer', color: '#555' }}>
                      {sec ? '⬇️ 下载' : '⏳ 暂无'}
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Task Input */}
        <section style={{ padding: '0 0 60px' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>💬 向AI教研团队下达任务</h3>
            <textarea ref={textareaRef}
              style={{
                width: '100%', height: 200, border: '1px solid #ddd', borderRadius: 16, padding: 14,
                fontSize: 14, resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
              }}
              placeholder={`依据2026年最新英语课程标准，为人教版九年级设计一套符合中考改革方向的英语阅读理解试卷

请输入教研任务（年级+教材+内容+任务类型+目标要求），AI教研团队将依据最新课程标准和考试政策协同完成。`} />
            <button onClick={() => handleSend(textareaRef.current?.value || '')} disabled={loading}
              style={{
                marginTop: 14, borderRadius: 16, background: '#f59e0b', color: '#fff',
                border: 'none', padding: '11px 28px', fontSize: 14, cursor: 'pointer',
                opacity: loading ? 0.6 : 1
              }}>
              {loading ? '⏳ 团队协作中...' : '🚀 启动团队协作'}
            </button>
          </div>
        </section>
      </div>

      {/* API Key Modal */}
      {apiModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: 32, width: 460, maxWidth: '90vw' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>⚙️ 模型设置</h3>
            <input placeholder="API Key" defaultValue={getApiKey() || ''}
              onChange={e => setApiInput(e.target.value)}
              style={{ width: '100%', border: '1px solid #ddd', borderRadius: 12, padding: '10px 14px', fontSize: 13, marginBottom: 12, boxSizing: 'border-box' }} />
            <select style={{ width: '100%', border: '1px solid #ddd', borderRadius: 12, padding: '10px 14px', fontSize: 13, marginBottom: 18, background: '#fff' }}>
              <option>DeepSeek</option>
              <option disabled>OpenAI (即将支持)</option>
            </select>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => {
                if (apiInput) localStorage.setItem('deepseek_api_key', apiInput)
                setApiModal(false)
              }}
                style={{ borderRadius: 12, background: '#f59e0b', color: '#fff', border: 'none', padding: '10px 24px', fontSize: 13, cursor: 'pointer' }}>
                保存
              </button>
              <button onClick={() => setApiModal(false)}
                style={{ borderRadius: 12, border: '1px solid #ddd', background: '#fff', padding: '10px 24px', fontSize: 13, cursor: 'pointer', color: '#555' }}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        button:hover { filter: brightness(0.95); }
        textarea:focus { border-color: #f59e0b !important; }
        * { transition: background 0.2s, border-color 0.2s; }
      `}</style>
    </div>
  )
}
