import { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

const PREFIX = '[FitVision 3D]'

function getStore() {
  if (typeof window === 'undefined') return null

  window.__fitVision3DDiagnostics ??= { events: [], state: {} }
  return window.__fitVision3DDiagnostics
}

export function set3DDiagnosticState(state) {
  const store = getStore()
  if (store) Object.assign(store.state, state)
}

export function log3DDiagnostic(event, details = {}) {
  const entry = { at: new Date().toISOString(), event, details }
  const store = getStore()

  if (store) {
    store.events.push(entry)
    store.events.splice(0, Math.max(0, store.events.length - 200))
  }

  console.info(`${PREFIX} ${event}`, details)
}

export function CanvasDiagnostics() {
  const { camera, gl, scene, size } = useThree()

  useEffect(() => {
    const canvas = gl.domElement
    const rendererDetails = {
      renderer: gl.constructor.name,
      canvasSize: { width: canvas.width, height: canvas.height },
      cssSize: { width: size.width, height: size.height },
    }
    const handleContextLost = (event) => {
      log3DDiagnostic('WebGL context lost', { defaultPrevented: event.defaultPrevented })
      set3DDiagnosticState({ webglContext: 'lost' })
    }
    const handleContextRestored = () => {
      log3DDiagnostic('WebGL context restored')
      set3DDiagnosticState({ webglContext: 'restored' })
    }

    canvas.addEventListener('webglcontextlost', handleContextLost)
    canvas.addEventListener('webglcontextrestored', handleContextRestored)
    log3DDiagnostic('Canvas renderer created', rendererDetails)
    set3DDiagnosticState({ canvasMounted: true, webglContext: 'active', rendererDetails })

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)
      log3DDiagnostic('Canvas renderer destruction')
      set3DDiagnosticState({ canvasMounted: false })
    }
  }, [gl])

  useFrame(() => {
    set3DDiagnosticState({
      camera: { position: camera.position.toArray(), near: camera.near, far: camera.far },
      renderer: { domConnected: gl.domElement.isConnected, canvasSize: [gl.domElement.width, gl.domElement.height] },
      sceneChildren: scene.children.length,
    })
  })

  return null
}
