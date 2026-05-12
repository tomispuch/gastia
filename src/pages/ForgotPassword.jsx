import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { isValidEmail } from '../lib/validate'

export default function ForgotPassword() {
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!isValidEmail(trimmed)) { setError('Ingresá un email válido.'); return }
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#D6D7D7' }}>
      <div className="w-full max-w-sm">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#FA133A] transition-colors font-medium mb-8">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver al login
        </Link>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">📬</div>
            <h2 className="text-2xl font-black text-[#070708]">Revisá tu correo</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Te enviamos un link a <span className="font-semibold text-[#070708]">{email.trim()}</span> para restablecer tu contraseña.<br />
              Revisá también la carpeta de spam.
            </p>
            <Link to="/login" className="inline-block mt-4 text-xs font-semibold text-[#FA133A] hover:text-red-700 transition-colors">
              Volver al login →
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-black text-[#070708]">Recuperar contraseña</h2>
              <p className="text-gray-500 text-sm mt-1">Te enviamos un link para crear una nueva.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-[#FA133A] text-sm rounded-xl px-4 py-3">
                  <span>⚠</span> {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide uppercase">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-base"
                  placeholder="tu@email.com"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-red w-full py-3 text-sm">
                {loading ? 'Enviando...' : 'Enviar link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
