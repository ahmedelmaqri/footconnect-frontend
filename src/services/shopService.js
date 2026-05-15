import api from './api'

export const categoryService = {
  getAll:  ()       => api.get('/shop/categories'),
  create:  (data)   => api.post('/shop/categories', data),
  update:  (id, d)  => api.put(`/shop/categories/${id}`, d),
  delete:  (id)     => api.delete(`/shop/categories/${id}`),
}

export const productService = {
  getAll:      (params) => api.get('/shop/products', { params }),
  getFeatured: ()       => api.get('/shop/products/featured'),
  getTopSellers: ()     => api.get('/shop/products/top-sellers'),
  getById:     (id)     => api.get(`/shop/products/${id}`),
  create:      (data)   => api.post('/shop/products', data),
  update:      (id, d)  => api.put(`/shop/products/${id}`, d),
  delete:      (id)     => api.delete(`/shop/products/${id}`),
}

export const vendorService = {
  getAll:   ()      => api.get('/shop/vendors'),
  getById:  (id)    => api.get(`/shop/vendors/${id}`),
  create:   (data)  => api.post('/shop/vendors', data),
  update:   (id, d) => api.put(`/shop/vendors/${id}`, d),
  approve:  (id)    => api.post(`/shop/vendors/${id}/approve`),
  reject:   (id)    => api.post(`/shop/vendors/${id}/reject`),
  delete:   (id)    => api.delete(`/shop/vendors/${id}`),
}

export const cartService = {
  getAll:   ()      => api.get('/shop/cart'),
  add:      (data)  => api.post('/shop/cart', data),
  update:   (id, q) => api.put(`/shop/cart/${id}`, { quantity: q }),
  remove:   (id)    => api.delete(`/shop/cart/${id}`),
  clear:    ()      => api.delete('/shop/cart'),
}

export const orderService = {
  getAll:       ()      => api.get('/shop/orders'),
  getById:      (id)    => api.get(`/shop/orders/${id}`),
  create:       (data)  => api.post('/shop/orders', data),
  getAllAdmin:   ()      => api.get('/shop/admin/orders'),
  updateStatus: (id, s) => api.put(`/shop/admin/orders/${id}/status`, { status: s }),
}

export const reviewService = {
  create: (data) => api.post('/shop/reviews', data),
  delete: (id)   => api.delete(`/shop/reviews/${id}`),
}