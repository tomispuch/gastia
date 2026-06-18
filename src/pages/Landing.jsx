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
    <div style={{ position: 'relative', width: '100%', maxWidth: '340px', margin: '0 auto', userSelect: 'none' }}>
      <div style={{
        position: 'absolute', top: '-12px', right: '-16px', zIndex: 10,
        padding: '6px 12px', borderRadius: '6px',
        fontSize: '0.7rem', fontWeight: 700,
        background: 'rgba(34,197,94,0.12)',
        border: '1px solid rgba(34,197,94,0.3)',
        color: '#22c55e',
        backdropFilter: 'blur(12px)',
        animation: 'cd-float 3s ease-in-out infinite',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        ↑ +$150.000 ingresado
      </div>
      <div style={{
        position: 'absolute', bottom: '-12px', left: '-16px', zIndex: 10,
        padding: '6px 12px', borderRadius: '6px',
        fontSize: '0.7rem', fontWeight: 700,
        background: 'rgba(250,19,58,0.12)',
        border: '1px solid rgba(250,19,58,0.3)',
        color: '#FA133A',
        backdropFilter: 'blur(12px)',
        animation: 'cd-float 3s ease-in-out 1.5s infinite',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        🍕 Alimentación 68%
      </div>

      <div style={{
        borderRadius: '20px', overflow: 'hidden',
        background: 'linear-gradient(160deg, #1c1d21 0%, #0d0e10 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}>
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, color: '#fff', fontSize: '1rem', background: 'linear-gradient(135deg, #FA133A, #c40e2e)' }}>
            G
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.04em' }}>GastIA</div>
            <div style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'cd-pulse 1.5s ease-in-out infinite' }} />
              Procesando con IA
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
            {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
              <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
            ))}
          </div>
        </div>

        <div style={{ padding: '16px', minHeight: '210px' }}>
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>Hoy</span>
          </div>

          {typedChars > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
              <div style={{ maxWidth: '85%', padding: '10px 16px', borderRadius: '18px 18px 4px 18px', fontSize: '0.875rem', fontWeight: 500, color: '#fff', background: '#FA133A' }}>
                {displayText}
                {isTyping && <span style={{ marginLeft: '2px', display: 'inline-block', width: '2px', height: '14px', background: '#fff', verticalAlign: 'middle', animation: 'blink 1s step-end infinite' }} />}
              </div>
            </div>
          )}

          {isThinking && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '0.85rem', color: '#fff', background: '#FA133A', flexShrink: 0 }}>G</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: 'rgba(255,255,255,0.07)' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ display: 'block', width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)', animation: `bounce-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}

          {showResponse && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', animation: 'slide-up-fade 0.35s ease-out' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '0.85rem', color: '#fff', background: '#FA133A', flexShrink: 0 }}>G</div>
              <div style={{ borderRadius: '18px 18px 18px 4px', overflow: 'hidden', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)', minWidth: '165px' }}>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <svg style={{ color: '#22c55e', width: '13px', height: '13px' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#22c55e' }}>Registrado</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      ['Monto', <span key="amt" style={{ color: amountColor, fontWeight: 700 }}>{demo.response.amount}</span>],
                      ['Categoría', `${demo.response.emoji} ${demo.response.category}`],
                      ['Cuenta', demo.response.account],
                    ].map(([label, val]) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#fff' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '4px 16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontSize: '0.875rem', flex: 1, color: 'rgba(255,255,255,0.25)' }}>Contame un gasto...</span>
            <button style={{ width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FA133A', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
              <svg style={{ width: '14px', height: '14px', color: '#fff' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 800,
      fontSize: 'clamp(2rem, 5vw, 3.6rem)',
      letterSpacing: '-0.02em',
      lineHeight: 0.95,
      marginBottom: '40px',
      color: '#fff',
    }}>
      {children}
    </h2>
  )
}

export default function Landing() {
  const { user, loading } = useAuth()

  return (
    <div style={{ minHeight: '100vh', background: '#070708', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        /* Keyframes */
        @keyframes cd-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes cd-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes bounce-dot { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
        @keyframes slide-up-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ticker-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes hero-up { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }

        /* Ticker */
        .l-ticker { animation: ticker-scroll 44s linear infinite; }
        .l-ticker:hover { animation-play-state: paused; }

        /* Hero staggered reveal */
        .hl1 { animation: hero-up 0.55s ease-out 0.05s both; }
        .hl2 { animation: hero-up 0.6s  ease-out 0.15s both; }
        .hl3 { animation: hero-up 0.6s  ease-out 0.28s both; }
        .hl4 { animation: hero-up 0.6s  ease-out 0.40s both; }
        .hl5 { animation: hero-up 0.6s  ease-out 0.52s both; }
        .hdemo { animation: hero-up 0.8s ease-out 0.20s both; }

        /* Responsive grids */
        .hero-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: clamp(2rem, 5vw, 5rem);
          align-items: center;
        }
        .bento-grid {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          grid-template-rows: auto auto;
          gap: 8px;
          margin-bottom: 8px;
        }
        .bento-tall { grid-row: 1 / 3; }
        .sec-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
        }
        .tgrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        /* Cards */
        .fcard {
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 8px;
          background: rgba(255,255,255,0.025);
          padding: clamp(20px, 3vw, 28px);
          transition: border-color 0.2s, background 0.2s;
          cursor: default;
        }
        .fcard:hover { background: rgba(255,255,255,0.04); border-color: rgba(250,19,58,0.3); }
        .scard {
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 6px;
          background: rgba(255,255,255,0.018);
          padding: 18px 20px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          transition: background 0.2s;
          cursor: default;
        }
        .scard:hover { background: rgba(255,255,255,0.033); }
        .tcard {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          background: rgba(255,255,255,0.022);
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .use-row {
          display: grid;
          grid-template-columns: 60px 1fr;
          gap: 28px;
          align-items: start;
          padding: 28px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .use-row:first-child { border-top: 1px solid rgba(255,255,255,0.06); }
        .step-box {
          position: relative;
          padding: 24px;
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .step-box:last-child { border-right: none; }

        /* Mobile breakpoints */
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .bento-grid { grid-template-columns: 1fr !important; }
          .bento-tall { grid-row: auto !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .step-box { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .step-box:last-child { border-bottom: none; }
          .tgrid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .sec-grid { grid-template-columns: 1fr !important; }
          .use-row { grid-template-columns: 1fr !important; gap: 8px !important; }
        }

        a { text-decoration: none; color: inherit; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(1rem, 4vw, 2.5rem)',
        height: '54px',
        background: 'rgba(7,7,8,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo-icon.png" alt="GastIA" style={{ height: '26px', width: '26px', objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.35rem', letterSpacing: '0.04em', color: '#fff' }}>GastIA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {!loading && user ? (
            <Link to="/home" className="btn-red" style={{ padding: '7px 18px', fontSize: '0.875rem', borderRadius: '6px' }}>
              Ir a mi cuenta →
            </Link>
          ) : (
            <>
              <Link to="/login"
                style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', fontWeight: 500, padding: '7px 12px', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                Iniciar sesión
              </Link>
              <Link to="/registro" className="btn-red" style={{ padding: '7px 18px', fontSize: '0.875rem', borderRadius: '6px' }}>
                Empezar gratis
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#070708' }}>
        {/* Noise */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '200px', opacity: 0.2, mixBlendMode: 'overlay',
        }} />
        {/* Red glow */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, pointerEvents: 'none',
          height: '70%',
          background: 'radial-gradient(ellipse 80% 60% at 35% 100%, rgba(250,19,58,0.17) 0%, rgba(180,10,30,0.05) 50%, transparent 75%)',
        }} />

        {/* Ticker */}
        <div style={{
          marginTop: '54px', position: 'relative', zIndex: 10, overflow: 'hidden',
          borderTop: '1px solid rgba(250,19,58,0.2)',
          borderBottom: '1px solid rgba(250,19,58,0.2)',
          background: 'rgba(250,19,58,0.03)',
          padding: '9px 0',
        }}>
          <div className="l-ticker" style={{ display: 'flex', whiteSpace: 'nowrap' }}>
            {[...TICKER, ...TICKER].map((item, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '0 20px' }}>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                  {item.label}
                </span>
                <span style={{ color: item.red ? '#FA133A' : '#22c55e', fontSize: '0.85rem', fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.03em' }}>
                  {item.amount}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
              </span>
            ))}
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 5vw, 3.5rem)', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto', width: '100%' }}>
            <div className="hero-grid">
              <div>
                <h1 className="hl1" style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  lineHeight: 0.9,
                  fontSize: 'clamp(4rem, 10.5vw, 9rem)',
                  letterSpacing: '-0.02em',
                  marginBottom: '32px',
                }}>
                  <span style={{ display: 'block', color: 'rgba(255,255,255,0.88)' }}>¿En qué</span>
                  <span style={{ display: 'block', color: '#FA133A' }}>se fue</span>
                  <span style={{ display: 'block', color: 'rgba(255,255,255,0.88)' }}>el sueldo?</span>
                </h1>

                <p className="hl3" style={{ color: 'rgba(255,255,255,0.42)', fontSize: 'clamp(0.95rem, 1.3vw, 1.08rem)', lineHeight: 1.75, maxWidth: '32rem', marginBottom: '36px' }}>
                  Escribí o hablá como si le contaras a alguien.
                  GastIA lo clasifica, lo categoriza y te muestra el panorama completo.
                </p>

                <div className="hl4" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                  <Link to="/registro" className="btn-red" style={{ padding: '13px 32px', fontSize: '0.95rem', borderRadius: '6px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                    Empezar gratis —
                  </Link>
                  <Link to="/login"
                    style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '4px', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
                    Ya tengo cuenta
                  </Link>
                </div>

                <div className="hl5" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px' }}>
                  {[
                    { text: 'Sin planillas de Excel', neg: true },
                    { text: 'Sin formularios raros', neg: true },
                    { text: '100% en rioplatense', neg: false },
                  ].map((f, i) => (
                    <span key={i} style={{ color: f.neg ? 'rgba(255,255,255,0.25)' : 'rgba(34,197,94,0.65)', fontSize: '0.78rem', fontWeight: 600 }}>
                      {f.neg ? '✗ ' : '✓ '}{f.text}
                    </span>
                  ))}
                </div>
              </div>

              <div className="hdemo" style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: '-40px', background: 'radial-gradient(ellipse at 50% 60%, rgba(250,19,58,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  <ChatDemo />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div style={{ padding: '11px clamp(1.5rem, 5vw, 3.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(10px, 3vw, 40px)', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
        {['Sin tarjeta de crédito', 'Cancela cuando quieras', 'IA que habla rioplatense', 'Seguro y privado'].map((item, i) => (
          <span key={i} style={{ fontSize: '0.78rem', fontWeight: 500, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ color: '#FA133A', fontSize: '0.5rem', lineHeight: 1 }}>▸</span>{item}
          </span>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 3.5rem)', maxWidth: '1180px', margin: '0 auto' }}>
        <SectionTitle>Todo lo que necesitás,<br />nada que no uses.</SectionTitle>

        <div className="bento-grid">
          {/* Main tall: Voz o texto */}
          <div className="fcard bento-tall" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '300px' }}>
            <div>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(250,19,58,0.1)', color: '#FA133A', marginBottom: '18px' }}>
                <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#FA133A', marginBottom: '8px' }}>La forma más rápida</div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.9rem', letterSpacing: '-0.01em', marginBottom: '12px', lineHeight: 1 }}>Voz o texto</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', lineHeight: 1.65 }}>
                "Gasté $2000 en el super" → clasificado en un segundo. Sin tocar una sola categoría.
              </p>
            </div>
            <div style={{ marginTop: '24px', padding: '14px 16px', borderRadius: '6px', background: 'rgba(250,19,58,0.06)', border: '1px solid rgba(250,19,58,0.14)' }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>Ejemplo real</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#fff', letterSpacing: '0.01em' }}>"Taxi a Palermo $3800 ayer"</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px' }}>
                <svg style={{ width: '10px', height: '10px', color: '#22c55e', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                <span style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 600 }}>🚕 Transporte · -$3.800 · Efectivo</span>
              </div>
            </div>
          </div>

          {/* Top right: Dashboard */}
          <div className="fcard">
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(129,140,248,0.1)', color: '#818cf8', marginBottom: '16px' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#818cf8', marginBottom: '6px' }}>De un vistazo</div>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.65rem', letterSpacing: '-0.01em', marginBottom: '10px', lineHeight: 1 }}>Dashboard real</h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Saldo actual, tendencia del mes, categorías que se disparan. No es solo un gráfico de torta.
            </p>
          </div>

          {/* Bottom right: Presupuestos */}
          <div className="fcard">
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', marginBottom: '16px' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#f59e0b', marginBottom: '6px' }}>Sin sorpresas</div>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.65rem', letterSpacing: '-0.01em', marginBottom: '10px', lineHeight: 1 }}>Presupuestos</h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Setéas un tope por categoría. Al 80% te avisa. Nada de sorpresas de fin de mes.
            </p>
          </div>
        </div>

        {/* Secondary 3 */}
        <div className="sec-grid">
          {[
            { icon: '🏦', title: 'Múltiples cuentas', desc: 'Efectivo, débito, crédito. Todo separado, todo claro. Transferencias entre cuentas.' },
            { icon: '🏆', title: 'Logros y rachas', desc: 'Cerrá el mes en verde, subí de nivel. Las finanzas también pueden ser motivadoras.' },
            { icon: '🤝', title: 'Deudas rastreadas', desc: 'Lo que te deben, lo que debés. Registralo una vez y dejá de hacer cuentas en la cabeza.' },
          ].map((f, i) => (
            <div key={i} className="scard">
              <span style={{ fontSize: '1.3rem', flexShrink: 0, lineHeight: 1 }}>{f.icon}</span>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '4px' }}>{f.title}</h4>
                <p style={{ fontSize: '0.8rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.4)' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 3.5rem)' }}>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)' }} />
      </div>

      {/* ── USE CASES ── */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 3.5rem)', maxWidth: '1180px', margin: '0 auto' }}>
        <SectionTitle>¿Para quién es GastIA?</SectionTitle>

        <div>
          {[
            {
              num: '01',
              perfil: 'El freelancer',
              problema: 'Cobra irregular, no sabe si le cierra el mes',
              solucion: 'Registra cada ingreso, ve cuándo el balance se pone verde, ajusta gastos antes de que sea tarde.',
              tags: ['Ingresos variables', 'Cuentas separadas'],
            },
            {
              num: '02',
              perfil: 'La que tiene gastos hormiga',
              problema: 'Llega a fin de mes sin saber en qué se fue la plata',
              solucion: 'GastIA clasifica automáticamente. En una semana ya ve el patrón. En dos, lo corrige.',
              tags: ['Categorías auto', 'Presupuestos'],
            },
            {
              num: '03',
              perfil: 'La pareja con cuentas compartidas',
              problema: '"¿Pagaste el alquiler? ¿Cuánto te debo?"',
              solucion: 'Cuentas separadas, deudas registradas, transferencias asentadas. Cero discusiones.',
              tags: ['Deudas', 'Múltiples cuentas'],
            },
          ].map((u) => (
            <div key={u.num} className="use-row">
              <div style={{ paddingTop: '4px' }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2.4rem', color: 'rgba(250,19,58,0.45)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {u.num}
                </span>
              </div>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', letterSpacing: '-0.01em', marginBottom: '4px', lineHeight: 1.1 }}>
                  {u.perfil}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.45)', marginBottom: '12px', fontStyle: 'italic' }}>
                  "{u.problema}"
                </div>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, maxWidth: '580px', marginBottom: '16px' }}>
                  {u.solucion}
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {u.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: '4px', fontWeight: 600, background: 'rgba(250,19,58,0.08)', color: '#FA133A', border: '1px solid rgba(250,19,58,0.18)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 3.5rem)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.012)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <SectionTitle>Lo que dicen<br />los usuarios.</SectionTitle>

          <div className="tgrid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="tcard">
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 'clamp(1.35rem, 2vw, 1.75rem)',
                  fontWeight: 700,
                  fontStyle: 'italic',
                  lineHeight: 1.2,
                  color: 'rgba(255,255,255,0.82)',
                }}>
                  "{t.text}"
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1rem', color: '#fff', background: 'linear-gradient(135deg, #FA133A, #c40e2e)', flexShrink: 0 }}>
                    {t.initial}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff' }}>{t.name}</div>
                    <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.35)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 3.5rem)', maxWidth: '1180px', margin: '0 auto' }}>
        <SectionTitle>Tres pasos.<br />Ninguna excusa.</SectionTitle>

        <div className="steps-grid">
          {[
            { num: '01', title: 'Creá tu cuenta', desc: 'Gratis, en menos de un minuto. Sin tarjeta. Sin descargar nada.', color: '#FA133A' },
            { num: '02', title: 'Cargá tus movimientos', desc: 'Por voz, texto libre, o ambos. La IA clasifica sola, vos solo confirmás.', color: '#818cf8' },
            { num: '03', title: 'Mirá el panorama', desc: 'Dashboard, presupuestos, comparativas históricas. Todo en un solo lugar.', color: '#22c55e' },
          ].map((s) => (
            <div key={s.num} className="step-box">
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: 'clamp(6rem, 9vw, 8.5rem)',
                lineHeight: 1,
                color: 'rgba(255,255,255,0.035)',
                position: 'absolute',
                top: 0, left: '16px',
                letterSpacing: '-0.04em',
                userSelect: 'none',
                pointerEvents: 'none',
              }}>
                {s.num}
              </div>
              <div style={{ position: 'relative', paddingTop: 'clamp(2.5rem, 4vw, 4rem)' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.color, marginBottom: '14px' }} />
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 'clamp(1.3rem, 2vw, 1.6rem)', letterSpacing: '-0.01em', marginBottom: '10px', lineHeight: 1.1 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, maxWidth: '280px' }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: 'clamp(5rem, 10vw, 9rem) clamp(1.5rem, 5vw, 3.5rem)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(250,19,58,0.09) 0%, transparent 70%)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(3rem, 8vw, 6.5rem)',
            letterSpacing: '-0.025em',
            lineHeight: 0.9,
            marginBottom: '28px',
          }}>
            Empezá a saber<br />
            <span style={{ color: '#FA133A' }}>en qué se va<br />tu plata.</span>
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.38)', marginBottom: '40px' }}>
            Sin tarjeta. Sin instalación. Listo en 60 segundos.
          </p>
          <Link to="/registro" className="btn-red" style={{ display: 'inline-block', padding: '15px 44px', fontSize: '1.05rem', borderRadius: '6px', fontWeight: 700 }}>
            Crear mi cuenta gratis →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: 'clamp(1.2rem, 3vw, 1.8rem) clamp(1.5rem, 5vw, 3.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="https://trs-automatizaciones.vercel.app/" target="_blank" rel="noopener noreferrer">
            <img src="/Logo-trs.png" alt="TRS" style={{ height: '20px', opacity: 0.28, objectFit: 'contain', transition: 'opacity 0.15s' }}
              onError={e => e.target.style.display = 'none'}
              onMouseEnter={e => e.target.style.opacity = 0.6}
              onMouseLeave={e => e.target.style.opacity = 0.28} />
          </a>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.22)' }}>TRS Automatizaciones · Menos tareas, más resultados.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.28)' }}>
          {[
            { to: '/soporte', label: 'Soporte' },
            { to: '/login', label: 'Iniciar sesión' },
            { to: '/registro', label: 'Registrarse' },
          ].map(({ to, label }) => (
            <Link key={to} to={to}
              style={{ transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}>
              {label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
