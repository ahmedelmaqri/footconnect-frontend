import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { orderService } from '../../services/shopService'

export default function ShopCheckoutPage() {
  const navigate = useNavigate()
  const { items, fetchCart, totalPrice, totalItems, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    shipping_address: '', shipping_city: '',
    shipping_country: '', shipping_phone: '',
    payment_method: 'cash_on_delivery', notes: '',
  })

  useEffect(() => { fetchCart() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await orderService.create(form)
      setSuccess(true)
      await clearCart()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
        <div className="text-8xl mb-6">🎉</div>
        <h1 className="text-3xl font-black text-gray-800 mb-4">Commande confirmée !</h1>
        <p className="text-gray-500 mb-8">
          Votre commande a été passée avec succès. Vous recevrez une confirmation bientôt.
        </p>
        <div className="flex gap-4">
          <button onClick={() => navigate('/shop/orders')}
            className="flex-1 bg-black text-white font-bold py-3 rounded-2xl hover:bg-gray-800 transition">
            Mes commandes
          </button>
          <button onClick={() => navigate('/shop')}
            className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-2xl hover:bg-gray-50 transition">
            Retour au shop
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-black text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/shop')} className="text-2xl font-black">⚽ FC SHOP</button>
          <button onClick={() => navigate('/shop/cart')}
            className="relative bg-white text-black px-4 py-2 rounded-xl font-semibold text-sm hover:bg-green-400 transition">
            🛒 Panier ({totalItems()})
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-black text-gray-800 mb-8">💳 Finaliser la commande</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Livraison */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-black text-gray-800 mb-4">📦 Adresse de livraison</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Adresse</label>
                  <input type="text" value={form.shipping_address}
                    onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="123 Rue du Sport" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Ville</label>
                    <input type="text" value={form.shipping_city}
                      onChange={(e) => setForm({ ...form, shipping_city: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Casablanca" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Pays</label>
                    <input type="text" value={form.shipping_country}
                      onChange={(e) => setForm({ ...form, shipping_country: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Maroc" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Téléphone</label>
                  <input type="tel" value={form.shipping_phone}
                    onChange={(e) => setForm({ ...form, shipping_phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="+212 6XX XXX XXX" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Notes</label>
                  <textarea value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="2" placeholder="Instructions spéciales..." />
                </div>
              </div>
            </div>

            {/* Paiement */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-black text-gray-800 mb-4">💳 Mode de paiement</h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                  form.payment_method === 'cash_on_delivery' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}>
                  <input type="radio" name="payment" value="cash_on_delivery"
                    checked={form.payment_method === 'cash_on_delivery'}
                    onChange={(e) => setForm({ ...form, payment_method: e.target.value })} />
                  <div>
                    <p className="font-bold text-gray-800">💵 Paiement à la livraison</p>
                    <p className="text-sm text-gray-500">Payez en espèces à la réception</p>
                  </div>
                </label>
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                  form.payment_method === 'stripe' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}>
                  <input type="radio" name="payment" value="stripe"
                    checked={form.payment_method === 'stripe'}
                    onChange={(e) => setForm({ ...form, payment_method: e.target.value })} />
                  <div>
                    <p className="font-bold text-gray-800">💳 Paiement en ligne (Stripe)</p>
                    <p className="text-sm text-gray-500">Carte bancaire sécurisée</p>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading || items.length === 0}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-black py-4 rounded-2xl transition text-xl">
              {loading ? 'Traitement...' : `✅ Confirmer la commande — ${(totalPrice() + (totalPrice() >= 50 ? 0 : 4.99)).toFixed(2)} €`}
            </button>
          </form>

          {/* Résumé commande */}
          <div className="bg-white rounded-2xl shadow p-6 h-fit sticky top-24">
            <h2 className="text-xl font-black text-gray-800 mb-4">📋 Résumé</h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm line-clamp-1">{item.product?.name}</p>
                    <p className="text-xs text-gray-400">Qté: {item.quantity}</p>
                    <p className="font-bold text-gray-800">
                      {((item.product?.sale_price || item.product?.price || 0) * item.quantity).toFixed(2)} €
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{totalPrice().toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span className="text-green-500">{totalPrice() >= 50 ? 'Gratuite' : '4.99 €'}</span>
              </div>
              <div className="flex justify-between font-black text-xl border-t pt-2">
                <span>Total</span>
                <span>{(totalPrice() + (totalPrice() >= 50 ? 0 : 4.99)).toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}