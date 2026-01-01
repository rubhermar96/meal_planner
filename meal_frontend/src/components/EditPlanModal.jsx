import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    XMarkIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    BuildingStorefrontIcon // <--- Importamos este icono nuevo
} from '@heroicons/react/24/outline';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { RecipePDF } from './RecipePDF';

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
    const recipeData = plan.meal_details; // Será null si isEatingOut es true

    // --- LÓGICA DE RECETAS (Protegida) ---
    // Solo calculamos estas variables si NO es comer fuera para evitar errores
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

                {/* --- CABECERA (DINÁMICA: AZUL O NARANJA) --- */}
                <div className={`relative shrink-0 ${isEatingOut ? 'bg-orange-500' : 'bg-blue-600'}`}>

                    {/* FONDO: Si es receta y tiene foto */}
                    {!isEatingOut && recipeData?.image && (
                        <div className="absolute inset-0">
                            <img
                                src={recipeData.image}
                                alt={recipeData.name}
                                className="w-full h-full object-cover opacity-50"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent" />
                        </div>
                    )}

                    {/* FONDO: Si es comer fuera (Icono grande) */}
                    {isEatingOut && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                            <BuildingStorefrontIcon className="w-32 h-32 text-white" />
                        </div>
                    )}

                    {/* TEXTO DE CABECERA */}
                    <div className="relative p-4 z-10">
                        <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md pr-8">
                            {isEatingOut ? plan.custom_name : recipeData?.name}
                        </h3>

                        <div className="flex justify-between items-end mt-1">
                            <p className="text-white/80 text-xs">
                                {isEatingOut ? (
                                    <span className="font-medium flex items-center gap-1">
                                        <BuildingStorefrontIcon className="w-3 h-3" /> Restaurante / Fuera
                                    </span>
                                ) : (
                                    <span>De: <span className="font-medium">{isMyRecipe ? 'Ti (Mía)' : recipeData?.owner_name}</span></span>
                                )}
                            </p>
                            <p className="text-white/70 text-xs capitalize">
                                {plan.meal_slot === 'LUNCH' ? 'Comida' : plan.meal_slot === 'DINNER' ? 'Cena' : 'Otro'} • {plan.date}
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- CUERPO DEL MODAL --- */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">

                    {/* CASO A: ES UNA RECETA (Tu código original) */}
                    {!isEatingOut && recipeData ? (
                        <>
                            {/* 1. Selector de Raciones */}
                            <div className="mb-6 text-center">
                                <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
                                    Raciones a cocinar
                                </label>
                                <div className="inline-flex items-center bg-gray-100 rounded-full p-1 shadow-inner">
                                    <button
                                        onClick={() => setServings(s => Math.max(1, s - 1))}
                                        className="w-10 h-10 rounded-full bg-white shadow hover:bg-gray-50 text-xl font-bold text-blue-600 transition flex items-center justify-center"
                                    >
                                        -
                                    </button>
                                    <span className="text-2xl font-bold text-gray-800 w-16 text-center tabular-nums">
                                        {servings}
                                    </span>
                                    <button
                                        onClick={() => setServings(s => s + 1)}
                                        className="w-10 h-10 rounded-full bg-white shadow hover:bg-gray-50 text-xl font-bold text-blue-600 transition flex items-center justify-center"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* 2. Lista de Ingredientes Dinámica y PDF */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm">
                                <div className="flex gap-3 mb-6">
                                    <PDFDownloadLink
                                        document={<RecipePDF recipe={recipeData} />}
                                        fileName={`Receta_${recipeData.name}.pdf`}
                                        className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition border border-blue-200"
                                    >
                                        {({ loading }) => (
                                            <>
                                                <ArrowDownTrayIcon className="w-4 h-4" />
                                                {loading ? 'Generando...' : 'Descargar Receta'}
                                            </>
                                        )}
                                    </PDFDownloadLink>
                                </div>

                                <h4 className="text-sm font-bold text-gray-700 mb-3 flex justify-between items-center">
                                    <span>Ingredientes:</span>
                                    <span className="text-[10px] font-normal text-gray-500 bg-white px-2 py-1 rounded border">
                                        Base receta: {baseServings}p
                                    </span>
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    {recipeData.ingredients && recipeData.ingredients.length > 0 ? (
                                        recipeData.ingredients.map((ing) => {
                                            const adjustedQty = ing.quantity * ratio;
                                            const displayQty = parseFloat(adjustedQty.toFixed(2));
                                            return (
                                                <li key={ing.id} className="flex justify-between items-center border-b border-gray-200 last:border-0 pb-2 last:pb-0 border-dashed">
                                                    <span className="text-gray-700 font-medium">{ing.ingredient_name}</span>
                                                    <span className="text-gray-900 font-bold bg-white px-2 py-0.5 rounded shadow-sm text-xs">
                                                        {displayQty} <span className="font-normal text-gray-500">{ing.unit}</span>
                                                    </span>
                                                </li>
                                            );
                                        })
                                    ) : (
                                        <li className="text-gray-400 italic text-center text-xs py-2">Sin ingredientes registrados.</li>
                                    )}
                                </ul>
                            </div>

                            {/* Instrucciones */}
                            {recipeData.instructions && (
                                <div className="mt-6 border-t border-gray-100 pt-4">
                                    <h4 className="text-sm font-bold text-gray-700 mb-2">Cómo se hace:</h4>
                                    <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                                        {recipeData.instructions}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* CASO B: ES COMER FUERA */
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-500">
                                <BuildingStorefrontIcon className="w-10 h-10" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-2">Plan de Comida Fuera</h4>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                Disfruta de tu comida en <strong>{plan.custom_name}</strong>. No hay ingredientes ni instrucciones necesarias.
                            </p>
                        </div>
                    )}
                </div>

                {/* --- FOOTER DE ACCIONES --- */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col gap-3 shrink-0">

                    {/* BOTONES SOLO PARA RECETAS */}
                    {!isEatingOut && (
                        <>
                            {!alreadySaved ? (
                                <button
                                    onClick={handleImport}
                                    disabled={isImporting}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                                >
                                    {isImporting ? 'Guardando...' : (
                                        <>
                                            <span className="text-lg">📥</span> <span className="text-sm">Guardar copia en mis recetas</span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                !isMyRecipe && (
                                    <div className="text-center text-xs text-green-700 font-semibold py-1.5 bg-green-50 rounded border border-green-200">
                                        ✓ Ya tienes esta receta en tu biblioteca
                                    </div>
                                )
                            )}
                        </>
                    )}

                    <div className="flex gap-3">
                        {/* Botón Eliminar (Ancho completo si es comer fuera, normal si es receta) */}
                        <button
                            onClick={handleDelete}
                            className={`px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg font-medium text-sm transition ${isEatingOut ? 'w-full' : ''}`}
                        >
                            Eliminar del Plan
                        </button>

                        {/* Botón Confirmar Cambios (Solo para recetas) */}
                        {!isEatingOut && (
                            <button
                                onClick={handleUpdate}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow transition"
                            >
                                Confirmar Cambios
                            </button>
                        )}
                    </div>
                </div>

                {/* BOTÓN CERRAR (X) */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-white/70 hover:text-white bg-black/10 hover:bg-black/20 rounded-full w-8 h-8 flex items-center justify-center transition focus:outline-none"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>

            </div>
        </div>
    );
};