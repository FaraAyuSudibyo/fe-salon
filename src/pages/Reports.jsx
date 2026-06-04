import { useBooking } from "../context/BookingContext"
// ============================================================
// FLOWBITE COMPONENTS YANG DIPAKAI DI FILE INI:
//
// 🔗 Badge
//    Docs  : https://flowbite-react.com/docs/components/badge
//    Contoh: "Default badge" — label status pembayaran pada tabel laporan
// ============================================================
import { Badge } from "flowbite-react"

function fmt(n) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n) }

function statusColor(s) {
    if (s === 'completed') return 'success'
    if (s === 'cancelled') return 'failure'
    if (s === 'confirmed') return 'indigo'
    return 'warning'
}

export default function Reports() {
    const { bookings, services, totalRevenue, homeServiceCount } = useBooking()

    const stats = services.map(s => ({
        name: s.name,
        count: bookings.filter(b => b.serviceId === s.id).length,
        rev: bookings.filter(b => b.serviceId === s.id && b.status === 'completed' && b.paymentStatus === 'paid').reduce((a, b) => a + (b.totalPrice || b.servicePrice), 0)
    })).sort((a, b) => b.count - a.count)

    const maxCount = Math.max(...stats.map(s => s.count), 1)

    function exportExcel() {
        const rows = [
            ['ID', 'Customer', 'Layanan', 'Jenis', 'Tanggal', 'Jam', 'Total', 'Status', 'Pembayaran'],
            ...[...bookings].reverse().map(b => [b.id, b.customerName, b.serviceName, b.serviceType, b.date, b.time, b.totalPrice || b.servicePrice, b.status, b.paymentStatus])
        ]
        const csv  = rows.map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url  = URL.createObjectURL(blob)
        const a    = document.createElement('a')
        a.href = url; a.download = `laporan-dream-beauty-${new Date().toISOString().split('T')[0]}.csv`
        a.click(); URL.revokeObjectURL(url)
    }

    function exportPDF() { window.print() }

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

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {[
                    { label: 'Total Booking',  value: bookings.length,                                        bg: 'var(--blush-light)' },
                    { label: 'Pendapatan',     value: fmt(totalRevenue),                                      bg: '#e8f0e8' },
                    { label: 'Selesai',        value: bookings.filter(b => b.status === 'completed').length,  bg: '#e8f0e8' },
                    { label: 'Home Service',   value: homeServiceCount,                                       bg: '#f0e8f7' },
                    { label: 'Dibatalkan',     value: bookings.filter(b => b.status === 'cancelled').length,  bg: '#f5e8e8' },
                ].map(s => (
                    <div key={s.label} className="rounded-lg p-5 text-center border" style={{ backgroundColor: s.bg, borderColor: 'var(--border)' }}>
                        <p className="text-2xl font-normal mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--brown)' }}>{s.value}</p>
                        <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Grafik */}
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--rose)' }}>Layanan Terpopuler</p>
            <div className="bg-white border rounded-lg p-6 mb-8" style={{ borderColor: 'var(--border)' }}>
                {stats.map(s => (
                    <div key={s.name} className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: 'var(--brown)' }}>{s.name}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{s.count} booking · {fmt(s.rev)}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--cream-dark)' }}>
                            <div className="h-full rounded-full transition-all" style={{ backgroundColor: 'var(--rose)', width: `${(s.count / maxCount) * 100}%` }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Riwayat */}
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--rose)' }}>Riwayat Booking</p>
            <div className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                {[...bookings].reverse().map((b, i) => (
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
                            {/* Badge dari Flowbite → Default badge */}
                            <Badge color={statusColor(b.status)} className="mt-1">{b.status}</Badge>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
