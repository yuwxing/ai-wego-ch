import React, { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import RobotAvatar, { type RobotAnim } from './RobotAvatar'
import ChibiTeacher from './ChibiTeacher'
import ChibiTeacherMale from './ChibiTeacherMale'

export type AvatarType = 'robot' | 'teacher-f' | 'teacher-m'

interface Props {
  animation: RobotAnim
  animSpeed?: number
  walkDir?: [number, number]
  avatar?: AvatarType
}

function Tree({ pos, scale = 1 }: { pos: [number, number, number]; scale?: number }) {
  return (
    <group position={pos} scale={scale}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.4, 6]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <coneGeometry args={[0.25, 0.35, 6]} />
        <meshStandardMaterial color="#22c55e" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <coneGeometry args={[0.18, 0.25, 6]} />
        <meshStandardMaterial color="#16a34a" roughness={0.8} />
      </mesh>
    </group>
  )
}

function FieldLines() {
  return (
    <group>
      {/* Soccer field outline */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(2.4, 1.6)]} />
        <lineBasicMaterial color="white" transparent opacity={0.3} />
      </lineSegments>
      {/* Center line */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.02, 1.6]} />
        <meshBasicMaterial color="white" transparent opacity={0.2} />
      </mesh>
      {/* Center circle */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.29, 0.3, 24]} />
        <meshBasicMaterial color="white" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export default function RobotScene({ animation, animSpeed = 1, walkDir, avatar = 'robot' }: Props) {
  const renderAvatar = () => {
    switch (avatar) {
      case 'teacher-f': return <ChibiTeacher animation={animation} animSpeed={animSpeed} walkDir={walkDir} />
      case 'teacher-m': return <ChibiTeacherMale animation={animation} animSpeed={animSpeed} walkDir={walkDir} />
      default: return <RobotAvatar animation={animation} animSpeed={animSpeed} walkDir={walkDir} />
    }
  }

  return (
    <Canvas
      shadows
      camera={{ position: [4, 2.5, 5], fov: 45 }}
      style={{ width: '100%', height: '100%', background: '#87CEEB' }}
    >
      <ambientLight intensity={0.8} color="#fff8f0" />
      <directionalLight position={[8, 12, 6]} intensity={1.8} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <directionalLight position={[-4, 6, -3]} intensity={0.3} color="#8888ff" />
      <hemisphereLight args={['#87CEEB', '#4ade80', 0.4]} />

      {/* Ground – grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#4ade80" roughness={0.9} />
      </mesh>
      {/* Grass detail – larger dark green circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#22c55e" roughness={0.9} />
      </mesh>

      {/* Running track (red oval) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <ringGeometry args={[3.2, 3.8, 48]} />
        <meshStandardMaterial color="#dc2626" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[3.85, 4.0, 48]} />
        <meshStandardMaterial color="white" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* Soccer / sports field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[2.4, 1.6]} />
        <meshStandardMaterial color="#22c55e" roughness={0.85} />
      </mesh>
      <FieldLines />

      {/* Trees */}
      <Tree pos={[-3.5, 0, 2.5]} scale={1.2} />
      <Tree pos={[3.5, 0, 2.5]} scale={1.2} />
      <Tree pos={[-3.5, 0, -2.5]} scale={1} />
      <Tree pos={[3.5, 0, -2.5]} scale={1} />
      <Tree pos={[-3, 0, -4]} scale={0.8} />
      <Tree pos={[3, 0, -4]} scale={0.8} />

      {/* Bleachers / stands */}
      <group position={[0, 0.08, -3.2]}>
        {[0, 1, 2].map(i => (
          <mesh key={i} position={[0, i * 0.08 + 0.04, -i * 0.12]} castShadow>
            <boxGeometry args={[1.6, 0.08, 0.2]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Fence posts */}
      {[-2, -1, 0, 1, 2].map(x => (
        <mesh key={x} position={[x * 0.6, 0.2, 3.6]} castShadow>
          <cylinderGeometry args={[0.015, 0.02, 0.4, 6]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}

      {/* Goal post (simple) */}
      <group position={[0, 0, 1.6]}>
        <mesh position={[-0.6, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.5, 6]} />
          <meshStandardMaterial color="white" metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh position={[0.6, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.5, 6]} />
          <meshStandardMaterial color="white" metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.22, 0.02, 0.02]} />
          <meshStandardMaterial color="white" metalness={0.3} roughness={0.5} />
        </mesh>
      </group>

      {renderAvatar()}

      <OrbitControls target={[0, 0.9, 0]} enableDamping maxPolarAngle={Math.PI / 2.2}
        minDistance={2} maxDistance={12}
      />

      <fog attach="fog" args={['#87CEEB', 15, 30]} />
    </Canvas>
  )
}
