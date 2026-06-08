import { useState, useEffect } from "react"
import { Badge } from "flowbite-react"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts"
import { useAuth } from "../context/AuthContext"
import { useBooking } from "../context/BookingContext"


const BASE_URL = 'http://localhost:3000'

// warna tema salon
const WARNA_ROSE = '#c4a0a0'
const WARNA_BROWN = '#6b4f4f'
const WARNA_CHART = ['#c4a0a0', '#a0b4c4', '#a0c4a8', '#c4bca0', '#b4a0c4', '#c4a0b8', '#a0c4c4']

function fmt(n) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

function fmtSingkat(n) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}jt`
    if (n >= 1000) return `${(n / 1000).toFixed(0)}rb`
    return String(n)
}

function statusColor(s) {
    if (s === 'completed') return 'success'
    if (s === 'cancelled') return 'failure'
    if (s === 'confirmed') return 'indigo'
    return 'warning'
}

// Tooltip custom untuk bar chart
function TooltipBarChart({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border rounded-lg p-3 shadow-sm" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--brown)' }}>{label}</p>
                <p className="text-xs" style={{ color: 'var(--rose)' }}>{fmt(payload[0].value)}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{payload[0].payload.count} booking</p>
            </div>
        )
    }
    return null
}

// Tooltip custom untuk pie chart
function TooltipPieChart({ active, payload }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border rounded-lg p-3 shadow-sm" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--brown)' }}>{payload[0].name}</p>
                <p className="text-xs" style={{ color: 'var(--rose)' }}>{payload[0].value} booking</p>
            </div>
        )
    }
    return null
}

export default function Reports() {
    const { token } = useAuth()
    const { bookings, fetchAllBookings } = useBooking()

    const [summary, setSummary] = useState(null)
    const [revenueByService, setRevenueByService] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
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

    // data untuk pie chart status booking
    const dataStatusBooking = [
        { name: 'Pending', value: bookings.filter(b => b.status === 'pending').length },
        { name: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length },
        { name: 'In Progress', value: bookings.filter(b => b.status === 'in_progress').length },
        { name: 'Completed', value: bookings.filter(b => b.status === 'completed').length },
        { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length },
    ].filter(d => d.value > 0)  // hanya tampilkan yang ada datanya

    function exportExcel() {
        const rows = [
            ['ID', 'Customer', 'Layanan', 'Jenis', 'Tanggal', 'Jam', 'Total', 'Status', 'Pembayaran'],
            ...[...bookings].reverse().map(b => [
                b.id, b.customerName, b.serviceName, b.serviceType,
                b.date, b.time, b.totalPrice || b.servicePrice, b.status, b.paymentStatus
            ])
        ]
        const csv = rows.map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `laporan-dream-beauty-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    function exportPDF() { window.print() }

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Memuat laporan...</p>
        </div>
    )

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">

            {/* Header */}
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

            {/* Kartu Statistik */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {[
                    { label: 'Total Booking', value: summary?.totalBookings ?? 0, bg: 'var(--blush-light)' },
                    { label: 'Pendapatan', value: fmt(summary?.totalRevenue ?? 0), bg: '#e8f0e8' },
                    { label: 'Selesai', value: summary?.totalBookings - (summary?.pendingBookings ?? 0), bg: '#e8f0e8' },
                    { label: 'Home Service', value: summary?.homeServiceCount ?? 0, bg: '#f0e8f7' },
                    { label: 'Pelanggan', value: summary?.totalCustomers ?? 0, bg: '#f5e8e8' },
                ].map(s => (
                    <div key={s.label} className="rounded-lg p-5 text-center border" style={{ backgroundColor: s.bg, borderColor: 'var(--border)' }}>
                        <p className="text-2xl font-normal mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--brown)' }}>{s.value}</p>
                        <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Chart 1 — Bar Chart Pendapatan per Layanan */}
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--rose)' }}>Pendapatan per Layanan</p>
            <div className="bg-white border rounded-lg p-6 mb-6" style={{ borderColor: 'var(--border)' }}>
                {revenueByService.length === 0 ? (
                    <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>Belum ada data</p>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={revenueByService} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe8" />
                            <XAxis
                                dataKey="service_name"
                                tick={{ fontSize: 11, fill: WARNA_BROWN }}
                                angle={-30}
                                textAnchor="end"
                                interval={0}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: WARNA_BROWN }}
                                tickFormatter={fmtSingkat}
                            />
                            <Tooltip content={<TooltipBarChart />} />
                            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                {revenueByService.map((_, i) => (
                                    <Cell key={i} fill={WARNA_CHART[i % WARNA_CHART.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Chart 2 — Pie Chart Status Booking */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--rose)' }}>Status Booking</p>
                    <div className="bg-white border rounded-lg p-6" style={{ borderColor: 'var(--border)' }}>
                        {dataStatusBooking.length === 0 ? (
                            <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>Belum ada data</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={dataStatusBooking}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {dataStatusBooking.map((_, i) => (
                                            <Cell key={i} fill={WARNA_CHART[i % WARNA_CHART.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<TooltipPieChart />} />
                                    <Legend
                                        iconType="circle"
                                        iconSize={8}
                                        formatter={(value) => (
                                            <span style={{ fontSize: '11px', color: WARNA_BROWN }}>{value}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Chart 3 — Bar Chart Jumlah Booking per Layanan */}
                <div>
                    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--rose)' }}>Booking per Layanan</p>
                    <div className="bg-white border rounded-lg p-6" style={{ borderColor: 'var(--border)' }}>
                        {revenueByService.length === 0 ? (
                            <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>Belum ada data</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={revenueByService} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe8" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: WARNA_BROWN }} />
                                    <YAxis
                                        type="category"
                                        dataKey="service_name"
                                        tick={{ fontSize: 10, fill: WARNA_BROWN }}
                                        width={75}
                                    />
                                    <Tooltip content={<TooltipBarChart />} />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                        {revenueByService.map((_, i) => (
                                            <Cell key={i} fill={WARNA_CHART[i % WARNA_CHART.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Riwayat Booking */}
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