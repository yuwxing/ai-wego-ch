import { useState } from 'react'
import { ArrowLeft, ArrowUpRight, BookOpen, Compass, Trophy } from 'lucide-react'

interface UnitGame {
  id: string
  file: string
  unit: string
  title: string
  subtitle: string
  emoji: string
}

interface Grade {
  grade: string
  label: string
  gradient: string
  desc: string
  games: UnitGame[]
}

const GRADES: Grade[] = [
  {
    grade: 's7',
    label: '人教版七年级上册',
    gradient: 'from-emerald-400 to-teal-500',
    desc: '7 个单元 · 自我介绍 / 家庭 / 校园 / 爱好 / 日常生活',
    games: [
      { id: 's7-u1', file: 's7-u1-you-and-me.html', unit: 'Unit 1', title: 'You and Me', subtitle: '自我介绍 · 交朋友用语', emoji: '👋' },
      { id: 's7-u2', file: 's7-u2-were-family.html', unit: 'Unit 2', title: "We're Family", subtitle: '家庭关系 · 大富翁问答', emoji: '👨‍👩‍👧‍👦' },
      { id: 's7-u3', file: 's7-u3-my-school.html', unit: 'Unit 3', title: 'My School', subtitle: '校园场所 · 地图探索', emoji: '🏫' },
      { id: 's7-u4', file: 's7-u4-favourite-subject.html', unit: 'Unit 4', title: 'My Favourite Subject', subtitle: '学科表达 · 拼句挑战', emoji: '📚' },
      { id: 's7-u5-soccer', file: 's7-u5-soccer-ball.html', unit: 'Unit 5', title: 'Do You Have a Soccer Ball?', subtitle: '球类运动 · 闯关答题', emoji: '⚽' },
      { id: 's7-u5-clubs', file: 's7-u5-fun-clubs.html', unit: 'Unit 5', title: 'Fun Clubs', subtitle: '社团活动 · 连线配对', emoji: '🎭' },
      { id: 's7-u6', file: 's7-u6-a-day-in-the-life.html', unit: 'Unit 6', title: 'A Day in the Life', subtitle: '作息时间 · 时间线排序', emoji: '⏰' },
      { id: 's7-u7', file: 's7-u7-happy-birthday.html', unit: 'Unit 7', title: 'Happy Birthday', subtitle: '日期月份 · 日历问答', emoji: '🎂' },
    ],
  },
  {
    grade: 's8',
    label: '人教版八年级上册',
    gradient: 'from-sky-400 to-blue-500',
    desc: '8 个单元 · 假日 / 社区 / 比较 / 自然 / 饮食 / 未来',
    games: [
      { id: 's8-u1', file: 's8-u1-happy-holiday.html', unit: 'Unit 1', title: 'Happy Holiday', subtitle: '旅行日记 · 情景选择', emoji: '✈️' },
      { id: 's8-u2', file: 's8-u2-home-sweet-home.html', unit: 'Unit 2', title: 'Home Sweet Home', subtitle: '我的街区 · 方位介词', emoji: '🏠' },
      { id: 's8-u3', file: 's8-u3-same-or-different.html', unit: 'Unit 3', title: 'Same or Different', subtitle: '比较级最高级 · 对比问答', emoji: '⚖️' },
      { id: 's8-u4', file: 's8-u4-amazing-plants-animals.html', unit: 'Unit 4', title: 'Amazing Plants and Animals', subtitle: '自然世界 · 笔记选择', emoji: '🌳' },
      { id: 's8-u5', file: 's8-u5-delicious-meal.html', unit: 'Unit 5', title: "What a Delicious Meal", subtitle: '烹饪美食 · 步骤排序', emoji: '🍜' },
      { id: 's8-u6', file: 's8-u6-plan-for-yourself.html', unit: 'Unit 6', title: 'Plan for Yourself', subtitle: '未来规划 · 计划选择', emoji: '🚀' },
      { id: 's8-u7', file: 's8-u7-when-tomorrow-comes.html', unit: 'Unit 7', title: 'When Tomorrow Comes', subtitle: '时态运用 · 选择题', emoji: '🌅' },
      { id: 's8-u8', file: 's8-u8-lets-communicate.html', unit: 'Unit 8', title: "Let's Communicate", subtitle: '日常沟通 · 场景选择', emoji: '💬' },
    ],
  },
]

export default function TextbookGamesPage() {
  const [active, setActive] = useState<string | null>(null)

  const playGame = (g: UnitGame) => {
    setActive(g.id)
  }

  if (active) {
    const current = GRADES.flatMap(g => g.games).find(g => g.id === active)!
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white/95 border-b border-slate-200 z-10">
          <button
            onClick={() => setActive(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 返回游戏列表
          </button>
          <span className="text-sm text-slate-500">{current.emoji} {current.title} · {current.subtitle}</span>
          <a
            href={`/textbook/${current.file}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            新窗口打开 <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
        <iframe
          src={`/textbook/${current.file}`}
          className="flex-1 w-full bg-white"
          title={current.title}
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white shadow-xl shadow-emerald-100 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium mb-4 backdrop-blur">
            <BookOpen className="w-4 h-4" /> 人教版课本游戏
          </div>
          <h1 className="text-3xl font-extrabold mb-2">边玩游戏，边学课本</h1>
          <p className="text-emerald-50 text-sm md:text-base max-w-2xl">
            覆盖七上、八上全部单元，每课一个互动游戏：乐高配对、大富翁问答、地图探索、情景选择……
            点击卡片即可全屏开玩。
          </p>
        </div>

        {/* Grade sections */}
        {GRADES.map(grade => (
          <div key={grade.grade} className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grade.gradient} flex items-center justify-center text-white shadow-md`}>
                {grade.grade === 's7' ? <Compass className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 leading-tight">{grade.label}</h2>
                <p className="text-xs text-slate-400">{grade.desc}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {grade.games.map(g => (
                <button
                  key={g.id}
                  onClick={() => playGame(g)}
                  className="group text-left bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${grade.gradient} opacity-60`} />
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{g.emoji}</div>
                  <p className="text-[11px] text-emerald-500 font-bold mb-0.5">{g.unit}</p>
                  <h3 className="font-bold text-slate-800 text-sm leading-snug mb-1">{g.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{g.subtitle}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    开始游戏 <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Footer note */}
        <div className="text-center text-xs text-slate-400 pb-8">
          题目内容与单元标题来自人教版（2024）英语教材 · 与 ai-wego 游戏嘉年华共享
        </div>
      </div>
    </div>
  )
}
