import { LOGROS, NIVELES, getNivel, getProgresoHaciaNextNivel } from '../lib/gamificacion'
import { useGamificacion } from '../context/GamificacionContext'

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function formatFecha(ts) {
  const d = new Date(ts)
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

export default function Logros() {
  const { logrosDesbloqueados, racha, nivel, loading } = useGamificacion()

  const logrosIds = logrosDesbloqueados.map(l => l.logro_id)
  const progreso = getProgresoHaciaNextNivel(nivel, logrosIds, racha)
  const nivelActualIdx = NIVELES.findIndex(n => n.nivel === nivel.nivel)
  const nivelSiguiente = NIVELES[nivelActualIdx + 1]

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 rounded-full border-2 border-[#FA133A] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-black text-[#070708]">Logros</h1>

      {/* Nivel actual */}
      <div className="card-dark p-6">
        <div className="flex items-center gap-5 mb-5">
          <span className="text-6xl">{nivel.emoji}</span>
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Nivel {nivel.nivel}</p>
            <p className="text-white text-2xl font-black">{nivel.nombre}</p>
            {nivelSiguiente && (
              <p className="text-white/30 text-xs mt-1">Siguiente: {nivelSiguiente.emoji} {nivelSiguiente.nombre}</p>
            )}
          </div>
        </div>

        {nivelSiguiente ? (
          <>
            <div className="flex justify-between text-xs text-white/40 mb-2">
              <span>Progreso al siguiente nivel</span>
              <span>{progreso.label}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div className="h-2.5 rounded-full bg-[#FA133A] transition-all" style={{ width: `${progreso.pct}%` }} />
            </div>
          </>
        ) : (
          <p className="text-yellow-400 font-semibold text-sm text-center bg-yellow-400/10 rounded-xl py-2">
            🏅 ¡Alcanzaste el nivel máximo!
          </p>
        )}
      </div>

      {/* Racha */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-dark p-4 text-center">
          <p className="text-3xl mb-2">🔥</p>
          <p className="text-white font-black text-3xl">{racha.meses_consecutivos_verde}</p>
          <p className="text-white/40 text-xs mt-1">meses seguidos en verde</p>
        </div>
        <div className="card-dark p-4 text-center">
          <p className="text-3xl mb-2">🎯</p>
          <p className="text-white font-black text-3xl">{racha.meses_consecutivos_presupuesto}</p>
          <p className="text-white/40 text-xs mt-1">meses bajo presupuesto</p>
        </div>
      </div>

      {/* Desbloqueados */}
      {logrosDesbloqueados.length > 0 && (
        <div>
          <p className="text-xs font-bold text-[#070708]/60 uppercase tracking-widest mb-2 px-1">
            Desbloqueados ({logrosDesbloqueados.length})
          </p>
          <div className="space-y-2">
            {logrosDesbloqueados.map(lu => {
              const logro = LOGROS.find(l => l.id === lu.logro_id)
              if (!logro) return null
              return (
                <div key={lu.id} className="card-dark p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#FA133A]/20 flex items-center justify-center text-2xl flex-shrink-0">
                    {logro.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{logro.nombre}</p>
                    <p className="text-white/50 text-xs">{logro.descripcion}</p>
                  </div>
                  <p className="text-white/40 text-xs text-right flex-shrink-0">{formatFecha(lu.desbloqueado_at)}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Bloqueados */}
      {LOGROS.filter(l => !logrosIds.includes(l.id)).length > 0 && (
        <div>
          <p className="text-xs font-bold text-[#070708]/60 uppercase tracking-widest mb-2 px-1">
            Por desbloquear ({LOGROS.filter(l => !logrosIds.includes(l.id)).length})
          </p>
          <div className="space-y-2">
            {LOGROS.filter(l => !logrosIds.includes(l.id)).map(logro => (
              <div key={logro.id} className="card-dark p-4 flex items-center gap-3" style={{ opacity: 0.55 }}>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl grayscale flex-shrink-0">
                  {logro.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{logro.nombre}</p>
                  <p className="text-white/60 text-xs">{logro.condicion}</p>
                </div>
                <span className="text-white/50 text-sm flex-shrink-0">🔒</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
