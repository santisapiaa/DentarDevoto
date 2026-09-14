import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import WhatsappFloat from './components/WhatsappFloat.jsx'
import Home from './pages/Home.jsx'
import Servicios from './pages/Servicios.jsx'
import Profesionales from './pages/Profesionales.jsx'
import Contacto from './pages/Contacto.jsx'
import Login from './pages/Login.jsx'
import NotFound from './pages/NotFound.jsx'
import AdminLayout from './admin/AdminLayout.jsx'
import RequireAuth from './admin/RequireAuth.jsx'
import Pacientes from './admin/Pacientes.jsx'
import FichaPaciente from './admin/FichaPaciente.jsx'
import Turnos from './admin/Turnos.jsx'
import ServiciosAdmin from './admin/ServiciosAdmin.jsx'
import Usuarios from './admin/Usuarios.jsx'

export default function App() {
  return (
    <Routes>
      {/* Sitio público */}
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <Home />
            <Footer />
            <WhatsappFloat />
          </>
        }
      />
      <Route
        path="/servicios"
        element={
          <>
            <Navbar />
            <Servicios />
            <Footer />
            <WhatsappFloat />
          </>
        }
      />
      <Route
        path="/profesionales"
        element={
          <>
            <Navbar />
            <Profesionales />
            <Footer />
            <WhatsappFloat />
          </>
        }
      />
      <Route
        path="/contacto"
        element={
          <>
            <Navbar />
            <Contacto />
            <Footer />
          </>
        }
      />
      <Route
        path="/login"
        element={
          <>
            <Navbar />
            <Login />
            <Footer />
          </>
        }
      />

      {/* Panel administrativo */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Pacientes />} />
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="pacientes/:id" element={<FichaPaciente />} />
        <Route path="turnos" element={<Turnos />} />
        <Route path="servicios" element={<ServiciosAdmin />} />
        <Route path="usuarios" element={<Usuarios />} />
      </Route>

      <Route
        path="*"
        element={
          <>
            <Navbar />
            <NotFound />
            <Footer />
          </>
        }
      />
    </Routes>
  )
}
