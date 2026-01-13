import { useState } from 'react';
import api from '../../../api/axios';
import { useWeeklyCalendar } from '../../../hooks/useWeeklyCalendar';
import { useAuth } from '../../auth/context/AuthContext';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { ShoppingListPDF } from '../components/ShoppingListPDF';
import {
    ShoppingCartIcon,
    ArrowDownTrayIcon,
    CheckIcon,
    SparklesIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';

export const ShoppingListPage = () => {
    const { startDate, endDate, format } = useWeeklyCalendar();
    const { activeGroup } = useAuth();

    const [dates, setDates] = useState({
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd')
    });

    const [shoppingList, setShoppingList] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            console.log(activeGroup)
            const res = await api.post('shopping-lists/generate/', {
                start_date: dates.start,
                end_date: dates.end,
                group: activeGroup?.id
            });
            setShoppingList(res.data);
        } catch (error) {
            alert("Error: " + (error.response?.data?.error || "Error al generar"));
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = async (itemId, currentStatus) => {
        const updatedItems = shoppingList.items.map(item =>
            item.id === itemId ? { ...item, is_purchased: !currentStatus } : item
        );
        setShoppingList({ ...shoppingList, items: updatedItems });
    };

    return (
        <div className="max-w-5xl mx-auto pb-32 px-4 font-sans animate-fade-in space-y-8">

            {/* 1. CABECERA TEXTO */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[color:hsl(var(--foreground))] tracking-tight">
                        Lista de la Compra
                    </h1>
                    <p className="text-[color:hsl(var(--muted-foreground))] mt-1">
                        Genera automáticamente los ingredientes que necesitas basándote en tu planificador.
                    </p>
                </div>
            </div>

            {/* 2. TOOLBAR DE FECHAS (EN TARJETA) */}
            <div className="card p-6 shadow-sm border-[color:hsl(var(--border))] bg-[color:hsl(var(--card))]">
                <div className="grid md:grid-cols-3 gap-6 items-end">

                    {/* Input Desde */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[color:hsl(var(--muted-foreground))] uppercase tracking-wider">
                            Desde
                        </label>
                        <input
                            type="date"
                            value={dates.start}
                            onChange={e => setDates({ ...dates, start: e.target.value })}
                            className="input w-full bg-[color:hsl(var(--background))]"
                        />
                    </div>

                    {/* Input Hasta */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[color:hsl(var(--muted-foreground))] uppercase tracking-wider">
                            Hasta
                        </label>
                        <input
                            type="date"
                            value={dates.end}
                            onChange={e => setDates({ ...dates, end: e.target.value })}
                            className="input w-full bg-[color:hsl(var(--background))]"
                        />
                    </div>

                    {/* Botón Generar */}
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="btn-primary w-full shadow-md shadow-pink-500/20 disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <SparklesIcon className="w-5 h-5 animate-spin" /> Generando...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <ShoppingCartIcon className="w-5 h-5" /> Generar Lista
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* 3. RESULTADOS (LISTA ABIERTA - SIN TARJETA) */}
            {shoppingList && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Cabecera de la Lista */}
                    <div className="flex items-center justify-between border-b border-[color:hsl(var(--border))] pb-4 mb-2">
                        <h2 className="text-xl font-bold text-[color:hsl(var(--foreground))] flex items-center gap-3">
                            Productos
                            <span className="bg-[color:hsl(var(--secondary))] text-[color:hsl(var(--secondary-foreground))] text-sm font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                                {shoppingList.items.length}
                            </span>
                        </h2>

                        {shoppingList.items.length > 0 && (
                            <PDFDownloadLink
                                document={
                                    <ShoppingListPDF
                                        shoppingList={shoppingList}
                                        groupName={activeGroup?.name || "Mi Grupo"}
                                    />
                                }
                                fileName={`Compra_${shoppingList.start_date}.pdf`}
                                className="text-xs font-bold text-[color:hsl(var(--primary))] hover:bg-[color:hsl(var(--primary))]/10 border border-[color:hsl(var(--primary))]/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                {({ loading }) => loading ? '...' : <><ArrowDownTrayIcon className="w-4 h-4" /> Descargar PDF</>}
                            </PDFDownloadLink>
                        )}
                    </div>

                    {/* Lista de Items (Ocupando todo el ancho) */}
                    <div className="grid grid-cols-1 gap-1">
                        {shoppingList.items.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => toggleItem(item.id, item.is_purchased)}
                                className={`group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 select-none border border-transparent
                                    ${item.is_purchased
                                        ? 'text-[color:hsl(var(--muted-foreground))] opacity-50 bg-[color:hsl(var(--muted))]/20'
                                        : 'hover:bg-[color:hsl(var(--card))] hover:shadow-sm hover:border-[color:hsl(var(--border))]'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Checkbox Custom */}
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ring-2 ring-offset-2 ring-offset-[color:hsl(var(--background))]
                                        ${item.is_purchased
                                            ? 'bg-green-500 ring-green-500 scale-90'
                                            : 'bg-transparent ring-[color:hsl(var(--muted-foreground))]/30 group-hover:ring-[color:hsl(var(--primary))]'
                                        }`}
                                    >
                                        {item.is_purchased && <CheckIcon className="w-3.5 h-3.5 text-white stroke-[4]" />}
                                    </div>

                                    {/* Nombre */}
                                    <span className={`text-base font-medium transition-all ${item.is_purchased ? 'line-through decoration-2 decoration-[color:hsl(var(--muted-foreground))]/50' : 'text-[color:hsl(var(--foreground))]'}`}>
                                        {item.name}
                                    </span>
                                </div>

                                {/* Cantidad */}
                                <div className={`text-sm font-mono font-medium px-3 py-1 rounded-md transition-colors
                                    ${item.is_purchased
                                        ? 'bg-transparent text-[color:hsl(var(--muted-foreground))]'
                                        : 'bg-[color:hsl(var(--muted))]/50 text-[color:hsl(var(--foreground))]'
                                    }`}
                                >
                                    {item.quantity} {item.unit}
                                </div>
                            </div>
                        ))}

                        {/* Estado Vacío */}
                        {shoppingList.items.length === 0 && (
                            <div className="py-16 flex flex-col items-center justify-center text-[color:hsl(var(--muted-foreground))] text-center border-2 border-dashed border-[color:hsl(var(--border))] rounded-2xl mt-4">
                                <div className="w-16 h-16 bg-[color:hsl(var(--muted))]/30 rounded-full flex items-center justify-center mb-4">
                                    <FunnelIcon className="w-8 h-8 opacity-50" />
                                </div>
                                <p className="font-medium text-lg">Tu lista está vacía</p>
                                <p className="text-sm mt-1 max-w-xs opacity-70">
                                    Parece que no hay ingredientes para este rango de fechas. ¡Planifica algunas recetas primero!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
