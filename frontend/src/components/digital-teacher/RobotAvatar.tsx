import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type RobotAnim = 'idle' | 'walk' | 'talk' | 'wave' | 'point'

interface Props {
  animation?: RobotAnim
  animSpeed?: number
  visible?: boolean
  walkDir?: [number, number]
}

function Shell({ pos, size, color, emissive }: { pos: [number, number, number]; size: [number, number, number]; color: string; emissive?: string }) {
  return (
    <mesh position={pos} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={emissive || color}
        emissiveIntensity={emissive ? 0.2 : 0}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  )
}

function Capsule({ pos, radius, height, color }: { pos: [number, number, number]; radius: number; height: number; color: string }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[radius, radius, height, 12]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, height / 2, 0]}>
        <sphereGeometry args={[radius, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, -height / 2, 0]}>
        <sphereGeometry args={[radius, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
    </group>
  )
}

export default function RobotAvatar({ animation = 'idle', animSpeed = 1, visible = true, walkDir }: Props) {
  const groupRef = useRef<THREE.Group>(null!)
  const phaseRef = useRef(0)
  const velocityRef = useRef(new THREE.Vector3())
  const targetRotRef = useRef(0)

  const joints = useMemo(() => ({
    body: new THREE.Object3D(),
    head: new THREE.Object3D(),
    leftArm: new THREE.Object3D(),
    rightArm: new THREE.Object3D(),
    leftLeg: new THREE.Object3D(),
    rightLeg: new THREE.Object3D(),
  }), [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.03) * animSpeed
    phaseRef.current += dt
    const t = phaseRef.current

    if (walkDir) {
      const [fx, fz] = walkDir
      const speed = 1.8 * animSpeed
      const dir = new THREE.Vector3(fx, 0, fz)
      if (dir.length() > 0) {
        dir.normalize().multiplyScalar(speed * dt)
        velocityRef.current.lerp(dir, 0.2)
        targetRotRef.current = Math.atan2(fx, fz)
      } else {
        velocityRef.current.lerp(new THREE.Vector3(), 0.15)
      }
    }
    const g = groupRef.current
    if (g) {
      g.position.x += velocityRef.current.x
      g.position.z += velocityRef.current.z
      if (velocityRef.current.lengthSq() > 0.001) {
        const target = targetRotRef.current
        let diff = target - g.rotation.y
        while (diff > Math.PI) diff -= Math.PI * 2
        while (diff < -Math.PI) diff += Math.PI * 2
        g.rotation.y += diff * 6 * dt
      }
    }

    let bob = 0, armSwing = 0, legSwing = 0
    switch (animation) {
      case 'walk':
        bob = Math.abs(Math.sin(t * 4)) * 0.03
        armSwing = Math.sin(t * 4) * 0.3
        legSwing = Math.sin(t * 4) * 0.3
        break
      case 'talk':
        bob = Math.sin(t * 6) * 0.008
        armSwing = Math.abs(Math.sin(t * 8)) * 0.04
        break
      case 'wave':
        bob = Math.sin(t * 2) * 0.005
        break
      default:
        bob = Math.sin(t * 1.5) * 0.008
    }

    joints.body.position.y = 0.65 + bob
    joints.body.rotation.x = bob * 0.3

    joints.head.position.y = 1.20 + bob

    joints.leftArm.position.set(-0.32, 0.95 + bob, 0)
    joints.leftArm.rotation.x = armSwing * 0.8
    joints.rightArm.position.set(0.32, 0.95 + bob, 0)
    joints.rightArm.rotation.x = -armSwing * 0.8

    if (animation === 'wave') {
      joints.rightArm.rotation.x = -1.2 + Math.sin(t * 3) * 0.3
    }

    joints.leftLeg.position.set(-0.13, 0.35 + bob * 0.3, 0)
    joints.leftLeg.rotation.x = legSwing
    joints.rightLeg.position.set(0.13, 0.35 + bob * 0.3, 0)
    joints.rightLeg.rotation.x = -legSwing
  })

  if (!visible) return null

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Body – smooth white shell */}
      <primitive object={joints.body}>
        <Capsule pos={[0, 0, 0]} radius={0.20} height={0.40} color="#f1f5f9" />
        {/* Chest accent line */}
        <Shell pos={[0, 0.08, 0.12]} size={[0.20, 0.01, 0.02]} color="#3b82f6" emissive="#3b82f6" />
        <Shell pos={[0, -0.02, 0.12]} size={[0.16, 0.01, 0.02]} color="#3b82f6" emissive="#3b82f6" />
        {/* Power indicator */}
        <mesh position={[0, 0.20, 0.12]}>
          <circleGeometry args={[0.02, 8]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
        {/* Waist ring */}
        <Shell pos={[0, -0.18, 0]} size={[0.34, 0.04, 0.20]} color="#94a3b8" />
      </primitive>

      {/* Head */}
      <primitive object={joints.head}>
        {/* Main head */}
        <Capsule pos={[0, 0, 0]} radius={0.13} height={0.16} color="#f1f5f9" />
        {/* Visor / face */}
        <Shell pos={[0, 0.02, 0.10]} size={[0.16, 0.10, 0.03]} color="#0f172a" />
        {/* Eyes (LED dots) */}
        <mesh position={[-0.05, 0.04, 0.12]}>
          <circleGeometry args={[0.015, 8]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
        <mesh position={[0.05, 0.04, 0.12]}>
          <circleGeometry args={[0.015, 8]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
        {/* Top antenna dome */}
        <mesh position={[0, 0.12, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
      </primitive>

      {/* Arms – smooth dark */}
      <primitive object={joints.leftArm}>
        <Capsule pos={[0, -0.12, 0]} radius={0.045} height={0.24} color="#334155" />
        <mesh position={[0, -0.24, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.2} />
        </mesh>
      </primitive>
      <primitive object={joints.rightArm}>
        <Capsule pos={[0, -0.12, 0]} radius={0.045} height={0.24} color="#334155" />
        <mesh position={[0, -0.24, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.2} />
        </mesh>
      </primitive>

      {/* Legs */}
      <primitive object={joints.leftLeg}>
        <Capsule pos={[0, -0.14, 0]} radius={0.055} height={0.28} color="#1e293b" />
        <mesh position={[0, -0.28, 0.04]}>
          <boxGeometry args={[0.08, 0.04, 0.14]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
      </primitive>
      <primitive object={joints.rightLeg}>
        <Capsule pos={[0, -0.14, 0]} radius={0.055} height={0.28} color="#1e293b" />
        <mesh position={[0, -0.28, 0.04]}>
          <boxGeometry args={[0.08, 0.04, 0.14]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
      </primitive>
    </group>
  )
}
