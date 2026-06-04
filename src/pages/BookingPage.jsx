import { useState } from "react"
import { useNavigate } from "react-router-dom"
// ============================================================
// FLOWBITE COMPONENTS YANG DIPAKAI DI FILE INI:
//
// Label
//    Docs  : https://flowbite-react.com/docs/components/forms
//    Contoh: "Form label" — label teks di atas input form booking
//
// TextInput
//    Docs  : https://flowbite-react.com/docs/components/forms
//    Contoh: "Default input" — input nama, tanggal, catatan booking
//
// Button
//    Docs  : https://flowbite-react.com/docs/components/button
//    Contoh: "Default button" — tombol konfirmasi booking
// ============================================================
import { Label, TextInput, Button } from "flowbite-react"
import { useAuth } from "../context/AuthContext"
import { useBooking } from "../context/BookingContext"
import FilterComp from "../components/FilterComp"

function fmt(n) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n) }

export default function BookingPage() {
    const { user } = useAuth()
    const { services, addBooking, HOME_SERVICE_FEE } = useBooking()
    const navigate = useNavigate()

    const [cat,      setCat]      = useState("All")
    const [search,   setSearch]   = useState("")
    const [selected, setSelected] = useState(null)
    const [form, setForm] = useState({ date: '', time: '', serviceType: 'onsite', address: '', paymentMethod: 'transfer', notes: '' })
    const [success, setSuccess] = useState(false)
    const [error,   setError]   = useState("")

    const categories = ["All", ...Array.from(new Set(services.map(s => s.category)))]
    const filtered   = services.filter(s => (cat === "All" || s.category === cat) && s.name.toLowerCase().includes(search.toLowerCase()))
    const isHome     = form.serviceType === "homeservice"
    const total      = selected ? selected.price + (isHome ? HOME_SERVICE_FEE : 0) : 0
    const set        = (f, v) => setForm(p => ({ ...p, [f]: v }))
    const times      = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00']

    function handleSubmit() {
        if (!selected)                            { setError("Pilih layanan terlebih dahulu"); return }
        if (!form.date)                           { setError("Pilih tanggal"); return }
        if (!form.time)                           { setError("Pilih jam"); return }
        if (isHome && !form.address.trim())       { setError("Alamat wajib diisi untuk Home Service"); return }
        setError("")
        addBooking({
            customerId: user.id, customerName: user.name, customerPhone: user.phone,
            serviceId: selected.id, serviceName: selected.name, servicePrice: selected.price,
            serviceType: form.serviceType, address: form.address,
            date: form.date, time: form.time,
            paymentMethod: form.paymentMethod, notes: form.notes,
        })
        setSuccess(true)
        setTimeout(() => navigate("/my-bookings"), 2000)
    }

    if (success) {
        return (
            <div className="max-w-md mx-auto px-6 py-16 text-center">
                <div className="bg-white border rounded-lg p-10" style={{ borderColor: 'var(--border)' }}>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl" style={{ backgroundColor: '#e8f0e8', color: '#4a7c59' }}>✓</div>
                    <h2 className="text-2xl font-normal mb-2" style={{ color: 'var(--brown)' }}>Booking Berhasil!</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Notifikasi WhatsApp dikirim ke {user?.phone}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="mb-8">
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--rose)' }}>Reservasi</p>
                <h1 className="text-4xl font-normal" style={{ color: 'var(--brown)' }}>Booking Layanan</h1>
                <div className="divider" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Kiri: pilih layanan */}
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--brown)' }}>1. Pilih Layanan</h2>
                    <FilterComp categories={categories} activeCategory={cat} onCategory={setCat} search={search} onSearch={e => setSearch(e.target.value)} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filtered.map(s => (
                            <div key={s.id} onClick={() => setSelected(s)}
                                className="bg-white border rounded-lg overflow-hidden cursor-pointer transition-all"
                                style={{ borderColor: selected?.id === s.id ? 'var(--rose)' : 'var(--border)', borderWidth: selected?.id === s.id ? '2px' : '1px' }}>
                                <img src={s.image} alt={s.name} className="w-full h-32 object-cover" />
                                <div className="p-4">
                                    <p className="font-medium text-sm mb-1" style={{ color: 'var(--brown)' }}>{s.name}</p>
                                    <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{s.duration} menit</p>
                                    <p className="text-lg" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--rose)' }}>{fmt(s.price)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Kanan: form detail */}
                <div className="bg-white border rounded-lg p-6 h-fit sticky top-20" style={{ borderColor: 'var(--border)' }}>
                    <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--brown)' }}>2. Detail Booking</h2>

                    {selected ? (
                        <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--blush-light)', border: '1px solid var(--blush)' }}>
                            <p className="text-sm font-medium" style={{ color: 'var(--brown)' }}>{selected.name}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selected.duration} menit · {fmt(selected.price)}</p>
                        </div>
                    ) : (
                        <div className="p-3 rounded mb-4 text-center text-xs" style={{ backgroundColor: 'var(--cream-dark)', color: 'var(--text-muted)' }}>
                            ← Pilih layanan dulu
                        </div>
                    )}

                    {error && <div className="p-3 rounded mb-4 text-xs" style={{ backgroundColor: '#f5e8e8', color: '#9b4f4f' }}>{error}</div>}

                    <div className="flex flex-col gap-4">
                        {/* Jenis layanan */}
                        <div>
                            <Label value="Jenis Layanan" className="mb-2 block" />
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { val: 'onsite',      label: 'Onsite',       sub: 'Datang ke salon' },
                                    { val: 'homeservice', label: 'Home Service', sub: `+${fmt(HOME_SERVICE_FEE)}` },
                                ].map(o => (
                                    <div key={o.val} onClick={() => set('serviceType', o.val)}
                                        className="p-3 border rounded cursor-pointer text-center transition-all"
                                        style={{ borderColor: form.serviceType === o.val ? 'var(--rose)' : 'var(--border)', backgroundColor: form.serviceType === o.val ? 'var(--blush-light)' : 'transparent' }}>
                                        <p className="text-xs font-medium" style={{ color: 'var(--brown)' }}>{o.label}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{o.sub}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {isHome && (
                            <div>
                                <Label value="Alamat Lengkap *" className="mb-2 block" />
                                <textarea value={form.address} onChange={e => set('address', e.target.value)}
                                    placeholder="Jl. Nama Jalan No. X, Kota..." rows={3}
                                    className="w-full p-2.5 text-sm border rounded" style={{ borderColor: 'var(--border)' }} />
                            </div>
                        )}

                        <div>
                            <Label htmlFor="date" value="Tanggal" className="mb-2 block" />
                            <TextInput id="date" type="date" value={form.date} onChange={e => set('date', e.target.value)} min={new Date().toISOString().split('T')[0]} />
                        </div>

                        <div>
                            <Label value="Jam" className="mb-2 block" />
                            <select value={form.time} onChange={e => set('time', e.target.value)}
                                className="w-full p-2.5 text-sm border rounded" style={{ borderColor: 'var(--border)' }}>
                                <option value="">Pilih jam...</option>
                                {times.map(t => <option key={t} value={t}>{t} WIB</option>)}
                            </select>
                        </div>

                        <div>
                            <Label value="Metode Pembayaran" className="mb-2 block" />
                            <select value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}
                                className="w-full p-2.5 text-sm border rounded" style={{ borderColor: 'var(--border)' }}>
                                <option value="cash">Tunai</option>
                                <option value="transfer">Transfer Bank</option>
                                <option value="qris">QRIS</option>
                            </select>
                        </div>

                        <div>
                            <Label value="Catatan (opsional)" className="mb-2 block" />
                            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                                placeholder="Catatan khusus..." rows={2}
                                className="w-full p-2.5 text-sm border rounded" style={{ borderColor: 'var(--border)' }} />
                        </div>

                        {selected && (
                            <div className="p-3 rounded" style={{ backgroundColor: 'var(--cream-dark)' }}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span style={{ color: 'var(--text-muted)' }}>Harga layanan</span>
                                    <span>{fmt(selected.price)}</span>
                                </div>
                                {isHome && (
                                    <div className="flex justify-between text-xs mb-1">
                                        <span style={{ color: 'var(--text-muted)' }}>Home service</span>
                                        <span>{fmt(HOME_SERVICE_FEE)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-medium border-t pt-2 mt-1" style={{ borderColor: 'var(--border)' }}>
                                    <span style={{ color: 'var(--brown)' }}>Total</span>
                                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: 'var(--rose)' }}>{fmt(total)}</span>
                                </div>
                            </div>
                        )}

                        <Button onClick={handleSubmit} className="w-full" style={{ backgroundColor: 'var(--rose)', border: 'none' }}>
                            Konfirmasi Booking
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
