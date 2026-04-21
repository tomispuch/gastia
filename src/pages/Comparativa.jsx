import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { usePlan } from '../hooks/usePlan'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function fmt(n) {
  return '$' + Number(n).toLocaleString('es-AR')
}

function getMonthRange(year, month) {
  const from = `${year}-${String(month).padStart(2,'0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2,'0')}-${lastDay}`
  return { from, to }
}

function Diff({ a, b, invertido = false }) {
  if (a === 0 && b === 0) return null
  const diff = b - a
  if (diff === 0) return <span className="text-xs text-white/25">Sin cambio</span>
  const pct = a !== 0 ? Math.abs((diff / a) * 100).toFixed(0) : null
  const sube = diff > 0
  const esPositivo = invertido ? !sube : sube
  return (
    <span className={`text-xs font-semibold flex items-center justify-center gap-1 ${esPositivo ? 'text-green-400' : 'text-[#FA133A]'}`}>
      {sube ? '▲' : '▼'}
      <span>{fmt(Math.abs(diff))}</span>
      {pct && <span className="opacity-60">({pct}%)</span>}
    </span>
  )
}

async function fetchMesData(userId, year, month) {
  const { from, to } = getMonthRange(year, month)
  const [gastosRes, ingresosRes] = await Promise.all([
    supabase.from('gastos').select('monto, categoria').eq('user_id', userId).gte('fecha', from).lte('fecha', to),
    supabase.from('ingresos').select('monto').eq('user_id', userId).gte('fecha', from).lte('fecha', to),
  ])
  const gastos = gastosRes.data || []
  const ingresos = ingresosRes.data || []
  const totalGastado = gastos.reduce((acc, g) => acc + Number(g.monto), 0)
  const totalIngresado = ingresos.reduce((acc, i) => acc + Number(i.monto), 0)
  const porCategoria = gastos.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + Number(g.monto)
    return acc
  }, {})
  return { totalGastado, totalIngresado, balance: totalIngresado - totalGastado, porCategoria }
}

export default function Comparativa() {
  const { user } = useAuth()
  const { plan, loading: planLoading } = usePlan(user?.id)

  const now = new Date()
  const mesAnterior = now.getMonth() === 0 ? 12 : now.getMonth()
  const anioAnterior = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()

  const [mesA, setMesA] = useState(mesAnterior)
  const [anioA, setAnioA] = useState(anioAnterior)
  const [mesB, setMesB] = useState(now.getMonth() + 1)
  const [anioB, setAnioB] = useState(now.getFullYear())
  const [dataA, setDataA] = useState(null)
  const [dataB, setDataB] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!planLoading && plan !== 'pro') return
    if (!user) return
    cargarDatos()
  }, [user, plan, planLoading, mesA, anioA, mesB, anioB])

  async function cargarDatos() {
    setLoading(true)
    const [a, b] = await Promise.all([
      fetchMesData(user.id, anioA, mesA),
      fetchMesData(user.id, anioB, mesB),
    ])
    setDataA(a)
    setDataB(b)
    setLoading(false)
  }

  if (!planLoading && plan !== 'pro') {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="card-dark p-8 text-center">
          <p className="text-4xl mb-4">📈</p>
          <h2 className="text-white font-bold text-lg mb-2">Función Pro</h2>
          <p className="text-white/50 text-sm">La comparativa está disponible en el plan Pro.</p>
        </div>
      </div>
    )
  }

  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2]
  const todasCategorias = dataA && dataB
    ? [...new Set([...Object.keys(dataA.porCategoria), ...Object.keys(dataB.porCategoria)])]
        .sort((a, b) => ((dataB.porCategoria[b] || 0) + (dataA.porCategoria[b] || 0)) - ((dataB.porCategoria[a] || 0) + (dataA.porCategoria[a] || 0)))
    : []

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-black text-[#070708]">Comparativa</h1>

      {/* Month selectors */}
      <div className="card-dark p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2 text-center">Mes A</p>
            <select value={mesA} onChange={e => setMesA(Number(e.target.value))} className="select-dark w-full mb-2">
              {MESES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
            <select value={anioA} onChange={e => setAnioA(Number(e.target.value))} className="select-dark w-full">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2 text-center">Mes B</p>
            <select value={mesB} onChange={e => setMesB(Number(e.target.value))} className="select-dark w-full mb-2">
              {MESES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
            <select value={anioB} onChange={e => setAnioB(Number(e.target.value))} className="select-dark w-full">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[#FA133A] border-t-transparent animate-spin" />
        </div>
      ) : dataA && dataB && (
        <>
          {/* Summary table */}
          <div className="card-dark overflow-hidden">
            <div className="grid grid-cols-3 border-b border-white/8">
              <div className="px-4 py-3" />
              <div className="px-4 py-3 text-center">
                <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">{MESES[mesA-1]}</p>
                <p className="text-white/20 text-xs">{anioA}</p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className="text-[#FA133A] text-xs font-semibold uppercase tracking-wider">{MESES[mesB-1]}</p>
                <p className="text-white/20 text-xs">{anioB}</p>
              </div>
            </div>

            {[
              { label: 'Gastado', keyA: 'totalGastado', keyB: 'totalGastado', invertido: true, colorFn: () => 'text-[#FA133A]' },
              { label: 'Ingresado', keyA: 'totalIngresado', keyB: 'totalIngresado', invertido: false, colorFn: () => 'text-green-400' },
              { label: 'Balance', keyA: 'balance', keyB: 'balance', invertido: false, colorFn: (v) => v >= 0 ? 'text-green-400' : 'text-[#FA133A]' },
            ].map(({ label, keyA, keyB, invertido, colorFn }, idx) => (
              <div key={label} className={`grid grid-cols-3 items-center border-b border-white/5 last:border-0 ${idx % 2 === 0 ? 'bg-white/3' : ''}`}>
                <div className="px-4 py-3 text-white/50 text-xs font-semibold">{label}</div>
                <div className="px-4 py-3 text-center">
                  <p className={`text-sm font-bold ${colorFn(dataA[keyA])}`}>{fmt(dataA[keyA])}</p>
                </div>
                <div className="px-4 py-3 text-center">
                  <p className={`text-sm font-bold ${colorFn(dataB[keyB])}`}>{fmt(dataB[keyB])}</p>
                  <div className="flex justify-center mt-0.5">
                    <Diff a={dataA[keyA]} b={dataB[keyB]} invertido={invertido} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* By category */}
          {todasCategorias.length > 0 ? (
            <div className="card-dark overflow-hidden">
              <div className="grid grid-cols-3 border-b border-white/8">
                <div className="px-4 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">Categoría</div>
                <div className="px-4 py-3 text-center text-white/40 text-xs font-semibold uppercase tracking-wider">{MESES[mesA-1].slice(0,3)}</div>
                <div className="px-4 py-3 text-center text-[#FA133A] text-xs font-semibold uppercase tracking-wider">{MESES[mesB-1].slice(0,3)}</div>
              </div>
              {todasCategorias.map((cat, idx) => {
                const a = dataA.porCategoria[cat] || 0
                const b = dataB.porCategoria[cat] || 0
                return (
                  <div key={cat} className={`grid grid-cols-3 items-center border-b border-white/5 last:border-0 ${idx % 2 === 0 ? 'bg-white/3' : ''}`}>
                    <div className="px-4 py-3 text-white/60 text-xs leading-tight">{cat}</div>
                    <div className="px-4 py-3 text-center text-sm font-semibold text-[#FA133A]">
                      {a > 0 ? fmt(a) : <span className="text-white/15">—</span>}
                    </div>
                    <div className="px-4 py-3 text-center">
                      <p className="text-sm font-semibold text-[#FA133A]">
                        {b > 0 ? fmt(b) : <span className="text-white/15">—</span>}
                      </p>
                      {a > 0 && b > 0 && (
                        <div className="flex justify-center mt-0.5">
                          <Diff a={a} b={b} invertido={true} />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="card-dark p-8 text-center">
              <p className="text-white/30 text-sm">No hay gastos en ninguno de los dos meses.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
