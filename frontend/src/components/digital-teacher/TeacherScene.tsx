import React, { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { PhysicsWorld } from './PhysicsWorld'
import TeacherCharacter, { type TeacherMode } from './TeacherCharacter'
import TeachingBlackboard from './TeachingBlackboard'

interface Props {
  mode: TeacherMode
  walkDir: [number, number]
  onMeshClick?: () => void
  ikTarget?: [number, number, number] | null
  blackboard?: string
}

export default function TeacherScene({ mode, walkDir, onMeshClick, ikTarget, blackboard }: Props) {
  const [stable, setStable] = useState(false)

  const handleStable = useCallback((s: boolean) => setStable(s), [])

  return (
    <Canvas
      shadows
      camera={{ position: [3, 2.5, 5], fov: 40 }}
      style={{ width: '100%', height: '100%', background: '#0a0a12' }}
      onPointerDown={() => {
        if (onMeshClick) onMeshClick()
      }}
    >
      <PhysicsWorld>
        {/* Lights */}
        <ambientLight intensity={0.5} color="#8888cc" />
        <directionalLight
          position={[5, 10, 6]}
          intensity={2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4, 1, -5]} intensity={0.4} color="#6688ff" />

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#14142a" roughness={0.9} />
        </mesh>

        {/* Grid */}
        <gridHelper args={[20, 20, '#333366', '#222244']} position={[0, 0, 0]} />

        {/* Character */}
        <TeacherCharacter mode={mode} walkDir={walkDir} onStable={handleStable} ikTarget={ikTarget} />

        {/* Blackboard */}
        <TeachingBlackboard content={blackboard || ''} visible={!!blackboard} />

        {/* Controls */}
        <OrbitControls target={[0, 1.2, 0]} enableDamping />

        {/* Fog */}
        <fog attach="fog" args={['#0a0a12', 15, 40]} />
      </PhysicsWorld>
    </Canvas>
  )
}
