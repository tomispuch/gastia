import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { usePlan } from '../hooks/usePlan'

const CATEGORIAS_GASTO = ['Comida y bebida','Transporte','Salud','Vivienda','Entretenimiento','Ropa e indumentaria','Educación','Tecnología','Viajes','Otros']
const CATEGORIAS_INGRESO = ['Sueldo','Freelance','Venta','Inversiones','Regalo','Otro']
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

export default function Historial() {
  const { user } = useAuth()
  const { plan } = usePlan(user?.id)

  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [anio, setAnio] = useState(now.getFullYear())
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    if (!user || !plan) return
    fetchMovimientos()
  }, [user, plan, mes, anio, filtroCategoria])

  async function fetchMovimientos() {
    setLoading(true)
    const { from, to } = getMonthRange(anio, mes)
    const [gastosRes, ingresosRes] = await Promise.all([
      supabase.from('gastos').select('*').eq('user_id', user.id).gte('fecha', from).lte('fecha', to).order('fecha', { ascending: false }),
      supabase.from('ingresos').select('*').eq('user_id', user.id).gte('fecha', from).lte('fecha', to).order('fecha', { ascending: false }),
    ])
    let items = [
      ...(gastosRes.data || []).map(g => ({ ...g, _tipo: 'gasto' })),
      ...(ingresosRes.data || []).map(i => ({ ...i, _tipo: 'ingreso' })),
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    if (filtroCategoria) items = items.filter(i => i.categoria === filtroCategoria)
    setMovimientos(items)
    setLoading(false)
  }

  async function handleDelete(item) {
    const table = item._tipo === 'gasto' ? 'gastos' : 'ingresos'
    await supabase.from(table).delete().eq('id', item.id)
    setConfirmDelete(null)
    fetchMovimientos()
  }

  async function handleEdit(item, formData) {
    const table = item._tipo === 'gasto' ? 'gastos' : 'ingresos'
    await supabase.from(table).update(formData).eq('id', item.id)
    setEditando(null)
    fetchMovimientos()
  }

  const totalGastos = movimientos.filter(m => m._tipo === 'gasto').reduce((a, m) => a + Number(m.monto), 0)
  const totalIngresos = movimientos.filter(m => m._tipo === 'ingreso').reduce((a, m) => a + Number(m.monto), 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black text-[#070708] mb-4">Historial</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {plan === 'pro' && (
          <>
            <select value={mes} onChange={e => setMes(Number(e.target.value))} className="select-light text-xs">
              {MESES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
            <select value={anio} onChange={e => setAnio(Number(e.target.value))} className="select-light text-xs">
              {[now.getFullYear(), now.getFullYear()-1].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </>
        )}
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="select-light text-xs">
          <option value="">Todas las categorías</option>
          {[...CATEGORIAS_GASTO, ...CATEGORIAS_INGRESO].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Summary */}
      {!loading && movimientos.length > 0 && (
        <div className="card-dark p-4 mb-4 grid grid-cols-3 gap-3">
          <div>
            <p className="text-white/40 text-xs mb-1">Gastos</p>
            <p className="text-[#FA133A] font-black text-base">{fmt(totalGastos)}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs mb-1">Ingresos</p>
            <p className="text-green-400 font-black text-base">{fmt(totalIngresos)}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs mb-1">Balance</p>
            <p className={`font-black text-base ${totalIngresos - totalGastos >= 0 ? 'text-green-400' : 'text-[#FA133A]'}`}>
              {fmt(totalIngresos - totalGastos)}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[#FA133A] border-t-transparent animate-spin" />
        </div>
      ) : movimientos.length === 0 ? (
        <div className="card-dark p-8 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-white/40 text-sm">No hay movimientos en este período.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {movimientos.map(item => (
            <div key={`${item._tipo}-${item.id}`}
              className="card-dark p-4 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                item._tipo === 'gasto' ? 'bg-[#FA133A]/15 text-[#FA133A]' : 'bg-green-500/15 text-green-400'
              }`}>
                {item._tipo === 'gasto' ? '↓' : '↑'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-sm font-semibold truncate">{item.descripcion || item.categoria}</span>
                  {item.recurrente && <span className="text-xs text-white/40">🔁</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-white/40 text-xs">{item.fecha}</span>
                  <span className="text-xs bg-white/20 text-white/70 rounded px-1.5 py-0.5">{item.categoria}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`font-bold text-sm ${item._tipo === 'gasto' ? 'text-[#FA133A]' : 'text-green-400'}`}>
                  {item._tipo === 'ingreso' ? '+' : '-'}{fmt(item.monto)}
                </span>
                <button
                  onClick={() => setEditando(item)}
                  className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-xs transition-colors"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setConfirmDelete(item)}
                  className="w-7 h-7 rounded-lg bg-[#FA133A]/20 hover:bg-[#FA133A]/35 flex items-center justify-center text-xs transition-colors"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 px-4">
          <div className="card-dark p-6 w-full max-w-sm">
            <h3 className="text-white font-bold mb-2">¿Eliminar movimiento?</h3>
            <p className="text-white/50 text-sm mb-5">
              {confirmDelete.descripcion || confirmDelete.categoria} — {fmt(confirmDelete.monto)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-white/15 rounded-xl py-2.5 text-sm font-semibold text-white/60 hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 btn-red py-2.5 text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {editando && (
        <EditModal item={editando} onClose={() => setEditando(null)} onSave={fd => handleEdit(editando, fd)} />
      )}
    </div>
  )
}

function EditModal({ item, onClose, onSave }) {
  const [fecha, setFecha] = useState(item.fecha)
  const [monto, setMonto] = useState(item.monto)
  const [categoria, setCategoria] = useState(item.categoria)
  const [descripcion, setDescripcion] = useState(item.descripcion || '')
  const categorias = item._tipo === 'gasto' ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 px-4">
      <div className="card-dark p-6 w-full max-w-sm space-y-4">
        <h3 className="text-white font-bold">Editar movimiento</h3>
        <div>
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Fecha</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="input-dark" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Monto</label>
          <input type="number" value={monto} onChange={e => setMonto(e.target.value)} className="input-dark" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Categoría</label>
          <select value={categoria} onChange={e => setCategoria(e.target.value)} className="select-dark w-full">
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Descripción</label>
          <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="input-dark" />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose}
            className="flex-1 border border-white/15 rounded-xl py-2.5 text-sm font-semibold text-white/60 hover:bg-white/5 transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => onSave({ fecha, monto: Number(monto), categoria, descripcion })}
            className="flex-1 btn-red py-2.5 text-sm">
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
