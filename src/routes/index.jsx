import { createBrowserRouter } from "react-router-dom"
import App                from "../App"
import Template           from "../Template"
import Login              from "../pages/Login"
import Register           from "../pages/Register"
import Dashboard          from "../pages/Dashboard"
import MyBookings         from "../pages/MyBookings"
import BookingPage        from "../pages/BookingPage"
import ManageServices     from "../pages/ManageServices"
import ManageReservations from "../pages/ManageReservation"
import ManagePayments     from "../pages/ManagePayments"
import Reports            from "../pages/Reports"
import Profile            from "../pages/Profile"
import Unauthorized       from "../pages/Unauthorized"
import { RequireAuth, RequireAdmin, RequireCustomer, RedirectIfLoggedIn } from "../middleware/auth"

// variable yang menyimpan daftar routing, di export biar bisa dipake di file lain
export const router = createBrowserRouter([
    {
        path: "/",
        element: <Template />,
        // mengisi ke outlet di template.jsx
        children: [
            { path: "/",             element: <App /> },
            { path: "/unauthorized", element: <Unauthorized /> },
            { path: "/login",        element: <RedirectIfLoggedIn><Login /></RedirectIfLoggedIn> },
            { path: "/register",     element: <RedirectIfLoggedIn><Register /></RedirectIfLoggedIn> },
            { path: "/booking",      element: <RequireCustomer><BookingPage /></RequireCustomer> },
            { path: "/dashboard",    element: <RequireAuth><Dashboard /></RequireAuth> },
            { path: "/profile",      element: <RequireAuth><Profile /></RequireAuth> },
            { path: "/my-bookings",  element: <RequireCustomer><MyBookings /></RequireCustomer> },
            { path: "/admin/services",     element: <RequireAdmin><ManageServices /></RequireAdmin> },
            { path: "/admin/reservations", element: <RequireAdmin><ManageReservations /></RequireAdmin> },
            { path: "/admin/payments",     element: <RequireAdmin><ManagePayments /></RequireAdmin> },
            { path: "/admin/reports",      element: <RequireAdmin><Reports /></RequireAdmin> },
        ]
    }
])
