import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Droplets, Scissors, Shuffle, Syringe } from 'lucide-react'
import GardenScene from '../components/garden/GardenScene'
import {
  getGardenState, saveState, type GardenState, TYPES,
  actWater, actPrune, actRepot, actGraft, addPlant, setDelegate, checkLevelUp,
  getStageLabel, PLANT_NAMES, PLANT_NOTES,
} from '../components/garden/GardenState'
import GardenDialogue, { getScene, hasSeen, markSeen, getRandomChatScene, type DialogueScene, type DialogueLine } from '../components/garden/GardenDialogue'

const C = {
  ink: '#2c2416', gold: '#c9a84c', verm: '#d4292f', rice: '#f5f0e8', stone: '#8a7a6a',
  green: '#5a7a4a', water: '#7a8a7a', border: '#c8b898',
}

const ACTIONS = [
  { id: 'water' as const, label: '浇水', icon: Droplets, color: C.water, speaker: 'xishi' },
  { id: 'prune' as const, label: '修剪', icon: Scissors, color: C.green, speaker: 'fanli' },
  { id: 'repot' as const, label: '移栽', icon: Shuffle, color: C.gold, speaker: 'xishi' },
  { id: 'graft' as const, label: '嫁接', icon: Syringe, color: '#8a7aaa', speaker: 'fanli' },
]

export default function GardenPage() {
  const navigate = useNavigate()
  const [game, setGame] = useState<GardenState>(getGardenState)
  const [selectedId, setSelectedId] = useState<string | null>(game.plants[0]?.id || null)
  const [dialogue, setDialogue] = useState<string | null>(null)
  const [showNewPlant, setShowNewPlant] = useState(false)
  const [showDelegate, setShowDelegate] = useState(false)
  const [showNotif, setShowNotif] = useState(game.messages.length > 0)
  const [vh, setVh] = useState(window.innerHeight)
  const [dialogueScene, setDialogueScene] = useState<DialogueScene | null>(null)

  // ── Trigger dialogues ──
  useEffect(() => {
    if (!hasSeen('welcome')) {
      setDialogueScene(getScene('welcome')!)
      markSeen('welcome')
    } else {
      const today = new Date().toDateString()
      if (!hasSeen(`daily_${today}`)) {
        setDialogueScene(getScene('daily_greeting')!)
        markSeen(`daily_${today}`)
      }
    }
  }, [])

  // Idle return: check if > 30 min since last visit
  useEffect(() => {
    const last = localStorage.getItem('garden_last_visit')
    if (last && Date.now() - parseInt(last) > 30 * 60 * 1000) {
      if (!hasSeen('idle_return')) {
        setDialogueScene(getScene('idle_return')!)
        markSeen('idle_return')
      }
    }
    localStorage.setItem('garden_last_visit', String(Date.now()))
  }, [])

  useEffect(() => {
    const onResize = () => setVh(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const bottomPanel = vh < 700 ? 100 : 200

  const selected = game.plants.find(p => p.id === selectedId)

  const refresh = useCallback(() => {
    const g = getGardenState()
    checkLevelUp(g)
    setGame({ ...g })
  }, [])

  const doAction = useCallback((action: 'water' | 'prune' | 'repot') => {
    if (!selectedId) return
    const g = getGardenState()
    let msg = ''
    if (action === 'water') {
      msg = actWater(g, selectedId)
      setDialogueScene(getScene('after_water')!)
    } else if (action === 'prune') {
      msg = actPrune(g, selectedId)
      setDialogueScene(getScene('after_prune')!)
    } else if (action === 'repot') msg = actRepot(g, selectedId)
    setDialogue(msg)
    checkLevelUp(g)
    setGame({ ...g })
  }, [selectedId])

  const doGraft = useCallback(() => {
    if (!selectedId) return
    const g = getGardenState()
    const otherTypes = TYPES.filter(t => t !== selected?.type)
    const target = otherTypes[Math.floor(Math.random() * otherTypes.length)]
    const msg = actGraft(g, selectedId, target)
    setDialogue(msg)
    if (msg.includes('成功')) {
      setDialogueScene(getScene('graft_success')!)
    } else {
      setDialogueScene(getScene('after_graft')!)
    }
    checkLevelUp(g)
    setGame({ ...g })
  }, [selectedId, selected?.type])

  const handleDialogueChoice = useCallback((key: string) => {
    if (key === 'more') setDialogueScene(getScene('after_water_more')!)
    else if (key === 'xishi') setDialogueScene(getScene('after_water_xishi')!)
    else if (key === 'fanli') setDialogueScene(getScene('after_water_fanli')!)
  }, [])


  const doAddPlant = useCallback((type: string) => {
    const g = getGardenState()
    const p = addPlant(g, type as any)
    if (p) {
      setSelectedId(p.id)
      setDialogue(`🌱 种下了一株${PLANT_NAMES[type as keyof typeof PLANT_NAMES]}！${PLANT_NOTES[type as keyof typeof PLANT_NOTES]}`)
      checkLevelUp(g)
    }
    setShowNewPlant(false)
    setGame({ ...g })
  }, [])

  const doDelegate = useCallback((who: 'xishi' | 'fanli' | null) => {
    const g = getGardenState()
    setDelegate(g, who)
    setShowDelegate(false)
    setGame({ ...g })
  }, [])

  const dismissNotif = useCallback(() => {
    const g = getGardenState()
    g.messages = []
    saveState(g)
    setShowNotif(false)
  }, [])

  const canAct = selected && selected.health > 0

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* 3D Garden */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <GardenScene plants={game.plants} selectedId={selectedId} onSelect={setSelectedId} />
      </div>


      {/* Top bar – ink-wash scroll */}
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 100,
        background: 'rgba(245,240,232,0.9)', backdropFilter: 'blur(12px)',
        padding: '8px 20px', borderRadius: 4, border: `1px solid ${C.gold}`,
        display: 'flex', gap: 12, alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        fontFamily: '"Noto Serif SC", serif',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={16} color={C.ink} />
        </button>
        <span style={{ fontSize: 16 }}>🌸</span>
        <b style={{ color: C.ink, fontSize: 14, letterSpacing: 2 }}>西施花园</b>
        <span style={{ color: C.stone, fontSize: 11 }}>Lv.{game.level}</span>
        <div style={{ display: 'flex', gap: 3 }}>
          <span style={{ color: C.gold, fontSize: 12 }}>⭐ {game.exp}/{game.level * 100}</span>
          <span style={{ color: C.stone, fontSize: 11 }}>|</span>
          <span style={{ color: C.gold, fontSize: 12 }}>🪙 {game.coins}</span>
        </div>
        <button onClick={() => setShowDelegate(!showDelegate)} style={{
          background: game.delegate ? C.green : 'transparent',
          border: `1px solid ${C.border}`, color: game.delegate ? C.rice : C.ink,
          padding: '3px 8px', borderRadius: 2, cursor: 'pointer', fontSize: 10,
          fontFamily: '"Noto Serif SC", serif',
        }}>{game.delegate ? `委托:${game.delegate === 'xishi' ? '西施' : '范蠡'}` : '委托'}</button>
        <button onClick={refresh} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.stone, fontSize: 12 }}>⟳</button>
      </div>

      {/* Delegate panel – ink-wash */}
      {showDelegate && (
        <div style={{
          position: 'absolute', top: 72, left: '50%', transform: 'translateX(-50%)', zIndex: 110,
          background: `rgba(245,240,232,0.95)`, backdropFilter: 'blur(12px)',
          padding: 14, borderRadius: 2, border: `1px solid ${C.border}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)', minWidth: 240,
          fontFamily: '"Noto Serif SC", serif',
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.ink, marginBottom: 8, letterSpacing: 1 }}>委托代管</p>
          {[
            { id: 'xishi' as const, name: '西施', desc: '轻柔养护' },
            { id: 'fanli' as const, name: '范蠡', desc: '稳健打理' },
            { id: null as any, name: '取消委托', desc: '自己管理' },
          ].map(opt => (
            <button key={opt.id || 'none'} onClick={() => doDelegate(opt.id)}
              style={{
                display: 'block', width: '100%', padding: '6px 10px', marginBottom: 3,
                background: game.delegate === opt.id ? C.green : '#f0ece4',
                border: `1px solid ${C.border}`, borderRadius: 1, cursor: 'pointer',
                color: game.delegate === opt.id ? C.rice : C.ink, fontSize: 11, textAlign: 'left',
                fontFamily: '"Noto Serif SC", serif',
              }}
            ><b>{opt.name}</b><br /><span style={{ fontSize: 10, opacity: 0.7 }}>{opt.desc}</span></button>
          ))}
        </div>
      )}

      {/* Selection panel – ink-wash scroll */}
      {selected && (
        <div style={{
          position: 'absolute', bottom: bottomPanel + 60, left: 20, zIndex: 100,
          background: `rgba(245,240,232,0.92)`, backdropFilter: 'blur(12px)',
          padding: 12, borderRadius: 2, border: `1px solid ${C.border}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)', width: vh < 700 ? 160 : 200,
          fontFamily: '"Noto Serif SC", serif',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <b style={{ color: C.ink, fontSize: 13, letterSpacing: 1 }}>{selected.name}</b>
            {selected.variant && <span style={{ color: '#8a7aaa', fontSize: 9, background: '#f0eee8', padding: '1px 5px', borderRadius: 1 }}>{selected.variant}</span>}
          </div>
          <div style={{ fontSize: 10, color: C.stone, marginBottom: 6, fontStyle: 'italic' }}>{getStageLabel(selected.stage)} · {PLANT_NAMES[selected.type]}</div>
          {[
            { label: '水', value: selected.water, color: C.water },
            { label: '土', value: selected.soil, color: C.gold },
            { label: '健', value: selected.health, color: selected.health > 60 ? C.green : C.verm },
          ].map(s => (
            <div key={s.label} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.stone, marginBottom: 1 }}>
                <span>{s.label}</span><span>{Math.round(s.value)}</span>
              </div>
              <div style={{ height: 3, background: '#e0d8c8', borderRadius: 1, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s.value}%`, background: s.color, borderRadius: 1, transition: 'width 0.3s' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons – classical seals */}
      {selected && (
        <div style={{
          position: 'absolute', bottom: bottomPanel + 60, right: 20, zIndex: 100,
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {ACTIONS.map(a => {
            const Icon = a.icon
            const disabled = !canAct
            return (
              <button key={a.id} onClick={() => a.id === 'graft' ? doGraft() : doAction(a.id)}
                disabled={disabled}
                style={{
                  background: disabled ? '#d0c8b8' : a.color, border: 'none',
                  color: disabled ? C.stone : C.rice, padding: '8px', minWidth: 48,
                  borderRadius: 2, cursor: disabled ? 'default' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  fontSize: 9, fontFamily: '"Noto Serif SC", serif', letterSpacing: 1,
                  boxShadow: disabled ? 'none' : '0 1px 4px rgba(0,0,0,0.1)',
                }}
              ><Icon size={16} /><span>{a.label}</span></button>
            )
          })}
        </div>
      )}

      {/* Simple feedback – top, only when no rich scene */}
      {dialogue && !dialogueScene && (
        <div style={{
          position: 'absolute', top: 72, left: '50%', transform: 'translateX(-50%)', zIndex: 110,
          background: `rgba(245,240,232,0.95)`, backdropFilter: 'blur(12px)',
          padding: '10px 16px', borderRadius: 2, border: `1px solid ${C.border}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: 400, width: '90%',
          fontFamily: '"Noto Serif SC", serif',
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, opacity: 0.7 }}>💬</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: C.ink, fontSize: 12, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{dialogue}</p>
            </div>
            <button onClick={() => setDialogue(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.stone, fontSize: 13 }}>×</button>
          </div>
        </div>
      )}

      {/* Rich dialogue scene – top */}
      <GardenDialogue scene={dialogueScene} onClose={() => setDialogueScene(null)} onChoice={handleDialogueChoice} />

      {/* Notifications – moved to bottom */}
      {showNotif && game.messages.length > 0 && !dialogueScene && (
        <div style={{
          position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 110,
          background: `rgba(245,240,232,0.95)`, backdropFilter: 'blur(12px)',
          padding: '10px 16px', borderRadius: 2, border: `1px solid ${C.border}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)', minWidth: 260,
          fontFamily: '"Noto Serif SC", serif',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontWeight: 600, color: C.ink, fontSize: 12, letterSpacing: 1 }}>📬</span>
            <button onClick={dismissNotif} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.stone, fontSize: 14 }}>×</button>
          </div>
          {game.messages.map((m, i) => (
            <p key={i} style={{ color: '#4a3a2a', fontSize: 11, lineHeight: 1.6, margin: '2px 0' }}>{m}</p>
          ))}
        </div>
      )}

      {/* New plant button – classical seal */}
      <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 100 }}>
        <button onClick={() => setShowNewPlant(true)} style={{
          width: 44, height: 44, borderRadius: 2, background: C.green, border: 'none',
          color: C.rice, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          fontFamily: '"Noto Serif SC", serif',
        }}>+</button>
      </div>

      {/* New plant panel – ink-wash scroll */}
      {showNewPlant && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(44,36,22,0.3)',
        }} onClick={() => setShowNewPlant(false)}>
          <div style={{
            background: C.rice, borderRadius: 2, padding: 20, minWidth: vh < 700 ? 240 : 280, maxWidth: '90vw',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)', border: `1px solid ${C.gold}`,
            fontFamily: '"Noto Serif SC", serif',
          }} onClick={e => e.stopPropagation()}>
            <b style={{ color: C.ink, fontSize: 14, display: 'block', marginBottom: 14, letterSpacing: 2 }}>新植株</b>
            {TYPES.filter(t => game.unlockedTypes.includes(t)).map(t => (
              <button key={t} onClick={() => doAddPlant(t)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px',
                  marginBottom: 4, background: '#f0ece4', border: `1px solid ${C.border}`,
                  borderRadius: 1, cursor: 'pointer', fontSize: 11, color: C.ink, textAlign: 'left',
                  fontFamily: '"Noto Serif SC", serif',
                }}
              ><span style={{ fontSize: 16 }}>🌱</span>
                <div><b>{PLANT_NAMES[t]}</b><br /><span style={{ fontSize: 10, color: C.stone }}>{PLANT_NOTES[t]}</span></div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
