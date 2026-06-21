import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('fc_token') || null,
  user: JSON.parse(localStorage.getItem('fc_user')) || null, // ← ajouter

  login: (token, user) => {
    localStorage.setItem('fc_token', token)
    localStorage.setItem('fc_user', JSON.stringify(user)) // ← ajouter
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem('fc_token')
    localStorage.removeItem('fc_user') // ← ajouter
    set({ token: null, user: null })
  },

  setUser: (user) => {
    localStorage.setItem('fc_user', JSON.stringify(user)) // ← ajouter
    set({ user })
  },
}))