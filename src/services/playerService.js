import api from './api'

export const trainingService = {
  getAll:    (params) => api.get('/trainings', { params }),
  create:    (data)   => api.post('/trainings', data),
  update:    (id, d)  => api.put(`/trainings/${id}`, d),
  delete:    (id)     => api.delete(`/trainings/${id}`),
}

export const workoutService = {
  getAll:    (params) => api.get('/workouts', { params }),
  create:    (data)   => api.post('/workouts', data),
  update:    (id, d)  => api.put(`/workouts/${id}`, d),
  delete:    (id)     => api.delete(`/workouts/${id}`),
}

export const dietService = {
  getAll:    (params) => api.get('/diets', { params }),
  create:    (data)   => api.post('/diets', data),
  update:    (id, d)  => api.put(`/diets/${id}`, d),
  delete:    (id)     => api.delete(`/diets/${id}`),
}

export const healthService = {
  getAll:    (params) => api.get('/health-records', { params }),
  create:    (data)   => api.post('/health-records', data),
  update:    (id, d)  => api.put(`/health-records/${id}`, d),
  delete:    (id)     => api.delete(`/health-records/${id}`),
}

export const postService = {
  getAll:    (params) => api.get('/posts', { params }),
  create:    (data)   => api.post('/posts', data),
  approve:   (id)     => api.post(`/posts/${id}/approve`),
  reject:    (id)     => api.post(`/posts/${id}/reject`),
  delete:    (id)     => api.delete(`/posts/${id}`),
}

export const resignationService = {
  getAll:    (params) => api.get('/resignations', { params }),
  create:    (data)   => api.post('/resignations', data),
  approve:   (id, d)  => api.post(`/resignations/${id}/approve`, d),
  reject:    (id, d)  => api.post(`/resignations/${id}/reject`, d),
  delete:    (id)     => api.delete(`/resignations/${id}`),
}