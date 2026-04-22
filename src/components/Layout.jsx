import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { usePlan } from '../hooks/usePlan'
import { useGamificacion } from '../context/GamificacionContext'
import LogroToast from './LogroToast'

const navItems = [
  { to: '/home',          label: 'Inicio',       icon: '🏠', plans: ['gratis', 'pro'] },
  { to: '/historial',     label: 'Historial',     icon: '📋', plans: ['gratis', 'pro'] },
  { to: '/dashboard',     label: 'Dashboard',     icon: '📊', plans: ['pro'] },
  { to: '/presupuestos',  label: 'Presupuestos',  icon: '🎯', plans: ['pro'] },
  { to: '/comparativa',   label: 'Comparar',      icon: '📈', plans: ['pro'] },
  { to: '/deudas',        label: 'Deudas',        icon: '🤝', plans: ['gratis', 'pro'] },
  { to: '/logros',        label: 'Logros',        icon: '🏆', plans: ['gratis', 'pro'] },
  { to: '/configuracion', label: 'Config',        icon: '⚙️', plans: ['gratis', 'pro'] },
]

export default function Layout() {
  const { user } = useAuth()
  const { plan } = usePlan(user?.id)
  const { nivel } = useGamificacion()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function handleNav(to) {
    setMenuOpen(false)
    navigate(to)
  }

  return (
    <div className="min-h-screen bg-[#D6D7D7] flex flex-col">

      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#070708]"
        style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.06)' }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 md:px-6 h-12">
          <button onClick={() => navigate('/home')}>
            <img
              src="/logo-gastia.png"
              alt="GastIA"
              className="h-7 w-auto max-w-[140px] object-contain"
              onError={e => { e.target.style.display = 'none' }}
            />
          </button>

          {/* Desktop: user info */}
          <div className="hidden md:flex items-center gap-3">
            {nivel && <span title={nivel.nombre} className="text-base cursor-default select-none">{nivel.emoji}</span>}
            {plan && (
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wider ${
                plan === 'pro' ? 'bg-[#FA133A] text-white' : 'bg-white/10 text-white/60'
              }`}>{plan.toUpperCase()}</span>
            )}
            <button onClick={handleLogout} className="text-xs text-white/40 hover:text-white/80 transition-colors">
              Salir
            </button>
          </div>

          {/* Mobile: hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Abrir menú"
          >
            <span className="w-5 h-0.5 bg-white/60 rounded-full block" />
            <span className="w-5 h-0.5 bg-white/60 rounded-full block" />
            <span className="w-5 h-0.5 bg-white/60 rounded-full block" />
          </button>
        </div>

        {/* Desktop nav tabs */}
        <div className="hidden md:flex overflow-x-auto border-t border-white/[0.06]"
          style={{ scrollbarWidth: 'none' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  isActive ? 'border-[#FA133A] text-white' : 'border-transparent text-white/40 hover:text-white/70'
                } ${!item.plans.includes(plan) ? 'opacity-40' : ''}`
              }
            >
              <span className="text-sm">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </header>

      {/* ── MOBILE MENU OVERLAY ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer from right */}
          <div className="absolute top-0 right-0 bottom-0 w-72 bg-[#070708] flex flex-col"
            style={{ boxShadow: '-4px 0 24px rgba(0,0,0,0.4)' }}>

            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-white/8">
              <div>
                {nivel && (
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{nivel.emoji}</span>
                    <div>
                      <p className="text-white text-xs font-semibold">{nivel.nombre}</p>
                      <p className="text-white/40 text-xs">Nivel {nivel.nivel}</p>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Plan badge */}
            {plan && (
              <div className="px-5 pt-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  plan === 'pro' ? 'bg-[#FA133A] text-white' : 'bg-white/10 text-white/50'
                }`}>{plan.toUpperCase()}</span>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {navItems.map(item => {
                const disponible = item.plans.includes(plan)
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-[#FA133A]/15 text-white'
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      } ${!disponible ? 'opacity-40' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className="text-xl w-7 text-center">{item.icon}</span>
                        <span className="font-semibold text-sm flex-1">{item.label}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FA133A]" />}
                        {!disponible && <span className="text-xs text-white/30 font-bold">PRO</span>}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </nav>

            {/* Logout */}
            <div className="px-5 pb-8 pt-2 border-t border-white/8">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span className="text-xl w-7 text-center">🚪</span>
                <span className="font-semibold text-sm">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-12 pb-6 md:pt-[88px]">
        <Outlet />

        {/* TRS credit — aparece al pie de todas las páginas */}
        <div className="flex flex-col items-center gap-3 py-8 mt-4">
          <p className="text-[#070708]/30 text-xs uppercase tracking-widest font-semibold">Desarrollado por</p>
          <img
            src="/Logo-trs.png"
            alt="TRS Automatizaciones"
            className="h-10 w-auto max-w-[160px] object-contain opacity-50 hover:opacity-80 transition-opacity"
            onError={e => { e.target.style.display = 'none' }}
          />
          <p className="text-[#070708]/40 text-xs font-medium">TRS Automatizaciones</p>
        </div>
      </main>

      <LogroToast />
    </div>
  )
}
