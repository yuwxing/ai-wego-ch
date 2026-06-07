import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TEACHER_MODEL_URL, useTeacherModel, useBlendShape, type BlendShapeController, type SkeletonMap } from './teacherModel'
import { AnimationController, type AnimState } from './TeacherAnimation'

export interface TeacherAvatarProps {
  modelUrl?: string
  animation?: AnimState
  animationSpeed?: number
  visible?: boolean
}

export interface TeacherAvatarHandle {
  model: THREE.Group | null
  skeleton: THREE.Skeleton | null
  bones: SkeletonMap | null
  blendShape: BlendShapeController | null
  animCtrl: AnimationController | null
  play: (state: AnimState) => void
}

const TeacherAvatar = forwardRef<TeacherAvatarHandle, TeacherAvatarProps>(
  ({ modelUrl = TEACHER_MODEL_URL, animation = 'idle', animationSpeed = 1, visible = true }, ref) => {
    const modelData = useTeacherModel(modelUrl)
    const animCtrlRef = useRef<AnimationController | null>(null)
    const modelRef = useRef<THREE.Group | null>(null)
    const blendShapeRef = useRef<BlendShapeController | null>(null)
    const bonesRef = useRef<SkeletonMap | null>(null)
    const [failed, setFailed] = useState(false)

    useEffect(() => {
      if (modelData === null) {
        setFailed(true)
        return
      }
      if (!modelData.animations?.length) return

      setFailed(false)
      const mixer = new THREE.AnimationMixer(modelData.scene)
      const ctrl = new AnimationController(mixer, modelData.animations)
      animCtrlRef.current = ctrl
      bonesRef.current = modelData.bones

      if (modelData.mesh) {
        blendShapeRef.current = useBlendShape(modelData.mesh)
      }

      modelData.scene.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.SkinnedMesh) {
          child.castShadow = true
          child.receiveShadow = true
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          mats.forEach((mat: THREE.Material) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.envMapIntensity = 0.4
              mat.roughness = mat.roughness ?? 0.5
              mat.metalness = mat.metalness ?? 0.1
            }
          })
        }
      })

      modelRef.current = modelData.scene
      ctrl.play(animation, 0.3)

      return () => { ctrl.dispose() }
    }, [modelData])

    useEffect(() => {
      animCtrlRef.current?.play(animation, 0.25)
    }, [animation])

    useEffect(() => {
      animCtrlRef.current?.setSpeed(animationSpeed)
    }, [animationSpeed])

    useImperativeHandle(ref, () => ({
      model: modelRef.current,
      skeleton: modelData?.skeleton ?? null,
      bones: bonesRef.current,
      blendShape: blendShapeRef.current,
      animCtrl: animCtrlRef.current,
      play: (state: AnimState) => animCtrlRef.current?.play(state),
    }))

    useFrame((_, delta) => {
      const ctrl = animCtrlRef.current
      if (!ctrl) return
      ctrl.update(delta)
      const bs = blendShapeRef.current
      if (bs) {
        ctrl.updateBlink(delta, bs.setExpression)
        ctrl.updateViseme(delta, bs.setViseme)
      }
    })

    if (!visible) return null

    // Fallback: procedural humanoid silhouette when model fails
    if (failed || !modelData) {
      return <FallbackModel />
    }

    return <primitive object={modelData.scene} />
  }
)

TeacherAvatar.displayName = 'TeacherAvatar'

/** Minimal procedural fallback when GLTF model fails to load */
function FallbackModel() {
  const groupRef = useRef<THREE.Group>(null!)
  useFrame((_, delta) => {
    groupRef.current.rotation.y += delta * 0.3
  })

  return (
    <group ref={groupRef} position={[0, 1, 0]}>
      {/* Body */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.5, 8, 16]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#a78bfa" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Hat (graduation cap) */}
      <mesh position={[0, 0.98, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.32, 0.04, 0.28]} />
        <meshStandardMaterial color="#4c1d95" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.02, -0.12]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.04, 0.06, 0.06]} />
        <meshStandardMaterial color="#4c1d95" />
      </mesh>
      {/* Label */}
      <mesh position={[0, 0.02, 0.28]}>
        <planeGeometry args={[0.3, 0.08]} />
        <meshBasicMaterial color="#c4b5fd" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

export default TeacherAvatar
