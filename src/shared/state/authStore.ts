import { create } from 'zustand'
import { requestLoginCodeApi, verifyLoginCodeApi } from '../../infra/persistence/http/authApi'

type AuthStatus = 'idle' | 'sending' | 'verifying'

type AuthState = {
  email: string
  token?: string
  status: AuthStatus
  error?: string
  nextRequestAt?: number
  setEmail: (email: string) => void
  requestCode: () => Promise<void>
  verifyCode: (code: string) => Promise<boolean>
  isCooldownActive: () => number
  isAuthenticated: () => boolean
}

const STORAGE_KEY = 'fairsplit_auth_token'
const STORAGE_EMAIL_KEY = 'fairsplit_auth_email'

function loadStoredAuth() {
  if (typeof window === 'undefined') return { token: undefined, email: '' }
  const token = localStorage.getItem(STORAGE_KEY) ?? undefined
  const email = localStorage.getItem(STORAGE_EMAIL_KEY) ?? ''
  return { token, email }
}

export const useAuthStore = create<AuthState>((set, get) => {
  const stored = loadStoredAuth()
  return {
    email: stored.email,
    token: stored.token,
    status: 'idle',
    error: undefined,
    nextRequestAt: undefined,
    setEmail: (email: string) => set({ email, error: undefined }),
    requestCode: async () => {
      const email = get().email.trim()
      if (!email) {
        set({ error: 'El correo es obligatorio' })
        return
      }
      const now = Date.now()
      const next = get().nextRequestAt
      if (next && now < next) return
      set({ status: 'sending', error: undefined })
      try {
        await requestLoginCodeApi({ email })
        const cooldownMs = 45_000
        set({ status: 'idle', nextRequestAt: Date.now() + cooldownMs })
      } catch (error) {
        set({ status: 'idle', error: (error as Error).message })
      }
    },
    verifyCode: async (code: string) => {
      const email = get().email.trim()
      if (!email) {
        set({ error: 'El correo es obligatorio' })
        return false
      }
      if (!code.trim()) {
        set({ error: 'El código es obligatorio' })
        return false
      }
      set({ status: 'verifying', error: undefined })
      try {
        const result = await verifyLoginCodeApi({ email, code: code.trim() })
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, result.token)
          localStorage.setItem(STORAGE_EMAIL_KEY, result.user.email)
        }
        set({ status: 'idle', token: result.token, email: result.user.email })
        return true
      } catch (error) {
        set({ status: 'idle', error: (error as Error).message })
        return false
      }
    },
    isCooldownActive: () => {
      const next = get().nextRequestAt
      if (!next) return 0
      const remaining = next - Date.now()
      return remaining > 0 ? remaining : 0
    },
    isAuthenticated: () => Boolean(get().token),
  }
})
