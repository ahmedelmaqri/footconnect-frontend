import { useState, useEffect } from 'react'
import { trainingService } from '../../services/playerService'
import api from '../../services/api'

export default function AdminTrainingsPage() {
  const [trainings, setTrainings] = useState([])
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTraining, setEditTraining] = useState(null)
  const [form, setForm] = useState({
    title: '', description: '', date: '', start_time: '',
    end_time: '', location: '', type: 'collectif',
    status: 'planifie', team_id: '', player_id: ''
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [tRes, teamsRes, playersRes] = await Promise.all([
        trainingService.getAll(),
        api.get('/teams'),
        api.get('/players'),
      ])
      setTrainings(tRes.data)
      setTeams(teamsRes.data.data || teamsRes.data)
      setPlayers((playersRes.data.data || playersRes.data).filter(p => p.role !== 'admin'))
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
      if (editTraining) {
        await trainingService.update(editTraining.id, form)
        setSuccess('Entraînement modifié !')
      } else {
        await trainingService.create(form)
        setSuccess('Entraînement ajouté !')
      }
      setForm({ title: '', description: '', date: '', start_time: '', end_time: '', location: '', type: 'collectif', status: 'planifie', team_id: '', player_id: '' })
      setShowForm(false)
      setEditTraining(null)
      fetchAll()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erreur lors de l\'enregistrement.')
    }
  }

  const handleEdit = (training) => {
    setEditTraining(training)
    setForm({
      title: training.title || '',
      description: training.description || '',
      date: training.date || '',
      start_time: training.start_time || '',
      end_time: training.end_time || '',
      location: training.location || '',
      type: training.type || 'collectif',
      status: training.status || 'planifie',
      team_id: training.team_id || '',
      player_id: training.player_id || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet entraînement ?')) return
    await trainingService.delete(id)
    fetchAll()
  }

  const statusColors = {
    planifie:  'bg-blue-100 text-blue-700',
    en_cours:  'bg-yellow-100 text-yellow-700',
    termine:   'bg-green-100 text-green-700',
    annule:    'bg-red-100 text-red-700',
  }

  const typeIcons = {
    collectif:  '👥', individuel: '👤',
    physique:   '💪', tactique:   '🧠', technique: '⚽'
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Entraînements</h1>
          <p className="text-gray-500 mt-1">{trainings.length} entraînement(s)</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditTraining(null) }}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition">
          {showForm ? '✕ Annuler' : '+ Ajouter'}
        </button>
      </div>

      {success && <div className="bg-green-50 text-green-700 rounded-lg p-3 mb-4">{success}</div>}
      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {editTraining ? 'Modifier l\'entraînement' : 'Nouvel entraînement'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input type="text" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputClass} rows="3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
              <input type="text" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={inputClass} placeholder="Ex: Terrain A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure début</label>
              <input type="time" value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
              <input type="time" value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputClass}>
                <option value="collectif">👥 Collectif</option>
                <option value="individuel">👤 Individuel</option>
                <option value="physique">💪 Physique</option>
                <option value="tactique">🧠 Tactique</option>
                <option value="technique">⚽ Technique</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={inputClass}>
                <option value="planifie">📅 Planifié</option>
                <option value="en_cours">⏳ En cours</option>
                <option value="termine">✅ Terminé</option>
                <option value="annule">❌ Annulé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Équipe</label>
              <select value={form.team_id}
                onChange={(e) => setForm({ ...form, team_id: e.target.value })}
                className={inputClass}>
                <option value="">Toute l'équipe</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Joueur spécifique</label>
              <select value={form.player_id}
                onChange={(e) => setForm({ ...form, player_id: e.target.value })}
                className={inputClass}>
                <option value="">Tous les joueurs</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <button type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2 rounded-lg transition">
                {editTraining ? 'Sauvegarder' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : trainings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-gray-500">Aucun entraînement planifié.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map((training) => (
            <div key={training.id} className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{typeIcons[training.type]}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[training.status]}`}>
                    {training.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(training)}
                    className="text-blue-400 hover:text-blue-600 text-lg">✏️</button>
                  <button onClick={() => handleDelete(training.id)}
                    className="text-red-400 hover:text-red-600 text-lg">🗑️</button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-2">{training.title}</h3>
              {training.description && (
                <p className="text-gray-500 text-sm mb-3">{training.description}</p>
              )}
              <div className="space-y-1 text-sm text-gray-600">
                <p>📅 {new Date(training.date).toLocaleDateString('fr-FR')}</p>
                <p>⏰ {training.start_time} → {training.end_time}</p>
                {training.location && <p>📍 {training.location}</p>}
                {training.team && <p>🏟️ {training.team.name}</p>}
                {training.player && <p>👤 {training.player.name}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}