import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.hyderabadzone.com'

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('hz_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle errors globally
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status  = err.response?.status
    const message = err.response?.data?.message

    if (status === 401) {
      localStorage.removeItem('hz_token')
      window.location.href = '/login'
      return Promise.reject(err)
    }

    if (status === 429) {
      toast.error(message || 'Too many requests. Please wait.')
      return Promise.reject(err)
    }

    if (status >= 500) {
      toast.error('Server error. Please try again.')
    }

    return Promise.reject(err)
  },
)

export default client
