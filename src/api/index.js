import client from './client'

export const propertiesApi = {
  list:          (params)       => client.get('/api/properties', { params }).then(r => r.data),
  get:           (id)           => client.get(`/api/properties/${id}`).then(r => r.data),
  featured:      ()             => client.get('/api/properties/featured').then(r => r.data),
  create:        (data)         => client.post('/api/properties', data).then(r => r.data),
  update:        (id, data)     => client.put(`/api/properties/${id}`, data).then(r => r.data),
  delete:        (id)           => client.delete(`/api/properties/${id}`).then(r => r.data),
  deleteImage:   (id, imageId)  => client.delete(`/api/properties/${id}/images/${imageId}`).then(r => r.data),
  markSold:      (id)           => client.post(`/api/properties/${id}/sold`).then(r => r.data),
  trackWhatsapp: (id)           => client.post(`/api/properties/${id}/whatsapp`).then(r => r.data),
  uploadImages:  (id, files) => {
    const form = new FormData()
    files.forEach(f => form.append('images[]', f))
    return client.post(`/api/properties/${id}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },
}

export const searchApi = {
  search:       (params) => client.get('/api/search', { params }).then(r => r.data),
  autocomplete: (q)      => client.get('/api/search/autocomplete', { params: { q } }).then(r => r.data),
}

export const locationsApi = {
  list:     ()     => client.get('/api/locations').then(r => r.data),
  featured: ()     => client.get('/api/locations/featured').then(r => r.data),
  get:      (slug) => client.get(`/api/locations/${slug}`).then(r => r.data),
}

export const authApi = {
  // email-based OTP (previously phone-based SMS)
  sendOtp:   (email)  => client.post('/api/auth/send-otp', { email }).then(r => r.data),
  verifyOtp: (data)   => client.post('/api/auth/verify-otp', data).then(r => r.data),
  me:        ()       => client.get('/api/auth/me').then(r => r.data),
  logout:    ()       => client.post('/api/auth/logout').then(r => r.data),
}

export const leadsApi = {
  submit: (data) => client.post('/api/leads', data).then(r => r.data),
}

// Listings are FREE — no Razorpay, direct publish
export const paymentsApi = {
  publishFree: (data) => client.post('/api/payments/publish-free', data).then(r => r.data),
}

export const userApi = {
  dashboard:  ()     => client.get('/api/users/dashboard').then(r => r.data),
  submitLead: (data) => client.post('/api/leads', data).then(r => r.data),
  profile:    ()     => client.get('/api/user/profile').then(r => r.data),
  update:     (data) => client.put('/api/user/profile', data).then(r => r.data),
  myListings: ()     => client.get('/api/user/listings').then(r => r.data),
  saved:      ()     => client.get('/api/user/saved').then(r => r.data),
  saveToggle: (id)   => client.post(`/api/properties/${id}/save`).then(r => r.data),
}

export const adminApi = {
  stats:      ()           => client.get('/api/admin/stats').then(r => r.data),
  properties: (params)     => client.get('/api/admin/properties', { params }).then(r => r.data),
  approve:    (id)         => client.put(`/api/admin/properties/${id}/approve`).then(r => r.data),
  reject:     (id, reason) => client.put(`/api/admin/properties/${id}/reject`, { reason }).then(r => r.data),
  feature:    (id)         => client.put(`/api/admin/properties/${id}/toggle-featured`).then(r => r.data),
  leads:      (params)     => client.get('/api/admin/leads', { params }).then(r => r.data),
}
