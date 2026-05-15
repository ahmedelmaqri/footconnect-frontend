import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editPlayer, setEditPlayer] = useState(null)
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    position: '', nationality: '', date_of_birth: ''
  })
  const [editForm, setEditForm] = useState({
    name: '', email: '', password: '',
    position: '', nationality: '', date_of_birth: ''
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { fetchPlayers() }, [])

  const fetchPlayers = async () => {
    try {
      const res = await api.get('/players')
      const allPlayers = res.data.data || res.data
      setPlayers(allPlayers.filter(p => p.role !== 'admin'))
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
      await api.post('/players', { ...form, password_confirmation: form.password })
      setSuccess('Joueur ajouté !')
      setForm({ name: '', email: '', password: '', position: '', nationality: '', date_of_birth: '' })
      setShowForm(false)
      fetchPlayers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      const errors = err.response?.data?.errors
      setError(errors ? Object.values(errors).flat().join(' ') : 'Erreur.')
    }
  }

  const handleEdit = (player) => {
    setEditPlayer(player)
    setEditForm({
      name: player.name || '',
      email: player.email || '',
      password: '',
      position: player.position || '',
      nationality: player.nationality || '',
      date_of_birth: player.date_of_birth || '',
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = { ...editForm }
      if (!data.password) delete data.password
      await api.put(`/players/${editPlayer.id}`, data)
      setSuccess('Joueur modifié !')
      setEditPlayer(null)
      fetchPlayers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      const errors = err.response?.data?.errors
      setError(errors ? Object.values(errors).flat().join(' ') : 'Erreur.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce joueur ?')) return
    await api.delete(`/players/${id}`)
    fetchPlayers()
  }

  const positions = { 'Gardien': '🧤', 'Défenseur': '🛡️', 'Milieu': '⚙️', 'Attaquant': '⚡' }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Joueurs</h1>
          <p className="text-gray-500 mt-1">{players.length} joueur(s)</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition"
        >
          {showForm ? '✕ Annuler' : '+ Ajouter'}
        </button>
      </div>

      {success && <div className="bg-green-50 text-green-700 rounded-lg p-3 mb-4">{success}</div>}
      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4">{error}</div>}

      {/* Formulaire ajout */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Nouveau joueur</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <input type="text" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input type="password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
              <input type="text" value={form.nationality}
                onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Marocain" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
              <input type="date" value={form.date_of_birth}
                onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="md:col-span-2">
              <button type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2 rounded-lg transition">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste joueurs */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : players.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <div className="text-5xl mb-4">👤</div>
          <p className="text-gray-500">Aucun joueur enregistré.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <div key={player.id} className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                    {positions[player.position] || '👤'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{player.name}</h3>
                    <p className="text-sm text-gray-500">{player.position || 'Position inconnue'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(player)}
                    className="text-blue-400 hover:text-blue-600 transition text-lg">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(player.id)}
                    className="text-red-400 hover:text-red-600 transition text-lg">
                    🗑️
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                {player.nationality && <p>🌍 {player.nationality}</p>}
                {player.date_of_birth && <p>🎂 {new Date(player.date_of_birth).toLocaleDateString('fr-FR')}</p>}
                <p>📧 {player.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Edit */}
      {editPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Modifier le joueur</h2>
              <button onClick={() => setEditPlayer(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input type="text" value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe <span className="text-gray-400">(optionnel)</span>
                </label>
                <input type="password" value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Laisser vide pour ne pas changer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <select value={editForm.position}
                  onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Sélectionner</option>
                  <option value="Gardien">🧤 Gardien</option>
                  <option value="Défenseur">🛡️ Défenseur</option>
                  <option value="Milieu">⚙️ Milieu</option>
                  <option value="Attaquant">⚡ Attaquant</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
                <input type="text" value={editForm.nationality}
                  onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                <input type="date" value={editForm.date_of_birth}
                  onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setEditPlayer(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                  Annuler
                </button>
                <button type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}