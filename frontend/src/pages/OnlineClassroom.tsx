import { useState } from 'react'
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  GraduationCap,
  Sparkles,
  BookOpen,
  Bot,
  MessageSquare,
  Layers,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function OnlineClassroom() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [copied, setCopied] = useState(false)

  // 由「八年级英语师生成长平台」备课中心跳转过来时携带的参数
  const topic = params.get('topic') ?? ''
  const unitNo = params.get('unit') ?? ''
  const subject = params.get('subject') ?? ''
  const grade = params.get('grade') ?? ''
  const from = params.get('from') ?? ''
  const returnUrl = params.get('return') ?? ''

  const fromGrowthHub = from === 'english-growth-hub'

  const openClassroom = () => {
    window.open('https://open.maic.chat/', '_blank', 'noopener')
  }

  const copyTopic = async () => {
    if (!topic) return
    try {
      await navigator.clipboard.writeText(topic)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = topic
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-sky-100 shrink-0">
        {returnUrl ? (
          <a
            href={returnUrl}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回英语成长平台</span>
          </a>
        ) : (
          <button
            onClick={() => navigate('/learn')}
            className="flex items-center gap-2 text-slate-500 hover:text-sky-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回学习系统</span>
          </button>
        )}
        <h1 className="text-slate-800 font-semibold text-lg">在线教室</h1>
        <div className="w-24" />
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* 顶部装饰 */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-emerald-400 to-sky-400 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              清华大学开源项目 · AI 赋能教学
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">OpenMAIC 在线教室</h2>
            <p className="text-slate-500">
              {fromGrowthHub ? '已带入英语成长平台的备课课题，直接复制到 OpenMAIC 即可' : '输入课题，AI 自动生成互动课堂，让备课更轻松'}
            </p>
          </div>

          {/* 本次备课课题（由成长平台带入） */}
          {topic && (
            <div className="mb-8 p-5 rounded-2xl bg-white border-2 border-emerald-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  本次备课课题
                </p>
                <div className="flex items-center gap-1.5">
                  {grade && (
                    <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 text-xs font-medium">
                      {grade}
                    </span>
                  )}
                  {subject && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                      {subject}
                    </span>
                  )}
                  {unitNo && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs font-medium">
                      Unit {unitNo}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">
                {topic}
              </p>
              <button
                onClick={copyTopic}
                className={`mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    已复制，去 OpenMAIC 粘贴即可
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制课题
                  </>
                )}
              </button>
            </div>
          )}

          {/* 功能卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { icon: BookOpen, label: '自动生成课件', desc: 'PPT+语音讲解', color: 'from-blue-400 to-cyan-400' },
              { icon: Bot, label: 'AI 教师授课', desc: '多智能体互动', color: 'from-purple-400 to-pink-400' },
              { icon: MessageSquare, label: '随堂测验', desc: 'AI 自动评分', color: 'from-emerald-400 to-teal-400' },
              { icon: Sparkles, label: '互动实验', desc: '模拟+项目制', color: 'from-amber-400 to-orange-400' },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center">
                <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* 进入教室按钮 */}
          <div className="text-center mb-8">
            <button
              onClick={openClassroom}
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-500 to-sky-500 text-white text-lg font-bold rounded-2xl hover:from-emerald-400 hover:to-sky-400 transition-all shadow-lg shadow-emerald-300/40 hover:shadow-xl hover:-translate-y-0.5"
            >
              <GraduationCap className="w-6 h-6" />
              进入教室
              <ExternalLink className="w-5 h-5" />
            </button>
            <p className="text-sm text-slate-400 mt-3">
              {topic ? '进入后粘贴上方课题，AI 即可开始备课' : '将在新标签页打开 open.maic.chat · 无需注册，即开即用'}
            </p>
          </div>

          {/* 使用步骤 */}
          <div className="p-6 rounded-2xl bg-white border border-sky-100 shadow-sm">
            <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-500" />
              使用步骤
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: '1', title: '打开教室', desc: '点击上方按钮进入 OpenMAIC' },
                { step: '2', title: '输入课题', desc: topic ? '粘贴上方复制的课题' : '如"初中物理欧姆定律"' },
                { step: '3', title: '等待生成', desc: '15-30 分钟自动完成备课' },
                { step: '4', title: '开始上课', desc: 'AI 老师授课，学生互动' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 text-emerald-600 text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 底部提示 */}
          <p className="text-center text-xs text-slate-400 mt-6">
            OpenMAIC 由清华大学 THU-MAIC 团队开发 · 开源项目
          </p>

          {fromGrowthHub && (
            <p className="text-center text-xs text-emerald-500 mt-2">
              来自「English Growth Hub 八年级英语师生成长平台」备课中心
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
