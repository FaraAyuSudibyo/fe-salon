import { useState } from "react"
import { Label, TextInput, Button } from "flowbite-react"
import { FaUserCircle } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"

export default function Profile() {
    const { user, updateProfile, changePassword, isAdmin } = useAuth()
    const [activeTab, setActiveTab] = useState(0)
    const [name, setName] = useState(user?.name || '')
    const [phone, setPhone] = useState(user?.phone || '')
    const [profileMsg, setProfileMsg] = useState({ text: '', ok: false })
    const [oldPass, setOldPass] = useState('')
    const [newPass, setNewPass] = useState('')
    const [confPass, setConfPass] = useState('')
    const [passMsg, setPassMsg] = useState({ text: '', ok: false })

    async function handleProfile(e) {
        e.preventDefault()
        if (!name.trim()) { setProfileMsg({ text: 'Nama tidak boleh kosong', ok: false }); return }
        if (!phone.trim()) { setProfileMsg({ text: 'Nomor telepon tidak boleh kosong', ok: false }); return }
        const r = await updateProfile(name, phone)
        if (r?.success !== false) setProfileMsg({ text: 'Profil berhasil diupdate', ok: true })
        else setProfileMsg({ text: r.message || 'Gagal update profil', ok: false })
    }

    async function handlePassword(e) {
        e.preventDefault()
        if (!oldPass || !newPass || !confPass) { setPassMsg({ text: 'Semua field wajib diisi', ok: false }); return }
        if (newPass !== confPass) { setPassMsg({ text: 'Konfirmasi password tidak cocok', ok: false }); return }
        if (newPass.length < 6) { setPassMsg({ text: 'Password minimal 6 karakter', ok: false }); return }
        const r = await changePassword(oldPass, newPass)
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

    const tabs = ['Edit Profil', ...(isAdmin ? [] : ['Ganti Password'])]

    return (
        <div className="max-w-lg mx-auto px-6 py-10">
            <div className="text-center mb-8">
                <FaUserCircle size={80} className="mx-auto mb-3" style={{ color: 'var(--rose)' }} />
                <h1 className="text-2xl font-normal mb-1" style={{ color: 'var(--brown)' }}>{user?.name}</h1>
                <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{user?.phone}</p>
                <span className="text-xs px-3 py-1 rounded uppercase tracking-wider" style={{ backgroundColor: user?.role === 'admin' ? 'var(--rose)' : 'var(--blush-light)', color: user?.role === 'admin' ? 'white' : 'var(--rose)' }}>
                    {user?.role}
                </span>
            </div>

            {/* Tab manual */}
            <div className="flex gap-1 mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
                {tabs.map((tab, i) => (
                    <button key={i} onClick={() => setActiveTab(i)}
                        className="px-4 py-2 text-sm transition-colors"
                        style={{
                            borderBottom: activeTab === i ? '2px solid var(--rose)' : '2px solid transparent',
                            color: activeTab === i ? 'var(--rose)' : 'var(--text-muted)',
                            backgroundColor: 'transparent', cursor: 'pointer',
                            fontWeight: activeTab === i ? '500' : '400'
                        }}>
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 0 && (
                <form onSubmit={handleProfile} className="flex flex-col gap-4">
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
                        <Label htmlFor="phone" value="No. Telepon" className="mb-2 block" />
                        <TextInput id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
                    </div>
                    <Button type="submit" style={{ backgroundColor: 'var(--rose)', border: 'none', alignSelf: 'flex-start' }}>
                        Simpan Perubahan
                    </Button>
                </form>
            )}

            {activeTab === 1 && !isAdmin && (
                <form onSubmit={handlePassword} className="flex flex-col gap-4">
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
            )}
        </div>
    )
}
