import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function HolographicRing({ radius, y, color = '#22d3ee' }: { radius: number; y: number; color?: string }) {
  const ringRef = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => {
    if (ringRef.current) ringRef.current.rotation.y += delta * 0.3
  })
  return (
    <mesh ref={ringRef} position={[0, y, 0]} rotation={[Math.PI / 3, 0, 0]}>
      <torusGeometry args={[radius, 0.015, 8, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.25} />
    </mesh>
  )
}

function HolographicRingH({ radius, y, color = '#22d3ee' }: { radius: number; y: number; color?: string }) {
  const ringRef = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => {
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.2
  })
  return (
    <mesh ref={ringRef} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.02, radius, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.DoubleSide} />
    </mesh>
  )
}

function DataPanel({ pos, rotY, color = '#06b6d4' }: { pos: [number, number, number]; rotY: number; color?: string }) {
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh>
        <planeGeometry args={[0.8, 0.5]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.28, 0.001]}>
        <planeGeometry args={[0.5, 0.02]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
      {/* data lines */}
      {[0.12, 0.04, -0.04, -0.12, -0.20].map((y, i) => (
        <mesh key={i} position={[0, y, 0.001]}>
          <planeGeometry args={[0.3 + Math.random() * 0.3, 0.01]} />
          <meshBasicMaterial color={color} transparent opacity={0.1 + Math.random() * 0.1} />
        </mesh>
      ))}
    </group>
  )
}

function ParticleField({ count = 80 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null!)
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 14
      if (i % 3 === 1) pos[i] = Math.random() * 4
    }
    return pos
  }, [count])

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#22d3ee" transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

export default function HolographicClassroom() {
  const scanRef = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => {
    if (scanRef.current) {
      scanRef.current.position.z = ((scanRef.current.position.z + delta * 0.8) % 4) - 2
    }
  })

  return (
    <group>
      {/* Holographic floor circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <ringGeometry args={[0.5, 2.5, 64]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>

      {/* Floor grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[5, 5, 16, 16]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.08} />
      </mesh>

      {/* Scanning line */}
      <mesh ref={scanRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[5, 0.03]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.3} />
      </mesh>

      {/* Rings */}
      <HolographicRing radius={1.2} y={0.6} />
      <HolographicRing radius={1.5} y={1.0} color="#06b6d4" />
      <HolographicRing radius={1.0} y={1.8} color="#38bdf8" />
      <HolographicRingH radius={1.8} y={0.1} />
      <HolographicRingH radius={2.0} y={0.2} color="#06b6d4" />

      {/* Vertical light beams */}
      {[-1.8, 1.8].map((x, i) => (
        <mesh key={i} position={[x, 0.6, 0]}>
          <cylinderGeometry args={[0.008, 0.02, 1.2, 6]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.15} />
        </mesh>
      ))}

      {/* Data panels in background */}
      <DataPanel pos={[-2.2, 1.2, -1.5]} rotY={0.3} />
      <DataPanel pos={[2.2, 1.0, -1.5]} rotY={-0.3} />
      <DataPanel pos={[0, 1.5, -2.5]} rotY={0} color="#0891b2" />

      {/* Floating particles */}
      <ParticleField />

      {/* Ambient glow ring on floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[0.8, 32]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.08} />
      </mesh>
    </group>
  )
}
