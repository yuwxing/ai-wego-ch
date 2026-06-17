import React, { useState, useCallback, useEffect, useRef } from 'react'
import TeacherScene from '../components/digital-teacher/TeacherScene'
import GrammarDanmaku from '../components/digital-teacher/GrammarDanmaku'
import GrammarPanels from '../components/digital-teacher/GrammarPanels'
import VirtualJoystick from '../components/digital-teacher/VirtualJoystick'
import NatureSounds from '../components/digital-teacher/NatureSounds'
import { sendToDeepSeekSync, getApiKey, getSharedApiKey } from '../utils/deepseek'
import { Loader2, X, Send, AlertTriangle } from 'lucide-react'

const COLORS = ['#a78bfa', '#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#fb923c', '#22d3ee']

const FALLBACK_DANMAKU: Record<string, { text: string; color: string }[]> = {
  default: [
    { text: '💡 名词单复数要分清', color: '#60a5fa' },
    { text: '💬 动词时态是核心', color: '#a78bfa' },
    { text: '📌 形容词比较级 -er/-est', color: '#34d399' },
    { text: '⭐ 被动语态 be+done', color: '#f472b6' },
    { text: '💬 定语从句 who/which/that', color: '#fbbf24' },
    { text: '📌 宾语从句陈述语序', color: '#fb923c' },
    { text: '💡 条件状语从句主将从现', color: '#22d3ee' },
    { text: '⭐ 现在完成时 have/has+done', color: '#a78bfa' },
    { text: '💬 不定式 to do 作目的状语', color: '#60a5fa' },
    { text: '📌 动名词作主语谓语用单数', color: '#34d399' },
  ],
}

export default function DigitalTeacherPage() {
  const [mode, setMode] = useState<'idle' | 'walk' | 'talk'>('idle')
  const [walkDir, setWalkDir] = useState<[number, number]>([0, 0])
  const keysRef = useRef<Set<string>>(new Set())
  const joystickDirRef = useRef<[number, number]>([0, 0])
  const [showTopicInput, setShowTopicInput] = useState(false)
  const [topic, setTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [danmakuItems, setDanmakuItems] = useState<{ text: string; color: string }[] | undefined>(undefined)
  const [danmakuMode, setDanmakuMode] = useState<'grammar' | 'proverb'>('grammar')
  const [noKeyMessage, setNoKeyMessage] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const down = (e: KeyboardEvent) => keysRef.current.add(e.key.toLowerCase())
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase())
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

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

  const handleTeacherClick = useCallback(() => {
    setShowTopicInput(true)
    setMode('talk')
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return

    const hasKey = getApiKey() || getSharedApiKey()
    if (!hasKey) {
      setShowTopicInput(false)
      setNoKeyMessage(true)
      await new Promise(r => setTimeout(r, 2000))
      setNoKeyMessage(false)
      return
    }

    setIsGenerating(true)
    setShowTopicInput(false)
    try {
      const prompt = `你是初中英语语法专家。用户正在复习"${topic}"这个语法点。
请直接输出12条中考英语语法知识弹幕，每条必须包含具体的英语例子和中文解释。

格式要求（严格按此格式）：
- 每条一行，不要编号，不要空行
- 每条必须包含：一个英语例句片段 + 中文说明
- 每条10-30个字
- 可用💡💬📌⭐等符号开头

内容要求：
- 必须针对"${topic}"这个语法点
- 包含具体的中考高频考点
- 必须给出英语例子

示例格式：
💡 remember doing 记得做过 vs remember to do 记得要做
💬 It's + adj + to do 句型：It's important to study
📌 不定式作主语：To learn English is important

直接输出12条，不要任何说明文字。`
      const result = await sendToDeepSeekSync([
        { role: 'system', content: '你是一个专门生成英语语法弹幕的助手。只输出弹幕内容，不要任何说明文字。每条必须包含英语例子。' },
        { role: 'user', content: prompt }
      ])
      const lines = result.split('\n').filter(l => {
        const t = l.trim()
        return t.length > 5 && t.length < 60 && /[a-zA-Z]/.test(t)
      }).slice(0, 15)
      if (lines.length > 0) {
        const items = lines.map(text => ({
          text: text.trim(),
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        }))
        setDanmakuItems(items)
      } else {
        setDanmakuItems(FALLBACK_DANMAKU.default)
      }
    } catch {
      setDanmakuItems(FALLBACK_DANMAKU.default)
    } finally {
      setIsGenerating(false)
      setMode('idle')
      setTopic('')
    }
  }, [topic])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleGenerate()
  }, [handleGenerate])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#0a0a12' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <TeacherScene mode={mode} walkDir={walkDir} onTeacherClick={handleTeacherClick}>
          <GrammarPanels />
        </TeacherScene>
      </div>

      <GrammarDanmaku items={danmakuItems} mode={danmakuMode} key={danmakuMode} />

      <VirtualJoystick onMove={handleJoystick} />

      <NatureSounds />

      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(19,19,26,0.88)', backdropFilter: 'blur(12px)',
        padding: '10px 24px', borderRadius: 16, border: '1px solid #4a4a8a',
        display: 'flex', gap: 12, alignItems: 'center', zIndex: 100,
      }}>
        <b style={{ color: '#e2e8f0' }}>数字教师</b>
        <span style={{ color: '#94a3b8', fontSize: 12 }}>中考语法总复习</span>
        <button onClick={handleTeacherClick} style={{
          background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.3)',
          color: '#22d3ee', padding: '4px 12px', borderRadius: 8, cursor: 'pointer',
          fontSize: 11, fontWeight: 600, fontFamily: '"PingFang SC", sans-serif',
        }}>💬 提问</button>
        <button onClick={() => setDanmakuMode(m => m === 'grammar' ? 'proverb' : 'grammar')} style={{
          background: danmakuMode === 'proverb' ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${danmakuMode === 'proverb' ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.1)'}`,
          color: danmakuMode === 'proverb' ? '#fbbf24' : '#64748b',
          padding: '4px 12px', borderRadius: 8, cursor: 'pointer',
          fontSize: 11, fontWeight: 600, fontFamily: '"PingFang SC", sans-serif',
        }}>📜 谚语</button>
      </div>

      {/* Topic input dialog */}
      {showTopicInput && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        }} onClick={() => { setShowTopicInput(false); setMode('idle') }}>
          <div style={{
            background: '#1a1a2e', border: '1px solid #4a4a8a', borderRadius: 16,
            padding: '24px 28px', width: '90%', maxWidth: 400,
            boxShadow: '0 0 40px rgba(34,211,238,0.15)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 600 }}>📚 向老师提问</span>
              <button onClick={() => { setShowTopicInput(false); setMode('idle') }} style={{
                background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4,
              }}><X className="w-5 h-5" /></button>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>
              输入你想学习的语法课题，老师会生成对应的知识弹幕
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                ref={inputRef}
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="例如：现在完成时、被动语态、定语从句..."
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #4a4a8a',
                  background: '#0f0f23', color: '#e2e8f0', fontSize: 14,
                  outline: 'none', fontFamily: '"PingFang SC", sans-serif',
                }}
              />
              <button onClick={handleGenerate} disabled={!topic.trim() || isGenerating} style={{
                background: !topic.trim() ? '#334155' : 'linear-gradient(135deg, #22d3ee, #06b6d4)',
                border: 'none', color: 'white', padding: '10px 16px', borderRadius: 10,
                cursor: !topic.trim() ? 'not-allowed' : 'pointer', opacity: !topic.trim() ? 0.5 : 1,
              }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No API key message */}
      {noKeyMessage && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#1a1a2e', border: '1px solid #f59e0b', borderRadius: 16,
            padding: '24px 28px', width: '90%', maxWidth: 360, textAlign: 'center',
          }}>
            <AlertTriangle className="w-10 h-10" style={{ color: '#f59e0b', margin: '0 auto 12px' }} />
            <p style={{ color: '#fbbf24', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>未配置 API 密钥</p>
            <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
              请先在「系统中心 → API密钥」中配置 DeepSeek 密钥，<br />或使用默认密钥（共享额度有限）。
            </p>
          </div>
        </div>
      )}

      {/* Generating overlay */}
      {isGenerating && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#1a1a2e', border: '1px solid #4a4a8a', borderRadius: 16,
            padding: '24px 32px', textAlign: 'center',
          }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#22d3ee', margin: '0 auto 12px' }} />
            <p style={{ color: '#94a3b8', fontSize: 14 }}>老师正在备课...</p>
          </div>
        </div>
      )}

      <div style={{
        position: 'absolute', bottom: 90, left: '50%', transform: 'translateX(-50%)',
        zIndex: 80, color: '#64748b', fontSize: 11, textAlign: 'center',
        background: 'rgba(0,0,0,0.5)', padding: '6px 16px', borderRadius: 8,
      }}>
        鼠标拖拽旋转视角 · 不同角度查看不同语法模块 · WASD/摇杆移动
      </div>
    </div>
  )
}
