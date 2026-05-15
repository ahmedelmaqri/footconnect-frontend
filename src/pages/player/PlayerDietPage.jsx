import { useState, useEffect } from 'react'
import { dietService } from '../../services/playerService'
import api from '../../services/api'

export default function PlayerDietPage() {
  const [diets, setDiets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMe() }, [])

  const fetchMe = async () => {
    try {
      const res = await api.get('/me')
      fetchDiets(res.data.id)
    } catch (err) {
      setLoading(false)
    }
  }

  const fetchDiets = async (playerId) => {
    try {
      const res = await dietService.getAll({ player_id: playerId })
      setDiets(res.data.filter(d => d.active))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mon Régime Alimentaire</h1>
        <p className="text-gray-500 mt-1">{diets.length} régime(s) actif(s)</p>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : diets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <div className="text-6xl mb-4">🥗</div>
          <h2 className="text-xl font-semibold text-gray-700">Aucun régime actif</h2>
          <p className="text-gray-400 mt-2">Votre régime apparaîtra ici.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {diets.map((diet) => (
            <div key={diet.id} className="bg-white rounded-xl shadow overflow-hidden">
              {diet.image && (
                <img src={diet.image} alt={diet.title}
                  className="w-full h-56 object-cover" />
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{diet.title}</h2>
                  <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-medium">
                    🔥 {diet.calories_target} kcal/jour
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Petit déjeuner */}
                  <div className="bg-orange-50 rounded-xl p-4">
                    <h3 className="font-semibold text-orange-700 mb-3">🌅 Petit-déjeuner</h3>
                    <ul className="space-y-1">
                      {diet.breakfast?.map((item, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-1">
                          <span className="text-orange-400 mt-0.5">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Déjeuner */}
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <h3 className="font-semibold text-yellow-700 mb-3">☀️ Déjeuner</h3>
                    <ul className="space-y-1">
                      {diet.lunch?.map((item, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-1">
                          <span className="text-yellow-400 mt-0.5">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dîner */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-700 mb-3">🌙 Dîner</h3>
                    <ul className="space-y-1">
                      {diet.dinner?.map((item, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-1">
                          <span className="text-blue-400 mt-0.5">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Collations */}
                  {diet.snacks && diet.snacks.length > 0 && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <h3 className="font-semibold text-green-700 mb-3">🍎 Collations</h3>
                      <ul className="space-y-1">
                        {diet.snacks.map((item, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-1">
                            <span className="text-green-400 mt-0.5">•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {diet.notes && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">📋 {diet.notes}</p>
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