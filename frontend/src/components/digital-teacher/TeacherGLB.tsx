import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'
import type { RobotAnim } from './RobotAvatar'
import ChibiTeacher from './ChibiTeacher'

interface Props {
  modelUrl?: string
  animation?: RobotAnim
  animSpeed?: number
  visible?: boolean
  walkDir?: [number, number]
}

let loader: GLTFLoader | null = null
function getLoader() {
  if (!loader) loader = new GLTFLoader()
  return loader
}

export default function TeacherGLB({ modelUrl, animation = 'idle', animSpeed = 1, visible = true, walkDir }: Props) {
  const groupRef = useRef<THREE.Group>(null!)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const morphMeshes = useRef<THREE.Mesh[]>([])
  const velocityRef = useRef(new THREE.Vector3())
  const targetRotRef = useRef(0)
  const phaseRef = useRef(0)
  const talkPhaseRef = useRef(0)
  const [model, setModel] = useState<{ scene: THREE.Group; animations: THREE.AnimationClip[] } | null>(null)
  const [error, setError] = useState(false)
  const loadedUrlRef = useRef('')

  useEffect(() => {
    if (!modelUrl || modelUrl === loadedUrlRef.current) return
    loadedUrlRef.current = modelUrl
    setError(false)
    getLoader().load(modelUrl, (gltf) => {
      const meshes: THREE.Mesh[] = []
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh
          if (m.morphTargetDictionary) meshes.push(m)
        }
      })
      morphMeshes.current = meshes

      if (gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(gltf.scene)
        mixer.clipAction(gltf.animations[0]).play()
        mixerRef.current = mixer
      }

      setModel({ scene: gltf.scene, animations: gltf.animations })
    }, undefined, () => { setError(true); loadedUrlRef.current = '' })
  }, [modelUrl])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.03) * animSpeed
    phaseRef.current += dt

    if (mixerRef.current) {
      mixerRef.current.update(dt)
      const clips = model?.animations || []
      if (clips.length > 0) {
        mixerRef.current.stopAllAction()
        const target = animation === 'walk' ? 'walk' : animation === 'talk' ? 'talk' : 'idle'
        const clip = clips.find(c => c.name.toLowerCase().includes(target)) || clips[0]
        mixerRef.current.clipAction(clip).reset().play()
      }
    }

    if (model && walkDir) {
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
      const g = model.scene
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

    if (animation === 'talk') {
      talkPhaseRef.current += dt * 8
      const mouthVal = Math.max(0, Math.sin(talkPhaseRef.current)) * 0.5
      morphMeshes.current.forEach(mesh => {
        if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return
        const names = ['mouthOpen', 'jawOpen', 'viseme_sil', 'viseme_AA', 'viseme_OH', 'viseme_IH']
        names.forEach(name => {
          const idx = mesh.morphTargetDictionary![name]
          if (idx !== undefined) mesh.morphTargetInfluences![idx] = mouthVal
        })
      })
    } else {
      morphMeshes.current.forEach(mesh => {
        if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return
        const names = ['mouthOpen', 'jawOpen']
        names.forEach(name => {
          const idx = mesh.morphTargetDictionary![name]
          if (idx !== undefined) mesh.morphTargetInfluences![idx] = 0
        })
      })
    }
  })

  if (!visible) return null
  if (!modelUrl || error) return <ChibiTeacher animation={animation} animSpeed={animSpeed} walkDir={walkDir} />
  if (!model) return null

  return <primitive ref={groupRef} object={model.scene} />
}
