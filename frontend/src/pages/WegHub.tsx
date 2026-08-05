import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Sparkles, Zap, BookOpen, Mic, Target, Bug, MessageSquare, Edit3, ChevronRight, Award, TrendingUp, ShoppingBag } from 'lucide-react'
import { useUser } from '../contexts/UserContext'
import { usersAPI } from '../utils/supabase'

const STREAK_KEY = 'weg_streak'
const CHECKIN_KEY = 'weg_checkin_date'

function getStreak() {
  const v = localStorage.getItem(STREAK_KEY)
  return v ? parseInt(v) : 0
}

function today() {
  return new Date().toLocaleDateString('zh-CN')
}

const earnRules = [
  { icon: Zap, label: '每日签到', earn: '+20（连续递增）', desc: '每天签到一次，连续签到奖励递增', action: '签到', color: '#f59e0b' },
  { icon: BookOpen, label: '背单词', earn: '+10/关', desc: '完成单词闯关每关+10积分', link: '/learn/word-cards', color: '#3b82f6' },
  { icon: Target, label: '每日英语训练', earn: '+30', desc: '完成每日英语训练任务', link: '/learn/english-daily', color: '#10b981' },
  { icon: Mic, label: '听说训练', earn: '+30', desc: '完成听说训练任务', link: '/learn/listening-speaking', color: '#8b5cf6' },
  { icon: TrendingUp, label: '完成不规则动词', earn: '+10/关', desc: '不规则动词闯关每关+10', link: '/learn/irregular-verbs', color: '#f43f5e' },
  { icon: Bug, label: '反馈Bug', earn: '+50～500', desc: '提交有效Bug反馈奖励', link: '/feedback', color: '#ef4444' },
]

const shopLink = { icon: ShoppingBag, label: '积分商城', cost: '', desc: '称号 · 特权 · 装饰', link: '/weg/shop', color: '#f59e0b' }

const spendRules = [
  { icon: MessageSquare, label: 'AI对话', cost: '10 积分/次', desc: '与AI老师对话、宠物聊天', color: '#6366f1' },
  { icon: Edit3, label: '作文批改', cost: '30 积分/次', desc: 'AI批改英语作文', color: '#ec4899' },
]

export default function WegHub() {
  const navigate = useNavigate()
  const { user, balance: ctxBalance, updateBalance } = useUser()
  const isRealUser = !!user && user.id > 0
  const [streak, setStreak] = useState(getStreak)
  const [checkedIn, setCheckedIn] = useState(false)
  const [showAnim, setShowAnim] = useState(false)
  const [animBonus, setAnimBonus] = useState(0)
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState('')

  const balance = isRealUser ? ctxBalance : (parseInt(localStorage.getItem('weg_balance') || '200'))

  const saveEdit = () => {
    const v = parseInt(editVal)
    if (isNaN(v) || v < 0) return
    if (isRealUser) {
      usersAPI.updateBalance(user.id, v)
      updateBalance(v)
    } else {
      localStorage.setItem('weg_balance', String(v))
    }
    setEditing(false)
  }

  useEffect(() => {
    const last = localStorage.getItem(CHECKIN_KEY)
    if (last === today()) setCheckedIn(true)
  }, [])

  const handleCheckin = () => {
    if (checkedIn) return
    const bonus = 20 + streak * 5
    const newBalance = balance + bonus
    if (isRealUser) {
      usersAPI.updateBalance(user.id, newBalance)
      updateBalance(newBalance)
    } else {
      localStorage.setItem('weg_balance', String(newBalance))
    }
    localStorage.setItem(CHECKIN_KEY, today())
    localStorage.setItem(STREAK_KEY, String(streak + 1))
    setStreak(streak + 1)
    setCheckedIn(true)
    setAnimBonus(bonus)
    setShowAnim(true)
    setTimeout(() => setShowAnim(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdf6e3 0%, #f0e6d3 50%, #e0f0e8 100%)' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', background: 'rgba(209,250,229,0.6)', borderRadius: 20, fontSize: 11, color: '#059669', marginBottom: 8 }}>
            <Sparkles size={14} /> 积分经济
          </div>
          {editing && isRealUser ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <input value={editVal} onChange={e => setEditVal(e.target.value)} type="number"
                style={{ width: 140, textAlign: 'center', fontSize: 24, fontWeight: 800, color: '#059669', border: '2px solid #059669', borderRadius: 8, padding: '4px 8px', outline: 'none' }}
                onKeyDown={e => { if (e.key === 'Enter') saveEdit() }} autoFocus />
              <button onClick={saveEdit}
                style={{ background: '#059669', border: 'none', color: 'white', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>确定</button>
            </div>
          ) : (
            <div onDoubleClick={() => { setEditVal(String(balance)); setEditing(true) }} style={{ cursor: 'pointer' }} title="双击修改">
              <div style={{ fontSize: 36, fontWeight: 800, color: '#059669', marginBottom: 2 }}>{balance}</div>
              <div style={{ fontSize: 12, color: '#8a7a6a' }}>可用积分</div>
            </div>
          )}
        </div>

        {/* Check-in */}
        <div style={{ background: 'rgba(255,248,240,0.75)', borderRadius: 14, padding: 20, marginBottom: 14, backdropFilter: 'blur(8px)', border: '1px solid rgba(180,150,120,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: checkedIn ? 12 : 0 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={18} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: '#5d4a36' }}>每日签到</span>
              </div>
              <div style={{ fontSize: 12, color: '#8a7a6a', marginTop: 2 }}>连续 {streak} 天 · 明日 +{20 + streak * 5}</div>
            </div>
            <button onClick={handleCheckin} disabled={checkedIn}
              style={{
                padding: '8px 24px', borderRadius: 10, border: 'none', cursor: checkedIn ? 'default' : 'pointer',
                fontSize: 13, fontWeight: 700,
                background: checkedIn ? '#d1d5db' : 'linear-gradient(135deg, #f59e0b, #f7971e)',
                color: checkedIn ? '#9ca3af' : 'white',
              }}>
              {checkedIn ? '已签到 ✓' : '签到'}
            </button>
          </div>
          {checkedIn && (
            <div style={{ height: 4, background: 'rgba(180,150,120,0.2)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, (streak % 7) / 7 * 100)}%`, background: 'linear-gradient(135deg, #f59e0b, #f7971e)', borderRadius: 2 }} />
            </div>
          )}
        </div>

        {/* Earn section */}
        <div style={{ background: 'rgba(255,248,240,0.75)', borderRadius: 14, padding: 20, marginBottom: 14, backdropFilter: 'blur(8px)', border: '1px solid rgba(180,150,120,0.2)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#5d4a36', marginBottom: 12 }}>赚积分</div>
          {earnRules.map((r, i) => (
            <button key={i} onClick={() => r.link && navigate(r.link)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 0',
                border: 'none', borderBottom: i < earnRules.length - 1 ? '1px solid rgba(180,150,120,0.15)' : 'none',
                background: 'none', cursor: r.link ? 'pointer' : 'default', textAlign: 'left',
              }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${r.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <r.icon size={16} style={{ color: r.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#5d4a36' }}>{r.label}</div>
                <div style={{ fontSize: 11, color: '#8a7a6a' }}>{r.desc}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', whiteSpace: 'nowrap' }}>{r.earn}</div>
              {r.link && <ChevronRight size={14} style={{ color: '#cbd5e1' }} />}
            </button>
          ))}
        </div>

        {/* Spend section */}
        <div style={{ background: 'rgba(255,248,240,0.75)', borderRadius: 14, padding: 20, marginBottom: 14, backdropFilter: 'blur(8px)', border: '1px solid rgba(180,150,120,0.2)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#5d4a36', marginBottom: 12 }}>花积分</div>
          <Link to={shopLink.link} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(180,150,120,0.15)', cursor: 'pointer' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${shopLink.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShoppingBag size={16} style={{ color: shopLink.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#5d4a36' }}>{shopLink.label}</div>
                <div style={{ fontSize: 11, color: '#8a7a6a' }}>{shopLink.desc}</div>
              </div>
              <ChevronRight size={16} style={{ color: '#c4b5a5' }} />
            </div>
          </Link>
          {spendRules.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < spendRules.length - 1 ? '1px solid rgba(180,150,120,0.15)' : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${r.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <r.icon size={16} style={{ color: r.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#5d4a36' }}>{r.label}</div>
                <div style={{ fontSize: 11, color: '#8a7a6a' }}>{r.desc}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', whiteSpace: 'nowrap' }}>{r.cost}</div>
            </div>
          ))}
        </div>

        {/* Level */}
        <div style={{ background: 'rgba(255,248,240,0.75)', borderRadius: 14, padding: 20, marginBottom: 14, backdropFilter: 'blur(8px)', border: '1px solid rgba(180,150,120,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Award size={18} style={{ color: '#8b5cf6' }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#5d4a36' }}>等级</span>
          </div>
          <div style={{ fontSize: 12, color: '#8a7a6a', lineHeight: 1.6 }}>
            积分累积可提升等级，解锁更多AI对话次数和高级功能。
          </div>
          <div style={{ fontSize: 11, color: '#6b5d4f', marginTop: 8 }}>
            注册即送 200 积分 · AI对话 10积分/次 · 作文批改 30积分/次
          </div>
        </div>

        {/* Bottom note */}
        <div style={{ textAlign: 'center', fontSize: 11, color: '#8a7a6a', marginTop: 20, lineHeight: 1.6, paddingBottom: 20 }}>
          积分仅限平台内部使用，不可兑换法定货币
        </div>
      </div>

      {/* Animation */}
      {showAnim && (
        <div style={{
          position: 'fixed', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(255,248,240,0.95)', padding: '24px 40px', borderRadius: 16,
          backdropFilter: 'blur(12px)', zIndex: 100, textAlign: 'center', border: '1px solid rgba(180,150,120,0.2)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>
            +{animBonus} 积分
          </div>
          <div style={{ fontSize: 12, color: '#8a7a6a', marginTop: 4 }}>
            连续签到 {streak} 天
          </div>
        </div>
      )}
    </div>
  )
}