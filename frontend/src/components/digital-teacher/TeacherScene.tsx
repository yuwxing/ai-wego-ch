import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import TeacherGLB from './TeacherGLB'
import type { RobotAnim } from './RobotAvatar'
import TeachingBlackboard from './TeachingBlackboard'
import HolographicClassroom from './HolographicClassroom'

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
      camera={{ position: [1.5, 1.6, 3.0], fov: 50 }}
      style={{ width: '100%', height: '100%', background: '#050510' }}
    >
      <ambientLight intensity={0.3} color="#2266aa" />
      <directionalLight position={[5, 10, 6]} intensity={0.8} color="#4488ff" />
      <directionalLight position={[-4, 1, -5]} intensity={0.3} color="#22d3ee" />
      <pointLight position={[0, 2.5, 0]} intensity={0.6} color="#22d3ee" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#08081a" roughness={0.8} />
      </mesh>

      <HolographicClassroom />

      <TeacherGLB modelUrl={modelUrl} animation={anim} walkDir={walkDir} />

      <TeachingBlackboard content={blackboard || ''} visible={!!blackboard} />

      <OrbitControls target={[0, 1.2, 0]} enableDamping minDistance={1.5} maxDistance={6} />

      <fog attach="fog" args={['#050510', 6, 12]} />
    </Canvas>
  )
}
