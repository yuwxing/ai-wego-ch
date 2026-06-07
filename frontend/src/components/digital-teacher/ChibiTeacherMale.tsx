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

function Sphere({ pos, radius, color }: { pos: [number, number, number]; radius: number; color: string }) {
  return (
    <mesh position={pos} castShadow>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0} />
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

export default function ChibiTeacherMale({ animation = 'idle', animSpeed = 1, visible = true, walkDir }: Props) {
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

    joints.body.position.y = 0.58 + bob
    joints.body.rotation.x = bob * 0.3

    joints.head.position.y = 1.08 + bob

    joints.leftArm.position.set(-0.30, 0.84 + bob, 0)
    joints.leftArm.rotation.x = armSwing * 0.8
    joints.rightArm.position.set(0.30, 0.84 + bob, 0)
    joints.rightArm.rotation.x = -armSwing * 0.8

    if (animation === 'wave') {
      joints.rightArm.rotation.x = -1.2 + Math.sin(t * 3) * 0.3
    }

    joints.leftLeg.position.set(-0.11, 0.30 + bob * 0.3, 0)
    joints.leftLeg.rotation.x = legSwing
    joints.rightLeg.position.set(0.11, 0.30 + bob * 0.3, 0)
    joints.rightLeg.rotation.x = -legSwing
  })

  if (!visible) return null

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Body – suit */}
      <primitive object={joints.body}>
        {/* Torso */}
        <Cyl pos={[0, 0.02, 0]} radius={0.20} height={0.38} color="#1e293b" />
        {/* White shirt collar */}
        <Sphere pos={[0, 0.20, 0]} radius={0.10} color="#f8fafc" />
        {/* Tie */}
        <Cyl pos={[0, 0.08, 0.14]} radius={0.025} height={0.20} color="#3b82f6" />
        <Sphere pos={[0, 0.18, 0.14]} radius={0.035} color="#3b82f6" />
        {/* Suit jacket bottom */}
        <Cyl pos={[0, -0.16, 0]} radius={0.18} height={0.08} color="#0f172a" />
      </primitive>

      {/* Head */}
      <primitive object={joints.head}>
        {/* Face */}
        <Sphere pos={[0, 0.05, 0]} radius={0.16} color="#fce4d6" />
        {/* Hair – short male */}
        <Sphere pos={[0, 0.10, -0.02]} radius={0.17} color="#292524" />
        {/* Hair – top */}
        <mesh position={[0, 0.14, 0.02]}>
          <sphereGeometry args={[0.17, 16, 16, 0, Math.PI * 2, 0, Math.PI / 3]} />
          <meshStandardMaterial color="#292524" roughness={0.8} />
        </mesh>
        {/* Hair – front fringe */}
        <mesh position={[0, 0.06, 0.10]}>
          <sphereGeometry args={[0.17, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#292524" roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
        {/* Hair – back */}
        <Cyl pos={[0, -0.02, -0.12]} radius={0.13} height={0.25} color="#292524" />

        {/* Eyes */}
        <Sphere pos={[-0.07, 0.08, 0.14]} radius={0.035} color="#1e293b" />
        <Sphere pos={[0.07, 0.08, 0.14]} radius={0.035} color="#1e293b" />
        {/* Eye highlights */}
        <Sphere pos={[-0.06, 0.10, 0.16]} radius={0.012} color="white" />
        <Sphere pos={[0.08, 0.10, 0.16]} radius={0.012} color="white" />
        {/* Eyebrows */}
        <Cyl pos={[-0.09, 0.14, 0.13]} radius={0.01} height={0.05} color="#292524" />
        <Cyl pos={[0.09, 0.14, 0.13]} radius={0.01} height={0.05} color="#292524" />
        {/* Mouth */}
        <Sphere pos={[0, -0.02, 0.15]} radius={0.012} color="#b91c1c" />
      </primitive>

      {/* Arms */}
      <primitive object={joints.leftArm}>
        <Cyl pos={[0, -0.10, 0]} radius={0.035} height={0.22} color="#1e293b" />
        <Sphere pos={[0, -0.22, 0]} radius={0.035} color="#fce4d6" />
      </primitive>
      <primitive object={joints.rightArm}>
        <Cyl pos={[0, -0.10, 0]} radius={0.035} height={0.22} color="#1e293b" />
        <Sphere pos={[0, -0.22, 0]} radius={0.035} color="#fce4d6" />
      </primitive>

      {/* Legs & shoes */}
      <primitive object={joints.leftLeg}>
        <Cyl pos={[0, -0.10, 0]} radius={0.045} height={0.22} color="#0f172a" />
        <Sphere pos={[0, -0.22, 0.03]} radius={0.055} color="#020617" />
      </primitive>
      <primitive object={joints.rightLeg}>
        <Cyl pos={[0, -0.10, 0]} radius={0.045} height={0.22} color="#0f172a" />
        <Sphere pos={[0, -0.22, 0.03]} radius={0.055} color="#020617" />
      </primitive>
    </group>
  )
}
