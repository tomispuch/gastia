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
import ResetPassword from './pages/ResetPassword'
import ForgotPassword from './pages/ForgotPassword'

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
const Terminos      = lazy(() => import('./pages/Terminos'))
const Recurrentes   = lazy(() => import('./pages/Recurrentes'))

const Spinner = () => (
  <div className="rsk-spinner-wrap">
    <div className="rsk-spinner" />
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
        <Route path="/terminos" element={<Suspense fallback={<Spinner />}><Terminos /></Suspense>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
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
          <Route path="/soporte"       element={<Suspense fallback={<Spinner />}><Soporte /></Suspense>} />
          <Route path="/recurrentes"  element={<Suspense fallback={<Spinner />}><Recurrentes /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
