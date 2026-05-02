import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect } from 'react'

const TICKER = [
  { label: 'Delivery', amount: '-$12.400', red: true },
  { label: 'Supermercado', amount: '-$24.300', red: true },
  { label: 'Sueldo', amount: '+$320.000', red: false },
  { label: 'Nafta', amount: '-$15.600', red: true },
  { label: 'Netflix', amount: '-$4.999', red: true },
  { label: 'Alquiler', amount: '-$180.000', red: true },
  { label: 'Freelance', amount: '+$85.000', red: false },
  { label: 'Gimnasio', amount: '-$9.800', red: true },
  { label: 'Uber', amount: '-$3.200', red: true },
  { label: 'Farmacia', amount: '-$7.100', red: true },
  { label: 'Bar', amount: '-$6.500', red: true },
  { label: 'Luz', amount: '-$11.400', red: true },
]

const DEMOS = [
  {
    input: 'Gasté $5.000 en comida rápida',
    response: { emoji: '🍔', category: 'Alimentación', amount: '-$5.000', account: 'Efectivo', isIncome: false },
  },
  {
    input: 'Me pagaron $150.000 por el proyecto web',
    response: { emoji: '💼', category: 'Trabajo freelance', amount: '+$150.000', account: 'Mercado Pago', isIncome: true },
  },
  {
    input: 'Alquiler enero $180.000 del Santander',
    response: { emoji: '🏠', category: 'Vivienda', amount: '-$180.000', account: 'Débito Santander', isIncome: false },
  },
]

const TESTIMONIALS = [
  {
    name: 'Carolina M.',
    role: 'Diseñadora freelance · Rosario',
    text: 'Antes llegaba a fin de mes sin entender en qué se me había ido el sueldo. En dos semanas ya vi el patrón. Me sorprendió lo que gastaba en delivery.',
    initial: 'C',
  },
  {
    name: 'Matías R.',
    role: 'Empleado administrativo · CABA',
    text: 'Lo que más me convenció fue lo fácil que es cargar. Escribo como si le mandara un mensaje a alguien y listo. Sin categorías raras ni formularios que odio.',
    initial: 'M',
  },
  {
    name: 'Julieta & Santiago',
    role: 'Pareja con cuentas compartidas · GBA',
    text: 'Dejamos de discutir por quién debe qué. Cada uno registra sus gastos y las deudas entre nosotros están siempre al día. Fue un cambio enorme.',
    initial: 'J',
  },
]

function ChatDemo() {
  const [phase, setPhase] = useState('typing')
  const [demoIndex, setDemoIndex] = useState(0)
  const [typedChars, setTypedChars] = useState(0)

  const demo = DEMOS[demoIndex]
  const fullText = demo.input

  useEffect(() => {
    setTypedChars(0)
    setPhase('typing')
  }, [demoIndex])

  useEffect(() => {
    let timer
    if (phase === 'typing') {
      if (typedChars < fullText.length) {
        timer = setTimeout(() => setTypedChars(c => c + 1), 45)
      } else {
        timer = setTimeout(() => setPhase('thinking'), 400)
      }
    } else if (phase === 'thinking') {
      timer = setTimeout(() => setPhase('response'), 1300)
    } else if (phase === 'response') {
      timer = setTimeout(() => setPhase('pause'), 2800)
    } else if (phase === 'pause') {
      timer = setTimeout(() => setDemoIndex(i => (i + 1) % DEMOS.length), 600)
    }
    return () => clearTimeout(timer)
  }, [phase, typedChars, fullText.length])

  const displayText = fullText.slice(0, typedChars)
  const isTyping = phase === 'typing'
  const isThinking = phase === 'thinking'
  const showResponse = phase === 'response' || phase === 'pause'
  const amountColor = demo.response.isIncome ? '#22c55e' : '#FA133A'

  return (
    <div className="relative w-full max-w-[340px] mx-auto select-none">
      {/* Floating badge top-right */}
      <div className="absolute -top-3 -right-4 z-10 px-3 py-1.5 rounded-xl text-xs font-bold"
        style={{
          background: 'rgba(34,197,94,0.12)',
          border: '1px solid rgba(34,197,94,0.3)',
          color: '#22c55e',
          backdropFilter: 'blur(12px)',
          animation: 'float 3s ease-in-out infinite',
        }}>
        ↑ +$150.000 ingresado
      </div>

      {/* Floating badge bottom-left */}
      <div className="absolute -bottom-3 -left-4 z-10 px-3 py-1.5 rounded-xl text-xs font-bold"
        style={{
          background: 'rgba(250,19,58,0.12)',
          border: '1px solid rgba(250,19,58,0.3)',
          color: '#FA133A',
          backdropFilter: 'blur(12px)',
          animation: 'float 3s ease-in-out 1.5s infinite',
        }}>
        🍕 Alimentación 68%
      </div>

      {/* Phone card */}
      <div className="rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1c1d21 0%, #0d0e10 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>

        {/* Header */}
        <div className="px-5 py-3.5 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #FA133A, #c40e2e)' }}>
            G
          </div>
          <div>
            <div className="text-sm font-bold text-white">GastIA</div>
            <div className="text-xs flex items-center gap-1.5" style={{ color: '#22c55e' }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: '#22c55e' }} />
              Procesando con IA
            </div>
          </div>
          <div className="ml-auto flex gap-1.5">
            {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            ))}
          </div>
        </div>

        {/* Chat messages */}
        <div className="p-4 space-y-3" style={{ minHeight: '210px' }}>
          <div className="text-center">
            <span className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
              Hoy
            </span>
          </div>

          {/* User bubble */}
          {typedChars > 0 && (
            <div className="flex justify-end">
              <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md text-sm font-medium text-white"
                style={{ background: '#FA133A' }}>
                {displayText}
                {isTyping && (
                  <span className="ml-0.5 inline-block w-0.5 h-3.5 bg-white align-middle"
                    style={{ animation: 'blink 1s step-end infinite' }} />
                )}
              </div>
            </div>
          )}

          {/* Thinking dots */}
          {isThinking && (
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: '#FA133A', color: 'white' }}>G</div>
              <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-md"
                style={{ background: 'rgba(255,255,255,0.07)' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} className="block w-1.5 h-1.5 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.4)',
                      animation: `bounce-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                ))}
              </div>
            </div>
          )}

          {/* AI Response */}
          {showResponse && (
            <div className="flex items-start gap-2" style={{ animation: 'slide-up-fade 0.35s ease-out' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: '#FA133A', color: 'white' }}>G</div>
              <div className="rounded-2xl rounded-bl-md overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)', minWidth: '165px' }}>
                <div className="px-3.5 py-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <svg style={{ color: '#22c55e', width: '13px', height: '13px' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-bold" style={{ color: '#22c55e' }}>Registrado</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      ['Monto', <span key="amt" style={{ color: amountColor, fontWeight: 700 }}>{demo.response.amount}</span>],
                      ['Categoría', `${demo.response.emoji} ${demo.response.category}`],
                      ['Cuenta', demo.response.account],
                    ].map(([label, val]) => (
                      <div key={label} className="flex items-center justify-between gap-6">
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                        <span className="text-xs font-semibold text-white">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="px-4 pb-5 pt-1">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <span className="text-sm flex-1 text-left" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Contame un gasto...
            </span>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#FA133A' }}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen" style={{ background: '#070708', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes ticker-move {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes hero-up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-ticker { animation: ticker-move 38s linear infinite; }
        .hero-ticker:hover { animation-play-state: paused; }
        .hero-line-1 { animation: hero-up 0.55s ease-out 0.05s both; }
        .hero-line-2 { animation: hero-up 0.6s  ease-out 0.18s both; }
        .hero-line-3 { animation: hero-up 0.6s  ease-out 0.32s both; }
        .hero-line-4 { animation: hero-up 0.6s  ease-out 0.44s both; }
        .hero-line-5 { animation: hero-up 0.6s  ease-out 0.55s both; }
        .hero-demo   { animation: hero-up 0.75s ease-out 0.3s  both; }
      `}</style>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(7,7,8,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          <img src="/logo-icon.png" alt="GastIA" className="h-7 w-7 object-contain" onError={e => e.target.style.display = 'none'} />
          <span className="font-black text-white text-lg tracking-tight">GastIA</span>
        </div>
        <div className="flex items-center gap-3">
          {!loading && user ? (
            <Link to="/home" className="btn-red px-4 py-2 rounded-lg text-sm">
              Ir a mi cuenta →
            </Link>
          ) : (
            <>
              <Link to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hidden sm:block"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                Iniciar sesión
              </Link>
              <Link to="/registro" className="btn-red px-4 py-2 rounded-lg text-sm">
                Empezar gratis
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: '#070708' }}>

        {/* Grain texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '220px',
          opacity: 0.28,
          mixBlendMode: 'overlay',
        }} />

        {/* Volcanic glow — rises from bottom */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{
          height: '75%',
          background: 'radial-gradient(ellipse 85% 55% at 45% 100%, rgba(250,19,58,0.2) 0%, rgba(180,10,30,0.07) 45%, transparent 70%)',
        }} />

        {/* Top-right darkness */}
        <div className="absolute top-0 right-0 pointer-events-none" style={{
          width: '55%', height: '55%',
          background: 'radial-gradient(ellipse at 100% 0%, rgba(0,0,0,0.55) 0%, transparent 70%)',
        }} />

        {/* ── TICKER ── */}
        <div className="relative z-10 mt-16 overflow-hidden" style={{
          borderTop: '1px solid rgba(250,19,58,0.18)',
          borderBottom: '1px solid rgba(250,19,58,0.18)',
          background: 'rgba(250,19,58,0.04)',
          padding: '9px 0',
        }}>
          <div className="flex whitespace-nowrap hero-ticker">
            {[...TICKER, ...TICKER].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2.5 px-5">
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  {item.label}
                </span>
                <span style={{ color: item.red ? '#FA133A' : '#22c55e', fontSize: '0.78rem', fontWeight: 800 }}>
                  {item.amount}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>·</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="relative z-10 flex-1 flex items-center px-6 py-10 lg:py-0">
          <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-20 items-center">

            {/* Left: text */}
            <div>
              {/* Overline */}
              <div className="hero-line-1 flex items-center gap-3 mb-7">
                <span style={{ display: 'inline-block', width: 28, height: 2, background: '#FA133A', borderRadius: 2 }} />
                <span style={{ color: '#FA133A', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                  GastIA · Finanzas personales
                </span>
              </div>

              {/* Headline */}
              <h1 className="hero-line-2 font-black leading-none mb-8"
                style={{ fontSize: 'clamp(3.4rem, 8.5vw, 6.8rem)', letterSpacing: '-0.045em' }}>
                <span className="block" style={{ color: 'rgba(255,255,255,0.92)' }}>¿En qué</span>
                <span className="block" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <span style={{
                    color: '#FA133A',
                    background: 'rgba(250,19,58,0.12)',
                    border: '1.5px solid rgba(250,19,58,0.35)',
                    borderRadius: '8px',
                    padding: '0 0.18em 0.04em',
                    transform: 'rotate(-0.6deg)',
                    display: 'inline-block',
                  }}>
                    se fue
                  </span>
                </span>
                <span className="block" style={{ color: 'rgba(255,255,255,0.92)' }}>el sueldo?</span>
              </h1>

              {/* Body */}
              <p className="hero-line-3 mb-9"
                style={{ color: 'rgba(255,255,255,0.42)', fontSize: 'clamp(1rem, 1.4vw, 1.12rem)', lineHeight: 1.7, maxWidth: '34rem' }}>
                Escribí o hablá como si le contaras a alguien.
                GastIA lo clasifica, lo categoriza y te muestra el panorama completo.
              </p>

              {/* CTA */}
              <div className="hero-line-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
                <Link to="/registro"
                  className="btn-red text-center font-black"
                  style={{ padding: '14px 36px', fontSize: '1rem', borderRadius: 14, letterSpacing: '-0.01em' }}>
                  Empezar gratis —
                </Link>
                <Link to="/login"
                  style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 4 }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}>
                  Ya tengo cuenta
                </Link>
              </div>

              {/* Anti-features */}
              <div className="hero-line-5 flex flex-wrap gap-x-5 gap-y-2">
                {[
                  { text: 'Sin planillas de Excel', neg: true },
                  { text: 'Sin formularios raros', neg: true },
                  { text: '100% en rioplatense', neg: false },
                ].map((f, i) => (
                  <span key={i} style={{
                    color: f.neg ? 'rgba(255,255,255,0.28)' : 'rgba(34,197,94,0.7)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}>
                    {f.neg ? '✗ ' : '✓ '}{f.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Chat demo */}
            <div className="hero-demo flex justify-center lg:justify-end">
              <div style={{ position: 'relative' }}>
                {/* Glow behind the card */}
                <div style={{
                  position: 'absolute', inset: '-30px',
                  background: 'radial-gradient(ellipse at 50% 60%, rgba(250,19,58,0.12) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />
                <ChatDemo />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="px-6 py-4 flex items-center justify-center gap-6 flex-wrap"
        style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {[
          '✓ Sin tarjeta de crédito',
          '✓ Cancela cuando quieras',
          '✓ IA que entiende el español rioplatense',
          '✓ Seguro y privado',
        ].map((item, i) => (
          <span key={i} className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>{item}</span>
        ))}
      </div>

      {/* FEATURES */}
      <section className="px-6 py-28 max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-black mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.025em' }}>
            Todo lo que necesitás,<br />nada que no uses
          </h2>
          <p className="text-base max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Diseñado para personas que quieren claridad financiera, no para contadores.
          </p>
        </div>

        {/* 3 main pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {[
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              ),
              color: '#FA133A',
              label: 'La forma más rápida de registrar',
              title: 'Voz o texto',
              desc: '"Gasté $2000 en el super" → clasificado en un segundo. Sin tocar una sola categoría.',
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              ),
              color: '#818cf8',
              label: 'Una mirada y ya sabés cómo venís',
              title: 'Dashboard real',
              desc: 'Saldo actual, tendencia del mes, categorías que se disparan. No es solo un gráfico de torta.',
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              ),
              color: '#f59e0b',
              label: 'El límite que te mantiene en carril',
              title: 'Presupuestos activos',
              desc: 'Setéas un tope por categoría. Cuando llegás al 80% te avisa. Nada de sorpresas de fin de mes.',
            },
          ].map((p, i) => (
            <div key={i} className="p-7 rounded-3xl transition-all duration-300 cursor-default"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.055)'
                e.currentTarget.style.borderColor = `${p.color}50`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
              }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: `${p.color}18`, color: p.color }}>
                {p.icon}
              </div>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: p.color }}>
                {p.label}
              </div>
              <h3 className="font-black text-xl mb-3">{p.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{p.desc}</p>
            </div>
          ))}
        </div>

        {/* 3 secondary features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🏦', title: 'Múltiples cuentas', desc: 'Efectivo, débito, crédito. Todo separado, todo claro. Transferencias entre cuentas.' },
            { icon: '🏆', title: 'Logros y rachas', desc: 'Cerrá el mes en verde, subí de nivel. Las finanzas también pueden ser motivadoras.' },
            { icon: '🤝', title: 'Deudas rastreadas', desc: 'Lo que te deben, lo que debés. Registralo una vez y dejá de hacer cuentas en la cabeza.' },
          ].map((f, i) => (
            <div key={i} className="p-5 rounded-2xl flex items-start gap-4 transition-all cursor-default"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
              <span className="text-2xl flex-shrink-0">{f.icon}</span>
              <div>
                <h4 className="font-bold text-sm mb-1">{f.title}</h4>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DIVIDER */}
      <div className="max-w-6xl mx-auto px-6">
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* USE CASES */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-black mb-3" style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', letterSpacing: '-0.025em' }}>
            ¿Para quién es GastIA?
          </h2>
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Para cualquiera que llegue a fin de mes preguntándose en qué se fue la plata.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              emoji: '👨‍💻',
              perfil: 'El freelancer',
              problema: 'Cobra irregular, no sabe si le cierra el mes',
              solucion: 'Registra cada ingreso, ve cuándo el balance se pone verde, ajusta gastos antes de que sea tarde.',
              tags: ['Ingresos variables', 'Cuentas separadas'],
            },
            {
              emoji: '👩‍💼',
              perfil: 'La que tiene gastos hormiga',
              problema: 'Llega a fin de mes sin saber en qué se fue la plata',
              solucion: 'GastIA clasifica automáticamente. En una semana ya ve el patrón. En dos, lo corrige.',
              tags: ['Categorías auto', 'Presupuestos'],
            },
            {
              emoji: '👫',
              perfil: 'La pareja con cuentas compartidas',
              problema: '"¿Pagaste el alquiler? ¿Cuánto te debo?"',
              solucion: 'Cuentas separadas, deudas registradas, transferencias asentadas. Cero discusiones.',
              tags: ['Deudas', 'Múltiples cuentas'],
            },
          ].map((u, i) => (
            <div key={i} className="p-7 rounded-3xl flex flex-col gap-4 transition-all cursor-default"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.055)'; e.currentTarget.style.borderColor = 'rgba(250,19,58,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}>
              <span className="text-5xl">{u.emoji}</span>
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-1.5" style={{ color: '#FA133A' }}>
                  {u.perfil}
                </p>
                <p className="font-bold text-base mb-2.5">{u.problema}</p>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {u.solucion}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {u.tags.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: 'rgba(250,19,58,0.1)', color: '#FA133A', border: '1px solid rgba(250,19,58,0.2)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 py-24" style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-black mb-3" style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', letterSpacing: '-0.025em' }}>
              Lo que dicen los usuarios
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>Personas reales. Finanzas más claras.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="p-7 rounded-3xl flex flex-col gap-5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <svg key={s} className="w-4 h-4" fill="#FA133A" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #FA133A, #c40e2e)' }}>
                    {t.initial}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{t.name}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-24 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-black mb-3" style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', letterSpacing: '-0.025em' }}>
            Tres pasos. Ninguna excusa.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>
            Empezás hoy. Mañana ya tenés datos. La semana que viene, claridad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { num: '01', title: 'Creá tu cuenta', desc: 'Gratis, en menos de un minuto. Sin tarjeta. Sin descargar nada.', color: '#FA133A' },
            { num: '02', title: 'Cargá tus movimientos', desc: 'Por voz, texto libre, o ambos. La IA clasifica sola, vos solo confirmás.', color: '#818cf8' },
            { num: '03', title: 'Mirá el panorama', desc: 'Dashboard, presupuestos, comparativas históricas. Todo en un solo lugar.', color: '#22c55e' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl"
                style={{ background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}35` }}>
                {s.num}
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 py-32 text-center relative overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        {/* Red glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 55% 65% at 50% 50%, rgba(250,19,58,0.1) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8"
            style={{ background: 'rgba(250,19,58,0.1)', border: '1px solid rgba(250,19,58,0.25)', color: '#FA133A' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#FA133A' }} />
            Gratis para siempre
          </div>

          <h2 className="font-black mb-4" style={{ fontSize: 'clamp(2.2rem, 6vw, 4.2rem)', letterSpacing: '-0.035em' }}>
            Empezá a saber<br />
            <span style={{ color: '#FA133A' }}>en qué se va tu plata.</span>
          </h2>
          <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Sin tarjeta. Sin instalación. Listo en 60 segundos.
          </p>
          <Link to="/registro" className="btn-red inline-block px-10 py-4 rounded-2xl text-lg">
            Crear mi cuenta gratis →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
        <div className="flex items-center gap-3">
          <a href="https://trs-automatizaciones.vercel.app/" target="_blank" rel="noopener noreferrer">
            <img src="/Logo-trs.png" alt="TRS" className="h-6 w-auto opacity-30 hover:opacity-60 transition-opacity object-contain" onError={e => e.target.style.display = 'none'} />
          </a>
          <span className="text-xs">TRS Automatizaciones · Menos tareas, más resultados.</span>
        </div>
        <div className="flex items-center gap-5 text-xs">
          <Link to="/soporte" className="hover:text-white transition-colors">Soporte</Link>
          <Link to="/login" className="hover:text-white transition-colors">Iniciar sesión</Link>
          <Link to="/registro" className="hover:text-white transition-colors">Registrarse</Link>
        </div>
      </footer>

    </div>
  )
}
