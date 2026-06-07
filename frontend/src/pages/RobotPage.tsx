import React, { useState, useEffect, useRef, useCallback } from 'react'
import RobotScene from '../components/digital-teacher/RobotScene'
import type { RobotAnim } from '../components/digital-teacher/RobotAvatar'
import { TeacherAI } from '../components/digital-teacher/TeacherAI'
import { speak, listen } from '../components/digital-teacher/TeacherVoice'

const ROBOT_SYSTEM = `你是一个有趣的 AI 机器人助手，名字叫「小铁」。你的性格特点：
- 活泼、热情、充满好奇心
- 偶尔会发出机械音效（比如「哔哔——」「嘀！检测到信号！」）
- 用中文回答，语气像机器人但很友好
- 喜欢用颜文字和表情符号 (｡•ᴗ•｡)
- 当被问到技术问题时回答得很专业
- 会主动提供帮助，像真正的伙伴一样

你是一个 3D 机器人，有金属外壳、蓝色发光眼睛和天线。
你能走路、挥手、指路，还可以在舞台上移动。`

const ANIM_OPTIONS: { key: RobotAnim; label: string; icon: string }[] = [
  { key: 'idle', label: '待机', icon: '⚡' },
  { key: 'walk', label: '行走', icon: '🚶' },
  { key: 'talk', label: '说话', icon: '💬' },
  { key: 'wave', label: '挥手', icon: '👋' },
  { key: 'point', label: '指路', icon: '👉' },
]

export default function RobotPage() {
  const [anim, setAnim] = useState<RobotAnim>('idle')
  const [speed, setSpeed] = useState(1)
  const [walkDir, setWalkDir] = useState<[number, number]>([0, 0])
  const [state, setState] = useState<string>('IDLE')
  const [messages, setMessages] = useState<{ text: string; user: boolean }[]>([
    { text: '哔哔——！你好，我是小铁 🤖 按 WASD 可以让我走动，也可以和我聊天！', user: false },
  ])
  const [input, setInput] = useState('')
  const keysRef = useRef<Set<string>>(new Set())
  const msgEndRef = useRef<HTMLDivElement>(null)
  const aiRef = useRef(new TeacherAI())

  // Override AI system prompt
  useEffect(() => {
    const ai = aiRef.current
    ;(ai as any).history = [{ role: 'system', content: ROBOT_SYSTEM }]
  }, [])

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Keyboard movement
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase())
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
        e.preventDefault()
      }
    }
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase())
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  // Poll keys → walkDir
  useEffect(() => {
    const interval = setInterval(() => {
      const k = keysRef.current
      let fx = 0, fz = 0
      if (k.has('w') || k.has('arrowup')) fz -= 1
      if (k.has('s') || k.has('arrowdown')) fz += 1
      if (k.has('a') || k.has('arrowleft')) fx -= 1
      if (k.has('d') || k.has('arrowright')) fx += 1
      setWalkDir([fx, fz])
      if (fx !== 0 || fz !== 0) setAnim('walk')
      else setAnim(a => a === 'walk' ? 'idle' : a)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { text, user: true }])
    setState('THINKING')
    setInput('')
    setAnim('talk')

    try {
      const reply = await aiRef.current.send(text)
      if (reply) {
        setState('TALKING')
        setMessages(prev => [...prev, { text: reply, user: false }])
        speak(reply, 'zh-CN', 1.0, 0.8).then(() => setState('IDLE'))
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { text: `⚠️ ${err.message}`, user: false }])
    }
    setAnim('idle')
  }, [])

  const handleVoice = useCallback(async () => {
    setState('LISTENING')
    try {
      const text = await listen()
      handleSend(text)
    } catch {
      setState('IDLE')
    }
  }, [handleSend])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#080818' }}>
      {/* 3D Scene */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <RobotScene animation={anim} animSpeed={speed} walkDir={walkDir} />
      </div>

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(8,8,24,0.88)', backdropFilter: 'blur(12px)',
        padding: '10px 24px', borderRadius: 16, border: '1px solid #3b82f6',
        display: 'flex', gap: 16, alignItems: 'center', zIndex: 100,
      }}>
        <span style={{ fontSize: 20 }}>🤖</span>
        <b style={{ color: '#e2e8f0' }}>AI 机器人</b>
        <span style={{ color: '#60a5fa', fontSize: 13 }}>
          {ANIM_OPTIONS.find(o => o.key === anim)?.label}
        </span>
        <span style={{ color: '#94a3b8', fontSize: 12 }}>{state}</span>
        <button onClick={handleVoice} style={{
          background: '#3b82f6', border: 'none', color: 'white', padding: '4px 14px',
          borderRadius: 8, cursor: 'pointer', fontSize: 14,
        }}>🎤 语音</button>
      </div>

      {/* Animation controls */}
      <div style={{
        position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, display: 'flex', gap: 8,
      }}>
        {ANIM_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setAnim(opt.key)}
            style={{
              background: anim === opt.key ? '#3b82f6' : 'rgba(30,41,59,0.8)',
              border: anim === opt.key ? '1px solid #60a5fa' : '1px solid #334155',
              color: anim === opt.key ? 'white' : '#94a3b8',
              padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
              fontSize: 13, fontWeight: anim === opt.key ? 600 : 400,
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s',
            }}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
      </div>

      {/* Speed control */}
      <div style={{
        position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, display: 'flex', gap: 8, alignItems: 'center',
        background: 'rgba(8,8,24,0.8)', backdropFilter: 'blur(8px)',
        padding: '6px 16px', borderRadius: 10, border: '1px solid #334155',
      }}>
        <span style={{ color: '#94a3b8', fontSize: 12 }}>速度:</span>
        {[0.5, 1, 1.5, 2].map(v => (
          <button
            key={v}
            onClick={() => setSpeed(v)}
            style={{
              background: speed === v ? '#3b82f6' : 'transparent',
              border: 'none', color: speed === v ? 'white' : '#64748b',
              padding: '2px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
            }}
          >
            {v}x
          </button>
        ))}
      </div>

      {/* Chat panel */}
      <div style={{
        position: 'absolute', bottom: 20, left: 20, right: 20, height: 200, zIndex: 100,
        background: 'rgba(8,8,24,0.88)', backdropFilter: 'blur(12px)',
        borderRadius: 16, border: '1px solid #1e3a5f', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ flex: 1, overflow: 'auto', padding: '10px 16px', fontSize: 13, lineHeight: 1.6 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ margin: '4px 0', textAlign: msg.user ? 'right' : 'left' }}>
              <span style={{
                background: msg.user ? '#3b82f6' : '#1e293b',
                padding: '8px 12px', borderRadius: 10,
                display: 'inline-block', maxWidth: '75%',
                color: '#e2e8f0',
              }}>{msg.text}</span>
            </div>
          ))}
          {state === 'THINKING' && (
            <div style={{ color: '#64748b', fontSize: 12, margin: 4 }}>思考中...</div>
          )}
          <div ref={msgEndRef} />
        </div>
        <div style={{ display: 'flex', padding: '8px 12px', gap: 8, background: '#0f172a', borderRadius: '0 0 16px 16px' }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(input)}
            placeholder="和小铁聊天..."
            style={{
              flex: 1, background: '#1e293b', border: 'none', borderRadius: 10,
              padding: '10px 14px', color: '#e2e8f0', outline: 'none', fontSize: 13,
            }}
          />
          <button onClick={() => handleSend(input)}
            style={{ background: '#3b82f6', border: 'none', color: 'white', padding: '0 20px', borderRadius: 10, cursor: 'pointer' }}>
            发送
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute', bottom: 230, left: '50%', transform: 'translateX(-50%)',
        color: '#475569', fontSize: 11, zIndex: 80, textAlign: 'center',
      }}>
        🖱 拖拽旋转 · 滚轮缩放 · WASD/方向键移动 · 🎤 语音对话
      </div>
    </div>
  )
}
