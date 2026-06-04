import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import { useBooking } from "./context/BookingContext"
import FilterComp from "./components/FilterComp"
import CardList from "./components/CardList"

export default function App() {
    const { isLoggedIn, isAdmin } = useAuth()
    const { services } = useBooking()
    const [cat,    setCat]    = useState("All")
    const [search, setSearch] = useState("")

    const categories = ["All", ...Array.from(new Set(services.map(s => s.category)))]
    const filtered   = services.filter(s =>
        (cat === "All" || s.category === cat) &&
        s.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div>
            {/* HERO */}
            <section className="relative min-h-screen flex items-center justify-center text-center px-6" style={{ background: 'linear-gradient(135deg, var(--cream) 0%, var(--cream-dark) 100%)' }}>
                <div className="relative z-10 fade-in">
                    <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--rose)' }}>
                        Salon Kecantikan 
                    </p>
                    <h1 className="text-5xl md:text-6xl font-normal mb-5 leading-tight" style={{ color: 'var(--dark)' }}>
                        Tampil lebih percaya diri <br /> mulai dari sini
                    </h1>
                    <p className="text-base mb-8 max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        Dream Beauty menghadirkan layanan profesional dengan suasana tenang.
                        Pesan jadwal Anda dalam hitungan detik.
                    </p>
                    {!isAdmin && (
                        <div className="flex gap-3 justify-center flex-wrap">
                            <Link
                                to={isLoggedIn ? "/booking" : "/login"}
                                className="px-8 py-3 text-sm uppercase tracking-wider text-white rounded"
                                style={{ backgroundColor: 'var(--rose)' }}
                            >
                                Booking Sekarang
                            </Link>
                            {isLoggedIn && (
                                <Link
                                    to="/my-bookings"
                                    className="px-8 py-3 text-sm uppercase tracking-wider rounded border"
                                    style={{ borderColor: 'var(--rose)', color: 'var(--rose)' }}
                                >
                                    Cek Reservasi
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* LAYANAN */}
            <section className="max-w-6xl mx-auto px-6 py-16">
                <div className="text-center mb-10">
                    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--rose)' }}>
                        Layanan Unggulan
                    </p>
                    <h2 className="text-4xl font-normal" style={{ color: 'var(--brown)' }}>
                        Dirancang untuk membuat Anda merasa istimewa.
                    </h2>
                    <Link to="/booking" className="text-sm mt-2 inline-block" style={{ color: 'var(--rose)' }}>
                        Lihat semua →
                    </Link>
                </div>
                <FilterComp
                    categories={categories}
                    activeCategory={cat}
                    onCategory={setCat}
                    search={search}
                    onSearch={e => setSearch(e.target.value)}
                />
                <CardList services={filtered.slice(0, 4)} isAdmin={isAdmin} isLoggedIn={isLoggedIn} />
            </section>

            {/* TESTIMONI */}
            <section className="py-16 px-6" style={{ backgroundColor: 'var(--cream-dark)' }}>
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-normal text-center mb-10" style={{ color: 'var(--brown)' }}>
                        Apa kata mereka
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: 'Rania A.',  text: 'Pelayanannya ramah, hasil creambath-nya bikin rambut super halus!' },
                            { name: 'Dewi P.',   text: 'Cat rambutnya rapi, warnanya sesuai ekspektasi. Pasti balik lagi.' },
                            { name: 'Lisa M.',   text: 'Suasananya nyaman, booking online-nya gampang banget.' },
                        ].map(t => (
                            <div key={t.name} className="bg-white p-7 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                                <p className="text-sm italic mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                    "{t.text}"
                                </p>
                                <p className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--brown)' }}>
                                    — {t.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            {!isLoggedIn && (
                <section className="py-16 px-6 text-center" style={{ backgroundColor: 'var(--dark)' }}>
                    <h2 className="text-4xl font-normal text-white mb-4">
                        Siap untuk tampilan baru Anda?
                    </h2>
                    <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        Pilih layanan dan jadwal yang sesuai. Kami akan menyambut Anda dengan hangat.
                    </p>
                    <Link
                        to="/register"
                        className="px-10 py-3 text-sm uppercase tracking-wider text-white rounded"
                        style={{ backgroundColor: 'var(--rose)' }}
                    >
                        Booking Sekarang
                    </Link>
                </section>
            )}
        </div>
    )
}
