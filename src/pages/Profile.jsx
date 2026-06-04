import { useState } from "react"
// ============================================================
// FLOWBITE COMPONENTS YANG DIPAKAI DI FILE INI:
//
// 🔗 Tabs + TabItem
//    Docs  : https://flowbite-react.com/docs/components/tabs
//    Contoh: "Default tabs" — tab Profil / Ubah Password
//
// 🔗 Label
//    Docs  : https://flowbite-react.com/docs/components/forms
//    Contoh: "Form label" — label di setiap field profil
//
// 🔗 TextInput
//    Docs  : https://flowbite-react.com/docs/components/forms
//    Contoh: "Default input" — input nama, email, password
//
// 🔗 Button
//    Docs  : https://flowbite-react.com/docs/components/button
//    Contoh: "Default button" — tombol Simpan perubahan
//
// 🔗 FaUserCircle (react-icons/fa)
//    Docs  : https://react-icons.github.io/react-icons/icons/fa/
//    Dipakai sebagai foto profil — icon user bulat mengganti URL avatar
// ============================================================
import { Tabs, Label, TextInput, Button } from "flowbite-react"
import { FaUserCircle } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"

export default function Profile() {
    const { user, updateProfile, changePassword, isAdmin } = useAuth()
    const [name,  setName]  = useState(user?.name  || '')
    const [phone, setPhone] = useState(user?.phone || '')
    const [profileMsg, setProfileMsg] = useState({ text: '', ok: false })
    const [oldPass,  setOldPass]  = useState('')
    const [newPass,  setNewPass]  = useState('')
    const [confPass, setConfPass] = useState('')
    const [passMsg,  setPassMsg]  = useState({ text: '', ok: false })

    function handleProfile(e) {
        e.preventDefault()
        if (!name.trim())  { setProfileMsg({ text: 'Nama tidak boleh kosong', ok: false }); return }
        if (!phone.trim()) { setProfileMsg({ text: 'Nomor telepon tidak boleh kosong', ok: false }); return }
        updateProfile(name, phone)
        setProfileMsg({ text: 'Profil berhasil diupdate', ok: true })
    }

    function handlePassword(e) {
        e.preventDefault()
        if (!oldPass || !newPass || !confPass) { setPassMsg({ text: 'Semua field wajib diisi', ok: false }); return }
        if (newPass !== confPass) { setPassMsg({ text: 'Konfirmasi password tidak cocok', ok: false }); return }
        if (newPass.length < 6)  { setPassMsg({ text: 'Password minimal 6 karakter', ok: false }); return }
        const r = changePassword(oldPass, newPass)
        if (r.success) { setPassMsg({ text: 'Password berhasil diubah', ok: true }); setOldPass(''); setNewPass(''); setConfPass('') }
        else setPassMsg({ text: r.message, ok: false })
    }

    function Msg({ msg }) {
        if (!msg.text) return null
        return (
            <div className="p-3 rounded mb-4 text-sm" style={{ backgroundColor: msg.ok ? '#e8f0e8' : '#f5e8e8', color: msg.ok ? '#4a7c59' : '#9b4f4f', border: `1px solid ${msg.ok ? '#b8d4b8' : '#e0b8b8'}` }}>
                {msg.text}
            </div>
        )
    }

    return (
        <div className="max-w-lg mx-auto px-6 py-10">
            {/* Header profil */}
            <div className="text-center mb-8">
                <FaUserCircle size={80} className="mx-auto mb-3" style={{ color: 'var(--rose)' }} />
                <h1 className="text-2xl font-normal mb-1" style={{ color: 'var(--brown)' }}>{user?.name}</h1>
                <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{user?.phone}</p>
                <span className="text-xs px-3 py-1 rounded uppercase tracking-wider" style={{ backgroundColor: user?.role === 'admin' ? 'var(--rose)' : 'var(--blush-light)', color: user?.role === 'admin' ? 'white' : 'var(--rose)' }}>
                    {user?.role}
                </span>
            </div>

            <Tabs>
                <Tabs.Item title="Edit Profil">
                    <form onSubmit={handleProfile} className="flex flex-col gap-4 mt-4">
                        <Msg msg={profileMsg} />
                        <div>
                            <Label htmlFor="name" value="Nama Lengkap" className="mb-2 block" />
                            <TextInput id="name" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="email" value="Email (tidak bisa diubah)" className="mb-2 block" />
                            <TextInput id="email" value={user?.email} disabled />
                        </div>
                        <div>
                            <Label htmlFor="phone" value="No. Telepon WhatsApp" className="mb-2 block" />
                            <TextInput id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
                        </div>
                        <Button type="submit" style={{ backgroundColor: 'var(--rose)', border: 'none', alignSelf: 'flex-start' }}>
                            Simpan Perubahan
                        </Button>
                    </form>
                </Tabs.Item>

                {/* Tab ganti password hanya untuk customer, admin tidak bisa */}
                {!isAdmin && (
                    <Tabs.Item title="Ganti Password">
                        <form onSubmit={handlePassword} className="flex flex-col gap-4 mt-4">
                            <Msg msg={passMsg} />
                            <div>
                                <Label htmlFor="oldpass" value="Password Lama" className="mb-2 block" />
                                <TextInput id="oldpass" type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} placeholder="Masukkan password lama" />
                            </div>
                            <div>
                                <Label htmlFor="newpass" value="Password Baru" className="mb-2 block" />
                                <TextInput id="newpass" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min. 6 karakter" />
                            </div>
                            <div>
                                <Label htmlFor="confpass" value="Konfirmasi Password Baru" className="mb-2 block" />
                                <TextInput id="confpass" type="password" value={confPass} onChange={e => setConfPass(e.target.value)} placeholder="Ulangi password baru" />
                            </div>
                            <Button type="submit" style={{ backgroundColor: 'var(--rose)', border: 'none', alignSelf: 'flex-start' }}>
                                Ubah Password
                            </Button>
                        </form>
                    </Tabs.Item>
                )}
            </Tabs>
        </div>
    )
}