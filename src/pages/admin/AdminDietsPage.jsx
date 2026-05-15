import { useState, useEffect } from 'react'
import { dietService } from '../../services/playerService'
import api from '../../services/api'
import ImageUpload from '../../components/ui/ImageUpload'

export default function AdminDietsPage() {
  const [diets, setDiets] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editDiet, setEditDiet] = useState(null)
  const [form, setForm] = useState({
    player_id: '', title: '',
    breakfast: [''], lunch: [''], dinner: [''], snacks: [''],
    calories_target: 3000, notes: '', image: '',
    start_date: '', end_date: '', active: true,
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [dRes, pRes] = await Promise.all([
        dietService.getAll(),
        api.get('/players'),
      ])
      setDiets(dRes.data)
      setPlayers((pRes.data.data || pRes.data).filter(p => p.role !== 'admin'))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateMeal = (meal, index, value) => {
    const updated = [...form[meal]]
    updated[index] = value
    setForm({ ...form, [meal]: updated })
  }

  const addMealItem = (meal) => {
    setForm({ ...form, [meal]: [...form[meal], ''] })
  }

  const removeMealItem = (meal, index) => {
    setForm({ ...form, [meal]: form[meal].filter((_, i) => i !== index) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editDiet) {
        await dietService.update(editDiet.id, form)
        setSuccess('Régime modifié !')
      } else {
        await dietService.create(form)
        setSuccess('Régime ajouté !')
      }
      setForm({ player_id: '', title: '', breakfast: [''], lunch: [''], dinner: [''], snacks: [''], calories_target: 3000, notes: '', start_date: '', end_date: '', active: true })
      setShowForm(false)
      setEditDiet(null)
      fetchAll()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erreur lors de l\'enregistrement.')
    }
  }

  const handleEdit = (diet) => {
    setEditDiet(diet)
    setForm({
      player_id: diet.player_id || '',
      title: diet.title || '',
      breakfast: diet.breakfast || [''],
      lunch: diet.lunch || [''],
      dinner: diet.dinner || [''],
      snacks: diet.snacks || [''],
      calories_target: diet.calories_target || 3000,
      notes: diet.notes || '',
      start_date: diet.start_date || '',
      end_date: diet.end_date || '',
      active: diet.active ?? true,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce régime ?')) return
    await dietService.delete(id)
    fetchAll()
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"

  const MealSection = ({ label, icon, meal }) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">{icon} {label}</label>
        <button type="button" onClick={() => addMealItem(meal)}
          className="text-xs text-green-600 hover:text-green-700">+ Ajouter</button>
      </div>
      {form[meal].map((item, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input type="text" value={item}
            onChange={(e) => updateMeal(meal, i, e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder={`Ex: ${label} item...`} />
          {form[meal].length > 1 && (
            <button type="button" onClick={() => removeMealItem(meal, i)}
              className="text-red-400 hover:text-red-600">🗑️</button>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Régimes Alimentaires</h1>
          <p className="text-gray-500 mt-1">{diets.length} régime(s)</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditDiet(null) }}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition">
          {showForm ? '✕ Annuler' : '+ Ajouter un régime'}
        </button>
      </div>

      {success && <div className="bg-green-50 text-green-700 rounded-lg p-3 mb-4">{success}</div>}
      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {editDiet ? 'Modifier le régime' : 'Nouveau régime'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre du régime</label>
                <input type="text" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClass} required placeholder="Ex: Régime haute performance" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">🔥 Calories/jour</label>
                <input type="number" value={form.calories_target}
                  onChange={(e) => setForm({ ...form, calories_target: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                <input type="date" value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                <input type="date" value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className={inputClass} />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 accent-green-600" />
                <label className="text-sm text-gray-700">Régime actif</label>
              </div>
            </div>

            {/* Repas */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">🍽️ Plan des repas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MealSection label="Petit-déjeuner" icon="🌅" meal="breakfast" />
                <MealSection label="Déjeuner" icon="☀️" meal="lunch" />
                <MealSection label="Dîner" icon="🌙" meal="dinner" />
                <MealSection label="Collations" icon="🍎" meal="snacks" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className={inputClass} rows="2"
                placeholder="Instructions spéciales, allergies..." />
            </div>
            <div>
              <ImageUpload
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                label="Photo du régime"
              />
            </div>
            <button type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2 rounded-lg transition">
              {editDiet ? 'Sauvegarder' : 'Enregistrer'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : diets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <div className="text-5xl mb-4">🥗</div>
          <p className="text-gray-500">Aucun régime enregistré.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diets.map((diet) => (
            <div key={diet.id} className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
              {diet.image && (<img src={diet.image} alt={diet.title}className="w-full h-40 object-cover rounded-lg mb-3" />)}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${diet.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {diet.active ? '✅ Actif' : '⏸️ Inactif'}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(diet)}
                    className="text-blue-400 hover:text-blue-600 text-lg">✏️</button>
                  <button onClick={() => handleDelete(diet.id)}
                    className="text-red-400 hover:text-red-600 text-lg">🗑️</button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-1">{diet.title}</h3>
              <p className="text-sm text-gray-500 mb-3">👤 {diet.player?.name || '—'}</p>
              <div className="space-y-1 text-sm text-gray-600 mb-3">
                <p>🔥 {diet.calories_target} kcal/jour</p>
                <p>📅 Depuis {new Date(diet.start_date).toLocaleDateString('fr-FR')}</p>
                {diet.end_date && <p>📅 Jusqu'au {new Date(diet.end_date).toLocaleDateString('fr-FR')}</p>}
              </div>
              <div className="border-t pt-3 space-y-1">
                {diet.breakfast?.length > 0 && <p className="text-xs text-gray-500">🌅 {diet.breakfast.slice(0, 2).join(', ')}</p>}
                {diet.lunch?.length > 0 && <p className="text-xs text-gray-500">☀️ {diet.lunch.slice(0, 2).join(', ')}</p>}
                {diet.dinner?.length > 0 && <p className="text-xs text-gray-500">🌙 {diet.dinner.slice(0, 2).join(', ')}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}