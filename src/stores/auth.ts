

// Pinia store for authentication
// NOTE: Make sure to add VITE_AUTH_EMAIL and VITE_AUTH_PASSWORD to your .env file!
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface LoginPayload {
  email: string
  password: string
  remember_me: number
}

interface LoginResponse {
  token: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Actions
  async function login(
    email: string = import.meta.env.VITE_AUTH_EMAIL,
    password: string = import.meta.env.VITE_AUTH_PASSWORD
  ): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const payload: LoginPayload = {
        email,
        password,
        remember_me: 1,
      }
      const response = await fetch('https://dev-api.aiscreen.io/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData?.message || 'Login failed')
      }
      const data: LoginResponse = await response.json()
      token.value = data.token
      localStorage.setItem('auth_token', data.token)
    } catch (e: any) {
      error.value = e?.message || 'Unknown error'
      token.value = null
      localStorage.removeItem('auth_token')
    } finally {
      loading.value = false
    }
  }

  function logout(): void {
    token.value = null
    localStorage.removeItem('auth_token')
  }

  // Getter
  const isAuthenticated = computed(() => !!token.value)

  return {
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
  }
})
