import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, ArrowLeft, Crown, Star, Shield, Zap,
  BookOpen, Code, Pen, Target, Music, Heart,
  Palette, Shirt, Image, Type, Gem, ShoppingBag,
  Check, Lock,   Flame, Award, MessageSquare
} from 'lucide-react'

type Tab = 'title' | 'privilege' | 'decoration'

const tabs: { key: Tab; label: string; icon: typeof Sparkles }[] = [
  { key: 'title', label: '称号商城', icon: Crown },
  { key: 'privilege', label: '特权商城', icon: Shield },
  { key: 'decoration', label: '装饰商城', icon: Palette },
]

const titles = [
  { name: '小白', price: 0, rarity: 'common', icon: '🌱', desc: '初始称号', owned: true, equipped: true },
  { name: '学习达人', price: 500, rarity: 'uncommon', icon: '📚', desc: '累计学习50小时', owned: false, equipped: false },
  { name: '刷题狂魔', price: 1000, rarity: 'uncommon', icon: '⚡', desc: '完成100次闯关', owned: false, equipped: false },
  { name: '英语之星', price: 2000, rarity: 'rare', icon: '⭐', desc: '英语总分排名前10', owned: false, equipped: false },
  { name: '学霸', price: 5000, rarity: 'epic', icon: '👑', desc: '全科成绩A+', owned: false, equipped: false },
  { name: '卷王之王', price: 10000, rarity: 'legendary', icon: '🔥', desc: '连续签到30天', owned: false, equipped: false },
  { name: '校园传说', price: 50000, rarity: 'mythic', icon: '🌌', desc: '全校积分榜第一', owned: false, equipped: false },
]

const privileges = [
  { name: '免作业卡 ×1', price: 300, icon: <Shield size={20} />, desc: '免一次任意学科作业', popular: true, color: 'from-amber-400 to-orange-500' },
  { name: '选座位优先权', price: 500, icon: <Star size={20} />, desc: '下次排座位优先选择', popular: false, color: 'from-purple-400 to-pink-500' },
  { name: '免背诵卡 ×1', price: 200, icon: <BookOpen size={20} />, desc: '免一次背诵任务', popular: false, color: 'from-blue-400 to-cyan-500' },
  { name: '迟到免罚 ×1', price: 400, icon: <Zap size={20} />, desc: '迟到一次不扣分', popular: false, color: 'from-green-400 to-emerald-500' },
  { name: '老师表扬信', price: 800, icon: <Award size={20} />, desc: '老师当全班面表扬一次', popular: true, color: 'from-red-400 to-rose-500' },
      { name: '大屏放烟花', price: 1000, icon: <Sparkles size={20} />, desc: '课堂大屏为你放烟花', popular: true, color: 'from-indigo-400 to-purple-500', preview: true },
  { name: '自定义班级称号', price: 2000, icon: <Pen size={20} />, desc: '在班级里显示自定义头衔', popular: false, color: 'from-teal-400 to-cyan-500' },
]

const decorations = [
  { name: '名字炫彩效果', price: 800, icon: <Type size={20} />, desc: '你的名字在排行榜上彩色显示', color: 'from-pink-400 to-purple-500' },
  { name: '个人主页背景 ×1', price: 1000, icon: <Image size={20} />, desc: '更换个人主页背景图', color: 'from-blue-400 to-indigo-500' },
  { name: '专属签名档', price: 600, icon: <Pen size={20} />, desc: '在评论/动态中显示个性签名', color: 'from-rose-400 to-red-500' },
  { name: '聊天特效框', price: 1200, icon: <MessageSquare size={20} />, desc: '聊天时消息带炫光边框', color: 'from-cyan-400 to-teal-500' },
  { name: '头像挂件 ×1', price: 1500, icon: <Gem size={20} />, desc: '头像上加一个酷炫挂件', color: 'from-amber-400 to-yellow-500' },
  { name: '宠物皮肤 ×1', price: 2000, icon: <Heart size={20} />, desc: '给你的宠物换新皮肤', color: 'from-pink-400 to-rose-500' },
]

function rarityStyle(rarity: string) {
  const map: Record<string, string> = {
    common: 'border-gray-200 bg-gray-50',
    uncommon: 'border-green-200 bg-green-50',
    rare: 'border-blue-200 bg-blue-50',
    epic: 'border-purple-200 bg-purple-50',
    legendary: 'border-orange-200 bg-orange-50',
    mythic: 'border-pink-200 bg-pink-50',
  }
  return map[rarity] || map.common
}

function rarityBadge(rarity: string) {
  const map: Record<string, { label: string; style: string }> = {
    common: { label: '普通', style: 'text-gray-500 bg-gray-100' },
    uncommon: { label: '高级', style: 'text-green-600 bg-green-100' },
    rare: { label: '稀有', style: 'text-blue-600 bg-blue-100' },
    epic: { label: '史诗', style: 'text-purple-600 bg-purple-100' },
    legendary: { label: '传说', style: 'text-orange-600 bg-orange-100' },
    mythic: { label: '神话', style: 'text-pink-600 bg-pink-100' },
  }
  return map[rarity] || map.common
}

export default function ShopPage() {
  const [tab, setTab] = useState<Tab>('privilege')
  const [balance] = useState(1280)
  const [fireworks, setFireworks] = useState(false)

  const TabIcon = tabs.find(t => t.key === tab)!.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 pb-16">
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <Link to="/weg"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-indigo-600 mb-2">
          <ArrowLeft size={14} /> 返回经济总览
        </Link>
        <Link to="/"
          className="inline-flex items-center gap-1 text-xs text-gray-300 hover:text-indigo-500 ml-1">
          返回首页
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-200">
            <ShoppingBag size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">积分商城</h1>
            <p className="text-sm text-gray-400">花积分，换特权、称号和装饰</p>
          </div>
          <div className="bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-100 flex items-center gap-2">
            <Gem size={16} className="text-amber-500" />
            <span className="font-bold text-gray-800">{balance.toLocaleString()}</span>
            <span className="text-xs text-gray-400">积分</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 w-fit mb-6">
          {tabs.map(t => {
            const Icon = t.icon
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  tab === t.key ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              ><Icon size={16} /> {t.label}</button>
            )
          })}
        </div>

        {/* Title Shop */}
        {tab === 'title' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400">称号会显示在你的名字前面，同学都能看到</p>
            {titles.map((item, i) => {
              const badge = rarityBadge(item.rarity)
              return (
                <div key={i} className={`bg-white rounded-xl p-4 border-2 shadow-sm transition-all hover:shadow-md ${
                  item.equipped ? 'border-indigo-400 ring-2 ring-indigo-100' : item.owned ? 'border-green-200' : rarityStyle(item.rarity)
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-800">{item.name}</h3>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${badge.style}`}>{badge.label}</span>
                        </div>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.equipped ? (
                        <span className="flex items-center gap-1 text-xs px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg font-medium">
                          <Check size={12} /> 使用中
                        </span>
                      ) : item.owned ? (
                        <button className="text-xs px-3 py-1.5 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50">
                          装备
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-amber-600">{item.price.toLocaleString()}</span>
                          <button className={`text-xs px-3 py-1.5 rounded-lg font-medium text-white ${
                            balance >= item.price ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-md' : 'bg-gray-300 cursor-not-allowed'
                          }`}
                            disabled={balance < item.price}
                          >购买</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Privilege Shop */}
        {tab === 'privilege' && (
          <div className="grid grid-cols-2 gap-3">
            {privileges.map((item, i) => (
              <div key={i} className={`bg-white rounded-xl p-4 border-2 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 relative ${
                item.popular ? 'border-amber-300' : 'border-gray-100'
              }`}>
                {item.popular && (
                  <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                    热门
                  </div>
                )}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-3 shadow-sm`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{item.name}</h3>
                <p className="text-xs text-gray-400 mb-3">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-600">{item.price.toLocaleString()} 积分</span>
                  <div className="flex items-center gap-1.5">
                    {'preview' in item && item.preview && (
                      <button onClick={() => setFireworks(true)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                      >试用</button>
                    )}
                    <button className={`text-xs px-3 py-1.5 rounded-lg font-medium text-white ${
                      balance >= item.price ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-md' : 'bg-gray-300 cursor-not-allowed'
                    }`}
                      disabled={balance < item.price}
                    >兑换</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Decoration Shop */}
        {tab === 'decoration' && (
          <div className="grid grid-cols-2 gap-3">
            {decorations.map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-3 shadow-sm`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{item.name}</h3>
                <p className="text-xs text-gray-400 mb-3">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-600">{item.price.toLocaleString()} 积分</span>
                  <button className={`text-xs px-3 py-1.5 rounded-lg font-medium text-white ${
                    balance >= item.price ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-md' : 'bg-gray-300 cursor-not-allowed'
                  }`}
                    disabled={balance < item.price}
                  >购买</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fireworks */}
      {fireworks && <FireworksOverlay onClose={() => setFireworks(false)} />}
    </div>
  )
}

function FireworksOverlay({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: {
      x: number; y: number; vx: number; vy: number;
      life: number; maxLife: number; color: string; size: number;
      type: 'trail' | 'burst' | 'sparkle'
    }[] = []

    const colors = ['#ff1a1a', '#ffffff', '#0033cc', '#ff6b6b', '#c0c0c0', '#ffd700', '#1a8cff']

    function createBurst(x: number, y: number) {
      for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 6 + 2
        const color = colors[Math.floor(Math.random() * colors.length)]
        particles.push({
          x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          life: 0, maxLife: 60 + Math.random() * 40, color, size: Math.random() * 3 + 1.5,
          type: 'burst'
        })
      }
      // Sparkles
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 10 + 5
        particles.push({
          x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          life: 0, maxLife: 20 + Math.random() * 15, color: '#ffd700', size: 1,
          type: 'sparkle'
        })
      }
    }

    let timer = 0
    let lastBurst = 0

    function animate() {
      if (!ctx || !canvas) return
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      timer++
      // Auto-launch fireworks
      if (timer - lastBurst > 20 + Math.random() * 30) {
        createBurst(
          Math.random() * canvas.width * 0.8 + canvas.width * 0.1,
          Math.random() * canvas.height * 0.5 + canvas.height * 0.1
        )
        lastBurst = timer
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life++
        if (p.life > p.maxLife) { particles.splice(i, 1); continue }

        p.x += p.vx
        p.y += p.vy
        p.vy += 0.04 // gravity
        p.vx *= 0.98

        const alpha = 1 - p.life / p.maxLife
        ctx.globalAlpha = alpha
        ctx.beginPath()
        if (p.type === 'sparkle') {
          ctx.fillStyle = p.color
          ctx.arc(p.x, p.y, p.size * (1 + Math.random() * 0.5), 0, Math.PI * 2)
        } else {
          ctx.fillStyle = p.color
          ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
        }
        ctx.fill()
      }
      ctx.globalAlpha = 1
      requestAnimationFrame(animate)
    }

    // Initial burst
    createBurst(canvas.width / 2, canvas.height / 3)
    setTimeout(() => createBurst(canvas.width * 0.3, canvas.height * 0.25), 300)
    setTimeout(() => createBurst(canvas.width * 0.7, canvas.height * 0.35), 600)
    setTimeout(() => createBurst(canvas.width * 0.5, canvas.height * 0.2), 1000)

    // Show text after a moment
    setTimeout(() => setShowText(true), 1500)

    animate()

    return () => { particles.length = 0 }
  }, [])

  return (
    <div className="fixed inset-0 z-50">
      <canvas ref={canvasRef} className="absolute inset-0 bg-black" />
      <button onClick={onClose}
        className="absolute top-4 right-4 z-10 px-4 py-2 bg-white/10 backdrop-blur text-white rounded-xl text-sm hover:bg-white/20 transition border border-white/20">
        关闭 ✕
      </button>
      {showText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-7xl font-bold text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] animate-bounce">
            🎆
          </div>
          <div className="text-2xl font-bold text-white mt-4 drop-shadow-lg text-center" style={{ textShadow: '0 0 20px rgba(255,200,50,0.8), 0 0 40px rgba(255,100,50,0.5)' }}>
            全班为你喝彩！
          </div>
          <div className="text-sm text-white/60 mt-2">太棒了，继续保持！</div>
        </div>
      )}
    </div>
  )
}


