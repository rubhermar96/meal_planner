import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Layout = () => {
    const { user, logout } = useAuth(); // <--- Usamos el contexto
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinkClass = ({ isActive }) =>
        isActive
            ? "bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
            : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium";

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* IZQUIERDA: Logo y Menú */}
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className="text-white font-bold text-xl">🥗 MealPlanner</span>
                            </div>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    <NavLink to="/" className={navLinkClass}>Planificador</NavLink>
                                    <NavLink to="/groups" className={navLinkClass}>Grupos</NavLink>
                                    <NavLink to="/recipes" className={navLinkClass}>Recetas</NavLink>
                                    <NavLink to="/shopping-list" className={navLinkClass}>Lista Compra</NavLink>
                                </div>
                            </div>
                        </div>

                        {/* DERECHA: Usuario y Logout */}
                        <div className="flex items-center gap-4">
                            <NavLink to="/profile" className="flex items-center gap-2 text-gray-300 hover:text-white group">
                                {/* Icono de usuario simple */}
                                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold text-white group-hover:bg-gray-500">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium hidden sm:block">{user?.username}</span>
                            </NavLink>

                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide"
                            >
                                Salir
                            </button>
                        </div>

                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
};