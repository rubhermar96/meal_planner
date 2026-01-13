import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";

// Iconos (Heroicons)
import {
    HomeIcon,
    CalendarDaysIcon,
    BookOpenIcon,
    ShoppingCartIcon,
    UserGroupIcon,
    UserCircleIcon,
    Bars3Icon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    SunIcon,
    MoonIcon,
    SparklesIcon // Icono para el logo
} from '@heroicons/react/24/outline';

export const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // Para saber en qué ruta estamos
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- GESTIÓN MODO OSCURO ---
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // --- CONFIGURACIÓN DEL MENÚ ---
    const navItems = [
        { to: '/', label: 'Planificador', icon: CalendarDaysIcon },
        { to: '/groups', label: 'Mis Grupos', icon: UserGroupIcon },
        { to: '/recipes', label: 'Recetas', icon: BookOpenIcon },
        { to: '/shopping-list', label: 'Lista Compra', icon: ShoppingCartIcon },
        { to: '/profile', label: 'Mi Perfil', icon: UserCircleIcon },
    ];

    // Componente interno para los enlaces
    const NavLinks = ({ mobile = false }) => (
        <div className="space-y-1">
            {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => mobile && setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                            ? 'bg-[color:hsl(var(--primary))] text-white shadow-md'
                            : 'text-[color:hsl(var(--muted-foreground))] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[color:hsl(var(--foreground))]'
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </NavLink>
                );
            })}
        </div>
    );

    return (
        <div className="min-h-screen bg-[color:hsl(var(--background))] flex transition-colors duration-300">

            {/* 1. SIDEBAR DESKTOP (Oculto en móvil) */}
            <aside className="hidden md:flex w-64 flex-col border-r border-[color:hsl(var(--border))] fixed h-full bg-[color:hsl(var(--card))] z-20">

                {/* LOGO */}
                <div className="h-16 flex items-center px-6 border-b border-[color:hsl(var(--border))]">
                    <div className="w-8 h-8 rounded-lg bg-[color:hsl(var(--primary))] text-white flex items-center justify-center mr-3 shadow-lg shadow-pink-500/20">
                        <SparklesIcon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">MealPlanner</span>
                </div>

                {/* MENÚ DE NAVEGACIÓN */}
                <div className="flex-1 py-6 px-3 overflow-y-auto">
                    <p className="px-3 text-xs font-bold text-[color:hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Menú Principal</p>
                    <NavLinks />
                </div>

                {/* PIE DE SIDEBAR (Usuario y Tema) */}
                <div className="p-4 border-t border-[color:hsl(var(--border))] bg-gray-50/50 dark:bg-black/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-full bg-[color:hsl(var(--secondary))] text-[color:hsl(var(--secondary-foreground))] flex items-center justify-center font-bold shadow-sm border border-yellow-200">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold truncate">{user?.username}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {/* Botón Tema */}
                        <button
                            onClick={toggleTheme}
                            className="flex-1 flex items-center justify-center p-2 rounded-md border border-[color:hsl(var(--border))] bg-[color:hsl(var(--card))] hover:bg-gray-100 dark:hover:bg-gray-800 transition text-[color:hsl(var(--muted-foreground))]"
                            title="Cambiar Tema"
                        >
                            {theme === 'light' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
                        </button>
                        {/* Botón Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex-1 flex items-center justify-center p-2 rounded-md bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-400 transition"
                            title="Cerrar Sesión"
                        >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>


            {/* 2. CONTENIDO PRINCIPAL Y CABECERA MÓVIL */}
            <div className="flex-1 flex flex-col md:ml-64 min-h-screen">

                {/* HEADER MÓVIL (Solo visible en pantallas pequeñas) */}
                <header className="md:hidden h-16 flex items-center justify-between px-4 border-b border-[color:hsl(var(--border))] bg-[color:hsl(var(--background))]/80 backdrop-blur sticky top-0 z-30">
                    <div className="flex items-center gap-2 font-bold text-[color:hsl(var(--primary))]">
                        <SparklesIcon className="w-6 h-6" />
                        <span>MealPlanner</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 text-[color:hsl(var(--foreground))]">
                        <Bars3Icon className="w-7 h-7" />
                    </button>
                </header>

                {/* MENÚ MÓVIL (Overlay deslizante) */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 md:hidden">
                        {/* Fondo oscuro para cerrar al hacer click fuera */}
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}></div>

                        {/* Panel Lateral Móvil */}
                        <div className="absolute top-0 left-0 w-[85%] max-w-[300px] h-full bg-[color:hsl(var(--card))] shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">

                            {/* Cabecera Móvil */}
                            <div className="h-16 flex items-center px-6 border-b border-[color:hsl(var(--border))] justify-between">
                                <span className="font-bold text-lg">Menú</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Links Móvil */}
                            <div className="flex-1 py-6 px-4 overflow-y-auto">
                                <NavLinks mobile={true} />
                            </div>

                            {/* Footer Móvil */}
                            <div className="p-4 border-t border-[color:hsl(var(--border))] bg-gray-50 dark:bg-black/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-[color:hsl(var(--secondary))] text-[color:hsl(var(--secondary-foreground))] flex items-center justify-center font-bold">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold">{user?.username}</p>
                                    </div>
                                </div>
                                {/* Botón Tema */}
                                <button
                                    onClick={toggleTheme}
                                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-[color:hsl(var(--border))] bg-[color:hsl(var(--card))] hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500 mb-4"
                                    title="Cambiar Tema"
                                >
                                    {theme === 'light' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-100 text-red-700 font-bold dark:bg-red-900/20 dark:text-red-400"
                                >
                                    <ArrowRightOnRectangleIcon className="w-5 h-5" /> Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. AQUÍ SE RENDERIZAN TUS PÁGINAS (Outlet) */}
                <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto animate-fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};