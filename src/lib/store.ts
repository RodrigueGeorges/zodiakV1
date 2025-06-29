import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email?: string
  phone?: string
  subscription?: {
    status: 'active' | 'inactive'
    plan: string
  }
}

interface AppState {
  user: User | null
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  user: null,
  isLoading: false,
  error: null,
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: 'app-storage',
    }
  )
) 