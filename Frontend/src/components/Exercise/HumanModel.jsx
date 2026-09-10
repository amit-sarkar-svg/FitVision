import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { memo, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { log3DDiagnostic, set3DDiagnosticState } from './ViewerDiagnostics'

// The supplied asset keeps its original filename in public/models/male.
const MODEL_URL = '/models/male/human%20character%203d%20model.glb'

const HumanModel = memo(function HumanModel({ onFrameReady }) {
  log3DDiagnostic('GLTF loading/read started', { url: MODEL_URL })
  const { scene } = useGLTF(MODEL_URL)

  const frame = useMemo(() => {
    scene.updateMatrixWorld(true)
    const bounds = new THREE.Box3().setFromObject(scene)
    const size = bounds.getSize(new THREE.Vector3())
    const center = bounds.getCenter(new THREE.Vector3())
    const scale = size.y > 0 ? 4.6 / size.y : 1

    // Keep different source-unit models at a consistent viewer height, then
    // offset the wrapper by the actual bounds center rather than its origin.
    return {
      scale,
      position: center.multiplyScalar(-scale),
      size: size.multiplyScalar(scale),
    }
  }, [scene])

  useEffect(() => {
    let meshCount = 0
    let visibleMeshCount = 0
    scene.traverse((object) => {
      if (!object.isMesh) return
      meshCount += 1
      if (object.visible) visibleMeshCount += 1
    })

    const sceneDetails = {
      children: scene.children.length,
      meshCount,
      visibleMeshCount,
      sceneVisible: scene.visible,
      scale: frame.scale,
      boundsSize: frame.size.toArray(),
    }
    log3DDiagnostic('GLTF loading success / HumanModel mounted', sceneDetails)
    set3DDiagnosticState({ humanModelMounted: true, humanModel: sceneDetails })
    onFrameReady?.(frame)

    return () => {
      log3DDiagnostic('HumanModel unmounted', sceneDetails)
      set3DDiagnosticState({ humanModelMounted: false })
    }
  }, [frame, onFrameReady, scene])

  useFrame(() => {
    let meshCount = 0
    let visibleMeshCount = 0
    let invalidMeshCount = 0
    scene.traverse((object) => {
      if (!object.isMesh) return
      meshCount += 1
      if (object.visible) visibleMeshCount += 1
      if (!object.geometry || !object.material) invalidMeshCount += 1
    })

    set3DDiagnosticState({
      humanModelLive: {
        attachedToScene: Boolean(scene.parent),
        children: scene.children.length,
        meshCount,
        visibleMeshCount,
        invalidMeshCount,
        sceneVisible: scene.visible,
      },
    })
  })

  return (
    <group position={frame.position}>
      <primitive object={scene} scale={frame.scale} />
    </group>
  )
})

export default HumanModel
