import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    PlusIcon,
    UserIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    SparklesIcon
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
        const textLower = searchTerm.toLowerCase();
        const matchesText =
            meal.name.toLowerCase().includes(textLower) ||
            meal.ingredients.some(ing => ing.ingredient_name.toLowerCase().includes(textLower));

        const matchesType = filterType === 'mine'
            ? meal.owner_name === user?.username
            : true;

        return matchesText && matchesType;
    });

    // --- RENDERIZADO DE CARGA ---
    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-muted-foreground animate-pulse">
            <SparklesIcon className="w-10 h-10 mb-4 text-[color:hsl(var(--primary))]" />
            <p>Preparando la cocina...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 fade-in">

            {/* --- CABECERA --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[color:hsl(var(--foreground))]">
                        Libro de Recetas
                    </h1>
                    <p className="text-[color:hsl(var(--muted-foreground))] mt-1">
                        Tienes <span className="font-bold text-[color:hsl(var(--foreground))]">{recipes.length}</span> platos listos para cocinar.
                    </p>
                </div>

                <Link
                    to="/recipes/new"
                    className="btn-primary shadow-lg shadow-pink-500/20"
                >
                    <PlusIcon className="w-5 h-5 mr-2" /> Nueva Receta
                </Link>
            </div>

            {/* --- BARRA DE HERRAMIENTAS (Glassmorphism) --- */}
            <div className="flex flex-col md:flex-row gap-4">

                {/* Buscador */}
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        className="input pl-10 bg-[color:hsl(var(--card))]"
                        placeholder="Buscar por nombre o ingrediente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filtros (Segmented Control) */}
                <div className="bg-[color:hsl(var(--input))] p-1 rounded-lg flex shrink-0">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filterType === 'all'
                                ? 'bg-[color:hsl(var(--background))] text-[color:hsl(var(--foreground))] shadow-sm'
                                : 'text-[color:hsl(var(--muted-foreground))] hover:text-[color:hsl(var(--foreground))]'
                            }`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFilterType('mine')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filterType === 'mine'
                                ? 'bg-[color:hsl(var(--background))] text-[color:hsl(var(--primary))] shadow-sm font-bold'
                                : 'text-[color:hsl(var(--muted-foreground))] hover:text-[color:hsl(var(--foreground))]'
                            }`}
                    >
                        Solo Mías
                    </button>
                </div>
            </div>

            {/* --- GRID DE RECETAS --- */}
            {filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRecipes.map((meal) => {
                        const isOwner = meal.owner_name === user?.username;

                        return (
                            <Link
                                to={`/recipes/${meal.id}`}
                                key={meal.id}
                                className="card group overflow-hidden hover:ring-2 hover:ring-[color:hsl(var(--ring))] hover:ring-offset-2 hover:ring-offset-[color:hsl(var(--background))] transition-all duration-300 flex flex-col h-full"
                            >
                                {/* IMAGEN */}
                                <div className="aspect-[4/3] overflow-hidden relative bg-[color:hsl(var(--muted))]">
                                    {meal.image ? (
                                        <img
                                            src={meal.image}
                                            alt={meal.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
                                            🍳
                                        </div>
                                    )}

                                    {/* Badge "Mía" */}
                                    {isOwner && (
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-[color:hsl(var(--background))]/90 backdrop-blur text-[color:hsl(var(--primary))] text-[10px] font-bold px-2 py-1 rounded-full border border-[color:hsl(var(--primary))]/20 shadow-sm">
                                                MÍA
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* CONTENIDO */}
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg text-[color:hsl(var(--foreground))] mb-1 leading-tight group-hover:text-[color:hsl(var(--primary))] transition-colors">
                                        {meal.name}
                                    </h3>

                                    <p className="text-sm text-[color:hsl(var(--muted-foreground))] mb-4 line-clamp-2 leading-relaxed">
                                        {meal.ingredients.length > 0
                                            ? meal.ingredients.map(i => i.ingredient_name).join(', ')
                                            : "Sin ingredientes detallados"}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-[color:hsl(var(--border))] flex items-center justify-between text-xs font-medium text-[color:hsl(var(--muted-foreground))]">
                                        <span className="flex items-center gap-1.5">
                                            <UserIcon className="w-3.5 h-3.5" />
                                            {isOwner ? 'Tú' : meal.owner_name}
                                        </span>
                                        <span className="bg-[color:hsl(var(--secondary))]/30 text-[color:hsl(var(--secondary-foreground))] px-2 py-0.5 rounded-md">
                                            {meal.base_servings} rac.
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                /* --- ESTADO VACÍO --- */
                <div className="flex flex-col items-center justify-center py-20 text-center card bg-dashed border-dashed bg-gray-50/50 dark:bg-transparent">
                    <div className="w-16 h-16 bg-[color:hsl(var(--muted))] rounded-full flex items-center justify-center mb-4 text-[color:hsl(var(--muted-foreground))]">
                        <FunnelIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-[color:hsl(var(--foreground))]">No se encontraron recetas</h3>
                    <p className="text-[color:hsl(var(--muted-foreground))] mt-1 max-w-sm">
                        Intenta ajustar los filtros o busca otro ingrediente.
                    </p>
                    {filterType === 'mine' && (
                        <button
                            onClick={() => setFilterType('all')}
                            className="mt-4 text-[color:hsl(var(--primary))] font-bold hover:underline text-sm"
                        >
                            Ver recetas del grupo
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};