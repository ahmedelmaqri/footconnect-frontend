import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    fetchMe()
  }, [])

  const fetchMe = async () => {
    try {
      const res = await api.get('/me')
      setCurrentUser(res.data)
      fetchStats(res.data.id)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const fetchStats = async (playerId) => {
    try {
      const res = await api.get(`/players/${playerId}/stats`)
      setStats(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const positions = {
    'Gardien': '🧤', 'Défenseur': '🛡️',
    'Milieu': '⚙️', 'Attaquant': '⚡'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full py-32">
      <div className="text-gray-400 text-xl">Chargement...</div>
    </div>
  )

  const agg = stats?.aggregated
  const detail = stats?.detail || []

  const radarData = agg ? [
    { subject: 'Buts',        value: Math.min(agg.total_goals * 10, 100) },
    { subject: 'Passes',      value: Math.min(agg.total_assists * 10, 100) },
    { subject: 'Distance',    value: Math.min(agg.total_distance, 100) },
    { subject: 'Note',        value: Math.min(agg.avg_rating * 10, 100) },
    { subject: 'Matchs',      value: Math.min(agg.matches_played * 5, 100) },
    { subject: 'Minutes',     value: Math.min(agg.total_minutes / 10, 100) },
  ] : []

  const barData = detail.slice(-8).map((s, i) => ({
    name: `M${i + 1}`,
    Buts: s.goals || 0,
    Passes: s.assists || 0,
    Note: s.rating || 0,
  }))

  return (
    <div className="p-8 space-y-8">

      {/* Profil joueur */}
      <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl">
            {positions[currentUser?.position] || '👤'}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{currentUser?.name}</h1>
            <p className="text-green-100 mt-1">{currentUser?.position || 'Position non définie'}</p>
            {currentUser?.nationality && (
              <p className="text-green-100 text-sm mt-1">🌍 {currentUser.nationality}</p>
            )}
          </div>
          <div className="ml-auto text-right">
            <div className="text-4xl font-bold">{agg?.avg_rating?.toFixed(1) || '—'}</div>
            <div className="text-green-100 text-sm">Note moyenne</div>
          </div>
        </div>
      </div>

      {/* Cartes stats */}
      {agg ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Matchs', value: agg.matches_played, icon: '🏆', color: 'bg-blue-50 text-blue-700' },
              { label: 'Buts', value: agg.total_goals, icon: '⚽', color: 'bg-green-50 text-green-700' },
              { label: 'Passes déc.', value: agg.total_assists, icon: '🎯', color: 'bg-yellow-50 text-yellow-700' },
              { label: 'Minutes', value: agg.total_minutes + "'", icon: '⏱️', color: 'bg-purple-50 text-purple-700' },
              { label: 'Distance', value: agg.total_distance + ' km', icon: '🏃', color: 'bg-red-50 text-red-700' },
              { label: 'Note moy.', value: agg.avg_rating?.toFixed(1) + '/10', icon: '⭐', color: 'bg-orange-50 text-orange-700' },
            ].map((card) => (
              <div key={card.label} className={`rounded-xl p-4 ${card.color} border border-opacity-20`}>
                <div className="text-2xl mb-1">{card.icon}</div>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="text-xs font-medium mt-1">{card.label}</div>
              </div>
            ))}
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Radar */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">🎯 Profil de performance</h2>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <Radar name="Stats" dataKey="value" stroke="#16a34a" fill="#16a34a" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Buts par match */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">📈 Buts & Passes par match</h2>
              {barData.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Aucune donnée</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="Buts" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Passes" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Historique matchs */}
          {detail.length > 0 && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 Historique des performances</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Saison</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">⚽ Buts</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">🎯 Passes</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">⏱️ Min</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">🏃 Km</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">⭐ Note</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">Cartons</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {detail.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{s.season}</td>
                        <td className="px-4 py-3 text-center font-semibold text-green-600">{s.goals}</td>
                        <td className="px-4 py-3 text-center font-semibold text-blue-600">{s.assists}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{s.minutes_played}'</td>
                        <td className="px-4 py-3 text-center text-gray-600">{s.distance_km}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                            {s.rating}/10
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {s.yellow_cards > 0 && <span className="mr-1">🟨{s.yellow_cards}</span>}
                          {s.red_cards > 0 && <span>🟥{s.red_cards}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-700">Aucune statistique disponible</h2>
          <p className="text-gray-400 mt-2">Vos statistiques apparaîtront ici après chaque match.</p>
        </div>
      )}
    </div>
  )
}