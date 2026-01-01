import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    PlusIcon,
    UserIcon,
    MagnifyingGlassIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';

export const RecipesPage = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // --- ESTADOS PARA FILTROS ---
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all"); // 'all' o 'mine'

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        try {
            const res = await api.get('meals/');
            setRecipes(res.data);
        } catch (error) {
            console.error("Error cargando recetas", error);
        } finally {
            setLoading(false);
        }
    };

    // --- LÓGICA DE FILTRADO ---
    const filteredRecipes = recipes.filter((meal) => {
        // 1. Filtro por Texto (Nombre o Ingredientes)
        const textLower = searchTerm.toLowerCase();
        const matchesText =
            meal.name.toLowerCase().includes(textLower) ||
            meal.ingredients.some(ing => ing.ingredient_name.toLowerCase().includes(textLower));

        // 2. Filtro por Propiedad (Todas o Mías)
        const matchesType = filterType === 'mine'
            ? meal.owner_name === user?.username
            : true;

        return matchesText && matchesType;
    });

    if (loading) return <div className="p-10 text-center text-gray-500">Cargando libro de cocina...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24 font-sans">

            {/* CABECERA Y BUSCADOR */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Libro de Recetas</h1>
                    <p className="text-gray-500 mt-1">Explora {recipes.length} deliciosos platos de tu grupo</p>
                </div>

                <Link
                    to="/recipes/new"
                    className="bg-gray-900 text-white px-5 py-3 rounded-full flex items-center gap-2 hover:bg-gray-800 transition shadow-lg hover:shadow-xl font-medium"
                >
                    <PlusIcon className="w-5 h-5" /> Nueva Receta
                </Link>
            </div>

            {/* BARRA DE HERRAMIENTAS (BUSCADOR + FILTROS) */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center">

                {/* INPUT DE BÚSQUEDA */}
                <div className="relative flex-1 w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                        placeholder="Buscar por nombre o ingrediente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* BOTONES DE FILTRO (PILLS) */}
                <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filterType === 'all'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFilterType('mine')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filterType === 'mine'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Solo Mías
                    </button>
                </div>

            </div>

            {/* RESULTADOS */}
            {filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredRecipes.map((meal) => {
                        const isOwner = meal.owner_name === user?.username;

                        return (
                            <Link
                                to={`/recipes/${meal.id}`}
                                key={meal.id}
                                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
                            >
                                {/* IMAGEN ZOOM */}
                                <div className="h-52 overflow-hidden relative bg-gray-100">
                                    {meal.image ? (
                                        <img
                                            src={meal.image}
                                            alt={meal.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                            <span className="text-5xl">🍳</span>
                                        </div>
                                    )}

                                    {/* Badge "Mía" */}
                                    {isOwner && (
                                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm border border-blue-100">
                                            Mía
                                        </span>
                                    )}
                                </div>

                                {/* INFO */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors leading-tight">
                                        {meal.name}
                                    </h3>

                                    {/* Resumen de ingredientes (Texto pequeño) */}
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                        {meal.ingredients.length > 0
                                            ? meal.ingredients.map(i => i.ingredient_name).join(', ')
                                            : "Sin ingredientes detallados"
                                        }
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 text-xs font-medium text-gray-400">
                                        <span className="flex items-center gap-1.5">
                                            <UserIcon className="w-3.5 h-3.5" /> {meal.owner_name}
                                        </span>
                                        <span>{meal.base_servings} rac.</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                /* ESTADO VACÍO (SIN RESULTADOS) */
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <FunnelIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No hemos encontrado nada</h3>
                    <p className="text-gray-500">Prueba con otro ingrediente o cambia los filtros.</p>
                    {filterType === 'mine' && (
                        <button
                            onClick={() => setFilterType('all')}
                            className="mt-4 text-blue-600 font-bold hover:underline"
                        >
                            Ver todas las recetas
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};