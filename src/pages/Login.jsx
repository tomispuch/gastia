import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('Email o contraseña incorrectos.')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#D6D7D7' }}>

      {/* Panel izquierdo — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12"
        style={{ background: 'linear-gradient(155deg, #070708 60%, #1c0408 100%)' }}>

        {/* Logo + texto centrados juntos */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <img
            src="/logo-gastia.png"
            alt="GastIA"
            className="w-4/5 max-w-sm object-contain drop-shadow-2xl mb-8"
            onError={e => e.target.style.display='none'}
          />
          <h1 className="text-6xl font-black text-white leading-tight mb-4">
            Tu plata,<br />
            <span style={{ color: '#FA133A' }}>bajo control.</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed">
            Registrá gastos e ingresos por voz o texto.<br />Visualizá tu progreso. Alcanzá tus metas.
          </p>
        </div>

        {/* TRS abajo */}
        <div className="flex items-center gap-3">
          <img src="/Logo-trs.png" alt="TRS" className="h-8 w-auto opacity-60 max-w-[80px] object-contain" onError={e => e.target.style.display='none'} />
          <div>
            <p className="text-white/30 text-xs font-medium">Desarrollado por</p>
            <p className="text-white/60 text-sm font-semibold">TRS Automatizaciones</p>
          </div>
        </div>
      </div>

      {/* Panel derecho — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Logo mobile */}
        <div className="lg:hidden mb-8 text-center">
          <img src="/logo-gastia.png" alt="GastIA" className="h-14 mx-auto mb-2 max-w-[200px] object-contain" onError={e => e.target.style.display='none'} />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-[#070708]">Bienvenido</h2>
            <p className="text-gray-500 text-sm mt-1">Ingresá a tu cuenta para continuar</p>
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

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide uppercase">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-base"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-red w-full py-3 text-sm mt-2">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>

            <div className="flex items-center justify-between text-sm pt-1">
              <button
                type="button"
                onClick={async () => {
                  if (!email) { setError('Ingresá tu email para recuperar la contraseña.'); return }
                  await supabase.auth.resetPasswordForEmail(email)
                  setError('')
                  alert('Te enviamos un email para recuperar tu contraseña.')
                }}
                className="text-gray-400 hover:text-[#FA133A] transition-colors text-xs"
              >
                Olvidé mi contraseña
              </button>
              <Link to="/registro" className="text-xs font-semibold text-[#FA133A] hover:text-red-700 transition-colors">
                Crear cuenta →
              </Link>
            </div>
          </form>

          {/* Mobile TRS credit */}
          <div className="lg:hidden mt-12 flex items-center justify-center gap-2 opacity-50">
            <img src="/Logo-trs.png" alt="TRS" className="h-5 w-auto max-w-[50px] object-contain" onError={e => e.target.style.display='none'} />
            <span className="text-xs text-gray-500">TRS Automatizaciones</span>
          </div>
        </div>
      </div>
    </div>
  )
}
