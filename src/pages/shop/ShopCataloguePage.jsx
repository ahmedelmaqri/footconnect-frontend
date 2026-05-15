import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { productService, categoryService } from '../../services/shopService'
import { useCartStore } from '../../store/cartStore'

export default function ShopCataloguePage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [filters, setFilters] = useState({
    category_id: '', min_price: '', max_price: '',
    search: '', sort_by: 'created_at', sort_order: 'desc',
  })
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const addToCart = useCartStore((s) => s.addToCart)
  const totalItems = useCartStore((s) => s.totalItems)

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setFilters(f => ({ ...f, category_id: cat }))
    fetchCategories()
  }, [])

  useEffect(() => { fetchProducts() }, [filters, page])

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll()
      setCategories(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await productService.getAll({ ...filters, page })
      setProducts(res.data.data || res.data)
      setTotal(res.data.total || 0)
      setLastPage(res.data.last_page || 1)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation()
    await addToCart(productId, 1)
  }

  const handleFilterChange = (newFilters) => {
    setPage(1)
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-black text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={() => navigate('/shop')}
              className="text-2xl font-black tracking-tight">⚽ FC SHOP</button>
            <div className="hidden md:flex gap-6 text-sm font-medium">
              <button onClick={() => navigate('/shop')} className="hover:text-green-400 transition">Accueil</button>
              <button className="text-green-400 font-bold">Catalogue</button>
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
        <div className="flex gap-8">

          {/* Sidebar Filtres */}
          <aside className="w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow p-6 sticky top-24">
              <h2 className="font-black text-gray-800 text-lg mb-6">🔍 Filtres</h2>

              {/* Recherche */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-600 mb-2">Rechercher</label>
                <input type="text" value={filters.search}
                  onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  placeholder="Nom du produit..." />
              </div>

              {/* Catégories */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-600 mb-2">Catégorie</label>
                <div className="space-y-2">
                  <button
                    onClick={() => handleFilterChange({ ...filters, category_id: '' })}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${
                      !filters.category_id ? 'bg-green-500 text-white font-semibold' : 'hover:bg-gray-50 text-gray-600'
                    }`}>
                    Toutes les catégories
                  </button>
                  {categories.map((cat) => (
                    <button key={cat.id}
                      onClick={() => handleFilterChange({ ...filters, category_id: cat.id })}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${
                        filters.category_id == cat.id ? 'bg-green-500 text-white font-semibold' : 'hover:bg-gray-50 text-gray-600'
                      }`}>
                      {cat.icon} {cat.name}
                      <span className="float-right text-xs opacity-60">({cat.products_count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prix */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-600 mb-2">Prix (€)</label>
                <div className="flex gap-2">
                  <input type="number" value={filters.min_price}
                    onChange={(e) => handleFilterChange({ ...filters, min_price: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    placeholder="Min" />
                  <input type="number" value={filters.max_price}
                    onChange={(e) => handleFilterChange({ ...filters, max_price: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    placeholder="Max" />
                </div>
              </div>

              {/* Tri */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-600 mb-2">Trier par</label>
                <select value={filters.sort_by}
                  onChange={(e) => handleFilterChange({ ...filters, sort_by: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                  <option value="created_at">Nouveautés</option>
                  <option value="price">Prix croissant</option>
                  <option value="views">Popularité</option>
                </select>
              </div>

              {/* Reset */}
              <button
                onClick={() => handleFilterChange({ category_id: '', min_price: '', max_price: '', search: '', sort_by: 'created_at', sort_order: 'desc' })}
                className="w-full border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 transition">
                Réinitialiser les filtres
              </button>
            </div>
          </aside>

          {/* Produits */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black text-gray-800">
                Catalogue <span className="text-green-500">({total} produits)</span>
              </h1>
              <p className="text-sm text-gray-400">
                Page {page} / {lastPage}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="text-gray-400 text-xl">Chargement...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-2xl shadow">
                <div className="text-6xl mb-4">😔</div>
                <h2 className="text-xl font-bold text-gray-700">Aucun produit trouvé</h2>
                <p className="text-gray-400 mt-2">Essayez d'autres filtres.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id}
                      onClick={() => navigate(`/shop/product/${product.id}`)}
                      className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 cursor-pointer group">
                      <div className="relative overflow-hidden bg-gray-100 h-56">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl">🛍️</div>
                        )}
                        {product.sale_price && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            PROMO
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                          {product.brand || product.category?.name}
                        </p>
                        <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{product.name}</h3>
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
                        <div className="flex items-center gap-1 mb-3">
                          {[1,2,3,4,5].map(i => (
                            <span key={i} className={`text-sm ${i <= Math.round(product.avgRating || 0) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                          ))}
                          <span className="text-xs text-gray-400 ml-1">({product.reviews?.length || 0})</span>
                        </div>
                        <button
                          onClick={(e) => handleAddToCart(e, product.id)}
                          className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 rounded-xl transition text-sm">
                          + Ajouter au panier
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-5 py-2 bg-white rounded-xl shadow text-sm font-semibold hover:bg-gray-50 disabled:opacity-40 transition">
                      ← Précédent
                    </button>
                    {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition ${
                          page === p ? 'bg-black text-white' : 'bg-white shadow hover:bg-gray-50 text-gray-600'
                        }`}>
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                      disabled={page === lastPage}
                      className="px-5 py-2 bg-white rounded-xl shadow text-sm font-semibold hover:bg-gray-50 disabled:opacity-40 transition">
                      Suivant →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}