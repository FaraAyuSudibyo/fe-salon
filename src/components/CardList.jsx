import CardComp from "./CardComp"

export default function CardList({ services, isAdmin, isLoggedIn }) {
    if (!services.length) {
        return <p className="text-center text-gray-400 py-10">Layanan tidak ditemukan</p>
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map(service => (
                <CardComp
                    key={service.id}
                    service={service}
                    isAdmin={isAdmin}
                    isLoggedIn={isLoggedIn}
                />
            ))}
        </div>
    )
}
