import { Center, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { memo, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { log3DDiagnostic, set3DDiagnosticState } from './ViewerDiagnostics'

// The supplied asset keeps its original filename in public/models/male.
const MODEL_URL = '/models/male/human%20character%203d%20model.glb'

const HumanModel = memo(function HumanModel() {
  log3DDiagnostic('GLTF loading/read started', { url: MODEL_URL })
  const { scene } = useGLTF(MODEL_URL)

  const scale = useMemo(() => {
    const bounds = new THREE.Box3().setFromObject(scene)
    const height = bounds.getSize(new THREE.Vector3()).y

    // Normalize differently authored GLB units to a comfortable viewer height.
    return height > 0 ? 4.6 / height : 1
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
      scale,
    }
    log3DDiagnostic('GLTF loading success / HumanModel mounted', sceneDetails)
    set3DDiagnosticState({ humanModelMounted: true, humanModel: sceneDetails })

    return () => {
      log3DDiagnostic('HumanModel unmounted', sceneDetails)
      set3DDiagnosticState({ humanModelMounted: false })
    }
  }, [scale, scene])

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
    <Center>
      <primitive object={scene} scale={scale} />
    </Center>
  )
})

export default HumanModel
