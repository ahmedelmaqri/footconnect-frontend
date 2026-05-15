import { useState, useEffect } from 'react'
import api from '../../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

export default function AdminDashboardPage() {
  const [data, setData] = useState({
    players: 0, teams: 0, matches: 0,
    goals: 0, assists: 0,
    topScorers: [], positionStats: [],
    matchStatus: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const [playersRes, teamsRes, matchesRes, statsRes] = await Promise.all([
        api.get('/players'),
        api.get('/teams'),
        api.get('/matches'),
        api.get('/stats'),
      ])

      const players = (playersRes.data.data || playersRes.data).filter(p => p.role !== 'admin')
      const teams   = teamsRes.data.data || teamsRes.data
      const matches = matchesRes.data.data || matchesRes.data
      const stats   = statsRes.data.data || statsRes.data

      // Top scorers
      const playerMap = {}
      players.forEach(p => { playerMap[p.id] = p.name })

      const scorerMap = {}
      stats.forEach(s => {
        if (!scorerMap[s.player_id]) scorerMap[s.player_id] = { name: playerMap[s.player_id] || '—', goals: 0, assists: 0 }
        scorerMap[s.player_id].goals   += s.goals || 0
        scorerMap[s.player_id].assists += s.assists || 0
      })

      const topScorers = Object.values(scorerMap)
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 8)

      // Stats par position
      const posMap = {}
      players.forEach(p => {
        const pos = p.position || 'Inconnu'
        posMap[pos] = (posMap[pos] || 0) + 1
      })
      const positionStats = Object.entries(posMap).map(([name, value]) => ({ name, value }))

      // Status matchs
      const statusMap = { scheduled: 0, live: 0, finished: 0 }
      matches.forEach(m => { statusMap[m.status] = (statusMap[m.status] || 0) + 1 })
      const matchStatus = [
        { name: 'Programmés', value: statusMap.scheduled },
        { name: 'En direct', value: statusMap.live },
        { name: 'Terminés', value: statusMap.finished },
      ]

      setData({
        players: players.length,
        teams: teams.length,
        matches: matches.length,
        goals: stats.reduce((acc, s) => acc + (s.goals || 0), 0),
        assists: stats.reduce((acc, s) => acc + (s.assists || 0), 0),
        topScorers,
        positionStats,
        matchStatus,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed']

  const cards = [
    { label: 'Joueurs',          value: data.players,  icon: '👤', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Équipes',          value: data.teams,    icon: '🏟️', color: 'bg-green-50 text-green-700 border-green-200' },
    { label: 'Matchs',           value: data.matches,  icon: '🏆', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { label: 'Buts totaux',      value: data.goals,    icon: '⚽', color: 'bg-red-50 text-red-700 border-red-200' },
    { label: 'Passes décisives', value: data.assists,  icon: '🎯', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-full py-32">
      <div className="text-gray-400 text-xl">Chargement...</div>
    </div>
  )

  return (
    <div className="p-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
        <p className="text-gray-500 mt-1">Vue d'ensemble de FootConnect</p>
      </div>

      {/* Cartes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-xl border p-5 ${card.color}`}>
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="text-3xl font-bold">{card.value}</div>
            <div className="text-sm font-medium mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Buteurs */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">⚽ Top Buteurs</h2>
          {data.topScorers.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucune donnée</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.topScorers} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="goals" name="Buts" fill="#16a34a" radius={[0, 4, 4, 0]} />
                <Bar dataKey="assists" name="Passes" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Positions */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">👥 Joueurs par position</h2>
          {data.positionStats.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucune donnée</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.positionStats} cx="50%" cy="50%"
                  outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {data.positionStats.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Matchs */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🏆 Status des matchs</h2>
          {data.matchStatus.every(m => m.value === 0) ? (
            <p className="text-gray-400 text-center py-8">Aucun match</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.matchStatus}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" name="Matchs" radius={[4, 4, 0, 0]}>
                  {data.matchStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Résumé rapide */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 Résumé rapide</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Moyenne buts/joueur</span>
              <span className="font-bold text-green-600">
                {data.players > 0 ? (data.goals / data.players).toFixed(2) : 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Moyenne passes/joueur</span>
              <span className="font-bold text-blue-600">
                {data.players > 0 ? (data.assists / data.players).toFixed(2) : 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Joueurs par équipe</span>
              <span className="font-bold text-yellow-600">
                {data.teams > 0 ? (data.players / data.teams).toFixed(1) : 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Matchs terminés</span>
              <span className="font-bold text-gray-600">
                {data.matchStatus.find(m => m.name === 'Terminés')?.value || 0}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}