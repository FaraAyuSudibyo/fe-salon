import { useState, useEffect } from "react"
import {
    Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell,
    Badge, Modal, ModalHeader, ModalBody,
    Button
} from "flowbite-react"
import { useBooking } from "../context/BookingContext"

function fmt(n) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n) }

function payColor(s) {
    if (s === 'paid') return 'success'
    if (s === 'pending_verification') return 'warning'
    return 'failure'
}

export default function ManageReservations() {
    const { bookings, fetchAllBookings, updateStatus, deleteBooking, adminDeleteReview } = useBooking()
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('semua')
    const [typeFilter, setTypeFilter] = useState('semua')
    const [detailB, setDetailB] = useState(null)

    useEffect(() => { fetchAllBookings() }, [])

    const list = [...bookings].reverse().filter(b => {
        const ms = b.customerName?.toLowerCase().includes(search.toLowerCase()) || b.serviceName?.toLowerCase().includes(search.toLowerCase())
        const mf = filter === 'semua' || b.status === filter
        const mt = typeFilter === 'semua' || b.serviceType === typeFilter
        return ms && mf && mt
    })

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="mb-8">
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--rose)' }}>Admin</p>
                <h1 className="text-4xl font-normal" style={{ color: 'var(--brown)' }}>Kelola Reservasi</h1>
                <div className="divider" />
            </div>

            <div className="flex gap-3 mb-5 flex-wrap">
                <input type="text" placeholder="Cari customer atau layanan..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 min-w-48 p-2.5 text-sm border rounded" style={{ borderColor: '#e5e7eb' }} />
                <select value={filter} onChange={e => setFilter(e.target.value)} className="p-2.5 text-sm border rounded" style={{ borderColor: '#e5e7eb' }}>
                    <option value="semua">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="p-2.5 text-sm border rounded" style={{ borderColor: '#e5e7eb' }}>
                    <option value="semua">Semua Jenis</option>
                    <option value="onsite">Onsite</option>
                    <option value="homeservice">Home Service</option>
                </select>
            </div>

            <Table hoverable>
                <TableHead>
                    <TableHeadCell>Customer</TableHeadCell>
                    <TableHeadCell>Layanan</TableHeadCell>
                    <TableHeadCell>Jadwal</TableHeadCell>
                    <TableHeadCell>Jenis</TableHeadCell>
                    <TableHeadCell>Pembayaran</TableHeadCell>
                    <TableHeadCell>Status</TableHeadCell>
                    <TableHeadCell>Aksi</TableHeadCell>
                </TableHead>
                <TableBody>
                    {list.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">Tidak ada data</TableCell></TableRow>
                    ) : list.map(b => (
                        <TableRow key={b.id}>
                            <TableCell>
                                <p className="font-medium text-sm" style={{ color: 'var(--brown)' }}>{b.customerName}</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.customerPhone}</p>
                            </TableCell>
                            <TableCell>
                                <p className="text-sm">{b.serviceName}</p>
                                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '14px', color: 'var(--rose)' }}>{fmt(b.totalPrice || b.servicePrice)}</p>
                            </TableCell>
                            <TableCell>
                                <p className="text-sm">{b.date}</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.time}</p>
                            </TableCell>
                            <TableCell>
                                <Badge color={b.serviceType === 'homeservice' ? 'purple' : 'indigo'}>{b.serviceType}</Badge>
                                {b.serviceType === 'homeservice' && b.address && (
                                    <button onClick={() => setDetailB(b)} className="block mt-1 text-xs border-none bg-transparent cursor-pointer" style={{ color: 'var(--rose)' }}>
                                        Lihat Alamat
                                    </button>
                                )}
                            </TableCell>
                            <TableCell>
                                <p className="text-xs uppercase mb-1" style={{ color: 'var(--text-muted)' }}>{b.paymentMethod}</p>
                                <Badge color={payColor(b.paymentStatus)} size="sm">{b.paymentStatus}</Badge>
                            </TableCell>
                            <TableCell>
                                <select value={b.status} onChange={e => updateStatus(b.id, e.target.value)} className="p-1.5 text-xs border rounded" style={{ borderColor: '#e5e7eb' }}>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    <Button size="xs" color="gray" onClick={() => setDetailB(b)}>Detail</Button>
                                    {b.review && <Button size="xs" color="failure" onClick={() => { if (window.confirm('Hapus review?')) adminDeleteReview(b.id) }}>Hapus Review</Button>}
                                    <Button size="xs" color="failure" onClick={() => { if (window.confirm('Hapus booking?')) deleteBooking(b.id) }}>Hapus</Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Modal show={!!detailB} onClose={() => setDetailB(null)}>
                <ModalHeader>Detail Booking</ModalHeader>
                <ModalBody>
                    {detailB && (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Customer</p><p className="text-sm font-medium">{detailB.customerName}</p></div>
                                <div><p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Telepon</p><p className="text-sm">{detailB.customerPhone}</p></div>
                                <div><p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Layanan</p><p className="text-sm">{detailB.serviceName}</p></div>
                                <div><p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Total</p><p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: 'var(--rose)' }}>{fmt(detailB.totalPrice || detailB.servicePrice)}</p></div>
                            </div>
                            {detailB.serviceType === 'homeservice' && (
                                <div className="p-3 rounded" style={{ backgroundColor: 'var(--blush-light)', border: '1px solid var(--blush)' }}>
                                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Alamat Home Service</p>
                                    <p className="text-sm">{detailB.address}</p>
                                </div>
                            )}
                            {detailB.notes && <div><p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Catatan</p><p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>"{detailB.notes}"</p></div>}
                            {detailB.review && (
                                <div className="p-3 rounded" style={{ backgroundColor: 'var(--cream-dark)', borderLeft: '2px solid var(--rose)' }}>
                                    <p className="text-sm mb-1" style={{ color: 'var(--rose)' }}>{'★'.repeat(detailB.review.rating)}{'☆'.repeat(5 - detailB.review.rating)}</p>
                                    <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>"{detailB.review.comment}"</p>
                                </div>
                            )}
                        </div>
                    )}
                </ModalBody>
            </Modal>
        </div>
    )
}
