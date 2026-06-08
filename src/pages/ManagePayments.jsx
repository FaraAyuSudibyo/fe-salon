import { useState } from "react"
import {
    Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell,
    Badge, Modal, ModalHeader, ModalBody, ModalFooter,
    Button
} from "flowbite-react"
import { useBooking } from "../context/BookingContext"

const BE_URL = 'http://localhost:3000'

function fmt(n) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n) }

function payColor(s) {
    if (s === 'paid') return 'success'
    if (s === 'pending_verification') return 'warning'
    return 'failure'
}

// showAksi = true hanya di tab Perlu Verifikasi
function PayTable({ data, onView, onConfirm, onReject, showAksi }) {
    if (!data.length) return <p className="text-center py-10 text-gray-400">Tidak ada data</p>
    return (
        <Table hoverable>
            <TableHead>
                <TableHeadCell>Customer</TableHeadCell>
                <TableHeadCell>Layanan</TableHeadCell>
                <TableHeadCell>Jenis</TableHeadCell>
                <TableHeadCell>Metode</TableHeadCell>
                <TableHeadCell>Total</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Aksi</TableHeadCell>
            </TableHead>
            <TableBody>
                {data.map(b => (
                    <TableRow key={b.id}>
                        <TableCell>
                            <p className="font-medium text-sm" style={{ color: 'var(--brown)' }}>{b.customerName}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.date}</p>
                        </TableCell>
                        <TableCell className="text-sm">{b.serviceName}</TableCell>
                        <TableCell>
                            <Badge color={b.serviceType === 'homeservice' ? 'purple' : 'indigo'}>{b.serviceType}</Badge>
                        </TableCell>
                        <TableCell className="text-xs uppercase tracking-wider" style={{ color: 'var(--rose)' }}>{b.paymentMethod}</TableCell>
                        <TableCell style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '15px', color: 'var(--rose)' }}>{fmt(b.totalPrice || b.servicePrice)}</TableCell>
                        <TableCell><Badge color={payColor(b.paymentStatus)}>{b.paymentStatus}</Badge></TableCell>
                        <TableCell>
                            <div className="flex gap-1 flex-wrap">
                                {/* Lihat Bukti hanya tampil kalau ada bukti */}
                                {b.paymentProof && (
                                    <Button size="xs" color="gray" onClick={() => onView(b)}>Lihat Bukti</Button>
                                )}
                                {/* Konfirmasi & Tolak hanya tampil di tab Perlu Verifikasi */}
                                {showAksi && <>
                                    <Button size="xs" color="success" onClick={() => onConfirm(b.id)}>Konfirmasi</Button>
                                    <Button size="xs" color="failure" onClick={() => onReject(b.id)}>Tolak</Button>
                                </>}
                                {/* Kalau tidak ada aksi apapun */}
                                {!b.paymentProof && !showAksi && (
                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function ManagePayments() {
    const { bookings, confirmPayment, rejectPayment } = useBooking()
    const [activeTab, setActiveTab] = useState(0)
    const [viewB, setViewB] = useState(null)
    const [rejectId, setRejectId] = useState(null)
    const [rejectReason, setRejectReason] = useState('')

    const nonCash = [...bookings].reverse().filter(b => b.paymentMethod !== 'cash')
    const needVerif = nonCash.filter(b => b.paymentStatus === 'pending_verification')
    const paid = nonCash.filter(b => b.paymentStatus === 'paid')
    const unpaid = nonCash.filter(b => b.paymentStatus === 'unpaid')

    const tabs = [
        { label: `Perlu Verifikasi (${needVerif.length})`, data: needVerif, showAksi: true },
        { label: `Lunas (${paid.length})`, data: paid, showAksi: false },
        { label: `Belum Bayar (${unpaid.length})`, data: unpaid, showAksi: false },
        { label: `Semua (${nonCash.length})`, data: nonCash, showAksi: false },
    ]

    // URL gambar bukti 
    function getBuktiUrl(paymentProof) {
        if (!paymentProof) return null
        if (paymentProof.startsWith('http')) return paymentProof
        return `${BE_URL}/uploads/${paymentProof}`
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="mb-8">
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--rose)' }}>Admin</p>
                <h1 className="text-4xl font-normal" style={{ color: 'var(--brown)' }}>Kelola Pembayaran</h1>
                <div className="divider" />
            </div>

            <div className="flex gap-3 mb-6 flex-wrap">
                {[
                    { label: 'Perlu Verifikasi', value: needVerif.length, bg: '#f7f0e0', color: '#8a6a30' },
                    { label: 'Lunas', value: paid.length, bg: '#e8f0e8', color: '#4a7c59' },
                    { label: 'Belum Bayar', value: unpaid.length, bg: '#f5e8e8', color: '#9b4f4f' },
                ].map(s => (
                    <div key={s.label} className="px-6 py-3 rounded-lg text-center" style={{ backgroundColor: s.bg }}>
                        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '26px', color: s.color, lineHeight: 1 }}>{s.value}</p>
                        <p className="text-xs uppercase tracking-wider mt-1" style={{ color: s.color }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Tab manual */}
            <div className="flex gap-1 flex-wrap mb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                {tabs.map((tab, i) => (
                    <button key={i} onClick={() => setActiveTab(i)}
                        className="px-4 py-2 text-sm transition-colors"
                        style={{
                            borderBottom: activeTab === i ? '2px solid var(--rose)' : '2px solid transparent',
                            color: activeTab === i ? 'var(--rose)' : 'var(--text-muted)',
                            backgroundColor: 'transparent', cursor: 'pointer',
                            fontWeight: activeTab === i ? '500' : '400'
                        }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <PayTable
                data={tabs[activeTab].data}
                showAksi={tabs[activeTab].showAksi}
                onView={setViewB}
                onConfirm={id => { if (window.confirm('Konfirmasi pembayaran ini?')) confirmPayment(id) }}
                onReject={id => { setRejectId(id); setRejectReason('') }}
            />

            {/* Modal lihat bukti */}
            <Modal show={!!viewB} onClose={() => setViewB(null)}>
                <ModalHeader>Bukti Pembayaran — {viewB?.customerName}</ModalHeader>
                <ModalBody>
                    {viewB?.paymentProof && (
                        <img
                            src={getBuktiUrl(viewB.paymentProof)}
                            alt="bukti pembayaran"
                            className="w-full rounded"
                            style={{ maxHeight: '60vh', objectFit: 'contain' }}
                        />
                    )}
                    {viewB?.rejectReason && (
                        <div className="mt-3 p-3 rounded text-sm" style={{ backgroundColor: '#f5e8e8', color: '#9b4f4f' }}>
                            Alasan penolakan: {viewB.rejectReason}
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="gray" onClick={() => setViewB(null)}>Tutup</Button>
                </ModalFooter>
            </Modal>

            {/* Modal tolak pembayaran */}
            <Modal show={!!rejectId} onClose={() => setRejectId(null)} size="sm">
                <ModalHeader>Tolak Pembayaran</ModalHeader>
                <ModalBody>
                    <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>Tulis alasan penolakan:</p>
                    <textarea
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        placeholder="Misal: Bukti tidak jelas..."
                        rows={3}
                        className="w-full p-2.5 text-sm border rounded"
                        style={{ borderColor: '#e5e7eb' }}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="failure" onClick={() => { rejectPayment(rejectId, rejectReason); setRejectId(null) }}>Tolak</Button>
                    <Button color="gray" onClick={() => setRejectId(null)}>Batal</Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}