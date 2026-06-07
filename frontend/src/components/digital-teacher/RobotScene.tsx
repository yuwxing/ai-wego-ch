import React, { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import RobotAvatar, { type RobotAnim } from './RobotAvatar'

interface Props {
  animation: RobotAnim
  animSpeed?: number
  walkDir?: [number, number]
}

export default function RobotScene({ animation, animSpeed = 1, walkDir }: Props) {
  return (
    <Canvas
      shadows
      camera={{ position: [3, 2, 5], fov: 40 }}
      style={{ width: '100%', height: '100%', background: '#080818' }}
    >
      {/* Ambient + fill light */}
      <ambientLight intensity={0.3} color="#8888cc" />
      <directionalLight position={[5, 8, 6]} intensity={2.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-4, 3, -5]} intensity={0.5} color="#4488ff" />
      <directionalLight position={[0, -1, 3]} intensity={0.3} color="#6666ff" />

      {/* Stars background */}
      <Stars radius={30} depth={50} count={1000} factor={4} fade speed={1} />

      {/* Ground plane (glowing grid) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0a0a2e" roughness={0.9} />
      </mesh>
      <gridHelper args={[16, 16, '#3b82f6', '#1e3a5f']} position={[0, 0, 0]} />

      {/* Center stage glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial color="#1e40af" transparent opacity={0.15} />
      </mesh>

      {/* Robot */}
      <RobotAvatar animation={animation} animSpeed={animSpeed} walkDir={walkDir} />

      {/* Controls */}
      <OrbitControls target={[0, 0.9, 0]} enableDamping maxPolarAngle={Math.PI / 2} />

      {/* Fog */}
      <fog attach="fog" args={['#080818', 12, 30]} />
    </Canvas>
  )
}
