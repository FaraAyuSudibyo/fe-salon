import { useEffect } from "react"
import { Badge } from "flowbite-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useBooking } from "../context/BookingContext"

function fmt(n) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n) }

function StatCard({ label, value }) {
    return (
        <div className="bg-white border rounded-lg p-6 text-center" style={{ borderColor: 'var(--border)' }}>
            <p className="text-3xl font-normal mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--rose)' }}>{value}</p>
            <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</p>
        </div>
    )
}

function MenuTile({ to, label, desc }) {
    return (
        <Link to={to} className="block no-underline">
            <div className="bg-white border rounded-lg p-5 hover:border-rose-300 hover:shadow-sm transition-all" style={{ borderColor: 'var(--border)' }}>
                <p className="font-medium text-sm mb-1" style={{ color: 'var(--brown)' }}>{label}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
        </Link>
    )
}

function statusColor(s) {
    if (s === 'completed') return 'success'
    if (s === 'cancelled') return 'failure'
    if (s === 'confirmed') return 'indigo'
    if (s === 'in_progress') return 'purple'
    return 'warning'
}

export default function Dashboard() {
    const { user, isAdmin, logout } = useAuth()
    const { bookings, services, totalRevenue, pendingPayments, homeServiceCount, fetchMyBookings, fetchAllBookings, bookingsByCustomer } = useBooking()
    const navigate = useNavigate()

    useEffect(() => {
        if (isAdmin) fetchAllBookings()
        else fetchMyBookings()
    }, [isAdmin])

    const mine = isAdmin ? bookings : bookingsByCustomer(user?.id)
    const totalSpend = mine.filter(b => b.status === 'completed' && b.paymentStatus === 'paid').reduce((s, b) => s + (b.totalPrice || b.servicePrice), 0)

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="mb-8">
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--rose)' }}>
                    {isAdmin ? 'Admin Panel' : 'Member Area'}
                </p>
                <h1 className="text-4xl font-normal" style={{ color: 'var(--brown)' }}>Halo, {user?.name}</h1>
                <div className="divider" />
            </div>

            {isAdmin ? (
                <>
                    {pendingPayments > 0 && (
                        <div className="flex justify-between items-center p-4 rounded-lg mb-6" style={{ backgroundColor: 'var(--blush-light)', border: '1px solid var(--blush)' }}>
                            <span className="text-sm" style={{ color: 'var(--brown)' }}>
                                <strong>{pendingPayments}</strong> pembayaran menunggu verifikasi
                            </span>
                            <Link to="/admin/payments" className="text-xs px-3 py-1.5 rounded text-white" style={{ backgroundColor: 'var(--rose)' }}>
                                Verifikasi
                            </Link>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <StatCard label="Total Booking" value={bookings.length} />
                        <StatCard label="Pending" value={bookings.filter(b => b.status === 'pending').length} />
                        <StatCard label="Selesai" value={bookings.filter(b => b.status === 'completed').length} />
                        <StatCard label="Home Service" value={homeServiceCount} />
                        <StatCard label="Pendapatan" value={fmt(totalRevenue)} />
                    </div>

                    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--rose)' }}>Menu</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                        <MenuTile to="/admin/services" label="Kelola Layanan" desc={`${services.length} layanan`} />
                        <MenuTile to="/admin/reservations" label="Reservasi" desc={`${bookings.length} total`} />
                        <MenuTile to="/admin/payments" label="Pembayaran" desc={`${pendingPayments} verifikasi`} />
                        <MenuTile to="/admin/reports" label="Laporan" desc="Export PDF & Excel" />
                        <MenuTile to="/profile" label="Profil" desc="Edit akun" />
                    </div>

                    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--rose)' }}>Booking Terbaru</p>
                    <div className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                        {[...bookings].reverse().slice(0, 5).map((b, i) => (
                            <div key={b.id} className="flex justify-between items-center px-5 py-4" style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: 'var(--brown)' }}>{b.customerName}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.serviceName} · {b.date}</p>
                                </div>
                                <Badge color={statusColor(b.status)}>{b.status}</Badge>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard label="Total Booking" value={mine.length} />
                        <StatCard label="Menunggu" value={mine.filter(b => b.status === 'pending').length} />
                        <StatCard label="Selesai" value={mine.filter(b => b.status === 'completed').length} />
                        <StatCard label="Total Belanja" value={fmt(totalSpend)} />
                    </div>

                    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--rose)' }}>Menu</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                        <MenuTile to="/booking" label="Booking Baru" desc="Pesan layanan" />
                        <MenuTile to="/my-bookings" label="Cek Reservasi" desc={`${mine.length} booking`} />
                        <MenuTile to="/profile" label="Profil" desc="Edit akun" />
                    </div>

                    {mine.length > 0 && (
                        <>
                            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--rose)' }}>Booking Terakhir</p>
                            <div className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                                {[...mine].reverse().slice(0, 3).map((b, i) => (
                                    <div key={b.id} className="flex justify-between items-center px-5 py-4" style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: 'var(--brown)' }}>{b.serviceName}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.date} · {b.time}</p>
                                        </div>
                                        <Badge color={statusColor(b.status)}>{b.status}</Badge>
                                    </div>
                                ))}
                            </div>
                            <Link to="/my-bookings" className="block text-right mt-3 text-sm" style={{ color: 'var(--rose)' }}>
                                Lihat semua →
                            </Link>
                        </>
                    )}
                </>
            )}

            <div className="mt-12 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                <button onClick={() => { logout(); navigate('/') }} className="text-xs px-4 py-2 border rounded uppercase tracking-wider" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    Keluar dari Akun
                </button>
            </div>
        </div>
    )
}
