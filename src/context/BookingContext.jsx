import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'

const BookingContext = createContext()

const BASE_URL = 'http://localhost:3000'
const HOME_SERVICE_FEE = 50000

export function BookingProvider({ children }) {
  const { token } = useAuth()

  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)

  // helper fetch dengan token
  const apiFetch = useCallback(async (path, options = {}) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Authorization': token || ''
      }
    })
    return res.json()
  }, [token])

  // services
  const fetchServices = useCallback(async () => {
    try {
      const json = await apiFetch('/services')
      if (json.status === 200) setServices(json.data)
    } catch (e) { console.error(e) }
  }, [apiFetch])

  useEffect(() => { if (token) fetchServices() }, [token, fetchServices])

  const addService = async (data) => {
    const formData = new FormData()
    Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) formData.append(k, v) })
    const json = await apiFetch('/services', { method: 'POST', body: formData })
    if (json.status === 201) setServices(p => [json.data, ...p])
    return json
  }

  const updateService = async (id, data) => {
    const formData = new FormData()
    Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) formData.append(k, v) })
    const json = await apiFetch(`/services/${id}`, { method: 'PUT', body: formData })
    if (json.status === 200) setServices(p => p.map(s => s.id === id ? json.data : s))
    return json
  }

  const deleteService = async (id) => {
    const json = await apiFetch(`/services/${id}`, { method: 'DELETE' })
    if (json.status === 200) setServices(p => p.filter(s => s.id !== id))
    return json
  }

  // bookings
  const fetchMyBookings = useCallback(async () => {
    try {
      const json = await apiFetch('/bookings/my')
      if (json.status === 200) setBookings(json.data)
    } catch (e) { console.error(e) }
  }, [apiFetch])

  const fetchAllBookings = useCallback(async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString()
      const json = await apiFetch(`/bookings${query ? '?' + query : ''}`)
      if (json.status === 200) setBookings(json.data.data || json.data)
    } catch (e) { console.error(e) }
  }, [apiFetch])

  const addBooking = async (data) => {
    const body = {
      serviceId: data.serviceId,
      serviceType: data.serviceType,
      address: data.address || '',
      date: data.date,
      time: data.time,
      paymentMethod: data.paymentMethod,
      notes: data.notes || ''
    }
    const json = await apiFetch('/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (json.status === 201) setBookings(p => [json.data, ...p])
    return json
  }

  const cancelBooking = async (id) => {
    const json = await apiFetch(`/bookings/${id}/cancel`, { method: 'PATCH' })
    if (json.status === 200) setBookings(p => p.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
    return json
  }

  const reschedule = async (id, date, time) => {
    const json = await apiFetch(`/bookings/${id}/reschedule`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, time })
    })
    if (json.status === 200) setBookings(p => p.map(b => b.id === id ? json.data : b))
    return json
  }

  const updateStatus = async (id, status) => {
    const json = await apiFetch(`/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    if (json.status === 200) setBookings(p => p.map(b => b.id === id ? json.data : b))
    return json
  }

  const deleteBooking = async (id) => {
    const json = await apiFetch(`/bookings/${id}`, { method: 'DELETE' })
    if (json.status === 200) setBookings(p => p.filter(b => b.id !== id))
    return json
  }

  // payment
  const uploadProof = async (id, file) => {
    const formData = new FormData()
    formData.append('payment_proof', file)
    const json = await apiFetch(`/payments/${id}/upload-proof`, { method: 'PATCH', body: formData })
    if (json.status === 200) setBookings(p => p.map(b => b.id === id ? { ...b, paymentStatus: 'pending_verification', paymentProof: json.data.payment_proof } : b))
    return json
  }

  const confirmPayment = async (id) => {
    const json = await apiFetch(`/payments/${id}/confirm`, { method: 'PATCH' })
    if (json.status === 200) setBookings(p => p.map(b => b.id === id ? { ...b, paymentStatus: 'paid' } : b))
    return json
  }

  const rejectPayment = async (id, reason) => {
    const json = await apiFetch(`/payments/${id}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    })
    if (json.status === 200) setBookings(p => p.map(b => b.id === id ? { ...b, paymentStatus: 'unpaid', paymentProof: null, rejectReason: reason } : b))
    return json
  }

  // riview
  const addReview = async (id, rating, comment) => {
    const json = await apiFetch(`/bookings/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment })
    })
    if (json.status === 201) setBookings(p => p.map(b => b.id === id ? { ...b, review: { rating, comment } } : b))
    return json
  }

  const editReview = async (id, rating, comment) => {
    const json = await apiFetch(`/bookings/${id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment })
    })
    if (json.status === 200) setBookings(p => p.map(b => b.id === id ? { ...b, review: { rating, comment } } : b))
    return json
  }

  const deleteReview = async (id) => {
    const json = await apiFetch(`/bookings/${id}/review`, { method: 'DELETE' })
    if (json.status === 200) setBookings(p => p.map(b => b.id === id ? { ...b, review: null } : b))
    return json
  }

  const adminDeleteReview = deleteReview

  const bookingsByCustomer = (id) => bookings.filter(b => b.customerId === id)

  const totalRevenue = bookings.filter(b => b.status === 'completed' && b.paymentStatus === 'paid').reduce((s, b) => s + (b.totalPrice || b.servicePrice), 0)
  const pendingPayments = bookings.filter(b => b.paymentStatus === 'pending_verification').length
  const homeServiceCount = bookings.filter(b => b.serviceType === 'homeservice').length

  return (
    <BookingContext.Provider value={{
      services, bookings, loading, HOME_SERVICE_FEE,
      fetchServices, fetchMyBookings, fetchAllBookings,
      addService, updateService, deleteService,
      addBooking, cancelBooking, reschedule,
      updateStatus, deleteBooking,
      uploadProof, confirmPayment, rejectPayment,
      addReview, editReview, deleteReview, adminDeleteReview,
      bookingsByCustomer, totalRevenue, pendingPayments, homeServiceCount
    }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() { return useContext(BookingContext) }
