import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import api from '../../../api/axios';
import { useAuth } from '../../auth/context/AuthContext';
import { RecipePDF } from '../components/RecipePDF';
import {
    PencilSquareIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    UserIcon,
    ArrowLeftIcon,
    UsersIcon,
    MinusIcon,
    PlusIcon,
    SparklesIcon,
    ClockIcon
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
        if (!originalQuantity) return "";
        const baseQty = parseFloat(originalQuantity);
        if (isNaN(baseQty)) return originalQuantity;

        // Regla de tres
        const result = (baseQty / recipe.base_servings) * currentServings;
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

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-muted-foreground animate-pulse">
            <SparklesIcon className="w-10 h-10 mb-4 text-[color:hsl(var(--primary))]" />
            <p>Buscando en el recetario...</p>
        </div>
    );

    if (!recipe) return null;

    const isOwner = user && recipe.owner_name === user.username;

    return (
        <div className="max-w-5xl mx-auto pb-24 font-sans animate-fade-in space-y-8">

            {/* 1. NAVEGACIÓN SUPERIOR */}
            <div>
                <Link to="/recipes" className="btn-ghost pl-0 hover:bg-transparent hover:text-[color:hsl(var(--primary))] transition-colors">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" /> Volver al libro de cocina
                </Link>
            </div>

            {/* 2. CABECERA VISUAL (HERO) */}
            <div className="relative w-full aspect-video md:aspect-[21/9] bg-[color:hsl(var(--muted))] rounded-3xl overflow-hidden shadow-2xl border border-[color:hsl(var(--border))]">
                {recipe.image ? (
                    <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[color:hsl(var(--muted-foreground))]">
                        <span className="text-6xl mb-4">🍳</span>
                        <p>Sin imagen disponible</p>
                    </div>
                )}
                {/* Degradado para texto superpuesto (opcional para futuro) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            </div>

            {/* 3. TÍTULO Y CONTROLES */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 border-b border-[color:hsl(var(--border))] pb-8">

                <div className="flex-1 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[color:hsl(var(--foreground))] tracking-tight leading-none">
                        {recipe.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-[color:hsl(var(--muted-foreground))] text-sm">

                        {/* CALCULADORA DE RACIONES (Diseño Capsula) */}
                        <div className="flex items-center gap-2 bg-[color:hsl(var(--card))] border border-[color:hsl(var(--border))] pl-2 pr-4 py-1.5 rounded-full shadow-sm select-none">
                            <div className="w-8 h-8 flex items-center justify-center bg-[color:hsl(var(--primary))]/10 text-[color:hsl(var(--primary))] rounded-full">
                                <UsersIcon className="w-4 h-4" />
                            </div>

                            <div className="flex items-center gap-3 border-l border-[color:hsl(var(--border))] pl-3 ml-1">
                                <button
                                    onClick={decreaseServings}
                                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[color:hsl(var(--muted))] hover:text-[color:hsl(var(--primary))] transition active:scale-90"
                                >
                                    <MinusIcon className="w-3 h-3 stroke-[3]" />
                                </button>

                                <span className="font-bold text-lg text-[color:hsl(var(--foreground))] tabular-nums w-4 text-center">
                                    {currentServings}
                                </span>

                                <button
                                    onClick={increaseServings}
                                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[color:hsl(var(--muted))] hover:text-[color:hsl(var(--primary))] transition active:scale-90"
                                >
                                    <PlusIcon className="w-3 h-3 stroke-[3]" />
                                </button>
                            </div>
                            <span className="text-xs font-medium uppercase tracking-wider ml-1">Raciones</span>
                        </div>

                        {/* Autor */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-[color:hsl(var(--muted))] transition-colors">
                            <UserIcon className="w-4 h-4" />
                            <span>Por <span className="font-semibold text-[color:hsl(var(--foreground))]">{recipe.owner_name}</span></span>
                        </div>
                    </div>
                </div>

                {/* BOTONERA DE ACCIONES */}
                <div className="flex flex-wrap gap-3">
                    <PDFDownloadLink
                        document={<RecipePDF recipe={recipe} />}
                        fileName={`Receta_${recipe.name}.pdf`}
                        className="btn-secondary shadow-sm"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" /> PDF
                    </PDFDownloadLink>

                    {isOwner && (
                        <>
                            <Link
                                to={`/recipes/edit/${recipe.id}`}
                                className="btn-primary shadow-lg shadow-pink-500/20"
                            >
                                <PencilSquareIcon className="w-5 h-5 mr-2" /> Editar
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-transparent hover:border-red-100"
                                title="Eliminar Receta"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* 4. CONTENIDO PRINCIPAL (GRID) */}
            <div className="grid md:grid-cols-12 gap-8 lg:gap-12">

                {/* COLUMNA IZQUIERDA: INGREDIENTES (Card Sticky) */}
                <div className="md:col-span-4 lg:col-span-4">
                    <div className="card sticky top-24 overflow-hidden border-l-4 border-l-[color:hsl(var(--secondary))]">
                        <div className="p-6">
                            <div className="flex justify-between items-baseline mb-6">
                                <h3 className="text-xl font-bold font-serif text-[color:hsl(var(--foreground))]">
                                    Ingredientes
                                </h3>
                                {/* Badge si se han cambiado las raciones */}
                                {currentServings !== recipe.base_servings && (
                                    <span className="text-[10px] font-bold bg-[color:hsl(var(--secondary))] text-[color:hsl(var(--secondary-foreground))] px-2 py-0.5 rounded-full uppercase tracking-wide">
                                        Ajustado
                                    </span>
                                )}
                            </div>

                            <ul className="space-y-4">
                                {recipe.ingredients.map((ing) => (
                                    <li key={ing.id} className="flex items-start justify-between border-b border-dashed border-[color:hsl(var(--border))] pb-3 last:border-0 last:pb-0">
                                        <span className="text-[color:hsl(var(--foreground))] font-medium text-sm">
                                            {ing.ingredient_name}
                                        </span>

                                        <div className="flex items-baseline gap-1 ml-4 text-right">
                                            <span className="text-[color:hsl(var(--foreground))] font-bold text-base transition-all duration-300">
                                                {calculateQuantity(ing.quantity)}
                                            </span>
                                            <span className="text-[color:hsl(var(--muted-foreground))] text-xs font-normal">
                                                {ing.unit}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {recipe.ingredients.length === 0 && (
                                <div className="text-center py-8 text-[color:hsl(var(--muted-foreground))]">
                                    <p className="text-sm italic">No hay ingredientes listados.</p>
                                </div>
                            )}
                        </div>
                        {/* Decoración inferior */}
                        <div className="h-1 bg-gradient-to-r from-[color:hsl(var(--secondary))] to-transparent opacity-50" />
                    </div>
                </div>

                {/* COLUMNA DERECHA: INSTRUCCIONES */}
                <div className="md:col-span-8 lg:col-span-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-1 bg-[color:hsl(var(--primary))] rounded-full" />
                        <h3 className="text-2xl font-bold text-[color:hsl(var(--foreground))] font-serif">
                            Elaboración
                        </h3>
                    </div>

                    {recipe.instructions ? (
                        <div className="prose prose-lg dark:prose-invert prose-gray max-w-none leading-relaxed whitespace-pre-line text-[color:hsl(var(--foreground)/0.9)]">
                            {recipe.instructions}
                        </div>
                    ) : (
                        <div className="card p-10 text-center border-dashed bg-[color:hsl(var(--muted))]/30">
                            <p className="text-[color:hsl(var(--muted-foreground))] italic mb-4">
                                El autor no ha detallado los pasos para esta receta.
                            </p>
                            {isOwner && (
                                <Link to={`/recipes/edit/${recipe.id}`} className="text-[color:hsl(var(--primary))] font-bold hover:underline">
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
