// ============================================================
// FLOWBITE COMPONENTS YANG DIPAKAI DI FILE INI:
//
// 🔗 Navbar + NavbarBrand + NavbarCollapse + NavbarLink + NavbarToggle
//    Docs  : https://flowbite-react.com/docs/components/navbar
//    Contoh: "Navbar with user dropdown" — navbar sticky dengan
//            logo di kiri, menu di tengah, dropdown user di kanan
//
// 🔗 Dropdown + DropdownItem + DropdownDivider + DropdownHeader
//    Docs  : https://flowbite-react.com/docs/components/dropdown
//    Contoh: "Dropdown with avatar" — dropdown muncul saat klik
//            icon profil user (mengganti Avatar flowbite)
//
// 🔗 FaUserCircle (react-icons/fa)
//    Docs  : https://react-icons.github.io/react-icons/icons/fa/
//    Dipakai sebagai pengganti Avatar Flowbite — icon user bulat
//    yang bisa diklik untuk membuka dropdown profil
// ============================================================
import {
    Navbar,
    NavbarBrand,
    NavbarCollapse,
    NavbarLink,
    NavbarToggle,
    Dropdown,
    DropdownItem,
    DropdownDivider,
    DropdownHeader,
} from "flowbite-react"
import { FaUserCircle } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function NavbarComp() {
    const { user, isLoggedIn, isAdmin, isCustomer, logout } = useAuth()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate("/")
    }

    return (
        <Navbar fluid className="bg-white border-b border-gray-100 sticky top-0 z-50">
            {/* Logo */}
            <NavbarBrand as={Link} to="/">
                <img src="/logo.png" className="mr-3 h-10" alt="Dream Beauty" />
            </NavbarBrand>

            {/* Kanan: icon user + dropdown atau tombol login */}
            <div className="flex md:order-2 items-center gap-3">
                {isLoggedIn ? (
                    <Dropdown
                        arrowIcon={false}
                        inline
                        label={
                            // FaUserCircle dari react-icons sebagai pengganti Avatar flowbite
                            <FaUserCircle
                                size={32}
                                style={{ color: 'var(--rose)', cursor: 'pointer' }}
                                title={user.name}
                            />
                        }
                    >
                        <DropdownHeader>
                            <span className="block text-sm font-medium">{user.name}</span>
                            <span className="block truncate text-sm text-gray-500">{user.email}</span>
                        </DropdownHeader>
                        <Link to="/dashboard">
                            <DropdownItem>Dashboard</DropdownItem>
                        </Link>
                        <Link to="/profile">
                            <DropdownItem>Profil</DropdownItem>
                        </Link>
                        {isCustomer && (
                            <Link to="/my-bookings">
                                <DropdownItem>Reservasi Saya</DropdownItem>
                            </Link>
                        )}
                        <DropdownDivider />
                        <DropdownItem onClick={handleLogout}>Keluar</DropdownItem>
                    </Dropdown>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link to="/login" className="text-sm text-gray-600 hover:text-rose-400">
                            Masuk
                        </Link>
                        <Link
                            to="/register"
                            className="text-sm px-4 py-2 rounded text-white"
                            style={{ backgroundColor: 'var(--rose)' }}
                        >
                            Daftar
                        </Link>
                    </div>
                )}
                <NavbarToggle />
            </div>

            {/* Menu tengah */}
            <NavbarCollapse>
                {isCustomer && (
                    <>
                        <NavbarLink as={Link} to="/booking">Booking</NavbarLink>
                        <NavbarLink as={Link} to="/my-bookings">Reservasi Saya</NavbarLink>
                    </>
                )}
                {isAdmin && (
                    <>
                        <NavbarLink as={Link} to="/dashboard">Dashboard</NavbarLink>
                        <NavbarLink as={Link} to="/admin/services">Layanan</NavbarLink>
                        <NavbarLink as={Link} to="/admin/reservations">Reservasi</NavbarLink>
                        <NavbarLink as={Link} to="/admin/payments">Pembayaran</NavbarLink>
                        <NavbarLink as={Link} to="/admin/reports">Laporan</NavbarLink>
                    </>
                )}
            </NavbarCollapse>
        </Navbar>
    )
}