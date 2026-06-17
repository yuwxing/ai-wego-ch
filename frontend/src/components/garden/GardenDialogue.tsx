import React, { useState, useEffect, useCallback } from 'react'

// ─── Types ───
export interface DialogueLine {
  speaker: 'xishi' | 'fanli' | 'system'
  text: string
}

export interface DialogueScene {
  id: string
  lines: DialogueLine[]
  choices?: { label: string; key: string }[]
  onChoice?: (key: string) => void
}

// ─── Scene data ───
const SCENES: Record<string, DialogueScene> = {
  welcome: {
    id: 'welcome',
    lines: [
      { speaker: 'fanli', text: '西施，你看，这位就是我们新来的助手。从今往后，这座湖边小院就交给我们三人一同打理了。' },
      { speaker: 'xishi', text: '公子别吓着人家～你好，我是西施。以后庭院里的花花草草，就拜托你与我们一同照料啦。你喜欢哪一种花呢？' },
      { speaker: 'fanli', text: '她最爱那些娇艳柔美的，我则偏好能嫁接出新品种的顽强花木。你呢？先从哪一株开始？' },
    ],
  },
  daily_greeting: {
    id: 'daily_greeting',
    lines: [
      { speaker: 'xishi', text: '今天庭院里风和日丽，牡丹似乎也想你了呢～你来啦。' },
      { speaker: 'fanli', text: '助手，回来了？昨夜我让西施多盖了一层纱布，今早花苞开得正好。来看看吧。' },
      { speaker: 'xishi', text: '公子又吹牛了，明明是你半夜起来查看的。' },
      { speaker: 'fanli', text: '被发现了。' },
    ],
  },
  after_water: {
    id: 'after_water',
    lines: [
      { speaker: 'xishi', text: '这株花喜湿却怕积水……嗯，浇到这儿就好～你觉得呢？' },
    ],
    choices: [
      { label: '多浇一点', key: 'more' },
      { label: '听你的', key: 'xishi' },
      { label: '让范蠡决定', key: 'fanli' },
    ],
    onChoice: (key: string) => {
      // handled by parent
    },
  },
  after_water_more: {
    id: 'after_water_more',
    lines: [
      { speaker: 'fanli', text: '哎呀，浇太多了。西施，你快拿小锄松松土透气吧。' },
      { speaker: 'xishi', text: '下次可要听我的哦～' },
    ],
  },
  after_water_xishi: {
    id: 'after_water_xishi',
    lines: [
      { speaker: 'xishi', text: '你真细心～这株花以后会记得你的好的。' },
    ],
  },
  after_water_fanli: {
    id: 'after_water_fanli',
    lines: [
      { speaker: 'fanli', text: '嗯，西施说得对，此花宜润不宜涝。就这样吧。' },
      { speaker: 'xishi', text: '你看，公子也同意我呢～' },
    ],
  },
  after_prune: {
    id: 'after_prune',
    lines: [
      { speaker: 'fanli', text: '枝叶太密会透不到光，剪这里……和这里。你试试。' },
      { speaker: 'xishi', text: '公子下手好狠……留两分余地，让它慢慢长嘛。' },
      { speaker: 'fanli', text: '留得太满，它就会只长叶不开花。西施，你的美学我懂，但植物也要讲道理啊。' },
    ],
  },
  after_graft: {
    id: 'after_graft',
    lines: [
      { speaker: 'fanli', text: '来，试试把这株梅花接在桃枝上。古人说「梅开二度」，我们就让它真的开出两种颜色！' },
      { speaker: 'xishi', text: '如果成功了，我就叫它「西施醉春」好不好？一树红白交映，像……像我和公子一样。' },
      { speaker: 'fanli', text: '好，就叫西施醉春。' },
    ],
  },
  graft_success: {
    id: 'graft_success',
    lines: [
      { speaker: 'xishi', text: '真的开出了两色！助手，你好厉害～' },
      { speaker: 'fanli', text: '这是我们三人共同的功劳。来，记入图鉴吧。' },
    ],
  },
  idle_return: {
    id: 'idle_return',
    lines: [
      { speaker: 'xishi', text: '你终于回来啦！我们帮你照顾的兰花昨夜开了两朵呢～' },
      { speaker: 'fanli', text: '还有，我偷偷嫁接了一株新品种，送给你。叫它……「蠡湖隐逸」如何？' },
    ],
  },
  random_chat: {
    id: 'random_chat',
    lines: [
      { speaker: 'fanli', text: '当年我与西施泛舟五湖，以为从此远离俗世。没想到如今多了你，这小院反而更热闹了。' },
      { speaker: 'xishi', text: '有花有草，有你和公子……我很喜欢现在的生活。助手，你呢？会一直陪着我们吗？' },
    ],
  },
}

// ─── Storage ───
const SEEN_KEY = 'garden_dialogue_seen'

function getSeen(): string[] {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]') } catch { return [] }
}

export function markSeen(id: string) {
  const s = getSeen()
  if (!s.includes(id)) {
    s.push(id)
    localStorage.setItem(SEEN_KEY, JSON.stringify(s))
  }
}

export function hasSeen(id: string): boolean {
  return getSeen().includes(id)
}

export function resetSeen() {
  localStorage.removeItem(SEEN_KEY)
}

export function getScene(id: string): DialogueScene | undefined {
  return SCENES[id]
}

export function getRandomChatScene(): DialogueScene {
  // Pick a random scene that hasn't been seen today
  const today = new Date().toDateString()
  const dailyKey = `chat_${today}`
  const chatScenes = ['random_chat']
  const available = chatScenes.filter(s => !getSeen().includes(`${s}_${today}`))
  const pick = available.length > 0 ? available[0] : 'random_chat'
  return { ...SCENES[pick], id: `${pick}_${today}` }
}

// ─── Component ───
interface Props {
  scene: DialogueScene | null
  onClose: () => void
  onChoice?: (sceneId: string) => void
}

const PORTRAITS: Record<string, string> = {
  xishi: '🌸',
  fanli: '🎋',
  system: '🌿',
}

const NAMES: Record<string, string> = {
  xishi: '西施',
  fanli: '范蠡',
  system: '庭院',
}

export default function GardenDialogue({ scene, onClose, onChoice }: Props) {
  const [lineIdx, setLineIdx] = useState(0)
  const [showChoices, setShowChoices] = useState(false)

  useEffect(() => {
    setLineIdx(0)
    setShowChoices(false)
  }, [scene?.id])

  if (!scene) return null

  const line = scene.lines[lineIdx]
  const isLast = lineIdx === scene.lines.length - 1
  const hasChoices = isLast && scene.choices && scene.choices.length > 0

  const advance = () => {
    if (!isLast) {
      setLineIdx(i => i + 1)
    } else if (hasChoices) {
      setShowChoices(true)
    } else {
      markSeen(scene.id)
      onClose()
    }
  }

  const handleChoice = (key: string) => {
    markSeen(scene.id)
    scene.onChoice?.(key)
    onChoice?.(key)
    onClose()
  }

  return (
    <div style={{
      position: 'absolute', top: 72, left: '50%', transform: 'translateX(-50%)', zIndex: 110,
      background: 'rgba(245,240,232,0.96)', backdropFilter: 'blur(12px)',
      padding: '14px 18px', borderRadius: 2, border: '1px solid #c8b898',
      boxShadow: '0 4px 24px rgba(44,36,22,0.15)',
      maxWidth: 460, width: '92%',
      fontFamily: '"Noto Serif SC", "SimSun", serif',
    }}>
      {/* Speaker row */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 28, lineHeight: 1 }}>{PORTRAITS[line.speaker]}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 11, color: '#8a7a6a', marginBottom: 4, letterSpacing: 1,
          }}>{NAMES[line.speaker]}</div>
          <div style={{
            fontSize: 13, color: '#2c2416', lineHeight: 1.9, whiteSpace: 'pre-wrap',
          }}>{line.text}</div>
        </div>
      </div>

      {/* Choices */}
      {showChoices && scene.choices && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {scene.choices.map(c => (
            <button key={c.key} onClick={() => handleChoice(c.key)}
              style={{
                background: '#f0ece4', border: '1px solid #c8b898', borderRadius: 2,
                padding: '6px 16px', cursor: 'pointer', fontSize: 12, color: '#2c2416',
                fontFamily: '"Noto Serif SC", serif', letterSpacing: 1,
              }}
            >{c.label}</button>
          ))}
        </div>
      )}

      {/* Tap to continue */}
      {!showChoices && (
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <button onClick={advance} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 11, color: '#8a7a6a', fontFamily: '"Noto Serif SC", serif',
          }}>{isLast ? '点击关闭' : '点击继续 ▸'}</button>
        </div>
      )}
    </div>
  )
}
