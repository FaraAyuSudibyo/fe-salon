import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
// ============================================================
// FLOWBITE COMPONENTS YANG DIPAKAI DI FILE INI:
//
// 🔗 Label
//    Docs  : https://flowbite-react.com/docs/components/forms
//    Contoh: "Form label" — label teks di atas setiap input form
//
// 🔗 TextInput
//    Docs  : https://flowbite-react.com/docs/components/forms
//    Contoh: "Default input" — input nama, email, password
//
// 🔗 Button
//    Docs  : https://flowbite-react.com/docs/components/button
//    Contoh: "Default button" — tombol Daftar full width
// ============================================================
import { Label, TextInput, Button } from "flowbite-react"
import { useAuth } from "../context/AuthContext"

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" })
    const [error,   setError]   = useState("")
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const set = (f, v) => setForm(p => ({ ...p, [f]: v }))

    function handleRegister() {
        const { name, email, phone, password, confirm } = form
        if (!name || !email || !phone || !password) { setError("Semua field wajib diisi"); return }
        if (password !== confirm) { setError("Konfirmasi password tidak cocok"); return }
        if (password.length < 6) { setError("Password minimal 6 karakter"); return }
        setLoading(true); setError("")
        const r = register(name, email, password, phone)
        setLoading(false)
        if (r.success) { setSuccess(true); setTimeout(() => navigate("/login"), 2000) }
        else setError(r.message)
    }

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: 'var(--white)' }}>

            {/* Kiri — putih + logo */}
            <div className="hidden lg:flex w-1/2 flex-col items-center justify-center border-r p-12" style={{ backgroundColor: '#ffffff', borderColor: 'var(--border)' }}>
                <img src="/logo.png" alt="Dream Beauty" className="w-80 object-contain mb-5" />
            </div>

            {/* Kanan — form */}
            <div className="flex-1 flex items-center justify-center p-10" style={{ backgroundColor: 'var(--cream)' }}>
                <div className="w-full max-w-sm fade-in">

                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--rose)' }}>Bergabung sekarang</p>
                    <h1 className="text-3xl font-normal mb-1" style={{ color: 'var(--brown)' }}>Buat Akun</h1>
                    <div className="divider" />
                    <p className="text-sm mb-6 mt-3" style={{ color: 'var(--text-muted)' }}>
                        Sudah punya akun?{" "}
                        <Link to="/login" className="font-medium" style={{ color: 'var(--rose)' }}>Masuk di sini</Link>
                    </p>

                    {success && (
                        <div className="p-3 rounded mb-4 text-sm" style={{ backgroundColor: '#e8f0e8', color: '#4a7c59', border: '1px solid #b8d4b8' }}>
                            Akun berhasil dibuat! Mengalihkan ke halaman masuk...
                        </div>
                    )}
                    {error && (
                        <div className="p-3 rounded mb-4 text-sm" style={{ backgroundColor: '#f5e8e8', color: '#9b4f4f', border: '1px solid #e0b8b8' }}>
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        <div>
                            <Label htmlFor="name" value="Nama Lengkap" className="mb-2 block" />
                            <TextInput id="name" type="text" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Nama kamu" autoComplete="off" />
                        </div>
                        <div>
                            <Label htmlFor="email" value="Email" className="mb-2 block" />
                            <TextInput id="email" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@example.com" autoComplete="off" />
                        </div>
                        <div>
                            <Label htmlFor="phone" value="No. Telepon WhatsApp *" className="mb-2 block" />
                            <TextInput id="phone" type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="08xxxxxxxxxx" autoComplete="off" />
                        </div>
                        <div>
                            <Label htmlFor="password" value="Password" className="mb-2 block" />
                            <TextInput id="password" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min. 6 karakter" autoComplete="new-password" />
                        </div>
                        <div>
                            <Label htmlFor="confirm" value="Konfirmasi Password" className="mb-2 block" />
                            <TextInput id="confirm" type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} placeholder="Ulangi password" autoComplete="new-password" />
                        </div>
                        <Button
                            onClick={handleRegister}
                            disabled={loading}
                            className="w-full mt-1"
                            style={{ backgroundColor: 'var(--rose)', border: 'none' }}
                        >
                            {loading ? "Memproses..." : "Buat Akun"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
