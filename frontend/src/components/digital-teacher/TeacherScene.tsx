import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import TeacherGLB from './TeacherGLB'
import type { RobotAnim } from './RobotAvatar'
import TeachingBlackboard from './TeachingBlackboard'
import HolographicClassroom from './HolographicClassroom'
import * as THREE from 'three'

interface Props {
  mode: 'idle' | 'walk' | 'talk'
  walkDir: [number, number]
  ikTarget?: [number, number, number] | null
  blackboard?: string
  modelUrl?: string
  children?: React.ReactNode
  onTeacherClick?: () => void
  teacherPos?: React.MutableRefObject<THREE.Vector3>
}

function TeacherChatButton({ onClick, posRef }: { onClick?: () => void; posRef: React.MutableRefObject<THREE.Vector3> }) {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(posRef.current)
      groupRef.current.position.y += 2.4
    }
  })

  return (
    <group ref={groupRef}>
      <Html center>
        <div
          onClick={(e) => { e.stopPropagation(); onClick?.() }}
          style={{
            background: 'rgba(34,211,238,0.2)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(34,211,238,0.5)',
            borderRadius: 20,
            padding: '6px 14px',
            cursor: 'pointer',
            color: '#22d3ee',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: '"PingFang SC", sans-serif',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            userSelect: 'none',
            boxShadow: '0 0 20px rgba(34,211,238,0.3)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(34,211,238,0.35)'
            e.currentTarget.style.boxShadow = '0 0 30px rgba(34,211,238,0.5)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(34,211,238,0.2)'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(34,211,238,0.3)'
          }}
        >
          💬 提问
        </div>
      </Html>
    </group>
  )
}

export default function TeacherScene({ mode, walkDir, blackboard, modelUrl, children, onTeacherClick }: Props) {
  const anim: RobotAnim = mode === 'walk' ? 'walk' : mode === 'talk' ? 'talk' : 'idle'
  const teacherPos = useRef(new THREE.Vector3(0, 0, 0))

  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.6, 4.5], fov: 55 }}
      style={{ width: '100%', height: '100%', background: '#050510' }}
    >
      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight position={[5, 10, 6]} intensity={3} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-4, 1, -5]} intensity={0.8} color="#88ccff" />
      <directionalLight position={[0, -2, 4]} intensity={0.6} color="#22d3ee" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#08081a" roughness={0.8} />
      </mesh>

      <HolographicClassroom />

      <TeacherGLB modelUrl={modelUrl} animation={anim} walkDir={walkDir} posRef={teacherPos} />

      <TeacherChatButton onClick={onTeacherClick} posRef={teacherPos} />

      <TeachingBlackboard content={blackboard || ''} visible={!!blackboard} />

      {children}

      <OrbitControls target={[0, 1.2, 0]} enableDamping minDistance={1.5} maxDistance={6} autoRotate autoRotateSpeed={0.6} />

      <fog attach="fog" args={['#050510', 6, 14]} />
    </Canvas>
  )
}
