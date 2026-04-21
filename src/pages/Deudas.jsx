import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

function fmt(n) {
  return '$' + Number(n).toLocaleString('es-AR')
}

export default function Deudas() {
  const { user } = useAuth()
  const [deudas, setDeudas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [tab, setTab] = useState('debo')

  useEffect(() => {
    if (!user) return
    fetchDeudas()
  }, [user])

  async function fetchDeudas() {
    setLoading(true)
    const { data } = await supabase
      .from('deudas')
      .select('*')
      .eq('user_id', user.id)
      .order('pagado', { ascending: true })
      .order('fecha', { ascending: false })
    setDeudas(data || [])
    setLoading(false)
  }

  async function handleTogglePagado(deuda) {
    await supabase.from('deudas').update({ pagado: !deuda.pagado }).eq('id', deuda.id)
    fetchDeudas()
  }

  async function handleDelete(id) {
    await supabase.from('deudas').delete().eq('id', id)
    setConfirmDelete(null)
    fetchDeudas()
  }

  const debo = deudas.filter(d => d.tipo === 'debo')
  const meDeben = deudas.filter(d => d.tipo === 'me_deben')
  const totalDebo = debo.filter(d => !d.pagado).reduce((acc, d) => acc + Number(d.monto), 0)
  const totalMeDeben = meDeben.filter(d => !d.pagado).reduce((acc, d) => acc + Number(d.monto), 0)
  const lista = tab === 'debo' ? debo : meDeben

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#070708]">Deudas</h1>
        <button onClick={() => setShowForm(true)} className="btn-red px-4 py-2 text-sm">
          + Nueva
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-dark p-4 text-center">
          <p className="text-white/40 text-xs mb-1">Les debo</p>
          <p className="text-[#FA133A] font-black text-xl">{fmt(totalDebo)}</p>
          <p className="text-white/30 text-xs mt-0.5">
            {debo.filter(d => !d.pagado).length} pendiente{debo.filter(d => !d.pagado).length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="card-dark p-4 text-center">
          <p className="text-white/40 text-xs mb-1">Me deben</p>
          <p className="text-green-400 font-black text-xl">{fmt(totalMeDeben)}</p>
          <p className="text-white/30 text-xs mt-0.5">
            {meDeben.filter(d => !d.pagado).length} pendiente{meDeben.filter(d => !d.pagado).length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card-dark p-1 flex gap-1">
        <button
          onClick={() => setTab('debo')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
            tab === 'debo' ? 'bg-[#FA133A] text-white' : 'text-white/40 hover:text-white/70'
          }`}
        >
          Les debo ({debo.filter(d => !d.pagado).length})
        </button>
        <button
          onClick={() => setTab('me_deben')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
            tab === 'me_deben' ? 'bg-green-600 text-white' : 'text-white/40 hover:text-white/70'
          }`}
        >
          Me deben ({meDeben.filter(d => !d.pagado).length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[#FA133A] border-t-transparent animate-spin" />
        </div>
      ) : lista.length === 0 ? (
        <div className="card-dark p-8 text-center">
          <p className="text-4xl mb-3">{tab === 'debo' ? '✅' : '🤝'}</p>
          <p className="text-white/40 text-sm">{tab === 'debo' ? 'No tenés deudas pendientes.' : 'Nadie te debe plata.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {lista.map(deuda => (
            <div key={deuda.id} className={`card-dark p-4 flex items-center gap-3 transition-opacity ${deuda.pagado ? 'opacity-40' : ''}`}>
              <button
                onClick={() => handleTogglePagado(deuda)}
                className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  deuda.pagado
                    ? 'bg-green-500 border-green-500 text-white'
                    : tab === 'debo'
                      ? 'border-[#FA133A]/60 hover:border-[#FA133A] hover:bg-[#FA133A]/10'
                      : 'border-green-500/60 hover:border-green-500 hover:bg-green-500/10'
                }`}
              >
                {deuda.pagado && <span className="text-xs font-bold">✓</span>}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${deuda.pagado ? 'line-through text-white/30' : 'text-white'}`}>
                    {deuda.persona}
                  </span>
                  {deuda.pagado && (
                    <span className="text-xs bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded-full">Saldado</span>
                  )}
                </div>
                {deuda.descripcion && <p className="text-white/40 text-xs mt-0.5 truncate">{deuda.descripcion}</p>}
                <p className="text-white/25 text-xs mt-0.5">{deuda.fecha}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`font-bold text-sm ${tab === 'debo' ? 'text-[#FA133A]' : 'text-green-400'}`}>
                  {fmt(deuda.monto)}
                </span>
                <button
                  onClick={() => setConfirmDelete(deuda)}
                  className="w-7 h-7 rounded-lg bg-[#FA133A]/10 hover:bg-[#FA133A]/20 flex items-center justify-center text-xs transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <FormDeuda
          onClose={() => setShowForm(false)}
          onSave={async (data) => {
            await supabase.from('deudas').insert({ ...data, user_id: user.id })
            setShowForm(false)
            fetchDeudas()
          }}
          tabInicial={tab}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 px-4">
          <div className="card-dark p-6 w-full max-w-sm">
            <h3 className="text-white font-bold mb-2">¿Eliminar deuda?</h3>
            <p className="text-white/50 text-sm mb-5">{confirmDelete.persona} — {fmt(confirmDelete.monto)}</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-white/15 rounded-xl py-2.5 text-sm font-semibold text-white/60 hover:bg-white/5 transition-colors">
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDelete.id)} className="flex-1 btn-red py-2.5 text-sm">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FormDeuda({ onClose, onSave, tabInicial }) {
  const [tipo, setTipo] = useState(tabInicial)
  const [persona, setPersona] = useState('')
  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await onSave({ tipo, persona, monto: Number(monto), descripcion, fecha, pagado: false })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 px-4">
      <div className="card-dark p-6 w-full max-w-sm space-y-4">
        <h3 className="text-white font-bold">Nueva deuda</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-white/8 rounded-xl p-1 gap-1">
            <button type="button" onClick={() => setTipo('debo')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tipo === 'debo' ? 'bg-[#FA133A] text-white' : 'text-white/40'}`}>
              Les debo
            </button>
            <button type="button" onClick={() => setTipo('me_deben')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tipo === 'me_deben' ? 'bg-green-600 text-white' : 'text-white/40'}`}>
              Me deben
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
              {tipo === 'debo' ? '¿A quién le debés?' : '¿Quién te debe?'}
            </label>
            <input type="text" required value={persona} onChange={e => setPersona(e.target.value)}
              placeholder="Nombre de la persona" className="input-dark" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Monto</label>
            <input type="number" required value={monto} onChange={e => setMonto(e.target.value)}
              placeholder="0" className="input-dark" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Descripción (opcional)</label>
            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)}
              placeholder="Ej: préstamo del viernes" className="input-dark" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="input-dark" />
          </div>

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
