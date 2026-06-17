import { useState, useMemo } from 'react'
import type { ReactNode, CSSProperties } from 'react'

interface DiaryEntry {
  day: number
  date: string
  title: string
  summary: string[]
  memorable: string
  influenced: { name: string; deed: string }
  selfBefore: string
  selfAfter: string
  teacherWords: string
  stats: Record<string, number>
  reflectionChoices: string[]
  chosenReflection: string | null
  letterToFuture: string
}

function formatDate(day: number) {
  let m = 9, y = 2026, d = 1
  for (let i = 1; i < day; i++) { d++; if (d > 30) { d = 1; m++ }; if (m > 12) { m = 1; y++ } }
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const dt = new Date(y, m - 1, d)
  return `${y}年${m}月${dt.getDate()}日 星期${weekdays[dt.getDay()]}`
}

const TITLES = [
  '普通的一天，不普通的收获', '微小的进步', '今天又勇敢了一点点',
  '教室里的光', '一个安静的午后', '原来我也可以',
  '今天认识了新的自己', '那些被忽略的小事', '学着长大',
  '每一天都是练习', '试着主动一次', '今天的心情是橙色',
  '从犹豫到开口', '帮别人，也帮了自己', '慢慢来，比较快',
  '今天的风很温柔', '坚持的意义', '又解锁了一个新体验',
]

const SUMMARIES = [
  ['晨读时，你记住了昨天总是出错的短语。', '英语课上，你主动举手回答了问题。', '课间，你帮同桌整理了一摞作业本。', '午休时，你认真整理了今天的错题。'],
  ['数学课上，你解出了一道昨天还不会的题。', '语文课的小组讨论中，你第一次主动发言。', '放学后，你和同学一起完成了值日。', '你发现自己的笔记越写越整齐了。'],
  ['今天英语听写对了8个，比昨天多2个。', '你主动向老师请教了一个问题。', '课间你借了一本书给同学。', '午休时你写了一段关于梦想的话。'],
  ['你注意到王浩上课走神，轻轻提醒了他。', '老师提问时你犹豫了一下，但还是举了手。', '你认真订正了昨天的错题。', '放学时你对值日生说了声谢谢。'],
  ['今天的课堂练习你完成得比平时快。', '你发现同桌没带文具，主动借给了他。', '你在课本上画了一个笑脸。', '你决定从今天开始每天背5个单词。'],
  ['你主动承担了小组汇报的任务。', '你帮助了一位不会做题的同学。', '你在课间读了一篇课外文章。', '你给未来的自己写了一句话。'],
]

const MEMORABLE = [
  '当你站起来回答英语问题时，其实心里有一点紧张。\n但你开口了。\n勇敢，往往比正确更重要。',
  '那道数学题你在草稿纸上算了三遍。\n第三次，终于算对了。\n原来坚持真的有用。',
  '同桌对你说了声谢谢。\n只是因为帮忙捡了一支笔。\n但那种被需要的感觉，很温暖。',
  '老师在班里读了你的作文片段。\n虽然只有一小段。\n可你开心了一整天。',
  '你注意到后桌一直在看你的笔记。\n你把笔记推过去一点。\n他没说话，但朝你笑了笑。',
  '你在走廊上听到有人叫你的名字。\n是新同学在跟你打招呼。\n你第一次觉得，被记住是件开心的事。',
]

const INFLUENCED = [
  { name: '王浩', deed: '你帮王浩找回了丢失的试卷。\n也许很多年后，他不会记得今天发生了什么。\n但他会记得：曾经有人认真帮过自己。' },
  { name: '李明', deed: '李明有道题不会。\n你花了一个课间给他讲明白。\n他说："下次换我帮你。"' },
  { name: '陈静', deed: '陈静今天不太开心。\n你递了一张纸条过去。\n她看完对你笑了笑。' },
  { name: '刘婷', deed: '刘婷忘记带水彩笔。\n你把你的借给了她。\n她说放学请你吃冰淇淋。' },
  { name: '张伟', deed: '张伟在课上被点名答不出来。\n你小声提醒了他。\n他坐下后朝你感激地点头。' },
]

const SELF_COMPARISONS = [
  { before: '遇到问题会犹豫', after: '愿意尝试回答' },
  { before: '不敢在课上发言', after: '举了一次手' },
  { before: '觉得英语很难', after: '记住了一个新单词' },
  { before: '遇到困难想放弃', after: '又试了一次' },
  { before: '不太敢问老师问题', after: '主动问了老师' },
  { before: '觉得自己不够好', after: '发现自己原来可以' },
]

const TEACHER_WORDS = [
  '学习不是和别人比赛。\n而是在未来回头看时，\n感谢那个没有放弃的自己。',
  '进步不需要很大。\n只要今天的你比昨天多懂一点点，\n就已经很了不起了。',
  '人生不是短跑，是一场马拉松。\n跑得慢没关系，\n重要的是你在向前走。',
  '每个人都有自己的节奏。\n不用和别人比，\n只要今天的你比昨天更好。',
  '最珍贵的不是满分，\n而是你努力的过程。\n那些认真对待的时光，不会骗你。',
  '成长不是一夜之间的事。\n它是每一次犹豫后仍然选择尝试，\n每一次失败后仍然站起来。',
]

const REFLECTION_OPTIONS = [
  '回答了英语问题', '记住了新的单词', '帮助了同学', '认真完成了作业',
  '举手发言了', '解出了一道难题', '交了一个新朋友', '坚持完成了任务',
]

function generateEntry(day: number): DiaryEntry {
  const r = (n: number) => (day * 7 + n * 13) % 1000
  const pick = <T,>(arr: T[], seed: number) => arr[Math.abs(r(seed)) % arr.length]
  return {
    day,
    date: formatDate(day),
    title: pick(TITLES, day),
    summary: pick(SUMMARIES, day),
    memorable: pick(MEMORABLE, day + 1),
    influenced: pick(INFLUENCED, day + 2),
    selfBefore: pick(SELF_COMPARISONS, day + 3).before,
    selfAfter: pick(SELF_COMPARISONS, day + 3).after,
    teacherWords: pick(TEACHER_WORDS, day + 4),
    stats: {
      courage: Math.min(90, 20 + day * 0.4 + Math.sin(day) * 10),
      kindness: Math.min(90, 25 + day * 0.35 + Math.cos(day * 0.7) * 8),
      focus: Math.min(90, 15 + day * 0.45 + Math.sin(day * 1.2) * 7),
      responsibility: Math.min(90, 20 + day * 0.3 + Math.cos(day * 0.5) * 9),
      confidence: Math.min(90, 10 + day * 0.5 + Math.sin(day * 0.8) * 6),
    },
    reflectionChoices: [pick(REFLECTION_OPTIONS, day + 5), pick(REFLECTION_OPTIONS, day + 6)],
    chosenReflection: null,
    letterToFuture: '',
  }
}

interface Props {
  day?: number
  entries?: DiaryEntry[]
  onSaveLetter?: (day: number, letter: string) => void
  onChooseReflection?: (day: number, choice: string) => void
  onBack: () => void
}

export default function GrowthDiary({ day: currentDay = 0, entries: externalEntries, onSaveLetter, onChooseReflection, onBack }: Props) {
  const [localEntries, setLocalEntries] = useState<DiaryEntry[]>(() =>
    externalEntries || Array.from({ length: Math.max(1, Math.min(currentDay, 150)) }, (_, i) => {
      const e = generateEntry(i + 1)
      return e
    })
  )
  const [viewingDay, setViewingDay] = useState(currentDay > 0 ? Math.min(currentDay, 150) : 1)
  const [showLetterInput, setShowLetterInput] = useState(false)
  const [letterText, setLetterText] = useState('')
  const [futurePayoff, setFuturePayoff] = useState(false)

  const entry = useMemo(() => {
    const existing = localEntries.find(e => e.day === viewingDay)
    if (existing) return existing
    const newEntry = generateEntry(viewingDay)
    setLocalEntries(prev => [...prev.filter(e => e.day !== viewingDay), newEntry])
    return newEntry
  }, [viewingDay, localEntries])

  const isGraduation = currentDay >= 150 || viewingDay >= 150

  const handleReflection = (choice: string) => {
    setLocalEntries(prev => prev.map(e =>
      e.day === viewingDay ? { ...e, chosenReflection: choice } : e
    ))
    onChooseReflection?.(viewingDay, choice)
  }

  const handleSaveLetter = () => {
    if (!letterText.trim()) return
    setLocalEntries(prev => prev.map(e =>
      e.day === viewingDay ? { ...e, letterToFuture: letterText.trim() } : e
    ))
    onSaveLetter?.(viewingDay, letterText.trim())
    setShowLetterInput(false)
    setLetterText('')
  }

  const storedLetter = entry.letterToFuture
  // Check if this wish came true (only meaningful at graduation)
  const wishCameTrue = isGraduation && storedLetter && storedLetter.includes('英语')

  return (
    <div style={{
      width: '100vw', minHeight: '100vh', overflow: 'auto',
      background: 'linear-gradient(180deg, #0a0a1a 0%, #141428 50%, #1a1a2e 100%)',
      fontFamily: '"Noto Serif SC", serif', color: '#e0d8c8',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <button onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 13, padding: 0 }}>
          ← {currentDay > 0 ? '返回教室' : '返回'}
        </button>
        <span style={{ flex: 1, fontSize: 14, color: '#f0e8d8', textAlign: 'center', letterSpacing: 1 }}>
          🌱 成长日记
        </span>
        {viewingDay > 1 && (
          <span style={{ fontSize: 11, color: '#444' }}>第 {viewingDay} 篇</span>
        )}
      </div>

      {futurePayoff ? (
        <div style={{ padding: '40px 24px', maxWidth: 420, margin: '0 auto' }}>
          <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>🎓</div>
          <h2 style={{ fontSize: 20, color: '#f0e8d8', textAlign: 'center', fontWeight: 400, marginBottom: 24 }}>
            三年的成长
          </h2>

          {/* Show first diary entry vs current */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '16px 20px',
              borderLeft: '3px solid #ffab40',
            }}>
              <p style={{ fontSize: 10, color: '#ffab40', marginBottom: 6, letterSpacing: 1 }}>
                2026年9月1日 · 第一篇日记
              </p>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 2 }}>
                "我有点紧张，不知道初中生活会是什么样。"<br />
                那时你的勇气值：{Math.round(generateEntry(1).stats.courage)}%
              </p>
            </div>

            {storedLetter && (
              <div style={{
                background: 'rgba(79,195,247,0.05)', borderRadius: 12, padding: '16px 20px',
                borderLeft: '3px solid #4fc3f7',
              }}>
                <p style={{ fontSize: 10, color: '#4fc3f7', marginBottom: 6, letterSpacing: 1 }}>
                  你写给未来的话
                </p>
                <p style={{ fontSize: 14, color: '#c8b898', lineHeight: 2, fontStyle: 'italic' }}>
                  "{storedLetter}"
                </p>
                {wishCameTrue && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(76,175,80,0.1)', borderRadius: 8 }}>
                    <p style={{ fontSize: 12, color: '#4caf50', lineHeight: 1.8 }}>
                      ✅ 三年前的愿望，你做到了。
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Final stats */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '16px 20px',
              marginTop: 8,
            }}>
              <p style={{ fontSize: 11, color: '#888', marginBottom: 10, letterSpacing: 1 }}>
                今日成长树 · 毕业版
              </p>
              {Object.entries(entry.stats).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#666', width: 52, flexShrink: 0 }}>
                    {{ courage: '勇气', kindness: '善意', focus: '专注', responsibility: '责任', confidence: '自信' }[key] || key}
                  </span>
                  <div style={{ flex: 1, height: 5, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.round(val)}%`, height: '100%',
                      background: val > 70 ? '#4fc3f7' : val > 50 ? '#ffab40' : '#888',
                      borderRadius: 3,
                    }} />
                  </div>
                  <span style={{ fontSize: 10, color: '#555', width: 28, textAlign: 'right' }}>{Math.round(val)}%</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 13, color: '#555', textAlign: 'center', lineHeight: 2, marginTop: 12 }}>
              原来那些普通的日子，<br />后来都变成了青春。
            </p>
          </div>

          <button onClick={() => setFuturePayoff(false)}
            style={{
              display: 'block', margin: '24px auto 0', background: '#222', border: '1px solid #333',
              color: '#888', padding: '10px 32px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
              fontFamily: '"Noto Serif SC", serif',
            }}>
            返回日记
          </button>
        </div>
      ) : (
        <div style={{ padding: '20px 16px 40px', maxWidth: 420, margin: '0 auto' }}>
          {/* Date + title */}
          <p style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>{entry.date}</p>
          <h2 style={{ fontSize: 18, color: '#f0e8d8', fontWeight: 400, marginBottom: 24 }}>
            {entry.title}
          </h2>

          {/* Day summary */}
          <Section title="🌤️ 今日校园">
            {entry.summary.map((line, i) => (
              <p key={i} style={{ ...pStyle }}>{line}</p>
            ))}
          </Section>

          {/* Memorable moment */}
          <Section title="📖 今天最值得记住的时刻">
            <p style={{ ...pStyle, whiteSpace: 'pre-wrap' }}>{entry.memorable}</p>
          </Section>

          {/* Influenced */}
          <Section title={`🤝 今天影响了谁 · ${entry.influenced.name}`}>
            <p style={{ ...pStyle, whiteSpace: 'pre-wrap' }}>{entry.influenced.deed}</p>
          </Section>

          {/* Self comparison */}
          <Section title="今天的自己">
            <p style={pStyle}>
              昨天的你：{entry.selfBefore}。<br />
              今天的你：{entry.selfAfter}。<br />
              虽然只进步了一点点。<br />
              但方向是向前的。
            </p>
          </Section>

          {/* Teacher words */}
          <Section title="💬 班主任的话">
            <p style={{ ...pStyle, whiteSpace: 'pre-wrap', fontStyle: 'italic', color: '#ffab40' }}>
              "{entry.teacherWords}"
            </p>
          </Section>

          {/* Growth tree */}
          <Section title="🌳 今日成长树">
            {Object.entries(entry.stats).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: '#666', width: 52, flexShrink: 0 }}>
                  {{ courage: '勇气', kindness: '善意', focus: '专注', responsibility: '责任', confidence: '自信' }[key] || key}
                </span>
                <div style={{ flex: 1, height: 5, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.round(val)}%`, height: '100%',
                    background: val > 70 ? '#4fc3f7' : val > 50 ? '#ffab40' : '#888',
                    borderRadius: 3,
                  }} />
                </div>
                <span style={{ fontSize: 9, color: '#555', width: 26, textAlign: 'right' }}>{Math.round(val)}%</span>
              </div>
            ))}
          </Section>

          {/* Bedtime reflection */}
          <Section title="🌙 睡前回顾 · 今天最开心的事">
            {entry.chosenReflection ? (
              <div style={{
                padding: '12px 16px', background: 'rgba(79,195,247,0.08)', borderRadius: 8,
                border: '1px solid rgba(79,195,247,0.15)',
              }}>
                <p style={{ fontSize: 13, color: '#4fc3f7', marginBottom: 6 }}>✅ {entry.chosenReflection}</p>
                <p style={{ fontSize: 12, color: '#888', lineHeight: 2 }}>
                  你选择了：{entry.chosenReflection}。<br />
                  或许很多人觉得这只是一件小事。<br />
                  但对于今天的你来说，<br />
                  那是一次主动迈出的脚步。<br />
                  世界上很多改变，都从一次开始。
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {entry.reflectionChoices.map((c, i) => (
                  <button key={i} onClick={() => handleReflection(c)}
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      color: '#c8b898', padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
                      fontSize: 13, fontFamily: '"Noto Serif SC", serif', textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#4fc3f7'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
                    ○ {c}
                  </button>
                ))}
              </div>
            )}
          </Section>

          {/* Letter to future self */}
          <Section title="✍️ 写给未来的自己">
            {storedLetter ? (
              <div style={{
                padding: '14px 18px', background: 'rgba(255,171,64,0.06)', borderRadius: 8,
                border: '1px solid rgba(255,171,64,0.12)',
              }}>
                <p style={{ fontSize: 12, color: '#ffab40', marginBottom: 6, letterSpacing: 1 }}>你写道：</p>
                <p style={{ fontSize: 14, color: '#c8b898', lineHeight: 2, fontStyle: 'italic' }}>
                  "{storedLetter}"
                </p>
              </div>
            ) : showLetterInput ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <textarea value={letterText} onChange={e => setLetterText(e.target.value)}
                  placeholder="如果未来的你看到今天这页日记，你最想说什么？"
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, padding: '12px 14px', color: '#e0d8c8', fontSize: 13,
                    fontFamily: '"Noto Serif SC", serif', lineHeight: 1.8, minHeight: 80,
                    resize: 'none', outline: 'none',
                  }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleSaveLetter}
                    style={{
                      flex: 1, background: '#4fc3f7', border: 'none', color: '#0a0a1a',
                      padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                      fontWeight: 600, fontFamily: '"Noto Serif SC", serif',
                    }}>
                    保存
                  </button>
                  <button onClick={() => setShowLetterInput(false)}
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#888', padding: '8px 20px', borderRadius: 6, cursor: 'pointer',
                      fontSize: 12, fontFamily: '"Noto Serif SC", serif',
                    }}>
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowLetterInput(true)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: '1px dashed rgba(255,255,255,0.15)', color: '#666',
                  padding: '14px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                  fontFamily: '"Noto Serif SC", serif', textAlign: 'center',
                }}>
                ✏️ 写一句话给三年后的自己
              </button>
            )}
          </Section>

          {/* Bottom navigation */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 12, marginTop: 32, paddingBottom: 20,
          }}>
            {viewingDay > 1 && (
              <button onClick={() => setViewingDay(d => d - 1)}
                style={{ ...navBtnStyle }}>
                ← 上一篇
              </button>
            )}
            {viewingDay < 150 && (
              <button onClick={() => setViewingDay(d => d + 1)}
                style={{ ...navBtnStyle }}>
                下一篇 →
              </button>
            )}
          </div>

          {/* Graduation payoff button */}
          {isGraduation && storedLetter && (
            <div style={{ textAlign: 'center', marginTop: 16, marginBottom: 20 }}>
              <button onClick={() => setFuturePayoff(true)}
                style={{
                  background: 'linear-gradient(135deg, #ffab40, #f57c00)', border: 'none',
                  color: 'white', padding: '12px 32px', borderRadius: 8, cursor: 'pointer',
                  fontSize: 14, fontWeight: 600, fontFamily: '"Noto Serif SC", serif',
                }}>
                🎓 查看三年的成长
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 8, letterSpacing: 1 }}>{title}</p>
      {children}
    </div>
  )
}

const pStyle: CSSProperties = {
  fontSize: 14, lineHeight: 2.2, color: '#c8b898', margin: 0,
}

const navBtnStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  color: '#888', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
  fontFamily: '"Noto Serif SC", serif',
}
