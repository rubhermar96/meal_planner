import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { useAuth } from '../../auth/context/AuthContext';
import {
    UserGroupIcon,
    PlusIcon,
    CheckCircleIcon,
    SparklesIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';

// --- SUB-COMPONENTE: Tarjeta de Grupo Individual ---
const GroupCard = ({ group, isActive, onSelect, onInvite }) => {
    const [inviteInput, setInviteInput] = useState("");

    const handleInviteSubmit = (e) => {
        e.preventDefault();
        if (!inviteInput.trim()) return;
        onInvite(group.id, inviteInput);
        setInviteInput("");
    };

    const maxVisible = 4;
    const visibleMembers = group.members_names.slice(0, maxVisible);
    const remainingCount = group.members_names.length - maxVisible;

    return (
        <div className={`card flex flex-col h-full transition-all duration-300 ${isActive
                ? 'ring-2 ring-[color:hsl(var(--primary))] shadow-lg bg-[color:hsl(var(--card))]'
                : 'hover:shadow-md hover:border-[color:hsl(var(--primary))]/30'
            }`}>
            {/* Cabecera */}
            <div className="p-5 pb-0">
                <div className="flex justify-between items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-[color:hsl(var(--secondary))]/20 text-[color:hsl(var(--secondary-foreground))] shrink-0">
                        <UserGroupIcon className="w-6 h-6" />
                    </div>

                    {isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-green-200">
                            Activo
                        </span>
                    ) : (
                        <button
                            onClick={() => onSelect(group)}
                            className="px-3 py-1.5 text-xs font-bold text-[color:hsl(var(--primary))] border border-[color:hsl(var(--primary))]/30 rounded-lg hover:bg-[color:hsl(var(--primary))] hover:text-white transition-colors"
                        >
                            Seleccionar
                        </button>
                    )}
                </div>

                <h3 className="text-lg font-bold text-[color:hsl(var(--foreground))] mt-4 mb-1 truncate">
                    {group.name}
                </h3>
            </div>

            {/* Cuerpo: Miembros */}
            <div className="px-5 py-4 flex-1">
                <p className="text-[10px] font-bold text-[color:hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">
                    Miembros
                </p>
                <div className="flex items-center -space-x-2 overflow-hidden py-1">
                    {visibleMembers.map((member, i) => (
                        <div
                            key={i}
                            // CAMBIO AQUÍ: bg-gray-200 para contraste claro
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-[color:hsl(var(--card))] bg-gray-200 dark:bg-gray-700 text-[10px] font-bold text-gray-700 dark:text-gray-200 uppercase shadow-sm cursor-default"
                            title={member}
                        >
                            {member.charAt(0)}
                        </div>
                    ))}
                    {remainingCount > 0 && (
                        // CAMBIO AQUÍ: bg-gray-300 para el contador
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-[color:hsl(var(--card))] bg-gray-300 dark:bg-gray-600 text-[10px] font-bold text-gray-800 dark:text-gray-200">
                            +{remainingCount}
                        </div>
                    )}
                </div>
            </div>

            {/* Pie: Input */}
            <div className="p-4 bg-[color:hsl(var(--muted))]/30 border-t border-[color:hsl(var(--border))] mt-auto rounded-b-xl">
                <form onSubmit={handleInviteSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={inviteInput}
                        onChange={(e) => setInviteInput(e.target.value)}
                        placeholder="Invitar usuario..."
                        className="flex-1 min-w-0 bg-[color:hsl(var(--background))] border border-[color:hsl(var(--border))] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[color:hsl(var(--primary))]"
                    />
                    <button
                        type="submit"
                        disabled={!inviteInput}
                        className="p-2 bg-[color:hsl(var(--primary))] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        <PaperAirplaneIcon className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export const GroupsPage = () => {
    const { selectGroup, activeGroup } = useAuth();
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        try {
            const res = await api.get('groups/');
            setGroups(res.data);
            if (!activeGroup && res.data.length > 0) {
                selectGroup(res.data[0]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const createGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        try {
            const res = await api.post('groups/', { name: newGroupName });
            setGroups([...groups, res.data]);
            selectGroup(res.data);
            setNewGroupName('');
        } catch (error) {
            alert('Error creando grupo');
        }
    };

    const handleInvite = async (groupId, username) => {
        try {
            await api.post(`groups/${groupId}/add_member/`, { username });
            alert('Invitación enviada correctamente');
            loadGroups();
        } catch (error) {
            alert('Error: Usuario no encontrado');
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-[color:hsl(var(--muted-foreground))] animate-pulse">
            <UserGroupIcon className="w-10 h-10 mb-4 text-[color:hsl(var(--primary))]" />
            <p>Cargando tus grupos...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto py-8 font-sans animate-fade-in space-y-10 px-4">

            {/* CABECERA */}
            <div>
                <h1 className="text-3xl font-bold text-[color:hsl(var(--foreground))] tracking-tight">Mis Grupos</h1>
                <p className="text-[color:hsl(var(--muted-foreground))] mt-1">
                    Gestiona los espacios donde compartes tus recetas y planificaciones.
                </p>
            </div>

            {/* PANEL GRUPO ACTIVO */}
            <div className="rounded-2xl bg-gradient-to-br from-[color:hsl(var(--primary))] to-[color:hsl(var(--primary))]/80 text-white p-6 md:p-10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest mb-3 opacity-90">
                            <SparklesIcon className="w-4 h-4" /> Cocinando ahora en
                        </div>
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight">
                            {activeGroup?.name || 'Ninguno'}
                        </h2>
                        <p className="text-sm opacity-90 max-w-lg">
                            Todas las recetas que crees y las comidas que planifiques se asignarán a este grupo automáticamente.
                        </p>
                    </div>

                    <div className="shrink-0 bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/30 flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span className="font-bold text-sm">Grupo Activo</span>
                    </div>
                </div>
            </div>

            {/* GRID */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. TARJETA CREAR */}
                <div className="rounded-xl border-2 border-dashed border-[color:hsl(var(--border))] bg-[color:hsl(var(--background))] hover:border-[color:hsl(var(--primary))] hover:bg-[color:hsl(var(--primary))]/5 transition-all p-6 flex flex-col items-center justify-center text-center h-full min-h-[280px]">
                    <div className="w-14 h-14 rounded-full bg-[color:hsl(var(--muted))] flex items-center justify-center mb-4 shadow-sm">
                        <PlusIcon className="w-7 h-7 text-[color:hsl(var(--primary))]" />
                    </div>
                    <h3 className="font-bold text-[color:hsl(var(--foreground))] text-lg mb-2">Nuevo Grupo</h3>

                    <form onSubmit={createGroup} className="w-full max-w-[220px] mt-2">
                        <input
                            type="text"
                            placeholder="Nombre del grupo..."
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            className="w-full text-center text-sm bg-transparent border-b border-[color:hsl(var(--border))] focus:border-[color:hsl(var(--primary))] outline-none py-2 mb-4 transition-colors placeholder:text-[color:hsl(var(--muted-foreground))]"
                        />
                        {/* CAMBIO AQUÍ: Botón con btn-primary (Berry) */}
                        <button
                            type="submit"
                            disabled={!newGroupName.trim()}
                            className="w-full btn-primary py-2 px-4 shadow-md shadow-pink-500/20 disabled:opacity-50 disabled:shadow-none"
                        >
                            Crear Grupo
                        </button>
                    </form>
                </div>

                {/* 2. TARJETAS GRUPOS */}
                {groups.map(group => (
                    <GroupCard
                        key={group.id}
                        group={group}
                        isActive={activeGroup?.id === group.id}
                        onSelect={selectGroup}
                        onInvite={handleInvite}
                    />
                ))}
            </div>
        </div>
    );
};
