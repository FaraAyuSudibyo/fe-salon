import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Badge, Modal, ModalHeader, ModalBody, ModalFooter, Button } from "flowbite-react"
import { useAuth } from "../context/AuthContext"
import { useBooking } from "../context/BookingContext"

function fmt(n) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n) }

function statusColor(s) {
    if (s === 'completed') return 'success'
    if (s === 'cancelled') return 'failure'
    if (s === 'confirmed') return 'indigo'
    return 'warning'
}
function payColor(s) {
    if (s === 'paid') return 'success'
    if (s === 'pending_verification') return 'warning'
    return 'failure'
}

export default function MyBookings() {
    const { user } = useAuth()
    const { bookings, fetchMyBookings, cancelBooking, reschedule, uploadProof, addReview, editReview, deleteReview } = useBooking()

    useEffect(() => { fetchMyBookings() }, [])

    const mine = bookings.filter(b => b.customerId === user?.id)

    const [activeTab, setActiveTab] = useState(0)
    const [cancelId, setCancelId] = useState(null)
    const [reschedB, setReschedB] = useState(null)
    const [proofId, setProofId] = useState(null)
    const [proofFile, setProofFile] = useState(null)
    const [proofPrev, setProofPrev] = useState(null)
    const [viewProofUrl, setViewProofUrl] = useState(null)
    const [qrisBooking, setQrisBooking] = useState(null)
    const [reviewData, setReviewData] = useState(null)
    const [newDate, setNewDate] = useState("")
    const [newTime, setNewTime] = useState("")
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState("")

    function handleFile(e) {
        const f = e.target.files[0]; if (!f) return
        setProofFile(f)
        const r = new FileReader(); r.readAsDataURL(f)
        r.onloadend = () => setProofPrev(r.result)
    }

    const tabs = [
        { label: 'Semua', data: mine },
        { label: 'Pending', data: mine.filter(b => b.status === 'pending') },
        { label: 'Confirmed', data: mine.filter(b => b.status === 'confirmed') },
        { label: 'Selesai', data: mine.filter(b => b.status === 'completed') },
        { label: 'Batal', data: mine.filter(b => b.status === 'cancelled') },
    ]
    const activeData = tabs[activeTab].data

    function Card({ b }) {
        return (
            <div className="bg-white border rounded-lg overflow-hidden mb-3" style={{ borderColor: 'var(--border)' }}>
                <div className="flex justify-between items-center px-4 py-2.5" style={{ backgroundColor: 'var(--cream-dark)' }}>
                    <div className="flex gap-2 flex-wrap">
                        <Badge color={statusColor(b.status)}>{b.status}</Badge>
                        <Badge color={payColor(b.paymentStatus)}>{b.paymentStatus}</Badge>
                        {b.serviceType === 'homeservice' && <Badge color="purple">Home</Badge>}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>#{b.id}</span>
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="font-medium text-sm mb-1" style={{ color: 'var(--brown)' }}>{b.serviceName}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.date} · {b.time}</p>
                            {b.serviceType === 'homeservice' && b.address && (
                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{b.address}</p>
                            )}
                            {b.notes && <p className="text-xs mt-1 italic" style={{ color: 'var(--text-muted)' }}>"{b.notes}"</p>}
                        </div>
                        <div className="text-right">
                            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: 'var(--rose)' }}>{fmt(b.totalPrice || b.servicePrice)}</p>
                            {b.serviceType === 'homeservice' && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>+Rp50.000 home</p>}
                        </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {b.status === 'pending' && <>
                            <Button size="xs" color="failure" onClick={() => setCancelId(b.id)}>Batalkan</Button>
                            <Button size="xs" color="gray" onClick={() => { setReschedB(b); setNewDate(b.date); setNewTime(b.time) }}>Reschedule</Button>
                        </>}
                        {b.paymentMethod !== 'cash' && b.paymentStatus === 'unpaid' && b.status !== 'cancelled' && (
                            <>
                                {b.paymentMethod === 'qris' && (
                                    <Button size="xs" color="purple" onClick={() => setQrisBooking(b)}>Bayar QRIS</Button>
                                )}
                                <Button size="xs" color="warning" onClick={() => { setProofId(b.id); setProofFile(null); setProofPrev(null) }}>Upload Bukti</Button>
                            </>
                        )}
                        {b.paymentProof && (
                            <Button size="xs" color="gray" onClick={() => setViewProofUrl(b.paymentProof)}>Lihat Bukti</Button>
                        )}
                        {b.status === 'completed' && !b.review && (
                            <Button size="xs" color="light" onClick={() => { setReviewData({ booking: b, isEdit: false }); setRating(5); setComment("") }}>Beri Ulasan</Button>
                        )}
                        {b.review && <>
                            <Button size="xs" color="gray" onClick={() => { setReviewData({ booking: b, isEdit: true }); setRating(b.review.rating); setComment(b.review.comment) }}>Edit Ulasan</Button>
                            <Button size="xs" color="failure" onClick={() => deleteReview(b.id)}>Hapus Ulasan</Button>
                        </>}
                    </div>

                    {b.review && (
                        <div className="mt-3 p-3 rounded" style={{ backgroundColor: 'var(--cream-dark)', borderLeft: '2px solid var(--rose)' }}>
                            <p className="text-sm mb-1" style={{ color: 'var(--rose)' }}>{'★'.repeat(b.review.rating)}{'☆'.repeat(5 - b.review.rating)}</p>
                            <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>"{b.review.comment}"</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-10">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--rose)' }}>Member Area</p>
                    <h1 className="text-4xl font-normal" style={{ color: 'var(--brown)' }}>Cek Reservasi</h1>
                    <div className="divider" />
                </div>
                <Link to="/booking">
                    <Button size="sm" style={{ backgroundColor: 'var(--rose)', border: 'none', marginTop: '8px' }}>+ Booking Baru</Button>
                </Link>
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
                        {tab.label} ({tab.data.length})
                    </button>
                ))}
            </div>

            <div>
                {activeData.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-2xl font-normal mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--brown)' }}>Tidak ada booking</p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Yuk mulai booking layanan favoritmu</p>
                    </div>
                ) : (
                    [...activeData].reverse().map(b => <Card key={b.id} b={b} />)
                )}
            </div>

            {/* Modal batalkan */}
            <Modal show={!!cancelId} onClose={() => setCancelId(null)} size="sm">
                <ModalHeader>Batalkan Booking</ModalHeader>
                <ModalBody><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Yakin ingin membatalkan booking ini?</p></ModalBody>
                <ModalFooter>
                    <Button color="failure" onClick={() => { cancelBooking(cancelId); setCancelId(null) }}>Ya, Batalkan</Button>
                    <Button color="gray" onClick={() => setCancelId(null)}>Tidak</Button>
                </ModalFooter>
            </Modal>

            {/* Modal reschedule */}
            <Modal show={!!reschedB} onClose={() => setReschedB(null)}>
                <ModalHeader>Reschedule Booking</ModalHeader>
                <ModalBody>
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Tanggal Baru</label>
                            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full p-2.5 text-sm border rounded" style={{ borderColor: 'var(--border)' }} />
                        </div>
                        <div>
                            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Jam Baru</label>
                            <select value={newTime} onChange={e => setNewTime(e.target.value)} className="w-full p-2.5 text-sm border rounded" style={{ borderColor: 'var(--border)' }}>
                                {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => <option key={t} value={t}>{t} WIB</option>)}
                            </select>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={() => { reschedule(reschedB.id, newDate, newTime); setReschedB(null) }} style={{ backgroundColor: 'var(--rose)', border: 'none' }}>Simpan</Button>
                    <Button color="gray" onClick={() => setReschedB(null)}>Batal</Button>
                </ModalFooter>
            </Modal>

            {/* Modal upload bukti */}
            <Modal show={!!proofId} onClose={() => { setProofId(null); setProofPrev(null); setProofFile(null) }}>
                <ModalHeader>Upload Bukti Pembayaran</ModalHeader>
                <ModalBody>
                    <div className="flex flex-col gap-3">
                        <input type="file" accept="image/*" onChange={handleFile} className="w-full text-sm border rounded p-2" style={{ borderColor: 'var(--border)' }} />
                        {proofPrev && <img src={proofPrev} alt="preview" className="w-full max-h-52 object-cover rounded" />}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button disabled={!proofFile} onClick={() => { uploadProof(proofId, proofFile); setProofId(null); setProofPrev(null); setProofFile(null) }} style={{ backgroundColor: 'var(--rose)', border: 'none' }}>Upload</Button>
                    <Button color="gray" onClick={() => { setProofId(null); setProofPrev(null); setProofFile(null) }}>Batal</Button>
                </ModalFooter>
            </Modal>

            {/* Modal lihat bukti */}
            <Modal show={!!viewProofUrl} onClose={() => setViewProofUrl(null)}>
                <ModalHeader>Bukti Pembayaran</ModalHeader>
                <ModalBody>{viewProofUrl && <img src={viewProofUrl} alt="bukti" className="w-full rounded" style={{ maxHeight: '60vh', objectFit: 'contain' }} />}</ModalBody>
                <ModalFooter>
                    <Button color="gray" onClick={() => setViewProofUrl(null)}>Tutup</Button>
                </ModalFooter>
            </Modal>

            {/* Modal ulasan */}
            <Modal show={!!reviewData} onClose={() => setReviewData(null)}>
                <ModalHeader>{reviewData?.isEdit ? 'Edit Ulasan' : 'Beri Ulasan'}</ModalHeader>
                <ModalBody>
                    <div className="flex flex-col gap-4">
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{reviewData?.booking?.serviceName}</p>
                        <div>
                            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Rating</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button key={s} onClick={() => setRating(s)} className="text-3xl border-none bg-transparent cursor-pointer" style={{ color: s <= rating ? 'var(--rose)' : '#e0d4cc' }}>★</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Komentar</label>
                            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Ceritakan pengalamanmu..." rows={4} className="w-full p-2.5 text-sm border rounded" style={{ borderColor: 'var(--border)' }} />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={() => { reviewData.isEdit ? editReview(reviewData.booking.id, rating, comment) : addReview(reviewData.booking.id, rating, comment); setReviewData(null) }} style={{ backgroundColor: 'var(--rose)', border: 'none' }}>
                        {reviewData?.isEdit ? 'Simpan' : 'Kirim'}
                    </Button>
                    <Button color="gray" onClick={() => setReviewData(null)}>Batal</Button>
                </ModalFooter>
            </Modal>
            {/* Modal QRIS */}
            <Modal show={!!qrisBooking} onClose={() => setQrisBooking(null)} size="sm">
                <ModalHeader>Pembayaran QRIS</ModalHeader>
                <ModalBody>
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-xs tracking-wider" style={{ color: 'var(--text-muted)' }}>Scan QR Code untuk membayar</p>

                        {/* QR Card */}
                        <div className="bg-white rounded-xl p-4 text-center" style={{ border: '1px solid var(--border)' }}>
                            <div className="flex items-center justify-between mb-2 px-1">
                                <span className="text-xs font-bold" style={{ color: '#c0392b', letterSpacing: '3px' }}>QRIS</span>
                                <span className="text-xs" style={{ color: '#888' }}>GPN</span>
                            </div>
                            <img
                                src="https://image.similarpng.com/file/similarpng/very-thumbnail/2021/06/Barcode-Icon-design-on-transparent-background-PNG.png"
                                alt="QRIS"
                                className="mx-auto"
                                style={{ width: '200px', height: '200px', objectFit: 'contain' }}
                            />
                            <div className="flex items-center justify-center gap-1 mt-2">
                                <div className="h-px flex-1" style={{ backgroundColor: '#eee' }} />
                                <span className="text-xs font-bold px-2" style={{ color: '#c0392b', letterSpacing: '2px' }}>QRIS</span>
                                <div className="h-px flex-1" style={{ backgroundColor: '#eee' }} />
                            </div>
                        </div>

                        {/* Nominal */}
                        <div className="w-full p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--cream-dark)' }}>
                            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Total Pembayaran</p>
                            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', color: 'var(--rose)', lineHeight: 1 }}>
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(qrisBooking?.totalPrice || 0)}
                            </p>
                            <p className="text-xs mt-1 font-medium" style={{ color: 'var(--brown)' }}>{qrisBooking?.serviceName}</p>
                        </div>

                        <div className="w-full p-3 rounded-lg text-center text-xs" style={{ backgroundColor: '#fff8e1', color: '#8a6a30', border: '1px solid #f0d9a0' }}>
                            Setelah scan & bayar, klik <strong>Upload Bukti</strong> untuk konfirmasi
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="gray" onClick={() => setQrisBooking(null)}>Tutup</Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}