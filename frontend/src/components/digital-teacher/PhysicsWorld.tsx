import React, { createContext, useContext, useRef, useEffect, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'

interface PhysicsContextType {
  world: CANNON.World
  addBody: (body: CANNON.Body) => void
  removeBody: (body: CANNON.Body) => void
}

const PhysicsCtx = createContext<PhysicsContextType>(null!)

export function usePhysics() { return useContext(PhysicsCtx) }

export function PhysicsWorld({ children, gravity = -9.82 }: { children: ReactNode; gravity?: number }) {
  const worldRef = useRef<CANNON.World>()

  if (!worldRef.current) {
    const w = new CANNON.World({ gravity: new CANNON.Vec3(0, gravity, 0) })
    w.broadphase = new CANNON.SAPBroadphase(w)
    w.allowSleep = true
    // Ground
    const g = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() })
    g.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    w.addBody(g)
    worldRef.current = w
  }

  const world = worldRef.current

  useFrame((_, delta) => {
    world.step(1 / 60, Math.min(delta, 0.03), 3)
  })

  return (
    <PhysicsCtx.Provider value={{
      world,
      addBody: (b) => { if (!world.bodies.includes(b)) world.addBody(b) },
      removeBody: (b) => world.removeBody(b),
    }}>
      {children}
    </PhysicsCtx.Provider>
  )
}

export type BodyDef = {
  mass: number
  shape: 'box' | 'sphere' | 'cylinder'
  size: [number, number, number]
  position: [number, number, number]
}

export function useRigidBody(def: BodyDef) {
  const { addBody, removeBody } = usePhysics()
  const bodyRef = useRef<CANNON.Body>()

  useEffect(() => {
    let shape: CANNON.Shape
    const [w, h, d] = def.size
    if (def.shape === 'sphere') shape = new CANNON.Sphere(w / 2)
    else if (def.shape === 'cylinder') shape = new CANNON.Cylinder(w / 2, w / 2, h, 8)
    else shape = new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2))

    const body = new CANNON.Body({ mass: def.mass, shape, linearDamping: 0.05, angularDamping: 0.1 })
    body.position.set(...def.position)
    addBody(body)
    bodyRef.current = body

    return () => { removeBody(body) }
  }, [])

  return bodyRef
}

export function useSyncTransform(bodyRef: React.RefObject<CANNON.Body | null>, meshRef: React.RefObject<THREE.Mesh | THREE.Group | null>) {
  useFrame(() => {
    const b = bodyRef.current
    const m = meshRef.current
    if (b && m) {
      m.position.set(b.position.x, b.position.y, b.position.z)
      m.quaternion.set(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w)
    }
  })
}
