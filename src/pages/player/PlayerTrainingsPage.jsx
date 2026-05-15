import { useState, useEffect } from 'react'
import { trainingService } from '../../services/playerService'
import api from '../../services/api'

export default function PlayerTrainingsPage() {
  const [trainings, setTrainings] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    fetchMe()
  }, [])

  const fetchMe = async () => {
    try {
      const res = await api.get('/me')
      setCurrentUser(res.data)
      fetchTrainings(res.data.id, res.data.team_id)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const fetchTrainings = async (playerId, teamId) => {
    try {
      const res = await trainingService.getAll({ player_id: playerId })
      setTrainings(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    planifie: 'bg-blue-100 text-blue-700',
    en_cours: 'bg-yellow-100 text-yellow-700',
    termine:  'bg-green-100 text-green-700',
    annule:   'bg-red-100 text-red-700',
  }

  const typeIcons = {
    collectif: '👥', individuel: '👤',
    physique: '💪', tactique: '🧠', technique: '⚽'
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mes Entraînements</h1>
        <p className="text-gray-500 mt-1">{trainings.length} entraînement(s) planifié(s)</p>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : trainings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-xl font-semibold text-gray-700">Aucun entraînement planifié</h2>
          <p className="text-gray-400 mt-2">Vos entraînements apparaîtront ici.</p>
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
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-2">{training.title}</h3>
              {training.description && (
                <p className="text-gray-500 text-sm mb-3">{training.description}</p>
              )}
              <div className="space-y-1 text-sm text-gray-600">
                <p>📅 {new Date(training.date).toLocaleDateString('fr-FR')}</p>
                <p>⏰ {training.start_time} → {training.end_time}</p>
                {training.location && <p>📍 {training.location}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}