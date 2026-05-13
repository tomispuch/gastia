import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { usePlan } from '../hooks/usePlan'
import { useToast } from '../context/ToastContext'

const CATEGORIAS_GASTO = ['Comida y bebida','Transporte','Salud','Vivienda','Entretenimiento','Ropa e indumentaria','Educación','Tecnología','Viajes','Impuesto','Otros']

function fmt(n) {
  return '$' + Number(n).toLocaleString('es-AR')
}

export default function Presupuestos() {
  const { user } = useAuth()
  const { plan, loading: planLoading } = usePlan(user?.id)
  const { showToast } = useToast()
  const [cuentas, setCuentas] = useState([])
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState('')
  const [presupuestos, setPresupuestos] = useState({})
  const [gastosDelMes, setGastosDelMes] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)

  useEffect(() => {
    if (!planLoading && plan !== 'pro') return
    if (!user) return
    supabase.from('cuentas').select('id, nombre, icono, tipo').eq('user_id', user.id).order('created_at')
      .then(({ data }) => setCuentas(data || []))
  }, [user, plan, planLoading])

  useEffect(() => {
    if (!planLoading && plan !== 'pro') return
    if (!user) return
    fetchData()
  }, [user, plan, planLoading, cuentaSeleccionada])

  async function fetchData() {
    setLoading(true)
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const from = `${year}-${String(month).padStart(2,'0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const to = `${year}-${String(month).padStart(2,'0')}-${lastDay}`

    let gastosQ = supabase.from('gastos').select('categoria, monto').eq('user_id', user.id).gte('fecha', from).lte('fecha', to)
    if (cuentaSeleccionada) gastosQ = gastosQ.eq('cuenta_id', cuentaSeleccionada)

    const [presRes, gastosRes] = await Promise.all([
      supabase.from('presupuestos').select('*').eq('user_id', user.id),
      gastosQ,
    ])

    const presMap = {}
    for (const p of (presRes.data || [])) {
      const pCuentaId = p.cuenta_id || ''
      if (pCuentaId === cuentaSeleccionada) {
        presMap[p.categoria] = { id: p.id, limite: p.limite_mensual }
      }
    }
    setPresupuestos(presMap)

    const gastosMap = {}
    for (const g of (gastosRes.data || [])) gastosMap[g.categoria] = (gastosMap[g.categoria] || 0) + Number(g.monto)
    setGastosDelMes(gastosMap)
    setLoading(false)
  }

  async function handleSave(categoria, valor) {
    setSaving(categoria)
    const limiteNum = Number(valor)
    const existing = presupuestos[categoria]
    if (existing?.id) {
      await supabase.from('presupuestos').update({ limite_mensual: limiteNum }).eq('id', existing.id)
    } else {
      await supabase.from('presupuestos').insert({
        user_id: user.id,
        categoria,
        limite_mensual: limiteNum,
        cuenta_id: cuentaSeleccionada || null,
      })
    }
    setSaving(null)
    fetchData()
    showToast('Presupuesto guardado.')
  }

  if (!planLoading && plan !== 'pro') {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="card-dark p-8 text-center">
          <p className="text-4xl mb-4">🎯</p>
          <h2 className="text-white font-bold text-lg mb-2">Función Pro</h2>
          <p className="text-white/50 text-sm">Los presupuestos están disponibles en el plan Pro.</p>
        </div>
      </div>
    )
  }

  const totalGastadoMes = Object.values(gastosDelMes).reduce((a, b) => a + b, 0)
  const cuentaActual = cuentas.find(c => c.id === cuentaSeleccionada)

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-3">
      <h1 className="text-2xl font-black text-[#070708]">Presupuestos</h1>

      {/* Selector de cuenta */}
      {cuentas.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setCuentaSeleccionada('')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              cuentaSeleccionada === ''
                ? 'bg-[#FA133A] text-white'
                : 'bg-white/60 text-[#070708]/60 hover:bg-white/80'
            }`}
          >
            Todas
          </button>
          {cuentas.filter(c => c.tipo !== 'ahorro').map(c => (
            <button
              key={c.id}
              onClick={() => setCuentaSeleccionada(c.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                cuentaSeleccionada === c.id
                  ? 'bg-[#FA133A] text-white'
                  : 'bg-white/60 text-[#070708]/60 hover:bg-white/80'
              }`}
            >
              <span>{c.icono}</span> {c.nombre}
            </button>
          ))}
        </div>
      )}

      {cuentaSeleccionada && cuentaActual && (
        <p className="text-[#070708]/50 text-xs">
          Presupuestos para <strong>{cuentaActual.icono} {cuentaActual.nombre}</strong>
        </p>
      )}
      {!cuentaSeleccionada && (
        <p className="text-[#070708]/50 text-xs">Presupuesto global — aplica a todas las cuentas</p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[#FA133A] border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          <PresupuestoRow
            label="Total mensual"
            categoria="total"
            limite={presupuestos['total']?.limite || 0}
            gastado={totalGastadoMes}
            onSave={(v) => handleSave('total', v)}
            saving={saving === 'total'}
            highlight
          />

          {!cuentaSeleccionada && (
            <MetaAhorro
              meta={presupuestos['ahorro']?.limite || 0}
              onSave={(v) => handleSave('ahorro', v)}
              saving={saving === 'ahorro'}
            />
          )}

          <div className="space-y-2">
            {CATEGORIAS_GASTO.map(cat => (
              <PresupuestoRow
                key={cat}
                label={cat}
                categoria={cat}
                limite={presupuestos[cat]?.limite || 0}
                gastado={gastosDelMes[cat] || 0}
                onSave={(v) => handleSave(cat, v)}
                saving={saving === cat}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function MetaAhorro({ meta, onSave, saving }) {
  const [editing, setEditing] = useState(false)
  const [valor, setValor] = useState(meta)

  return (
    <div className="card-dark p-4" style={{ borderLeft: '3px solid #F59E0B' }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-semibold text-sm">🏦 Meta de ahorro</p>
          <p className="text-white/40 text-xs mt-0.5">Cuánto querés tener en tus cuentas de ahorro</p>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <input
                type="number"
                value={valor}
                onChange={e => setValor(e.target.value)}
                className="input-dark w-28 text-sm py-1.5"
                autoFocus
              />
              <button
                onClick={() => { onSave(valor); setEditing(false) }}
                disabled={saving}
                className="btn-red px-3 py-1.5 text-xs"
              >
                {saving ? '...' : 'OK'}
              </button>
              <button onClick={() => setEditing(false)} className="text-white/40 hover:text-white text-sm">✕</button>
            </>
          ) : (
            <>
              <span className="text-[#F59E0B] font-bold text-sm">{meta > 0 ? fmt(meta) : '—'}</span>
              <button
                onClick={() => { setValor(meta); setEditing(true) }}
                className="text-xs bg-white/10 hover:bg-white/15 text-white/60 px-3 py-1.5 rounded-lg transition-colors"
              >
                {meta > 0 ? 'Editar' : 'Fijar'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PresupuestoRow({ label, limite, gastado, onSave, saving, highlight }) {
  const [editing, setEditing] = useState(false)
  const [valor, setValor] = useState(limite)
  const pct = limite > 0 ? Math.min((gastado / limite) * 100, 100) : 0
  const barColor = pct >= 100 ? '#FA133A' : pct >= 80 ? '#F59E0B' : '#10B981'

  return (
    <div className={`card-dark p-4 ${highlight ? 'border border-[#FA133A]/40' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-semibold ${highlight ? 'text-[#FA133A]' : 'text-white'}`}>{label}</span>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <input
                type="number"
                value={valor}
                onChange={e => setValor(e.target.value)}
                className="input-dark w-28 text-sm py-1.5"
                autoFocus
              />
              <button
                onClick={() => { onSave(valor); setEditing(false) }}
                disabled={saving}
                className="btn-red px-3 py-1.5 text-xs"
              >
                {saving ? '...' : 'OK'}
              </button>
              <button onClick={() => setEditing(false)} className="text-white/40 hover:text-white text-sm">✕</button>
            </>
          ) : (
            <>
              <span className="text-white/40 text-xs">
                {fmt(gastado)}{limite > 0 ? ` / ${fmt(limite)}` : ''}
              </span>
              <button
                onClick={() => { setValor(limite); setEditing(true) }}
                className="text-xs bg-white/10 hover:bg-white/15 text-white/60 px-3 py-1.5 rounded-lg transition-colors"
              >
                {limite > 0 ? 'Editar' : 'Fijar'}
              </button>
            </>
          )}
        </div>
      </div>
      {limite > 0 && (
        <>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
          </div>
          {pct >= 100 && <p className="text-xs text-[#FA133A] mt-1.5">⛔ Límite superado</p>}
          {pct >= 80 && pct < 100 && <p className="text-xs text-yellow-400 mt-1.5">⚠️ {Math.round(pct)}% del límite</p>}
        </>
      )}
    </div>
  )
}
