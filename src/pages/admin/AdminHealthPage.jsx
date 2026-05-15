import { useState, useEffect } from 'react'
import { healthService } from '../../services/playerService'
import api from '../../services/api'

export default function AdminHealthPage() {
  const [records, setRecords] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [form, setForm] = useState({
    player_id: '', date: '', weight: '', height: '',
    heart_rate: '', blood_pressure_sys: '', blood_pressure_dia: '',
    fitness_level: 'bon', injury_status: 'aucune',
    injury_description: '', notes: '',
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [hRes, pRes] = await Promise.all([
        healthService.getAll(),
        api.get('/players'),
      ])
      setRecords(hRes.data)
      setPlayers((pRes.data.data || pRes.data).filter(p => p.role !== 'admin'))
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
      if (editRecord) {
        await healthService.update(editRecord.id, form)
        setSuccess('Dossier modifié !')
      } else {
        await healthService.create(form)
        setSuccess('Dossier ajouté !')
      }
      setForm({ player_id: '', date: '', weight: '', height: '', heart_rate: '', blood_pressure_sys: '', blood_pressure_dia: '', fitness_level: 'bon', injury_status: 'aucune', injury_description: '', notes: '' })
      setShowForm(false)
      setEditRecord(null)
      fetchAll()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erreur lors de l\'enregistrement.')
    }
  }

  const handleEdit = (record) => {
    setEditRecord(record)
    setForm({
      player_id: record.player_id || '',
      date: record.date || '',
      weight: record.weight || '',
      height: record.height || '',
      heart_rate: record.heart_rate || '',
      blood_pressure_sys: record.blood_pressure_sys || '',
      blood_pressure_dia: record.blood_pressure_dia || '',
      fitness_level: record.fitness_level || 'bon',
      injury_status: record.injury_status || 'aucune',
      injury_description: record.injury_description || '',
      notes: record.notes || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce dossier ?')) return
    await healthService.delete(id)
    fetchAll()
  }

  const fitnessColors = {
    excellent: 'bg-green-100 text-green-700',
    bon:       'bg-blue-100 text-blue-700',
    moyen:     'bg-yellow-100 text-yellow-700',
    faible:    'bg-red-100 text-red-700',
  }

  const injuryColors = {
    aucune:   'bg-green-100 text-green-700',
    legere:   'bg-yellow-100 text-yellow-700',
    moderee:  'bg-orange-100 text-orange-700',
    grave:    'bg-red-100 text-red-700',
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Suivi Santé</h1>
          <p className="text-gray-500 mt-1">{records.length} dossier(s)</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditRecord(null) }}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition">
          {showForm ? '✕ Annuler' : '+ Ajouter un dossier'}
        </button>
      </div>

      {success && <div className="bg-green-50 text-green-700 rounded-lg p-3 mb-4">{success}</div>}
      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {editRecord ? 'Modifier le dossier' : 'Nouveau dossier santé'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">👤 Joueur</label>
                <select value={form.player_id}
                  onChange={(e) => setForm({ ...form, player_id: e.target.value })}
                  className={inputClass} required>
                  <option value="">Sélectionner</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📅 Date</label>
                <input type="date" value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={inputClass} required />
              </div>
            </div>

            {/* Mesures physiques */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">📏 Mesures physiques</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
                  <input type="number" step="0.1" value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className={inputClass} placeholder="75.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taille (cm)</label>
                  <input type="number" value={form.height}
                    onChange={(e) => setForm({ ...form, height: e.target.value })}
                    className={inputClass} placeholder="180" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rythme cardiaque</label>
                  <input type="number" value={form.heart_rate}
                    onChange={(e) => setForm({ ...form, heart_rate: e.target.value })}
                    className={inputClass} placeholder="70 bpm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tension sys/dia</label>
                  <div className="flex gap-1">
                    <input type="number" value={form.blood_pressure_sys}
                      onChange={(e) => setForm({ ...form, blood_pressure_sys: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      placeholder="120" />
                    <span className="py-2">/</span>
                    <input type="number" value={form.blood_pressure_dia}
                      onChange={(e) => setForm({ ...form, blood_pressure_dia: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      placeholder="80" />
                  </div>
                </div>
              </div>
            </div>

            {/* Condition */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">🏃 Condition</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau de forme</label>
                  <select value={form.fitness_level}
                    onChange={(e) => setForm({ ...form, fitness_level: e.target.value })}
                    className={inputClass}>
                    <option value="excellent">🟢 Excellent</option>
                    <option value="bon">🔵 Bon</option>
                    <option value="moyen">🟡 Moyen</option>
                    <option value="faible">🔴 Faible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut blessure</label>
                  <select value={form.injury_status}
                    onChange={(e) => setForm({ ...form, injury_status: e.target.value })}
                    className={inputClass}>
                    <option value="aucune">✅ Aucune</option>
                    <option value="legere">🟡 Légère</option>
                    <option value="moderee">🟠 Modérée</option>
                    <option value="grave">🔴 Grave</option>
                  </select>
                </div>
                {form.injury_status !== 'aucune' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description blessure</label>
                    <textarea value={form.injury_description}
                      onChange={(e) => setForm({ ...form, injury_description: e.target.value })}
                      className={inputClass} rows="2" />
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes médicales</label>
                  <textarea value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className={inputClass} rows="2" />
                </div>
              </div>
            </div>

            <button type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2 rounded-lg transition">
              {editRecord ? 'Sauvegarder' : 'Enregistrer'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <div className="text-5xl mb-4">🏥</div>
          <p className="text-gray-500">Aucun dossier santé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <div key={record.id} className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${fitnessColors[record.fitness_level]}`}>
                    {record.fitness_level}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${injuryColors[record.injury_status]}`}>
                    {record.injury_status === 'aucune' ? '✅ Sain' : `🤕 ${record.injury_status}`}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(record)}
                    className="text-blue-400 hover:text-blue-600 text-lg">✏️</button>
                  <button onClick={() => handleDelete(record.id)}
                    className="text-red-400 hover:text-red-600 text-lg">🗑️</button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">
                👤 {record.player?.name || '—'}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                📅 {new Date(record.date).toLocaleDateString('fr-FR')}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {record.weight && <p className="text-gray-600">⚖️ {record.weight} kg</p>}
                {record.height && <p className="text-gray-600">📏 {record.height} cm</p>}
                {record.heart_rate && <p className="text-gray-600">❤️ {record.heart_rate} bpm</p>}
                {record.blood_pressure_sys && (
                  <p className="text-gray-600">🩺 {record.blood_pressure_sys}/{record.blood_pressure_dia}</p>
                )}
              </div>
              {record.injury_description && (
                <p className="text-xs text-red-500 mt-2">⚠️ {record.injury_description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}