import { useState, useEffect } from 'react'
import SurvivalGame from '../components/digital-teacher/SurvivalGame'
import TitleEvaluationGame from '../components/digital-teacher/TitleEvaluationGame'
import LessonGame from '../components/digital-teacher/LessonGame'
import StudentLessonGame from '../components/digital-teacher/StudentLessonGame'
import DigitalClassGame from '../components/digital-teacher/DigitalClassGame'
import GrowthDiary from '../components/digital-teacher/GrowthDiary'

export default function RobotPage() {
  const [tab, setTab] = useState<'lesson' | 'class' | 'career'>('lesson')
  const [inGame, setInGame] = useState(false)
  const [teachType, setTeachType] = useState<'teacher' | 'student'>('teacher')
  const [mgType, setMgType] = useState<'survival' | 'title'>('survival')
  const [showDiary, setShowDiary] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 600)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (showDiary) return <GrowthDiary onBack={() => setShowDiary(false)} />

  if (inGame) {
    if (tab === 'lesson') {
      return teachType === 'teacher'
        ? <LessonGame onBack={() => setInGame(false)} />
        : <StudentLessonGame onBack={() => setInGame(false)} />
    }
    if (tab === 'class') return <DigitalClassGame onBack={() => setInGame(false)} />
    return mgType === 'survival'
      ? <SurvivalGame onBack={() => setInGame(false)} />
      : <TitleEvaluationGame onBack={() => setInGame(false)} />
  }

  const gradient = tab === 'lesson'
    ? 'linear-gradient(135deg, #fef8f0 0%, #fce4d6 100%)'
    : tab === 'class'
    ? 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%)'
    : 'linear-gradient(135deg, #0f1923 0%, #1a2a3a 100%)'
  const textColor = tab === 'lesson' ? '#8b6914' : '#e0d8c8'

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '20px 12px',
      boxSizing: 'border-box', background: gradient,
      fontFamily: '"Noto Serif SC", serif', color: textColor,
    }}>
      {/* Tab switcher */}
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
        display: 'flex', gap: 4, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
        padding: '5px 8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
      }}>
        {[
          { id: 'lesson', label: '我的一天', icon: '📖' },
          { id: 'class', label: '班级风云录', icon: '👥' },
          { id: 'career', label: '新人入职记', icon: '🚀' },
        ].map(opt => (
          <button key={opt.id} onClick={() => setTab(opt.id as any)}
            style={{
              background: tab === opt.id ? (
                opt.id === 'lesson' ? '#8b6914' : opt.id === 'class' ? '#4fc3f7' : '#ffab40'
              ) : 'transparent',
              border: '1px solid transparent',
              color: tab === opt.id
                ? (opt.id === 'lesson' ? 'white' : '#0a0a1a')
                : (tab === 'lesson' ? '#8b6914' : '#666'),
              padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
              fontWeight: tab === opt.id ? 600 : 400, fontFamily: '"Noto Serif SC", serif',
              transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
          >{opt.icon} {opt.label}</button>
        ))}
      </div>

      {/* ===== 我的一天 ===== */}
      {tab === 'lesson' && (
        <>
          <div style={{ fontSize: 64, marginBottom: 8 }}>👩‍🏫</div>
          <h1 style={{
            fontSize: isMobile ? 28 : 32, color: '#8b6914', fontWeight: 400,
            marginBottom: 8, letterSpacing: 2,
          }}>这节课</h1>
          <p style={{
            color: '#666', fontSize: isMobile ? 14 : 16, marginBottom: 24,
            textAlign: 'center', maxWidth: 400, lineHeight: 2,
          }}>
            一节课，两种视角。<br />
            你曾经是讲台下的那个人，<br />
            后来也成了讲台上的那个人。
          </p>
          <div style={{
            display: 'flex', flexDirection: isMobile ? 'column' : 'row',
            gap: 14, alignItems: 'center', width: '100%', maxWidth: 500,
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.6)', border: '1px solid #e0d5c0',
              borderRadius: 8, padding: isMobile ? '14px 16px' : '16px 18px',
              width: isMobile ? '100%' : 220, textAlign: 'center',
              boxSizing: 'border-box',
            }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>👨‍🏫</div>
              <h3 style={{ color: '#8b6914', fontSize: 17, marginBottom: 10, margin: '4px 0 10px' }}>教师视角</h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.8, margin: 0 }}>
                备课、上课、处理学生<br />
                那些只有老师才知道的事
              </p>
              <button onClick={() => { setTeachType('teacher'); setInGame(true) }}
                style={{
                  marginTop: 12, background: 'linear-gradient(135deg, #8b6914, #a08030)',
                  border: 'none', color: 'white', padding: '10px 28px', borderRadius: 6,
                  cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  fontFamily: '"Noto Serif SC", serif',
                }}>
                教师视角 →
              </button>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.6)', border: '1px solid #e0d5c0',
              borderRadius: 8, padding: isMobile ? '14px 16px' : '16px 18px',
              width: isMobile ? '100%' : 220, textAlign: 'center',
              boxSizing: 'border-box',
            }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>🧑‍🎓</div>
              <h3 style={{ color: '#4fc3f7', fontSize: 17, marginBottom: 10, margin: '4px 0 10px' }}>学生视角</h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.8, margin: 0 }}>
                走神、传纸条、看窗外<br />
                回到那个坐在教室里的自己
              </p>
              <button onClick={() => { setTeachType('student'); setInGame(true) }}
                style={{
                  marginTop: 12, background: 'linear-gradient(135deg, #4fc3f7, #29b6f6)',
                  border: 'none', color: '#0a0a1a', padding: '10px 28px', borderRadius: 6,
                  cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  fontFamily: '"Noto Serif SC", serif',
                }}>
                学生视角 →
              </button>
            </div>
          </div>
        </>
      )}

      {/* ===== 数字班级 ===== */}
      {tab === 'class' && (
        <>
          <div style={{ fontSize: isMobile ? 36 : 48, marginBottom: 4 }}>🏫</div>
          <h1 style={{
            fontSize: isMobile ? 24 : 30, color: '#f0e8d8', fontWeight: 400,
            marginBottom: 6, letterSpacing: 2, textAlign: 'center',
          }}>AI 数字班级</h1>
          <p style={{
            color: '#999', fontSize: 14, marginBottom: 20, textAlign: 'center',
            maxWidth: 400, lineHeight: 1.8,
          }}>
            初一（42）班 · 50 个真实的人 · 3 年时光
          </p>
          <div style={{
            display: 'flex', flexDirection: isMobile ? 'column' : 'row',
            gap: 12, alignItems: 'center', width: '100%', maxWidth: 500,
          }}>
            <CardD isMobile={isMobile}
              emoji="🧑‍🎓" title="我的42班" color="#4fc3f7"
              desc={['入座 · 认识同学', '日常事件 · 真实生态', '三年毕业 · 自动结算']}
              btnLabel="进入班级 →" btnColor="#4fc3f7"
              onClick={() => setInGame(true)}
            />
            <CardD isMobile={isMobile}
              emoji="🌱" title="成长日记" color="#ffab40"
              desc={['每天一篇校园日记', '睡前回顾 · 写给未来', '毕业查看三年成长']}
              btnLabel="翻开日记 →" btnColor="#ffab40" btnTextDark={false}
              onClick={() => setShowDiary(true)}
            />
          </div>
        </>
      )}

      {/* ===== 职场视角 ===== */}
      {tab === 'career' && (
        <>
          <div style={{ fontSize: isMobile ? 36 : 48, marginBottom: 4 }}>💼</div>
          <h1 style={{
            fontSize: isMobile ? 24 : 30, color: '#f5e8c8', fontWeight: 400,
            marginBottom: 6, letterSpacing: 2,
          }}>职场视角</h1>
          <p style={{ color: '#aaa', fontSize: 14, marginBottom: 20, textAlign: 'center', maxWidth: 400, lineHeight: 1.8 }}>
            选择挑战模式
          </p>
          <div style={{
            display: 'flex', flexDirection: isMobile ? 'column' : 'row',
            gap: 12, alignItems: 'center', width: '100%', maxWidth: 500,
          }}>
            <CardD isMobile={isMobile}
              emoji="⏰" title="生存挑战" color="#4fc3f7"
              desc={['班主任24小时模式', '时间推进·事件选择']}
              btnLabel="开始挑战 →" btnColor="#4fc3f7"
              onClick={() => { setMgType('survival'); setInGame(true) }}
            />
            <CardD isMobile={isMobile}
              emoji="📜" title="职称评定" color="#ffab40"
              desc={['教师晋升之路', '7阶段·多属性·随机']}
              btnLabel="开始评定 →" btnColor="#ffab40" btnTextDark={false}
              onClick={() => { setMgType('title'); setInGame(true) }}
            />
          </div>
        </>
      )}
    </div>
  )
}

/* Dark card for 数字班级 & 职场视角 tabs */
function CardD({ emoji, title, color, desc, btnLabel, btnColor, btnTextDark = true, isMobile, onClick }: {
  emoji: string; title: string; color: string; desc: string[]
  btnLabel: string; btnColor: string; btnTextDark?: boolean
  isMobile: boolean; onClick: () => void
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 10, padding: isMobile ? '14px 16px' : '18px 22px',
      width: isMobile ? '100%' : 220, textAlign: 'center', boxSizing: 'border-box',
    }}>
      <div style={{ fontSize: isMobile ? 32 : 36, marginBottom: 4 }}>{emoji}</div>
      <h3 style={{ color, fontSize: isMobile ? 17 : 18, marginBottom: 10, margin: '4px 0 10px' }}>{title}</h3>
      {desc.map((d, i) => (
        <p key={i} style={{ fontSize: 13, color: '#999', lineHeight: 1.8, margin: 0 }}>{d}</p>
      ))}
      <button onClick={onClick}
        style={{
          marginTop: 12,
          background: `linear-gradient(135deg, ${btnColor}, ${btnColor})`,
          border: 'none', color: btnTextDark ? '#0a0a1a' : 'white',
          padding: '10px 28px', borderRadius: 6, cursor: 'pointer',
          fontSize: 14, fontWeight: 600, fontFamily: '"Noto Serif SC", serif',
        }}>
        {btnLabel}
      </button>
    </div>
  )
}
