import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    MagnifyingGlassIcon,
    BuildingStorefrontIcon,
    BookOpenIcon,
    XMarkIcon,
    CalendarIcon,
    UsersIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';

export const RecipeSelectorModal = ({ isOpen, onClose, onSave, date, slotLabel }) => {
    const [activeTab, setActiveTab] = useState('recipes'); // 'recipes' | 'out'
    const [recipes, setRecipes] = useState([]);
    const [search, setSearch] = useState("");

    // Datos para Comer Fuera
    const [restaurantName, setRestaurantName] = useState("");

    // Datos para Receta (Raciones objetivo)
    const [servings, setServings] = useState(2);

    useEffect(() => {
        if (isOpen && activeTab === 'recipes') {
            fetchRecipes();
        }
        if (isOpen) {
            setRestaurantName("");
            setServings(2);
            setSearch("");
        }
    }, [isOpen, activeTab]);

    const fetchRecipes = async () => {
        try {
            const res = await api.get('meals/');
            setRecipes(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const filteredRecipes = recipes.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSaveRecipe = (meal) => {
        onSave({
            meal: meal.id,
            target_servings: servings,
            is_eating_out: false
        });
    };

    const handleSaveEatOut = () => {
        if (!restaurantName.trim()) return alert("Escribe un nombre");
        onSave({
            meal: null,
            custom_name: restaurantName,
            is_eating_out: true,
            target_servings: 1
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="bg-[color:hsl(var(--card))] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 border border-[color:hsl(var(--border))]">

                {/* CABECERA */}
                <div className="p-5 border-b border-[color:hsl(var(--border))] flex justify-between items-start bg-[color:hsl(var(--muted))]/30">
                    <div>
                        <h3 className="text-lg font-bold text-[color:hsl(var(--foreground))] flex items-center gap-2">
                            {slotLabel}
                        </h3>
                        <p className="text-xs font-medium text-[color:hsl(var(--muted-foreground))] flex items-center gap-1 mt-1">
                            <CalendarIcon className="w-3.5 h-3.5" /> {date}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-[color:hsl(var(--muted))] text-[color:hsl(var(--muted-foreground))] transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* PESTAÑAS (Segmented Control) */}
                <div className="p-4 pb-0">
                    <div className="flex p-1 bg-[color:hsl(var(--muted))] rounded-xl">
                        <button
                            onClick={() => setActiveTab('recipes')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'recipes'
                                ? 'bg-[color:hsl(var(--background))] text-[color:hsl(var(--primary))] shadow-sm'
                                : 'text-[color:hsl(var(--muted-foreground))] hover:text-[color:hsl(var(--foreground))]'
                                }`}
                        >
                            <BookOpenIcon className="w-4 h-4" /> Recetas
                        </button>
                        <button
                            onClick={() => setActiveTab('out')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'out'
                                ? 'bg-[color:hsl(var(--background))] text-orange-600 shadow-sm'
                                : 'text-[color:hsl(var(--muted-foreground))] hover:text-[color:hsl(var(--foreground))]'
                                }`}
                        >
                            <BuildingStorefrontIcon className="w-4 h-4" /> Comer Fuera
                        </button>
                    </div>
                </div>

                {/* CONTENIDO SCROLLABLE */}
                <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">

                    {/* --- PESTAÑA RECETAS --- */}
                    {activeTab === 'recipes' && (
                        <div className="space-y-4">

                            {/* Filtros */}
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-[color:hsl(var(--muted-foreground))]" />
                                    <input
                                        type="text"
                                        placeholder="Buscar receta..."
                                        className="input pl-9 bg-[color:hsl(var(--muted))]/30 h-10 text-sm"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="relative w-20" title="Raciones a cocinar">
                                    <UsersIcon className="absolute left-2 top-2.5 w-4 h-4 text-[color:hsl(var(--muted-foreground))]" />
                                    <input
                                        type="number"
                                        min="1"
                                        value={servings}
                                        onChange={e => setServings(e.target.value)}
                                        className="input pl-8 pr-2 bg-[color:hsl(var(--muted))]/30 h-10 text-sm font-bold text-center"
                                    />
                                </div>
                            </div>

                            {/* Lista Resultados */}
                            <div className="space-y-2">
                                {filteredRecipes.length > 0 ? (
                                    filteredRecipes.map(meal => (
                                        <button
                                            key={meal.id}
                                            onClick={() => handleSaveRecipe(meal)}
                                            className="w-full text-left p-2 rounded-xl flex items-center gap-3 transition-all hover:bg-[color:hsl(var(--muted))]/50 group border border-transparent hover:border-[color:hsl(var(--border))]"
                                        >
                                            <div className="w-14 h-14 bg-[color:hsl(var(--muted))] rounded-lg overflow-hidden shrink-0 relative">
                                                {meal.image ? (
                                                    <img src={meal.image} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-xl bg-[color:hsl(var(--muted))]/50">🍳</div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <span className="font-bold text-[color:hsl(var(--foreground))] group-hover:text-[color:hsl(var(--primary))] block text-sm truncate transition-colors">
                                                    {meal.name}
                                                </span>
                                                <span className="text-xs text-[color:hsl(var(--muted-foreground))] flex items-center gap-1">
                                                    <UsersIcon className="w-3 h-3" /> {meal.base_servings} rac. base
                                                </span>
                                            </div>

                                            <div className="hover:bg-[color:hsl(var(--primary))]/50 transition-all cursor-pointer text-[color:hsl(var(--primary))] text-xs font-bold px-3 py-1 bg-[color:hsl(var(--primary))]/10 rounded-full">
                                                <PlusIcon className="w-5 h-5" />
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-[color:hsl(var(--muted-foreground))] text-sm">
                                        No se encontraron recetas.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- PESTAÑA COMER FUERA --- */}
                    {activeTab === 'out' && (
                        <div className="text-center py-8 flex flex-col items-center justify-center h-full">
                            <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                                <BuildingStorefrontIcon className="w-10 h-10" />
                            </div>

                            <h4 className="font-bold text-[color:hsl(var(--foreground))] mb-1">¿Dónde vas a comer?</h4>
                            <p className="text-xs text-[color:hsl(var(--muted-foreground))] mb-6">Añade el nombre del restaurante o evento.</p>

                            <input
                                type="text"
                                placeholder="Ej: Pizzería Luigi..."
                                className="input w-full text-center font-medium mb-4 h-12"
                                value={restaurantName}
                                onChange={e => setRestaurantName(e.target.value)}
                                autoFocus
                            />

                            <button
                                onClick={handleSaveEatOut}
                                disabled={!restaurantName.trim()}
                                className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg hover:shadow-orange-500/20 disabled:opacity-50 disabled:shadow-none"
                            >
                                Guardar Plan
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};