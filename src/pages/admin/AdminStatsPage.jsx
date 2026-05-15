import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function AdminStatsPage() {
  const [stats, setStats] = useState([])
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editStat, setEditStat] = useState(null)
  const [form, setForm] = useState({
    player_id: '', match_id: '', season: '2024-2025',
    goals: 0, assists: 0, shots: 0, shots_on_target: 0,
    tackles: 0, interceptions: 0, minutes_played: 90,
    distance_km: 0, passes: 0, pass_accuracy: 0,
    yellow_cards: 0, red_cards: 0, rating: 0,
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [statsRes, playersRes, matchesRes] = await Promise.all([
        api.get('/stats'),
        api.get('/players'),
        api.get('/matches'),
      ])
      setStats(statsRes.data.data || statsRes.data)
      setPlayers((playersRes.data.data || playersRes.data).filter(p => p.role !== 'admin'))
      setMatches(matchesRes.data.data || matchesRes.data)
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
      await api.post('/stats', form)
      setSuccess('Statistique ajoutée !')
      setForm({
        player_id: '', match_id: '', season: '2024-2025',
        goals: 0, assists: 0, shots: 0, shots_on_target: 0,
        tackles: 0, interceptions: 0, minutes_played: 90,
        distance_km: 0, passes: 0, pass_accuracy: 0,
        yellow_cards: 0, red_cards: 0, rating: 0,
      })
      setShowForm(false)
      fetchAll()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      const errors = err.response?.data?.errors
      setError(errors ? Object.values(errors).flat().join(' ') : 'Erreur.')
    }
  }

  const handleEdit = (stat) => {
    setEditStat(stat)
    setForm({
      player_id: stat.player_id || '',
      match_id: stat.match_id || '',
      season: stat.season || '2024-2025',
      goals: stat.goals || 0,
      assists: stat.assists || 0,
      shots: stat.shots || 0,
      shots_on_target: stat.shots_on_target || 0,
      tackles: stat.tackles || 0,
      interceptions: stat.interceptions || 0,
      minutes_played: stat.minutes_played || 90,
      distance_km: stat.distance_km || 0,
      passes: stat.passes || 0,
      pass_accuracy: stat.pass_accuracy || 0,
      yellow_cards: stat.yellow_cards || 0,
      red_cards: stat.red_cards || 0,
      rating: stat.rating || 0,
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/stats/${editStat.id}`, form)
      setSuccess('Statistique modifiée !')
      setEditStat(null)
      fetchAll()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erreur lors de la modification.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette statistique ?')) return
    await api.delete(`/stats/${id}`)
    fetchAll()
  }

  const getPlayerName = (id) => players.find(p => p.id == id)?.name || '—'
  const getMatchLabel = (id) => {
    const m = matches.find(m => m.id == id)
    return m ? `Match #${m.id}` : '—'
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"

  const StatInput = ({ label, field, min = 0, max, step = 1, currentForm, setCurrentForm }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type="number" min={min} max={max} step={step}
        value={currentForm[field]}
        onChange={(e) => setCurrentForm({ ...currentForm, [field]: e.target.value })}
        className={inputClass} />
    </div>
  )

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Statistiques</h1>
          <p className="text-gray-500 mt-1">{stats.length} entrée(s)</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditStat(null) }}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition">
          {showForm ? '✕ Annuler' : '+ Ajouter des stats'}
        </button>
      </div>

      {success && <div className="bg-green-50 text-green-700 rounded-lg p-3 mb-4">{success}</div>}
      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4">{error}</div>}

      {/* Formulaire */}
      {(showForm || editStat) && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {editStat ? 'Modifier la statistique' : 'Nouvelle statistique'}
          </h2>
          <form onSubmit={editStat ? handleEditSubmit : handleSubmit} className="space-y-6">

            {/* Joueur & Match */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">👤 Joueur</label>
                <select value={form.player_id}
                  onChange={(e) => setForm({ ...form, player_id: e.target.value })}
                  className={inputClass} required>
                  <option value="">Sélectionner un joueur</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.position}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">🏆 Match</label>
                <select value={form.match_id}
                  onChange={(e) => setForm({ ...form, match_id: e.target.value })}
                  className={inputClass}>
                  <option value="">Sélectionner un match</option>
                  {matches.map(m => (
                    <option key={m.id} value={m.id}>Match #{m.id} — {m.competition || m.season}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📆 Saison</label>
                <input type="text" value={form.season}
                  onChange={(e) => setForm({ ...form, season: e.target.value })}
                  className={inputClass} placeholder="2024-2025" required />
              </div>
            </div>

            {/* Stats Attaque */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">⚽ Attaque</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatInput label="Buts" field="goals" currentForm={form} setCurrentForm={setForm} />
                <StatInput label="Passes décisives" field="assists" currentForm={form} setCurrentForm={setForm} />
                <StatInput label="Tirs" field="shots" currentForm={form} setCurrentForm={setForm} />
                <StatInput label="Tirs cadrés" field="shots_on_target" currentForm={form} setCurrentForm={setForm} />
              </div>
            </div>

            {/* Stats Défense */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">🛡️ Défense</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatInput label="Tacles" field="tackles" currentForm={form} setCurrentForm={setForm} />
                <StatInput label="Interceptions" field="interceptions" currentForm={form} setCurrentForm={setForm} />
                <StatInput label="Cartons jaunes" field="yellow_cards" currentForm={form} setCurrentForm={setForm} />
                <StatInput label="Cartons rouges" field="red_cards" currentForm={form} setCurrentForm={setForm} />
              </div>
            </div>

            {/* Stats Général */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">📊 Général</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatInput label="Minutes jouées" field="minutes_played" currentForm={form} setCurrentForm={setForm} />
                <StatInput label="Distance (km)" field="distance_km" step="0.1" currentForm={form} setCurrentForm={setForm} />
                <StatInput label="Passes" field="passes" currentForm={form} setCurrentForm={setForm} />
                <StatInput label="Précision passes (%)" field="pass_accuracy" max="100" step="0.1" currentForm={form} setCurrentForm={setForm} />
              </div>
            </div>

            {/* Note */}
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">⭐ Note (sur 10)</label>
              <input type="number" min="0" max="10" step="0.1"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className={inputClass} />
            </div>

            <div className="flex gap-3">
              <button type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2 rounded-lg transition">
                {editStat ? 'Sauvegarder' : 'Enregistrer'}
              </button>
              {editStat && (
                <button type="button" onClick={() => setEditStat(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Liste stats */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : stats.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-gray-500">Aucune statistique enregistrée.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Joueur</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Saison</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">⚽ Buts</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">🎯 Passes</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">⏱️ Min</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">🏃 Km</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">⭐ Note</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">🟨 🟥</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.map((stat) => (
                <tr key={stat.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{getPlayerName(stat.player_id)}</td>
                  <td className="px-4 py-3 text-gray-600">{stat.season}</td>
                  <td className="px-4 py-3 text-center text-green-600 font-semibold">{stat.goals}</td>
                  <td className="px-4 py-3 text-center text-blue-600 font-semibold">{stat.assists}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{stat.minutes_played}'</td>
                  <td className="px-4 py-3 text-center text-gray-600">{stat.distance_km}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                      {stat.rating}/10
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {stat.yellow_cards > 0 && <span className="mr-1">🟨{stat.yellow_cards}</span>}
                    {stat.red_cards > 0 && <span>🟥{stat.red_cards}</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => { handleEdit(stat); setShowForm(true) }}
                        className="text-blue-400 hover:text-blue-600 text-lg">✏️</button>
                      <button onClick={() => handleDelete(stat.id)}
                        className="text-red-400 hover:text-red-600 text-lg">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}