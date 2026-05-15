import { useState, useEffect } from 'react'
import { workoutService } from '../../services/playerService'
import api from '../../services/api'
import ImageUpload from '../../components/ui/ImageUpload'
export default function AdminWorkoutsPage() {
  const [workouts, setWorkouts] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editWorkout, setEditWorkout] = useState(null)
  const [form, setForm] = useState({
    player_id: '', title: '', description: '',
    difficulty: 'moyen', duration_minutes: 60,
    assigned_date: '', notes: '', image: '',
    exercises: [{ name: '', sets: '', reps: '', duration: '' }]
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [wRes, pRes] = await Promise.all([
        workoutService.getAll(),
        api.get('/players'),
      ])
      setWorkouts(wRes.data)
      setPlayers((pRes.data.data || pRes.data).filter(p => p.role !== 'admin'))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addExercise = () => {
    setForm({ ...form, exercises: [...form.exercises, { name: '', sets: '', reps: '', duration: '' }] })
  }

  const removeExercise = (index) => {
    setForm({ ...form, exercises: form.exercises.filter((_, i) => i !== index) })
  }

  const updateExercise = (index, field, value) => {
    const updated = form.exercises.map((ex, i) =>
      i === index ? { ...ex, [field]: value } : ex
    )
    setForm({ ...form, exercises: updated })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editWorkout) {
        await workoutService.update(editWorkout.id, form)
        setSuccess('Workout modifié !')
      } else {
        await workoutService.create(form)
        setSuccess('Workout ajouté !')
      }
      setForm({ player_id: '', title: '', description: '', difficulty: 'moyen', duration_minutes: 60, assigned_date: '', notes: '', exercises: [{ name: '', sets: '', reps: '', duration: '' }] })
      setShowForm(false)
      setEditWorkout(null)
      fetchAll()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erreur lors de l\'enregistrement.')
    }
  }

  const handleEdit = (workout) => {
    setEditWorkout(workout)
    setForm({
      player_id: workout.player_id || '',
      title: workout.title || '',
      description: workout.description || '',
      difficulty: workout.difficulty || 'moyen',
      duration_minutes: workout.duration_minutes || 60,
      assigned_date: workout.assigned_date || '',
      notes: workout.notes || '',
      exercises: workout.exercises || [{ name: '', sets: '', reps: '', duration: '' }],
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce workout ?')) return
    await workoutService.delete(id)
    fetchAll()
  }

  const difficultyColors = {
    facile:   'bg-green-100 text-green-700',
    moyen:    'bg-yellow-100 text-yellow-700',
    difficile:'bg-orange-100 text-orange-700',
    extreme:  'bg-red-100 text-red-700',
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Workouts</h1>
          <p className="text-gray-500 mt-1">{workouts.length} workout(s)</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditWorkout(null) }}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition">
          {showForm ? '✕ Annuler' : '+ Ajouter'}
        </button>
      </div>

      {success && <div className="bg-green-50 text-green-700 rounded-lg p-3 mb-4">{success}</div>}
      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {editWorkout ? 'Modifier le workout' : 'Nouveau workout'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">👤 Joueur</label>
                <select value={form.player_id}
                  onChange={(e) => setForm({ ...form, player_id: e.target.value })}
                  className={inputClass} required>
                  <option value="">Sélectionner</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name} — {p.position}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input type="text" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
                <select value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className={inputClass}>
                  <option value="facile">🟢 Facile</option>
                  <option value="moyen">🟡 Moyen</option>
                  <option value="difficile">🟠 Difficile</option>
                  <option value="extreme">🔴 Extrême</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durée (minutes)</label>
                <input type="number" min="1" value={form.duration_minutes}
                  onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date assignée</label>
                <input type="date" value={form.assigned_date}
                  onChange={(e) => setForm({ ...form, assigned_date: e.target.value })}
                  className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input type="text" value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={inputClass} placeholder="Notes supplémentaires" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClass} rows="2" />
              </div>
            </div>

            {/* Exercices */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">💪 Exercices</h3>
                <button type="button" onClick={addExercise}
                  className="text-sm bg-green-50 text-green-600 px-3 py-1 rounded-lg hover:bg-green-100 transition">
                  + Ajouter un exercice
                </button>
              </div>
              <div className="space-y-3">
                {form.exercises.map((ex, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2 bg-gray-50 p-3 rounded-lg">
                    <input type="text" placeholder="Nom de l'exercice"
                      value={ex.name}
                      onChange={(e) => updateExercise(index, 'name', e.target.value)}
                      className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <input type="text" placeholder="Séries"
                      value={ex.sets}
                      onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <input type="text" placeholder="Reps"
                      value={ex.reps}
                      onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <button type="button" onClick={() => removeExercise(index)}
                      className="text-red-400 hover:text-red-600 text-center">🗑️</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                label="Photo du workout"
              />
            </div>

            <button type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2 rounded-lg transition">
              {editWorkout ? 'Sauvegarder' : 'Enregistrer'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : workouts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <div className="text-5xl mb-4">🏋️</div>
          <p className="text-gray-500">Aucun workout assigné.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout) => (
            <div key={workout.id} className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
                {workout.image && (<img src={workout.image} alt={workout.title}className="w-full h-40 object-cover rounded-lg mb-3" />)}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColors[workout.difficulty]}`}>
                  {workout.difficulty}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(workout)}
                    className="text-blue-400 hover:text-blue-600 text-lg">✏️</button>
                  <button onClick={() => handleDelete(workout.id)}
                    className="text-red-400 hover:text-red-600 text-lg">🗑️</button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-1">{workout.title}</h3>
              <p className="text-sm text-gray-500 mb-3">
                👤 {workout.player?.name || '—'}
              </p>
              <div className="space-y-1 text-sm text-gray-600 mb-3">
                <p>⏱️ {workout.duration_minutes} minutes</p>
                <p>📅 {new Date(workout.assigned_date).toLocaleDateString('fr-FR')}</p>
                <p>{workout.completed ? '✅ Complété' : '⏳ En attente'}</p>
              </div>
              {workout.exercises && workout.exercises.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">EXERCICES ({workout.exercises.length})</p>
                  {workout.exercises.slice(0, 3).map((ex, i) => (
                    <p key={i} className="text-xs text-gray-600">• {ex.name} {ex.sets && `— ${ex.sets} séries`} {ex.reps && `x ${ex.reps}`}</p>
                  ))}
                  {workout.exercises.length > 3 && (
                    <p className="text-xs text-gray-400">+{workout.exercises.length - 3} autres...</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}