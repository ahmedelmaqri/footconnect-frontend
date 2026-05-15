import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  try {
    const res = await api.post('/login', form)
    login(res.data.token, res.data.user)
    
    // Redirection selon le rôle
    if (res.data.user.role === 'admin') {
      navigate('/admin/dashboard')
    } else if (res.data.user.role === 'vendor') {
      navigate('/vendor')
    } else {
      navigate('/dashboard')
    }
  } catch (err) {
    setError('Email ou mot de passe incorrect.')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-800 to-green-600">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">⚽</div>
          <h1 className="text-3xl font-bold text-green-700">FootConnect</h1>
          <p className="text-gray-500 mt-1">Suivi de performances football</p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Lien signup */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{' '}
          <Link to="/signup" className="text-green-600 font-medium hover:underline">
            S'inscrire
          </Link>
        </p>

      </div>
    </div>
  )
}