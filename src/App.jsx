import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { GamificacionProvider } from './context/GamificacionContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Home from './pages/Home'
import Historial from './pages/Historial'
import Dashboard from './pages/Dashboard'
import Presupuestos from './pages/Presupuestos'
import Configuracion from './pages/Configuracion'
import Deudas from './pages/Deudas'
import Comparativa from './pages/Comparativa'
import Logros from './pages/Logros'
import Cuentas from './pages/Cuentas'
import Soporte from './pages/Soporte'
import Layout from './components/Layout'

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
          <Route path="/historial" element={<Historial />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/presupuestos" element={<Presupuestos />} />
          <Route path="/cuentas" element={<Cuentas />} />
          <Route path="/deudas" element={<Deudas />} />
          <Route path="/comparativa" element={<Comparativa />} />
          <Route path="/logros" element={<Logros />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/soporte" element={<Soporte />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
