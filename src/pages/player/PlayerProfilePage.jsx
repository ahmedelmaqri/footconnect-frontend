import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'

export default function PlayerProfilePage() {
  const { user, setUser } = useAuthStore()
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: '', nationality: '',
    position: '', date_of_birth: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    password: '', password_confirmation: ''
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState('profile')

  useEffect(() => { fetchMe() }, [])

  const fetchMe = async () => {
    try {
      const res = await api.get('/me')
      setCurrentUser(res.data)
      setForm({
        name: res.data.name || '',
        nationality: res.data.nationality || '',
        position: res.data.position || '',
        date_of_birth: res.data.date_of_birth || '',
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.put(`/players/${currentUser.id}`, form)
      setSuccess('Profil mis à jour !')
      setEditing(false)
      fetchMe()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erreur lors de la mise à jour.')
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (passwordForm.password !== passwordForm.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    try {
      await api.put(`/players/${currentUser.id}`, passwordForm)
      setSuccess('Mot de passe mis à jour !')
      setPasswordForm({ password: '', password_confirmation: '' })
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erreur lors de la mise à jour.')
    }
  }

  const positions = {
    'Gardien': '🧤', 'Défenseur': '🛡️',
    'Milieu': '⚙️', 'Attaquant': '⚡'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full py-32">
      <div className="text-gray-400 text-xl">Chargement...</div>
    </div>
  )

  return (
    <div className="p-8 max-w-3xl mx-auto">

      {/* Header profil */}
      <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl">
            {positions[currentUser?.position] || '👤'}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{currentUser?.name}</h1>
            <p className="text-green-100 mt-1">{currentUser?.position || 'Position non définie'}</p>
            {currentUser?.nationality && (
              <p className="text-green-100 text-sm mt-1">🌍 {currentUser.nationality}</p>
            )}
            <p className="text-green-100 text-sm mt-1">📧 {currentUser?.email}</p>
          </div>
        </div>
      </div>

      {success && <div className="bg-green-50 text-green-700 rounded-lg p-3 mb-4">{success}</div>}
      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('profile')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
            tab === 'profile' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
          }`}>
          👤 Mon Profil
        </button>
        <button onClick={() => setTab('password')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
            tab === 'password' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
          }`}>
          🔒 Mot de passe
        </button>
      </div>

      {/* Tab Profil */}
      {tab === 'profile' && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Informations personnelles</h2>
            <button onClick={() => setEditing(!editing)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                editing ? 'bg-gray-100 text-gray-600' : 'bg-green-600 text-white hover:bg-green-700'
              }`}>
              {editing ? '✕ Annuler' : '✏️ Modifier'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input type="text" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
                  <input type="text" value={form.nationality}
                    onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <select value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Sélectionner</option>
                    <option value="Gardien">🧤 Gardien</option>
                    <option value="Défenseur">🛡️ Défenseur</option>
                    <option value="Milieu">⚙️ Milieu</option>
                    <option value="Attaquant">⚡ Attaquant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                  <input type="date" value={form.date_of_birth}
                    onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <button type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2 rounded-lg transition">
                Sauvegarder
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Nom complet', value: currentUser?.name, icon: '👤' },
                { label: 'Email', value: currentUser?.email, icon: '📧' },
                { label: 'Position', value: currentUser?.position, icon: '⚽' },
                { label: 'Nationalité', value: currentUser?.nationality, icon: '🌍' },
                { label: 'Date de naissance', value: currentUser?.date_of_birth ? new Date(currentUser.date_of_birth).toLocaleDateString('fr-FR') : '—', icon: '🎂' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">{item.icon} {item.label}</p>
                  <p className="font-medium text-gray-800">{item.value || '—'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Mot de passe */}
      {tab === 'password' && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Changer le mot de passe</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <input type="password" value={passwordForm.password}
                onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••" required minLength="8" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <input type="password" value={passwordForm.password_confirmation}
                onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••" required minLength="8" />
            </div>
            <button type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2 rounded-lg transition">
              Mettre à jour
            </button>
          </form>
        </div>
      )}
    </div>
  )
}