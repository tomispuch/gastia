import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'

const CATEGORIAS_GASTO = ['Comida y bebida','Transporte','Salud','Vivienda','Entretenimiento','Ropa e indumentaria','Educación','Tecnología','Viajes','Impuesto','Otros']
const CATEGORIAS_INGRESO = ['Sueldo','Freelance','Venta','Inversiones','Regalo','Otro']

function fmt(n) { return '$' + Number(n).toLocaleString('es-AR') }

function proximaFecha(dia) {
  const hoy = new Date()
  const anio = hoy.getFullYear()
  const mes = hoy.getMonth()
  const diaHoy = hoy.getDate()
  const diaMes = Math.min(dia, new Date(anio, mes + 1, 0).getDate())
  if (diaHoy <= diaMes) {
    return new Date(anio, mes, diaMes)
  }
  const sigMes = mes + 1 > 11 ? 0 : mes + 1
  const sigAnio = mes + 1 > 11 ? anio + 1 : anio
  const diaSig = Math.min(dia, new Date(sigAnio, sigMes + 1, 0).getDate())
  return new Date(sigAnio, sigMes, diaSig)
}

function formatFecha(date) {
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

export default function Recurrentes() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [cuentas, setCuentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [toggling, setToggling] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [recRes, cRes] = await Promise.all([
      supabase.from('movimientos_recurrentes').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('cuentas').select('id, nombre, icono').eq('user_id', user.id).order('created_at'),
    ])
    setItems(recRes.data || [])
    setCuentas(cRes.data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { if (user) fetchData() }, [user, fetchData])

  async function handleSave(formData) {
    const esEdicion = Boolean(editando)
    if (editando) {
      await supabase.from('movimientos_recurrentes').update(formData).eq('id', editando.id)
    } else {
      await supabase.from('movimientos_recurrentes').insert({ ...formData, user_id: user.id })
    }
    setShowForm(false)
    setEditando(null)
    fetchData()
    showToast(esEdicion ? 'Recurrente actualizado.' : 'Recurrente creado.')
  }

  async function handleToggle(item) {
    setToggling(item.id)
    await supabase.from('movimientos_recurrentes').update({ activo: !item.activo }).eq('id', item.id)
    setToggling(null)
    fetchData()
    showToast(item.activo ? 'Recurrente pausado.' : 'Recurrente activado.')
  }

  async function handleDelete(item) {
    await supabase.from('movimientos_recurrentes').delete().eq('id', item.id)
    setConfirmDelete(null)
    fetchData()
    showToast('Recurrente eliminado.')
  }

  const activos = items.filter(i => i.activo)
  const pausados = items.filter(i => !i.activo)

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#070708]">Recurrentes</h1>
        <button onClick={() => { setEditando(null); setShowForm(true) }} className="btn-red px-4 py-2 text-sm">
          + Nuevo
        </button>
      </div>

      <p className="text-[#070708]/50 text-xs">
        Los movimientos recurrentes se registran automáticamente cada mes en el día que indiques.
      </p>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[#FA133A] border-t-transparent animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="card-dark p-8 text-center">
          <p className="text-4xl mb-3">🔁</p>
          <p className="text-white font-semibold text-sm mb-1">Sin movimientos recurrentes</p>
          <p className="text-white/40 text-xs">Creá uno para que se registre solo cada mes.</p>
        </div>
      ) : (
        <>
          {activos.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#070708]/50 uppercase tracking-widest">Activos</p>
              {activos.map(item => (
                <RecurrenteCard
                  key={item.id}
                  item={item}
                  cuentas={cuentas}
                  toggling={toggling === item.id}
                  onToggle={() => handleToggle(item)}
                  onEdit={() => { setEditando(item); setShowForm(true) }}
                  onDelete={() => setConfirmDelete(item)}
                />
              ))}
            </div>
          )}

          {pausados.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#070708]/50 uppercase tracking-widest">Pausados</p>
              {pausados.map(item => (
                <RecurrenteCard
                  key={item.id}
                  item={item}
                  cuentas={cuentas}
                  toggling={toggling === item.id}
                  onToggle={() => handleToggle(item)}
                  onEdit={() => { setEditando(item); setShowForm(true) }}
                  onDelete={() => setConfirmDelete(item)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showForm && (
        <FormRecurrente
          inicial={editando}
          cuentas={cuentas}
          onClose={() => { setShowForm(false); setEditando(null) }}
          onSave={handleSave}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 px-4">
          <div className="card-dark p-6 w-full max-w-sm">
            <h3 className="text-white font-bold mb-2">¿Eliminar recurrente?</h3>
            <p className="text-white/50 text-sm mb-5">
              {confirmDelete.descripcion || confirmDelete.categoria} — {fmt(confirmDelete.monto)}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-white/15 rounded-xl py-2.5 text-sm font-semibold text-white/60 hover:bg-white/5 transition-colors">
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 btn-red py-2.5 text-sm">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RecurrenteCard({ item, cuentas, toggling, onToggle, onEdit, onDelete }) {
  const cuenta = cuentas.find(c => c.id === item.cuenta_id)
  const proxima = proximaFecha(item.dia_del_mes)
  const esHoy = proxima.toDateString() === new Date().toDateString()

  return (
    <div className={`card-dark p-4 flex items-center gap-3 ${!item.activo ? 'opacity-50' : ''}`}>
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${
        item.tipo === 'gasto' ? 'bg-[#FA133A]/15 text-[#FA133A]' : 'bg-green-500/15 text-green-400'
      }`}>
        {item.tipo === 'gasto' ? '↓' : '↑'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-white font-semibold text-sm truncate">
            {item.descripcion || item.categoria}
          </span>
          <span className="text-xs text-white/30">🔁</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs bg-white/10 text-white/60 rounded px-1.5 py-0.5">{item.categoria}</span>
          {cuenta && <span className="text-xs text-white/40">{cuenta.icono} {cuenta.nombre}</span>}
          {item.activo && (
            <span className={`text-xs font-medium ${esHoy ? 'text-yellow-400' : 'text-white/40'}`}>
              {esHoy ? '⚡ Hoy' : `Próx. ${formatFecha(proxima)}`}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`font-bold text-sm ${item.tipo === 'gasto' ? 'text-[#FA133A]' : 'text-green-400'}`}>
          {item.tipo === 'ingreso' ? '+' : '-'}{fmt(item.monto)}
        </span>

        <button
          onClick={onToggle}
          disabled={toggling}
          title={item.activo ? 'Pausar' : 'Activar'}
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
            item.activo
              ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
              : 'bg-white/10 text-white/40 hover:bg-white/20'
          }`}
        >
          {toggling ? '…' : item.activo ? '⏸' : '▶'}
        </button>
        <button onClick={onEdit}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs transition-colors">
          ✏️
        </button>
        <button onClick={onDelete}
          className="w-8 h-8 rounded-lg bg-[#FA133A]/15 hover:bg-[#FA133A]/25 flex items-center justify-center text-xs transition-colors">
          🗑️
        </button>
      </div>
    </div>
  )
}

function FormRecurrente({ inicial, cuentas, onClose, onSave }) {
  const [tipo, setTipo] = useState(inicial?.tipo || 'gasto')
  const [monto, setMonto] = useState(inicial?.monto || '')
  const [categoria, setCategoria] = useState(inicial?.categoria || CATEGORIAS_GASTO[0])
  const [descripcion, setDescripcion] = useState(inicial?.descripcion || '')
  const [diaMes, setDiaMes] = useState(inicial?.dia_del_mes || new Date().getDate())
  const [cuentaId, setCuentaId] = useState(inicial?.cuenta_id || (cuentas[0]?.id || ''))
  const [saving, setSaving] = useState(false)

  const categorias = tipo === 'gasto' ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO

  async function handleSubmit(e) {
    e.preventDefault()
    if (!monto || Number(monto) <= 0) return
    setSaving(true)
    await onSave({
      tipo,
      monto: Number(monto),
      categoria,
      descripcion: descripcion.trim() || null,
      dia_del_mes: Number(diaMes),
      cuenta_id: cuentaId || null,
      activo: inicial?.activo ?? true,
    })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 px-4">
      <div className="card-dark p-6 w-full max-w-sm space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-white font-bold">{inicial ? 'Editar recurrente' : 'Nuevo recurrente'}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo */}
          <div className="flex gap-2">
            {['gasto','ingreso'].map(t => (
              <button key={t} type="button" onClick={() => { setTipo(t); setCategoria(t === 'gasto' ? CATEGORIAS_GASTO[0] : CATEGORIAS_INGRESO[0]) }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  tipo === t
                    ? t === 'gasto' ? 'bg-[#FA133A] text-white' : 'bg-green-500 text-white'
                    : 'bg-white/10 text-white/50 hover:bg-white/15'
                }`}>
                {t === 'gasto' ? '📤 Gasto' : '📥 Ingreso'}
              </button>
            ))}
          </div>

          {/* Monto */}
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Monto</label>
            <input type="number" required min="1" value={monto} onChange={e => setMonto(e.target.value)}
              placeholder="0" className="input-dark" />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Categoría</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value)} className="select-dark w-full">
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Descripción (opcional)</label>
            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)}
              placeholder="Ej: Netflix, Alquiler..." className="input-dark" maxLength={100} />
          </div>

          {/* Día del mes */}
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
              Día del mes <span className="text-white/25 normal-case font-normal">(1–28)</span>
            </label>
            <input type="number" required min="1" max="28" value={diaMes} onChange={e => setDiaMes(e.target.value)}
              className="input-dark" />
            <p className="text-white/25 text-xs mt-1">Máximo 28 para que funcione en todos los meses.</p>
          </div>

          {/* Cuenta */}
          {cuentas.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Cuenta</label>
              <select value={cuentaId} onChange={e => setCuentaId(e.target.value)} className="select-dark w-full">
                <option value="">Sin cuenta asignada</option>
                {cuentas.map(c => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-white/15 rounded-xl py-2.5 text-sm font-semibold text-white/60 hover:bg-white/5 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 btn-red py-2.5 text-sm">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
