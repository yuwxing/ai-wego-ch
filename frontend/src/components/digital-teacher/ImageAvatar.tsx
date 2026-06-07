import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import type { RobotAnim } from './RobotAvatar'

interface Props {
  imageUrl: string
  animation?: RobotAnim
  animSpeed?: number
  visible?: boolean
  walkDir?: [number, number]
}

export default function ImageAvatar({ imageUrl, animation = 'idle', animSpeed = 1, visible = true, walkDir }: Props) {
  const groupRef = useRef<THREE.Group>(null!)
  const phaseRef = useRef(0)
  const velocityRef = useRef(new THREE.Vector3())
  const targetRotRef = useRef(0)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  // Load image as texture
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(imageUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      setTexture(tex)
    })
  }, [imageUrl])

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

    joints.leftArm.position.set(-0.28, 1.05 + bob, 0)
    joints.leftArm.rotation.x = armSwing * 0.8
    joints.rightArm.position.set(0.28, 1.05 + bob, 0)
    joints.rightArm.rotation.x = -armSwing * 0.8

    if (animation === 'wave') {
      joints.rightArm.rotation.x = -1.2 + Math.sin(t * 3) * 0.3
    }

    joints.leftLeg.position.set(-0.10, 0.42 + bob * 0.3, 0)
    joints.leftLeg.rotation.x = legSwing
    joints.rightLeg.position.set(0.10, 0.42 + bob * 0.3, 0)
    joints.rightLeg.rotation.x = -legSwing
  })

  if (!visible) return null

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Body with texture */}
      <primitive object={joints.body}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.50, 0.50, 0.18]} />
          {texture ? (
            <meshStandardMaterial
              map={texture}
              metalness={0.1}
              roughness={0.8}
              side={THREE.DoubleSide}
            />
          ) : (
            <meshStandardMaterial color="#8a9bb5" />
          )}
        </mesh>
        {/* Back side (solid color when no texture) */}
        {texture && (
          <mesh position={[0, 0, -0.09]} castShadow>
            <planeGeometry args={[0.48, 0.48]} />
            <meshStandardMaterial color="#2a2a3a" />
          </mesh>
        )}
      </primitive>

      {/* Head */}
      <primitive object={joints.head}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <sphereGeometry args={[0.14, 12, 12]} />
          <meshStandardMaterial color="#ffd5b8" roughness={0.6} />
        </mesh>
      </primitive>

      {/* Arms */}
      <primitive object={joints.leftArm}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.05, 0.24, 6]} />
          <meshStandardMaterial color="#4a5568" metalness={0.5} roughness={0.4} />
        </mesh>
      </primitive>
      <primitive object={joints.rightArm}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.05, 0.24, 6]} />
          <meshStandardMaterial color="#4a5568" metalness={0.5} roughness={0.4} />
        </mesh>
      </primitive>

      {/* Legs */}
      <primitive object={joints.leftLeg}>
        <mesh position={[0, -0.14, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.28, 6]} />
          <meshStandardMaterial color="#2d3748" metalness={0.5} roughness={0.5} />
        </mesh>
      </primitive>
      <primitive object={joints.rightLeg}>
        <mesh position={[0, -0.14, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.28, 6]} />
          <meshStandardMaterial color="#2d3748" metalness={0.5} roughness={0.5} />
        </mesh>
      </primitive>

      {/* Feet */}
      <mesh position={[-0.10, 0.02, 0.04]} castShadow>
        <boxGeometry args={[0.10, 0.04, 0.16]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
      <mesh position={[0.10, 0.02, 0.04]} castShadow>
        <boxGeometry args={[0.10, 0.04, 0.16]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
    </group>
  )
}
