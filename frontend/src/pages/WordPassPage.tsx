import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Swords, Heart, Zap, BookOpen } from 'lucide-react'

const questions = [
  { q: "Don't j_______ the queue. You must wait for your t_______.", a: "jump; turn" },
  { q: "We should r_______ our thoughts by keeping a d_______ every day.", a: "record; diary" },
  { q: "Sam learnt that farming isn't easy and every g_______ comes from hard work.", a: "grain" },
  { q: "Could you take a m_______ for me? Tell him to call me b_______.", a: "message; back" },
  { q: "We must f_______ the school rules to keep our school in good o_______.", a: "follow; order" },
  { q: "Anna is s_______ at the beach because the weather is warm and sunny.", a: "sunbathing" },
  { q: "We should s_______ the forests and not buy things made of ivory.", a: "save" },
  { q: "Penguins can't fly, but they are excellent s_______ in the water.", a: "swimmers" },
  { q: "Drinking too many soft d_______ is a bad habit because they contain lots of sugar.", a: "drinks" },
  { q: "Doing sport can help us keep f_______ and stay healthy.", a: "fit" },
  { q: "People in Nairobi live side by s_______ with many wonderful animals.", a: "side" },
  { q: "The w_______ brought us the menu and asked what we would like to o_______.", a: "waiter; order" },
  { q: "We should eat more v_______ and fruit to keep healthy.", a: "vegetables" },
  { q: "Jane is making z_______ with Hao Yi for the Dragon Boat F_______.", a: "zongzi; Festival" },
  { q: "The two brothers l_______ to the emperor about the magic clothes.", a: "lied" },
  { q: "The weather can a_______ how we feel and what we do every day.", a: "affect" },
  { q: "Teng Fei gave the tourists wrong d_______, so he felt very bad about it.", a: "directions" },
  { q: "Fast food often has too much s_______ and f_______, which is bad for us.", a: "salt; fat" },
  { q: "Yaming plays ping-pong t_______ a week, and sometimes more.", a: "twice" },
  { q: "Skateboarding helps build team s_______ and makes us good friends.", a: "spirit" },
  { q: "Peter v_______ the science museum and saw a space e_______ last weekend.", a: "visited; exhibition" },
  { q: "We mustn't l_______. We have to keep our school clean and tidy.", a: "litter" },
  { q: "A b_______ meal means eating different kinds of food in proper amounts", a: "balanced" },
  { q: "Emma h_______ ever plays ping-pong because she is not good at it.", a: "hardly" },
  { q: "It's raining h_______, so you'd better take an umbrella with you.", a: "heavily" },
  { q: "Although the weather is bad, many tourists are still in high s_______.", a: "spirits" },
  { q: "The wastewater p_______ can make dirty water clean again through many s_______.", a: "plant; steps" },
  { q: "New York and Chongqing are in different time z_______, so the time is different.", a: "zones" },
  { q: "The boy was not a_______ to tell the t_______ in front of everyone.", a: "afraid; truth" },
  { q: "Elephants use their t_______ to pick up food and carry heavy things.", a: "trunks" },
  { q: "Please be p_______ and treat everyone with r_______.", a: "polite; respect" },
  { q: "What are you doing at the m_______? I'm reading a book.", a: "moment" },
  { q: "Practice makes p_______. Keep practising and you will improve.", a: "perfect" },
  { q: "In Stockholm, it's cold and s_______, and the temperature is below zero.", a: "snowy" },
  { q: "You must t_______ off your mobile phone in class.", a: "turn" },
  { q: "The g_______ has a very long neck, so it can eat leaves from tall trees.", a: "giraffe" },
  { q: "Alice feels a_______ because there are too many rules in her life.", a: "awful" },
  { q: "Don't be l_______ for school. You must arrive on t_______.", a: "late; time" },
  { q: "Sharks are very d_______, so many people are afraid of them.", a: "dangerous" },
  { q: "The mouse bit t_______ the net and s_______ the lion free.", a: "through; set" },
]

const questionsCn = [
  { q: "Fast food often has too much _______ (盐) and _______ (脂肪).", a: "salt; fat" },
  { q: "Peter _______ (参观) the science museum last weekend.", a: "visited" },
  { q: "Alice feels _______ (糟糕的) because there are too many rules.", a: "awful" },
  { q: "Could you take a _______ (口信) for me?", a: "message" },
  { q: "In Stockholm, it's cold and _______ (下雪的).", a: "snowy" },
  { q: "What are you doing at the _______ (此刻)?", a: "moment" },
  { q: "The weather can _______ (影响) how we feel.", a: "affect" },
  { q: "Emma _______ (几乎不) ever plays ping-pong.", a: "hardly" },
  { q: "The _______ (大象) is a symbol of good luck in Thailand.", a: "elephant" },
  { q: "Doing sport can help us keep _______ (健康的).", a: "fit" },
  { q: "You mustn't _______ (乱扔垃圾).", a: "litter" },
  { q: "Teng Fei gave the tourists wrong _______ (方向).", a: "directions" },
  { q: "Yaming plays ping-pong _______ (两次) a week.", a: "twice" },
  { q: "Wolves are _______ (危险的).", a: "dangerous" },
  { q: "You have to _______ (关掉) your mobile phone.", a: "turn off" },
  { q: "Many tourists are still in high _______ (情绪).", a: "spirits" },
  { q: "We should _______ (记录) our thoughts by keeping a diary.", a: "record" },
  { q: "Many people are _______ (匆忙) to get home from work.", a: "rushing" },
  { q: "The boy was not _______ (害怕的) to tell the truth.", a: "afraid" },
  { q: "A _______ (均衡的) meal means eating different kinds of food.", a: "balanced" },
  { q: "Practice makes _______ (完美的).", a: "perfect" },
  { q: "The wastewater _______ (工厂) can make dirty water clean again.", a: "plant" },
  { q: "We must _______ (遵循) the school rules.", a: "follow" },
  { q: "It's raining _______ (大量地).", a: "heavily" },
  { q: "The two brothers _______ (撒谎) to the emperor.", a: "lied" },
  { q: "The _______ (服务员) brought us the menu.", a: "waiter" },
  { q: "To everyone's _______ (惊讶), the duckling became a swan.", a: "surprise" },
  { q: "Don't be _______ (迟到) for school.", a: "late" },
  { q: "Anna is _______ (沐日光浴) at the beach.", a: "sunbathing" },
  { q: "The mouse bit _______ (穿过) the net.", a: "through" },
  { q: "We should eat more _______ (蔬菜) and fruit.", a: "vegetables" },
  { q: "We should _______ (拯救) the forests.", a: "save" },
  { q: "I think it's _______ (她的).", a: "hers" },
  { q: "Please be _______ (有礼貌的).", a: "polite" },
  { q: "Elephants can _______ (捡起) heavy things with their trunks.", a: "pick up" },
  { q: "New York and Chongqing are in different time _______ (时区).", a: "zones" },
  { q: "Every _______ (谷物) comes from hard work.", a: "grain" },
  { q: "The penguin is very _______ (可爱的).", a: "cute" },
  { q: "Jane is making _______ (粽子) for the Dragon Boat Festival.", a: "zongzi" },
  { q: "Eating too many _______ (甜的) things can cause tooth problems.", a: "sweet" },
]

const allQuestions = [...questions, ...questionsCn]

function normalize(a: string) {
  return a.toLowerCase().replace(/[;，]/g, ';').split(';').map(s => s.trim()).filter(Boolean).join('; ')
}

export default function WordPassPage() {
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [wrongList, setWrongList] = useState<string[]>([])
  const [hp, setHp] = useState(100)
  const [exp, setExp] = useState(0)
  const [level, setLevel] = useState(1)
  const [done, setDone] = useState(false)

  const q = allQuestions[index]
  if (!q) return null

  const handleSubmit = () => {
    const answer = input.trim()
    if (!answer) return

    const expected = normalize(q.a)
    const given = normalize(answer)
    if (given === expected) {
      setResult('correct')
      const newExp = exp + 10
      setExp(newExp)
      const newHp = Math.min(100, hp + 5)
      setHp(newHp)
      if (newExp >= level * 50) {
        setLevel(l => l + 1)
        setHp(100)
      }
    } else {
      setResult('wrong')
      setHp(h => Math.max(0, h - 15))
      setWrongList(w => [...w, q.q + ' → ' + q.a])
    }
  }

  const handleNext = () => {
    if (index + 1 >= allQuestions.length) {
      setDone(true)
      return
    }
    setIndex(i => i + 1)
    setInput('')
    setResult(null)
  }

  const handleRestart = () => {
    setIndex(0)
    setInput('')
    setResult(null)
    setWrongList([])
    setHp(100)
    setExp(0)
    setLevel(1)
    setDone(false)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-100 flex items-center justify-center">
            <Zap className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">挑战完成！</h2>
          <p className="text-slate-500 mb-4">你完成了全部 {allQuestions.length} 题</p>
          <div className="bg-slate-50 rounded-xl p-4 mb-4 text-left text-sm">
            <p className="font-semibold text-slate-700 mb-2">最终数据</p>
            <p className="text-slate-600">等级: Lv.{level}</p>
            <p className="text-slate-600">经验: {exp}</p>
            <p className="text-slate-600">错词: {wrongList.length} 个</p>
          </div>
          {wrongList.length > 0 && (
            <div className="bg-red-50 rounded-xl p-4 mb-4 text-left text-sm max-h-40 overflow-y-auto">
              <p className="font-semibold text-red-700 mb-1">错词本</p>
              {wrongList.map((w, i) => (
                <p key={i} className="text-red-600 text-xs mb-1">{i + 1}. {w}</p>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={handleRestart}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity">
              再来一次
            </button>
            <Link to="/learn"
              className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm text-center hover:bg-slate-200 transition-colors">
              返回学习
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link to="/learn" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> 返回
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1"><Heart className="w-4 h-4 text-red-400" /> {hp}</span>
            <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-amber-400" /> {exp}</span>
            <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">Lv.{level}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center">
              <Swords className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700">词汇训练营</p>
              <p className="text-xs text-slate-400">第 {index + 1} / {allQuestions.length} 题</p>
            </div>
            <span className="text-xs text-slate-400">
              {index < 40 ? '首字母' : '中文提示'}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-400 to-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${((index + 1) / allQuestions.length) * 100}%` }} />
          </div>
        </div>

        {/* HP Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500">HP</span>
            <span className="text-xs font-bold text-slate-600">{hp}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${hp}%`, background: hp > 50 ? '#22c55e' : hp > 25 ? '#f59e0b' : '#ef4444' }} />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-4">
          <p style={{ fontFamily: '"Times New Roman", serif', fontSize: 20, lineHeight: 2, color: '#1e293b', marginBottom: 4 }}>{q.q}</p>

          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="输入答案（多个词用分号隔开）"
            onKeyDown={e => { if (e.key === 'Enter' && !result) handleSubmit(); else if (e.key === 'Enter' && result) handleNext(); }}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-300 mt-4"
            autoFocus />

          {!result ? (
            <button onClick={handleSubmit}
              className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-indigo-200">
              提交
            </button>
          ) : (
            <button onClick={handleNext}
              className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-emerald-200">
              {index + 1 >= allQuestions.length ? '查看成绩' : '下一题'}
            </button>
          )}

          {result && (
            <div className={`mt-3 p-3 rounded-xl text-sm font-medium ${result === 'correct' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {result === 'correct' ? '✅ 正确！ +10经验' : `❌ 错误！正确答案：${q.a}`}
            </div>
          )}
        </div>

        {/* Wrong Words */}
        {wrongList.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">📕 错词本 ({wrongList.length})</p>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {wrongList.map((w, i) => (
                <p key={i} className="text-xs text-red-600 truncate">{i + 1}. {w}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
