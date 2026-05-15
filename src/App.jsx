import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/ui/Layout'
import AdminLayout from './components/ui/AdminLayout'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminPlayersPage from './pages/admin/AdminPlayersPage'
import AdminTeamsPage from './pages/admin/AdminTeamsPage'
import AdminMatchesPage from './pages/admin/AdminMatchesPage'
import AdminStatsPage from './pages/admin/AdminStatsPage'
import PlayerProfilePage from './pages/player/PlayerProfilePage'

import PlayerTrainingsPage from './pages/player/PlayerTrainingsPage'
import PlayerWorkoutsPage from './pages/player/PlayerWorkoutsPage'
import PlayerDietPage from './pages/player/PlayerDietPage'
import PlayerHealthPage from './pages/player/PlayerHealthPage'
import PlayerBlogPage from './pages/player/PlayerBlogPage'
import PlayerResignationPage from './pages/player/PlayerResignationPage'

import AdminTrainingsPage from './pages/admin/AdminTrainingsPage'
import AdminWorkoutsPage from './pages/admin/AdminWorkoutsPage'
import AdminDietsPage from './pages/admin/AdminDietsPage'
import AdminHealthPage from './pages/admin/AdminHealthPage'
import AdminPostsPage from './pages/admin/AdminPostsPage'
import AdminResignationsPage from './pages/admin/AdminResignationsPage'

import AdminVendorsPage from './pages/admin/AdminVendorsPage'


import ShopHomePage from './pages/shop/ShopHomePage'
import ShopCataloguePage from './pages/shop/ShopCataloguePage'
import ShopProductPage from './pages/shop/ShopProductPage'
import ShopCartPage from './pages/shop/ShopCartPage'
import ShopCheckoutPage from './pages/shop/ShopCheckoutPage'
import ShopOrdersPage from './pages/shop/ShopOrdersPage'


import VendorLayout from './components/ui/VendorLayout'
import VendorDashboardPage from './pages/vendor/VendorDashboardPage'
import VendorShopPage from './pages/vendor/VendorShopPage'
import VendorProductsPage from './pages/vendor/VendorProductsPage'
import VendorOrdersPage from './pages/vendor/VendorOrdersPage'


function PrivateRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function VendorRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== 'vendor') return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Routes Joueur */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="trainings"   element={<PlayerTrainingsPage />} />
        <Route path="workouts"    element={<PlayerWorkoutsPage />} />
        <Route path="diet"        element={<PlayerDietPage />} />
        <Route path="health"      element={<PlayerHealthPage />} />
        <Route path="blog"        element={<PlayerBlogPage />} />
        <Route path="resignation" element={<PlayerResignationPage />} />
        <Route path="profile" element={<PlayerProfilePage />} />
      </Route>
      <Route path="/shop" element={<PrivateRoute><ShopHomePage /></PrivateRoute>} />
      <Route path="/shop/catalogue" element={<PrivateRoute><ShopCataloguePage /></PrivateRoute>} />
      <Route path="/shop/product/:id" element={<PrivateRoute><ShopProductPage /></PrivateRoute>} />
      <Route path="/shop/cart" element={<PrivateRoute><ShopCartPage /></PrivateRoute>} />
      <Route path="/shop/checkout" element={<PrivateRoute><ShopCheckoutPage /></PrivateRoute>} />
      <Route path="/shop/orders" element={<PrivateRoute><ShopOrdersPage /></PrivateRoute>} />

      {/* Routes Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="teams" element={<AdminTeamsPage />} />
        <Route path="stats" element={<AdminStatsPage />} />        <Route path="players" element={<AdminPlayersPage />} />
        <Route path="matches" element={<AdminMatchesPage />} />
        <Route path="trainings"   element={<AdminTrainingsPage />} />
        <Route path="workouts"    element={<AdminWorkoutsPage />} />
        <Route path="diets"       element={<AdminDietsPage />} />
        <Route path="health"      element={<AdminHealthPage />} />
        <Route path="posts"       element={<AdminPostsPage />} />
        <Route path="resignations" element={<AdminResignationsPage />} />   
        <Route path="vendors" element={<AdminVendorsPage />} />     

      </Route>




      <Route path="/vendor" element={<VendorRoute><VendorLayout /></VendorRoute>}>
        <Route path="dashboard" element={<VendorDashboardPage />} />
        <Route path="shop"      element={<VendorShopPage />} />
        <Route path="products"  element={<VendorProductsPage />} />
        <Route path="orders"    element={<VendorOrdersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}