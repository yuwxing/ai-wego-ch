import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { RobotAnim } from './RobotAvatar'

interface Props {
  animation?: RobotAnim
  animSpeed?: number
  visible?: boolean
  walkDir?: [number, number]
}

const PX = 0.125

function Box({ pos, size, color, emissive }: { pos: [number, number, number]; size: [number, number, number]; color: string; emissive?: string }) {
  return (
    <mesh position={pos} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={emissive || color}
        emissiveIntensity={emissive ? 0.6 : 0}
        roughness={0.5}
        metalness={0.3}
      />
    </mesh>
  )
}

export default function IsometricRobot({ animation = 'idle', animSpeed = 1, visible = true, walkDir }: Props) {
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

    joints.body.position.y = 0.75 + bob
    joints.body.rotation.x = bob * 0.3

    joints.head.position.y = 1.30 + bob

    joints.leftArm.position.set(-0.38, 1.00 + bob, 0)
    joints.leftArm.rotation.x = armSwing * 0.8
    joints.rightArm.position.set(0.38, 1.00 + bob, 0)
    joints.rightArm.rotation.x = -armSwing * 0.8

    if (animation === 'wave') {
      joints.rightArm.rotation.x = -1.2 + Math.sin(t * 3) * 0.3
    }

    joints.leftLeg.position.set(-0.12, 0.38 + bob * 0.3, 0)
    joints.leftLeg.rotation.x = legSwing
    joints.rightLeg.position.set(0.12, 0.38 + bob * 0.3, 0)
    joints.rightLeg.rotation.x = -legSwing
  })

  if (!visible) return null

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Body */}
      <primitive object={joints.body}>
        {/* Main torso */}
        <Box pos={[0, 0, 0]} size={[PX * 4, PX * 4, PX * 2]} color="#3b82f6" />
        {/* Belt */}
        <Box pos={[0, -PX * 1.5, 0]} size={[PX * 4, PX * 0.8, PX * 2.2]} color="#1e40af" />
        {/* Chest plate */}
        <Box pos={[0, PX * 1, PX * 1.2]} size={[PX * 2.5, PX * 1.5, PX * 0.4]} color="#60a5fa" emissive="#60a5fa" />
        {/* Heart / power light */}
        <Box pos={[0, 0, PX * 1.4]} size={[PX * 0.6, PX * 0.6, PX * 0.3]} color="#ef4444" emissive="#ef4444" />
      </primitive>

      {/* Head */}
      <primitive object={joints.head}>
        {/* Main head block */}
        <Box pos={[0, PX * 1, 0]} size={[PX * 3, PX * 3, PX * 2.5]} color="#fbbf24" />
        {/* Face screen */}
        <Box pos={[0, PX * 1, PX * 1.4]} size={[PX * 2, PX * 1.5, PX * 0.3]} color="#1e293b" />
        {/* Eyes */}
        <Box pos={[-PX * 0.6, PX * 1.2, PX * 1.6]} size={[PX * 0.5, PX * 0.5, PX * 0.3]} color="#22d3ee" emissive="#22d3ee" />
        <Box pos={[PX * 0.6, PX * 1.2, PX * 1.6]} size={[PX * 0.5, PX * 0.5, PX * 0.3]} color="#22d3ee" emissive="#22d3ee" />
        {/* Mouth */}
        <Box pos={[0, PX * 0.5, PX * 1.6]} size={[PX * 1.2, PX * 0.3, PX * 0.3]} color="#22d3ee" emissive="#22d3ee" />
        {/* Antenna */}
        <Box pos={[0, PX * 2.6, 0]} size={[PX * 0.3, PX * 0.8, PX * 0.3]} color="#94a3b8" />
        <Box pos={[0, PX * 3.2, 0]} size={[PX * 0.6, PX * 0.3, PX * 0.6]} color="#ef4444" emissive="#ef4444" />
      </primitive>

      {/* Arms */}
      <primitive object={joints.leftArm}>
        <Box pos={[0, 0, 0]} size={[PX * 0.8, PX * 3, PX * 0.8]} color="#2563eb" />
        <Box pos={[0, -PX * 1.8, 0]} size={[PX * 1.0, PX * 0.6, PX * 1.0]} color="#1e40af" />
      </primitive>
      <primitive object={joints.rightArm}>
        <Box pos={[0, 0, 0]} size={[PX * 0.8, PX * 3, PX * 0.8]} color="#2563eb" />
        <Box pos={[0, -PX * 1.8, 0]} size={[PX * 1.0, PX * 0.6, PX * 1.0]} color="#1e40af" />
      </primitive>

      {/* Legs */}
      <primitive object={joints.leftLeg}>
        <Box pos={[0, -PX * 1.2, 0]} size={[PX * 0.8, PX * 2.4, PX * 0.8]} color="#1d4ed8" />
        <Box pos={[0, -PX * 2.6, 0]} size={[PX * 1.0, PX * 0.5, PX * 1.2]} color="#1e3a5f" />
      </primitive>
      <primitive object={joints.rightLeg}>
        <Box pos={[0, -PX * 1.2, 0]} size={[PX * 0.8, PX * 2.4, PX * 0.8]} color="#1d4ed8" />
        <Box pos={[0, -PX * 2.6, 0]} size={[PX * 1.0, PX * 0.5, PX * 1.2]} color="#1e3a5f" />
      </primitive>
    </group>
  )
}
