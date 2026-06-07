import { useState, useEffect } from "react"
import {
    Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell,
    Modal, ModalHeader, ModalBody, ModalFooter,
    Button, Label, TextInput
} from "flowbite-react"
import { useBooking } from "../context/BookingContext"

function fmt(n) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n) }

export default function ManageServices() {
    const { services, fetchServices, addService, updateService, deleteService } = useBooking()
    const [formOpen, setFormOpen] = useState(false)
    const [editSvc, setEditSvc] = useState(null)
    const [delSvc, setDelSvc] = useState(null)
    const [form, setForm] = useState({ name: '', category: '', price: '', duration: '', description: '', image: '', imageFile: null })
    const [error, setError] = useState('')
    const [preview, setPreview] = useState('')

    useEffect(() => { fetchServices() }, [])

    function openAdd() { setForm({ name: '', category: '', price: '', duration: '', description: '', image: '', imageFile: null }); setPreview(''); setEditSvc(null); setError(''); setFormOpen(true) }
    function openEdit(s) {
        setForm({ name: s.name, category: s.category, price: String(s.price), duration: String(s.duration || ''), description: s.description, image: s.image || '', imageFile: null })
        setPreview(s.image || '')
        setEditSvc(s); setError(''); setFormOpen(true)
    }
    const ch = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    const chFile = e => {
        const f = e.target.files[0]; if (!f) return
        setForm(p => ({ ...p, imageFile: f }))
        const r = new FileReader(); r.readAsDataURL(f)
        r.onloadend = () => setPreview(r.result)
    }

    async function submit() {
        if (!form.name || !form.category || !form.price || !form.duration) { setError('Nama, kategori, harga, durasi wajib diisi'); return }
        const data = {
            name: form.name,
            category: form.category,
            price: parseInt(form.price),
            duration: parseInt(form.duration),
            description: form.description,
        }
        // jika ada file baru, kirim sebagai file; jika tidak ada dan ada URL, kirim URL sebagai image
        if (form.imageFile) {
            data.image = form.imageFile
        } else if (form.image) {
            data.image = form.image
        }

        const res = editSvc ? await updateService(editSvc.id, data) : await addService(data)
        if (res.status === 200 || res.status === 201) setFormOpen(false)
        else setError(res.data || 'Gagal menyimpan layanan')
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--rose)' }}>Admin</p>
                    <h1 className="text-4xl font-normal" style={{ color: 'var(--brown)' }}>Kelola Layanan</h1>
                    <div className="divider" />
                </div>
                <Button onClick={openAdd} size="sm" style={{ backgroundColor: 'var(--rose)', border: 'none', marginTop: '8px' }}>+ Tambah</Button>
            </div>

            <Table hoverable>
                <TableHead>
                    <TableHeadCell>Layanan</TableHeadCell>
                    <TableHeadCell>Kategori</TableHeadCell>
                    <TableHeadCell>Harga</TableHeadCell>
                    <TableHeadCell>Durasi</TableHeadCell>
                    <TableHeadCell>Aksi</TableHeadCell>
                </TableHead>
                <TableBody>
                    {services.map(s => (
                        <TableRow key={s.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <img src={s.image} alt={s.name} className="w-11 h-11 object-cover rounded" />
                                    <div>
                                        <p className="font-medium text-sm" style={{ color: 'var(--brown)' }}>{s.name}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.description}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--rose)' }}>{s.category}</span>
                            </TableCell>
                            <TableCell style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '15px', color: 'var(--rose)' }}>{fmt(s.price)}</TableCell>
                            <TableCell className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.duration} menit</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button size="xs" color="gray" onClick={() => openEdit(s)}>Edit</Button>
                                    <Button size="xs" color="failure" onClick={() => setDelSvc(s)}>Hapus</Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Modal show={formOpen} onClose={() => setFormOpen(false)} size="lg">
                <ModalHeader>{editSvc ? 'Edit Layanan' : 'Tambah Layanan'}</ModalHeader>
                <ModalBody>
                    {error && <div className="p-3 rounded mb-4 text-sm" style={{ backgroundColor: '#f5e8e8', color: '#9b4f4f' }}>{error}</div>}
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label value="Nama *" className="mb-2 block" /><TextInput name="name" value={form.name} onChange={ch} /></div>
                        <div><Label value="Kategori *" className="mb-2 block" /><TextInput name="category" value={form.category} onChange={ch} /></div>
                        <div><Label value="Harga (Rp) *" className="mb-2 block" /><TextInput name="price" type="number" value={form.price} onChange={ch} /></div>
                        <div><Label value="Durasi (menit) *" className="mb-2 block" /><TextInput name="duration" type="number" value={form.duration} onChange={ch} /></div>
                        <div className="col-span-2">
                            <Label value="Upload Gambar" className="mb-2 block" />
                            <input type="file" accept="image/*" onChange={chFile} className="w-full text-sm border rounded p-2" style={{ borderColor: '#e5e7eb' }} />
                            {!form.imageFile && <div className="mt-1"><Label value="atau URL Gambar" className="mb-1 block text-xs" /><TextInput name="image" value={form.image} onChange={ch} placeholder="https://..." /></div>}
                            {preview && <img src={preview} alt="preview" className="mt-2 h-24 object-cover rounded" />}
                        </div>
                        <div className="col-span-2">
                            <Label value="Deskripsi" className="mb-2 block" />
                            <textarea name="description" value={form.description} onChange={ch} rows={3} className="w-full p-2.5 text-sm border rounded" style={{ borderColor: '#e5e7eb' }} />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={submit} style={{ backgroundColor: 'var(--rose)', border: 'none' }}>{editSvc ? 'Update' : 'Tambah'}</Button>
                    <Button color="gray" onClick={() => setFormOpen(false)}>Batal</Button>
                </ModalFooter>
            </Modal>

            <Modal show={!!delSvc} onClose={() => setDelSvc(null)} size="sm">
                <ModalHeader>Hapus Layanan</ModalHeader>
                <ModalBody><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Yakin hapus <strong>"{delSvc?.name}"</strong>?</p></ModalBody>
                <ModalFooter>
                    <Button color="failure" onClick={() => { deleteService(delSvc.id); setDelSvc(null) }}>Hapus</Button>
                    <Button color="gray" onClick={() => setDelSvc(null)}>Batal</Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}
