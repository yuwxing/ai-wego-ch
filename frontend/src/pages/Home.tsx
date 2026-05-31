import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Award, Trophy, Sparkles, GraduationCap, Shield, Sun, User, LogIn, UserPlus, Monitor } from 'lucide-react'
import { useUser } from '../contexts/UserContext'
import VisitorCounter from '../components/VisitorCounter'

const sections = [
  {
    title: '学习系统', icon: BookOpen, desc: '初中核心学习系统',
    color: 'from-sky-400 to-blue-500',
    links: [
      { to: '/learn/word-cards', label: '单词' },
      { to: '/learn/listening-speaking', label: '听说' },
      { to: '/learn/english-daily', label: '每日英语' },
      { to: '/learn/online-classroom', label: '在线教室' },
      { to: '/learn/classroom', label: 'AI学习助手' },
    ]
  },
  {
    title: '积分经济', icon: Award, desc: '核心经济层',
    color: 'from-teal-400 to-cyan-500',
    links: [
      { to: '/weg', label: '经济总览' },
      { to: '/weg/xp', label: 'XP系统' },
      { to: '/weg/levels', label: '等级' },
      { to: '/weg/balance', label: '余额' },
      { to: '/weg/rewards', label: '奖励' },
    ]
  },
  {
    title: '竞赛中心', icon: Trophy, desc: '教育部白名单竞赛',
    color: 'from-amber-400 to-orange-500',
    links: [
      { to: '/competitions', label: '竞赛列表' },
      { to: '/competitions/new', label: '创建竞赛' },

    ]
  },
  {
    title: '菁华大学', icon: GraduationCap, desc: '高阶成长系统',
    color: 'from-violet-400 to-purple-500',
    links: [
      { to: '/jinghua', label: '菁华首页' },
      { to: '/jinghua/projects', label: '科研' },
      { to: '/jinghua/classroom', label: '求职课堂' },
      { to: '/jinghua/job-square', label: '求职广场' },
    ]
  },
  {
    title: '系统中心', icon: Shield, desc: '信息与治理',
    color: 'from-sky-400 to-blue-400',
    links: [
      { to: '/announcements', label: '公告' },
      { to: '/rules', label: '规则' },
      { to: '/feedback', label: '反馈' },
      { to: '/settings/api-key', label: 'API密钥' },
      { to: '/register', label: '注册/登录' },
    ]
  },
]

export default function HomePageNav() {
  const version = 'v3-' + Date.now()
  const navigate = useNavigate();
  const { user, logout, isGuest, loginAsGuest } = useUser();
  return (
    <div className="page-wrapper" data-version={version}>
      <div className="max-w-5xl mx-auto px-4 py-16 relative z-10">
        {/* User Status Bar */}
        <div className="flex justify-end mb-6">
          {user && !isGuest ? (
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                {user.username?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="text-sm font-semibold text-slate-700">{user.username || user.email}</span>
              <button onClick={() => { logout(); navigate('/'); }} className="text-xs text-slate-400 hover:text-red-500 transition-colors">退出</button>
            </div>
          ) : isGuest ? (
            <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 rounded-xl border border-amber-200 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white text-sm font-bold">?</div>
              <span className="text-sm font-semibold text-amber-700">游客模式</span>
              <button onClick={() => navigate('/register')} className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors font-medium">注册/登录</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/register')} className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-1.5">
                <LogIn className="w-4 h-4" /> 登录
              </button>
              <button onClick={() => { loginAsGuest(); navigate('/'); }} className="px-4 py-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 text-sm font-medium hover:border-indigo-300 hover:text-indigo-500 transition-all">
                游客进入
              </button>
            </div>
          )}
        </div>

        {/* Hero Banner */}
        <div className="mb-12 bg-gradient-to-br from-sky-50 via-white to-emerald-50 rounded-3xl border border-sky-100 overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-5/12 p-4 md:p-0">
              <svg viewBox="0 0 400 340" className="w-full max-w-sm mx-auto" xmlns="http://www.w3.org/2000/svg">
                {/* Sky gradient */}
                <defs>
                  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#87CEEB"/>
                    <stop offset="100%" stopColor="#E0F7FA"/>
                  </linearGradient>
                  <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#81C784"/>
                    <stop offset="100%" stopColor="#4CAF50"/>
                  </linearGradient>
                  <radialGradient id="appleGrad" cx="50%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#FF6B6B"/>
                    <stop offset="100%" stopColor="#E53935"/>
                  </radialGradient>
                  <linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6D4C41"/>
                    <stop offset="100%" stopColor="#8D6E63"/>
                  </linearGradient>
                </defs>

                {/* Sky */}
                <rect width="400" height="340" fill="url(#sky)"/>

                {/* Cloud */}
                <ellipse cx="80" cy="50" rx="40" ry="18" fill="white" opacity="0.8"/>
                <ellipse cx="110" cy="45" rx="30" ry="15" fill="white" opacity="0.8"/>
                <ellipse cx="300" cy="70" rx="35" ry="14" fill="white" opacity="0.7"/>
                <ellipse cx="330" cy="65" rx="25" ry="12" fill="white" opacity="0.7"/>

                {/* Grass */}
                <ellipse cx="200" cy="325" rx="220" ry="35" fill="url(#grass)"/>

                {/* Tree trunk */}
                <rect x="255" y="145" width="28" height="120" rx="6" fill="url(#trunk)"/>

                {/* Tree branches */}
                <path d="M269 190 Q300 170 310 155" stroke="#6D4C41" strokeWidth="5" fill="none" strokeLinecap="round"/>
                <path d="M269 210 Q240 195 225 185" stroke="#6D4C41" strokeWidth="4" fill="none" strokeLinecap="round"/>

                {/* Tree canopy */}
                <ellipse cx="269" cy="130" rx="65" ry="55" fill="#66BB6A" opacity="0.9"/>
                <ellipse cx="235" cy="118" rx="40" ry="35" fill="#81C784" opacity="0.8"/>
                <ellipse cx="305" cy="130" rx="35" ry="30" fill="#4CAF50" opacity="0.7"/>
                <ellipse cx="260" cy="100" rx="35" ry="28" fill="#A5D6A7" opacity="0.7"/>
                <ellipse cx="290" cy="115" rx="30" ry="25" fill="#66BB6A" opacity="0.6"/>

                {/* Apple on tree */}
                <circle cx="240" cy="105" r="8" fill="url(#appleGrad)"/>
                <path d="M240 97 Q242 93 244 97" stroke="#4CAF50" strokeWidth="1.5" fill="none"/>

                {/* Falling apple with motion lines */}
                <circle cx="230" cy="165" r="9" fill="url(#appleGrad)"/>
                <path d="M230 156 Q232 152 234 156" stroke="#4CAF50" strokeWidth="1.5" fill="none"/>
                <line x1="218" y1="155" x2="212" y2="150" stroke="#E53935" strokeWidth="1.5" opacity="0.5"/>
                <line x1="216" y1="162" x2="210" y2="160" stroke="#E53935" strokeWidth="1.5" opacity="0.5"/>
                <line x1="218" y1="170" x2="212" y2="172" stroke="#E53935" strokeWidth="1.5" opacity="0.5"/>

                {/* Impact stars */}
                <text x="242" y="178" fontSize="14" fill="#FFD700" fontWeight="bold">✦</text>
                <text x="208" y="168" fontSize="10" fill="#FFD700">✦</text>
                <text x="248" y="172" fontSize="8" fill="#FFD700">✦</text>

                {/* Boy - body */}
                <rect x="218" y="195" width="28" height="35" rx="10" fill="#4FC3F7"/>

                {/* Boy - head */}
                <circle cx="232" cy="185" r="16" fill="#FFCCBC"/>

                {/* Boy - hair */}
                <path d="M216 180 Q218 165 232 168 Q246 165 248 180" fill="#5D4037"/>
                <path d="M216 180 Q215 175 218 172" stroke="#5D4037" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

                {/* Boy - eyes (closed, thinking) */}
                <path d="M226 184 Q228 186 230 184" stroke="#5D4037" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <path d="M234 184 Q236 186 238 184" stroke="#5D4037" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

                {/* Boy - blush */}
                <ellipse cx="224" cy="188" rx="3" ry="2" fill="#FFAB91" opacity="0.6"/>
                <ellipse cx="240" cy="188" rx="3" ry="2" fill="#FFAB91" opacity="0.6"/>

                {/* Boy - mouth (surprised O) */}
                <ellipse cx="232" cy="193" rx="2.5" ry="2" fill="#E57373"/>

                {/* Boy - legs */}
                <rect x="220" y="228" width="10" height="22" rx="4" fill="#5D4037"/>
                <rect x="234" y="228" width="10" height="22" rx="4" fill="#5D4037"/>

                {/* Boy - arms */}
                <rect x="200" y="198" width="20" height="8" rx="4" fill="#FFCCBC" transform="rotate(-15 210 202)"/>
                <rect x="244" y="198" width="20" height="8" rx="4" fill="#FFCCBC" transform="rotate(15 254 202)"/>

                {/* Boy - shoes */}
                <ellipse cx="225" cy="250" rx="8" ry="4" fill="#FF8A65"/>
                <ellipse cx="239" cy="250" rx="8" ry="4" fill="#FF8A65"/>

                {/* Thought bubble - lightbulb moment */}
                <circle cx="200" cy="160" r="3" fill="white" opacity="0.8"/>
                <circle cx="190" cy="148" r="4" fill="white" opacity="0.8"/>
                <ellipse cx="175" cy="130" rx="22" ry="16" fill="white" opacity="0.9" stroke="#E0E0E0" strokeWidth="1"/>
                <text x="175" y="134" fontSize="12" textAnchor="middle" fill="#FFB300">💡</text>

                {/* Small flowers */}
                <circle cx="130" cy="310" r="3" fill="#FF80AB"/>
                <circle cx="132" cy="308" r="3" fill="#FF80AB"/>
                <circle cx="131" cy="309" r="3" fill="#FFD54F"/>

                <circle cx="180" cy="315" r="3" fill="#CE93D8"/>
                <circle cx="182" cy="313" r="3" fill="#CE93D8"/>
                <circle cx="181" cy="314" r="3" fill="#FFD54F"/>

                <circle cx="320" cy="308" r="3" fill="#FF80AB"/>
                <circle cx="322" cy="306" r="3" fill="#FF80AB"/>
                <circle cx="321" cy="307" r="3" fill="#FFD54F"/>
              </svg>
            </div>
            <div className="md:w-7/12 text-center md:text-left p-6 md:pr-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm mb-4">
                <Sparkles className="w-4 h-4" /> AI-Wego 学习成长平台
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3">
                <span className="gradient-text-primary">你的AI团队</span>
                <span className="text-slate-600"> 24小时在线</span>
              </h1>
              <p className="text-slate-500 text-lg">学习 · 成长 · 竞赛 · 未来</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map(s => (
            <div key={s.title} className="group glass-card rounded-2xl p-5 hover:shadow-lg transition-all">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-sm`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-slate-800 font-semibold text-lg">{s.title}</h2>
              <p className="text-slate-400 text-sm mb-3">{s.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {s.links.map(l => (
                  <Link key={l.to} to={l.to} className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 transition-colors">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-slate-400 text-sm">
            <Sun className="w-4 h-4" /> 用学习创造价值，让成长看得见
          </div>
        </div>

        <div className="mt-4 text-center">
          <VisitorCounter />
        </div>
      </div>
    </div>
  )
}
