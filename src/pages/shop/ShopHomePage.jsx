import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productService, categoryService } from '../../services/shopService'
import { useCartStore } from '../../store/cartStore'

export default function ShopHomePage() {
  const [featured, setFeatured] = useState([])
  const [topSellers, setTopSellers] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)
  const navigate = useNavigate()
  const addToCart = useCartStore((s) => s.addToCart)
  const totalItems = useCartStore((s) => s.totalItems)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [featRes, topRes, catRes] = await Promise.all([
        productService.getFeatured(),
        productService.getTopSellers(),
        categoryService.getAll(),
      ])
      setFeatured(featRes.data)
      setTopSellers(topRes.data)
      setCategories(catRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId) => {
    await addToCart(productId, 1)
  }

  const handleNewsletter = (e) => {
    e.preventDefault()
    setNewsletterSuccess(true)
    setEmail('')
    setTimeout(() => setNewsletterSuccess(false), 3000)
  }

  const ProductCard = ({ product }) => (
    <div
      onClick={() => navigate(`/shop/product/${product.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-100 h-56">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-gray-100 to-gray-200">
            🛍️
          </div>
        )}
        {product.sale_price && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            PROMO
          </span>
        )}
        {product.is_featured && (
          <span className="absolute top-3 right-3 bg-black text-white text-xs font-bold px-2 py-1 rounded-full">
            ⭐ TOP
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
          {product.brand || product.category?.name}
        </p>
        <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{product.name}</h3>

        {/* Prix */}
        <div className="flex items-center gap-2 mb-3">
          {product.sale_price ? (
            <>
              <span className="text-xl font-bold text-red-500">{product.sale_price} €</span>
              <span className="text-sm text-gray-400 line-through">{product.price} €</span>
            </>
          ) : (
            <span className="text-xl font-bold text-gray-800">{product.price} €</span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[1,2,3,4,5].map(i => (
            <span key={i} className={`text-sm ${i <= Math.round(product.avgRating || 0) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
          ))}
          <span className="text-xs text-gray-400 ml-1">({product.reviews?.length || 0})</span>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); handleAddToCart(product.id) }}
          className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 rounded-xl transition text-sm"
        >
          + Ajouter au panier
        </button>
      </div>
    </div>
  )

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-400 text-xl">Chargement...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR SHOP */}
      <nav className="bg-black text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-black tracking-tight">⚽ FC SHOP</h1>
            <div className="hidden md:flex gap-6 text-sm font-medium">
              <button onClick={() => navigate('/shop')} className="hover:text-green-400 transition">Accueil</button>
              <button onClick={() => navigate('/shop/catalogue')} className="hover:text-green-400 transition">Catalogue</button>
              <button onClick={() => navigate('/shop/orders')} className="hover:text-green-400 transition">Mes commandes</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
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
        </div>
      </nav>

      {/* HERO */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <p className="text-green-400 font-semibold tracking-widest uppercase text-sm mb-4">
              Collection 2026
            </p>
            <h1 className="text-6xl font-black leading-tight mb-6">
              PERFORM<br/>LIKE A<br/>
              <span className="text-green-400">PRO</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-md">
              Équipements, nutrition et vêtements pour les joueurs qui veulent repousser leurs limites.
            </p>
            <div className="flex gap-4">
              <button onClick={() => navigate('/shop/catalogue')}
                className="bg-green-400 text-black font-bold px-8 py-4 rounded-2xl hover:bg-green-300 transition text-lg">
                Shop Now →
              </button>
              <button onClick={() => navigate('/shop/catalogue')}
                className="border border-white text-white font-bold px-8 py-4 rounded-2xl hover:bg-white hover:text-black transition text-lg">
                Voir tout
              </button>
            </div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-[200px] leading-none">⚽</div>
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black text-gray-800 mb-8">
          Nos <span className="text-green-500">Catégories</span>
        </h2>
        {categories.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Vêtements', icon: '👕', color: 'from-blue-500 to-blue-700' },
              { name: 'Équipements', icon: '⚽', color: 'from-green-500 to-green-700' },
              { name: 'Nutrition', icon: '💊', color: 'from-orange-500 to-orange-700' },
              { name: 'Tech Sport', icon: '⌚', color: 'from-purple-500 to-purple-700' },
            ].map((cat) => (
              <div key={cat.name}
                onClick={() => navigate('/shop/catalogue')}
                className={`bg-gradient-to-br ${cat.color} rounded-2xl p-8 text-white text-center cursor-pointer hover:scale-105 transition-transform`}>
                <div className="text-5xl mb-3">{cat.icon}</div>
                <div className="font-bold text-lg">{cat.name}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => {
              const colors = ['from-blue-500 to-blue-700', 'from-green-500 to-green-700', 'from-orange-500 to-orange-700', 'from-purple-500 to-purple-700']
              return (
                <div key={cat.id}
                  onClick={() => navigate(`/shop/catalogue?category=${cat.id}`)}
                  className={`bg-gradient-to-br ${colors[i % colors.length]} rounded-2xl p-8 text-white text-center cursor-pointer hover:scale-105 transition-transform`}>
                  <div className="text-5xl mb-3">{cat.icon || '🛍️'}</div>
                  <div className="font-bold text-lg">{cat.name}</div>
                  <div className="text-sm opacity-75 mt-1">{cat.products_count} produits</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* TOP SELLERS */}
      {topSellers.length > 0 && (
        <div className="bg-black py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-white">
                🔥 <span className="text-green-400">Top Sellers</span>
              </h2>
              <button onClick={() => navigate('/shop/catalogue')}
                className="text-green-400 hover:text-green-300 font-semibold transition">
                Voir tout →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FEATURED */}
      {featured.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-gray-800">
              ⭐ Produits <span className="text-green-500">Vedettes</span>
            </h2>
            <button onClick={() => navigate('/shop/catalogue')}
              className="text-green-600 hover:text-green-500 font-semibold transition">
              Voir tout →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* BANNER PROMO */}
      <div className="bg-green-500 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-white mb-4">
            🚀 Livraison gratuite dès 50€ d'achat
          </h2>
          <p className="text-green-100 text-lg mb-8">
            Commandez maintenant et recevez vos articles en 48h
          </p>
          <button onClick={() => navigate('/shop/catalogue')}
            className="bg-black text-white font-bold px-10 py-4 rounded-2xl hover:bg-gray-800 transition text-lg">
            Commander maintenant →
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black text-gray-800 text-center mb-12">
          Questions <span className="text-green-500">Fréquentes</span>
        </h2>
        {[
          { q: 'Quels sont les délais de livraison ?', a: 'Livraison en 24-48h pour les commandes passées avant 15h. Livraison gratuite dès 50€ d\'achat.' },
          { q: 'Comment retourner un produit ?', a: 'Vous avez 30 jours pour retourner un produit. Contactez notre support pour initier le retour.' },
          { q: 'Les paiements sont-ils sécurisés ?', a: 'Oui, nous utilisons Stripe pour les paiements en ligne, certifié PCI-DSS niveau 1.' },
          { q: 'Comment devenir vendeur sur FC Shop ?', a: 'Créez un compte joueur, puis soumettez une demande de vendeur depuis votre profil. L\'admin validera votre boutique.' },
          { q: 'Les produits sont-ils authentiques ?', a: 'Tous nos vendeurs sont vérifiés par notre équipe. Nous garantissons l\'authenticité de tous les produits.' },
        ].map((faq, i) => (
          <FaqItem key={i} question={faq.q} answer={faq.a} />
        ))}
      </div>

      {/* NEWSLETTER */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            📧 Restez informé
          </h2>
          <p className="text-gray-400 mb-8">
            Recevez nos offres exclusives, nouveautés et conseils sport directement dans votre boîte mail.
          </p>
          {newsletterSuccess ? (
            <div className="bg-green-500 text-white rounded-2xl p-4 font-semibold">
              ✅ Merci ! Vous êtes maintenant abonné à notre newsletter.
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-green-500 transition"
                placeholder="votre@email.com"
                required
              />
              <button type="submit"
                className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-4 rounded-2xl transition whitespace-nowrap">
                S'abonner →
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-black text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="font-bold text-white text-xl mb-2">⚽ FC SHOP</p>
          <p className="text-sm">© 2026 FootConnect Shop. Tous droits réservés.</p>
        </div>
      </footer>

    </div>
  )
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-2xl mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition">
        <span className="font-semibold text-gray-800">{question}</span>
        <span className="text-gray-400 text-xl">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-6 pb-6 text-gray-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}