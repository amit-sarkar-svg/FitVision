import { OrbitControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { log3DDiagnostic, set3DDiagnosticState } from './ViewerDiagnostics'

const PRESETS = {
  front: { position: [0, 0.15, 7.2], target: [0, 0.1, 0] },
  side: { position: [7.2, 0.15, 0], target: [0, 0.1, 0] },
  top45: { position: [5.4, 4.6, 5.4], target: [0, 0.15, 0] },
}

export default function CameraController({ preset = 'front' }) {
  const controls = useRef(null)
  const goal = useMemo(
    () => ({ position: new THREE.Vector3(), target: new THREE.Vector3() }),
    [],
  )

  useEffect(() => {
    const next = PRESETS[preset] ?? PRESETS.front
    goal.position.set(...next.position)
    goal.target.set(...next.target)
    log3DDiagnostic('Camera preset changed', { preset, position: next.position, target: next.target })
  }, [preset, goal])

  useEffect(() => {
    log3DDiagnostic('CameraController mounted')
    return () => log3DDiagnostic('CameraController unmounted')
  }, [])

  useFrame(({ camera }, delta) => {
    const blend = 1 - Math.exp(-5 * delta)
    camera.position.lerp(goal.position, blend)
    controls.current?.target.lerp(goal.target, blend)
    controls.current?.update()
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
      minDistance={3.4}
      maxDistance={10}
      maxPolarAngle={Math.PI * 0.91}
      minPolarAngle={Math.PI * 0.08}
      enablePan
      panSpeed={0.65}
    />
  )
}
