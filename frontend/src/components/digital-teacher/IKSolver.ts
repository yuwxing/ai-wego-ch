import * as THREE from 'three'

/**
 * FABRIK 2-bone IK solver for arms/legs
 *
 * Given a chain of 3 joints (root, mid, end), solves for end position = target.
 * Uses FABRIK (Forward And Backward Reaching Inverse Kinematics).
 */
export function solveTwoBoneIK(
  root: THREE.Vector3,
  mid: THREE.Vector3,
  end: THREE.Vector3,
  target: THREE.Vector3,
  upperLen: number,
  lowerLen: number,
  tolerance = 0.001,
  maxIter = 10,
): { mid: THREE.Vector3; end: THREE.Vector3 } {
  const p1 = root.clone()
  const p2 = mid.clone()
  const p3 = end.clone()

  // Clamp target reach
  const totalLen = upperLen + lowerLen
  const dir = target.clone().sub(p1)
  const dist = dir.length()
  if (dist > totalLen) {
    dir.normalize().multiplyScalar(totalLen)
    const clampedTarget = p1.clone().add(dir)
    // Full stretch: p2 along line from p1 to clampedTarget
    const t = upperLen / totalLen
    p2.lerpVectors(p1, clampedTarget, t)
    p3.copy(clampedTarget)
    return { mid: p2, end: p3 }
  }

  // FABRIK iterations
  for (let iter = 0; iter < maxIter; iter++) {
    // Forward reaching: set p3 to target, pull p2
    if (target.distanceTo(p3) < tolerance) break
    p3.copy(target)
    const d23 = p3.distanceTo(p2)
    if (d23 > 0) {
      const ratio2 = lowerLen / d23
      p2.lerp(p3, ratio2)
    }

    // Backward reaching: set p1 to root, push p2
    p1.copy(root)
    const d12 = p2.distanceTo(p1)
    if (d12 > 0) {
      const ratio1 = upperLen / d12
      p2.lerp(p1, ratio1)
    }
  }

  return { mid: p2, end: p3 }
}

/** Compute bone lengths from three positions */
export function getBoneLengths(
  root: THREE.Vector3,
  mid: THREE.Vector3,
  end: THREE.Vector3,
): [number, number] {
  return [root.distanceTo(mid), mid.distanceTo(end)]
}

/**
 * Convert quaternion rotation to apply to a bone chain.
 * Given the original bone direction and the new direction, compute the quaternion.
 */
export function getBoneRotation(
  fromDir: THREE.Vector3,
  toDir: THREE.Vector3,
): THREE.Quaternion {
  const q = new THREE.Quaternion()
  q.setFromUnitVectors(fromDir.normalize(), toDir.normalize())
  return q
}
