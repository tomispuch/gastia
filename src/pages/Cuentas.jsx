import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { localDateStr } from '../lib/validate'
import { useToast } from '../context/ToastContext'

const TIPOS = [
  { tipo: 'general',  label: 'General',           icono: '💰', color: '#6B7280' },
  { tipo: 'efectivo', label: 'Efectivo',           icono: '💵', color: '#10B981' },
  { tipo: 'digital',  label: 'Billetera digital',  icono: '📱', color: '#3B82F6' },
  { tipo: 'debito',   label: 'Débito',             icono: '💳', color: '#8B5CF6' },
  { tipo: 'credito',  label: 'Crédito',            icono: '💳', color: '#FA133A' },
  { tipo: 'ahorro',   label: 'Ahorro',             icono: '🏦', color: '#F59E0B' },
]

function fmt(n) { return '$' + Number(n).toLocaleString('es-AR') }

export default function Cuentas() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [cuentas, setCuentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showTransfer, setShowTransfer] = useState(false)

  const fetchCuentas = useCallback(async () => {
    setLoading(true)
    const { data: cuentasData } = await supabase
      .from('cuentas').select('*').eq('user_id', user.id).order('created_at')

    if (!cuentasData?.length) { setCuentas([]); setLoading(false); return }

    const [gastosRes, ingresosRes, transOriRes, transDestRes] = await Promise.all([
      supabase.from('gastos').select('cuenta_id, monto').eq('user_id', user.id),
      supabase.from('ingresos').select('cuenta_id, monto').eq('user_id', user.id),
      supabase.from('transferencias').select('cuenta_origen_id, monto').eq('user_id', user.id),
      supabase.from('transferencias').select('cuenta_destino_id, monto').eq('user_id', user.id),
    ])

    const balances = {}
    for (const c of cuentasData) balances[c.id] = Number(c.saldo_inicial)
    for (const g of (gastosRes.data || [])) if (balances[g.cuenta_id] !== undefined) balances[g.cuenta_id] -= Number(g.monto)
    for (const i of (ingresosRes.data || [])) if (balances[i.cuenta_id] !== undefined) balances[i.cuenta_id] += Number(i.monto)
    for (const t of (transOriRes.data || [])) if (balances[t.cuenta_origen_id] !== undefined) balances[t.cuenta_origen_id] -= Number(t.monto)
    for (const t of (transDestRes.data || [])) if (balances[t.cuenta_destino_id] !== undefined) balances[t.cuenta_destino_id] += Number(t.monto)

    setCuentas(cuentasData.map(c => ({ ...c, balance: balances[c.id] })))
    setLoading(false)
  }, [user])

  useEffect(() => { if (user) fetchCuentas() }, [user, fetchCuentas])

  async function handleSave(formData) {
    const esEdicion = Boolean(editando)
    if (editando) {
      await supabase.from('cuentas').update(formData).eq('id', editando.id)
    } else {
      await supabase.from('cuentas').insert({ ...formData, user_id: user.id })
    }
    setShowForm(false); setEditando(null); fetchCuentas()
    showToast(esEdicion ? 'Cuenta actualizada.' : 'Cuenta creada.')
  }

  async function handleDelete(cuenta) {
    await supabase.from('cuentas').delete().eq('id', cuenta.id)
    setConfirmDelete(null); fetchCuentas()
    showToast('Cuenta eliminada.')
  }

  const totalBalance = cuentas.filter(c => c.tipo !== 'ahorro').reduce((a, c) => a + (c.balance || 0), 0)
  const totalAhorro  = cuentas.filter(c => c.tipo === 'ahorro').reduce((a, c) => a + (c.balance || 0), 0)

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#070708]">Cuentas</h1>
        <button onClick={() => { setEditando(null); setShowForm(true) }} className="btn-red px-4 py-2 text-sm">
          + Nueva
        </button>
      </div>

      {/* Balance total */}
      <div className="card-dark p-5">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Balance disponible</p>
        <p className={`font-black text-3xl ${totalBalance >= 0 ? 'text-white' : 'text-[#FA133A]'}`}>
          {fmt(totalBalance)}
        </p>
        <p className="text-white/30 text-xs mt-1">{cuentas.length} cuenta{cuentas.length !== 1 ? 's' : ''}</p>
        {totalAhorro > 0 && (
          <div className="mt-3 pt-3 border-t border-white/8 flex items-center justify-between">
            <span className="text-white/40 text-xs">🏦 Ahorro acumulado</span>
            <span className="text-[#F59E0B] font-bold text-sm">{fmt(totalAhorro)}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-[#FA133A] border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {cuentas.map(cuenta => {
            const tipo = TIPOS.find(t => t.tipo === cuenta.tipo) || TIPOS[0]
            return (
              <div key={cuenta.id} className="card-dark p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: tipo.color + '22' }}>
                  {cuenta.icono || tipo.icono}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">{cuenta.nombre}</p>
                  <p className="text-white/40 text-xs">{tipo.label}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-black text-lg ${cuenta.balance >= 0 ? 'text-white' : 'text-[#FA133A]'}`}>
                    {fmt(cuenta.balance || 0)}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => { setEditando(cuenta); setShowForm(true) }}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs transition-colors"
                  >✏️</button>
                  <button
                    onClick={() => setConfirmDelete(cuenta)}
                    className="w-8 h-8 rounded-lg bg-[#FA133A]/15 hover:bg-[#FA133A]/25 flex items-center justify-center text-xs transition-colors"
                  >🗑️</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Transferir */}
      {cuentas.length >= 2 && (
        <button
          onClick={() => setShowTransfer(true)}
          className="w-full card-dark p-4 flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors border border-white/10 hover:border-white/20"
        >
          <span className="text-lg">↔️</span>
          <span className="font-semibold text-sm">Transferir entre cuentas</span>
        </button>
      )}

      {showForm && (
        <FormCuenta
          inicial={editando}
          onClose={() => { setShowForm(false); setEditando(null) }}
          onSave={handleSave}
        />
      )}

      {showTransfer && (
        <FormTransferencia
          cuentas={cuentas}
          userId={user.id}
          onClose={() => setShowTransfer(false)}
          onSave={() => { setShowTransfer(false); fetchCuentas(); showToast('Transferencia realizada.') }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 px-4">
          <div className="card-dark p-6 w-full max-w-sm">
            <h3 className="text-white font-bold mb-2">¿Eliminar cuenta?</h3>
            <p className="text-white/50 text-sm mb-1">{confirmDelete.nombre}</p>
            <p className="text-yellow-400 text-xs mb-5">⚠️ Los movimientos asociados quedarán sin cuenta asignada.</p>
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

function FormCuenta({ inicial, onClose, onSave }) {
  const [nombre, setNombre] = useState(inicial?.nombre || '')
  const [tipo, setTipo] = useState(inicial?.tipo || 'general')
  const [saldoInicial, setSaldoInicial] = useState(inicial?.saldo_inicial || 0)
  const [saving, setSaving] = useState(false)

  const tipoObj = TIPOS.find(t => t.tipo === tipo) || TIPOS[0]

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await onSave({ nombre, tipo, icono: tipoObj.icono, color: tipoObj.color, saldo_inicial: Number(saldoInicial) })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 px-4">
      <div className="card-dark p-6 w-full max-w-sm space-y-4">
        <h3 className="text-white font-bold">{inicial ? 'Editar cuenta' : 'Nueva cuenta'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Nombre</label>
            <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Mercado Pago" className="input-dark" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Tipo</label>
            <div className="grid grid-cols-3 gap-2">
              {TIPOS.map(t => (
                <button
                  key={t.tipo}
                  type="button"
                  onClick={() => setTipo(t.tipo)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    tipo === t.tipo ? 'border-[#FA133A] bg-[#FA133A]/10' : 'border-white/10 hover:border-white/25'
                  }`}
                >
                  <p className="text-xl mb-1">{t.icono}</p>
                  <p className="text-xs text-white/60 leading-tight">{t.label}</p>
                </button>
              ))}
            </div>
          </div>
          {!inicial && (
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Saldo inicial</label>
              <input type="number" value={saldoInicial} onChange={e => setSaldoInicial(e.target.value)}
                placeholder="0" className="input-dark" />
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

function FormTransferencia({ cuentas, userId, onClose, onSave }) {
  const [origenId, setOrigenId] = useState(cuentas[0]?.id || '')
  const [destinoId, setDestinoId] = useState(cuentas[1]?.id || '')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(localDateStr())
  const [descripcion, setDescripcion] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (origenId === destinoId) { setError('Las cuentas de origen y destino deben ser distintas.'); return }
    if (!monto || Number(monto) <= 0) { setError('Ingresá un monto válido.'); return }
    setSaving(true)
    await supabase.from('transferencias').insert({
      user_id: userId,
      cuenta_origen_id: origenId,
      cuenta_destino_id: destinoId,
      monto: Number(monto),
      fecha,
      descripcion,
    })
    setSaving(false)
    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 px-4">
      <div className="card-dark p-6 w-full max-w-sm space-y-4">
        <h3 className="text-white font-bold">Transferir entre cuentas</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Desde</label>
            <select value={origenId} onChange={e => setOrigenId(e.target.value)} className="select-dark w-full">
              {cuentas.map(c => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Hacia</label>
            <select value={destinoId} onChange={e => setDestinoId(e.target.value)} className="select-dark w-full">
              {cuentas.map(c => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Monto</label>
            <input type="number" required value={monto} onChange={e => setMonto(e.target.value)}
              placeholder="0" className="input-dark" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="input-dark" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Descripción (opcional)</label>
            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)}
              placeholder="Ej: Recarga Mercado Pago" className="input-dark" />
          </div>
          {error && <p className="text-xs text-[#FA133A] bg-[#FA133A]/10 px-3 py-2 rounded-xl">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-white/15 rounded-xl py-2.5 text-sm font-semibold text-white/60 hover:bg-white/5 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 btn-red py-2.5 text-sm">
              {saving ? 'Transfiriendo...' : 'Transferir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
