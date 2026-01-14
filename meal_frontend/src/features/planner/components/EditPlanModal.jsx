import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import api from '../../../api/axios';
import {
    XMarkIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    BuildingStorefrontIcon,
    UsersIcon,
    BookmarkIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { RecipePDF } from '../../recipes/components/RecipePDF';
import { normalizeUnit } from '../../../utils/unitConstants';

export const EditPlanModal = ({ isOpen, onClose, plan, onUpdate, onDelete }) => {
    const { user } = useAuth();

    // Estado local
    const [servings, setServings] = useState(2);
    const [isImporting, setIsImporting] = useState(false);

    // EFECTO: Sincronizar estado
    useEffect(() => {
        if (plan) {
            setServings(plan.target_servings || 2);
        }
    }, [plan]);

    if (!isOpen || !plan) return null;

    // --- DETECTAR TIPO DE PLAN ---
    const isEatingOut = plan.is_eating_out;
    const recipeData = plan.meal_details;

    // --- LÓGICA DE RECETAS ---
    const baseServings = recipeData?.base_servings || 1;
    const ratio = servings / baseServings;
    const alreadySaved = recipeData?.is_saved_by_user;
    const isMyRecipe = recipeData?.owner_name === user?.username;

    // --- MANEJADORES ---
    const handleUpdate = () => {
        onUpdate(plan.id, servings);
    };

    const handleDelete = () => {
        if (confirm("¿Seguro que quieres borrar esta comida de la planificación?")) {
            onDelete(plan.id);
        }
    };

    const handleImport = async () => {
        if (!recipeData) return;
        setIsImporting(true);
        try {
            await api.post(`meals/${recipeData.id}/import_recipe/`);
            alert("¡Receta guardada en tu librería!");
            onClose();
        } catch (error) {
            console.error(error);
            alert("Error al importar receta.");
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[color:hsl(var(--card))] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-[color:hsl(var(--border))]">

                {/* --- CABECERA (DINÁMICA) --- */}
                <div className={`relative shrink-0 min-h-[140px] flex flex-col justify-end ${isEatingOut ? 'bg-orange-500' : 'bg-[color:hsl(var(--primary))]'
                    }`}>

                    {/* FONDO: Si es receta y tiene foto */}
                    {!isEatingOut && recipeData?.image && (
                        <div className="absolute inset-0">
                            <img
                                src={recipeData.image}
                                alt={recipeData.name}
                                className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        </div>
                    )}

                    {/* FONDO: Si es comer fuera (Icono grande) */}
                    {isEatingOut && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                            <BuildingStorefrontIcon className="w-32 h-32 text-white" />
                        </div>
                    )}

                    {/* TEXTO DE CABECERA */}
                    <div className="relative p-6 z-10 text-white">
                        <h3 className="font-extrabold text-2xl leading-tight drop-shadow-md pr-8 mb-1">
                            {isEatingOut ? plan.custom_name : recipeData?.name}
                        </h3>

                        <div className="flex justify-between items-end opacity-90 text-xs font-medium tracking-wide">
                            <p>
                                {isEatingOut ? (
                                    <span className="flex items-center gap-1.5 uppercase">
                                        <BuildingStorefrontIcon className="w-4 h-4" /> Restaurante
                                    </span>
                                ) : (
                                    <span>Por {isMyRecipe ? 'Ti' : recipeData?.owner_name}</span>
                                )}
                            </p>
                            <p className="capitalize px-2 py-0.5 rounded bg-white/20 backdrop-blur-sm">
                                {plan.meal_slot === 'LUNCH' ? 'Comida' : plan.meal_slot === 'DINNER' ? 'Cena' : plan.meal_slot === 'BREAKFAST' ? 'Desayuno' : 'Otro'}
                            </p>
                        </div>
                    </div>

                    {/* BOTÓN CERRAR (X) */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full w-8 h-8 flex items-center justify-center transition focus:outline-none backdrop-blur-sm"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* --- CUERPO DEL MODAL --- */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[color:hsl(var(--card))]">

                    {/* CASO A: ES UNA RECETA */}
                    {!isEatingOut && recipeData ? (
                        <div className="space-y-8">

                            {/* 1. Selector de Raciones */}
                            <div className="text-center">
                                <label className="block text-xs font-bold text-[color:hsl(var(--muted-foreground))] mb-4 uppercase tracking-widest">
                                    Raciones a cocinar
                                </label>
                                <div className="inline-flex items-center gap-4">
                                    <button
                                        onClick={() => setServings(s => Math.max(1, s - 1))}
                                        className="w-12 h-12 rounded-full border border-[color:hsl(var(--border))] hover:border-[color:hsl(var(--primary))] hover:text-[color:hsl(var(--primary))] bg-[color:hsl(var(--background))] text-xl font-light transition-all flex items-center justify-center shadow-sm"
                                    >
                                        -
                                    </button>
                                    <span className="text-4xl font-black text-[color:hsl(var(--foreground))] w-16 text-center tabular-nums tracking-tighter">
                                        {servings}
                                    </span>
                                    <button
                                        onClick={() => setServings(s => s + 1)}
                                        className="w-12 h-12 rounded-full border border-[color:hsl(var(--border))] hover:border-[color:hsl(var(--primary))] hover:text-[color:hsl(var(--primary))] bg-[color:hsl(var(--background))] text-xl font-light transition-all flex items-center justify-center shadow-sm"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* 2. Lista de Ingredientes Dinámica */}
                            <div className="bg-[color:hsl(var(--muted))]/30 rounded-2xl p-5 border border-[color:hsl(var(--border))]">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold text-[color:hsl(var(--foreground))] flex items-center gap-2">
                                        <div className="w-1 h-4 bg-[color:hsl(var(--primary))] rounded-full" />
                                        Ingredientes necesarios
                                    </h4>

                                    <PDFDownloadLink
                                        document={<RecipePDF recipe={recipeData} />}
                                        fileName={`Receta_${recipeData.name}.pdf`}
                                        className="text-[color:hsl(var(--primary))] text-xs font-bold hover:underline flex items-center gap-1"
                                    >
                                        {({ loading }) => loading ? '...' : <><ArrowDownTrayIcon className="w-3 h-3" /> PDF</>}
                                    </PDFDownloadLink>
                                </div>

                                <ul className="space-y-3 text-sm">
                                    {recipeData.ingredients && recipeData.ingredients.length > 0 ? (
                                        recipeData.ingredients.map((ing) => {
                                            const adjustedQty = ing.quantity * ratio;
                                            const displayQty = parseFloat(adjustedQty.toFixed(2));
                                            return (
                                                <li key={ing.id} className="flex justify-between items-baseline border-b border-[color:hsl(var(--border))]/50 last:border-0 pb-2 last:pb-0 border-dashed">
                                                    <span className="text-[color:hsl(var(--muted-foreground))] font-medium">{ing.ingredient_name}</span>
                                                    <span className="text-[color:hsl(var(--foreground))] font-bold whitespace-nowrap ml-2">
                                                        {displayQty} <span className="font-normal text-[color:hsl(var(--muted-foreground))] text-xs">{normalizeUnit(ing.unit)}</span>
                                                    </span>
                                                </li>
                                            );
                                        })
                                    ) : (
                                        <li className="text-[color:hsl(var(--muted-foreground))] italic text-center text-xs py-2">Sin ingredientes registrados.</li>
                                    )}
                                </ul>
                            </div>

                            {/* Instrucciones (Acordeón simplificado o texto) */}
                            {recipeData.instructions && (
                                <div className="pt-2">
                                    <h4 className="text-sm font-bold text-[color:hsl(var(--foreground))] mb-2">Preparación rápida:</h4>
                                    <p className="text-sm text-[color:hsl(var(--muted-foreground))] whitespace-pre-line leading-relaxed line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
                                        {recipeData.instructions}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* CASO B: ES COMER FUERA */
                        <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                            <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-6 text-orange-500 shadow-sm animate-bounce-slow">
                                <BuildingStorefrontIcon className="w-12 h-12" />
                            </div>
                            <h4 className="text-xl font-bold text-[color:hsl(var(--foreground))] mb-2">Plan de Comida Fuera</h4>
                            <p className="text-[color:hsl(var(--muted-foreground))] text-sm max-w-xs mx-auto">
                                Disfruta de tu comida en <strong>{plan.custom_name}</strong>.
                            </p>
                        </div>
                    )}
                </div>

                {/* --- FOOTER DE ACCIONES --- */}
                <div className="p-5 bg-[color:hsl(var(--muted))]/30 border-t border-[color:hsl(var(--border))] flex flex-col gap-3 shrink-0">

                    {/* BOTÓN IMPORTAR (Solo recetas ajenas no guardadas) */}
                    {!isEatingOut && !isMyRecipe && !alreadySaved && (
                        <button
                            onClick={handleImport}
                            disabled={isImporting}
                            className="w-full bg-[color:hsl(var(--background))] border border-[color:hsl(var(--border))] hover:border-[color:hsl(var(--primary))] text-[color:hsl(var(--foreground))] hover:text-[color:hsl(var(--primary))] font-bold py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm"
                        >
                            {isImporting ? 'Guardando...' : (
                                <>
                                    <BookmarkIcon className="w-4 h-4" /> Guardar en Mis Recetas
                                </>
                            )}
                        </button>
                    )}

                    {/* Mensaje si ya está guardada */}
                    {!isEatingOut && !isMyRecipe && alreadySaved && (
                        <div className="text-center text-xs text-green-600 font-bold py-2 bg-green-50 rounded-lg border border-green-100 flex items-center justify-center gap-1">
                            <CheckBadgeIcon className="w-4 h-4" /> Ya en tu colección
                        </div>
                    )}

                    <div className="flex gap-3">
                        {/* Botón Eliminar */}
                        <button
                            onClick={handleDelete}
                            className={`px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${isEatingOut ? 'w-full' : ''}`}
                        >
                            <TrashIcon className="w-4 h-4" /> Eliminar
                        </button>

                        {/* Botón Confirmar (Solo recetas) */}
                        {!isEatingOut && (
                            <button
                                onClick={handleUpdate}
                                className="flex-1 px-4 py-2.5 btn-primary rounded-xl font-bold text-sm shadow-lg shadow-pink-500/20"
                            >
                                Actualizar Raciones
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
