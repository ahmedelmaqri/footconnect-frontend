import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    position: '',
    nationality: '',
    date_of_birth: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.password !== form.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.')
      setLoading(false)
      return
    }

    try {
      const res = await api.post('/register', form)
      login(res.data.token, res.data.user)
      navigate('/')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        setError(Object.values(errors).flat().join(' '))
      } else {
        setError('Une erreur est survenue.')
      }
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
          <p className="text-gray-500 mt-1">Créez votre compte</p>
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
              Nom complet
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ahmed Benali"
              required
            />
          </div>

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
              Position
            </label>
            <select
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Sélectionnez une position</option>
              <option value="Gardien">🧤 Gardien</option>
              <option value="Défenseur">🛡️ Défenseur</option>
              <option value="Milieu">⚙️ Milieu</option>
              <option value="Attaquant">⚡ Attaquant</option>
            </select>
          </div>
          <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Nationalité
  </label>
  <input
    type="text"
    value={form.nationality}
    onChange={(e) => setForm({ ...form, nationality: e.target.value })}
    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
    placeholder="Ex: Marocain"
  />
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Date de naissance
  </label>
  <input
    type="date"
    value={form.date_of_birth}
    onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
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
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        {/* Lien login */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-green-600 font-medium hover:underline">
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  )
}