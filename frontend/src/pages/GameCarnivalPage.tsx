import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Sparkles, Grid3x3, Hourglass, Dices, Trophy,
  ChevronRight, BookOpen, Zap, MessagesSquare, Music2, PartyPopper, GraduationCap,
} from 'lucide-react'
import FlipCards from './games/FlipCards'
import LuckyWheel from './games/LuckyWheel'
import QuizPK from './games/QuizPK'
import ClassTimer from './games/ClassTimer'
import RandomPicker from './games/RandomPicker'
import ScoreBoard from './games/ScoreBoard'

type Tab = 'home' | 'flip' | 'wheel' | 'quiz' | 'timer' | 'picker' | 'score'

const gameTabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'flip', label: '翻卡配对', icon: Grid3x3 },
  { id: 'wheel', label: '幸运大转盘', icon: Sparkles },
  { id: 'quiz', label: '快闪答题PK', icon: Zap },
]

const toolTabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'timer', label: '课堂计时器', icon: Hourglass },
  { id: 'picker', label: '随机点名', icon: Dices },
  { id: 'score', label: '分组计分板', icon: Trophy },
]

const textbookEntry = {
  to: '/textbook',
  label: '课本游戏',
  desc: '人教版七上/八上 16 个单元互动游戏，跟随教材同步开玩',
  icon: GraduationCap,
  gradient: 'from-indigo-400 to-violet-500',
}

const categories = [
  { title: '单词游戏', icon: BookOpen, desc: '翻卡配对 · 单词大转盘 · 快闪PK', color: 'from-emerald-400 to-teal-500', ids: ['flip', 'wheel', 'quiz'] as Tab[] },
  { title: '语法游戏', icon: Zap, desc: '语法选择 · 时态接龙 · 句型挑战', color: 'from-sky-400 to-blue-500', ids: ['quiz'] as Tab[] },
  { title: '句型游戏', icon: MessagesSquare, desc: '句子翻译 · 连词成句 · 情景对话', color: 'from-violet-400 to-purple-500', ids: ['wheel'] as Tab[] },
  { title: '口语游戏', icon: Music2, desc: '听力辨词 · 跟读挑战 · 口语闯关', color: 'from-amber-400 to-orange-500', ids: ['flip'] as Tab[] },
]

export default function GameCarnivalPage() {
  const [params] = useSearchParams()
  const initialTab = params.get('tab') as Tab | null
  const [tab, setTab] = useState<Tab>(initialTab && ['flip', 'wheel', 'quiz', 'timer', 'picker', 'score'].includes(initialTab) ? initialTab : 'home')

  const goTab = (t: Tab) => {
    setTab(t)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-orange-50">
      {/* Nav bar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3 overflow-x-auto scrollbar-none">
          <button onClick={() => goTab('home')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'home' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200' : 'text-slate-600 hover:bg-slate-100'}`}>
            🎪 嘉年华首页
          </button>
          <div className="w-px h-6 bg-slate-200 flex-shrink-0" />
          <span className="text-xs text-slate-400 font-medium flex-shrink-0">游戏大厅</span>
          {gameTabs.map(t => (
            <button key={t.id} onClick={() => goTab(t.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all inline-flex items-center gap-1.5 ${tab === t.id ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'text-slate-600 hover:bg-slate-100'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
          <Link to="/textbook"
            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all inline-flex items-center gap-1.5 text-slate-600 hover:bg-slate-100">
            <textbookEntry.icon className="w-4 h-4" /> {textbookEntry.label}
          </Link>
          <div className="w-px h-6 bg-slate-200 flex-shrink-0" />
          <span className="text-xs text-slate-400 font-medium flex-shrink-0">课堂工具</span>
          {toolTabs.map(t => (
            <button key={t.id} onClick={() => goTab(t.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all inline-flex items-center gap-1.5 ${tab === t.id ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'text-slate-600 hover:bg-slate-100'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
          <Link to="/" className="flex-shrink-0 ml-auto px-4 py-2 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-all">
            返回首页
          </Link>
        </div>
      </div>

      {/* Home tab */}
      {tab === 'home' && (
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 md:p-12 text-white shadow-xl shadow-emerald-200 mb-8">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-yellow-300/20 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium mb-4 backdrop-blur">
                <PartyPopper className="w-4 h-4" /> 英语游戏嘉年华
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-3 drop-shadow">
                玩着玩着，就把英语学会了！
              </h1>
              <p className="text-emerald-50 text-base md:text-lg max-w-xl mb-6">
                基于 <span className="font-bold text-yellow-300">443 个经典课堂触发器游戏</span> 精心打造。翻卡配对、幸运大转盘、快闪PK……课堂上边玩边学，全班一起嗨！
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => goTab('flip')} className="px-6 py-3 rounded-2xl bg-white text-emerald-600 font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  开始游戏 →
                </button>
                <button onClick={() => goTab('timer')} className="px-6 py-3 rounded-2xl bg-white/20 text-white font-bold backdrop-blur hover:bg-white/30 transition-all">
                  课堂工具箱
                </button>
              </div>
            </div>
            {/* floating emoji decorations */}
            <div className="absolute right-6 md:right-16 top-8 text-5xl md:text-7xl opacity-90 select-none" style={{ transform: 'rotate(12deg)' }}>🎪</div>
            <div className="absolute right-24 md:right-40 bottom-6 text-3xl md:text-5xl opacity-80 select-none" style={{ transform: 'rotate(-10deg)' }}>✨</div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { num: '443', label: '经典游戏资源' },
              { num: '1,745', label: '教材词汇' },
              { num: '3+1+16', label: '即玩游戏 + 课堂工具 + 课本游戏' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
                <p className="text-2xl md:text-3xl font-extrabold text-emerald-600">{s.num}</p>
                <p className="text-[11px] md:text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* 分类 */}
          <h2 className="text-lg font-bold text-slate-800 mb-4">🎠 游戏分类</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {categories.map(c => (
              <button key={c.title} onClick={() => goTab(c.ids[0])}
                className="group text-left bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.color}`} />
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white shadow-md mb-3 group-hover:scale-110 transition-all`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">{c.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
                <ChevronRight className="absolute right-4 bottom-4 w-4 h-4 text-slate-300 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>

          {/* 即时游戏 */}
          <h2 className="text-lg font-bold text-slate-800 mb-4">🎮 立即开玩</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {gameTabs.map((t, i) => (
              <button key={t.id} onClick={() => goTab(t.id)}
                className="group bg-white rounded-2xl border border-slate-200 p-6 text-left shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${['from-emerald-400 to-teal-500', 'from-sky-400 to-blue-500', 'from-violet-400 to-purple-500'][i]} flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 group-hover:-rotate-6 transition-all`}>
                  <t.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">{t.label}</h3>
                <p className="text-xs text-slate-400 mb-4">
                  {t.id === 'flip' && '翻开卡片，找到英文单词与中文释义的配对，锻炼记忆力'}
                  {t.id === 'wheel' && '转动转盘，随机抽选单词或小组，课堂互动神器'}
                  {t.id === 'quiz' && '两队轮流限时答题，快节奏词汇PK对战'}
                </p>
                <span className="inline-flex items-center gap-1 text-emerald-500 text-sm font-bold">
                  立即开玩 <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-all" />
                </span>
              </button>
            ))}
          </div>

          {/* 课本游戏入口 */}
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <Link to={textbookEntry.to}
              className="group bg-white rounded-2xl border-2 border-indigo-200 p-6 text-left shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all md:col-span-3 bg-gradient-to-r from-indigo-50 to-violet-50">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${textbookEntry.gradient} flex items-center justify-center text-white shadow-lg flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                  <textbookEntry.icon className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-lg mb-1">{textbookEntry.label}</h3>
                  <p className="text-xs text-slate-500">{textbookEntry.desc}</p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 text-indigo-500 text-sm font-bold flex-shrink-0">
                  进入 <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-all" />
                </span>
              </div>
            </Link>
          </div>

          {/* 课堂工具 */}
          <h2 className="text-lg font-bold text-slate-800 mb-4">🧰 课堂工具箱</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {toolTabs.map((t, i) => (
              <button key={t.id} onClick={() => goTab(t.id)}
                className="group bg-white rounded-2xl border border-slate-200 p-6 text-left shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${['from-amber-400 to-orange-500', 'from-rose-400 to-pink-500', 'from-indigo-400 to-violet-500'][i]} flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 group-hover:-rotate-6 transition-all`}>
                  <t.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">{t.label}</h3>
                <p className="text-xs text-slate-400 mb-4">
                  {t.id === 'timer' && '大屏投屏倒计时，时间到自动响铃'}
                  {t.id === 'picker' && '全班名单随机点名，点过不重复'}
                  {t.id === 'score' && '小组加减分，课堂PK战况实时展示'}
                </p>
                <span className="inline-flex items-center gap-1 text-emerald-500 text-sm font-bold">
                  打开工具 <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-all" />
                </span>
              </button>
            ))}
          </div>

          {/* PPT 资源说明 */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl border border-amber-200 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-2">📚 443 个经典触发器游戏库</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-3">
                  游戏嘉年华由《1000+优质英语触发器游戏》资源库精选提炼而来。翻卡、转盘、消消乐、射击选择题、砸地鼠、夹娃娃、PK对战、拼单词、语法、句型……
                  现已按类别陆续 Web 化，全部免费使用，适配课堂大屏。
                </p>
                <div className="flex flex-wrap gap-2">
                  {['翻卡', '转盘', '消消乐', '射击选择', '砸地鼠', '夹娃娃', 'PK对战', '拼单词', '语法', '句型'].map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-white border border-amber-200 text-amber-700 text-xs font-medium">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game/Tool tabs */}
      {tab === 'flip' && <FlipCards />}
      {tab === 'wheel' && <LuckyWheel />}
      {tab === 'quiz' && <QuizPK />}
      {tab === 'timer' && <ClassTimer />}
      {tab === 'picker' && <RandomPicker />}
      {tab === 'score' && <ScoreBoard />}
    </div>
  )
}
