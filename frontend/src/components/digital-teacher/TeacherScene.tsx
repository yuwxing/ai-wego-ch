import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import TeacherGLB from './TeacherGLB'
import type { RobotAnim } from './RobotAvatar'
import TeachingBlackboard from './TeachingBlackboard'

interface Props {
  mode: 'idle' | 'walk' | 'talk'
  walkDir: [number, number]
  ikTarget?: [number, number, number] | null
  blackboard?: string
  modelUrl?: string
}

export default function TeacherScene({ mode, walkDir, blackboard, modelUrl }: Props) {
  const anim: RobotAnim = mode === 'walk' ? 'walk' : mode === 'talk' ? 'talk' : 'idle'

  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.6, 3.2], fov: 50 }}
      style={{ width: '100%', height: '100%', background: '#0a0a12' }}
    >
      <ambientLight intensity={0.6} color="#f0e6ff" />
      <directionalLight position={[5, 10, 6]} intensity={2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-4, 1, -5]} intensity={0.4} color="#ff88cc" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
      </mesh>

      <gridHelper args={[20, 20, '#4a3a6a', '#2a1a4a']} position={[0, 0, 0]} />

      <TeacherGLB modelUrl={modelUrl} animation={anim} walkDir={walkDir} />

      <TeachingBlackboard content={blackboard || ''} visible={!!blackboard} />

      <OrbitControls target={[0, 1.2, 0]} enableDamping minDistance={1.5} maxDistance={8} />

      <fog attach="fog" args={['#0a0a12', 12, 30]} />
    </Canvas>
  )
}
