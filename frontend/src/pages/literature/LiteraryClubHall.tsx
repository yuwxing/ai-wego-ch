import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, PenLine, Users, Sparkles, TrendingUp, Star, Heart, Leaf, Sun, MessageCircle } from 'lucide-react'
import { sharedStoryAPI } from '../../utils/supabase'
import { useUser } from '../../contexts/UserContext'

const STORIES = [
  {
    id: 'zhenshuxing',
    title: '枕书行',
    subtitle: '故事接龙',
    icon: BookOpen,
    color: 'from-emerald-400 to-teal-400',
    route: '/literature/write/1',
    desc: '有一定写作功底的同学来接龙，AI评分≥80才能收录',
    requirement: '需自配 API Key · 1000汉字起',
  },
  {
    id: 'paper_short',
    title: '纸短情长',
    subtitle: '自由创作',
    icon: Heart,
    color: 'from-pink-400 to-rose-400',
    route: '/literature/paper-short',
    desc: '纸短情长，见字如面。短篇随想、日常感悟……',
    requirement: '无需 API Key · 300汉字起',
  },
]

export default function LiteraryClubHall() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [stats, setStats] = useState({ zhenshuxingChapters: 0, paperShortPosts: 0, totalAuthors: 0 })

  useEffect(() => {
    const init = async () => {
      try {
        const all = await sharedStoryAPI.fetchAll()
        const peerHeart = all.filter((s: any) => s.code === 'paper_short')
        const zhenshuxing = all.filter((s: any) => !s.code || s.code === '' || s.code === 'zhenshuxing')
        setStats({
          zhenshuxingChapters: zhenshuxing.length,
          peerHeartPosts: peerHeart.length,
          totalAuthors: new Set(all.map((s: any) => s.author_name).filter(Boolean)).size,
        })
      } catch {}
    }
    init()
  }, [user?.id])

  return (
    <div className="page-wrapper min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> 返回首页
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            <span className="gradient-text-primary">绿草地文学社</span>
          </h1>
          <p className="text-lg text-slate-500 italic">每个人都是下一位作者</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
          <div className="glass-card rounded-2xl p-5 text-center">
            <Users className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{stats.totalAuthors}</p>
            <p className="text-xs text-slate-400">参与作者</p>
          </div>
          <div className="glass-card rounded-2xl p-5 text-center">
            <BookOpen className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{stats.zhenshuxingChapters + 3}</p>
            <p className="text-xs text-slate-400">接龙章节</p>
          </div>
          <div className="glass-card rounded-2xl p-5 text-center">
            <MessageCircle className="w-6 h-6 text-pink-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{stats.peerHeartPosts}</p>
            <p className="text-xs text-slate-400">树洞心事</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {STORIES.map(story => (
            <div key={story.id} className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-${story.color.split(' ')[0].replace('from-', '').replace('-400', '')}-100/50 to-transparent rounded-bl-full`} />
              <div className="relative">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${story.color} flex items-center justify-center mb-4 shadow-sm`}>
                  <story.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{story.subtitle}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{story.title}</h2>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">{story.desc}</p>
                <div className="text-xs text-slate-400 mb-6 bg-white/50 rounded-lg px-3 py-2 inline-block">{story.requirement}</div>
                <br />
                <button onClick={() => navigate(story.route)}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base hover:shadow-lg transition-all text-white bg-gradient-to-r ${story.color}`}>
                  <PenLine className="w-4 h-4" />
                  {story.id === 'zhenshuxing' ? '继续创作' : '写心事'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" /> 作品分类
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-12">
          {[
            { id: 'campus', label: '校园故事', icon: BookOpen, color: 'from-emerald-400 to-teal-400', desc: '青春校园的温暖日常' },
            { id: 'fantasy', label: '奇幻故事', icon: Sparkles, color: 'from-purple-400 to-pink-400', desc: '天马行空的幻想世界' },
            { id: 'sci-fi', label: '科幻故事', icon: TrendingUp, color: 'from-cyan-400 to-blue-400', desc: '未来的无限可能' },
            { id: 'history', label: '历史故事', icon: Star, color: 'from-amber-400 to-orange-400', desc: '穿越时空的对话' },
            { id: 'ai', label: 'AI故事', icon: PenLine, color: 'from-rose-400 to-red-400', desc: '人与AI共创的故事' },
          ].map(cat => (
            <button key={cat.id}
              className="glass-card rounded-2xl p-4 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mx-auto mb-2 shadow-sm group-hover:scale-110 transition-transform`}>
                <cat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-semibold text-slate-700">{cat.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{cat.desc}</p>
            </button>
          ))}
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-slate-400 text-sm">
            <Sun className="w-4 h-4" /> 用文字记录成长，让故事温暖时光
          </div>
        </div>
      </div>
    </div>
  )
}
