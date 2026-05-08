import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { usePlan } from '../hooks/usePlan'
import { useGamificacion } from '../context/GamificacionContext'
import { localDateStr } from '../lib/validate'

const MOCK_RESPONSE = {
  ok: true,
  tipo: 'gasto',
  registro: { monto: 1500, categoria: 'Comida y bebida', descripcion: 'Almuerzo' },
  alerta: null,
}
const speechSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

function fmt(n) { return '$' + Number(n).toLocaleString('es-AR') }

function fmtShort(n) {
  const abs = Math.abs(n)
  const s = n < 0 ? '-' : ''
  if (abs >= 1_000_000) return s + '$' + (abs / 1_000_000).toFixed(1) + 'M'
  return '$' + Number(n).toLocaleString('es-AR')
}



const ACCIONES = [
  { to: '/historial',     label: 'Historial',     desc: 'Todos tus movimientos',       icon: '📋', plans: ['gratis','pro'], color: '#3B82F6' },
  { to: '/dashboard',     label: 'Dashboard',     desc: 'Gráficos del mes',            icon: '📊', plans: ['pro'],          color: '#8B5CF6' },
  { to: '/presupuestos',  label: 'Presupuestos',  desc: 'Límites por categoría',       icon: '🎯', plans: ['pro'],          color: '#F59E0B' },
  { to: '/comparativa',   label: 'Comparar',      desc: 'Compará dos meses',           icon: '📈', plans: ['pro'],          color: '#10B981' },
  { to: '/cuentas',       label: 'Cuentas',       desc: 'Tus billeteras y tarjetas',   icon: '💳', plans: ['pro'],          color: '#FA133A' },
  { to: '/recurrentes',   label: 'Recurrentes',   desc: 'Gastos e ingresos fijos',     icon: '🔁', plans: ['gratis','pro'], color: '#10B981' },
  { to: '/deudas',        label: 'Deudas',        desc: 'Lo que debés y te deben',     icon: '🤝', plans: ['gratis','pro'], color: '#EC4899' },
  { to: '/logros',        label: 'Logros',        desc: 'Tu progreso y nivel',         icon: '🏆', plans: ['gratis','pro'], color: '#F97316' },
  { to: '/configuracion', label: 'Config',        desc: 'Ajustá tu cuenta',            icon: '⚙️', plans: ['gratis','pro'], color: '#6B7280' },
]

export default function Home() {
  const { user } = useAuth()
  const { plan } = usePlan(user?.id)
  const { nivel, racha, logrosDesbloqueados, verificarPrimerGasto } = useGamificacion()
  const navigate = useNavigate()

  const [metaAhorro, setMetaAhorro] = useState(0)
  const [totalGastos, setTotalGastos] = useState(0)
  const [totalIngresos, setTotalIngresos] = useState(0)
  const [resumenLoading, setResumenLoading] = useState(true)
  const [cuentas, setCuentas] = useState([])
  const [cuentaId, setCuentaId] = useState('')

  const [texto, setTexto] = useState('')
  const [fecha, setFecha] = useState(localDateStr())
  const [listening, setListening] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [formError, setFormError] = useState('')
  const recognitionRef = useRef(null)

  const fetchData = useCallback(async () => {
    if (!user) return
    setResumenLoading(true)
    const now = new Date()
    const y = now.getFullYear(), mo = now.getMonth() + 1
    const from = `${y}-${String(mo).padStart(2,'0')}-01`
    const to = `${y}-${String(mo).padStart(2,'0')}-${new Date(y, mo, 0).getDate()}`
    const [gRes, iRes, cRes, presRes] = await Promise.all([
      supabase.from('gastos').select('monto').eq('user_id', user.id).gte('fecha', from).lte('fecha', to),
      supabase.from('ingresos').select('monto').eq('user_id', user.id).gte('fecha', from).lte('fecha', to),
      supabase.from('cuentas').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('presupuestos').select('limite_mensual').eq('user_id', user.id).eq('categoria', 'ahorro').is('cuenta_id', null).maybeSingle(),
    ])
    setTotalGastos((gRes.data || []).reduce((a, g) => a + Number(g.monto), 0))
    setTotalIngresos((iRes.data || []).reduce((a, i) => a + Number(i.monto), 0))
    setMetaAhorro(presRes.data?.limite_mensual || 0)

    if (cRes.data?.length) {
      // calcular balances
      const ids = cRes.data.map(c => c.id)
      const [gastosAll, ingresosAll, transOri, transDest] = await Promise.all([
        supabase.from('gastos').select('cuenta_id, monto').eq('user_id', user.id),
        supabase.from('ingresos').select('cuenta_id, monto').eq('user_id', user.id),
        supabase.from('transferencias').select('cuenta_origen_id, monto').eq('user_id', user.id),
        supabase.from('transferencias').select('cuenta_destino_id, monto').eq('user_id', user.id),
      ])
      const balances = {}
      for (const c of cRes.data) balances[c.id] = Number(c.saldo_inicial)
      for (const g of (gastosAll.data || [])) if (balances[g.cuenta_id] !== undefined) balances[g.cuenta_id] -= Number(g.monto)
      for (const i of (ingresosAll.data || [])) if (balances[i.cuenta_id] !== undefined) balances[i.cuenta_id] += Number(i.monto)
      for (const t of (transOri.data || [])) if (balances[t.cuenta_origen_id] !== undefined) balances[t.cuenta_origen_id] -= Number(t.monto)
      for (const t of (transDest.data || [])) if (balances[t.cuenta_destino_id] !== undefined) balances[t.cuenta_destino_id] += Number(t.monto)
      const cuentasConBalance = cRes.data.map(c => ({ ...c, balance: balances[c.id] }))
      setCuentas(cuentasConBalance)
      if (!cuentaId) setCuentaId(cuentasConBalance[0]?.id || '')
    }
    setResumenLoading(false)
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r = new SR()
    r.lang = 'es-AR'; r.continuous = false; r.interimResults = true
    r.onstart = () => setListening(true)
    r.onresult = (e) => {
      const results = Array.from(e.results)
      const final    = results.filter(r => r.isFinal).map(r => r[0].transcript).join('')
      const interim  = results.filter(r => !r.isFinal).map(r => r[0].transcript).join('')
      setTexto(final + interim)
    }
    r.onend = () => {
      setListening(false)
      recognitionRef.current = null  // libera el micrófono en iOS
    }
    r.onerror = (e) => {
      setListening(false)
      if (e.error === 'not-allowed') {
        setFormError('Permiso de micrófono denegado. Habilitalo en la configuración del navegador.')
      } else if (e.error === 'audio-capture') {
        setFormError('No se encontró micrófono. Verificá que esté conectado y sin uso por otra app.')
      } else if (e.error !== 'no-speech' && e.error !== 'aborted') {
        setFormError('No se pudo usar el micrófono. Intentá con Chrome o Edge.')
      }
    }
    recognitionRef.current = r; r.start()
  }
  function stopVoice() { recognitionRef.current?.stop(); setListening(false) }

  const lastSubmitRef = useRef(0)
  const MAX_TEXTO = 500

  async function handleSubmit(e) {
    e.preventDefault()
    const textoTrimmed = texto.trim()
    if (!textoTrimmed) return

    const ahora = Date.now()
    if (ahora - lastSubmitRef.current < 10_000) {
      setFormError('Esperá unos segundos antes de registrar otro movimiento.')
      return
    }
    if (textoTrimmed.length > MAX_TEXTO) {
      setFormError(`El texto no puede superar los ${MAX_TEXTO} caracteres.`)
      return
    }

    lastSubmitRef.current = ahora
    setFormError(''); setFormLoading(true); setResultado(null)
    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
      let data
      if (!webhookUrl || webhookUrl.includes('placeholder')) {
        await new Promise(r => setTimeout(r, 900))
        const reg = { ...MOCK_RESPONSE.registro, fecha }
        // Guardar en Supabase en modo mock
        await supabase.from('gastos').insert({
          user_id: user.id, monto: reg.monto, categoria: reg.categoria,
          fecha: reg.fecha, descripcion: reg.descripcion, cuenta_id: cuentaId || null,
        })
        data = { ok: true, tipo: MOCK_RESPONSE.tipo, registro: reg, alerta: null }
      } else {
        let res
        try {
          res = await fetch(webhookUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto, user_id: user.id, fecha, cuenta_id: cuentaId }),
          })
        } catch {
          if (!navigator.onLine) {
            setFormError('Sin conexión a internet. Conectate a una red e intentá de nuevo.')
          } else {
            setFormError('No se pudo conectar con el servidor. Verificá que N8N esté activo.')
          }
          setFormLoading(false)
          return
        }
        if (!res.ok) {
          setFormError(`Error del servidor (${res.status}). Revisá que el workflow de N8N esté activo.`)
          setFormLoading(false)
          return
        }
        try {
          data = await res.json()
        } catch {
          setFormError('N8N respondió con un formato inesperado. Revisá el nodo "Respond to Webhook".')
          setFormLoading(false)
          return
        }
      }
      setResultado(data)
      if (data.ok) { verificarPrimerGasto(); fetchData() }
    } catch { setFormError(!navigator.onLine ? 'Sin conexión a internet. Conectate a una red e intentá de nuevo.' : 'Error inesperado. Intentá de nuevo.') }
    finally { setFormLoading(false) }
  }

  function resetForm() {
    setTexto(''); setResultado(null); setFormError('')
    setFecha(localDateStr())
  }

  const disponible = cuentas.filter(c => c.tipo !== 'ahorro').reduce((a, c) => a + (c.balance || 0), 0)
  const ahorrado = cuentas.filter(c => c.tipo === 'ahorro').reduce((a, c) => a + (c.balance || 0), 0)
  const nombreUsuario = user?.user_metadata?.nombre || user?.email?.split('@')[0] || 'Usuario'
  const mostrarSelectorCuenta = cuentas.length > 1

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

      {/* Bienvenida */}
      <div>
        <p className="text-[#070708]/50 text-sm">Bienvenido,</p>
        <h1 className="text-3xl font-black text-[#070708] leading-tight">{nombreUsuario}</h1>
      </div>

      {/* Balance actual */}
      <div className="card-dark p-5">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">Balance actual</p>
        {resumenLoading ? (
          <div className="flex justify-center py-3">
            <div className="w-5 h-5 rounded-full border-2 border-[#FA133A] border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Fila principal */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">Disponible</p>
                <p className={`font-black text-2xl leading-tight ${disponible >= 0 ? 'text-white' : 'text-[#FA133A]'}`}>
                  {fmtShort(disponible)}
                </p>
              </div>
              <div>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">Ahorrado</p>
                <p className={`font-black text-2xl leading-tight ${
                  metaAhorro > 0
                    ? (ahorrado >= metaAhorro ? 'text-green-400' : 'text-[#FA133A]')
                    : 'text-[#F59E0B]'
                }`}>{fmtShort(ahorrado)}</p>
                {metaAhorro > 0 && (
                  <p className="text-white/25 text-xs mt-1">
                    {Math.round(Math.min((ahorrado / metaAhorro) * 100, 100))}% de tu meta
                  </p>
                )}
              </div>
            </div>
            {/* Fila secundaria */}
            <div className="flex items-center gap-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2">
                <span className="text-white/30 text-xs">Ingresado</span>
                <span className="text-green-400 font-semibold text-xs">{fmtShort(totalIngresos)}</span>
              </div>
              <div className="w-px h-3 bg-white/15 flex-shrink-0" />
              <div className="flex items-center gap-2">
                <span className="text-white/30 text-xs">Gastado</span>
                <span className="text-[#FA133A] font-semibold text-xs">{fmtShort(totalGastos)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cards de cuentas */}
      {cuentas.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-[#070708]/50 uppercase tracking-widest">Cuentas</p>
            <button onClick={() => navigate('/cuentas')} className="text-xs text-[#FA133A] font-semibold">
              Gestionar →
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {cuentas.map(c => (
              <div key={c.id} className="card-dark p-3.5 flex-shrink-0 min-w-[140px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{c.icono}</span>
                  <p className="text-white/60 text-xs font-medium truncate">{c.nombre}</p>
                </div>
                <p className={`font-black text-base ${c.balance >= 0 ? 'text-white' : 'text-[#FA133A]'}`}>
                  {fmtShort(c.balance || 0)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulario de carga */}
      <div className="card-dark p-5">
        <p className="text-white font-bold text-sm mb-4">➕ Cargar movimiento</p>

        {!resultado ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <textarea
                value={texto}
                onChange={e => setTexto(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder='"Gasté 1500 en el almuerzo" o "Cobré el sueldo de 80000"'
                className="input-dark resize-none pr-14 w-full"
              />
              {speechSupported && (
                <button type="button" onClick={listening ? stopVoice : startVoice}
                  className={`absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full flex items-center justify-center transition-all text-base ${
                    listening
                      ? 'bg-[#FA133A] text-white shadow-[0_0_20px_rgba(250,19,58,0.5)] animate-pulse'
                      : 'bg-white/10 hover:bg-white/20 text-white/60'
                  }`}
                >🎤</button>
              )}
            </div>
            {listening && <p className="text-xs text-[#FA133A] animate-pulse font-medium">● Escuchando...</p>}

            <div className="flex gap-2">
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                className="input-dark text-sm py-2 flex-1" />
              {mostrarSelectorCuenta && (
                <select value={cuentaId} onChange={e => setCuentaId(e.target.value)}
                  className="select-dark flex-1">
                  {cuentas.map(c => (
                    <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>
                  ))}
                </select>
              )}
            </div>

            {formError && (
              <p className="text-xs text-[#FA133A] bg-[#FA133A]/10 px-3 py-2 rounded-xl">{formError}</p>
            )}

            <button type="submit" disabled={formLoading || !texto.trim()} className="btn-red w-full py-3 text-sm">
              {formLoading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </span>
                : 'Registrar'
              }
            </button>
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
              <button onClick={resetForm} className="btn-red w-full py-2.5 text-sm">Cargar otro</button>
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
          <button onClick={() => navigate('/logros')} className="text-xs text-[#FA133A] font-semibold flex-shrink-0">Ver →</button>
        </div>
      )}

      {/* Acceso rápido */}
      <div>
        <p className="text-xs font-bold text-[#070708]/50 uppercase tracking-widest mb-3">Acceso rápido</p>
        <div className="grid grid-cols-2 gap-3">
          {ACCIONES.map(accion => (
            <button key={accion.to}
              onClick={() => navigate(accion.to)}
              className="card-dark p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <div className="mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: accion.color + '22' }}>
                  {accion.icon}
                </div>
              </div>
              <p className="text-white font-bold text-sm">{accion.label}</p>
              <p className="text-white/40 text-xs mt-0.5 leading-snug">{accion.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
