import { Outlet, NavLink } from "react-router-dom";

export const Layout = () => {
    // Clase para el enlace activo (se pone oscuro cuando estás en esa página)
    const navLinkClass = ({ isActive }) =>
        isActive
            ? "bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
            : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Barra de Navegación */}
            <nav className="bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className="text-white font-bold text-xl">🥗 MealPlanner</span>
                            </div>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    <NavLink to="/" className={navLinkClass}>
                                        Planificador
                                    </NavLink>
                                    <NavLink to="/recipes" className={navLinkClass}>
                                        Recetas
                                    </NavLink>
                                    <NavLink to="/shopping-list" className={navLinkClass}>
                                        Lista de Compra
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Aquí se renderizará el contenido de cada página */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
};