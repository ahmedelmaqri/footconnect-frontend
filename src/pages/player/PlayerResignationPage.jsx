import { useState, useEffect } from 'react'
import { resignationService } from '../../services/playerService'
import api from '../../services/api'

export default function PlayerResignationPage() {
  const [resignations, setResignations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [form, setForm] = useState({
    reason: '', requested_date: '', desired_leave_date: ''
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { fetchMe() }, [])

  const fetchMe = async () => {
    try {
      const res = await api.get('/me')
      setCurrentUser(res.data)
      fetchResignations(res.data.id)
    } catch (err) {
      setLoading(false)
    }
  }

  const fetchResignations = async (playerId) => {
    try {
      const res = await resignationService.getAll({ player_id: playerId })
      setResignations(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const hasPending = resignations.some(r => r.status === 'pending')
    if (hasPending) {
      setError('Vous avez déjà une demande en attente.')
      return
    }

    try {
      await resignationService.create({
        ...form,
        player_id: currentUser.id,
        team_id: currentUser.team_id,
      })
      setSuccess('Demande envoyée ! L\'admin vous répondra bientôt.')
      setForm({ reason: '', requested_date: '', desired_leave_date: '' })
      setShowForm(false)
      fetchResignations(currentUser.id)
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError('Erreur lors de l\'envoi.')
    }
  }

  const statusColors = {
    pending:  'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }

  const statusLabels = {
    pending:  '⏳ En attente',
    approved: '✅ Approuvée',
    rejected: '❌ Refusée',
  }

  const hasPending = resignations.some(r => r.status === 'pending')

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Demande de Démission</h1>
        <p className="text-gray-500 mt-1">Soumettez une demande officielle à l'administration</p>
      </div>

      {success && <div className="bg-green-50 text-green-700 rounded-lg p-3 mb-4">{success}</div>}
      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4">{error}</div>}

      {/* Avertissement */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <p className="text-yellow-800 text-sm font-medium">⚠️ Important</p>
        <p className="text-yellow-700 text-sm mt-1">
          Une demande de démission est officielle et sera traitée par l'administration.
          Assurez-vous d'avoir bien réfléchi avant de soumettre.
        </p>
      </div>

      {/* Bouton nouvelle demande */}
      {!hasPending && (
        <button onClick={() => setShowForm(!showForm)}
          className="mb-6 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition">
          {showForm ? '✕ Annuler' : '📝 Soumettre une demande'}
        </button>
      )}

      {hasPending && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6">
          <p className="text-yellow-800 font-medium">⏳ Vous avez une demande en attente de traitement.</p>
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Nouvelle demande de démission</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📋 Motif de démission
              </label>
              <textarea value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="5"
                placeholder="Expliquez les raisons de votre démission..."
                required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📅 Date de la demande
                </label>
                <input type="date" value={form.requested_date}
                  onChange={(e) => setForm({ ...form, requested_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📅 Date de départ souhaitée
                </label>
                <input type="date" value={form.desired_leave_date}
                  onChange={(e) => setForm({ ...form, desired_leave_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>
            <button type="submit"
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-2 rounded-lg transition">
              Envoyer la demande
            </button>
          </form>
        </div>
      )}

      {/* Historique */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : resignations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-500">Aucune demande soumise.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Historique des demandes</h2>
          {resignations.map((r) => (
            <div key={r.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-gray-800">
                  📅 Demande du {new Date(r.requested_date).toLocaleDateString('fr-FR')}
                </p>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[r.status]}`}>
                  {statusLabels[r.status]}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <p className="text-sm text-gray-600 font-medium mb-1">Motif :</p>
                <p className="text-gray-800 text-sm">{r.reason}</p>
              </div>
              {r.desired_leave_date && (
                <p className="text-sm text-gray-600 mb-3">
                  📅 Départ souhaité : {new Date(r.desired_leave_date).toLocaleDateString('fr-FR')}
                </p>
              )}
              {r.admin_response && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-700 mb-1">💬 Réponse de l'admin :</p>
                  <p className="text-blue-800 text-sm">{r.admin_response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}