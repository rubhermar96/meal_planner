import { useState, useEffect } from 'react';
import api from '../api/axios';

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
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al actualizar perfil' });
        }
    };

    if (loading) return <div className="p-8">Cargando perfil...</div>;

    return (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-200 mt-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Mi Perfil</h1>

            {message && (
                <div className={`p-3 rounded mb-4 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Usuario</label>
                    <input
                        type="text"
                        value={formData.username}
                        disabled // No dejamos cambiar usuario por seguridad simple
                        className="w-full border border-gray-200 bg-gray-100 p-2 rounded text-gray-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                            type="text"
                            value={formData.first_name}
                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                        <input
                            type="text"
                            value={formData.last_name}
                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow">
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
};