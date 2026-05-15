import { useState, useEffect } from 'react'
import { postService } from '../../services/playerService'

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchPosts() }, [filter])

  const fetchPosts = async () => {
    try {
      const res = await postService.getAll({ status: filter })
      setPosts(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    await postService.approve(id)
    setSuccess('Post approuvé !')
    fetchPosts()
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleReject = async (id) => {
    await postService.reject(id)
    setSuccess('Post refusé !')
    fetchPosts()
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce post ?')) return
    await postService.delete(id)
    fetchPosts()
  }

  const statusColors = {
    pending:  'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }

  const statusLabels = {
    pending:  '⏳ En attente',
    approved: '✅ Approuvé',
    rejected: '❌ Refusé',
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Blog Équipe</h1>
          <p className="text-gray-500 mt-1">Gestion des posts des joueurs</p>
        </div>
      </div>

      {success && <div className="bg-green-50 text-green-700 rounded-lg p-3 mb-4">{success}</div>}

      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              filter === s ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
            }`}>
            {statusLabels[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-500">Aucun post {statusLabels[filter].toLowerCase()}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{post.player?.name || '—'}</p>
                    <p className="text-xs text-gray-400">
                      {post.team?.name && `🏟️ ${post.team.name} · `}
                      {new Date(post.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[post.status]}`}>
                  {statusLabels[post.status]}
                </span>
              </div>

              <h3 className="font-bold text-gray-800 text-lg mb-2">{post.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{post.content}</p>

              {/* Actions */}
              <div className="flex gap-3 mt-4 pt-4 border-t">
                {post.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(post.id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                      ✅ Approuver
                    </button>
                    <button onClick={() => handleReject(post.id)}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                      ❌ Refuser
                    </button>
                  </>
                )}
                {post.status === 'approved' && (
                  <button onClick={() => handleReject(post.id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                    ❌ Retirer
                  </button>
                )}
                {post.status === 'rejected' && (
                  <button onClick={() => handleApprove(post.id)}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                    ✅ Approuver quand même
                  </button>
                )}
                <button onClick={() => handleDelete(post.id)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold px-4 py-2 rounded-lg transition ml-auto">
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}