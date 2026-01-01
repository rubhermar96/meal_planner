import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const GroupsPage = () => {
    const { selectGroup, activeGroup } = useAuth();
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [inviteUser, setInviteUser] = useState(''); // Para el input de invitar

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        try {
            const res = await api.get('groups/');
            setGroups(res.data);
            // Si no tenemos grupo activo y cargamos lista, seleccionamos el primero por defecto
            if (!activeGroup && res.data.length > 0) {
                selectGroup(res.data[0]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const createGroup = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('groups/', { name: newGroupName });
            setGroups([...groups, res.data]);
            selectGroup(res.data); // Lo seleccionamos automáticamente
            setNewGroupName('');
        } catch (error) {
            alert('Error creando grupo');
        }
    };

    const handleInvite = async (groupId) => {
        if (!inviteUser) return;
        try {
            await api.post(`groups/${groupId}/add_member/`, { username: inviteUser });
            alert('Usuario añadido correctamente');
            setInviteUser('');
            loadGroups(); // Recargar para ver si actualiza miembros (si el back lo devuelve)
        } catch (error) {
            alert('Error: Usuario no encontrado');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Mis Grupos</h1>

            {/* Selector de Grupo Activo */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-8 flex justify-between items-center">
                <div>
                    <p className="text-sm text-blue-600 font-bold uppercase">Grupo Activo</p>
                    <h2 className="text-2xl font-bold text-blue-900">{activeGroup?.name || 'Ninguno seleccionado'}</h2>
                </div>
                <div className="text-sm text-blue-800">
                    Todo lo que planifiques se guardará aquí.
                </div>
            </div>

            {/* Lista de Grupos */}
            <div className="grid md:grid-cols-2 gap-6">

                {/* Card: Crear Nuevo */}
                <div className="bg-white p-6 rounded-xl shadow border border-dashed border-gray-300 flex flex-col justify-center items-center text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Crear Nuevo Grupo</h3>
                    <form onSubmit={createGroup} className="w-full">
                        <input
                            type="text"
                            placeholder="Ej: Casa de la Playa"
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            className="w-full border p-2 rounded mb-2 text-center"
                        />
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-bold w-full hover:bg-green-700">
                            + Crear
                        </button>
                    </form>
                </div>

                {/* Cards: Grupos Existentes */}
                {groups.map(group => (
                    <div key={group.id} className={`bg-white p-6 rounded-xl shadow border ${activeGroup?.id == group.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
                            {activeGroup?.id != group.id && (
                                <button onClick={() => selectGroup(group)} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">
                                    Seleccionar
                                </button>
                            )}
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Miembros:</p>
                            <div className="flex flex-wrap gap-2">
                                {group.members_names.map((member, i) => (
                                    <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{member}</span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                            <input
                                type="text"
                                placeholder="Usuario o Email"
                                className="flex-1 border p-1 rounded text-sm"
                                onChange={e => setInviteUser(e.target.value)}
                            />
                            <button onClick={() => handleInvite(group.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                                Invitar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};