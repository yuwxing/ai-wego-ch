import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Award, Trophy, Sparkles, GraduationCap, Shield, Briefcase, Sun, User, LogIn, UserPlus, Monitor, Wand2, Loader2, Share2, X, Download, Brain, Users, ExternalLink, Box } from 'lucide-react'
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
    title: '学习系统', icon: BookOpen, desc: '单词 · 写作 · 听说 · 阅读 · AI辅导',
    color: 'from-sky-400 to-blue-500',
    links: [
      { to: '/learn/writing', label: '英语写作', desc: '中考/高考作文 · AI批改 · 二次提交 · 习作榜' },
      { to: '/learn/word-cards', label: '背单词' },
      { to: 'https://vocabulary-os.ai-wego-v3.pages.dev', label: '单词OS', desc: '新人教词汇 · SRS间隔重复 · AI助学' },
      { to: '/learn/word-pass', label: '词汇训练营' },
      { to: '/learn/listening-speaking', label: '听说' },
      { to: '/learn/english-daily', label: '每日英语' },
      { to: '/learn/grammar', label: '语法训练营' },
      { to: '/learn/online-classroom', label: '在线教室' },
      { to: '/learn/classroom', label: 'AI学习助手' },
      { to: '/learn/textbook-challenge', label: '课本闯关' },
      { to: '/learn/story-academy', label: '故事学院' },
      { to: '/learn/robot', label: '数字校园' },
      { to: '/learn/irregular-verbs', label: '不规则动词' },
      { to: '/learn/study-notes', label: '学霸笔记' },
    ]
  },
  {
    title: 'AI解题技巧', icon: Brain, desc: '语法选择 · 完形填空 · 阅读理解 · AI分析',
    color: 'from-fuchsia-400 to-pink-500',
    links: [
      { to: 'https://237691df9cf24d7da7d5e4494eabb5aa.app.codebuddy.work', label: '写作教练', desc: '中考/高考写作 · AI批改 · 多轮辅导' },
      { to: 'https://english.we-aigo.cn/grammar.html', label: '语法选择', desc: '12道AI解析语法题' },
      { to: 'https://english.we-aigo.cn/cloze.html', label: '完形填空', desc: '8篇AI解析完形' },
      { to: 'https://english.we-aigo.cn/reading.html', label: '阅读理解', desc: '8篇AI解析阅读' },
      { to: 'https://english.we-aigo.cn', label: 'AI解题中心', desc: '汇总页' },
    ]
  },
  {
    title: '3D沉浸课堂', icon: Monitor, desc: 'VR · 3D · 互动英语',
    color: 'from-teal-400 to-cyan-500',
    links: [
      { to: '/learn/teacher', label: '数字教师', desc: 'AI数字分身 · 24小时学习陪伴' },
      { to: 'https://vr-classroom.ai-wego-v3.pages.dev', label: 'VR课堂', desc: '3D沉浸式英语故事学习' },
      { to: 'https://science.we-aigo.cn', label: '科学世界', desc: '3D科学探索 · 物理化学实验' },
    ]
  },
  {
    title: 'WEGO社区', icon: Trophy, desc: '竞赛 · 文学社 · 创作工坊 · 推理测试',
    color: 'from-amber-400 to-orange-500',
    links: [
      { to: '/competitions', label: '竞赛列表' },
      { to: '/competitions/new', label: '创建竞赛' },
      { to: '/literature', label: '绿草地文学社' },
      { to: '/community/creative-workshop', label: '创作工坊' },
      { to: '/community/sequence-test', label: '序列推理' },
      { to: '/community/math-speed', label: '数学速算' },
      { to: '/community/quiz/poetry', label: '古诗词挑战' },
      { to: '/community/quiz/history', label: '历史常识' },
      { to: '/community/quiz/science', label: '科学常识' },
       { to: '/community/quiz/geography', label: '地理常识' },
       { to: 'https://play.we-aigo.cn', label: '科普剧大赛' },
     ]
  },
  {
    title: '脑力训练', icon: Brain, desc: '专注力 · 记忆力 · 心理测试',
    color: 'from-purple-400 to-pink-500',
    links: [
      { to: '/community/brain-train', label: '脑力训练', desc: '13种小游戏' },
      { to: '/community/math-visual', label: '数形结合', desc: '加减乘除可视化' },
      { to: '/community/psych-test', label: '心理测试', desc: '11种测评' },
    ]
  },
  {
    title: '休闲时光', icon: Sun, desc: 'AI金渐层 · 陪你放松片刻',
    color: 'from-rose-400 to-pink-500',
    links: [
      { to: 'https://ai-wego.top/leisure/cat-life/', label: '金渐层的AI日常', desc: '养一只会转身、会撒娇、可大可小的桌面小猫' },
    ]
  },
  {
    title: '3D建模', icon: Box, desc: 'Blender · 从零开始做模型',
    color: 'from-orange-400 to-amber-500',
    links: [
      { to: 'https://www.blender.org/', label: 'Blender 官网' },
      { to: 'https://www.blender.org/download/', label: '下载 Blender' },
    ]
  },
  {
    title: '英语游戏嘉年华', icon: Sparkles, desc: '翻卡配对 · 幸运大转盘 · 快闪PK · 课堂工具',
    color: 'from-emerald-400 to-teal-500',
    links: [
      { to: '/games', label: '游戏嘉年华首页', desc: '443个经典课堂游戏Web化' },
      { to: '/games?tab=flip', label: '翻卡配对' },
      { to: '/games?tab=wheel', label: '幸运大转盘' },
      { to: '/games?tab=quiz', label: '快闪答题PK' },
      { to: '/games?tab=timer', label: '课堂计时器' },
      { to: '/games?tab=picker', label: '随机点名' },
      { to: '/games?tab=score', label: '分组计分板' },
    ]
  },
  {
    title: '菁华大学', icon: GraduationCap, desc: '高阶成长 · 项目实践',
    color: 'from-violet-400 to-purple-500',
    links: [
      { to: '/jinghua', label: '菁华首页' },
      { to: '/jinghua/projects', label: '科研' },
      { to: '/learn/reading-intensive', label: '外刊精读' },
    ]
  },
  {
    title: '求职就业', icon: Briefcase, desc: '求职广场 · 求职课堂',
    color: 'from-emerald-400 to-green-500',
    links: [
      { to: '/job-square', label: '求职广场' },
      { to: '/job-classroom', label: '求职课堂' },
    ]
  },
  {
    title: 'AI-Wego阅卷', icon: GraduationCap, desc: '自动批改 · 全学科支持',
    color: 'from-amber-400 to-orange-500',
    links: [
      { to: '/grading', label: 'AI-Wego阅卷', desc: '智能批改 · 支持所有网阅系统 · 自动提交' },
    ]
  },
  {
    title: '系统中心', icon: Shield, desc: '公告 · 反馈 · 积分 · 设置',
    color: 'from-sky-400 to-blue-400',
    links: [
      { to: '/announcements', label: '公告' },
      { to: '/rules', label: '规则' },
      { to: '/feedback', label: '反馈' },
      { to: '/settings/api-key', label: 'API密钥' },
      { to: '/register', label: '注册/登录' },
      { to: '/weg', label: '积分中心' },
      { to: '/weg/shop', label: '积分商城' },
      { to: '/tools/translator', label: '翻译器下载' },
    ]
  },
]

export default function HomePageNav() {
  const version = 'v3-' + Date.now()
  const navigate = useNavigate();
  const { user, logout, isGuest, loginAsGuest } = useUser();
  const [avatars, setAvatars] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [restoreRole, setRestoreRole] = useState('student');
  const [restoreName, setRestoreName] = useState('');
  const [restoreGoal, setRestoreGoal] = useState('');
  const [restorePrompt, setRestorePrompt] = useState('');
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

  const AVATARS_KEY = 'digitalAvatars'
  const ACTIVE_KEY = 'activeAvatarId'
  const genId = () => Math.random().toString(36).substring(2, 10)

  const loadAvatars = () => {
    try {
      const old = localStorage.getItem('digitalAvatar')
      const list = JSON.parse(localStorage.getItem(AVATARS_KEY) || '[]')
      if (old && list.length === 0) {
        const oldAvatar = JSON.parse(old)
        oldAvatar.id = genId()
        list.push(oldAvatar)
        localStorage.setItem(AVATARS_KEY, JSON.stringify(list))
        localStorage.setItem(ACTIVE_KEY, oldAvatar.id)
        localStorage.removeItem('digitalAvatar')
      }
      setAvatars(list)
      return list
    } catch { return [] }
  }

  useEffect(() => { loadAvatars() }, [])

  const handleRestore = async () => {
    if (!restoreName.trim()) return;
    setRestoring(true);
    const role = ROLES.find(r => r.id === restoreRole)!;
    const newAvatar = {
      id: genId(),
      role: restoreRole,
      name: restoreName.trim(),
      goal: restoreGoal.trim() || `我是${role.label}，请帮助我`,
      companionTitle: role.title,
      skills: role.does,
      prompt: restorePrompt.trim() || `你是${restoreName.trim()}，我的${role.title}。你了解我的${role.knows.join('、')}。每天帮我${role.does.join('、')}。目标是${restoreGoal.trim() || `我是${role.label}，请帮助我`}。用温暖鼓励的语气陪伴我。`,
    };
    const list = [...avatars, newAvatar]
    localStorage.setItem(AVATARS_KEY, JSON.stringify(list))
    localStorage.setItem(ACTIVE_KEY, newAvatar.id)
    setAvatars(list)
    setShowCreateForm(false)
    setRestoreName(''); setRestoreGoal('')
    try { await digitalAvatarAPI.save(user.id, newAvatar) } catch {}
    setRestoring(false);
  };

  const handleDeleteAvatar = (id: string) => {
    const list = avatars.filter(a => a.id !== id)
    localStorage.setItem(AVATARS_KEY, JSON.stringify(list))
    if (localStorage.getItem(ACTIVE_KEY) === id) {
      localStorage.setItem(ACTIVE_KEY, list[0]?.id || '')
    }
    setAvatars(list)
  }

  const handleSelectAvatar = (id: string) => {
    localStorage.setItem(ACTIVE_KEY, id)
    navigate('/avatar-chat')
  }

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

        {/* 多智能体协同办公 */}
        <div className="mb-6">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400" />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-white shadow-md shadow-violet-200">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">多智能体协同办公</h3>
                  <p className="text-xs text-slate-400">一个AI不够用？现在拥有整个AI团队</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                当你休息时，你的AI团队仍在运转——AI项目经理统筹任务、AI执行官拍板决策、AI分析师深挖数据、AI文案持续输出。你的数字分身团队全天候在线，各司其职，自动协作。
              </p>
              <div className="flex flex-wrap gap-2.5">
                <Link to="/learn/multi-agent-team" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-semibold hover:from-violet-600 hover:to-fuchsia-600 transition-all shadow-sm hover:shadow-md active:scale-[0.97]">
                  英语教学AI团队
                </Link>
                <a href="https://console.we-aigo.cn" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.97]">
                  AI学校行政控制台
                </a>
                <a href="https://ai-headteacher-os.pages.dev" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.97]">
                  班主任AI助理
                </a>
                <a href="https://city.we-aigo.cn" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.97]">
                  平权城市
                </a>
                 <a href="https://v3.we-aigo.cn/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-semibold hover:from-indigo-600 hover:to-violet-600 transition-all shadow-sm hover:shadow-md active:scale-[0.97]">
                   智慧校园AI治理平台 v3
                 </a>
                 <a href="https://schoolmate.we-aigo.cn" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-semibold hover:from-green-500 hover:to-emerald-600 transition-all shadow-sm hover:shadow-md active:scale-[0.97]">
                   校友会 AI
                 </a>
                 <a href="https://ppt-master.pages.dev" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-semibold hover:from-orange-500 hover:to-red-600 transition-all shadow-sm hover:shadow-md active:scale-[0.97]">
                   PPT AI OS v3
                 </a>
                 <a href="https://ai-ppt-os-v4.pages.dev" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-white text-xs font-semibold hover:from-sky-500 hover:to-blue-600 transition-all shadow-sm hover:shadow-md active:scale-[0.97]">
                    PPT AI OS v4
                  </a>
               </div>
            </div>
          </div>
        </div>

        {/* AI 高考决策中心 */}
        <div className="mb-6">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-200">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">AI 高考决策中心</h3>
                  <p className="text-xs text-slate-400">高考分数已出，AI 帮你选大学选专业</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                输入你的高考分数和省份，AI 智能推荐冲稳保院校和专业。基于历年录取数据，结合位次分析、专业前景评估，帮你做出最优高考志愿决策。
              </p>
              <div className="flex flex-wrap gap-2.5">
                <a href="https://gaokao.we-aigo.cn" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md active:scale-[0.97]">
                  <ExternalLink className="w-3.5 h-3.5" /> 立即体验
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* VR 课堂 */}
        <div className="mb-6">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400" />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-200">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">VR 课堂</h3>
                  <p className="text-xs text-slate-400">3D 沉浸式英语故事学习体验</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                在 Three.js 3D 世界中探索英语故事。支持 AI 课文解析、角色对话、词汇学习、口语评测、XP 成长系统。上传任意课文自动生成互动故事世界。
              </p>
              <div className="flex flex-wrap gap-2.5">
                <a href="https://vr-classroom.ai-wego-v3.pages.dev" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-sm hover:shadow-md active:scale-[0.97]">
                  <ExternalLink className="w-3.5 h-3.5" /> 进入 VR 课堂
                </a>
                <a href="https://vr-classroom.ai-wego-v3.pages.dev/upload" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.97]">
                  上传课文生成
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 数字分身列表 */}
        {(true) && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-600">我的分身</h3>
              <button onClick={() => setShowCreateForm(!showCreateForm)}
                className="text-xs text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-1">
                {showCreateForm ? '收起' : '+ 新建分身'}
              </button>
            </div>
            {avatars.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {avatars.map(a => {
                  const role = ROLES.find(r => r.id === a.role)
                  const colors = [
                    'from-indigo-400 to-purple-500',
                    'from-emerald-400 to-teal-400',
                    'from-amber-400 to-orange-500',
                    'from-rose-400 to-pink-500',
                    'from-sky-400 to-cyan-500',
                  ]
                  const colorIdx = avatars.indexOf(a) % colors.length
                  return (
                    <div key={a.id} className="flex-shrink-0 w-44 glass-card rounded-2xl p-4 hover:shadow-md transition-all group relative">
                      <button onClick={() => { if (confirm(`删除分身「${a.name}」？`)) handleDeleteAvatar(a.id) }}
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white shadow border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-300 opacity-0 group-hover:opacity-100 transition-all text-xs">
                        ✕
                      </button>
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center text-white text-lg font-bold shadow-sm mb-3`}>
                        {a.name?.[0] || '?'}
                      </div>
                      <p className="text-sm font-bold text-slate-800 truncate">{a.name}</p>
                      <p className="text-xs text-slate-400 mb-3">{a.companionTitle || role?.title || 'AI分身'}</p>
                      <button onClick={() => handleSelectAvatar(a.id)}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium hover:shadow-lg transition-all">
                        去聊天
                      </button>
                    </div>
                  )
                })}
                <button onClick={() => setShowCreateForm(true)}
                  className="flex-shrink-0 w-44 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-300 text-slate-400 hover:text-indigo-500 transition-all flex flex-col items-center justify-center gap-1.5 min-h-[160px]">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="text-xl font-bold">+</span>
                  </div>
                  <span className="text-xs font-medium">新建分身</span>
                </button>
              </div>
            )}
            {avatars.length === 0 && !showCreateForm && (
              <div className="glass-card rounded-2xl p-6 text-center">
                <p className="text-sm text-slate-400 mb-3">还没有数字分身</p>
                <button onClick={() => setShowCreateForm(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg transition-all">
                  创建你的第一个分身
                </button>
              </div>
            )}
          </div>
        )}

        {/* 创建分身表单 */}
        {showCreateForm && (
          <div className="mb-6 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800">创建数字分身</h3>
              <button onClick={() => setShowCreateForm(false)} className="text-xs text-slate-400 hover:text-slate-600">取消</button>
            </div>
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
              className="w-full mb-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <textarea value={restorePrompt} onChange={e => setRestorePrompt(e.target.value)}
              placeholder="自定义指令（选填）&#10;例：你是一名有10年经验的初中英语教师，帮我生成课前导入内容"
              rows={3} maxLength={2000}
              className="w-full mb-3 px-4 py-2.5 rounded-xl bg-yellow-50 border border-yellow-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 resize-none"
            />
            <button onClick={handleRestore} disabled={restoring || !restoreName.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {restoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              创建分身
            </button>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map(s => (
            <div key={s.title} className="group relative">
              <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${s.color} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500`} />
              <div className="relative p-6 rounded-2xl bg-white shadow-lg shadow-slate-200/60 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 hover:scale-[1.01] border border-slate-100/80">
                <div className={`absolute top-0 left-6 right-6 h-1 rounded-full bg-gradient-to-r ${s.color} opacity-60`} />
                <div className="relative mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-md shadow-slate-300/40 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} opacity-20 blur-sm -z-10`} />
                </div>
                <h2 className="text-slate-800 font-bold text-lg mb-1">{s.title}</h2>
                <p className="text-slate-400 text-sm mb-4">{s.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {s.links.map(l => (
                    l.to.startsWith('http') ? (
                      <a key={l.to} href={l.to} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white rounded-full text-xs text-slate-600 border border-slate-200 shadow-sm font-medium hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all">
                        {l.label}
                      </a>
                    ) : (
                      <Link key={l.to} to={l.to} className="px-3 py-1.5 bg-white rounded-full text-xs text-slate-600 border border-slate-200 shadow-sm font-medium hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all">
                        {l.label}
                      </Link>
                    )
                  ))}
                </div>
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

        {avatars[0] && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4 border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
                {(avatars[0].name || '我').charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{avatars[0].name || '我的数字分身'}</p>
                <p className="text-xs text-slate-500">{avatars[0].role || 'student'}</p>
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
