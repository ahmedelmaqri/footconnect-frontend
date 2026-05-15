import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { vendorService, productService, categoryService } from '../../services/shopService'
import ImageUpload from '../../components/ui/ImageUpload'
import api from '../../services/api'

export default function VendorPage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [vendor, setVendor] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('shop')
  const [showProductForm, setShowProductForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [vendorForm, setVendorForm] = useState({
    shop_name: '', description: '', phone: '', address: '',
    logo: '', banner: '',
  })

  const [productForm, setProductForm] = useState({
    category_id: '', name: '', description: '',
    price: '', sale_price: '', stock: 0,
    brand: '', images: [], sizes: [], colors: [],
    is_featured: false,
  })

  const [sizeInput, setSizeInput] = useState('')
  const [colorInput, setColorInput] = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const meRes = await api.get('/me')
      setCurrentUser(meRes.data)

      const vendorsRes = await vendorService.getAll()
      const myVendor = vendorsRes.data.find(v => v.user_id === meRes.data.id)

      if (myVendor) {
        setVendor(myVendor)
        setVendorForm({
          shop_name: myVendor.shop_name || '',
          description: myVendor.description || '',
          phone: myVendor.phone || '',
          address: myVendor.address || '',
          logo: myVendor.logo || '',
          banner: myVendor.banner || '',
        })
        const prodsRes = await productService.getAll({ vendor_id: myVendor.id })
        setProducts(prodsRes.data.data || prodsRes.data)
      }

      const catsRes = await categoryService.getAll()
      setCategories(catsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVendorSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (vendor) {
        await vendorService.update(vendor.id, vendorForm)
        setSuccess('Boutique mise à jour !')
      } else {
        await vendorService.create(vendorForm)
        setSuccess('Demande envoyée ! En attente d\'approbation.')
      }
      fetchAll()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erreur lors de l\'enregistrement.')
    }
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = { ...productForm, vendor_id: vendor.id }
      if (editProduct) {
        await productService.update(editProduct.id, data)
        setSuccess('Produit modifié !')
      } else {
        await productService.create(data)
        setSuccess('Produit ajouté !')
      }
      setShowProductForm(false)
      setEditProduct(null)
      setProductForm({ category_id: '', name: '', description: '', price: '', sale_price: '', stock: 0, brand: '', images: [], sizes: [], colors: [], is_featured: false })
      fetchAll()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erreur lors de l\'enregistrement.')
    }
  }

  const handleEditProduct = (product) => {
    setEditProduct(product)
    setProductForm({
      category_id: product.category_id || '',
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      sale_price: product.sale_price || '',
      stock: product.stock || 0,
      brand: product.brand || '',
      images: product.images || [],
      sizes: product.sizes || [],
      colors: product.colors || [],
      is_featured: product.is_featured || false,
    })
    setShowProductForm(true)
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return
    await productService.delete(id)
    fetchAll()
  }

  const addSize = () => {
    if (sizeInput && !productForm.sizes.includes(sizeInput)) {
      setProductForm({ ...productForm, sizes: [...productForm.sizes, sizeInput] })
      setSizeInput('')
    }
  }

  const addColor = () => {
    if (colorInput && !productForm.colors.includes(colorInput)) {
      setProductForm({ ...productForm, colors: [...productForm.colors, colorInput] })
      setColorInput('')
    }
  }

  const addImage = (url) => {
    setProductForm({ ...productForm, images: [...productForm.images, url] })
  }

  const removeImage = (index) => {
    setProductForm({ ...productForm, images: productForm.images.filter((_, i) => i !== index) })
  }

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-400 text-xl">Chargement...</div>
    </div>
  )

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800">🏪 Ma Boutique</h1>
          <p className="text-gray-500 mt-1">Gérez votre boutique et vos produits</p>
        </div>
        <button onClick={() => navigate('/shop')}
          className="bg-black text-white font-semibold px-4 py-2 rounded-xl hover:bg-gray-800 transition text-sm">
          Voir le shop →
        </button>
      </div>

      {success && <div className="bg-green-50 text-green-700 rounded-xl p-4 mb-4 font-medium">{success}</div>}
      {error && <div className="bg-red-50 text-red-600 rounded-xl p-4 mb-4">{error}</div>}

      {/* Status vendeur */}
      {vendor && (
        <div className={`rounded-xl p-4 mb-6 font-medium ${
          vendor.status === 'approved' ? 'bg-green-50 text-green-700' :
          vendor.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
          'bg-red-50 text-red-700'
        }`}>
          {vendor.status === 'approved' && '✅ Votre boutique est active !'}
          {vendor.status === 'pending' && '⏳ Votre demande est en attente d\'approbation.'}
          {vendor.status === 'rejected' && '❌ Votre demande a été refusée.'}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('shop')}
          className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
            tab === 'shop' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 shadow hover:bg-gray-50'
          }`}>
          🏪 Ma Boutique
        </button>
        {vendor?.status === 'approved' && (
          <button onClick={() => setTab('products')}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
              tab === 'products' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 shadow hover:bg-gray-50'
            }`}>
            📦 Mes Produits ({products.length})
          </button>
        )}
      </div>

      {/* Tab Boutique */}
      {tab === 'shop' && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-black text-gray-800 mb-6">
            {vendor ? 'Modifier ma boutique' : 'Créer ma boutique'}
          </h2>
          <form onSubmit={handleVendorSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Nom de la boutique</label>
                <input type="text" value={vendorForm.shop_name}
                  onChange={(e) => setVendorForm({ ...vendorForm, shop_name: e.target.value })}
                  className={inputClass} required placeholder="Ex: Sport Pro Store" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Téléphone</label>
                <input type="text" value={vendorForm.phone}
                  onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                  className={inputClass} placeholder="+212 6XX XXX XXX" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Adresse</label>
                <input type="text" value={vendorForm.address}
                  onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                  className={inputClass} placeholder="Votre adresse" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                <textarea value={vendorForm.description}
                  onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
                  className={inputClass} rows="3"
                  placeholder="Décrivez votre boutique..." />
              </div>
            </div>

            {/* Logo */}
            <ImageUpload
              value={vendorForm.logo}
              onChange={(url) => setVendorForm({ ...vendorForm, logo: url })}
              label="Logo de la boutique"
            />

            {/* Banner */}
            <ImageUpload
              value={vendorForm.banner}
              onChange={(url) => setVendorForm({ ...vendorForm, banner: url })}
              label="Bannière de la boutique"
            />

            <button type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl transition">
              {vendor ? 'Mettre à jour' : 'Soumettre la demande'}
            </button>
          </form>
        </div>
      )}

      {/* Tab Produits */}
      {tab === 'products' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-800">Mes Produits</h2>
            <button onClick={() => { setShowProductForm(!showProductForm); setEditProduct(null) }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-xl transition">
              {showProductForm ? '✕ Annuler' : '+ Ajouter un produit'}
            </button>
          </div>

          {/* Formulaire produit */}
          {showProductForm && (
            <div className="bg-white rounded-2xl shadow p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {editProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </h3>
              <form onSubmit={handleProductSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Nom du produit</label>
                    <input type="text" value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className={inputClass} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Catégorie</label>
                    <select value={productForm.category_id}
                      onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                      className={inputClass} required>
                      <option value="">Sélectionner</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Prix (€)</label>
                    <input type="number" step="0.01" value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className={inputClass} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Prix promo (€)</label>
                    <input type="number" step="0.01" value={productForm.sale_price}
                      onChange={(e) => setProductForm({ ...productForm, sale_price: e.target.value })}
                      className={inputClass} placeholder="Optionnel" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Stock</label>
                    <input type="number" min="0" value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Marque</label>
                    <input type="text" value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      className={inputClass} placeholder="Ex: Nike, Adidas..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                    <textarea value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className={inputClass} rows="3" />
                  </div>
                </div>

                {/* Tailles */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Tailles disponibles</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      placeholder="Ex: S, M, L, XL, 42..." />
                    <button type="button" onClick={addSize}
                      className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-700 transition">
                      + Ajouter
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {productForm.sizes.map((size) => (
                      <span key={size}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        {size}
                        <button type="button"
                          onClick={() => setProductForm({ ...productForm, sizes: productForm.sizes.filter(s => s !== size) })}
                          className="text-red-400 hover:text-red-600 ml-1">✕</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Couleurs */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Couleurs disponibles</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      placeholder="Ex: Rouge, Bleu, Noir..." />
                    <button type="button" onClick={addColor}
                      className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-700 transition">
                      + Ajouter
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {productForm.colors.map((color) => (
                      <span key={color}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        {color}
                        <button type="button"
                          onClick={() => setProductForm({ ...productForm, colors: productForm.colors.filter(c => c !== color) })}
                          className="text-red-400 hover:text-red-600 ml-1">✕</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Photos du produit ({productForm.images.length}/5)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {productForm.images.map((img, i) => (
                      <div key={i} className="relative">
                        <img src={img} alt="" className="w-full h-32 object-cover rounded-xl" />
                        <button type="button" onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  {productForm.images.length < 5 && (
                    <ImageUpload
                      value=""
                      onChange={(url) => addImage(url)}
                      label="Ajouter une photo"
                    />
                  )}
                </div>

                {/* Featured */}
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={productForm.is_featured}
                    onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                    className="w-4 h-4 accent-green-600" />
                  <label className="text-sm font-semibold text-gray-600">
                    ⭐ Produit vedette (mis en avant sur la page d'accueil)
                  </label>
                </div>

                <div className="flex gap-4">
                  <button type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl transition">
                    {editProduct ? 'Sauvegarder' : 'Publier le produit'}
                  </button>
                  <button type="button" onClick={() => { setShowProductForm(false); setEditProduct(null) }}
                    className="border border-gray-200 text-gray-600 px-6 py-3 rounded-xl hover:bg-gray-50 transition">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Liste produits */}
          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500">Aucun produit dans votre boutique.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow overflow-hidden">
                  <div className="h-48 bg-gray-100">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🛍️</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{product.category?.name}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        {product.sale_price ? (
                          <div className="flex gap-2 items-center">
                            <span className="font-black text-red-500">{product.sale_price} €</span>
                            <span className="text-gray-400 line-through text-sm">{product.price} €</span>
                          </div>
                        ) : (
                          <span className="font-black text-gray-800">{product.price} €</span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        Stock: {product.stock}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditProduct(product)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold py-2 rounded-xl transition">
                        ✏️ Modifier
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold py-2 rounded-xl transition">
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}