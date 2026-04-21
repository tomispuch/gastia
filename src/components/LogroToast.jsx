import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { useGamificacion } from '../context/GamificacionContext'

export default function LogroToast() {
  const { nuevosLogros, dismissLogro } = useGamificacion()
  const logro = nuevosLogros[0]

  useEffect(() => {
    if (!logro) return
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#FA133A', '#070708', '#ffffff', '#FFD700'],
    })
    const timer = setTimeout(dismissLogro, 5000)
    return () => clearTimeout(timer)
  }, [logro?.id])

  if (!logro) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
      <div
        className="card-dark text-white rounded-2xl shadow-2xl px-8 py-6 text-center max-w-xs mx-4 pointer-events-auto"
        style={{ animation: 'slideUp 0.4s ease-out' }}
      >
        <div className="text-5xl mb-3">{logro.emoji}</div>
        <p className="text-xs font-semibold text-[#FA133A] uppercase tracking-widest mb-1">¡Logro desbloqueado!</p>
        <p className="text-lg font-bold mb-1">{logro.nombre}</p>
        <p className="text-sm text-gray-300">{logro.descripcion}</p>
        <button
          onClick={dismissLogro}
          className="mt-4 text-xs text-gray-400 hover:text-white transition-colors"
        >
          Cerrar
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
