import { Outlet } from "react-router-dom"
import NavbarComp from "./components/NavbarComp"

export default function Template() {
    return (
        <div className="flex flex-col min-h-screen">
            <NavbarComp />
            <main className="flex-1">
                <Outlet />
            </main>
            <footer className="py-4 px-6 flex items-center justify-center gap-3" style={{ backgroundColor: 'var(--dark)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <img src="/logo.png" alt="Dream Beauty" className="h-5" style={{ filter: 'brightness(0) invert(1)', opacity: 0.35 }} />
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    © 2026 Dream Beauty Salon. Dibuat untuk kecantikan Anda.
                </p>
            </footer>
        </div>
    )
}
