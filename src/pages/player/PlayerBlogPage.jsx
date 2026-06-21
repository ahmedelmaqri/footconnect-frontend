import { useState, useEffect } from 'react'
import { postService } from '../../services/playerService'
import api from '../../services/api'

export default function PlayerBlogPage() {
  const [posts, setPosts] = useState([])
  const [myPosts, setMyPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [form, setForm] = useState({ title: '', content: '' })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState('all')

  useEffect(() => { fetchMe() }, [])
 
  const fetchMe = async () => {
    try {
      const res = await api.get('/me')
      setCurrentUser(res.data)
      fetchPosts(res.data)
    } catch (err) {
      setLoading(false)
    }
  }

  const fetchPosts = async (user) => {
    try {
      const [allRes, myRes] = await Promise.all([
        postService.getAll({ status: 'approved', team_id: user.team_id }),
        postService.getAll({ player_id: user.id }),
      ])
      setPosts(allRes.data)
      setMyPosts(myRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await postService.create({
        ...form,
        player_id: currentUser.id,
        team_id: currentUser.team_id,
      })
      setSuccess('Post soumis ! En attente d\'approbation par l\'admin.')
      setForm({ title: '', content: '' })
      setShowForm(false)
      fetchPosts(currentUser)
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError('Erreur lors de la soumission.')
    }
  }

  const statusColors = {
    pending:  'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }

  const statusLabels = {
    pending:  '⏳ En attente',
    approved: '✅ Publié',
    rejected: '❌ Refusé',
  }

  const displayedPosts = tab === 'all' ? posts : myPosts

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Blog Équipe</h1>
          <p className="text-gray-500 mt-1">Partagez avec vos coéquipiers</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition">
          {showForm ? '✕ Annuler' : '✏️ Écrire un post'}
        </button>
      </div>

      {success && <div className="bg-green-50 text-green-700 rounded-lg p-3 mb-4">{success}</div>}
      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4">{error}</div>}

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Nouveau post</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input type="text" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Titre de votre post" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
              <textarea value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="5" placeholder="Écrivez votre message..." required />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition">
                Publier
              </button>
              <p className="text-xs text-gray-400">
                ⚠️ Votre post sera visible après approbation de l'admin.
              </p>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
            tab === 'all' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
          }`}>
          📰 Blog équipe ({posts.length})
        </button>
        <button onClick={() => setTab('mine')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
            tab === 'mine' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
          }`}>
          👤 Mes posts ({myPosts.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : displayedPosts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-semibold text-gray-700">Aucun post</h2>
          <p className="text-gray-400 mt-2">Soyez le premier à écrire !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{post.player?.name || '—'}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(post.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                {tab === 'mine' && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[post.status]}`}>
                    {statusLabels[post.status]}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{post.title}</h3>
              <p className="text-gray-600 leading-relaxed">{post.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}