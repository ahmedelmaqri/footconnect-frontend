import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderService } from '../../services/shopService'

export default function ShopOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try {
      const res = await orderService.getAll()
      setOrders(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    pending:   'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped:   'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  const statusLabels = {
    pending:   '⏳ En attente',
    confirmed: '✅ Confirmée',
    shipped:   '🚚 Expédiée',
    delivered: '📦 Livrée',
    cancelled: '❌ Annulée',
  }

  const paymentLabels = {
    cash_on_delivery: '💵 Livraison',
    stripe:           '💳 Stripe',
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-black text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/shop')} className="text-2xl font-black">⚽ FC SHOP</button>
          <div className="hidden md:flex gap-6 text-sm font-medium">
            <button onClick={() => navigate('/shop')} className="hover:text-green-400 transition">Accueil</button>
            <button onClick={() => navigate('/shop/catalogue')} className="hover:text-green-400 transition">Catalogue</button>
            <button className="text-green-400 font-bold">Mes commandes</button>
          </div>
          <button onClick={() => navigate('/shop/cart')}
            className="bg-white text-black px-4 py-2 rounded-xl font-semibold text-sm hover:bg-green-400 transition">
            🛒 Panier
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-black text-gray-800 mb-8">📦 Mes Commandes</h1>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Chargement...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-2xl shadow">
            <div className="text-8xl mb-6">📦</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Aucune commande</h2>
            <p className="text-gray-400 mb-8">Vous n'avez pas encore passé de commande.</p>
            <button onClick={() => navigate('/shop/catalogue')}
              className="bg-black text-white font-bold px-10 py-4 rounded-2xl hover:bg-gray-800 transition">
              Commencer mes achats →
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow overflow-hidden">

                {/* Header commande */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b">
                  <div>
                    <p className="font-black text-gray-800">#{order.order_number}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-semibold">
                      {paymentLabels[order.payment_method]}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                          {item.product?.images?.[0] ? (
                            <img src={item.product.images[0]} alt=""
                              className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{item.product?.name}</p>
                          <p className="text-sm text-gray-500">
                            Qté: {item.quantity}
                            {item.size && ` · Taille: ${item.size}`}
                            {item.color && ` · Couleur: ${item.color}`}
                          </p>
                        </div>
                        <p className="font-bold text-gray-800">
                          {(item.price * item.quantity).toFixed(2)} €
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="border-t pt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <p>📍 {order.shipping_address}, {order.shipping_city}</p>
                      <p>📞 {order.shipping_phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-2xl font-black text-gray-800">{order.total} €</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}