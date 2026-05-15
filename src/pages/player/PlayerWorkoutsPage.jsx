import { useState, useEffect } from 'react'
import { workoutService } from '../../services/playerService'
import api from '../../services/api'

export default function PlayerWorkoutsPage() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMe() }, [])

  const fetchMe = async () => {
    try {
      const res = await api.get('/me')
      fetchWorkouts(res.data.id)
    } catch (err) {
      setLoading(false)
    }
  }

  const fetchWorkouts = async (playerId) => {
    try {
      const res = await workoutService.getAll({ player_id: playerId })
      setWorkouts(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const difficultyColors = {
    facile:    'bg-green-100 text-green-700',
    moyen:     'bg-yellow-100 text-yellow-700',
    difficile: 'bg-orange-100 text-orange-700',
    extreme:   'bg-red-100 text-red-700',
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mes Workouts</h1>
        <p className="text-gray-500 mt-1">{workouts.length} workout(s) assigné(s)</p>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : workouts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <div className="text-6xl mb-4">🏋️</div>
          <h2 className="text-xl font-semibold text-gray-700">Aucun workout assigné</h2>
          <p className="text-gray-400 mt-2">Vos workouts apparaîtront ici.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout) => (
            <div key={workout.id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-md transition">
              {workout.image && (
                <img src={workout.image} alt={workout.title}
                  className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColors[workout.difficulty]}`}>
                    {workout.difficulty}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${workout.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {workout.completed ? '✅ Complété' : '⏳ En attente'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 text-lg mb-2">{workout.title}</h3>
                {workout.description && (
                  <p className="text-gray-500 text-sm mb-3">{workout.description}</p>
                )}
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <p>⏱️ {workout.duration_minutes} minutes</p>
                  <p>📅 {new Date(workout.assigned_date).toLocaleDateString('fr-FR')}</p>
                </div>
                {workout.exercises && workout.exercises.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">EXERCICES</p>
                    {workout.exercises.map((ex, i) => (
                      <p key={i} className="text-xs text-gray-600">
                        • {ex.name} {ex.sets && `— ${ex.sets} séries`} {ex.reps && `x ${ex.reps}`}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}