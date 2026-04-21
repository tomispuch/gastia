import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { usePlan } from '../hooks/usePlan'
import { useGamificacion } from '../context/GamificacionContext'

const MOCK_RESPONSE = {
  ok: true,
  tipo: 'gasto',
  registro: { monto: 1500, categoria: 'Comida y bebida', fecha: new Date().toISOString().split('T')[0], descripcion: 'Almuerzo' },
  alerta: null,
}
const speechSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

function fmt(n) { return '$' + Number(n).toLocaleString('es-AR') }

function getMonthRange() {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth() + 1
  const from = `${y}-${String(m).padStart(2,'0')}-01`
  const to = `${y}-${String(m).padStart(2,'0')}-${new Date(y, m, 0).getDate()}`
  return { from, to }
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const ACCIONES = [
  { to: '/historial',     label: 'Historial',     desc: 'Todos tus movimientos',         icon: '📋', plans: ['gratis','pro'], color: '#3B82F6' },
  { to: '/dashboard',     label: 'Dashboard',     desc: 'Gráficos del mes',              icon: '📊', plans: ['pro'],          color: '#8B5CF6' },
  { to: '/presupuestos',  label: 'Presupuestos',  desc: 'Límites por categoría',         icon: '🎯', plans: ['pro'],          color: '#F59E0B' },
  { to: '/comparativa',   label: 'Comparar',      desc: 'Compará dos meses',             icon: '📈', plans: ['pro'],          color: '#10B981' },
  { to: '/deudas',        label: 'Deudas',        desc: 'Lo que debés y te deben',       icon: '🤝', plans: ['gratis','pro'], color: '#EC4899' },
  { to: '/logros',        label: 'Logros',        desc: 'Tu progreso y nivel',           icon: '🏆', plans: ['gratis','pro'], color: '#F97316' },
]

export default function Home() {
  const { user } = useAuth()
  const { plan } = usePlan(user?.id)
  const { nivel, racha, logrosDesbloqueados, verificarPrimerGasto } = useGamificacion()
  const navigate = useNavigate()

  // Resumen
  const [totalGastos, setTotalGastos] = useState(0)
  const [totalIngresos, setTotalIngresos] = useState(0)
  const [resumenLoading, setResumenLoading] = useState(true)

  // Formulario de carga
  const [texto, setTexto] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [listening, setListening] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [formError, setFormError] = useState('')
  const recognitionRef = useRef(null)

  const now = new Date()

  useEffect(() => {
    if (!user) return
    fetchResumen()
  }, [user])

  async function fetchResumen() {
    setResumenLoading(true)
    const { from, to } = getMonthRange()
    const [gRes, iRes] = await Promise.all([
      supabase.from('gastos').select('monto').eq('user_id', user.id).gte('fecha', from).lte('fecha', to),
      supabase.from('ingresos').select('monto').eq('user_id', user.id).gte('fecha', from).lte('fecha', to),
    ])
    setTotalGastos((gRes.data || []).reduce((a, g) => a + Number(g.monto), 0))
    setTotalIngresos((iRes.data || []).reduce((a, i) => a + Number(i.monto), 0))
    setResumenLoading(false)
  }

  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r = new SR()
    r.lang = 'es-AR'; r.continuous = false; r.interimResults = true
    r.onstart = () => setListening(true)
    r.onresult = (e) => setTexto(Array.from(e.results).map(r => r[0].transcript).join(''))
    r.onend = () => setListening(false)
    r.onerror = () => setListening(false)
    recognitionRef.current = r
    r.start()
  }
  function stopVoice() { recognitionRef.current?.stop(); setListening(false) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!texto.trim()) return
    setFormError(''); setFormLoading(true); setResultado(null)
    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
      let data
      if (!webhookUrl || webhookUrl.includes('placeholder')) {
        await new Promise(r => setTimeout(r, 900))
        data = { ...MOCK_RESPONSE, registro: { ...MOCK_RESPONSE.registro, fecha } }
      } else {
        const res = await fetch(webhookUrl, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texto, user_id: user.id, fecha }),
        })
        data = await res.json()
      }
      setResultado(data)
      if (data.ok) { verificarPrimerGasto(); fetchResumen() }
    } catch { setFormError('Error al conectar. Intentá de nuevo.') }
    finally { setFormLoading(false) }
  }

  function resetForm() { setTexto(''); setResultado(null); setFormError(''); setFecha(new Date().toISOString().split('T')[0]) }

  const balance = totalIngresos - totalGastos
  const nombreUsuario = user?.user_metadata?.nombre || user?.email?.split('@')[0] || 'Usuario'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

      {/* Bienvenida */}
      <div>
        <p className="text-[#070708]/50 text-sm">Bienvenido,</p>
        <h1 className="text-3xl font-black text-[#070708] leading-tight">{nombreUsuario}</h1>
      </div>

      {/* Resumen del mes */}
      <div className="card-dark p-5">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">
          {MESES[now.getMonth()]} {now.getFullYear()}
        </p>
        {resumenLoading ? (
          <div className="flex justify-center py-3">
            <div className="w-5 h-5 rounded-full border-2 border-[#FA133A] border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-white/40 text-xs mb-1">Gastado</p>
              <p className="text-[#FA133A] font-black text-xl leading-tight">{fmt(totalGastos)}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">Ingresado</p>
              <p className="text-green-400 font-black text-xl leading-tight">{fmt(totalIngresos)}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">Balance</p>
              <p className={`font-black text-xl leading-tight ${balance >= 0 ? 'text-green-400' : 'text-[#FA133A]'}`}>
                {fmt(balance)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Formulario de carga inline */}
      <div className="card-dark p-5">
        <p className="text-white font-bold text-sm mb-4">➕ Cargar movimiento</p>

        {!resultado ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <textarea
                value={texto}
                onChange={e => setTexto(e.target.value)}
                rows={3}
                placeholder='"Gasté 1500 en el almuerzo" o "Cobré el sueldo de 80000"'
                className="input-dark resize-none pr-14 w-full"
              />
              {speechSupported && (
                <button
                  type="button"
                  onClick={listening ? stopVoice : startVoice}
                  className={`absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full flex items-center justify-center transition-all text-base ${
                    listening
                      ? 'bg-[#FA133A] text-white shadow-[0_0_20px_rgba(250,19,58,0.5)] animate-pulse'
                      : 'bg-white/10 hover:bg-white/20 text-white/60'
                  }`}
                >
                  🎤
                </button>
              )}
            </div>
            {listening && <p className="text-xs text-[#FA133A] animate-pulse font-medium">● Escuchando...</p>}

            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="input-dark flex-1 text-sm py-2"
              />
              <button
                type="submit"
                disabled={formLoading || !texto.trim()}
                className="btn-red px-5 py-2 text-sm flex-shrink-0"
              >
                {formLoading
                  ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Procesando...</span>
                  : 'Registrar'
                }
              </button>
            </div>

            {formError && (
              <p className="text-xs text-[#FA133A] bg-[#FA133A]/10 px-3 py-2 rounded-xl">{formError}</p>
            )}
          </form>
        ) : (
          resultado.ok ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                <span>✅</span> Movimiento registrado
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l: 'Tipo', v: resultado.tipo === 'gasto' ? '📤 Gasto' : '📥 Ingreso' },
                  { l: 'Monto', v: '$' + resultado.registro.monto.toLocaleString('es-AR') },
                  { l: 'Categoría', v: resultado.registro.categoria },
                  { l: 'Fecha', v: resultado.registro.fecha },
                ].map(({ l, v }) => (
                  <div key={l} className="bg-white/5 rounded-xl p-2.5">
                    <p className="text-white/40 text-xs">{l}</p>
                    <p className="text-white font-semibold text-sm capitalize">{v}</p>
                  </div>
                ))}
              </div>
              {resultado.alerta && (
                <p className="text-xs text-yellow-400 bg-yellow-500/10 px-3 py-2 rounded-xl">{resultado.alerta.mensaje}</p>
              )}
              <button onClick={resetForm} className="btn-red w-full py-2.5 text-sm">
                Cargar otro
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-center">
              <p className="text-white/60 text-sm">No se pudo procesar. Intentá ser más específico.</p>
              <button onClick={resetForm} className="btn-red w-full py-2.5 text-sm">Intentar de nuevo</button>
            </div>
          )
        )}
      </div>

      {/* Nivel y racha */}
      {nivel && (
        <div className="card-dark p-4 flex items-center gap-4">
          <span className="text-4xl">{nivel.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-white/40 text-xs">Nivel {nivel.nivel} · {nivel.nombre}</p>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="text-white text-sm">🔥 <span className="font-bold">{racha?.meses_consecutivos_verde || 0}</span> <span className="text-white/40 text-xs">verde</span></span>
              <span className="text-white text-sm">🎯 <span className="font-bold">{racha?.meses_consecutivos_presupuesto || 0}</span> <span className="text-white/40 text-xs">presup.</span></span>
              <span className="text-white text-sm">🏅 <span className="font-bold">{logrosDesbloqueados.length}</span> <span className="text-white/40 text-xs">logros</span></span>
            </div>
          </div>
          <button onClick={() => navigate('/logros')} className="text-xs text-[#FA133A] font-semibold flex-shrink-0">
            Ver →
          </button>
        </div>
      )}

      {/* Acceso rápido */}
      <div>
        <p className="text-xs font-bold text-[#070708]/50 uppercase tracking-widest mb-3">Acceso rápido</p>
        <div className="grid grid-cols-2 gap-3">
          {ACCIONES.map(accion => {
            const disponible = accion.plans.includes(plan)
            return (
              <button
                key={accion.to}
                onClick={() => disponible && navigate(accion.to)}
                className={`card-dark p-4 text-left transition-all ${
                  disponible ? 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer' : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: accion.color + '22' }}>
                    {accion.icon}
                  </div>
                  {!disponible && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/40">PRO</span>
                  )}
                </div>
                <p className="text-white font-bold text-sm">{accion.label}</p>
                <p className="text-white/40 text-xs mt-0.5 leading-snug">{accion.desc}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
