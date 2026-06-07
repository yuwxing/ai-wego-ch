import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { usePhysics } from './PhysicsWorld'
import TeacherAvatar, { type TeacherAvatarHandle } from './TeacherAvatar'
import { getBoneLengths, solveTwoBoneIK } from './IKSolver'

// ── Physics body definition (11 parts, matches Mixamo skeleton) ──
interface BodyPart {
  name: string
  size: [number, number, number]
  mass: number
  pos: [number, number, number]
  shape: 'box' | 'sphere'
  boneName: string  // Corresponding bone name for sync
}

// Positions are relative to ground (feet at y≈0), in standing Ao-pose
const PARTS: BodyPart[] = [
  { name: 'head',     size: [0.26, 0.26, 0.24], mass: 4,  pos: [0, 1.60, 0],     shape: 'sphere', boneName: 'head' },
  { name: 'chest',    size: [0.40, 0.34, 0.20], mass: 14, pos: [0, 1.28, 0],     shape: 'box',    boneName: 'chest' },
  { name: 'pelvis',   size: [0.36, 0.20, 0.20], mass: 8,  pos: [0, 1.00, 0],     shape: 'box',    boneName: 'hips' },
  { name: 'uaL',      size: [0.10, 0.30, 0.10], mass: 4,  pos: [-0.24, 1.36, 0], shape: 'box',    boneName: 'leftUpperArm' },
  { name: 'laL',      size: [0.09, 0.28, 0.09], mass: 3,  pos: [-0.24, 1.02, 0], shape: 'box',    boneName: 'leftLowerArm' },
  { name: 'uaR',      size: [0.10, 0.30, 0.10], mass: 4,  pos: [0.24, 1.36, 0],  shape: 'box',    boneName: 'rightUpperArm' },
  { name: 'laR',      size: [0.09, 0.28, 0.09], mass: 3,  pos: [0.24, 1.02, 0],  shape: 'box',    boneName: 'rightLowerArm' },
  { name: 'ulL',      size: [0.14, 0.36, 0.14], mass: 7,  pos: [-0.10, 0.68, 0], shape: 'box',    boneName: 'leftUpperLeg' },
  { name: 'llL',      size: [0.12, 0.36, 0.12], mass: 5,  pos: [-0.10, 0.30, 0], shape: 'box',    boneName: 'leftLowerLeg' },
  { name: 'ulR',      size: [0.14, 0.36, 0.14], mass: 7,  pos: [0.10, 0.68, 0],  shape: 'box',    boneName: 'rightUpperLeg' },
  { name: 'llR',      size: [0.12, 0.36, 0.12], mass: 5,  pos: [0.10, 0.30, 0],  shape: 'box',    boneName: 'rightLowerLeg' },
]

type JointDef = [number, number, [number, number, number], [number, number, number]]

const JOINTS: JointDef[] = [
  [0, 1, [0, -0.13, 0], [0, 0.17, 0]],       // head → chest
  [1, 2, [0, -0.17, 0], [0, 0.10, 0]],       // chest → pelvis
  [1, 3, [-0.20, 0.14, 0], [0, 0.15, 0]],    // chest → uaL
  [1, 5, [0.20, 0.14, 0], [0, 0.15, 0]],     // chest → uaR
  [3, 4, [0, -0.15, 0], [0, 0.14, 0]],       // uaL → laL
  [5, 6, [0, -0.15, 0], [0, 0.14, 0]],       // uaR → laR
  [2, 7, [0, -0.10, 0], [0, 0.18, 0]],       // pelvis → ulL
  [2, 9, [0, -0.10, 0], [0, 0.18, 0]],       // pelvis → ulR
  [7, 8, [0, -0.18, 0], [0, 0.18, 0]],       // ulL → llL
  [9, 10, [0, -0.18, 0], [0, 0.18, 0]],      // ulR → llR
]

export type TeacherMode = 'idle' | 'walk' | 'ragdoll' | 'talk' | 'teach'

interface Props {
  mode: TeacherMode
  walkDir: [number, number]
  onStable?: (stable: boolean) => void
  modelUrl?: string
  ikTarget?: [number, number, number] | null  // World-space target for arm IK (teaching)
}

export default function TeacherCharacter({ mode, walkDir, onStable, modelUrl, ikTarget }: Props) {
  const { world } = usePhysics()
  const bodiesRef = useRef<CANNON.Body[]>([])
  const avatarRef = useRef<TeacherAvatarHandle>(null!)
  const walkPhaseRef = useRef(0)

  // Init physics bodies
  useEffect(() => {
    const bodies: CANNON.Body[] = []

    PARTS.forEach((p, i) => {
      let shape: CANNON.Shape
      if (p.shape === 'sphere') shape = new CANNON.Sphere(p.size[0] / 2)
      else shape = new CANNON.Box(new CANNON.Vec3(p.size[0] / 2, p.size[1] / 2, p.size[2] / 2))
      const body = new CANNON.Body({ mass: p.mass, shape, linearDamping: 0.04, angularDamping: 0.08 })
      body.position.set(...p.pos)
      world.addBody(body)
      bodies[i] = body
    })

    JOINTS.forEach(([pi, ci, pa, pb]) => {
      const c = new CANNON.PointToPointConstraint(
        bodies[pi], new CANNON.Vec3(...pa),
        bodies[ci], new CANNON.Vec3(...pb), 8e5
      )
      c.collideConnected = true
      world.addConstraint(c)
    })

    bodiesRef.current = bodies
    return () => {
      bodies.forEach(b => world.removeBody(b))
    }
  }, [])

  // ── PID active balance + bone sync ──
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.03)
    const bodies = bodiesRef.current
    const [pelvis, chest] = [bodies[2], bodies[1]]
    if (!pelvis || !chest) return

    // PID torso balance
    const q = chest.quaternion
    const a = 2 * Math.acos(Math.min(1, Math.max(-1, q.w)))
    const sh = Math.sin(a / 2)
    const ex = sh > 0.001 ? q.x / sh * a : 0
    const ez = sh > 0.001 ? q.z / sh * a : 0
    chest.applyTorque(new CANNON.Vec3(-ex * 20, 0, -ez * 20))
    chest.applyTorque(new CANNON.Vec3(-chest.angularVelocity.x * 6, 0, -chest.angularVelocity.z * 6))

    // Height spring
    const targetY = 0.15
    const bottom = pelvis.position.y - 0.18
    const dy = targetY - bottom
    pelvis.applyForce(new CANNON.Vec3(0, dy * 60 - pelvis.velocity.y * 12, 0), pelvis.position)

    onStable?.(Math.abs(ex) < 0.08 && Math.abs(ez) < 0.08)

    if (mode === 'ragdoll') return

    // Walk
    const [fx, fz] = walkDir
    if ((mode === 'walk' || mode === 'talk') && (fx !== 0 || fz !== 0)) {
      walkPhaseRef.current += dt * 3
      const s = Math.sin(walkPhaseRef.current * Math.PI)
      const pulse = Math.max(0, s) * 100
      const fwd = new THREE.Vector3(fx, 0, fz).normalize()
      pelvis.applyForce(new CANNON.Vec3(fwd.x * pulse, 0, fwd.z * pulse), pelvis.position)
      const bounce = Math.abs(s) * 0.04
      pelvis.applyForce(new CANNON.Vec3(0, bounce * 150, 0), pelvis.position)
    }

    // ── Sync skeleton bones → physics bodies ──
    const avatar = avatarRef.current
    const bones = avatar?.bones
    if (!bones) return

    const syncBone = (boneName: keyof typeof bones, bodyIdx: number) => {
      const bone = bones[boneName]
      const body = bodies[bodyIdx]
      if (!bone || !body) return
      bone.position.set(body.position.x, body.position.y, body.position.z)
      bone.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)
    }

    syncBone('head', 0)
    syncBone('chest', 1)
    syncBone('hips', 2)
    syncBone('leftUpperArm', 3)
    syncBone('leftLowerArm', 4)
    syncBone('rightUpperArm', 5)
    syncBone('rightLowerArm', 6)
    syncBone('leftUpperLeg', 7)
    syncBone('leftLowerLeg', 8)
    syncBone('rightUpperLeg', 9)
    syncBone('rightLowerLeg', 10)

    // ── Foot IK: ground alignment ──
    const leftFoot = bones.leftFoot
    const rightFoot = bones.rightFoot
    if (leftFoot) {
      if (leftFoot.position.y < 0) leftFoot.position.y = 0
      leftFoot.quaternion.slerp(new THREE.Quaternion(), 1)
    }
    if (rightFoot) {
      if (rightFoot.position.y < 0) rightFoot.position.y = 0
      rightFoot.quaternion.slerp(new THREE.Quaternion(), 1)
    }

    // ── Arm IK: point toward target (teaching mode) ──
    if (ikTarget && (mode === 'teach')) {
      const rUpper = bones.rightUpperArm
      const rLower = bones.rightLowerArm
      const rHand = bones.rightHand
      if (rUpper && rLower && rHand) {
        const target = new THREE.Vector3(...ikTarget)
        const root = rUpper.position.clone()
        const mid = rLower.position.clone()
        const end = rHand.position.clone()
        const [uLen, lLen] = getBoneLengths(root, mid, end)
        const result = solveTwoBoneIK(root, mid, end, target, uLen, lLen)

        // Apply IK positions
        rLower.position.copy(result.mid)
        rHand.position.copy(result.end)
      }

      // Mirror for left arm (follow)
      const lUpper = bones.leftUpperArm
      const lLower = bones.leftLowerArm
      const lHand = bones.leftHand
      if (lUpper && lLower && lHand) {
        const target = new THREE.Vector3(...ikTarget)
        const root = lUpper.position.clone()
        const mid = lLower.position.clone()
        const end = lHand.position.clone()
        const [uLen, lLen] = getBoneLengths(root, mid, end)
        const result = solveTwoBoneIK(root, mid, end, target, uLen, lLen)
        lLower.position.copy(result.mid)
        lHand.position.copy(result.end)
      }
    }
  })

  return (
    <group>
      <TeacherAvatar
        ref={avatarRef}
        modelUrl={modelUrl}
        animation={mode === 'idle' ? 'idle' : mode === 'talk' ? 'talk' : mode === 'walk' ? 'walk' : 'idle'}
        animationSpeed={1}
      />
    </group>
  )
}
