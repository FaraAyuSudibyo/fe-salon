import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
// ============================================================
// FLOWBITE COMPONENTS YANG DIPAKAI DI FILE INI:
//
// 🔗 Label
//    Docs  : https://flowbite-react.com/docs/components/forms
//    Contoh: "Form label" — label teks di atas input email/password
//
// 🔗 TextInput
//    Docs  : https://flowbite-react.com/docs/components/forms
//    Contoh: "Default input" — input email dan password
//
// 🔗 Button
//    Docs  : https://flowbite-react.com/docs/components/button
//    Contoh: "Default button" — tombol Masuk full width
// ============================================================
import { Label, TextInput, Button } from "flowbite-react"
import { useAuth } from "../context/AuthContext"

export default function Login() {
    const { login } = useAuth()
    const navigate  = useNavigate()
    const [email,   setEmail]   = useState("")
    const [pass,    setPass]    = useState("")
    const [error,   setError]   = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        document.body.style.overflow = "hidden"
        return () => { document.body.style.overflow = "" }
    }, [])

    function handleLogin() {
        if (!email || !pass) { setError("Email dan password wajib diisi"); return }
        setLoading(true); setError("")
        const r = login(email, pass)
        setLoading(false)
        if (r.success) navigate("/dashboard")
        else setError(r.message)
    }

    return (
        <div className="h-screen overflow-hidden flex" style={{ backgroundColor: 'var(--white)' }}>

            {/* Kiri — putih + logo */}
            <div className="hidden lg:flex w-1/2 flex-col items-center justify-center border-r p-12" style={{ backgroundColor: '#ffffff', borderColor: 'var(--border)' }}>
                <img src="/logo.png" alt="Dream Beauty" className="w-80 object-contain mb-5" />
            </div>

            {/* Kanan — form */}
            <div className="flex-1 flex items-center justify-center p-10" style={{ backgroundColor: 'var(--cream)' }}>
                <div className="w-full max-w-sm fade-in">

                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--rose)' }}>Selamat datang</p>
                    <h1 className="text-3xl font-normal mb-1" style={{ color: 'var(--brown)' }}>Masuk ke Akun</h1>
                    <div className="divider" />
                    <p className="text-sm mb-6 mt-3" style={{ color: 'var(--text-muted)' }}>
                        Belum punya akun?{" "}
                        <Link to="/register" className="font-medium" style={{ color: 'var(--rose)' }}>Daftar di sini</Link>
                    </p>

                    {error && (
                        <div className="p-3 rounded mb-4 text-sm" style={{ backgroundColor: '#f5e8e8', color: '#9b4f4f', border: '1px solid #e0b8b8' }}>
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        <div>
                            <Label htmlFor="email" value="Email" className="mb-2 block" />
                            <TextInput
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleLogin()}
                                placeholder="email@example.com"
                                autoComplete="off"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password" value="Password" className="mb-2 block" />
                            <TextInput
                                id="password"
                                type="password"
                                value={pass}
                                onChange={e => setPass(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleLogin()}
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                        </div>
                        <Button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full mt-1"
                            style={{ backgroundColor: 'var(--rose)', border: 'none' }}
                        >
                            {loading ? "Memproses..." : "Masuk"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}