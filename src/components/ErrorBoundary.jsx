import { Component } from 'react'

function isChunkError(error) {
  return (
    error?.name === 'ChunkLoadError' ||
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.message?.includes('Importing a module script failed') ||
    error?.message?.includes('error loading dynamically imported module')
  )
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    if (isChunkError(error)) {
      const key = 'gastia_chunk_reload'
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1')
        window.location.reload()
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="text-lg font-black text-[#070708] mb-2">Algo salió mal</h2>
          <p className="text-gray-500 text-sm mb-6">Recargá la página para continuar.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-red px-6 py-2 text-sm"
          >
            Recargar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
