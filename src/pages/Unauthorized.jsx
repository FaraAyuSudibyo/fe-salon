import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
// ============================================================
// FLOWBITE COMPONENTS YANG DIPAKAI DI FILE INI:
//
// 🔗 Button
//    Docs  : https://flowbite-react.com/docs/components/button
//    Contoh: "Default button" — tombol "Kembali ke Beranda"
// ============================================================
import { Button } from "flowbite-react"

export default function Unauthorized() {
    const { isLoggedIn } = useAuth()
    return (
        <div className="min-h-screen flex items-center justify-center text-center px-6">
            <div className="fade-in">
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--rose)' }}>Error 403</p>
                <h1 className="text-5xl font-normal mb-3" style={{ color: 'var(--brown)' }}>Akses Ditolak</h1>
                <div className="divider mx-auto" />
                <p className="text-sm mt-3 mb-8" style={{ color: 'var(--text-muted)' }}>
                    Kamu tidak memiliki izin untuk mengakses halaman ini
                </p>
                <div className="flex gap-3 justify-center">
                    <Link to="/">
                        <Button style={{ backgroundColor: 'var(--rose)', border: 'none' }}>Ke Beranda</Button>
                    </Link>
                    {isLoggedIn && (
                        <Link to="/dashboard">
                            <Button color="gray">Dashboard</Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
