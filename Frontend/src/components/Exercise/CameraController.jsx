import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { log3DDiagnostic, set3DDiagnosticState } from './ViewerDiagnostics'

const PRESETS = {
  front: new THREE.Vector3(0, 0.02, 1),
  side: new THREE.Vector3(1, 0.02, 0),
  top: new THREE.Vector3(1, 0.85, 1),
}

function getFitDistance(size, direction, camera) {
  const verticalFov = THREE.MathUtils.degToRad(camera.fov)
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect)
  const forward = direction.clone().negate()
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()
  const up = new THREE.Vector3().crossVectors(right, forward).normalize()
  const halfSize = size.clone().multiplyScalar(0.5)
  let distance = 0

  // Fit all eight bounds corners, accounting for the chosen view direction.
  for (const x of [-halfSize.x, halfSize.x]) {
    for (const y of [-halfSize.y, halfSize.y]) {
      for (const z of [-halfSize.z, halfSize.z]) {
        const corner = new THREE.Vector3(x, y, z)
        const horizontal = Math.abs(corner.dot(right)) / Math.tan(horizontalFov / 2)
        const vertical = Math.abs(corner.dot(up)) / Math.tan(verticalFov / 2)
        distance = Math.max(distance, corner.dot(direction) + horizontal, corner.dot(direction) + vertical)
      }
    }
  }

  return distance * 1.12
}

export default function CameraController({ preset = 'front', frame }) {
  const controls = useRef(null)
  const isTransitioning = useRef(false)
  const { camera } = useThree()
  const goal = useMemo(
    () => ({ position: new THREE.Vector3(), target: new THREE.Vector3() }),
    [],
  )
  const limits = useMemo(() => {
    const fallback = new THREE.Vector3(4.5, 4.6, 1)
    const direction = (PRESETS[preset] ?? PRESETS.front).clone().normalize()
    const fitDistance = getFitDistance(frame?.size ?? fallback, direction, camera)

    return { fitDistance, minDistance: fitDistance * 0.9, maxDistance: fitDistance * 2 }
  }, [camera, frame, preset])

  useEffect(() => {
    const direction = (PRESETS[preset] ?? PRESETS.front).clone().normalize()
    goal.position.copy(direction.multiplyScalar(limits.fitDistance))
    goal.target.set(0, 0, 0)
    isTransitioning.current = true
    log3DDiagnostic('Camera preset changed', {
      preset,
      position: goal.position.toArray(),
      target: goal.target.toArray(),
      fitDistance: limits.fitDistance,
    })
  }, [goal, limits.fitDistance, preset])

  useEffect(() => {
    log3DDiagnostic('CameraController mounted')
    return () => log3DDiagnostic('CameraController unmounted')
  }, [])

  useFrame(({ camera }, delta) => {
    if (!isTransitioning.current) return

    const blend = 1 - Math.exp(-5 * delta)
    camera.position.lerp(goal.position, blend)
    controls.current?.target.lerp(goal.target, blend)
    controls.current?.update()

    if (camera.position.distanceTo(goal.position) < 0.005 && controls.current?.target.distanceTo(goal.target) < 0.005) {
      isTransitioning.current = false
    }
    set3DDiagnosticState({
      orbitTarget: controls.current?.target.toArray() ?? null,
      cameraGoal: goal.position.toArray(),
    })
  })

  return (
    <OrbitControls
      ref={controls}
      enableDamping
      dampingFactor={0.08}
      minDistance={limits.minDistance}
      maxDistance={limits.maxDistance}
      maxPolarAngle={Math.PI * 0.91}
      minPolarAngle={Math.PI * 0.08}
      enablePan
      panSpeed={0.65}
    />
  )
}
