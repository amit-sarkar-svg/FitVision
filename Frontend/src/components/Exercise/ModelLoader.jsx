import { Html } from '@react-three/drei'
import React from 'react'
import { log3DDiagnostic } from './ViewerDiagnostics'

export function ModelLoadingState() {
  return (
    <Html center>
      <div className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface/90 px-4 py-3 text-sm text-gray-300 shadow-xl whitespace-nowrap">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
        Loading 3D Model...
      </div>
    </Html>
  )
}

export function ModelErrorState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#121722] text-center">
      <p className="text-sm font-medium text-white">3D model unavailable</p>
      <p className="text-xs text-gray-500">Please refresh the page and try again.</p>
    </div>
  )
}

export class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    log3DDiagnostic('3D scene error boundary caught an error', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })
    console.error('[FitVision 3D] 3D scene error boundary caught an error', error)
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}
