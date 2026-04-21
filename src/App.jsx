import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { GamificacionProvider } from './context/GamificacionContext'
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
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#D6D7D7]">
      <div className="w-8 h-8 rounded-full border-2 border-[#FA133A] border-t-transparent animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <GamificacionProvider userId={user.id}>{children}</GamificacionProvider>
}

function AuthRedirect() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#D6D7D7]">
      <div className="w-8 h-8 rounded-full border-2 border-[#FA133A] border-t-transparent animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to="/home" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/" element={<AuthRedirect />} />
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/presupuestos" element={<Presupuestos />} />
          <Route path="/deudas" element={<Deudas />} />
          <Route path="/comparativa" element={<Comparativa />} />
          <Route path="/logros" element={<Logros />} />
          <Route path="/configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
