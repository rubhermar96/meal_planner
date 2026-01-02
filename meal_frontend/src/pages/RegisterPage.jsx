import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon,
    SparklesIcon,
    ArrowRightIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export const RegisterPage = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError('Error al registrarse. El usuario o email ya existen.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[color:hsl(var(--background))] relative overflow-hidden p-6 font-sans">

            {/* FONDO DECORATIVO ATMOSFÉRICO */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Invertimos los colores respecto al login para dar dinamismo */}
                <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-[color:hsl(var(--secondary))] opacity-[0.2] blur-[100px] animate-pulse-slow"></div>
                <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[color:hsl(var(--primary))] opacity-[0.15] blur-[100px]"></div>
            </div>

            {/* CONTENEDOR PRINCIPAL */}
            <div className="w-full max-w-sm relative z-10 animate-fade-in space-y-10 text-center md:text-left">

                {/* CABECERA */}
                <div className="flex flex-col items-center md:items-start">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[color:hsl(var(--primary))] to-[color:hsl(var(--primary))]/80 text-white mb-6 shadow-lg shadow-pink-500/30 ring-4 ring-[color:hsl(var(--background))]">
                        <SparklesIcon className="w-7 h-7" />
                    </div>
                    <h2 className="text-4xl font-extrabold text-[color:hsl(var(--foreground))] tracking-tight leading-none">
                        Crea tu cuenta
                    </h2>
                    <p className="text-lg text-[color:hsl(var(--muted-foreground))] mt-3 font-medium">
                        Únete para planificar tus menús y compartir recetas.
                    </p>
                </div>

                {/* ERROR Y FORMULARIO */}
                <div className="space-y-6">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-3 animate-pulse shadow-sm dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-300">
                            <ExclamationCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Input Usuario */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[color:hsl(var(--foreground))] ml-1 flex items-center gap-2">
                                Usuario
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                    <UserIcon className="h-5 w-5 text-[color:hsl(var(--muted-foreground))] group-focus-within:text-[color:hsl(var(--primary))] transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: nuevo_chef"
                                    className="input pl-12 py-3 h-auto text-base bg-[color:hsl(var(--background))]/80 backdrop-blur-md shadow-sm border-[color:hsl(var(--border))]/50 focus:border-[color:hsl(var(--primary))] hover:border-[color:hsl(var(--border))]"
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Input Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[color:hsl(var(--foreground))] ml-1 flex items-center gap-2">
                                Email
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                    <EnvelopeIcon className="h-5 w-5 text-[color:hsl(var(--muted-foreground))] group-focus-within:text-[color:hsl(var(--primary))] transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder="tu@email.com"
                                    className="input pl-12 py-3 h-auto text-base bg-[color:hsl(var(--background))]/80 backdrop-blur-md shadow-sm border-[color:hsl(var(--border))]/50 focus:border-[color:hsl(var(--primary))] hover:border-[color:hsl(var(--border))]"
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Input Contraseña */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[color:hsl(var(--foreground))] ml-1 flex items-center gap-2">
                                Contraseña
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                    <LockClosedIcon className="h-5 w-5 text-[color:hsl(var(--muted-foreground))] group-focus-within:text-[color:hsl(var(--primary))] transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="input pl-12 py-3 h-auto text-base bg-[color:hsl(var(--background))]/80 backdrop-blur-md shadow-sm border-[color:hsl(var(--border))]/50 focus:border-[color:hsl(var(--primary))] hover:border-[color:hsl(var(--border))]"
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Botón Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3.5 text-base shadow-xl shadow-pink-500/30 group relative overflow-hidden mt-4"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creando cuenta...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2 font-bold">
                                    Registrarse <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                {/* FOOTER */}
                <div className="text-center text-[color:hsl(var(--muted-foreground))] font-medium">
                    <p>
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className="font-bold text-[color:hsl(var(--primary))] hover:underline transition-all">
                            Entra aquí
                        </Link>
                    </p>
                </div>
            </div>

        </div>
    );
};