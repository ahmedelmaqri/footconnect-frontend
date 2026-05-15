import { useState, useEffect } from 'react'
import { resignationService } from '../../services/playerService'

export default function AdminResignationsPage() {
  const [resignations, setResignations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [responseModal, setResponseModal] = useState(null)
  const [adminResponse, setAdminResponse] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchResignations() }, [filter])

  const fetchResignations = async () => {
    try {
      const res = await resignationService.getAll({ status: filter })
      setResignations(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    await resignationService.approve(responseModal.id, { admin_response: adminResponse })
    setSuccess('Démission approuvée !')
    setResponseModal(null)
    setAdminResponse('')
    fetchResignations()
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleReject = async () => {
    await resignationService.reject(responseModal.id, { admin_response: adminResponse })
    setSuccess('Démission refusée !')
    setResponseModal(null)
    setAdminResponse('')
    fetchResignations()
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette demande ?')) return
    await resignationService.delete(id)
    fetchResignations()
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Demandes de Démission</h1>
          <p className="text-gray-500 mt-1">Gérez les demandes des joueurs</p>
        </div>
      </div>

      {success && <div className="bg-green-50 text-green-700 rounded-lg p-3 mb-4">{success}</div>}

      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              filter === s ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
            }`}>
            {statusLabels[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : resignations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-500">Aucune démission {statusLabels[filter].toLowerCase()}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resignations.map((r) => (
            <div key={r.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                    📝
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{r.player?.name || '—'}</p>
                    <p className="text-sm text-gray-500">
                      {r.team?.name && `🏟️ ${r.team.name} · `}
                      Demande du {new Date(r.requested_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[r.status]}`}>
                  {statusLabels[r.status]}
                </span>
              </div>

              {/* Raison */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-600 mb-1">📋 Motif de démission :</p>
                <p className="text-gray-800">{r.reason}</p>
              </div>

              {r.desired_leave_date && (
                <p className="text-sm text-gray-600 mb-3">
                  📅 Date de départ souhaitée : {new Date(r.desired_leave_date).toLocaleDateString('fr-FR')}
                </p>
              )}

              {/* Réponse admin */}
              {r.admin_response && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-blue-700 mb-1">💬 Réponse de l'admin :</p>
                  <p className="text-blue-800 text-sm">{r.admin_response}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {r.status === 'pending' && (
                  <>
                    <button onClick={() => setResponseModal(r)}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                      ✅ Approuver
                    </button>
                    <button onClick={() => setResponseModal({ ...r, forReject: true })}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                      ❌ Refuser
                    </button>
                  </>
                )}
                <button onClick={() => handleDelete(r.id)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold px-4 py-2 rounded-lg transition ml-auto">
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal réponse */}
      {responseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {responseModal.forReject ? '❌ Refuser la démission' : '✅ Approuver la démission'}
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Joueur : <strong>{responseModal.player?.name}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                💬 Message au joueur (optionnel)
              </label>
              <textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
                placeholder="Ex: Votre demande a été traitée..." />
            </div>
            <div className="flex gap-3">
              {responseModal.forReject ? (
                <button onClick={handleReject}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition">
                  ❌ Confirmer le refus
                </button>
              ) : (
                <button onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition">
                  ✅ Confirmer l'approbation
                </button>
              )}
              <button onClick={() => { setResponseModal(null); setAdminResponse('') }}
                className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2 rounded-lg hover:bg-gray-50 transition">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}