import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('fc_token') || null,
  user: null,

  login: (token, user) => {
    localStorage.setItem('fc_token', token)
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem('fc_token')
    set({ token: null, user: null })
  },

  setUser: (user) => set({ user }),
}))