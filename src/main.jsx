import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/index.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { BookingProvider } from './context/BookingContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* daftarkan routing */}
    <AuthProvider>
      <BookingProvider>
        {/*  children */}
        <RouterProvider router={router} />
      </BookingProvider>
    </AuthProvider>
  </StrictMode>,
)
