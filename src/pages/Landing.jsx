import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    title: 'Voz o texto, la IA hace el resto',
    desc: 'Decí "gasté $2000 en el super" y GastIA lo clasifica, categoriza y guarda. Sin formularios, sin fricción.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Dashboard que te dice la verdad',
    desc: 'Gráficos claros de en qué gastás, cuánto tenés, y cómo venís respecto al mes anterior.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    title: 'Presupuestos con alertas',
    desc: 'Poné un límite por categoría. Cuando te acercás, GastIA te avisa. Nada de sorpresas a fin de mes.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    title: 'Todas tus cuentas, un solo lugar',
    desc: 'Efectivo, débito, crédito. Cada movimiento en su cuenta. Transferencias entre ellas. Todo claro.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
    title: 'Logros que te motivan a seguir',
    desc: 'Cerrá el mes en verde, mantené rachas, subí de nivel. Las finanzas también pueden ser adictivas.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    title: 'Deudas sin drama',
    desc: 'Lo que te deben, lo que debés. Registralo una vez y dejá de hacer cuentas en la cabeza.',
  },
]

const useCases = [
  {
    emoji: '👨‍💻',
    perfil: 'El freelancer',
    problema: 'Cobra irregular, no sabe si le cierra el mes',
    solucion: 'Registra cada ingreso, ve cuándo el balance se pone verde, ajusta gastos antes de que sea tarde.',
  },
  {
    emoji: '👩‍💼',
    perfil: 'La que tiene gastos hormiga',
    problema: 'Llega a fin de mes sin saber en qué se fue la plata',
    solucion: 'GastIA clasifica automáticamente. En una semana ya ve el patrón. En dos, lo corrige.',
  },
  {
    emoji: '👫',
    perfil: 'La pareja con cuentas compartidas',
    problema: '"¿Pagaste el alquiler? ¿Cuánto te debo?"',
    solucion: 'Cuentas separadas, deudas registradas, transferencias asentadas. Cero discusiones.',
  },
]

const steps = [
  { num: '01', title: 'Creá tu cuenta', desc: 'Gratis, en menos de un minuto. Sin tarjeta.' },
  { num: '02', title: 'Cargá tus movimientos', desc: 'Por voz, texto libre, o ambos. La IA lo clasifica sola.' },
  { num: '03', title: 'Mirá el panorama', desc: 'Dashboard, presupuestos, comparativas. Todo en un lugar.' },
]

export default function Landing() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen" style={{ background: '#070708', color: '#fff', fontFamily: 'Inter, sans-serif' }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(7,7,8,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <img src="/logo-icon.png" alt="GastIA" className="h-8 w-8 object-contain" onError={e => e.target.style.display = 'none'} />
        <div className="flex items-center gap-3">
          {!loading && user ? (
            <Link to="/home"
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: '#FA133A', color: '#fff' }}>
              Ir a mi cuenta →
            </Link>
          ) : (
            <>
              <Link to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>
                Iniciar sesión
              </Link>
              <Link to="/registro"
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ background: '#FA133A', color: '#fff' }}>
                Empezar gratis
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-40 pb-32 overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(250,19,58,0.12) 0%, transparent 70%)'
        }} />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{ background: 'rgba(250,19,58,0.1)', border: '1px solid rgba(250,19,58,0.25)', color: '#FA133A' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FA133A] animate-pulse" />
            Inteligencia artificial al servicio de tus finanzas
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight mb-6">
            Tu plata,<br />
            <span style={{ color: '#FA133A' }}>bajo control.</span>
          </h1>

          <p className="text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            Registrá gastos e ingresos hablando o escribiendo.
            GastIA clasifica todo solo, vos solo mirás los números.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/registro"
              className="px-7 py-3.5 rounded-xl text-base font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ background: '#FA133A', color: '#fff' }}>
              Empezar gratis →
            </Link>
            <Link to="/login"
              className="px-7 py-3.5 rounded-xl text-base font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}>
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        {/* Línea divisora con glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16"
          style={{ background: 'linear-gradient(to bottom, rgba(250,19,58,0.4), transparent)' }} />
      </section>

      {/* Features */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-3">Todo lo que necesitás, nada que no uses</h2>
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Sin funciones de relleno. Cada feature está porque alguien lo necesitó.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i}
              className="p-6 rounded-2xl transition-all group"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.borderColor = 'rgba(250,19,58,0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors"
                style={{ background: 'rgba(250,19,58,0.1)', color: '#FA133A' }}>
                {f.icon}
              </div>
              <h3 className="font-bold text-base mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6">
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Casos de uso */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-3">¿Para quién es GastIA?</h2>
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Para cualquiera que quiera dejar de adivinar en qué se va su plata.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {useCases.map((u, i) => (
            <div key={i} className="p-8 rounded-2xl flex flex-col gap-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-4xl">{u.emoji}</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#FA133A' }}>
                  {u.perfil}
                </p>
                <p className="font-semibold text-base mb-3">{u.problema}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {u.solucion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="px-6 py-24" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-3">Tres pasos. Ninguna excusa.</h2>
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Empezás a usar GastIA hoy. Mañana ya tenés datos. La semana que viene, claridad.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="text-5xl font-black mb-4 leading-none" style={{ color: 'rgba(250,19,58,0.2)' }}>
                {s.num}
              </div>
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(250,19,58,0.08) 0%, transparent 70%)'
        }} />
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Empezá a saber<br />
            <span style={{ color: '#FA133A' }}>en qué se va tu plata.</span>
          </h2>
          <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Gratis. Sin tarjeta. Listo en 60 segundos.
          </p>
          <Link to="/registro"
            className="inline-block px-8 py-4 rounded-xl text-base font-bold transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#FA133A', color: '#fff' }}>
            Crear mi cuenta gratis →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
        <div className="flex items-center gap-3">
          <img src="/Logo-trs.png" alt="TRS" className="h-6 w-auto opacity-40 object-contain" onError={e => e.target.style.display = 'none'} />
          <span className="text-xs">TRS Automatizaciones · Menos tareas, más resultados.</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link to="/login" className="hover:text-white transition-colors">Iniciar sesión</Link>
          <Link to="/registro" className="hover:text-white transition-colors">Registrarse</Link>
        </div>
      </footer>

    </div>
  )
}
