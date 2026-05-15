import { useState, useEffect } from 'react'
import { vendorService } from '../../services/shopService'

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchVendors() }, [filter])

  const fetchVendors = async () => {
    try {
      const res = await vendorService.getAll()
      const filtered = res.data.filter(v => v.status === filter)
      setVendors(filtered)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    await vendorService.approve(id)
    setSuccess('Vendeur approuvé !')
    fetchVendors()
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleReject = async (id) => {
    await vendorService.reject(id)
    setSuccess('Vendeur refusé !')
    fetchVendors()
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce vendeur ?')) return
    await vendorService.delete(id)
    fetchVendors()
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
          <h1 className="text-3xl font-bold text-gray-800">Vendeurs</h1>
          <p className="text-gray-500 mt-1">Gérez les demandes des vendeurs</p>
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
      ) : vendors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <div className="text-5xl mb-4">🏪</div>
          <p className="text-gray-500">Aucun vendeur {statusLabels[filter].toLowerCase()}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {vendor.logo ? (
                    <img src={vendor.logo} alt={vendor.shop_name}
                      className="w-16 h-16 rounded-xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-3xl">
                      🏪
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-800 text-xl">{vendor.shop_name}</h3>
                    <p className="text-sm text-gray-500">
                      👤 {vendor.user?.name} · 📧 {vendor.user?.email}
                    </p>
                    {vendor.phone && <p className="text-sm text-gray-500">📞 {vendor.phone}</p>}
                    {vendor.address && <p className="text-sm text-gray-500">📍 {vendor.address}</p>}
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[vendor.status]}`}>
                  {statusLabels[vendor.status]}
                </span>
              </div>

              {vendor.description && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600">{vendor.description}</p>
                </div>
              )}

              {vendor.banner && (
                <img src={vendor.banner} alt="bannière"
                  className="w-full h-32 object-cover rounded-lg mb-4" />
              )}

              <div className="flex gap-3 pt-4 border-t">
                {vendor.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(vendor.id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition">
                      ✅ Approuver
                    </button>
                    <button onClick={() => handleReject(vendor.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition">
                      ❌ Refuser
                    </button>
                  </>
                )}
                {vendor.status === 'approved' && (
                  <button onClick={() => handleReject(vendor.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition">
                    ❌ Révoquer
                  </button>
                )}
                {vendor.status === 'rejected' && (
                  <button onClick={() => handleApprove(vendor.id)}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition">
                    ✅ Approuver quand même
                  </button>
                )}
                <button onClick={() => handleDelete(vendor.id)}
                  className="ml-auto bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold px-4 py-2 rounded-lg transition">
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