import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function AdminLayout() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState({
    posts: 0, resignations: 0
  })

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
  try {
    const [postsRes, resignRes, vendorsRes] = await Promise.all([
      api.get('/posts', { params: { status: 'pending' } }),
      api.get('/resignations', { params: { status: 'pending' } }),
      api.get('/shop/vendors'),
    ])
    setNotifications({
      posts: postsRes.data.length || 0,
      resignations: resignRes.data.length || 0,
      vendors: vendorsRes.data.filter(v => v.status === 'pending').length || 0,
    })
  } catch (err) {
    console.error(err)
  }
}
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/admin/dashboard',    icon: '📊', label: 'Dashboard',      badge: 0 },
    { to: '/admin/players',      icon: '👤', label: 'Joueurs',         badge: 0 },
    { to: '/admin/teams',        icon: '🏟️', label: 'Équipes',         badge: 0 },
    { to: '/admin/matches',      icon: '🏆', label: 'Matchs',          badge: 0 },
    { to: '/admin/stats',        icon: '📈', label: 'Statistiques',    badge: 0 },
    { to: '/admin/trainings',    icon: '📅', label: 'Entraînements',   badge: 0 },
    { to: '/admin/workouts',     icon: '🏋️', label: 'Workouts',        badge: 0 },
    { to: '/admin/diets',        icon: '🥗', label: 'Régimes',         badge: 0 },
    { to: '/admin/health',       icon: '🏥', label: 'Santé',           badge: 0 },
    { to: '/admin/posts',        icon: '📝', label: 'Blog Équipe',     badge: notifications.posts },
    { to: '/admin/resignations', icon: '📋', label: 'Démissions',      badge: notifications.resignations },
    { to: '/admin/vendors', icon: '🏪', label: 'Vendeurs', badge: notifications.vendors }
  ]

  const totalNotifications = notifications.posts + notifications.resignations

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Sidebar */}
      <aside style={{
        width: '240px', minWidth: '240px',
        backgroundColor: '#111827', color: 'white',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Logo */}
        <div style={{ padding: '24px', borderBottom: '1px solid #374151' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>⚽ FootConnect</div>
            {totalNotifications > 0 && (
              <span style={{
                backgroundColor: '#ef4444', color: 'white',
                borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold',
                padding: '2px 8px', minWidth: '20px', textAlign: 'center'
              }}>
                {totalNotifications}
              </span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Panel Administrateur</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px', borderRadius: '8px', textDecoration: 'none',
                color: isActive ? 'white' : '#D1D5DB',
                backgroundColor: isActive ? '#374151' : 'transparent',
              })}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>{item.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span style={{
                  backgroundColor: '#ef4444', color: 'white',
                  borderRadius: '9999px', fontSize: '11px', fontWeight: 'bold',
                  padding: '1px 6px', minWidth: '18px', textAlign: 'center'
                }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid #374151' }}>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 16px', borderRadius: '8px', border: 'none',
            backgroundColor: 'transparent', color: '#D1D5DB', cursor: 'pointer', fontSize: '14px',
          }}>
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu */}
      <main style={{ flex: 1, backgroundColor: '#F3F4F6', overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}