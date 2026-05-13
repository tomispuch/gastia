import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis,
} from 'recharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { usePlan } from '../hooks/usePlan'
import { useGamificacion } from '../context/GamificacionContext'
import { LOGROS } from '../lib/gamificacion'

const COLORS = ['#FA133A','#e05c00','#6B7280','#10B981','#F59E0B','#3B82F6','#8B5CF6','#EC4899','#14B8A6','#F97316']

function fmt(n) {
  return '$' + Number(n).toLocaleString('es-AR')
}

function fmtShort(n) {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (abs >= 1_000)     return '$' + (n / 1_000).toFixed(0) + 'k'
  return '$' + n
}

function fmtBig(n) {
  const abs = Math.abs(n)
  const s = n < 0 ? '-' : ''
  if (abs >= 1_000_000) return s + '$' + (abs / 1_000_000).toFixed(1) + 'M'
  return '$' + Number(n).toLocaleString('es-AR')
}

function getMonthRange(year, month) {
  const from = `${year}-${String(month).padStart(2,'0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2,'0')}-${lastDay}`
  return { from, to }
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

// Calcula la evolución diaria de saldos para el mes dado
// Las cuentas tipo 'ahorro' se excluyen del total general
function computeEvolucion(cuentasData, gastosHist, ingresosHist, transHist, anio, mes) {
  const diasEnMes = new Date(anio, mes, 0).getDate()
  const padMes = String(mes).padStart(2, '0')
  const fechaInicioMes = `${anio}-${padMes}-01`

  const balances = {}
  for (const c of cuentasData) balances[c.id] = Number(c.saldo_inicial)

  const movsByDate = {}

  for (const g of gastosHist) {
    if (g.fecha < fechaInicioMes) {
      if (balances[g.cuenta_id] !== undefined) balances[g.cuenta_id] -= Number(g.monto)
    } else {
      if (!movsByDate[g.fecha]) movsByDate[g.fecha] = []
      movsByDate[g.fecha].push({ cuenta_id: g.cuenta_id, delta: -Number(g.monto) })
    }
  }
  for (const i of ingresosHist) {
    if (i.fecha < fechaInicioMes) {
      if (balances[i.cuenta_id] !== undefined) balances[i.cuenta_id] += Number(i.monto)
    } else {
      if (!movsByDate[i.fecha]) movsByDate[i.fecha] = []
      movsByDate[i.fecha].push({ cuenta_id: i.cuenta_id, delta: Number(i.monto) })
    }
  }
  for (const t of transHist) {
    if (t.fecha < fechaInicioMes) {
      if (balances[t.cuenta_origen_id] !== undefined) balances[t.cuenta_origen_id] -= Number(t.monto)
      if (balances[t.cuenta_destino_id] !== undefined) balances[t.cuenta_destino_id] += Number(t.monto)
    } else {
      if (!movsByDate[t.fecha]) movsByDate[t.fecha] = []
      movsByDate[t.fecha].push({ cuenta_id: t.cuenta_origen_id, delta: -Number(t.monto) })
      movsByDate[t.fecha].push({ cuenta_id: t.cuenta_destino_id, delta: Number(t.monto) })
    }
  }

  const current = { ...balances }
  const result = []

  for (let d = 1; d <= diasEnMes; d++) {
    const fechaDia = `${anio}-${padMes}-${String(d).padStart(2,'0')}`
    for (const m of (movsByDate[fechaDia] || [])) {
      if (current[m.cuenta_id] !== undefined) current[m.cuenta_id] += m.delta
    }
    const entry = { dia: d }
    let total = 0
    for (const c of cuentasData) {
      entry[c.id] = Math.round(current[c.id] || 0)
      if (c.tipo !== 'ahorro') total += current[c.id] || 0
    }
    entry.total = Math.round(total)
    result.push(entry)
  }
  return result
}

// Tooltip personalizado para el pie chart
function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1a1b1e', border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 10, padding: '8px 12px',
    }}>
      <p style={{ color: 'white', fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
        {payload[0].name}
      </p>
      <p style={{ color: payload[0].fill, fontWeight: 600, fontSize: 12 }}>
        {fmt(payload[0].value)}
      </p>
    </div>
  )
}

// Tooltip para los gráficos de área
function AreaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1a1b1e', border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 8, padding: '6px 10px',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginBottom: 3 }}>Día {label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600, fontSize: 12 }}>{fmt(p.value)}</p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { plan, loading: planLoading } = usePlan(user?.id)
  const { nivel, racha } = useGamificacion()
  const navigate = useNavigate()

  const now = new Date()
  const [mes, setMes]   = useState(now.getMonth() + 1)
  const [anio, setAnio] = useState(now.getFullYear())

  const [gastos, setGastos]   = useState([])
  const [ingresos, setIngresos] = useState([])
  const [presupuestoTotal, setPresupuestoTotal] = useState(0)
  const [presupuestosPorCategoria, setPresupuestosPorCategoria] = useState({})
  const [metaAhorro, setMetaAhorro] = useState(0)

  const [cuentas, setCuentas]               = useState([])
  const [evolucionData, setEvolucionData]   = useState([])
  const [transferenciasMes, setTransferenciasMes] = useState([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!planLoading && plan !== 'pro') return
    if (!user) return
    fetchData()
  }, [user, plan, planLoading, mes, anio])

  async function fetchData() {
    setLoading(true)
    const { from, to } = getMonthRange(anio, mes)

    const [gastosRes, ingresosRes, presupuestosRes, cuentasRes, gastosHistRes, ingresosHistRes, transHistRes, transMesRes] =
      await Promise.all([
        supabase.from('gastos').select('*').eq('user_id', user.id).gte('fecha', from).lte('fecha', to),
        supabase.from('ingresos').select('*').eq('user_id', user.id).gte('fecha', from).lte('fecha', to),
        supabase.from('presupuestos').select('*').eq('user_id', user.id),
        supabase.from('cuentas').select('id, nombre, icono, tipo, saldo_inicial').eq('user_id', user.id).order('created_at'),
        supabase.from('gastos').select('cuenta_id, monto, fecha').eq('user_id', user.id),
        supabase.from('ingresos').select('cuenta_id, monto, fecha').eq('user_id', user.id),
        supabase.from('transferencias').select('cuenta_origen_id, cuenta_destino_id, monto, fecha').eq('user_id', user.id),
        supabase.from('transferencias').select('*').eq('user_id', user.id).gte('fecha', from).lte('fecha', to),
      ])

    const gastosData   = gastosRes.data || []
    const ingresosData = ingresosRes.data || []
    setGastos(gastosData)
    setIngresos(ingresosData)
    setTransferenciasMes(transMesRes.data || [])

    const presMap = {}
    for (const p of (presupuestosRes.data || [])) presMap[p.categoria] = p.limite_mensual
    setPresupuestoTotal(presMap['total'] || 0)
    setPresupuestosPorCategoria(presMap)
    setMetaAhorro(presMap['ahorro'] || 0)

    const cuentasData = cuentasRes.data || []
    setCuentas(cuentasData)

    if (cuentasData.length > 0) {
      const evol = computeEvolucion(
        cuentasData,
        gastosHistRes.data || [],
        ingresosHistRes.data || [],
        transHistRes.data || [],
        anio, mes,
      )
      setEvolucionData(evol)
    }

    setLoading(false)
  }

  if (!planLoading && plan !== 'pro') {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="card-dark p-8 text-center">
          <p className="text-4xl mb-4">📊</p>
          <h2 className="text-white font-bold text-lg mb-2">Función Pro</h2>
          <p className="text-white/50 text-sm">El Dashboard completo está disponible en el plan Pro.</p>
        </div>
      </div>
    )
  }

  const totalGastado   = gastos.reduce((acc, g) => acc + Number(g.monto), 0)
  const totalIngresado = ingresos.reduce((acc, i) => acc + Number(i.monto), 0)
  const balance        = totalIngresado - totalGastado
  const pctPresupuesto = presupuestoTotal > 0 ? Math.min((totalGastado / presupuestoTotal) * 100, 100) : 0

  const gastosPorCategoria = gastos.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + Number(g.monto)
    return acc
  }, {})
  const pieData = Object.entries(gastosPorCategoria).map(([name, value]) => ({ name, value }))

  const ultimosMovimientos = [
    ...gastos.map(g => ({ ...g, _tipo: 'gasto' })),
    ...ingresos.map(i => ({ ...i, _tipo: 'ingreso' })),
    ...transferenciasMes.map(t => ({ ...t, _tipo: 'transferencia', categoria: 'Transferencia' })),
  ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5)

  const ahorroAccounts = cuentas.filter(c => c.tipo === 'ahorro')
  const lastEvol = evolucionData[evolucionData.length - 1] || {}
  const ahorroBalance = ahorroAccounts.reduce((sum, c) => sum + (lastEvol[c.id] || 0), 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#070708]">Dashboard</h1>
        <div className="flex gap-2">
          <select value={mes} onChange={e => setMes(Number(e.target.value))} className="select-light text-xs">
            {MESES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={anio} onChange={e => setAnio(Number(e.target.value))} className="select-light text-xs">
            {[now.getFullYear(), now.getFullYear()-1].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[#FA133A] border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          {/* Métricas principales */}
          <div className="card-dark p-5">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">{MESES[mes-1]} {anio}</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-white/40 text-xs mb-1">Gastado</p>
                <p className="text-[#FA133A] font-black text-xl leading-tight">{fmtBig(totalGastado)}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1">Ingresado</p>
                <p className="text-green-400 font-black text-xl leading-tight">{fmtBig(totalIngresado)}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1">Balance</p>
                <p className={`font-black text-xl leading-tight ${balance >= 0 ? 'text-green-400' : 'text-[#FA133A]'}`}>{fmtBig(balance)}</p>
              </div>
            </div>

            {presupuestoTotal > 0 && (
              <div className="mt-4 pt-4 border-t border-white/8">
                <div className="flex justify-between text-xs text-white/40 mb-2">
                  <span>Presupuesto mensual</span>
                  <span>{fmt(totalGastado)} / {fmt(presupuestoTotal)}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full transition-all" style={{
                    width: `${pctPresupuesto}%`,
                    background: pctPresupuesto >= 100 ? '#FA133A' : pctPresupuesto >= 80 ? '#F59E0B' : '#10B981'
                  }} />
                </div>
                {pctPresupuesto >= 100 && <p className="text-xs text-[#FA133A] mt-1.5">⛔ Superaste tu presupuesto mensual.</p>}
                {pctPresupuesto >= 80 && pctPresupuesto < 100 && <p className="text-xs text-yellow-400 mt-1.5">⚠️ Llevás el {Math.round(pctPresupuesto)}% de tu presupuesto.</p>}
              </div>
            )}
          </div>

          {/* Nivel / gamificación */}
          {nivel && (
            <div className="card-dark p-4 flex items-center gap-4">
              <span className="text-3xl">{nivel.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white/50 text-xs">Nivel {nivel.nivel} · {nivel.nombre}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-white">🔥 <span className="font-bold">{racha?.meses_consecutivos_verde || 0}</span> <span className="text-white/40 text-xs">meses verde</span></span>
                  <span className="text-sm text-white">🎯 <span className="font-bold">{racha?.meses_consecutivos_presupuesto || 0}</span> <span className="text-white/40 text-xs">bajo pres.</span></span>
                </div>
              </div>
              <button onClick={() => navigate('/logros')} className="text-xs text-[#FA133A] hover:text-red-400 flex-shrink-0 font-semibold">
                Ver logros →
              </button>
            </div>
          )}

          {/* Meta de ahorro */}
          {metaAhorro > 0 && (() => {
            const now2 = new Date()
            const esMesActual = mes === now2.getMonth() + 1 && anio === now2.getFullYear()
            const diasDelMes = new Date(anio, mes, 0).getDate()
            const esUltimoDia = esMesActual && now2.getDate() === diasDelMes
            const esUltimaSemana = esMesActual && now2.getDate() >= diasDelMes - 6
            const pctAhorro = metaAhorro > 0 ? Math.min((ahorroBalance / metaAhorro) * 100, 100) : 0
            const falta = metaAhorro - ahorroBalance
            const diasRestantes = esMesActual ? diasDelMes - now2.getDate() : 0

            let mensaje, barColor
            if (esUltimoDia) {
              if (ahorroBalance >= metaAhorro) { mensaje = '🏆 ¡Meta alcanzada! Ahorraste ' + fmt(ahorroBalance) + '.'; barColor = '#10B981' }
              else { mensaje = '❌ No llegaste a la meta. Te faltaron ' + fmt(falta) + '.'; barColor = '#FA133A' }
            } else if (esUltimaSemana) {
              mensaje = ahorroBalance >= metaAhorro ? `💪 ¡Vas bien! Quedan ${diasRestantes} días — mantené el ritmo.` : `⚠️ Quedan ${diasRestantes} días y te faltan ${fmt(falta)}.`
              barColor = ahorroBalance >= metaAhorro ? '#10B981' : '#F59E0B'
            } else {
              if (pctAhorro >= 80) { mensaje = `🔥 ¡Vas muy bien! Llevás el ${Math.round(pctAhorro)}% de tu meta.`; barColor = '#10B981' }
              else if (pctAhorro >= 50) { mensaje = `👍 Llevás el ${Math.round(pctAhorro)}% — seguí así.`; barColor = '#F59E0B' }
              else if (pctAhorro >= 20) { mensaje = `📊 Llevás el ${Math.round(pctAhorro)}% de tu meta. Ojo con los gastos.`; barColor = '#6B7280' }
              else { mensaje = `🚀 Cada peso que depositás en ahorro te acerca a tu meta de ${fmt(metaAhorro)}.`; barColor = '#6B7280' }
            }

            return (
              <div className="card-dark p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white font-semibold text-sm">🎯 Meta de ahorro</span>
                  <span className="text-white/40 text-xs">{fmt(Math.max(ahorroBalance, 0))} / {fmt(metaAhorro)}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden mb-3">
                  <div className="h-2.5 rounded-full transition-all" style={{ width: `${Math.max(pctAhorro, 0)}%`, background: barColor }} />
                </div>
                <p className="text-white/60 text-xs">{mensaje}</p>
              </div>
            )
          })()}

          {/* Gastos por categoría — pie con tooltip arreglado */}
          {pieData.length > 0 && (
            <div className="card-dark p-4">
              <h2 className="text-white font-bold text-sm mb-4">Gastos por categoría</h2>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-3 space-y-2.5">
                {[...pieData].sort((a, b) => b.value - a.value).map(({ name, value }) => {
                  const pct = totalGastado > 0 ? (value / totalGastado) * 100 : 0
                  const color = COLORS[pieData.findIndex(p => p.name === name) % COLORS.length]
                  const limite = presupuestosPorCategoria[name]
                  const pctPresup = limite ? Math.min((value / limite) * 100, 100) : null
                  return (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                          <span className="text-white/70 text-xs truncate">{name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-white/40 text-xs">{fmt(value)}</span>
                          <span className="text-white font-semibold text-xs">{Math.round(pct)}%</span>
                          {pctPresup !== null && (
                            <span className={`text-xs font-bold ${pctPresup >= 100 ? 'text-[#FA133A]' : pctPresup >= 80 ? 'text-yellow-400' : 'text-green-400'}`}>
                              {Math.round(pctPresup)}% pres.
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Evolución de cuentas — gráficos de área */}
          {evolucionData.length > 0 && cuentas.length > 0 && (
            <div className="card-dark p-4 space-y-6">
              <h2 className="text-white font-bold text-sm">Evolución de cuentas — {MESES[mes-1]}</h2>

              {/* Total general */}
              <div>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Total general</p>
                <ResponsiveContainer width="100%" height={130}>
                  <AreaChart data={evolucionData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#FA133A" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#FA133A" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="dia" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tickFormatter={fmtShort} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} width={52} />
                    <Tooltip content={<AreaTooltip />} />
                    <Area type="monotone" dataKey="total" stroke="#FA133A" strokeWidth={2} fill="url(#gradTotal)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Una por cuenta */}
              {cuentas.map((cuenta, idx) => {
                const color = COLORS[idx % COLORS.length]
                return (
                  <div key={cuenta.id}>
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">
                      {cuenta.icono} {cuenta.nombre}
                    </p>
                    <ResponsiveContainer width="100%" height={110}>
                      <AreaChart data={evolucionData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={color} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={color} stopOpacity={0}    />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="dia" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis tickFormatter={fmtShort} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} width={52} />
                        <Tooltip content={<AreaTooltip />} />
                        <Area type="monotone" dataKey={cuenta.id} stroke={color} strokeWidth={2} fill={`url(#grad-${idx})`} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )
              })}
            </div>
          )}

          {/* Últimos movimientos */}
          <div className="card-dark p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-sm">Últimos movimientos</h2>
              <button onClick={() => navigate('/historial')} className="text-xs text-[#FA133A] font-semibold">Ver todos →</button>
            </div>
            {ultimosMovimientos.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-4">Sin movimientos este mes.</p>
            ) : (
              <div className="space-y-3">
                {ultimosMovimientos.map(item => {
                  const esTrans = item._tipo === 'transferencia'
                  return (
                    <div key={`${item._tipo}-${item.id}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                          esTrans ? 'bg-blue-500/15 text-blue-400' :
                          item._tipo === 'gasto' ? 'bg-[#FA133A]/15 text-[#FA133A]' : 'bg-green-500/15 text-green-400'
                        }`}>
                          {esTrans ? '↔' : item._tipo === 'gasto' ? '↓' : '↑'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-xs font-medium truncate">{item.descripcion || item.categoria}</p>
                          <p className="text-white/30 text-xs">{item.fecha}</p>
                        </div>
                      </div>
                      <span className={`font-bold text-sm flex-shrink-0 ml-3 ${
                        esTrans ? 'text-blue-400' :
                        item._tipo === 'gasto' ? 'text-[#FA133A]' : 'text-green-400'
                      }`}>
                        {!esTrans && (item._tipo === 'ingreso' ? '+' : '-')}{fmt(item.monto)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
