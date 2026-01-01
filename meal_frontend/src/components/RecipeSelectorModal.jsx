import { useState, useEffect } from 'react';
import api from '../api/axios';
import { MagnifyingGlassIcon, BuildingStorefrontIcon, BookOpenIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
        // Resetear estados al abrir
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
        // Enviamos estructura de Receta
        onSave({
            meal: meal.id,
            target_servings: servings, // Para recetas mandamos raciones
            is_eating_out: false
        });
    };

    const handleSaveEatOut = () => {
        if (!restaurantName.trim()) return alert("Escribe un nombre");
        // Enviamos estructura de Comer Fuera
        onSave({
            meal: null,
            custom_name: restaurantName,
            is_eating_out: true,
            target_servings: 1 // Valor por defecto para que no falle el backend
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">

                {/* CABECERA */}
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{slotLabel}</h3>
                        <p className="text-xs text-gray-500">{date}</p>
                    </div>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" /></button>
                </div>

                {/* PESTAÑAS */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('recipes')}
                        className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'recipes' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <BookOpenIcon className="w-4 h-4" /> Recetas
                    </button>
                    <button
                        onClick={() => setActiveTab('out')}
                        className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'out' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <BuildingStorefrontIcon className="w-4 h-4" /> Comer Fuera
                    </button>
                </div>

                {/* CONTENIDO */}
                <div className="p-4 overflow-y-auto flex-1">

                    {/* --- PESTAÑA RECETAS --- */}
                    {activeTab === 'recipes' && (
                        <>
                            <div className="flex gap-2 mb-4">
                                <div className="relative flex-1">
                                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    value={servings}
                                    onChange={e => setServings(e.target.value)}
                                    className="w-16 p-2 bg-gray-100 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                    title="Raciones"
                                />
                            </div>
                            <div className="space-y-2">
                                {filteredRecipes.map(meal => (
                                    <button
                                        key={meal.id}
                                        onClick={() => handleSaveRecipe(meal)}
                                        className="w-full text-left p-2 hover:bg-blue-50 rounded-lg flex items-center gap-3 transition group border border-transparent hover:border-blue-100"
                                    >
                                        <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden shrink-0">
                                            {meal.image ? <img src={meal.image} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-lg">🍳</span>}
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-700 group-hover:text-blue-700 block text-sm">{meal.name}</span>
                                            <span className="text-xs text-gray-400">{meal.base_servings} rac. base</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* --- PESTAÑA COMER FUERA --- */}
                    {activeTab === 'out' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BuildingStorefrontIcon className="w-10 h-10" />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2">¿Dónde vas a comer?</h4>
                            <input
                                type="text"
                                placeholder="Ej: Pizzería Luigi..."
                                className="w-full border border-gray-300 p-3 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-orange-500 text-center font-medium"
                                value={restaurantName}
                                onChange={e => setRestaurantName(e.target.value)}
                                autoFocus
                            />
                            <button
                                onClick={handleSaveEatOut}
                                className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition shadow-lg"
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