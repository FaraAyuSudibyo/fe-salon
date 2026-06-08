import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

const BASE_URL = 'http://localhost:3000'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem('dbUser'); return s ? JSON.parse(s) : null } catch { return null }
  })
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem('dbToken') || null } catch { return null }
  })

  async function login(email, password) {
    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)

      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        body: formData
      })
      const json = await res.json()
      if (json.status === 200) {
        setUser(json.data.user)
        setToken(json.data.token)
        localStorage.setItem('dbUser', JSON.stringify(json.data.user))
        localStorage.setItem('dbToken', json.data.token)
        return { success: true }
      }
      return { success: false, message: json.data || 'Email atau password salah' }
    } catch (e) {
      return { success: false, message: 'Gagal terhubung ke server' }
    }
  }

  function logout() {
    setUser(null); setToken(null)
    localStorage.removeItem('dbUser')
    localStorage.removeItem('dbToken')
  }

  async function register(name, email, password, phone) {
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('phone', phone)

      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        body: formData
      })
      const json = await res.json()
      if (json.status === 201) return { success: true }
      return { success: false, message: json.data || 'Gagal mendaftar' }
    } catch (e) {
      return { success: false, message: 'Gagal terhubung ke server' }
    }
  }

  async function updateProfile(name, phone) {
    try {
      const res = await fetch(`${BASE_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ name, phone })
      })
      const json = await res.json()
      if (json.status === 200) {
        const updated = { ...user, name: json.data.name, phone: json.data.phone }
        setUser(updated)
        localStorage.setItem('dbUser', JSON.stringify(updated))
        return { success: true }
      }
      return { success: false, message: 'Gagal update profil' }
    } catch (e) {
      return { success: false, message: 'Gagal terhubung ke server' }
    }
  }

  async function changePassword(oldPass, newPass) {
    try {
      const res = await fetch(`${BASE_URL}/profile/change-password`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ old_password: oldPass, new_password: newPass })
      })
      const json = await res.json()
      if (json.status === 200) return { success: true }
      return { success: false, message: json.data || 'Gagal ganti password' }
    } catch (e) {
      return { success: false, message: 'Gagal terhubung ke server' }
    }
  }

  return (
    <AuthContext.Provider value={{
      user, token, isLoggedIn: !!user,
      isAdmin: user?.role === 'admin',
      isCustomer: user?.role === 'customer',
      login, logout, register, updateProfile, changePassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }