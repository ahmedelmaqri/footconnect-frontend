import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function VendorLayout() {
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/vendor/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/vendor/shop',      icon: '🏪', label: 'Ma Boutique' },
    { to: '/vendor/products',  icon: '📦', label: 'Mes Produits' },
    { to: '/vendor/orders',    icon: '🛒', label: 'Commandes' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: '240px', minWidth: '240px',
        backgroundColor: '#1e3a5f', color: 'white',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #2d5a8e' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>⚽ FC SHOP</div>
          <div style={{ fontSize: '12px', color: '#93c5fd', marginTop: '4px' }}>
            Espace Vendeur
          </div>
          <div style={{ fontSize: '11px', color: '#60a5fa', marginTop: '2px' }}>
            {user?.name}
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 16px', borderRadius: '8px', textDecoration: 'none',
                color: isActive ? 'white' : '#93c5fd',
                backgroundColor: isActive ? '#2d5a8e' : 'transparent',
              })}>
              <span>{item.icon}</span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid #2d5a8e' }}>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 16px', borderRadius: '8px', border: 'none',
            backgroundColor: 'transparent', color: '#93c5fd', cursor: 'pointer', fontSize: '14px',
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