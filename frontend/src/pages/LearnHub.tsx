import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Headphones, Newspaper, Bot, Monitor, PenLine, PawPrint, MessageCircleHeart, GraduationCap, Cpu, FileText } from 'lucide-react'

const tools = [
  { to: '/learn/word-cards', icon: BookOpen, title: '单词系统', desc: '单词卡片 · 记忆训练 · 测试模式', color: 'bg-blue-500' },
  { to: '/learn/listening-speaking', icon: Headphones, title: '听说训练', desc: '模仿朗读 · 听选信息 · 回答问题 · 信息转述 · AI评分', color: 'bg-green-500' },
  { to: '/learn/english-daily', icon: Newspaper, title: '每日英语', desc: '阅读理解 · 语法训练 · 写作训练 · AI批改', color: 'bg-purple-500' },
  { to: '/learn/online-classroom', icon: Monitor, title: '在线教室', desc: 'AI智能备课 · 互动授课 · OpenMAIC 课堂', color: 'bg-red-500' },
  { to: '/learn/classroom', icon: Bot, title: 'AI学习助手', desc: 'AI智能辅导 · 宠物精灵陪伴 · 互动聊天', color: 'bg-orange-500' },
  { to: '/learn/teacher', icon: GraduationCap, title: '数字教师', desc: '3D数字分身 · 物理互动 · 语音教学 · Active Ragdoll', color: 'bg-teal-500' },
  { to: '/learn/robot', icon: Cpu, title: '数字校园', desc: '3D数字人 · WASD行走 · 语音对话 · 多动画切换', color: 'bg-blue-600' },
  { to: '/learn/reading-intensive', icon: FileText, title: '外刊精读', desc: '外刊改编 · 长难句拆分 · 语篇逻辑 · 阅读理解', color: 'bg-cyan-500' },
  { to: '/learn/writing', icon: PenLine, title: '英语写作成长空间', desc: '每天一篇 · AI详批 · 二次提交 · 优秀习作榜', color: 'bg-rose-500' },
]

export default function LearnHub() {
  const navigate = useNavigate()
  const [pet, setPet] = useState<any>(null)
  const [feedDate, setFeedDate] = useState<string | null>(null)

  useEffect(() => {
    const load = () => {
      try {
        const p = JSON.parse(localStorage.getItem('adoptedPet') || 'null')
        setPet(p)
        setFeedDate(localStorage.getItem('petFeedDate'))
      } catch {}
    }
    load()
    window.addEventListener('pet-updated', load)
    return () => window.removeEventListener('pet-updated', load)
  }, [])

  const petStatus = (() => {
    if (!feedDate) return { label: '未知', color: 'text-slate-400', bg: 'bg-slate-100' }
    const diff = Math.floor((Date.now() - new Date(feedDate).getTime()) / 86400000)
    if (diff === 0) return { label: '开心', color: 'text-green-500', bg: 'bg-green-100' }
    if (diff === 1) return { label: '一般', color: 'text-amber-500', bg: 'bg-amber-100' }
    if (diff === 2) return { label: '饿了', color: 'text-orange-500', bg: 'bg-orange-100' }
    return { label: '虚弱', color: 'text-red-500', bg: 'bg-red-100' }
  })()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">学习系统</h1>
        <p className="text-slate-500 mb-8">写作 · 单词 · 听说 · 阅读 · 辅导 · 从基础到中高考全覆盖</p>

        {/* 宠物卡片 */}
        <div className="mb-8">
          {pet ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl ${pet.color || 'bg-gradient-to-br from-indigo-400 to-purple-500'} flex items-center justify-center text-white text-2xl font-bold shadow-sm`}>
                {pet.name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800">{pet.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${petStatus.color} ${petStatus.bg}`}>{petStatus.label}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{pet.personality || 'AI学习宠物'} · 每天学习记得喂食哦</p>
              </div>
              <button onClick={() => navigate(`/pet-chat/${pet.petId}`)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg transition-all flex items-center gap-1.5 shrink-0">
                <MessageCircleHeart className="w-4 h-4" /> 我的精灵
              </button>
            </div>
          ) : (
            <Link to="/adopt" className="group block p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-dashed border-amber-200 hover:border-amber-400 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                  <PawPrint className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-amber-800 group-hover:text-amber-900 transition-colors">领养你的学习精灵</h3>
                  <p className="text-sm text-amber-600">学习不再孤单 · 领养宠物陪伴你每天的学习旅程</p>
                </div>
                <span className="text-2xl text-amber-300 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {tools.map(t => (
            <Link key={t.to} to={t.to} className="group block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
              <div className={`w-12 h-12 ${t.color} rounded-lg flex items-center justify-center mb-4`}>
                <t.icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{t.title}</h2>
              <p className="text-sm text-slate-500 mt-1">{t.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
