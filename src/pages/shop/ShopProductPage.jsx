import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { productService, reviewService } from '../../services/shopService'
import { useCartStore } from '../../store/cartStore'
import api from '../../services/api'

export default function ShopProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [review, setReview] = useState({ rating: 5, comment: '' })
  const [success, setSuccess] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const addToCart = useCartStore((s) => s.addToCart)
  const totalItems = useCartStore((s) => s.totalItems)

  useEffect(() => {
    fetchProduct()
    fetchMe()
  }, [id])

  const fetchProduct = async () => {
    try {
      const res = await productService.getById(id)
      setProduct(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMe = async () => {
    try {
      const res = await api.get('/me')
      setCurrentUser(res.data)
    } catch (err) { console.error(err) }
  }

  const handleAddToCart = async () => {
    const added = await addToCart(product.id, quantity, selectedSize, selectedColor)
    if (added) {
      setSuccess('✅ Produit ajouté au panier !')
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    try {
      await reviewService.create({
        product_id: product.id,
        rating: review.rating,
        comment: review.comment,
      })
      setSuccess('✅ Avis soumis !')
      setReview({ rating: 5, comment: '' })
      fetchProduct()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) { console.error(err) }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-400 text-xl">Chargement...</div>
    </div>
  )

  if (!product) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-400 text-xl">Produit introuvable</div>
    </div>
  )

  const avgRating = product.reviews?.length
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
    : 0

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-black text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={() => navigate('/shop')}
              className="text-2xl font-black">⚽ FC SHOP</button>
            <div className="hidden md:flex gap-6 text-sm font-medium">
              <button onClick={() => navigate('/shop')} className="hover:text-green-400 transition">Accueil</button>
              <button onClick={() => navigate('/shop/catalogue')} className="hover:text-green-400 transition">Catalogue</button>
              <button onClick={() => navigate('/shop/orders')} className="hover:text-green-400 transition">Mes commandes</button>
            </div>
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

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <button onClick={() => navigate('/shop')} className="hover:text-green-500">Accueil</button>
          <span>›</span>
          <button onClick={() => navigate('/shop/catalogue')} className="hover:text-green-500">Catalogue</button>
          <span>›</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </div>

        {success && (
          <div className="bg-green-50 text-green-700 rounded-xl p-4 mb-6 font-medium">{success}</div>
        )}

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

          {/* Images */}
          <div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-4 h-96">
              {product.images?.[activeImage] ? (
                <img src={product.images[activeImage]} alt={product.name}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl bg-gray-100">🛍️</div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                      activeImage === i ? 'border-green-500' : 'border-transparent'
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-green-500 font-semibold uppercase tracking-wider text-sm mb-2">
              {product.category?.name}
            </p>
            <h1 className="text-4xl font-black text-gray-800 mb-3">{product.name}</h1>

            {product.brand && (
              <p className="text-gray-500 mb-4">par <span className="font-semibold">{product.brand}</span></p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className={`text-xl ${i <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                ))}
              </div>
              <span className="text-gray-500 text-sm">({product.reviews?.length || 0} avis)</span>
            </div>

            {/* Prix */}
            <div className="flex items-center gap-4 mb-6">
              {product.sale_price ? (
                <>
                  <span className="text-4xl font-black text-red-500">{product.sale_price} €</span>
                  <span className="text-2xl text-gray-400 line-through">{product.price} €</span>
                  <span className="bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full">
                    -{Math.round((1 - product.sale_price/product.price) * 100)}%
                  </span>
                </>
              ) : (
                <span className="text-4xl font-black text-gray-800">{product.price} €</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
            )}

            {/* Stock */}
            <div className="mb-6">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {product.stock > 0 ? `✅ En stock (${product.stock})` : '❌ Rupture de stock'}
              </span>
            </div>

            {/* Tailles */}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">Taille</label>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl border-2 font-semibold text-sm transition ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Couleurs */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">Couleur</label>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color) => (
                    <button key={color} onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-xl border-2 font-semibold text-sm transition ${
                        selectedColor === color
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantité */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-3">Quantité</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center font-bold hover:border-gray-400 transition">
                  −
                </button>
                <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center font-bold hover:border-gray-400 transition">
                  +
                </button>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-black hover:bg-gray-800 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition text-lg">
                🛒 Ajouter au panier
              </button>
              <button
                onClick={() => { handleAddToCart(); navigate('/shop/cart') }}
                disabled={product.stock === 0}
                className="flex-1 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-4 rounded-2xl transition text-lg">
                ⚡ Acheter maintenant
              </button>
            </div>

            {/* Vendeur */}
            {product.vendor && (
              <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                <p className="text-sm text-gray-500">Vendu par</p>
                <p className="font-bold text-gray-800">{product.vendor.shop_name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl shadow p-8 mb-8">
          <h2 className="text-2xl font-black text-gray-800 mb-6">
            ⭐ Avis clients ({product.reviews?.length || 0})
          </h2>

          {/* Formulaire avis */}
          <form onSubmit={handleReview} className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-gray-700 mb-4">Laisser un avis</h3>
            <div className="flex gap-2 mb-4">
              {[1,2,3,4,5].map(i => (
                <button key={i} type="button"
                  onClick={() => setReview({ ...review, rating: i })}
                  className={`text-3xl transition ${i <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}>
                  ★
                </button>
              ))}
            </div>
            <textarea value={review.comment}
              onChange={(e) => setReview({ ...review, comment: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
              rows="3" placeholder="Votre avis..." />
            <button type="submit"
              className="bg-black text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition">
              Publier l'avis
            </button>
          </form>

          {/* Liste avis */}
          {product.reviews?.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucun avis pour ce produit.</p>
          ) : (
            <div className="space-y-4">
              {product.reviews.map((r) => (
                <div key={r.id} className="border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm">👤</div>
                      <span className="font-semibold text-gray-800">{r.player?.name || '—'}</span>
                    </div>
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={`${i <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
                  <p className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}