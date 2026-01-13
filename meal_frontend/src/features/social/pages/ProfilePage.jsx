import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import {
    UserCircleIcon,
    EnvelopeIcon,
    SparklesIcon,
    CheckCircleIcon,
    XCircleIcon,
    IdentificationIcon
} from '@heroicons/react/24/outline';

export const ProfilePage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: ''
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    // 1. Cargar datos al entrar
    useEffect(() => {
        api.get('users/me/')
            .then(res => {
                setFormData(res.data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    // 2. Guardar cambios
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        try {
            await api.patch('users/me/', formData);
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al actualizar perfil. Inténtalo de nuevo.' });
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-[color:hsl(var(--muted-foreground))] animate-pulse">
            <SparklesIcon className="w-10 h-10 mb-4 text-[color:hsl(var(--primary))]" />
            <p>Cargando tu perfil...</p>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto py-8 font-sans animate-fade-in space-y-8">

            {/* --- CABECERA (SIN TARJETA) --- */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-8 border-b border-[color:hsl(var(--border))]">

                {/* Avatar Grande */}
                <div className="w-24 h-24 rounded-full bg-[color:hsl(var(--secondary))] flex items-center justify-center text-3xl font-bold text-[color:hsl(var(--secondary-foreground))] shadow-sm shrink-0">
                    {formData.username?.charAt(0).toUpperCase()}
                </div>

                <div className="text-center md:text-left space-y-1">
                    <h1 className="text-3xl font-bold text-[color:hsl(var(--foreground))] tracking-tight">
                        {formData.first_name || formData.username} {formData.last_name}
                    </h1>
                    <p className="text-[color:hsl(var(--muted-foreground))]">
                        Configuración de cuenta y datos personales
                    </p>
                    <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[color:hsl(var(--primary))]/10 text-[color:hsl(var(--primary))]">
                            <SparklesIcon className="w-3.5 h-3.5" /> Cuenta Activa
                        </span>
                    </div>
                </div>
            </div>

            {/* --- MENSAJES DE ALERTA --- */}
            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium border ${message.type === 'success'
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900'
                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'
                    }`}>
                    {message.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* --- FORMULARIO --- */}
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Sección 1: Datos de Cuenta */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[color:hsl(var(--foreground))]">Datos de Cuenta</h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Usuario (Disabled) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[color:hsl(var(--muted-foreground))] flex items-center gap-2">
                                <UserCircleIcon className="w-4 h-4" /> Usuario
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                disabled
                                className="input bg-[color:hsl(var(--muted))]/50 text-[color:hsl(var(--muted-foreground))] opacity-70 cursor-not-allowed border-dashed"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[color:hsl(var(--foreground))] flex items-center gap-2">
                                <EnvelopeIcon className="w-4 h-4 text-[color:hsl(var(--primary))]" /> Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="input bg-[color:hsl(var(--background))]"
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-[color:hsl(var(--border))]" />

                {/* Sección 2: Información Personal */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[color:hsl(var(--foreground))]">Información Personal</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[color:hsl(var(--foreground))]">Nombre</label>
                            <input
                                type="text"
                                value={formData.first_name}
                                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                className="input bg-[color:hsl(var(--background))]"
                                placeholder="Ej: Juan"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[color:hsl(var(--foreground))]">Apellidos</label>
                            <input
                                type="text"
                                value={formData.last_name}
                                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                className="input bg-[color:hsl(var(--background))]"
                                placeholder="Ej: Pérez"
                            />
                        </div>
                    </div>
                </div>

                {/* Botón Guardar */}
                <div className="pt-6">
                    <button
                        type="submit"
                        className="btn-primary w-full md:w-auto shadow-md shadow-pink-500/20 px-8"
                    >
                        <IdentificationIcon className="w-5 h-5 mr-2" />
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
};
