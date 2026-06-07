import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import RobotAvatar, { type RobotAnim } from './RobotAvatar'
import ImageAvatar from './ImageAvatar'
import IsometricRobot from './IsometricRobot'
import ChibiTeacher from './ChibiTeacher'
import ChibiTeacherMale from './ChibiTeacherMale'

export type AvatarType = 'robot' | 'img1' | 'img2' | 'iso' | 'teacher-f' | 'teacher-m'

interface Props {
  animation: RobotAnim
  animSpeed?: number
  walkDir?: [number, number]
  avatar?: AvatarType
}

export default function RobotScene({ animation, animSpeed = 1, walkDir, avatar = 'robot' }: Props) {
  const isOrtho = avatar === 'iso'

  const renderAvatar = () => {
    switch (avatar) {
      case 'img1': return <ImageAvatar imageUrl="/avatars/teacher01.jpg" animation={animation} animSpeed={animSpeed} walkDir={walkDir} />
      case 'img2': return <ImageAvatar imageUrl="/avatars/teacher02.jpg" animation={animation} animSpeed={animSpeed} walkDir={walkDir} />
      case 'iso': return <IsometricRobot animation={animation} animSpeed={animSpeed} walkDir={walkDir} />
      case 'teacher-f': return <ChibiTeacher animation={animation} animSpeed={animSpeed} walkDir={walkDir} />
      case 'teacher-m': return <ChibiTeacherMale animation={animation} animSpeed={animSpeed} walkDir={walkDir} />
      default: return <RobotAvatar animation={animation} animSpeed={animSpeed} walkDir={walkDir} />
    }
  }

  return (
    <Canvas
      shadows
      camera={{ position: [3, 2, 5], fov: 40 }}
      orthographic={isOrtho}
      style={{ width: '100%', height: '100%', background: '#080818' }}
    >
      <ambientLight intensity={0.3} color="#8888cc" />
      <directionalLight position={[5, 8, 6]} intensity={2.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-4, 3, -5]} intensity={0.5} color="#4488ff" />
      <directionalLight position={[0, -1, 3]} intensity={0.3} color="#6666ff" />

      <Stars radius={30} depth={50} count={1000} factor={4} fade speed={1} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0a0a2e" roughness={0.9} />
      </mesh>
      <gridHelper args={[16, 16, '#3b82f6', '#1e3a5f']} position={[0, 0, 0]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial color="#1e40af" transparent opacity={0.15} />
      </mesh>

      {renderAvatar()}

      <OrbitControls target={[0, 0.9, 0]} enableDamping maxPolarAngle={Math.PI / 2}
        minDistance={1.5} maxDistance={10} minZoom={10} maxZoom={80}
      />

      <fog attach="fog" args={['#080818', 12, 30]} />
    </Canvas>
  )
}
