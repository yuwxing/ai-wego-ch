import { useState, useCallback } from 'react'

const STORIES = [
  {
    emoji: '🙋', title: '举手挑战',
    lines: [
      '老师刚写完题目，全班安静下来。',
      '我知道答案，但手举到一半又想放下。',
      '"试试看。"\n老师的话让我鼓起勇气。',
      '虽然回答得不算完美，但老师说：\n"敢表达，就是今天最大的收获。"',
    ],
  },
  {
    emoji: '🔍', title: '错题寻宝',
    lines: [
      '数学课上，我的答案和大家都不一样。',
      '本以为会被批评，结果老师把我的解题过程投到大屏幕上。',
      '"大家找找，错误藏在哪里？"',
      '几分钟后，全班一起发现了问题。',
      '原来错题不是失败，而是藏着知识的宝藏。',
    ],
  },
  {
    emoji: '🕵️', title: '三分钟侦探',
    lines: [
      '历史课开始前，老师展示了一张老照片。',
      '"猜猜这是哪个时代？"',
      '全班瞬间变成小侦探。\n有人观察服饰，有人分析建筑。',
      '答案揭晓时，大家兴奋得像破了案一样。',
      '原来学习也能像探险。',
    ],
  },
  {
    emoji: '🧩', title: '最后一块拼图',
    lines: [
      '小组讨论时，大家已经想出了很多观点。\n可总觉得少了点什么。',
      '我突然想到课本里的一个例子，小声说了出来。',
      '全组眼睛一亮。\n"对！就是这个！"',
      '那一刻，我像找到了拼图的最后一块。',
    ],
  },
  {
    emoji: '🍀', title: '幸运数字',
    lines: [
      '英语课上，老师随机抽学号回答问题。',
      '数字越来越接近我。\n心跳越来越快。',
      '结果真抽到了。\n我深吸一口气完成回答。',
      '回到座位时才发现：\n原来自己比想象中勇敢。',
    ],
  },
  {
    emoji: '🛡️', title: '黑板守卫战',
    lines: [
      '老师在黑板上留下一个难题。\n谁能解出来，谁就守住"学霸擂台"。',
      '几个同学轮流挑战。',
      '最后我找到了关键步骤。',
      '当答案写完整时，全班响起掌声。\n努力思考的感觉，比赢游戏还开心。',
    ],
  },
  {
    emoji: '📝', title: '一百分之外',
    lines: [
      '考试卷发下来。\n我没有拿到最高分。\n本来有些失落。',
      '可老师指着我的作文说：\n"这次的思考特别有深度。"',
      '我突然明白：\n成绩重要，成长也重要。',
    ],
  },
  {
    emoji: '🗣️', title: '接力发言',
    lines: [
      '课堂讨论开始。',
      '第一位同学分享观点。\n第二位补充证据。',
      '轮到我时，我接上新的想法。',
      '一个人的火花，变成了一群人的光亮。\n原来合作能让答案更精彩。',
    ],
  },
  {
    emoji: '⏱️', title: '倒计时挑战',
    lines: [
      '离下课还有五分钟。',
      '老师发出终极任务：\n"谁能找到最快解法？"',
      '全班进入冲刺模式。',
      '时间结束时，我成功完成。\n不是因为我最快，而是因为我坚持到了最后。',
    ],
  },
  {
    emoji: '🌱', title: '给未来的自己',
    lines: [
      '班会课上，老师让大家写一句话给未来的自己。',
      '我写下：\n"希望你永远保持好奇心。"',
      '折好纸条放进信封时，我觉得自己好像种下了一颗种子。',
      '等待未来发芽。',
    ],
  },
  {
    emoji: '🤝', title: '交换答案',
    lines: [
      '老师让同桌互改练习。',
      '看到同桌工整的步骤，我学到了新的方法。',
      '看到自己的思路被认可，我也很开心。',
      '原来学习不是比赛。\n而是彼此照亮。',
    ],
  },
  {
    emoji: '🏆', title: '安静冠军',
    lines: [
      '自习课上，没有人说话。\n窗外的风吹动树叶。',
      '我专注完成了一道一直不会的题。',
      '没有掌声，没有奖励。',
      '但那种专注后的满足感，让我悄悄给自己点了个赞。',
    ],
  },
  {
    emoji: '💪', title: '勇气加一分',
    lines: [
      '演讲课上，我站到讲台前。\n手心有点出汗。',
      '声音开始还有些发抖。',
      '可当我说完最后一句话时，全班都在认真听。',
      '走下讲台的时候，我感觉自己的勇气值加了一分。',
    ],
  },
  {
    emoji: '🔬', title: '今天的最佳发现',
    lines: [
      '科学课实验失败了三次。',
      '第四次时，我发现原来是一个步骤顺序错了。',
      '实验成功的瞬间，全组欢呼起来。',
      '老师笑着说：\n"科学就是不断发现的过程。"',
      '今天最宝贵的，不是结果，而是发现。',
    ],
  },
  {
    emoji: '🔔', title: '下课铃响之前',
    lines: [
      '离下课只剩一分钟。\n老师问：\n"今天你学到的最重要的一件事是什么？"',
      '有人说知识点。\n有人说解题方法。',
      '我写下：\n"原来很多事情，只要愿意尝试，就比想象中容易。"',
      '铃声响起。\n新的一天，又多了一点成长。',
    ],
  },
]

export default function GrowthStories({ onBack }: { onBack: () => void }) {
  const [storyIdx, setStoryIdx] = useState(0)
  const [lineIdx, setLineIdx] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)
  const [finished, setFinished] = useState(false)

  const story = STORIES[storyIdx]

  const advance = useCallback(() => {
    if (!story) return
    if (lineIdx < story.lines.length - 1) {
      setFadeIn(false)
      setTimeout(() => { setLineIdx(i => i + 1); setFadeIn(true) }, 80)
    } else if (storyIdx < STORIES.length - 1) {
      setFadeIn(false)
      setTimeout(() => {
        setStoryIdx(i => i + 1)
        setLineIdx(0)
        setFadeIn(true)
      }, 80)
    } else {
      setFinished(true)
    }
  }, [storyIdx, lineIdx, story])

  if (finished) {
    return (
      <div style={{
        width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%)',
        color: '#e0d8c8', fontFamily: '"Noto Serif SC", serif', padding: 20,
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
        <p style={{ color: '#c8b898', fontSize: 16, marginBottom: 20, textAlign: 'center' }}>
          15个成长故事
        </p>
        <p style={{ color: '#555', fontSize: 13, lineHeight: 2.2, textAlign: 'center', maxWidth: 360 }}>
          每一件课堂里的小事，<br />都是成长路上的光。
        </p>
        <button onClick={onBack} style={{
          marginTop: 32, background: '#222', border: '1px solid #333', color: '#888',
          padding: '10px 32px', borderRadius: 4, cursor: 'pointer', fontSize: 13,
          fontFamily: '"Noto Serif SC", serif',
        }}>返回</button>
      </div>
    )
  }

  const totalLines = STORIES.reduce((s, st) => s + st.lines.length, 0)
  const doneLines = STORIES.slice(0, storyIdx).reduce((s, st) => s + st.lines.length, 0) + lineIdx + 1

  return (
    <div style={{
      width: '100vw', height: '100vh', position: 'relative',
      background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%)',
      fontFamily: '"Noto Serif SC", serif', color: '#e0d8c8',
      cursor: fadeIn ? 'pointer' : 'default',
    }} onClick={() => { if (fadeIn) advance() }}>
      {/* Top bar */}
      <div style={{
        padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%)',
        zIndex: 10,
      }}>
        <button onClick={(e) => { e.stopPropagation(); onBack() }}
          style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 12 }}>
          ← 退出
        </button>
        <span style={{ fontSize: 11, color: '#555' }}>
          {storyIdx + 1} / {STORIES.length}
        </span>
      </div>

      {/* Progress */}
      <div style={{ width: '100%', height: 2, background: '#1a1a1a' }}>
        <div style={{
          width: `${(doneLines / totalLines) * 100}%`, height: '100%',
          background: 'linear-gradient(90deg, #ffab40, #4fc3f7)',
          transition: 'width 0.3s',
        }} />
      </div>

      {/* Content */}
      <div style={{
        height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '30px 24px',
      }}>
        <div style={{
          maxWidth: 400, width: '100%',
          transition: 'opacity 0.15s', opacity: fadeIn ? 1 : 0,
        }}>
          {/* Story header */}
          {lineIdx === 0 && (
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{story.emoji}</div>
              <h2 style={{
                fontSize: 22, color: '#f0e8d8', fontWeight: 400, letterSpacing: 2, margin: 0,
              }}>{story.title}</h2>
            </div>
          )}

          {/* Current line */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '24px 28px',
          }}>
            <p style={{
              fontSize: 15, lineHeight: 2.4, color: '#c8b898',
              whiteSpace: 'pre-wrap', margin: 0,
            }}>{story.lines[lineIdx]}</p>
          </div>
        </div>
      </div>

      {/* Click hint */}
      {fadeIn && (
        <div style={{
          position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
          color: '#444', fontSize: 11, zIndex: 50,
        }}>点击继续 ▸</div>
      )}

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
        background: 'linear-gradient(0deg, rgba(13,13,13,1) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 40,
      }} />
    </div>
  )
}
