import { useState, useEffect } from 'react'
import { healthService } from '../../services/playerService'
import api from '../../services/api'

export default function PlayerHealthPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMe() }, [])

  const fetchMe = async () => {
    try {
      const res = await api.get('/me')
      fetchRecords(res.data.id)
    } catch (err) {
      setLoading(false)
    }
  }

  const fetchRecords = async (playerId) => {
    try {
      const res = await healthService.getAll({ player_id: playerId })
      setRecords(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fitnessColors = {
    excellent: 'bg-green-100 text-green-700',
    bon:       'bg-blue-100 text-blue-700',
    moyen:     'bg-yellow-100 text-yellow-700',
    faible:    'bg-red-100 text-red-700',
  }

  const injuryColors = {
    aucune:  'bg-green-100 text-green-700',
    legere:  'bg-yellow-100 text-yellow-700',
    moderee: 'bg-orange-100 text-orange-700',
    grave:   'bg-red-100 text-red-700',
  }

  const latest = records[0]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Ma Santé</h1>
        <p className="text-gray-500 mt-1">Suivi de votre condition physique</p>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <div className="text-6xl mb-4">🏥</div>
          <h2 className="text-xl font-semibold text-gray-700">Aucun dossier santé</h2>
          <p className="text-gray-400 mt-2">Vos données de santé apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Dernière mise à jour */}
          {latest && (
            <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-2xl p-6 text-white">
              <p className="text-green-100 text-sm mb-2">Dernière mise à jour — {new Date(latest.date).toLocaleDateString('fr-FR')}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {latest.weight && (
                  <div className="bg-white bg-opacity-20 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold">{latest.weight}</div>
                    <div className="text-green-100 text-xs">kg</div>
                  </div>
                )}
                {latest.height && (
                  <div className="bg-white bg-opacity-20 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold">{latest.height}</div>
                    <div className="text-green-100 text-xs">cm</div>
                  </div>
                )}
                {latest.heart_rate && (
                  <div className="bg-white bg-opacity-20 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold">{latest.heart_rate}</div>
                    <div className="text-green-100 text-xs">bpm</div>
                  </div>
                )}
                {latest.blood_pressure_sys && (
                  <div className="bg-white bg-opacity-20 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold">{latest.blood_pressure_sys}/{latest.blood_pressure_dia}</div>
                    <div className="text-green-100 text-xs">tension</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Historique */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 Historique</h2>
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-gray-800">
                      📅 {new Date(record.date).toLocaleDateString('fr-FR')}
                    </p>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${fitnessColors[record.fitness_level]}`}>
                        {record.fitness_level}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${injuryColors[record.injury_status]}`}>
                        {record.injury_status === 'aucune' ? '✅ Sain' : `🤕 ${record.injury_status}`}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                    {record.weight && <p>⚖️ {record.weight} kg</p>}
                    {record.height && <p>📏 {record.height} cm</p>}
                    {record.heart_rate && <p>❤️ {record.heart_rate} bpm</p>}
                    {record.blood_pressure_sys && <p>🩺 {record.blood_pressure_sys}/{record.blood_pressure_dia}</p>}
                  </div>
                  {record.injury_description && (
                    <p className="text-xs text-red-500 mt-2">⚠️ {record.injury_description}</p>
                  )}
                  {record.notes && (
                    <p className="text-xs text-gray-500 mt-1">📋 {record.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}