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

/** Shared mesh material components to avoid Three instances in JSX */
function MatMetal() { return <meshStandardMaterial color="#8a9bb5" metalness={0.85} roughness={0.25} /> }
function MatDarkMetal() { return <meshStandardMaterial color="#4a5568" metalness={0.9} roughness={0.3} /> }
function MatAccent() { return <meshStandardMaterial color="#3b82f6" metalness={0.7} roughness={0.2} emissive="#1d4ed8" emissiveIntensity={0.3} /> }
function MatGlow() { return <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={1.5} /> }
function MatJoint() { return <meshStandardMaterial color="#6b7280" metalness={0.7} roughness={0.4} /> }
function MatChestAccent() { return <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} emissive="#1e40af" emissiveIntensity={0.15} /> }

export default function RobotAvatar({ animation = 'idle', animSpeed = 1, visible = true, walkDir }: Props) {
  const groupRef = useRef<THREE.Group>(null!)
  const phaseRef = useRef(0)
  const velocityRef = useRef(new THREE.Vector3())
  const targetRotRef = useRef(0)

  const joints = useMemo(() => ({
    head: new THREE.Object3D(),
    neck: new THREE.Object3D(),
    chest: new THREE.Object3D(),
    pelvis: new THREE.Object3D(),
    leftUpperArm: new THREE.Object3D(),
    leftLowerArm: new THREE.Object3D(),
    rightUpperArm: new THREE.Object3D(),
    rightLowerArm: new THREE.Object3D(),
    leftUpperLeg: new THREE.Object3D(),
    leftLowerLeg: new THREE.Object3D(),
    rightUpperLeg: new THREE.Object3D(),
    rightLowerLeg: new THREE.Object3D(),
    antenna: new THREE.Object3D(),
  }), [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.03) * animSpeed
    phaseRef.current += dt
    const t = phaseRef.current

    // Movement from walkDir
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

    let bob = 0, headTilt = 0, armSwing = 0, antennaBend = 0

    switch (animation) {
      case 'idle':
        bob = Math.sin(t * 1.5) * 0.008
        headTilt = Math.sin(t * 0.8) * 0.02
        armSwing = Math.sin(t * 0.5) * 0.02
        antennaBend = Math.sin(t * 2) * 0.05
        break
      case 'walk':
        bob = Math.abs(Math.sin(t * 4)) * 0.03
        headTilt = Math.sin(t * 4) * 0.01
        armSwing = Math.sin(t * 4) * 0.3
        antennaBend = Math.sin(t * 5) * 0.08
        break
      case 'talk':
        bob = Math.sin(t * 6) * 0.005
        headTilt = Math.sin(t * 2) * 0.03
        armSwing = Math.abs(Math.sin(t * 8)) * 0.06
        antennaBend = Math.sin(t * 7) * 0.1
        break
      case 'wave':
        bob = Math.sin(t * 2) * 0.005
        headTilt = -0.04
        armSwing = Math.sin(t * 3) * 0.15
        antennaBend = Math.sin(t * 2.5) * 0.07
        break
      case 'point':
        bob = 0
        headTilt = 0.03
        armSwing = 0
        antennaBend = 0.05
        break
    }

    // Apply animations
    joints.head.position.y = 1.55 + bob
    joints.head.rotation.x = headTilt
    joints.neck.position.y = 1.48
    joints.chest.position.y = 1.15 + bob * 0.5
    joints.chest.rotation.x = bob * 0.3
    joints.pelvis.position.y = 0.85

    const laSwing = animation === 'walk' ? armSwing : armSwing
    joints.leftUpperArm.position.set(-0.32, 1.30 + bob * 0.5, 0)
    joints.leftUpperArm.rotation.x = laSwing * 0.8
    joints.leftLowerArm.position.set(0, -0.22, 0)
    joints.leftLowerArm.rotation.x = Math.max(0, laSwing * 0.5 + 0.2)

    joints.rightUpperArm.position.set(0.32, 1.30 + bob * 0.5, 0)
    joints.rightUpperArm.rotation.x = -laSwing * 0.8
    joints.rightLowerArm.position.set(0, -0.22, 0)
    joints.rightLowerArm.rotation.x = Math.max(0, -laSwing * 0.5 + 0.2)

    if (animation === 'wave') {
      joints.rightUpperArm.rotation.x = -1.2 + Math.sin(t * 3) * 0.3
      joints.rightLowerArm.rotation.x = -0.5
    }
    if (animation === 'point') {
      joints.rightUpperArm.rotation.x = -0.8
      joints.rightLowerArm.rotation.x = -0.3
      joints.rightUpperArm.position.x = 0.38
    }

    const legSwing = animation === 'walk' ? Math.sin(t * 4) * 0.3 : 0
    joints.leftUpperLeg.position.set(-0.14, 0.75 + bob * 0.3, 0)
    joints.leftUpperLeg.rotation.x = legSwing
    joints.leftLowerLeg.position.set(0, -0.30, 0)
    joints.leftLowerLeg.rotation.x = Math.max(0, -legSwing * 0.5)

    joints.rightUpperLeg.position.set(0.14, 0.75 + bob * 0.3, 0)
    joints.rightUpperLeg.rotation.x = -legSwing
    joints.rightLowerLeg.position.set(0, -0.30, 0)
    joints.rightLowerLeg.rotation.x = Math.max(0, legSwing * 0.5)

    joints.antenna.position.set(0, 0.14, 0)
    joints.antenna.rotation.z = antennaBend
  })

  if (!visible) return null

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Feet */}
      <mesh position={[-0.14, 0.04, 0.06]} castShadow>
        <boxGeometry args={[0.16, 0.08, 0.22]} />
        <MatDarkMetal />
      </mesh>
      <mesh position={[0.14, 0.04, 0.06]} castShadow>
        <boxGeometry args={[0.16, 0.08, 0.22]} />
        <MatDarkMetal />
      </mesh>

      {/* Lower legs */}
      <primitive object={joints.leftLowerLeg}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.30, 8]} />
          <MatMetal />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.06, 8, 8]} />
          <MatJoint />
        </mesh>
      </primitive>
      <primitive object={joints.rightLowerLeg}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.30, 8]} />
          <MatMetal />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.06, 8, 8]} />
          <MatJoint />
        </mesh>
      </primitive>

      {/* Upper legs */}
      <primitive object={joints.leftUpperLeg}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.06, 0.30, 8]} />
          <MatDarkMetal />
        </mesh>
        <mesh position={[0, -0.15, 0]} castShadow>
          <sphereGeometry args={[0.06, 8, 8]} />
          <MatJoint />
        </mesh>
      </primitive>
      <primitive object={joints.rightUpperLeg}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.06, 0.30, 8]} />
          <MatDarkMetal />
        </mesh>
        <mesh position={[0, -0.15, 0]} castShadow>
          <sphereGeometry args={[0.06, 8, 8]} />
          <MatJoint />
        </mesh>
      </primitive>

      {/* Pelvis */}
      <primitive object={joints.pelvis}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.36, 0.16, 0.20]} />
          <MatDarkMetal />
        </mesh>
      </primitive>

      {/* Chest */}
      <primitive object={joints.chest}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.44, 0.44, 0.24]} />
          <MatMetal />
        </mesh>
        <mesh position={[0, 0.18, 0.13]}>
          <planeGeometry args={[0.20, 0.16]} />
          <MatChestAccent />
        </mesh>
        <mesh position={[-0.05, 0.22, 0.131]}>
          <circleGeometry args={[0.025, 8]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
        <mesh position={[0.05, 0.22, 0.131]}>
          <circleGeometry args={[0.025, 8]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
        <mesh position={[0, 0.14, 0.131]}>
          <circleGeometry args={[0.015, 8]} />
          <meshBasicMaterial color="#4ade80" />
        </mesh>
        <mesh position={[-0.24, 0.18, 0]} castShadow>
          <sphereGeometry args={[0.07, 10, 10]} />
          <MatJoint />
        </mesh>
        <mesh position={[0.24, 0.18, 0]} castShadow>
          <sphereGeometry args={[0.07, 10, 10]} />
          <MatJoint />
        </mesh>
      </primitive>

      {/* Left arm */}
      <primitive object={joints.leftUpperArm}>
        <mesh position={[0, -0.11, 0]} castShadow>
          <boxGeometry args={[0.08, 0.22, 0.08]} />
          <MatMetal />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.05, 8, 8]} />
          <MatJoint />
        </mesh>
      </primitive>
      <primitive object={joints.leftLowerArm}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <boxGeometry args={[0.07, 0.24, 0.07]} />
          <MatDarkMetal />
        </mesh>
        <mesh position={[0, -0.24, 0]} castShadow>
          <sphereGeometry args={[0.055, 8, 8]} />
          <MatJoint />
        </mesh>
        <mesh position={[0, -0.26, 0]}>
          <boxGeometry args={[0.04, 0.02, 0.06]} />
          <MatAccent />
        </mesh>
        <mesh position={[0.03, -0.26, 0]}>
          <boxGeometry args={[0.02, 0.04, 0.04]} />
          <MatAccent />
        </mesh>
        <mesh position={[-0.03, -0.26, 0]}>
          <boxGeometry args={[0.02, 0.04, 0.04]} />
          <MatAccent />
        </mesh>
      </primitive>

      {/* Right arm */}
      <primitive object={joints.rightUpperArm}>
        <mesh position={[0, -0.11, 0]} castShadow>
          <boxGeometry args={[0.08, 0.22, 0.08]} />
          <MatMetal />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.05, 8, 8]} />
          <MatJoint />
        </mesh>
      </primitive>
      <primitive object={joints.rightLowerArm}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <boxGeometry args={[0.07, 0.24, 0.07]} />
          <MatDarkMetal />
        </mesh>
        <mesh position={[0, -0.24, 0]} castShadow>
          <sphereGeometry args={[0.055, 8, 8]} />
          <MatJoint />
        </mesh>
        <mesh position={[0, -0.26, 0]}>
          <boxGeometry args={[0.04, 0.02, 0.06]} />
          <MatAccent />
        </mesh>
        <mesh position={[0.03, -0.26, 0]}>
          <boxGeometry args={[0.02, 0.04, 0.04]} />
          <MatAccent />
        </mesh>
        <mesh position={[-0.03, -0.26, 0]}>
          <boxGeometry args={[0.02, 0.04, 0.04]} />
          <MatAccent />
        </mesh>
      </primitive>

      {/* Neck */}
      <primitive object={joints.neck}>
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.065, 0.12, 8]} />
          <MatDarkMetal />
        </mesh>
      </primitive>

      {/* Head */}
      <primitive object={joints.head}>
        <mesh position={[0, 0.04, 0]} castShadow>
          <boxGeometry args={[0.28, 0.24, 0.26]} />
          <MatMetal />
        </mesh>
        <mesh position={[0, 0.04, 0.131]}>
          <planeGeometry args={[0.18, 0.16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[-0.06, 0.07, 0.14]}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <MatGlow />
        </mesh>
        <mesh position={[0.06, 0.07, 0.14]}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <MatGlow />
        </mesh>
        <mesh position={[-0.06, 0.07, 0.135]}>
          <ringGeometry args={[0.03, 0.04, 16]} />
          <meshBasicMaterial color="#93c5fd" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.06, 0.07, 0.135]}>
          <ringGeometry args={[0.03, 0.04, 16]} />
          <meshBasicMaterial color="#93c5fd" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.02, 0.14]}>
          <planeGeometry args={[0.10, 0.02]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.8} />
        </mesh>
        <mesh position={[-0.145, 0.04, 0]}>
          <boxGeometry args={[0.015, 0.08, 0.10]} />
          <MatDarkMetal />
        </mesh>
        <mesh position={[0.145, 0.04, 0]}>
          <boxGeometry args={[0.015, 0.08, 0.10]} />
          <MatDarkMetal />
        </mesh>

        <primitive object={joints.antenna}>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.015, 0.02, 0.12, 6]} />
            <MatMetal />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <MatAccent />
          </mesh>
          <pointLight position={[0, 0.22, 0]} intensity={0.3} color="#3b82f6" distance={0.5} />
        </primitive>
      </primitive>
    </group>
  )
}
