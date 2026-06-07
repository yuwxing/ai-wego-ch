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

function Sphere({ pos, radius, color, emissive }: { pos: [number, number, number]; radius: number; color: string; emissive?: string }) {
  return (
    <mesh position={pos} castShadow>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive || color}
        emissiveIntensity={emissive ? 0.5 : 0}
        roughness={0.3}
        metalness={0}
      />
    </mesh>
  )
}

function Cyl({ pos, radius, height, color }: { pos: [number, number, number]; radius: number; height: number; color: string }) {
  return (
    <mesh position={pos} castShadow>
      <cylinderGeometry args={[radius, radius, height, 10]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  )
}

export default function ChibiTeacher({ animation = 'idle', animSpeed = 1, visible = true, walkDir }: Props) {
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

    joints.body.position.y = 0.55 + bob
    joints.body.rotation.x = bob * 0.3

    joints.head.position.y = 1.05 + bob

    joints.leftArm.position.set(-0.28, 0.82 + bob, 0)
    joints.leftArm.rotation.x = armSwing * 0.8
    joints.rightArm.position.set(0.28, 0.82 + bob, 0)
    joints.rightArm.rotation.x = -armSwing * 0.8

    if (animation === 'wave') {
      joints.rightArm.rotation.x = -1.2 + Math.sin(t * 3) * 0.3
    }

    joints.leftLeg.position.set(-0.10, 0.28 + bob * 0.3, 0)
    joints.leftLeg.rotation.x = legSwing
    joints.rightLeg.position.set(0.10, 0.28 + bob * 0.3, 0)
    joints.rightLeg.rotation.x = -legSwing
  })

  if (!visible) return null

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Body – dress */}
      <primitive object={joints.body}>
        {/* Torso */}
        <Cyl pos={[0, 0, 0]} radius={0.18} height={0.35} color="#ec4899" />
        {/* White collar */}
        <Sphere pos={[0, 0.18, 0]} radius={0.10} color="#f8fafc" />
        {/* Skirt flare */}
        <mesh position={[0, -0.16, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.30, 0.15, 10]} />
          <meshStandardMaterial color="#db2777" roughness={0.6} />
        </mesh>
        {/* Bow tie */}
        <Sphere pos={[0, 0.12, 0.14]} radius={0.05} color="#ef4444" />
        <Sphere pos={[-0.06, 0.12, 0.14]} radius={0.04} color="#ef4444" />
        <Sphere pos={[0.06, 0.12, 0.14]} radius={0.04} color="#ef4444" />
      </primitive>

      {/* Head */}
      <primitive object={joints.head}>
        {/* Face */}
        <Sphere pos={[0, 0.05, 0]} radius={0.16} color="#fce4d6" />
        {/* Hair – main */}
        <Sphere pos={[0, 0.08, -0.02]} radius={0.17} color="#1c1917" />
        {/* Hair – bangs */}
        <mesh position={[0, 0.08, 0.10]}>
          <sphereGeometry args={[0.17, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1c1917" roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
        {/* Hair – side left */}
        <Cyl pos={[-0.20, -0.10, 0]} radius={0.04} height={0.35} color="#1c1917" />
        <Cyl pos={[-0.22, -0.28, 0]} radius={0.06} height={0.08} color="#1c1917" />
        {/* Hair – side right */}
        <Cyl pos={[0.20, -0.10, 0]} radius={0.04} height={0.35} color="#1c1917" />
        <Cyl pos={[0.22, -0.28, 0]} radius={0.06} height={0.08} color="#1c1917" />
        {/* Hair – back long */}
        <Cyl pos={[0, -0.10, -0.12]} radius={0.12} height={0.40} color="#1c1917" />
        <Sphere pos={[0, -0.32, -0.12]} radius={0.10} color="#1c1917" />

        {/* Eyes – big anime style */}
        <Sphere pos={[-0.07, 0.08, 0.14]} radius={0.04} color="#1e293b" />
        <Sphere pos={[0.07, 0.08, 0.14]} radius={0.04} color="#1e293b" />
        {/* Eye highlights */}
        <Sphere pos={[-0.06, 0.10, 0.16]} radius={0.015} color="white" />
        <Sphere pos={[0.08, 0.10, 0.16]} radius={0.015} color="white" />
        {/* Blush */}
        <Sphere pos={[-0.12, 0.02, 0.14]} radius={0.025} color="#fca5a5" />
        <Sphere pos={[0.12, 0.02, 0.14]} radius={0.025} color="#fca5a5" />
        {/* Mouth */}
        <Sphere pos={[0, -0.02, 0.15]} radius={0.015} color="#ef4444" />
        {/* Hair accessory – flower */}
        <Sphere pos={[0.16, 0.15, 0.08]} radius={0.04} color="#f472b6" emissive="#f472b6" />
      </primitive>

      {/* Arms */}
      <primitive object={joints.leftArm}>
        <Cyl pos={[0, -0.10, 0]} radius={0.03} height={0.20} color="#fce4d6" />
      </primitive>
      <primitive object={joints.rightArm}>
        <Cyl pos={[0, -0.10, 0]} radius={0.03} height={0.20} color="#fce4d6" />
      </primitive>

      {/* Legs */}
      <primitive object={joints.leftLeg}>
        <Cyl pos={[0, -0.10, 0]} radius={0.04} height={0.20} color="#fce4d6" />
        {/* Shoe */}
        <Sphere pos={[0, -0.20, 0.03]} radius={0.05} color="#1e293b" />
      </primitive>
      <primitive object={joints.rightLeg}>
        <Cyl pos={[0, -0.10, 0]} radius={0.04} height={0.20} color="#fce4d6" />
        <Sphere pos={[0, -0.20, 0.03]} radius={0.05} color="#1e293b" />
      </primitive>
    </group>
  )
}
