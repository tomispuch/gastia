import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { isValidEmail, isValidPassword, sanitizeName } from '../lib/validate'

export default function Registro() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const nombreSanitized = sanitizeName(nombre)
    const emailTrimmed = email.trim()

    if (nombreSanitized.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.')
      return
    }
    if (!isValidEmail(emailTrimmed)) {
      setError('Ingresá un email válido.')
      return
    }
    if (!isValidPassword(password)) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: emailTrimmed,
      password,
      options: { data: { nombre: nombreSanitized } },
    })

    if (signUpError) {
      setError('Ocurrió un error al crear la cuenta. Intentá de nuevo.')
      setLoading(false)
      return
    }

    if (data.user && data.user.identities?.length === 0) {
      setError('Ya existe una cuenta con ese email. ¿Querés iniciar sesión?')
      setLoading(false)
      return
    }

    setLoading(false)
    navigate('/home')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#D6D7D7' }}>

      {/* Panel izquierdo */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12"
        style={{ background: 'linear-gradient(155deg, #070708 60%, #1c0408 100%)' }}>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <img
            src="/logo-gastia.png"
            alt="GastIA"
            className="w-4/5 max-w-sm object-contain drop-shadow-2xl mb-8"
            onError={e => e.target.style.display='none'}
          />
          <h1 className="text-4xl font-black text-white leading-tight mb-3">
            Empezá a<br />
            <span style={{ color: '#FA133A' }}>tomar el control.</span>
          </h1>
          <p className="text-white/50 text-base leading-relaxed">
            Creá tu cuenta gratuita y comenzá a registrar<br />tus gastos e ingresos hoy mismo.
          </p>
        </div>

        <a href="https://trs-automatizaciones.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
          <img src="/Logo-trs.png" alt="TRS" className="h-8 w-auto opacity-60 hover:opacity-90 transition-opacity max-w-[80px] object-contain" onError={e => e.target.style.display='none'} />
          <div>
            <p className="text-white/30 text-xs font-medium">Desarrollado por</p>
            <p className="text-white/60 text-sm font-semibold">TRS Automatizaciones</p>
          </div>
        </a>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="lg:hidden mb-8">
          <img src="/logo-gastia.png" alt="GastIA" className="h-14 mx-auto max-w-[200px] object-contain" onError={e => e.target.style.display='none'} />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-[#070708]">Crear cuenta</h2>
            <p className="text-gray-500 text-sm mt-1">Es gratis y lleva menos de un minuto</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-[#FA133A] text-sm rounded-xl px-4 py-3">
                <span>⚠</span> {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide uppercase">Nombre</label>
              <input
                type="text"
                required
                maxLength={50}
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className="input-base"
                placeholder="Tu nombre"
              />
            </div>

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
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-base"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-red w-full py-3 text-sm mt-2">
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>

            <p className="text-center text-xs text-gray-400 pt-1">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="font-semibold text-[#FA133A] hover:text-red-700">
                Iniciar sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
