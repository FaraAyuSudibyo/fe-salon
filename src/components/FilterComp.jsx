import { TextInput } from "flowbite-react"
import { HiSearch } from "react-icons/hi"

export default function FilterComp({ categories, activeCategory, onCategory, search, onSearch }) {
    return (
        <div className="flex flex-col items-center gap-4 mb-8">
            {/* Filter kategori */}
            <div className="flex flex-wrap gap-2 justify-center">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => onCategory(cat)}
                        className="px-4 py-1.5 rounded-full text-xs uppercase tracking-wider border transition-all"
                        style={{
                            borderColor: activeCategory === cat ? 'var(--rose)' : 'var(--border)',
                            backgroundColor: activeCategory === cat ? 'var(--rose)' : 'transparent',
                            color: activeCategory === cat ? 'white' : 'var(--text-muted)'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Search — pakai Flowbite TextInput */}
            <div className="w-full max-w-md">
                <TextInput
                    icon={HiSearch}
                    placeholder="Cari layanan..."
                    value={search}
                    onChange={onSearch}
                />
            </div>
        </div>
    )
}
