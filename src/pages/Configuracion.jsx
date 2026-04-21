import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { usePlan } from '../hooks/usePlan'

export default function Configuracion() {
  const { user } = useAuth()
  const { plan, nombre } = usePlan(user?.id)

  const [newPassword, setNewPassword] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  const [resumenActivo, setResumenActivo] = useState(false)
  const [categorias, setCategorias] = useState([])
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [catLoading, setCatLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('usuarios_config').select('resumen_mensual_activo').eq('user_id', user.id).single()
      .then(({ data }) => setResumenActivo(data?.resumen_mensual_activo ?? false))
    if (plan === 'pro') {
      supabase.from('categorias_custom').select('*').eq('user_id', user.id).order('created_at')
        .then(({ data }) => setCategorias(data || []))
    }
  }, [user, plan])

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwError('')
    setPwSuccess(false)
    if (newPassword.length < 6) { setPwError('La contraseña debe tener al menos 6 caracteres.'); return }
    setPwLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPwLoading(false)
    if (error) { setPwError(error.message) } else { setPwSuccess(true); setNewPassword('') }
  }

  async function toggleResumen(val) {
    setResumenActivo(val)
    await supabase.from('usuarios_config').update({ resumen_mensual_activo: val }).eq('user_id', user.id)
  }

  async function handleAddCategoria(e) {
    e.preventDefault()
    if (!nuevaCategoria.trim()) return
    setCatLoading(true)
    const { data } = await supabase.from('categorias_custom').insert({ user_id: user.id, categoria: nuevaCategoria.trim() }).select().single()
    setCategorias(prev => [...prev, data])
    setNuevaCategoria('')
    setCatLoading(false)
  }

  async function handleDeleteCategoria(id) {
    await supabase.from('categorias_custom').delete().eq('id', id)
    setCategorias(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-black text-[#070708]">Configuración</h1>

      {/* User info */}
      <div className="card-dark p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FA133A]/15 flex items-center justify-center text-xl font-black text-[#FA133A]">
            {(nombre || user?.email || '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-white font-bold">{nombre || user?.email}</p>
            <p className="text-white/40 text-sm">{user?.email}</p>
            <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 ${
              plan === 'pro' ? 'bg-[#FA133A] text-white' : 'bg-white/10 text-white/50'
            }`}>
              {plan?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="card-dark p-5">
        <h2 className="text-white font-bold text-sm mb-4">Cambiar contraseña</h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Nueva contraseña"
            minLength={6}
            className="input-dark"
          />
          {pwError && <p className="text-xs text-[#FA133A]">{pwError}</p>}
          {pwSuccess && <p className="text-xs text-green-400">✅ Contraseña actualizada correctamente.</p>}
          <button type="submit" disabled={pwLoading} className="btn-red w-full py-2.5 text-sm">
            {pwLoading ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>

      {/* Pro features */}
      {plan === 'pro' ? (
        <>
          <div className="card-dark p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold text-sm">Resumen mensual por email</p>
                <p className="text-white/40 text-xs mt-0.5">Recibís un resumen automático al fin de mes</p>
              </div>
              <button
                onClick={() => toggleResumen(!resumenActivo)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${resumenActivo ? 'bg-[#FA133A]' : 'bg-white/15'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${resumenActivo ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="card-dark p-5 space-y-4">
            <h2 className="text-white font-bold text-sm">Categorías personalizadas</h2>
            <form onSubmit={handleAddCategoria} className="flex gap-2">
              <input
                type="text"
                value={nuevaCategoria}
                onChange={e => setNuevaCategoria(e.target.value)}
                placeholder="Nueva categoría"
                className="input-dark flex-1"
              />
              <button
                type="submit"
                disabled={catLoading || !nuevaCategoria.trim()}
                className="btn-red px-4 py-2 text-sm flex-shrink-0"
              >
                Agregar
              </button>
            </form>
            {categorias.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-2">Sin categorías personalizadas.</p>
            ) : (
              <div className="space-y-2">
                {categorias.map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5">
                    <span className="text-white text-sm">{c.categoria}</span>
                    <button onClick={() => handleDeleteCategoria(c.id)} className="text-xs text-[#FA133A] hover:text-red-400 font-semibold">
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card-dark p-5 opacity-50">
          <p className="text-white font-semibold text-sm mb-1">Resumen mensual · Categorías personalizadas</p>
          <p className="text-white/50 text-xs">Disponibles en el plan Pro.</p>
        </div>
      )}
    </div>
  )
}
