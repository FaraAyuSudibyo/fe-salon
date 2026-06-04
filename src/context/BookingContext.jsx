import { createContext, useContext, useState, useEffect } from 'react'

const BookingContext = createContext()

const HOME_SERVICE_FEE = 50000

const INIT_SERVICES = [
  { id: 1, name: 'Potong Rambut',   category: 'Rambut', price: 75000,  duration: 60,  description: 'Potong rambut profesional sesuai bentuk wajah.', image: 'https://images.unsplash.com/photo-1560066984-138daaa6c0b4?w=500&q=80' },
  { id: 2, name: 'Creambath',       category: 'Rambut', price: 120000, duration: 60,  description: 'Perawatan rambut menyeluruh dengan pijat relaksasi.', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80' },
  { id: 3, name: 'Cat Rambut',      category: 'Rambut', price: 350000, duration: 120, description: 'Pewarnaan rambut premium tahan lama.', image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=500&q=80' },
  { id: 4, name: 'Hair Treatment',  category: 'Rambut', price: 200000, duration: 90,  description: 'Treatment intensif untuk rambut sehat berkilau.', image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=500&q=80' },
  { id: 5, name: 'Facial Treatment',category: 'Wajah',  price: 180000, duration: 90,  description: 'Perawatan wajah deep cleansing untuk kulit sehat.', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=80' },
  { id: 6, name: 'Manicure & Pedicure', category: 'Kuku', price: 120000, duration: 75, description: 'Perawatan kuku tangan dan kaki.', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&q=80' },
  { id: 7, name: 'Eyelash Extension', category: 'Mata', price: 220000, duration: 120, description: 'Bulu mata ekstensi natural, tahan 3–4 minggu.', image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=500&q=80' },
]

const INIT_BOOKINGS = [
  {
    id: 1001, customerId: 2, customerName: 'Fara', customerPhone: '089876543210',
    serviceId: 1, serviceName: 'Potong Rambut', servicePrice: 75000,
    serviceType: 'onsite', address: '',
    totalPrice: 75000,
    date: '2025-06-10', time: '10:00',
    status: 'completed', paymentMethod: 'transfer', paymentStatus: 'paid',
    paymentProof: null, notes: '', review: null, createdAt: '2025-06-01',
    waNotified: true,
  },
  {
    id: 1002, customerId: 2, customerName: 'Fara', customerPhone: '089876543210',
    serviceId: 5, serviceName: 'Facial Treatment', servicePrice: 180000,
    serviceType: 'homeservice', address: 'Jl. Merpati No. 12, Bogor',
    totalPrice: 230000,
    date: '2025-06-20', time: '13:00',
    status: 'pending', paymentMethod: 'transfer', paymentStatus: 'unpaid',
    paymentProof: null, notes: 'Kulit sensitif', review: null, createdAt: '2025-06-05',
    waNotified: false,
  },
]

export function BookingProvider({ children }) {
  const [services, setServices] = useState(() => {
    try { const s = localStorage.getItem('dbSvc'); return s ? JSON.parse(s) : INIT_SERVICES } catch { return INIT_SERVICES }
  })
  const [bookings, setBookings] = useState(() => {
    try { const b = localStorage.getItem('dbBkg'); return b ? JSON.parse(b) : INIT_BOOKINGS } catch { return INIT_BOOKINGS }
  })

  useEffect(() => { localStorage.setItem('dbSvc', JSON.stringify(services)) }, [services])
  useEffect(() => { localStorage.setItem('dbBkg', JSON.stringify(bookings)) }, [bookings])

  // SERVICES CRUD
  const addService    = d => setServices(p => [...p, { id: Date.now(), ...d }])
  const updateService = (id, d) => setServices(p => p.map(s => s.id === id ? { ...s, ...d } : s))
  const deleteService = id => setServices(p => p.filter(s => s.id !== id))

  // BOOKINGS
  const addBooking = data => {
    const isHome = data.serviceType === 'homeservice'
    const total  = data.servicePrice + (isHome ? HOME_SERVICE_FEE : 0)
    const newB   = {
      id: Date.now(), status: 'pending', paymentStatus: 'unpaid',
      paymentProof: null, review: null, waNotified: false,
      createdAt: new Date().toISOString().split('T')[0],
      totalPrice: total,
      ...data,
    }
    setBookings(p => [...p, newB])
    // Simulasi notifikasi WA — langsung tandai terkirim
    setTimeout(() => {
      setBookings(p => p.map(b => b.id === newB.id ? { ...b, waNotified: true } : b))
    }, 1500)
    return newB
  }

  const cancelBooking  = id => setBookings(p => p.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
  const reschedule     = (id, date, time) => setBookings(p => p.map(b => b.id === id ? { ...b, date, time } : b))
  const updateStatus   = (id, status) => {
    setBookings(p => p.map(b => {
      if (b.id !== id) return b
      // Kirim notif WA simulasi saat status confirmed
      const waNotified = status === 'confirmed' ? true : b.waNotified
      return { ...b, status, waNotified }
    }))
  }
  const deleteBooking  = id => setBookings(p => p.filter(b => b.id !== id))
  const uploadProof    = (id, proof) => setBookings(p => p.map(b => b.id === id ? { ...b, paymentProof: proof, paymentStatus: 'pending_verification' } : b))
  const confirmPayment = id => setBookings(p => p.map(b => b.id === id ? { ...b, paymentStatus: 'paid' } : b))
  const rejectPayment  = (id, reason) => setBookings(p => p.map(b => b.id === id ? { ...b, paymentStatus: 'unpaid', paymentProof: null, rejectReason: reason } : b))
  const addReview      = (id, rating, comment) => setBookings(p => p.map(b => b.id === id ? { ...b, review: { rating, comment, createdAt: new Date().toISOString().split('T')[0] } } : b))
  const editReview     = (id, rating, comment) => setBookings(p => p.map(b => b.id === id ? { ...b, review: { ...b.review, rating, comment } } : b))
  const deleteReview   = id => setBookings(p => p.map(b => b.id === id ? { ...b, review: null } : b))
  const adminDeleteReview = id => setBookings(p => p.map(b => b.id === id ? { ...b, review: null } : b))

  const bookingsByCustomer = id => bookings.filter(b => b.customerId === id)

  const totalRevenue = bookings
    .filter(b => b.status === 'completed' && b.paymentStatus === 'paid')
    .reduce((s, b) => s + (b.totalPrice || b.servicePrice), 0)

  const pendingPayments = bookings.filter(b => b.paymentStatus === 'pending_verification').length
  const homeServiceCount = bookings.filter(b => b.serviceType === 'homeservice').length

  return (
    <BookingContext.Provider value={{
      services, bookings, HOME_SERVICE_FEE,
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
