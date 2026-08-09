import { Center, useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

// The supplied asset keeps its original filename in public/models/male.
const MODEL_URL = '/models/male/human%20character%203d%20model.glb'

export default function HumanModel() {
  const { scene } = useGLTF(MODEL_URL)

  const scale = useMemo(() => {
    const bounds = new THREE.Box3().setFromObject(scene)
    const height = bounds.getSize(new THREE.Vector3()).y

    // Normalize differently authored GLB units to a comfortable viewer height.
    return height > 0 ? 4.6 / height : 1
  }, [scene])

  return (
    <Center>
      <primitive object={scene} scale={scale} />
    </Center>
  )
}
