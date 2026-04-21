import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { usePlan } from '../hooks/usePlan'
import { useGamificacion } from '../context/GamificacionContext'
import { LOGROS } from '../lib/gamificacion'

const COLORS = ['#FA133A','#e05c00','#6B7280','#10B981','#F59E0B','#3B82F6','#8B5CF6','#EC4899','#14B8A6','#F97316']

function fmt(n) {
  return '$' + Number(n).toLocaleString('es-AR')
}

function getMonthRange(year, month) {
  const from = `${year}-${String(month).padStart(2,'0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2,'0')}-${lastDay}`
  return { from, to }
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function Dashboard() {
  const { user } = useAuth()
  const { plan, loading: planLoading } = usePlan(user?.id)
  const { nivel, racha, logrosDesbloqueados } = useGamificacion()
  const navigate = useNavigate()

  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [anio, setAnio] = useState(now.getFullYear())
  const [gastos, setGastos] = useState([])
  const [ingresos, setIngresos] = useState([])
  const [presupuestoTotal, setPresupuestoTotal] = useState(0)
  const [presupuestosPorCategoria, setPresupuestosPorCategoria] = useState({})
  const [metaAhorro, setMetaAhorro] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!planLoading && plan !== 'pro') return
    if (!user) return
    fetchData()
  }, [user, plan, planLoading, mes, anio])

  async function fetchData() {
    setLoading(true)
    const { from, to } = getMonthRange(anio, mes)
    const [gastosRes, ingresosRes, presupuestosRes] = await Promise.all([
      supabase.from('gastos').select('*').eq('user_id', user.id).gte('fecha', from).lte('fecha', to),
      supabase.from('ingresos').select('*').eq('user_id', user.id).gte('fecha', from).lte('fecha', to),
      supabase.from('presupuestos').select('*').eq('user_id', user.id),
    ])
    setGastos(gastosRes.data || [])
    setIngresos(ingresosRes.data || [])
    const presMap = {}
    for (const p of (presupuestosRes.data || [])) presMap[p.categoria] = p.limite_mensual
    setPresupuestoTotal(presMap['total'] || 0)
    setPresupuestosPorCategoria(presMap)
    setMetaAhorro(presMap['ahorro'] || 0)
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

  const totalGastado = gastos.reduce((acc, g) => acc + Number(g.monto), 0)
  const totalIngresado = ingresos.reduce((acc, i) => acc + Number(i.monto), 0)
  const balance = totalIngresado - totalGastado
  const pctPresupuesto = presupuestoTotal > 0 ? Math.min((totalGastado / presupuestoTotal) * 100, 100) : 0

  const gastosPorCategoria = gastos.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + Number(g.monto)
    return acc
  }, {})
  const pieData = Object.entries(gastosPorCategoria).map(([name, value]) => ({ name, value }))

  const ultimosMovimientos = [
    ...gastos.map(g => ({ ...g, _tipo: 'gasto' })),
    ...ingresos.map(i => ({ ...i, _tipo: 'ingreso' })),
  ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5)

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
                <p className="text-[#FA133A] font-black text-xl leading-tight">{fmt(totalGastado)}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1">Ingresado</p>
                <p className="text-green-400 font-black text-xl leading-tight">{fmt(totalIngresado)}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1">Balance</p>
                <p className={`font-black text-xl leading-tight ${balance >= 0 ? 'text-green-400' : 'text-[#FA133A]'}`}>{fmt(balance)}</p>
              </div>
            </div>

            {presupuestoTotal > 0 && (
              <div className="mt-4 pt-4 border-t border-white/8">
                <div className="flex justify-between text-xs text-white/40 mb-2">
                  <span>Presupuesto mensual</span>
                  <span>{fmt(totalGastado)} / {fmt(presupuestoTotal)}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${pctPresupuesto}%`,
                      background: pctPresupuesto >= 100 ? '#FA133A' : pctPresupuesto >= 80 ? '#F59E0B' : '#10B981'
                    }}
                  />
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
            const pctAhorro = metaAhorro > 0 ? Math.min((balance / metaAhorro) * 100, 100) : 0
            const falta = metaAhorro - balance
            const diasRestantes = esMesActual ? diasDelMes - now2.getDate() : 0

            let mensaje, barColor
            if (esUltimoDia) {
              if (balance >= metaAhorro) {
                mensaje = '🏆 ¡Meta alcanzada! Cerrás el mes ahorrando ' + fmt(balance) + '.'
                barColor = '#10B981'
              } else {
                mensaje = '❌ No llegaste a la meta. Te faltaron ' + fmt(falta) + '.'
                barColor = '#FA133A'
              }
            } else if (esUltimaSemana) {
              mensaje = balance >= metaAhorro
                ? `💪 ¡Vas bien! Quedan ${diasRestantes} días — mantené el ritmo.`
                : `⚠️ Quedan ${diasRestantes} días y te faltan ${fmt(falta)}.`
              barColor = balance >= metaAhorro ? '#10B981' : '#F59E0B'
            } else {
              if (pctAhorro >= 80) { mensaje = `🔥 ¡Vas muy bien! Llevás el ${Math.round(pctAhorro)}% de tu meta.`; barColor = '#10B981' }
              else if (pctAhorro >= 50) { mensaje = `👍 Llevás el ${Math.round(pctAhorro)}% — seguí así.`; barColor = '#F59E0B' }
              else if (pctAhorro >= 20) { mensaje = `📊 Llevás el ${Math.round(pctAhorro)}% de tu meta. Ojo con los gastos.`; barColor = '#6B7280' }
              else { mensaje = `🚀 Cada peso que no gastás te acerca a tu meta de ${fmt(metaAhorro)}.`; barColor = '#6B7280' }
            }

            return (
              <div className="card-dark p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white font-semibold text-sm">🎯 Meta de ahorro</span>
                  <span className="text-white/40 text-xs">{fmt(Math.max(balance, 0))} / {fmt(metaAhorro)}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden mb-3">
                  <div className="h-2.5 rounded-full transition-all" style={{ width: `${Math.max(pctAhorro, 0)}%`, background: barColor }} />
                </div>
                <p className="text-white/60 text-xs">{mensaje}</p>
              </div>
            )
          })()}

          {/* Gastos por categoría */}
          {pieData.length > 0 && (
            <div className="card-dark p-4">
              <h2 className="text-white font-bold text-sm mb-4">Gastos por categoría</h2>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v) => fmt(v)}
                    contentStyle={{ background: '#070708', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-3 space-y-2.5">
                {[...pieData].sort((a, b) => b.value - a.value).map(({ name, value }, index) => {
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
                {ultimosMovimientos.map(item => (
                  <div key={`${item._tipo}-${item.id}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${item._tipo === 'gasto' ? 'bg-[#FA133A]/15 text-[#FA133A]' : 'bg-green-500/15 text-green-400'}`}>
                        {item._tipo === 'gasto' ? '↓' : '↑'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">{item.descripcion || item.categoria}</p>
                        <p className="text-white/30 text-xs">{item.fecha}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm flex-shrink-0 ml-3 ${item._tipo === 'gasto' ? 'text-[#FA133A]' : 'text-green-400'}`}>
                      {item._tipo === 'ingreso' ? '+' : '-'}{fmt(item.monto)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
