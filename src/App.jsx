import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { useAuth } from './hooks/useAuth'
import { GamificacionProvider } from './context/GamificacionContext'

// Carga inmediata — rutas que el usuario ve al abrir la app
import Landing from './pages/Landing'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Home from './pages/Home'
import Layout from './components/Layout'

// Carga diferida — páginas secundarias, se descargan solo cuando se navega a ellas
const Historial     = lazy(() => import('./pages/Historial'))
const Dashboard     = lazy(() => import('./pages/Dashboard'))
const Presupuestos  = lazy(() => import('./pages/Presupuestos'))
const Configuracion = lazy(() => import('./pages/Configuracion'))
const Deudas        = lazy(() => import('./pages/Deudas'))
const Comparativa   = lazy(() => import('./pages/Comparativa'))
const Logros        = lazy(() => import('./pages/Logros'))
const Cuentas       = lazy(() => import('./pages/Cuentas'))
const Soporte       = lazy(() => import('./pages/Soporte'))

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#D6D7D7]">
    <div className="w-8 h-8 rounded-full border-2 border-[#FA133A] border-t-transparent animate-spin" />
  </div>
)

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  return <GamificacionProvider userId={user.id}>{children}</GamificacionProvider>
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (user) return <Navigate to="/home" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/registro" element={<PublicRoute><Registro /></PublicRoute>} />
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/historial"    element={<Suspense fallback={<Spinner />}><Historial /></Suspense>} />
          <Route path="/dashboard"    element={<Suspense fallback={<Spinner />}><Dashboard /></Suspense>} />
          <Route path="/presupuestos" element={<Suspense fallback={<Spinner />}><Presupuestos /></Suspense>} />
          <Route path="/cuentas"      element={<Suspense fallback={<Spinner />}><Cuentas /></Suspense>} />
          <Route path="/deudas"       element={<Suspense fallback={<Spinner />}><Deudas /></Suspense>} />
          <Route path="/comparativa"  element={<Suspense fallback={<Spinner />}><Comparativa /></Suspense>} />
          <Route path="/logros"       element={<Suspense fallback={<Spinner />}><Logros /></Suspense>} />
          <Route path="/configuracion"element={<Suspense fallback={<Spinner />}><Configuracion /></Suspense>} />
          <Route path="/soporte"      element={<Suspense fallback={<Spinner />}><Soporte /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
