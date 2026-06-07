import { useState, useEffect } from "react"
import { Badge } from "flowbite-react"
import { useAuth } from "../context/AuthContext"
import { useBooking } from "../context/BookingContext"
const BASE_URL = 'http://localhost:3000'

function fmt(n) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n) }

function statusColor(s) {
    if (s === 'completed') return 'success'
    if (s === 'cancelled') return 'failure'
    if (s === 'confirmed') return 'indigo'
    return 'warning'
}

export default function Reports() {
    const { token } = useAuth()
    const { bookings, fetchAllBookings } = useBooking()

    const [summary, setSummary] = useState(null)
    const [revenueByService, setRevenueByService] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // fetch semua data dari BE
        Promise.all([
            fetch(`${BASE_URL}/reports/summary`, { headers: { Authorization: token } }).then(r => r.json()),
            fetch(`${BASE_URL}/reports/revenue-by-service`, { headers: { Authorization: token } }).then(r => r.json()),
            fetchAllBookings()
        ]).then(([sum, rev]) => {
            if (sum.status === 200) setSummary(sum.data)
            if (rev.status === 200) setRevenueByService(rev.data)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [token])

    const maxCount = Math.max(...revenueByService.map(s => s.count), 1)

    function exportExcel() {
        const rows = [
            ['ID', 'Customer', 'Layanan', 'Jenis', 'Tanggal', 'Jam', 'Total', 'Status', 'Pembayaran'],
            ...[...bookings].reverse().map(b => [b.id, b.customerName, b.serviceName, b.serviceType, b.date, b.time, b.totalPrice || b.servicePrice, b.status, b.paymentStatus])
        ]
        const csv = rows.map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `laporan-dream-beauty-${new Date().toISOString().split('T')[0]}.csv`
        a.click(); URL.revokeObjectURL(url)
    }

    function exportPDF() { window.print() }

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Memuat laporan...</p>
        </div>
    )

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--rose)' }}>Admin</p>
                    <h1 className="text-4xl font-normal" style={{ color: 'var(--brown)' }}>Laporan</h1>
                    <div className="divider" />
                </div>
                <div className="flex gap-2 mt-2">
                    <button onClick={exportExcel} className="text-xs px-4 py-2 border rounded uppercase tracking-wider" style={{ borderColor: 'var(--rose)', color: 'var(--rose)' }}>⬇ Excel</button>
                    <button onClick={exportPDF} className="text-xs px-4 py-2 rounded uppercase tracking-wider text-white" style={{ backgroundColor: 'var(--rose)' }}>⬇ PDF</button>
                </div>
            </div>

            {/* Stats dari BE */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {[
                    { label: 'Total Booking', value: summary?.totalBookings ?? 0, bg: 'var(--blush-light)' },
                    { label: 'Pendapatan', value: fmt(summary?.totalRevenue ?? 0), bg: '#e8f0e8' },
                    { label: 'Selesai', value: summary?.totalBookings - summary?.pendingBookings ?? 0, bg: '#e8f0e8' },
                    { label: 'Home Service', value: summary?.homeServiceCount ?? 0, bg: '#f0e8f7' },
                    { label: 'Pelanggan', value: summary?.totalCustomers ?? 0, bg: '#f5e8e8' },
                ].map(s => (
                    <div key={s.label} className="rounded-lg p-5 text-center border" style={{ backgroundColor: s.bg, borderColor: 'var(--border)' }}>
                        <p className="text-2xl font-normal mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--brown)' }}>{s.value}</p>
                        <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Grafik revenue per layanan dari BE */}
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--rose)' }}>Layanan Terpopuler</p>
            <div className="bg-white border rounded-lg p-6 mb-8" style={{ borderColor: 'var(--border)' }}>
                {revenueByService.length === 0 ? (
                    <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>Belum ada data</p>
                ) : revenueByService.map(s => (
                    <div key={s.service_name} className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: 'var(--brown)' }}>{s.service_name}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{s.count} booking · {fmt(s.total)}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--cream-dark)' }}>
                            <div className="h-full rounded-full transition-all" style={{ backgroundColor: 'var(--rose)', width: `${(s.count / maxCount) * 100}%` }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Riwayat booking dari BookingContext (sudah fetch dari BE) */}
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--rose)' }}>Riwayat Booking</p>
            <div className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                {bookings.length === 0 ? (
                    <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Belum ada booking</p>
                ) : [...bookings].reverse().map((b, i) => (
                    <div key={b.id} className="flex justify-between items-center px-5 py-4" style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium" style={{ color: 'var(--brown)' }}>{b.customerName}</p>
                                {b.serviceType === 'homeservice' && <Badge color="purple" size="sm">Home</Badge>}
                            </div>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.serviceName} · {b.date}</p>
                        </div>
                        <div className="text-right">
                            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '14px', color: 'var(--rose)' }}>{fmt(b.totalPrice || b.servicePrice)}</p>
                            <Badge color={statusColor(b.status)} className="mt-1">{b.status}</Badge>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}