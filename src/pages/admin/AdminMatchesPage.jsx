import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editMatch, setEditMatch] = useState(null)
  const [form, setForm] = useState({
    home_team_id: '', away_team_id: '',
    date: '', venue: '', competition: '',
    season: '', status: 'scheduled',
    home_score: 0, away_score: 0,
  })
  const [editForm, setEditForm] = useState({})
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMatches()
    fetchTeams()
  }, [])

  const fetchMatches = async () => {
    try {
      const res = await api.get('/matches')
      setMatches(res.data.data || res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams')
      setTeams(res.data.data || res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/matches', form)
      setSuccess('Match ajouté !')
      setForm({
        home_team_id: '', away_team_id: '',
        date: '', venue: '', competition: '',
        season: '', status: 'scheduled',
        home_score: 0, away_score: 0,
      })
      setShowForm(false)
      fetchMatches()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      const errors = err.response?.data?.errors
      setError(errors ? Object.values(errors).flat().join(' ') : 'Erreur.')
    }
  }

  const handleEdit = (match) => {
    setEditMatch(match)
    setEditForm({
      home_team_id: match.home_team_id || '',
      away_team_id: match.away_team_id || '',
      date: match.date ? match.date.substring(0, 16) : '',
      venue: match.venue || '',
      competition: match.competition || '',
      season: match.season || '',
      status: match.status || 'scheduled',
      home_score: match.home_score || 0,
      away_score: match.away_score || 0,
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/matches/${editMatch.id}`, editForm)
      setSuccess('Match modifié !')
      setEditMatch(null)
      fetchMatches()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erreur lors de la modification.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce match ?')) return
    await api.delete(`/matches/${id}`)
    fetchMatches()
  }

  const getTeamName = (id) => teams.find(t => t.id == id)?.name || '—'

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700',
    live:      'bg-red-100 text-red-700',
    finished:  'bg-gray-100 text-gray-700',
  }

  const statusLabels = {
    scheduled: '🗓️ Programmé',
    live:      '🔴 En direct',
    finished:  '✅ Terminé',
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
  const editInputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Matchs</h1>
          <p className="text-gray-500 mt-1">{matches.length} match(s)</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition">
          {showForm ? '✕ Annuler' : '+ Ajouter un match'}
        </button>
      </div>

      {success && <div className="bg-green-50 text-green-700 rounded-lg p-3 mb-4">{success}</div>}
      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4">{error}</div>}

      {/* Formulaire ajout */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Nouveau match</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">🏠 Équipe domicile</label>
              <select value={form.home_team_id}
                onChange={(e) => setForm({ ...form, home_team_id: e.target.value })}
                className={inputClass} required>
                <option value="">Sélectionner</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">✈️ Équipe extérieur</label>
              <select value={form.away_team_id}
                onChange={(e) => setForm({ ...form, away_team_id: e.target.value })}
                className={inputClass} required>
                <option value="">Sélectionner</option>
                {teams.filter(t => t.id != form.home_team_id).map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📅 Date & Heure</label>
              <input type="datetime-local" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">🏟️ Stade</label>
              <input type="text" value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                className={inputClass} placeholder="Ex: Stade Mohammed V" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">🏆 Compétition</label>
              <input type="text" value={form.competition}
                onChange={(e) => setForm({ ...form, competition: e.target.value })}
                className={inputClass} placeholder="Ex: Ligue 1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📆 Saison</label>
              <input type="text" value={form.season}
                onChange={(e) => setForm({ ...form, season: e.target.value })}
                className={inputClass} placeholder="Ex: 2024-2025" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={inputClass}>
                <option value="scheduled">🗓️ Programmé</option>
                <option value="live">🔴 En direct</option>
                <option value="finished">✅ Terminé</option>
              </select>
            </div>
            {form.status === 'finished' && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score domicile</label>
                  <input type="number" min="0" value={form.home_score}
                    onChange={(e) => setForm({ ...form, home_score: e.target.value })}
                    className={inputClass} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score extérieur</label>
                  <input type="number" min="0" value={form.away_score}
                    onChange={(e) => setForm({ ...form, away_score: e.target.value })}
                    className={inputClass} />
                </div>
              </div>
            )}
            <div className="md:col-span-2">
              <button type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2 rounded-lg transition">
                Enregistrer le match
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste matchs */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : matches.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-gray-500">Aucun match enregistré.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">

                {/* Équipes & Score */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="font-bold text-gray-800 text-lg">{getTeamName(match.home_team_id)}</div>
                    <div className="text-sm text-gray-500">Domicile</div>
                  </div>
                  <div className="text-center">
                    {match.status === 'finished' ? (
                      <div className="text-3xl font-bold text-gray-800">
                        {match.home_score} - {match.away_score}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-gray-400">VS</div>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[match.status]}`}>
                      {statusLabels[match.status]}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-800 text-lg">{getTeamName(match.away_team_id)}</div>
                    <div className="text-sm text-gray-500">Extérieur</div>
                  </div>
                </div>

                {/* Infos & Actions */}
                <div className="flex items-center gap-6">
                  <div className="text-sm text-gray-500 text-right">
                    {match.competition && <p>🏆 {match.competition}</p>}
                    {match.venue && <p>🏟️ {match.venue}</p>}
                    {match.date && <p>📅 {new Date(match.date).toLocaleDateString('fr-FR')}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(match)}
                      className="text-blue-400 hover:text-blue-600 text-lg">✏️</button>
                    <button onClick={() => handleDelete(match.id)}
                      className="text-red-400 hover:text-red-600 text-lg">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Edit */}
      {editMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Modifier le match</h2>
              <button onClick={() => setEditMatch(null)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Équipe domicile</label>
                <select value={editForm.home_team_id}
                  onChange={(e) => setEditForm({ ...editForm, home_team_id: e.target.value })}
                  className={editInputClass}>
                  <option value="">Sélectionner</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Équipe extérieur</label>
                <select value={editForm.away_team_id}
                  onChange={(e) => setEditForm({ ...editForm, away_team_id: e.target.value })}
                  className={editInputClass}>
                  <option value="">Sélectionner</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Heure</label>
                <input type="datetime-local" value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className={editInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stade</label>
                <input type="text" value={editForm.venue}
                  onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                  className={editInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compétition</label>
                <input type="text" value={editForm.competition}
                  onChange={(e) => setEditForm({ ...editForm, competition: e.target.value })}
                  className={editInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Saison</label>
                <input type="text" value={editForm.season}
                  onChange={(e) => setEditForm({ ...editForm, season: e.target.value })}
                  className={editInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className={editInputClass}>
                  <option value="scheduled">🗓️ Programmé</option>
                  <option value="live">🔴 En direct</option>
                  <option value="finished">✅ Terminé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score domicile</label>
                <input type="number" min="0" value={editForm.home_score}
                  onChange={(e) => setEditForm({ ...editForm, home_score: e.target.value })}
                  className={editInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score extérieur</label>
                <input type="number" min="0" value={editForm.away_score}
                  onChange={(e) => setEditForm({ ...editForm, away_score: e.target.value })}
                  className={editInputClass} />
              </div>
              <div className="md:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setEditMatch(null)}
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