import React, { useState, useCallback, useEffect, useRef } from 'react'
import TeacherScene from '../components/digital-teacher/TeacherScene'
import { TeacherAI } from '../components/digital-teacher/TeacherAI'
import { getTeacherMemory } from '../components/digital-teacher/TeacherMemory'
import { speak, listen } from '../components/digital-teacher/TeacherVoice'
import { TeachingWorkflow } from '../components/digital-teacher/TeacherWorkflow'
import TeachingBlackboard from '../components/digital-teacher/TeachingBlackboard'
import VirtualJoystick from '../components/digital-teacher/VirtualJoystick'

type State = 'IDLE' | 'LISTENING' | 'THINKING' | 'TALKING' | 'TEACHING'
const STATE_LABEL: Record<State, string> = {
  IDLE: '待机', LISTENING: '聆听中', THINKING: '思考中', TALKING: '说话中', TEACHING: '教学中',
}

const TEACHING_TOPICS = [
  '定语从句',
  '虚拟语气',
  '被动语态',
  '现在完成时',
  '阅读理解技巧',
  '作文结构分析',
]

export default function DigitalTeacherPage() {
  const [state, setState] = useState<State>('IDLE')
  const [mode, setMode] = useState<'idle' | 'walk' | 'talk'>('idle')
  const [walkDir, setWalkDir] = useState<[number, number]>([0, 0])
  const teacherAIRef = useRef(new TeacherAI())
  const memoryRef = useRef(getTeacherMemory())
  const workflowRef = useRef(new TeachingWorkflow(teacherAIRef.current))
  const [messages, setMessages] = useState<{ text: string; user: boolean }[]>([
    { text: '同学们好，我是你的等距小教师。点击麦克风或输入问题。', user: false },
  ])
  const [input, setInput] = useState('')
  const [topic, setTopic] = useState('')
  const [blackboardContent, setBlackboardContent] = useState('')
  const keysRef = useRef<Set<string>>(new Set())
  const msgEndRef = useRef<HTMLDivElement>(null)
  const joystickDirRef = useRef<[number, number]>([0, 0])

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => keysRef.current.add(e.key.toLowerCase())
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase())
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  // Walk direction from keys + joystick
  useEffect(() => {
    const interval = setInterval(() => {
      const jd = joystickDirRef.current
      const k = keysRef.current
      let fx = jd[0], fz = jd[1]
      if (k.has('w') || k.has('arrowup')) fz = -1
      if (k.has('s') || k.has('arrowdown')) fz = 1
      if (k.has('a') || k.has('arrowleft')) fx = -1
      if (k.has('d') || k.has('arrowright')) fx = 1
      setWalkDir([fx, fz])
      if ((fx !== 0 || fz !== 0) && mode === 'idle') setMode('walk')
      if (fx === 0 && fz === 0 && mode === 'walk') setMode('idle')
    }, 50)
    return () => clearInterval(interval)
  }, [mode])

  const handleJoystick = useCallback((dir: [number, number]) => {
    joystickDirRef.current = dir
  }, [])

  // ── AI message send ──
  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { text, user: true }])
    setState('THINKING')
    setInput('')
    setMode('talk')

    try {
      const ai = teacherAIRef.current
      memoryRef.current.add('interaction', `学生问: ${text}`)
      const reply = await ai.send(text)
      if (reply) {
        memoryRef.current.add('interaction', `教师答: ${reply.slice(0, 100)}`)
        setState('TALKING')
        setMessages(prev => [...prev, { text: reply, user: false }])
        speak(reply).then(() => setState('IDLE'))
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { text: `⚠️ ${err.message}`, user: false }])
    }
    setMode('idle')
  }, [])

  // ── Voice input ──
  const handleVoice = useCallback(async () => {
    setState('LISTENING')
    try {
      const text = await listen()
      handleSend(text)
    } catch {
      setState('IDLE')
    }
  }, [handleSend])

  // ── Teaching mode ──
  const startTeaching = useCallback(async () => {
    if (!topic) return
    setState('TEACHING')
    setMode('talk')
    memoryRef.current.add('lesson', `开始讲解主题: ${topic}`)
    setMessages(prev => [...prev, { text: `📚 开始讲解「${topic}」...`, user: false }])
    const lesson = await workflowRef.current.createLesson(topic)
    if (lesson) {
      const step = lesson.steps[0]
      setMessages(prev => [...prev, { text: `📖 ${step.title}\n${step.content.slice(0, 200)}`, user: false }])
      setBlackboardContent(`${lesson.topic}\n\n${step.title}\n${step.content}`)
      await speak(step.content.slice(0, 150))
    }
    setState('IDLE')
    setMode('idle')
  }, [topic])

  // ── Lesson step navigation ──
  const nextStep = useCallback(() => {
    const step = workflowRef.current.nextStep()
    if (step) {
      const lesson = workflowRef.current.getCurrentLesson()
      setBlackboardContent(`${lesson?.topic}\n\n${step.title}\n${step.content}`)
      setMessages(prev => [...prev, { text: `📖 ${step.title}\n${step.content.slice(0, 200)}`, user: false }])
      speak(step.content.slice(0, 150))
    } else {
      setBlackboardContent('✅ 本节课到这里，有问题可以提问！')
    }
  }, [])

  const prevStep = useCallback(() => {
    const step = workflowRef.current.prevStep()
    if (step) {
      const lesson = workflowRef.current.getCurrentLesson()
      setBlackboardContent(`${lesson?.topic}\n\n${step.title}\n${step.content}`)
    }
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#0a0a12' }}>
      {/* 3D Scene */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <TeacherScene mode={mode} walkDir={walkDir} blackboard={blackboardContent} />
      </div>

      {/* Mobile joystick */}
      <VirtualJoystick onMove={handleJoystick} />

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(19,19,26,0.88)', backdropFilter: 'blur(12px)',
        padding: '10px 24px', borderRadius: 16, border: '1px solid #4a4a8a',
        display: 'flex', gap: 16, alignItems: 'center', zIndex: 100,
      }}>
        <span>🎮</span>
        <b style={{ color: '#e2e8f0' }}>等距小教师</b>
        <span style={{ color: '#a78bfa', fontSize: 13 }} id="stateLabel">{STATE_LABEL[state]}</span>
        <button onClick={handleVoice} style={{
          background: '#7c3aed', border: 'none', color: 'white', padding: '4px 14px',
          borderRadius: 8, cursor: 'pointer', fontSize: 14,
        }}>🎤 语音</button>
      </div>

      {/* Teaching toolbar */}
      <div style={{
        position: 'absolute', top: 80, left: 20, zIndex: 100,
        background: 'rgba(19,19,26,0.88)', backdropFilter: 'blur(12px)',
        padding: 12, borderRadius: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <select value={topic} onChange={e => setTopic(e.target.value)}
          style={{ background: '#252540', color: '#e2e8f0', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 12 }}>
          <option value="">选择讲解主题</option>
          {TEACHING_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={startTeaching} disabled={!topic}
          style={{
            background: topic ? '#7c3aed' : '#252540', border: 'none', color: 'white',
            padding: '6px 14px', borderRadius: 6, cursor: topic ? 'pointer' : 'default', fontSize: 12,
          }}>开始教学</button>
        {workflowRef.current.getCurrentLesson() && workflowRef.current.getCurrentStep() >= 0 && (
          <>
            <button onClick={prevStep}
              style={{ background: '#252540', border: 'none', color: '#c4b5fd', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
              ◀ 上一步
            </button>
            <button onClick={nextStep}
              style={{ background: '#7c3aed', border: 'none', color: 'white', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
              下一步 ▶
            </button>
          </>
        )}
      </div>

      {/* Hints */}
      <div style={{
        position: 'absolute', bottom: 240, left: 20, zIndex: 80,
        color: '#94a3b8', fontSize: 11,
      }}>
        WASD/摇杆移动 · 🎤 语音对话
      </div>

      {/* Chat panel */}
      <div style={{
        position: 'absolute', bottom: 20, left: 20, right: 20, height: 220, zIndex: 100,
        background: 'rgba(19,19,26,0.88)', backdropFilter: 'blur(12px)',
        borderRadius: 16, border: '1px solid #252540', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px', fontSize: 13, lineHeight: 1.6 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ margin: '4px 0', textAlign: msg.user ? 'right' : 'left' }}>
              <span style={{
                background: msg.user ? '#7c3aed' : '#334155',
                padding: '8px 12px', borderRadius: 10,
                display: 'inline-block', maxWidth: '75%',
                color: '#e2e8f0',
              }}>{msg.text}</span>
            </div>
          ))}
          {state === 'THINKING' && (
            <div style={{ color: '#94a3b8', fontSize: 12, margin: 4 }}>思考中...</div>
          )}
          <div ref={msgEndRef} />
        </div>
        <div style={{ display: 'flex', padding: '10px 12px', gap: 8, background: '#1a1a2e' }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(input)}
            placeholder="输入问题..."
            style={{
              flex: 1, background: '#252540', border: 'none', borderRadius: 10,
              padding: '10px 14px', color: '#e2e8f0', outline: 'none', fontSize: 13,
            }}
          />
          <button onClick={() => handleSend(input)}
            style={{ background: '#7c3aed', border: 'none', color: 'white', padding: '0 20px', borderRadius: 10, cursor: 'pointer' }}>
            发送
          </button>
        </div>
      </div>
    </div>
  )
}
