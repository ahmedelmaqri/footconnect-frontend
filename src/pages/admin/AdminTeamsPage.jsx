import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTeam, setEditTeam] = useState(null)
  const [form, setForm] = useState({
    name: '', city: '', country: '', founded_year: '', coach: '',
    gardien_id: '', defenseur_id: '', milieu1_id: '', milieu2_id: '', attaquant_id: ''
  })
  const [editForm, setEditForm] = useState({
    name: '', city: '', country: '', founded_year: '', coach: ''
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTeams()
    fetchPlayers()
  }, [])

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams')
      setTeams(res.data.data || res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlayers = async () => {
    try {
      const res = await api.get('/players')
      const all = res.data.data || res.data
      setPlayers(all.filter(p => p.role !== 'admin'))
    } catch (err) {
      console.error(err)
    }
  }

  const byPosition = (pos) => players.filter(p => p.position === pos)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/teams', form)
      setSuccess('Équipe ajoutée !')
      setForm({ name: '', city: '', country: '', founded_year: '', coach: '', gardien_id: '', defenseur_id: '', milieu1_id: '', milieu2_id: '', attaquant_id: '' })
      setShowForm(false)
      fetchTeams()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erreur lors de l\'ajout.')
    }
  }

  const handleEdit = (team) => {
    setEditTeam(team)
    setEditForm({
      name: team.name || '',
      city: team.city || '',
      country: team.country || '',
      founded_year: team.founded_year || '',
      coach: team.coach || '',
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/teams/${editTeam.id}`, editForm)
      setSuccess('Équipe modifiée !')
      setEditTeam(null)
      fetchTeams()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erreur lors de la modification.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette équipe ?')) return
    await api.delete(`/teams/${id}`)
    fetchTeams()
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
  const editInputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Équipes</h1>
          <p className="text-gray-500 mt-1">{teams.length} équipe(s)</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition">
          {showForm ? '✕ Annuler' : '+ Ajouter une équipe'}
        </button>
      </div>

      {success && <div className="bg-green-50 text-green-700 rounded-lg p-3 mb-4">{success}</div>}
      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4">{error}</div>}

      {/* Formulaire ajout */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Nouvelle équipe</h2>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Infos équipe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'équipe</label>
                <input type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input type="text" value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                <input type="text" value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Année de fondation</label>
                <input type="number" value={form.founded_year}
                  onChange={(e) => setForm({ ...form, founded_year: e.target.value })}
                  className={inputClass} placeholder="Ex: 1950" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Entraîneur</label>
                <input type="text" value={form.coach}
                  onChange={(e) => setForm({ ...form, coach: e.target.value })}
                  className={inputClass} />
              </div>
            </div>

            {/* Sélection joueurs */}
            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-3 border-t pt-4">
                ⚽ Composition de l'équipe
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Gardien */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🧤 Gardien</label>
                  <select value={form.gardien_id}
                    onChange={(e) => setForm({ ...form, gardien_id: e.target.value })}
                    className={inputClass}>
                    <option value="">Sélectionner un gardien</option>
                    {byPosition('Gardien').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Défenseur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🛡️ Défenseur</label>
                  <select value={form.defenseur_id}
                    onChange={(e) => setForm({ ...form, defenseur_id: e.target.value })}
                    className={inputClass}>
                    <option value="">Sélectionner un défenseur</option>
                    {byPosition('Défenseur').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Milieu 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">⚙️ Milieu 1</label>
                  <select value={form.milieu1_id}
                    onChange={(e) => setForm({ ...form, milieu1_id: e.target.value })}
                    className={inputClass}>
                    <option value="">Sélectionner un milieu</option>
                    {byPosition('Milieu').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Milieu 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">⚙️ Milieu 2</label>
                  <select value={form.milieu2_id}
                    onChange={(e) => setForm({ ...form, milieu2_id: e.target.value })}
                    className={inputClass}>
                    <option value="">Sélectionner un milieu</option>
                    {byPosition('Milieu').filter(p => p.id !== parseInt(form.milieu1_id)).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Attaquant */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">⚡ Attaquant</label>
                  <select value={form.attaquant_id}
                    onChange={(e) => setForm({ ...form, attaquant_id: e.target.value })}
                    className={inputClass}>
                    <option value="">Sélectionner un attaquant</option>
                    {byPosition('Attaquant').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            <button type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2 rounded-lg transition">
              Enregistrer l'équipe
            </button>
          </form>
        </div>
      )}

      {/* Liste équipes */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : teams.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <div className="text-5xl mb-4">🏟️</div>
          <p className="text-gray-500">Aucune équipe enregistrée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">🏟️</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{team.name}</h3>
                    <p className="text-sm text-gray-500">{team.city || 'Ville inconnue'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(team)} className="text-blue-400 hover:text-blue-600 text-lg">✏️</button>
                  <button onClick={() => handleDelete(team.id)} className="text-red-400 hover:text-red-600 text-lg">🗑️</button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                {team.country && <p>🌍 {team.country}</p>}
                {team.founded_year && <p>📅 Fondé en {team.founded_year}</p>}
                {team.coach && <p>👨‍💼 {team.coach}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Edit */}
      {editTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Modifier l'équipe</h2>
              <button onClick={() => setEditTeam(null)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input type="text" value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className={editInputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input type="text" value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className={editInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                <input type="text" value={editForm.country}
                  onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  className={editInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Année fondation</label>
                <input type="number" value={editForm.founded_year}
                  onChange={(e) => setEditForm({ ...editForm, founded_year: e.target.value })}
                  className={editInputClass} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Entraîneur</label>
                <input type="text" value={editForm.coach}
                  onChange={(e) => setEditForm({ ...editForm, coach: e.target.value })}
                  className={editInputClass} />
              </div>
              <div className="md:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setEditTeam(null)}
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