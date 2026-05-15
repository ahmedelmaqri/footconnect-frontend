import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'

export default function ShopCartPage() {
  const navigate = useNavigate()
  const { items, loading, fetchCart, updateQuantity, removeItem, clearCart, totalPrice, totalItems } = useCartStore()

  useEffect(() => { fetchCart() }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-400 text-xl">Chargement...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-black text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/shop')} className="text-2xl font-black">⚽ FC SHOP</button>
          <div className="hidden md:flex gap-6 text-sm font-medium">
            <button onClick={() => navigate('/shop')} className="hover:text-green-400 transition">Accueil</button>
            <button onClick={() => navigate('/shop/catalogue')} className="hover:text-green-400 transition">Catalogue</button>
            <button onClick={() => navigate('/shop/orders')} className="hover:text-green-400 transition">Mes commandes</button>
          </div>
          <button onClick={() => navigate('/shop/cart')}
            className="relative bg-white text-black px-4 py-2 rounded-xl font-semibold text-sm hover:bg-green-400 transition">
            🛒 Panier
            {totalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {totalItems()}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-black text-gray-800 mb-8">🛒 Mon Panier</h1>

        {items.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-2xl shadow">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Votre panier est vide</h2>
            <p className="text-gray-400 mb-8">Découvrez nos produits et ajoutez-les à votre panier.</p>
            <button onClick={() => navigate('/shop/catalogue')}
              className="bg-black text-white font-bold px-10 py-4 rounded-2xl hover:bg-gray-800 transition text-lg">
              Continuer mes achats →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow p-6 flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🛍️</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">{item.product?.name}</h3>
                    <div className="flex gap-2 text-sm text-gray-500 mb-2">
                      {item.size && <span>Taille: {item.size}</span>}
                      {item.color && <span>Couleur: {item.color}</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center font-bold hover:border-gray-400 transition">
                          −
                        </button>
                        <span className="font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center font-bold hover:border-gray-400 transition">
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-lg">
                          {((item.product?.sale_price || item.product?.price || 0) * item.quantity).toFixed(2)} €
                        </span>
                        <button onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-600 transition text-lg">🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Vider le panier */}
              <button onClick={() => clearCart()}
                className="text-sm text-red-400 hover:text-red-600 transition font-medium">
                🗑️ Vider le panier
              </button>
            </div>

            {/* Résumé */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow p-6 sticky top-24">
                <h2 className="text-xl font-black text-gray-800 mb-6">Résumé</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total ({totalItems()} articles)</span>
                    <span>{totalPrice().toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Livraison</span>
                    <span className="text-green-500 font-semibold">
                      {totalPrice() >= 50 ? 'Gratuite' : '4.99 €'}
                    </span>
                  </div>
                  {totalPrice() < 50 && (
                    <p className="text-xs text-gray-400">
                      Plus que {(50 - totalPrice()).toFixed(2)} € pour la livraison gratuite !
                    </p>
                  )}
                  <div className="border-t pt-3 flex justify-between font-black text-xl">
                    <span>Total</span>
                    <span>{(totalPrice() + (totalPrice() >= 50 ? 0 : 4.99)).toFixed(2)} €</span>
                  </div>
                </div>
                <button onClick={() => navigate('/shop/checkout')}
                  className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-4 rounded-2xl transition text-lg mb-3">
                  Passer la commande →
                </button>
                <button onClick={() => navigate('/shop/catalogue')}
                  className="w-full border border-gray-200 text-gray-600 py-3 rounded-2xl hover:bg-gray-50 transition text-sm font-medium">
                  Continuer mes achats
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}