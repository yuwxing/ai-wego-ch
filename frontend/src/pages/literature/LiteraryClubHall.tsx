import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, PenLine, Users, Sparkles, TrendingUp, Star, Heart, Leaf, Sun, ArrowRight, Loader2, CheckCircle, Clock, Cloud, CloudOff } from 'lucide-react'
import { sharedStoryAPI } from '../../utils/supabase'
import { useUser } from '../../contexts/UserContext'

const CATEGORIES = [
  { id: 'campus', label: '校园故事', icon: BookOpen, color: 'from-emerald-400 to-teal-400', desc: '青春校园的温暖日常' },
  { id: 'fantasy', label: '奇幻故事', icon: Sparkles, color: 'from-purple-400 to-pink-400', desc: '天马行空的幻想世界' },
  { id: 'sci-fi', label: '科幻故事', icon: TrendingUp, color: 'from-cyan-400 to-blue-400', desc: '未来的无限可能' },
  { id: 'history', label: '历史故事', icon: Star, color: 'from-amber-400 to-orange-400', desc: '穿越时空的对话' },
  { id: 'ai', label: 'AI故事', icon: PenLine, color: 'from-rose-400 to-red-400', desc: '人与AI共创的故事' },
]

export default function LiteraryClubHall() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [stats, setStats] = useState({ participants: 1256, works: 328 })
  const [currentStory, setCurrentStory] = useState({
    title: '枕书行',
    lastAuthor: '枕书行',
    excerpt: '枕书行推开绿草地文学社的门时，屋里只有一个人。',
    wordCount: 306,
    relayCount: 3,
  })
  const [latestSubmission, setLatestSubmission] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const subs = await sharedStoryAPI.fetchAll()
        setStats({
          participants: new Set(subs.map((s: any) => s.author_name).filter(Boolean)).size || 1,
          works: subs.length || 0,
        })
        const lastSub = subs[subs.length - 1]
        if (lastSub) {
          setLatestSubmission(lastSub)
          setCurrentStory(prev => ({
            ...prev,
            lastAuthor: lastSub.author_name || '匿名',
            excerpt: lastSub.content.slice(0, 80) + '……',
            wordCount: 306 + subs.reduce((sum: number, s: any) => sum + s.content.replace(/\s/g, '').length, 0),
            relayCount: 3 + subs.length,
          }))
        }
      } catch {}
    }
    init()
  }, [user?.id])

  const isRecent = latestSubmission && (Date.now() - latestSubmission.timestamp < 300000)

  return (
    <div className="page-wrapper min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> 返回首页
        </button>

        {isRecent && latestSubmission.passed && (
          <div className="mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-800">作品已被收录</p>
              <p className="text-xs text-emerald-600">《{latestSubmission.chapter_title}》 评分 {latestSubmission.score}分 · 编号 {latestSubmission.code}</p>
            </div>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
        )}

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shadow-md">
              <Leaf className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            <span className="gradient-text-primary">绿草地文学社</span>
          </h1>
          <p className="text-lg text-slate-500 italic">每个人都是下一位作者</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 max-w-lg mx-auto">
          <div className="glass-card rounded-2xl p-5 text-center">
            <Users className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{stats.participants.toLocaleString()}</p>
            <p className="text-xs text-slate-400">今日参与创作</p>
          </div>
          <div className="glass-card rounded-2xl p-5 text-center">
            <BookOpen className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{stats.works}</p>
            <p className="text-xs text-slate-400">收录优秀作品</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">当前接龙</span>
              <span className="text-xs text-slate-300 mx-1">·</span>
              <span className="text-xs text-emerald-500 font-medium">枕书行</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">{currentStory.title}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              <Users className="w-3.5 h-3.5" />
              <span>上一位作者：<span className="text-slate-600 font-medium">{currentStory.lastAuthor}</span></span>
            </div>
            <div className="bg-white/60 rounded-xl p-4 mb-4 border border-emerald-100/50">
              <p className="text-slate-600 leading-7 whitespace-pre-wrap">"{currentStory.excerpt}"</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
              <span>当前字数：{currentStory.wordCount.toLocaleString()}字</span>
              <span>已接龙：{currentStory.relayCount}次</span>
            </div>
            <button onClick={() => navigate('/literature/write/1')}
              className="inline-flex items-center gap-2 px-6 py-3 btn-gradient-primary rounded-xl font-bold text-base hover:shadow-lg transition-all">
              <PenLine className="w-4 h-4" /> 继续创作
            </button>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
          <Heart className="w-4 h-4 text-emerald-500" /> 作品分类
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-12">
          {CATEGORIES.map(cat => (
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
