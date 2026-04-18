import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user:  null,

      setAuth: (token, user) => {
        localStorage.setItem('hz_token', token)
        set({ token, user })
      },

      setUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem('hz_token')
        set({ token: null, user: null })
      },

      isLoggedIn: () => !!get().token,
      isAdmin:    () => get().user?.role === 'admin',
    }),
    {
      name: 'hz-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)

export default useAuthStore
