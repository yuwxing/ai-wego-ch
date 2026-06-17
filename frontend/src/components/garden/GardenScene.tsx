import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { Plant, PlantType, PlantStage } from './GardenState'
import type { RobotAnim } from '../digital-teacher/RobotAvatar'
import ChibiTeacher from '../digital-teacher/ChibiTeacher'
import ChibiTeacherMale from '../digital-teacher/ChibiTeacherMale'

const PALETTE = {
  sky: '#c8c0b0',
  ground: '#8a9a7a',
  water: '#7a8a7a',
  soil: '#3d3028',
  stone: '#6b5b4f',
  bamboo: '#5a7a4a',
  roof: '#8a2a2a',
  wood: '#5a3a2a',
  mist: '#d4d0c8',
}

function FlowerHead({ pos, color, size = 0.08 }: { pos: [number, number, number]; color: string; size?: number }) {
  return (
    <mesh position={pos}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial color={color} roughness={0.5} transparent opacity={0.9} />
    </mesh>
  )
}

function Peony({ stage, color }: { stage: PlantStage; color: string }) {
  const h = stage === 'seed' ? 0.05 : stage === 'sprout' ? 0.1 : stage === 'growing' ? 0.2 : 0.3
  const flower = stage === 'flowering'
  return (
    <group>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.015, 0.025, h, 6]} />
        <meshStandardMaterial color={PALETTE.bamboo} />
      </mesh>
      {stage !== 'seed' && (
        <mesh position={[0.04, h * 0.6, 0]} rotation={[0, 0, 0.5]}>
          <planeGeometry args={[0.04, 0.02]} />
          <meshStandardMaterial color={PALETTE.bamboo} side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
      {flower && (
        <>
          {[0, 1, 2, 3, 4].map(i => (
            <FlowerHead key={i} pos={[Math.cos(i * 1.26) * 0.04, h, Math.sin(i * 1.26) * 0.04]} color={color} size={0.035} />
          ))}
          <FlowerHead pos={[0, h, 0]} color="#fef08a" size={0.02} />
        </>
      )}
    </group>
  )
}

function Plum({ stage, color }: { stage: PlantStage; color: string }) {
  const h = stage === 'seed' ? 0.06 : stage === 'sprout' ? 0.12 : stage === 'growing' ? 0.22 : 0.35
  const twist = stage !== 'seed' ? 0.15 : 0
  const flower = stage === 'flowering'
  return (
    <group>
      <mesh position={[twist * 0.5, h / 2, twist * 0.3]}>
        <cylinderGeometry args={[0.012, 0.035, h, 5]} />
        <meshStandardMaterial color={PALETTE.wood} />
      </mesh>
      {flower && (
        <>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <FlowerHead key={i} pos={[Math.cos(i * 1.05) * 0.035 + twist * 0.5, h - 0.02, Math.sin(i * 1.05) * 0.035 + twist * 0.3]} color={color} size={0.025} />
          ))}
        </>
      )}
    </group>
  )
}

function Peach({ stage, color }: { stage: PlantStage; color: string }) {
  const h = stage === 'seed' ? 0.05 : stage === 'sprout' ? 0.1 : stage === 'growing' ? 0.25 : 0.32
  const flower = stage === 'flowering'
  return (
    <group>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.03, h, 6]} />
        <meshStandardMaterial color={PALETTE.bamboo} />
      </mesh>
      {stage !== 'seed' && (
        <>
          <mesh position={[-0.04, h * 0.5, 0.02]} rotation={[0, 0, 0.6]}>
            <planeGeometry args={[0.04, 0.02]} />
            <meshStandardMaterial color={PALETTE.bamboo} side={THREE.DoubleSide} transparent opacity={0.8} />
          </mesh>
          <mesh position={[0.04, h * 0.7, -0.02]} rotation={[0, 0, -0.4]}>
            <planeGeometry args={[0.035, 0.018]} />
            <meshStandardMaterial color={PALETTE.bamboo} side={THREE.DoubleSide} transparent opacity={0.8} />
          </mesh>
        </>
      )}
      {flower && (
        <>
          {[0, 1, 2, 3, 4].map(i => (
            <FlowerHead key={i} pos={[Math.cos(i * 1.26) * 0.045, h, Math.sin(i * 1.26) * 0.045]} color={color} size={0.03} />
          ))}
          <FlowerHead pos={[0, h, 0]} color="#fef08a" size={0.015} />
        </>
      )}
    </group>
  )
}

const PLANT_COLORS: Record<PlantType, string> = {
  peony: '#c9577a',
  plum: '#d4c07a',
  peach: '#c96a7a',
  orchid: '#8a7aaa',
  chrysanthemum: '#c9aa4a',
}

const PLANT_RENDERER: Record<PlantType, React.FC<{ stage: PlantStage; color: string }>> = {
  peony: Peony,
  plum: Plum,
  peach: Peach,
  orchid: Peony,
  chrysanthemum: Plum,
}

function GardenPlant({ plant }: { plant: Plant }) {
  const ref = useRef<THREE.Group>(null!)
  const PlantGeo = PLANT_RENDERER[plant.type]
  return (
    <group ref={ref} position={[plant.x, 0, plant.z]}>
      {/* Classical pot */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.06, 0.045, 0.04, 8]} />
        <meshStandardMaterial color={PALETTE.stone} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.04, 0.045, 0.01, 8]} />
        <meshStandardMaterial color={PALETTE.soil} roughness={0.9} />
      </mesh>
      <PlantGeo stage={plant.stage} color={PLANT_COLORS[plant.type]} />
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.065, 0.07, 12]} />
        <meshBasicMaterial
          color={plant.health > 60 ? '#6a9a5a' : plant.health > 30 ? '#c9aa4a' : '#c95a4a'}
          transparent opacity={0.3} side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

function GardenPlot({ pos, size }: { pos: [number, number, number]; size: [number, number] }) {
  return (
    <mesh position={pos} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color={PALETTE.soil} roughness={0.9} />
    </mesh>
  )
}

function Bamboo({ pos, height = 0.8 }: { pos: [number, number, number]; height?: number }) {
  return (
    <group position={pos}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.018, height, 6]} />
        <meshStandardMaterial color={PALETTE.bamboo} roughness={0.7} />
      </mesh>
      {[0.3, 0.5, 0.7].filter(s => s < height).map((s, i) => (
        <mesh key={i} position={[0.02, s, 0]} rotation={[0, 0, 0.3 + i * 0.2]}>
          <planeGeometry args={[0.06, 0.015]} />
          <meshStandardMaterial color={PALETTE.bamboo} side={THREE.DoubleSide} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function WaterSurface() {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.003
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[2.5, -0.005, -1.5]}>
      <planeGeometry args={[1.5, 1]} />
      <meshStandardMaterial color={PALETTE.water} transparent opacity={0.5} roughness={0.3} metalness={0.1} />
    </mesh>
  )
}

function PavilionRoof() {
  return (
    <group position={[-2.8, 0.3, -1.8]}>
      <mesh position={[0, 0.15, 0]} rotation={[0.1, 0, 0]} castShadow>
        <coneGeometry args={[0.3, 0.12, 4]} />
        <meshStandardMaterial color={PALETTE.roof} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.16, 6]} />
        <meshStandardMaterial color={PALETTE.wood} />
      </mesh>
    </group>
  )
}

function DecorativeRock() {
  return (
    <mesh position={[-2.2, 0.01, 0.8]} rotation={[0, 0.5, 0.1]} castShadow>
      <dodecahedronGeometry args={[0.1]} />
      <meshStandardMaterial color={PALETTE.stone} roughness={0.9} />
    </mesh>
  )
}

function WanderCharacter({ keyMap = 'none', startPos = [0, 0, 0] as [number, number, number], mode = 'wander', render }: {
  keyMap?: 'wasd' | 'arrows' | 'none'
  startPos?: [number, number, number]
  mode?: 'wander' | 'clear'
  render: (anim: RobotAnim, swing?: number) => React.ReactNode
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const [anim, setAnim] = useState<RobotAnim>('idle')
  const idleTimer = useRef(0)
  const wanderTarget = useRef<THREE.Vector3>(new THREE.Vector3(startPos[0], 0, startPos[2] + 0.2))
  const keysRef = useRef<Set<string>>(new Set())
  const swingRef = useRef(0)
  const swingPhase = useRef<'walk' | 'work' | 'rest'>('walk')

  useEffect(() => {
    if (keyMap === 'none') return
    const down = (e: KeyboardEvent) => { keysRef.current.add(e.key.toLowerCase()) }
    const up = (e: KeyboardEvent) => { keysRef.current.delete(e.key.toLowerCase()) }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [keyMap])

  useFrame((_, dt) => {
    const g = groupRef.current
    if (!g) return
    const speed = 0.5 * Math.min(dt, 0.05)

    if (keyMap !== 'none') {
      const keys = keysRef.current
      let kx = 0, kz = 0
      const isWasd = keyMap === 'wasd'
      if (isWasd ? keys.has('w') : keys.has('arrowup')) kz = -1
      if (isWasd ? keys.has('s') : keys.has('arrowdown')) kz = 1
      if (isWasd ? keys.has('a') : keys.has('arrowleft')) kx = -1
      if (isWasd ? keys.has('d') : keys.has('arrowright')) kx = 1
      if (kx !== 0 || kz !== 0) {
        const len = Math.sqrt(kx * kx + kz * kz)
        kx /= len; kz /= len
        g.position.x += kx * speed * 1.5
        g.position.z += kz * speed * 1.5
        g.rotation.y = Math.atan2(kx, kz)
        setAnim('walk')
        idleTimer.current = 0
        return
      }
    }

    if (mode === 'clear') {
      if (swingPhase.current === 'walk') {
        const tx = wanderTarget.current.x
        const tz = wanderTarget.current.z
        const dx = tx - g.position.x
        const dz = tz - g.position.z
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (dist > 0.06) {
          const nx = dx / dist; const nz = dz / dist
          g.position.x += nx * speed; g.position.z += nz * speed
          g.rotation.y = Math.atan2(nx, nz)
          setAnim('walk')
        } else {
          swingPhase.current = 'work'
          idleTimer.current = 0
        }
      } else if (swingPhase.current === 'work') {
        setAnim('idle')
        swingRef.current += dt * 3
        idleTimer.current += dt
        if (idleTimer.current > 2 + Math.random() * 2) {
          const angle = Math.random() * Math.PI * 2
          const radius = 1.5 + Math.random() * 0.5
          wanderTarget.current.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
          swingPhase.current = 'walk'
          idleTimer.current = 0
        }
      }
    } else {
      const tx = wanderTarget.current.x
      const tz = wanderTarget.current.z
      const dx = tx - g.position.x
      const dz = tz - g.position.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist > 0.06) {
        const nx = dx / dist
        const nz = dz / dist
        g.position.x += nx * speed
        g.position.z += nz * speed
        g.rotation.y = Math.atan2(nx, nz)
        setAnim('walk')
        idleTimer.current = 0
      } else {
        setAnim('idle')
        idleTimer.current += dt
        if (idleTimer.current > 3 + Math.random() * 3) {
          const angle = Math.random() * Math.PI * 2
          const radius = Math.random() * 0.3 + 0.05
          wanderTarget.current.set(g.position.x + Math.cos(angle) * radius, 0, g.position.z + Math.sin(angle) * radius)
          idleTimer.current = 0
        }
      }
    }
  })

  return <group ref={groupRef} position={startPos}>{render(anim, swingRef.current)}</group>
}

function Hoe({ swing = 0 }: { swing?: number }) {
  return (
    <group position={[0.35, 0.65, -0.05]} rotation={[0, 0, -0.3 + Math.sin(swing) * 0.4]}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.015, 0.3, 6]} />
        <meshStandardMaterial color={PALETTE.wood} roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.02, 0.03]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.06, 0.01, 0.04]} />
        <meshStandardMaterial color={PALETTE.stone} metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  )
}

function GuqinMusic() {
  const ctxRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const PENTA = [261, 293, 329, 392, 440, 523, 587, 659, 784, 880]

  const playNote = useCallback(() => {
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext()
      const ctx = ctxRef.current
      const now = ctx.currentTime
      const freq = PENTA[Math.floor(Math.random() * PENTA.length)]
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now)
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.04, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5 + Math.random() * 2)
      osc.start(now)
      osc.stop(now + 3)
    } catch {}
  }, [])

  useEffect(() => {
    const schedule = () => { playNote(); timerRef.current = setTimeout(schedule, 4000 + Math.random() * 6000) }
    timerRef.current = setTimeout(schedule, 2000)
    return () => { clearTimeout(timerRef.current); ctxRef.current?.close() }
  }, [playNote])

  return null
}

function WaterAmbience() {
  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)

  useEffect(() => {
    try {
      ctxRef.current = new AudioContext()
      const ctx = ctxRef.current
      const bufferSize = ctx.sampleRate * 2
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.3))
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer
      noise.loop = true
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(400, ctx.currentTime)
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.015, ctx.currentTime)
      noise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      noise.start()
      sourceRef.current = noise
    } catch {}
    return () => { sourceRef.current?.stop(); ctxRef.current?.close() }
  }, [])

  return null
}

export default function GardenScene({ plants, selectedId, onSelect }: {
  plants: Plant[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <Canvas shadows camera={{ position: [3, 2.5, 3.5], fov: 45 }} style={{ width: '100%', height: '100%', background: PALETTE.sky }}>
      <ambientLight intensity={0.5} color="#e8e0d8" />
      <directionalLight position={[4, 6, 5]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <hemisphereLight args={[PALETTE.sky, PALETTE.ground, 0.4]} />

      {/* Ground – muted grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color={PALETTE.ground} roughness={0.9} />
      </mesh>

      {/* Water area */}
      <WaterSurface />

      {/* Stone path border */}
      <GardenPlot pos={[0, 0, 0]} size={[4.2, 3]} />

      {/* Stone border */}
      {[-2.1, -1.4, -0.7, 0, 0.7, 1.4, 2.1].map((x, i) => (
        <mesh key={`bl${i}`} position={[x, 0.01, -1.52]} castShadow>
          <boxGeometry args={[0.55, 0.03, 0.06]} />
          <meshStandardMaterial color={PALETTE.stone} roughness={0.9} />
        </mesh>
      ))}
      {[-2.1, -1.4, -0.7, 0, 0.7, 1.4, 2.1].map((x, i) => (
        <mesh key={`br${i}`} position={[x, 0.01, 1.52]} castShadow>
          <boxGeometry args={[0.55, 0.03, 0.06]} />
          <meshStandardMaterial color={PALETTE.stone} roughness={0.9} />
        </mesh>
      ))}
      {[-1.5, -0.75, 0, 0.75, 1.5].map((z, i) => (
        <mesh key={`bt${i}`} position={[-2.13, 0.01, z]} castShadow>
          <boxGeometry args={[0.06, 0.03, 0.55]} />
          <meshStandardMaterial color={PALETTE.stone} roughness={0.9} />
        </mesh>
      ))}
      {[-1.5, -0.75, 0, 0.75, 1.5].map((z, i) => (
        <mesh key={`bb${i}`} position={[2.13, 0.01, z]} castShadow>
          <boxGeometry args={[0.06, 0.03, 0.55]} />
          <meshStandardMaterial color={PALETTE.stone} roughness={0.9} />
        </mesh>
      ))}

      {/* Plants */}
      {plants.map(p => (
        <group key={p.id} onClick={() => onSelect(p.id)}>
          <GardenPlant plant={p} />
          {selectedId === p.id && (
            <mesh position={[p.x, -0.01, p.z]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.08, 0.10, 16]} />
              <meshBasicMaterial color="#c9aa4a" transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
          )}
        </group>
      ))}

      {/* Bamboo grove */}
      <Bamboo pos={[-3.2, 0, -1.5]} height={0.9} />
      <Bamboo pos={[-3.0, 0, -1.2]} height={0.7} />
      <Bamboo pos={[-3.4, 0, -1.0]} height={0.6} />
      <Bamboo pos={[3.2, 0, -1.5]} height={0.8} />
      <Bamboo pos={[3.0, 0, -1.0]} height={0.65} />

      {/* Pavilion */}
      <PavilionRoof />

      {/* Decorative rock */}
      <DecorativeRock />

      {/* 教学团队 – WASD */}
      <WanderCharacter keyMap="wasd" startPos={[0, 0, 0]} render={a => <ChibiTeacher animation={a} />} />
      {/* 管理团队 – Arrow keys */}
      <WanderCharacter keyMap="arrows" mode="clear" startPos={[-1.2, 0, 1]} render={(a, s) => <><ChibiTeacherMale animation={a} /><Hoe swing={s || 0} /></>} />

      {/* Ambience */}
      <GuqinMusic />
      <WaterAmbience />
      <BirdAmbience />

      <OrbitControls target={[0, 0.2, 0]} enableDamping minDistance={1.5} maxDistance={7}
        maxPolarAngle={Math.PI / 1.6}
      />
      <fog attach="fog" args={[PALETTE.sky, 4, 8]} />
    </Canvas>
  )
}

function BirdAmbience() {
  const ctxRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const chirp = useCallback(() => {
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext()
      const ctx = ctxRef.current
      const now = ctx.currentTime
      for (let i = 0; i < 2 + Math.random() * 2; i++) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(2000 + Math.random() * 2000, now + i * 0.08)
        osc.frequency.exponentialRampToValueAtTime(3000 + Math.random() * 1500, now + i * 0.08 + 0.06)
        gain.gain.setValueAtTime(0, now + i * 0.08)
        gain.gain.linearRampToValueAtTime(0.025, now + i * 0.08 + 0.02)
        gain.gain.linearRampToValueAtTime(0, now + i * 0.08 + 0.06)
        osc.start(now + i * 0.08)
        osc.stop(now + i * 0.08 + 0.06)
      }
    } catch {}
  }, [])

  useEffect(() => {
    const schedule = () => { chirp(); timerRef.current = setTimeout(schedule, 4000 + Math.random() * 6000) }
    timerRef.current = setTimeout(schedule, 3000)
    return () => { clearTimeout(timerRef.current); ctxRef.current?.close() }
  }, [chirp])

  return null
}
