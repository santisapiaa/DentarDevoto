import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getMe, clearToken } from '../lib/api.js'

export default function AdminLayout() {
  const [usuario, setUsuario] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    getMe().then(setUsuario).catch(() => {})
  }, [])

  function handleLogout() {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h3 style={{ color: '#fff' }}>Panel Admin</h3>
        <nav style={{ marginTop: 24 }}>
          <NavLink to="/admin/pacientes">Pacientes</NavLink>
          <NavLink to="/admin/turnos">Turnos</NavLink>
          <NavLink to="/admin/servicios">Servicios y precios</NavLink>
          {usuario?.rol === 'admin' && <NavLink to="/admin/usuarios">Usuarios</NavLink>}
        </nav>
        <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 20 }}>
          {usuario && <p style={{ color: '#C7D2CF', fontSize: '0.85rem', marginBottom: 12 }}>{usuario.email}</p>}
          <button className="btn btn--ghost" style={{ borderColor: '#fff', color: '#fff', width: '100%' }} onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  )
}
