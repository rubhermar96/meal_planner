import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { RecipePDF } from '../components/RecipePDF';
import {
    PencilSquareIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    UserIcon,
    ArrowLeftIcon,
    UsersIcon,
    MinusIcon, // <--- Nuevo icono
    PlusIcon   // <--- Nuevo icono
} from '@heroicons/react/24/outline';

export const RecipeDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);

    // ESTADO NUEVO: Raciones que el usuario quiere calcular
    const [currentServings, setCurrentServings] = useState(0);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const res = await api.get(`meals/${id}/`);
                setRecipe(res.data);
                // Inicializamos la calculadora con las raciones base de la receta
                setCurrentServings(res.data.base_servings);
            } catch (error) {
                console.error("Error cargando receta", error);
                navigate('/recipes');
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();
    }, [id, navigate]);

    // --- LÓGICA DE LA CALCULADORA ---
    const increaseServings = () => setCurrentServings(prev => prev + 1);

    const decreaseServings = () => {
        if (currentServings > 1) {
            setCurrentServings(prev => prev - 1);
        }
    };

    const calculateQuantity = (originalQuantity) => {
        // Si no hay cantidad o no es un número (ej: "al gusto"), lo devolvemos tal cual
        if (!originalQuantity) return "";

        const baseQty = parseFloat(originalQuantity);
        if (isNaN(baseQty)) return originalQuantity;

        // Regla de tres: (CantidadBase / RacionesBase) * RacionesActuales
        const result = (baseQty / recipe.base_servings) * currentServings;

        // Redondear a 2 decimales máximo y quitar ceros innecesarios (ej: 5.00 -> 5)
        return parseFloat(result.toFixed(2));
    };
    // --------------------------------

    const handleDelete = async () => {
        if (!confirm("¿Seguro que quieres eliminar esta receta?")) return;
        try {
            await api.delete(`meals/${id}/`);
            navigate('/recipes');
        } catch (error) {
            alert("Error al eliminar.");
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Cargando receta...</div>;
    if (!recipe) return null;

    const isOwner = user && recipe.owner_name === user.username;

    return (
        <div className="max-w-6xl mx-auto px-6 py-8 pb-24 font-sans">

            {/* 1. NAVEGACIÓN SUPERIOR */}
            <div className="mb-6">
                <Link to="/recipes" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition font-medium">
                    <ArrowLeftIcon className="w-5 h-5 mr-2" /> Volver al libro de cocina
                </Link>
            </div>

            {/* 2. CABECERA VISUAL (IMAGEN) */}
            <div className="w-full h-64 md:h-96 bg-gray-100 rounded-3xl overflow-hidden mb-10 shadow-sm relative">
                {recipe.image ? (
                    <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                        <span className="text-6xl">🍳</span>
                    </div>
                )}
            </div>

            {/* 3. TÍTULO Y ACCIONES */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-gray-200 pb-8">

                {/* Título y Meta */}
                <div className="flex-1">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                        {recipe.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm md:text-base">

                        {/* CALCULADORA DE RACIONES INTERACTIVA */}
                        <div className="flex items-center gap-3 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full font-medium select-none shadow-sm border border-blue-100">
                            <UsersIcon className="w-5 h-5" />

                            <div className="flex items-center gap-3 border-l border-blue-200 pl-3 ml-1">
                                <button
                                    onClick={decreaseServings}
                                    className="w-6 h-6 flex items-center justify-center bg-white rounded-full hover:bg-blue-100 text-blue-600 shadow-sm transition active:scale-90"
                                    title="Menos raciones"
                                >
                                    <MinusIcon className="w-3 h-3 stroke-2" />
                                </button>

                                <span className="font-bold w-4 text-center text-lg">{currentServings}</span>

                                <button
                                    onClick={increaseServings}
                                    className="w-6 h-6 flex items-center justify-center bg-white rounded-full hover:bg-blue-100 text-blue-600 shadow-sm transition active:scale-90"
                                    title="Más raciones"
                                >
                                    <PlusIcon className="w-3 h-3 stroke-2" />
                                </button>
                            </div>
                            <span className="text-sm ml-1 hidden sm:inline">raciones</span>
                        </div>

                        {/* Dueño */}
                        <div className="flex items-center gap-2">
                            <UserIcon className="w-5 h-5" />
                            <span>Receta de <span className="font-semibold text-gray-700">{recipe.owner_name}</span></span>
                        </div>
                    </div>
                </div>

                {/* Botonera */}
                <div className="flex flex-wrap gap-3">
                    <PDFDownloadLink
                        document={<RecipePDF recipe={recipe} />}
                        fileName={`Receta_${recipe.name}.pdf`}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition font-medium text-sm border border-gray-200"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" /> PDF
                    </PDFDownloadLink>

                    {isOwner && (
                        <>
                            <Link
                                to={`/recipes/edit/${recipe.id}`}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition font-medium text-sm shadow-lg hover:shadow-xl"
                            >
                                <PencilSquareIcon className="w-5 h-5" /> Editar
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-full transition font-medium text-sm border border-transparent hover:border-red-100"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* 4. CONTENIDO PRINCIPAL */}
            <div className="grid md:grid-cols-12 gap-12">

                {/* COLUMNA IZQUIERDA: INGREDIENTES */}
                <div className="md:col-span-4 lg:col-span-4">
                    <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100/50 sticky top-10">
                        <div className="flex justify-between items-baseline mb-6">
                            <h3 className="text-xl font-bold text-gray-900 font-serif">Ingredientes</h3>
                            {/* Indicador visual de que las cantidades han cambiado */}
                            {currentServings !== recipe.base_servings && (
                                <span className="text-xs text-orange-600 font-bold bg-orange-100 px-2 py-1 rounded">
                                    Ajustado para {currentServings}
                                </span>
                            )}
                        </div>

                        <ul className="space-y-4">
                            {recipe.ingredients.map((ing) => (
                                <li key={ing.id} className="flex items-start justify-between border-b border-orange-200/30 pb-3 last:border-0 last:pb-0">
                                    <span className="text-gray-700 font-medium">{ing.ingredient_name}</span>
                                    <span className="text-gray-900 whitespace-nowrap ml-4 font-bold transition-all duration-300">
                                        {/* AQUÍ SE USA LA FÓRMULA */}
                                        {calculateQuantity(ing.quantity)} <span className="text-sm font-normal text-gray-600">{ing.unit}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {recipe.ingredients.length === 0 && (
                            <p className="text-gray-400 text-sm italic">Sin ingredientes listados.</p>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: INSTRUCCIONES */}
                <div className="md:col-span-8 lg:col-span-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Elaboración</h3>

                    {recipe.instructions ? (
                        <div className="prose prose-lg prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                            {recipe.instructions}
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-8 rounded-2xl text-center">
                            <p className="text-gray-400 italic mb-4">El autor no ha detallado los pasos para esta receta.</p>
                            {isOwner && (
                                <Link to={`/recipes/edit/${recipe.id}`} className="text-blue-600 font-bold hover:underline">
                                    + Añadir instrucciones ahora
                                </Link>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};