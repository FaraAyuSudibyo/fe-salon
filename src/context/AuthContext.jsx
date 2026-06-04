import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

const USERS = [
  { id: 1, name: 'Admin', email: 'admin@gmail.com', password: 'admin123', role: 'admin', phone: '081234567890' },
  { id: 2, name: 'Fara', email: 'fara@gmail.com', password: 'customer123', role: 'customer', phone: '089876543210' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem('dbUser'); return s ? JSON.parse(s) : null } catch { return null }
  })

  function login(email, password) {
    const found = USERS.find(u => u.email === email && u.password === password)
    if (found) {
      const { password: _, ...safe } = found
      setUser(safe); localStorage.setItem('dbUser', JSON.stringify(safe))
      return { success: true }
    }
    return { success: false, message: 'Email atau password salah' }
  }

  function logout() { setUser(null); localStorage.removeItem('dbUser') }

  function register(name, email, password, phone) {
    if (!phone) return { success: false, message: 'Nomor telepon wajib diisi untuk notifikasi WhatsApp' }
    if (USERS.find(u => u.email === email)) return { success: false, message: 'Email sudah digunakan' }
    USERS.push({ id: Date.now(), name, email, password, phone, role: 'customer' })
    return { success: true }
  }

  function updateProfile(name, phone) {
    const updated = { ...user, name, phone }
    setUser(updated); localStorage.setItem('dbUser', JSON.stringify(updated))
  }

  function changePassword(oldPass, newPass) {
    const found = USERS.find(u => u.id === user.id)
    if (!found || found.password !== oldPass) return { success: false, message: 'Password lama salah' }
    found.password = newPass
    return { success: true }
  }

  return (
    <AuthContext.Provider value={{
      user, isLoggedIn: !!user,
      isAdmin: user?.role === 'admin',
      isCustomer: user?.role === 'customer',
      login, logout, register, updateProfile, changePassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }