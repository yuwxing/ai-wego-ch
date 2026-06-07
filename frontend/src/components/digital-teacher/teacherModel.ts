import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three/addons/loaders/GLTFLoader.js'

// ── Mixamo 骨骼映射 ──
export interface SkeletonMap {
  hips: THREE.Bone | null
  spine: THREE.Bone | null
  chest: THREE.Bone | null
  neck: THREE.Bone | null
  head: THREE.Bone | null
  leftUpperArm: THREE.Bone | null
  leftLowerArm: THREE.Bone | null
  leftHand: THREE.Bone | null
  rightUpperArm: THREE.Bone | null
  rightLowerArm: THREE.Bone | null
  rightHand: THREE.Bone | null
  leftUpperLeg: THREE.Bone | null
  leftLowerLeg: THREE.Bone | null
  leftFoot: THREE.Bone | null
  rightUpperLeg: THREE.Bone | null
  rightLowerLeg: THREE.Bone | null
  rightFoot: THREE.Bone | null
}

export function extractSkeleton(skeleton: THREE.Skeleton): SkeletonMap {
  const bones = skeleton.bones
  const find = (names: string[]) => bones.find(b => names.some(n => b.name.toLowerCase().includes(n))) || null
  return {
    hips: find(['hips', 'pelvis', 'root']),
    spine: find(['spine']),
    chest: find(['chest', 'spine1', 'spine2']),
    neck: find(['neck']),
    head: find(['head']),
    leftUpperArm: find(['leftuppperarm', 'leftarm', 'upperarm_l']),
    leftLowerArm: find(['leftlowerarm', 'leftforearm', 'forearm_l']),
    leftHand: find(['lefthand', 'hand_l']),
    rightUpperArm: find(['rightupperarm', 'rightarm', 'upperarm_r']),
    rightLowerArm: find(['rightlowerarm', 'rightforearm', 'forearm_r']),
    rightHand: find(['righthand', 'hand_r']),
    leftUpperLeg: find(['leftupperleg', 'leftupleg', 'upleg_l']),
    leftLowerLeg: find(['leftlowerleg', 'leftleg', 'leg_l']),
    leftFoot: find(['leftfoot', 'foot_l']),
    rightUpperLeg: find(['rightupperleg', 'rightupleg', 'upleg_r']),
    rightLowerLeg: find(['rightlowerleg', 'rightleg', 'leg_l']),
    rightFoot: find(['rightfoot', 'foot_r']),
  }
}

// ── BlendShape ──
const VISEME_MAP: Record<string, string> = {
  AA: 'viseme_AA', EE: 'viseme_EE', IH: 'viseme_IH',
  OH: 'viseme_OH', OU: 'viseme_OU', SS: 'viseme_SS',
  F: 'viseme_F',   K: 'viseme_K',   PP: 'viseme_PP',
  TH: 'viseme_TH', SIL: 'viseme_sil',
}

export interface BlendShapeController {
  setViseme: (viseme: string, weight: number) => void
  resetVisemes: () => void
  setExpression: (name: string, weight: number) => void
}

export function useBlendShape(mesh: THREE.SkinnedMesh | null): BlendShapeController {
  const setViseme = (viseme: string, weight: number) => {
    if (!mesh?.morphTargetDictionary) return
    const key = VISEME_MAP[viseme] || `viseme_${viseme}`
    const idx = mesh.morphTargetDictionary[key]
    if (idx !== undefined && mesh.morphTargetInfluences) {
      mesh.morphTargetInfluences[idx] = weight
    }
  }

  const resetVisemes = () => {
    if (!mesh?.morphTargetDictionary) return
    for (const key of Object.values(VISEME_MAP)) {
      const idx = mesh.morphTargetDictionary[key]
      if (idx !== undefined && mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences[idx] = 0
      }
    }
  }

  const setExpression = (name: string, weight: number) => {
    if (!mesh?.morphTargetDictionary) return
    const idx = mesh.morphTargetDictionary[name]
    if (idx !== undefined && mesh.morphTargetInfluences) {
      mesh.morphTargetInfluences[idx] = weight
    }
  }

  return { setViseme, resetVisemes, setExpression }
}

// ── Model loader (using drei useGLTF) ──
export interface TeacherModelData {
  scene: THREE.Group
  skeleton: THREE.Skeleton
  bones: SkeletonMap
  animations: THREE.AnimationClip[]
  mesh: THREE.SkinnedMesh | null
}

export function useTeacherModel(url: string): TeacherModelData | null {
  // Wrap in try-catch via state
  const [data, setData] = useState<TeacherModelData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setData(null)
    setError(false)

    // Manual GLTF loading for better error handling
    import('three/addons/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
      const loader = new GLTFLoader()
      loader.load(
        url,
        (gltf) => {
          if (cancelled) return
          const scene = gltf.scene
          const skinned = scene.getObjectByProperty('type', 'SkinnedMesh') as THREE.SkinnedMesh | undefined
          if (skinned?.skeleton) {
            const bones = extractSkeleton(skinned.skeleton)
            setData({ scene, skeleton: skinned.skeleton, bones, animations: gltf.animations, mesh: skinned })
          } else {
            setError(true)
          }
        },
        undefined,
        () => { if (!cancelled) setError(true) }
      )
    }).catch(() => { if (!cancelled) setError(true) })

    return () => { cancelled = true }
  }, [url])

  if (error) return null
  return data
}

export const TEACHER_MODEL_URL = 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb'

export function getReadyPlayerMeUrl(userId: string): string {
  return `https://models.readyplayer.me/${userId}.glb`
}
