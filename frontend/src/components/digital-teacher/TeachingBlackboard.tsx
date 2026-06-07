import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

interface Props {
  content: string
  visible?: boolean
  position?: [number, number, number]
}

export default function TeachingBlackboard({ content, visible = true, position = [4, 1.8, -2] }: Props) {
  const lines = useMemo(() => content.split('\n').filter(Boolean), [content])

  if (!visible) return null

  return (
    <group position={position}>
      {/* Blackboard frame */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[3.2, 2.0, 0.08]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Screen glow */}
      <mesh position={[0, 0.6, 0.005]}>
        <planeGeometry args={[3.0, 1.8]} />
        <meshBasicMaterial color="#0a0a18" transparent opacity={0.9} />
      </mesh>
      {/* Border glow */}
      <mesh position={[0, 0.6, 0.004]}>
        <planeGeometry args={[3.08, 1.88]} />
        <meshBasicMaterial color="#4a4a8a" transparent opacity={0.3} />
      </mesh>

      {/* Text content */}
      {lines.slice(0, 8).map((line, i) => (
        <Text
          key={i}
          position={[-1.4, 1.4 - i * 0.22, 0.02]}
          fontSize={0.1}
          color="#c4b5fd"
          maxWidth={2.8}
          anchorX="left"
          anchorY="top"
        >
          {line}
        </Text>
      ))}

      {/* Position indicator (teacher points toward this) */}
      <mesh position={[0, -0.5, 0.5]} visible={false}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#7c3aed" />
      </mesh>
    </group>
  )
}
