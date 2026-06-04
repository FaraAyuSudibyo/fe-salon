// ============================================================
// FLOWBITE COMPONENTS YANG DIPAKAI DI FILE INI:
//
// 🔗 Button
//    Docs  : https://flowbite-react.com/docs/components/button
//    Contoh: "Default button" — tombol "Book" di bawah card,
//            ukuran sm, warna dikustom pakai style
// ============================================================
import { Button } from "flowbite-react"
import { Link } from "react-router-dom"

export default function CardComp({ service, isAdmin, isLoggedIn }) {
    function fmt(n) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col">
            {/* Gambar dengan tinggi fixed */}
            <div style={{ height: '192px', overflow: 'hidden', borderRadius: '8px 8px 0 0' }}>
                <img
                    src={service.image}
                    alt={service.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>

            {/* Konten card */}
            <div className="p-5 flex flex-col gap-2 flex-1">
                <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--rose)' }}>
                    {service.category}
                </span>
                <h5 className="text-xl font-semibold tracking-tight text-gray-900">
                    {service.name}
                </h5>
                <p className="text-sm text-gray-500">
                    {service.duration} menit · {service.description}
                </p>
                <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-xl font-bold" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--rose)' }}>
                        {fmt(service.price)}
                    </span>
                    {!isAdmin && (
                        <Link to={isLoggedIn ? "/booking" : "/login"}>
                            <Button size="sm" style={{ backgroundColor: 'var(--rose)', border: 'none' }}>
                                Book
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
