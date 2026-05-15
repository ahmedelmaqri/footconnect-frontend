import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Layout() {
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard',   icon: '📊', label: 'Mon Dashboard' },
    { to: '/trainings',   icon: '📅', label: 'Entraînements' },
    { to: '/workouts',    icon: '🏋️', label: 'Mes Workouts' },
    { to: '/diet',        icon: '🥗', label: 'Mon Régime' },
    { to: '/health',      icon: '🏥', label: 'Ma Santé' },
    { to: '/blog',        icon: '📝', label: 'Blog Équipe' },
    { to: '/resignation', icon: '📋', label: 'Démission' },
    { to: '/profile', icon: '⚙️', label: 'Mon Profil' },
    { to: '/shop', icon: '🛒', label: 'FC Shop' }
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: '240px', minWidth: '240px',
        backgroundColor: '#166534', color: 'white',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #15803d' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>⚽ FootConnect</div>
          <div style={{ fontSize: '12px', color: '#86efac', marginTop: '4px' }}>
            {user?.name || 'Joueur'}
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 16px', borderRadius: '8px', textDecoration: 'none',
                color: isActive ? 'white' : '#bbf7d0',
                backgroundColor: isActive ? '#15803d' : 'transparent',
              })}>
              <span>{item.icon}</span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid #15803d' }}>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 16px', borderRadius: '8px', border: 'none',
            backgroundColor: 'transparent', color: '#bbf7d0', cursor: 'pointer', fontSize: '14px',
          }}>
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, backgroundColor: '#F3F4F6', overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}