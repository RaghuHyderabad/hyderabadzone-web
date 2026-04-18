// ═══════════════════════════════════════════════════
// src/api/properties.js
// ═══════════════════════════════════════════════════
import client from './client'

export const propertiesApi = {
  list: (params) => client.get('/api/properties', { params }).then(r => r.data),
  get:  (id)    => client.get(`/api/properties/${id}`).then(r => r.data),
  featured: ()  => client.get('/api/properties/featured').then(r => r.data),

  create: (data)      => client.post('/api/properties', data).then(r => r.data),
  update: (id, data)  => client.put(`/api/properties/${id}`, data).then(r => r.data),
  delete: (id)        => client.delete(`/api/properties/${id}`).then(r => r.data),

  uploadImages: (id, files) => {
    const form = new FormData()
    files.forEach(f => form.append('images[]', f))
    return client.post(`/api/properties/${id}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },
}


// ═══════════════════════════════════════════════════
// src/api/search.js
// ═══════════════════════════════════════════════════
import client from './client'

export const searchApi = {
  search:       (params) => client.get('/api/search', { params }).then(r => r.data),
  autocomplete: (q)      => client.get('/api/search/autocomplete', { params: { q } }).then(r => r.data),
  mapSearch:    (bounds) => client.get('/api/search/map', { params: bounds }).then(r => r.data),
}


// ═══════════════════════════════════════════════════
// src/api/locations.js
// ═══════════════════════════════════════════════════
import client from './client'

export const locationsApi = {
  all:      () => client.get('/api/locations').then(r => r.data),
  featured: () => client.get('/api/locations/featured').then(r => r.data),
  get:      (slug) => client.get(`/api/locations/${slug}`).then(r => r.data),
}


// ═══════════════════════════════════════════════════
// src/api/auth.js
// ═══════════════════════════════════════════════════
import client from './client'

export const authApi = {
  sendOtp:   (phone) => client.post('/api/auth/send-otp', { phone }).then(r => r.data),
  verifyOtp: (data)  => client.post('/api/auth/verify-otp', data).then(r => r.data),
  me:        ()      => client.get('/api/auth/me').then(r => r.data),
  logout:    ()      => client.post('/api/auth/logout').then(r => r.data),
}


// ═══════════════════════════════════════════════════
// src/api/payments.js
// ═══════════════════════════════════════════════════
import client from './client'

export const paymentsApi = {
  createOrder: (data)  => client.post('/api/payments/create-order', data).then(r => r.data),
  verify:      (data)  => client.post('/api/payments/verify', data).then(r => r.data),
  history:     ()      => client.get('/api/payments/history').then(r => r.data),
}


// ═══════════════════════════════════════════════════
// src/api/users.js
// ═══════════════════════════════════════════════════
import client from './client'

export const usersApi = {
  dashboard:    () => client.get('/api/users/dashboard').then(r => r.data),
  saved:        () => client.get('/api/users/saved').then(r => r.data),
  toggleSave:   (id) => client.post(`/api/users/save/${id}`).then(r => r.data),
  updateProfile:(data) => client.put('/api/users/profile', data).then(r => r.data),
  submitLead:   (data) => client.post('/api/leads', data).then(r => r.data),
}


// ═══════════════════════════════════════════════════
// src/api/admin.js
// ═══════════════════════════════════════════════════
import client from './client'

export const adminApi = {
  properties:    (params) => client.get('/api/admin/properties', { params }).then(r => r.data),
  approve:       (id) => client.put(`/api/admin/properties/${id}/approve`).then(r => r.data),
  reject:        (id, reason) => client.put(`/api/admin/properties/${id}/reject`, { reason }).then(r => r.data),
  toggleFeatured:(id) => client.put(`/api/admin/properties/${id}/toggle-featured`).then(r => r.data),
  users:         (params) => client.get('/api/admin/users', { params }).then(r => r.data),
  analytics:     () => client.get('/api/admin/analytics').then(r => r.data),
}
