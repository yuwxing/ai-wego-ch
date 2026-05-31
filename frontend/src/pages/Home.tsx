import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Award, Trophy, Sparkles, GraduationCap, Shield, Sun, User, LogIn, UserPlus, Monitor, Wand2, Loader2, Share2, X, Download } from 'lucide-react'
import { useUser } from '../contexts/UserContext'
import VisitorCounter from '../components/VisitorCounter'
import { digitalAvatarAPI } from '../utils/supabase'
import html2canvas from 'html2canvas'
import QRCode from 'qrcode'

const ROLES = [
  { id: 'student', label: '学生', title: '学习教练', knows: ['学习情况', '薄弱环节'], does: ['制定学习计划', '答疑解惑', '整理错题'] },
  { id: 'teacher', label: '教师', title: '教研助理', knows: ['教学计划', '学生情况'], does: ['备课', '出题', '分析学情'] },
  { id: 'principal', label: '校长', title: 'AI副校长', knows: ['学校管理', '教务数据'], does: ['管理决策', '分析报告', '优化流程'] },
  { id: 'parent', label: '家长', title: '家庭教育助手', knows: ['孩子特点', '家庭情况'], does: ['教育建议', '亲子沟通', '成长规划'] },
  { id: 'professional', label: '职场人士', title: '成长伙伴', knows: ['职业领域', '发展方向'], does: ['职业规划', '技能提升', '效率工具'] },
]

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
      { to: '/learn/creative-workshop', label: '创作工坊' },
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
    ]
  },
  {
    title: '求职就业', icon: GraduationCap, desc: '求职广场 & 求职课堂',
    color: 'from-emerald-400 to-green-500',
    links: [
      { to: '/job-square', label: '求职广场' },
      { to: '/job-classroom', label: '求职课堂' },
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
  const [displayAvatar, setDisplayAvatar] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  // 重建分身表单
  const [restoreRole, setRestoreRole] = useState('student');
  const [restoreName, setRestoreName] = useState('');
  const [restoreGoal, setRestoreGoal] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareImg, setShareImg] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const shareRef = useRef<HTMLDivElement>(null);

  const generateShareImage = async () => {
    setShareLoading(true);
    setShareImg('');
    // ensure QR code is ready
    const origin = window.location.origin;
    const qr = await QRCode.toDataURL(origin, { width: 200, margin: 1, color: { dark: '#4A148C', light: '#FFFFFF' } });
    setQrDataUrl(qr);
    // wait for react to render the qr image in the hidden card
    await new Promise(r => setTimeout(r, 300));
    const el = shareRef.current;
    if (!el) { setShareLoading(false); return; }
    try {
      const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
      setShareImg(canvas.toDataURL('image/png'));
    } catch (e: any) {
      console.error(e);
    }
    setShareLoading(false);
  };

  const syncToServer = async () => {
    if (!user?.id || user.id < 0) return;
    const raw = localStorage.getItem('digitalAvatar');
    if (!raw) return;
    setSyncing(true);
    setSyncMsg('同步中...');
    try {
      await digitalAvatarAPI.save(user.id, JSON.parse(raw));
      setSyncMsg('已同步 ✓');
      setTimeout(() => setSyncMsg(''), 3000);
    } catch (e: any) {
      setSyncMsg('同步失败: ' + (e.message || ''));
    }
    setSyncing(false);
  };

  useEffect(() => {
    // 先从本地读
    try {
      const raw = localStorage.getItem('digitalAvatar');
      if (raw) {
        setDisplayAvatar(JSON.parse(raw));
        // 如果登录了，自动上传到服务器
        if (user?.id && user.id > 0) syncToServer();
        return;
      }
    } catch {}

    // 本地没有，从服务器拉
    if (user?.id && user.id > 0) {
      digitalAvatarAPI.load(user.id).then(data => {
        if (data) {
          setDisplayAvatar(data);
          localStorage.setItem('digitalAvatar', JSON.stringify(data));
        }
      });
    }
  }, [user?.id]);

  const handleRestore = async () => {
    if (!restoreName.trim() || !user?.id) return;
    setRestoring(true);
    const role = ROLES.find(r => r.id === restoreRole)!;
    const avatarData = {
      role: restoreRole,
      name: restoreName.trim(),
      goal: restoreGoal.trim() || `我是${role.label}，请帮助我`,
      companionTitle: role.title,
      skills: role.does,
      prompt: `你是${restoreName.trim()}，我的${role.title}。你了解我的${role.knows.join('、')}。每天帮我${role.does.join('、')}。目标是${restoreGoal.trim() || `我是${role.label}，请帮助我`}。用温暖鼓励的语气陪伴我。`,
    };
    localStorage.setItem('digitalAvatar', JSON.stringify(avatarData));
    setDisplayAvatar(avatarData);
    try {
      await digitalAvatarAPI.save(user.id, avatarData);
    } catch {}
    setRestoring(false);
  };

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

        {/* 数字分身卡片 */}
        {displayAvatar && (
          <div className="mb-6 p-5 bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl border border-indigo-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                {displayAvatar.name?.[0] || '?'}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">{displayAvatar.name}</h3>
                <p className="text-sm text-slate-500">我的数字分身</p>
              </div>
              <div className="flex items-center gap-2">
                {syncMsg && (
                  <span className={`text-xs ${syncMsg.includes('失败') ? 'text-red-500' : 'text-green-600'}`}>{syncMsg}</span>
                )}
                <Link to="/avatar-chat" className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all">
                  去聊天
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 创建/重建分身（当没有分身时显示） */}
        {!displayAvatar && user && !isGuest && (
          <div className="mb-6 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3">创建你的数字分身</h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {ROLES.map(r => (
                <button key={r.id} onClick={() => setRestoreRole(r.id)}
                  className={`py-2 px-1 rounded-xl text-xs font-medium transition-all ${restoreRole === r.id ? 'bg-indigo-500 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >{r.label}</button>
              ))}
            </div>
            <input type="text" value={restoreName} onChange={e => setRestoreName(e.target.value)}
              placeholder="给分身取个名字" maxLength={20}
              className="w-full mb-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <input type="text" value={restoreGoal} onChange={e => setRestoreGoal(e.target.value)}
              placeholder="你的目标（可选）" maxLength={100}
              className="w-full mb-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button onClick={handleRestore} disabled={restoring || !restoreName.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {restoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              创建分身
            </button>
          </div>
        )}

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

        <div className="mt-6 text-center pb-4">
          <button onClick={() => { setShowShare(true); setQrDataUrl(''); setShareImg(''); setTimeout(generateShareImage, 100); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:from-purple-600 hover:to-pink-600 active:scale-95 transition-all shadow-lg shadow-purple-200">
            <Share2 className="w-4 h-4" /> 分享到朋友圈
          </button>
        </div>
      </div>

      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowShare(false); setShareImg(''); }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">分享到朋友圈</h3>
              <button onClick={() => { setShowShare(false); setShareImg(''); }} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {shareLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            ) : shareImg ? (
              <div className="space-y-4">
                <img src={shareImg} alt="分享卡片" className="w-full rounded-xl shadow-md" />
                <p className="text-center text-sm text-slate-500">长按图片保存到相册，即可分享到朋友圈</p>
                <a href={shareImg} download="share-card.png" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-colors">
                  <Download className="w-4 h-4" /> 保存图片
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
                生成中...
              </div>
            )}
          </div>
        </div>
      )}

      {/* hidden share card */}
      <div ref={shareRef} className="fixed -left-[9999px] w-[360px] p-6 bg-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {/* header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">AI WeGo</h1>
          <p className="text-xs text-slate-400 mt-1">用学习创造价值，让成长看得见</p>
        </div>

        {displayAvatar && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4 border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
                {(displayAvatar.name || '我').charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{displayAvatar.name || '我的数字分身'}</p>
                <p className="text-xs text-slate-500">{displayAvatar.role || 'student'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: '学习系统', val: '单词/听说/创作' },
            { label: '积分经济', val: '学习赚积分' },
            { label: '竞赛大厅', val: '在线PK' },
            { label: '数字分身', val: 'AI学习伙伴' },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400">{item.label}</p>
              <p className="text-sm font-semibold text-slate-700 mt-0.5">{item.val}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-4 text-center">
          {qrDataUrl && (
            <img src={qrDataUrl} alt="QR Code" className="w-24 h-24 mx-auto mb-2" />
          )}
          <p className="text-xs text-slate-400 font-medium">长按识别二维码 · 立即体验</p>
        </div>
      </div>
    </div>
  )
}
