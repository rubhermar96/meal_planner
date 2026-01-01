import { useState } from 'react';
import api from '../api/axios';
import { useWeeklyCalendar } from '../hooks/useWeeklyCalendar'; // Reutilizamos tu hook para formatear fechas
import { useAuth } from '../context/AuthContext';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { ShoppingListPDF } from '../components/ShoppingListPDF';

export const ShoppingListPage = () => {
    const { startDate, endDate, format } = useWeeklyCalendar(); // Valores por defecto (semana actual)
    const { activeGroup } = useAuth();

    // Estado local para el formulario de fechas (inicializado a la semana actual)
    const [dates, setDates] = useState({
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd')
    });

    const [shoppingList, setShoppingList] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await api.post('shopping-lists/generate/', {
                start_date: dates.start,
                end_date: dates.end,
                group_id: activeGroup?.id
            });
            setShoppingList(res.data);
        } catch (error) {
            alert("Error: " + (error.response?.data?.error || "Error al generar"));
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = async (itemId, currentStatus) => {
        // Optimistic UI update (actualizamos visualmente antes de esperar al server)
        const updatedItems = shoppingList.items.map(item =>
            item.id === itemId ? { ...item, is_purchased: !currentStatus } : item
        );
        setShoppingList({ ...shoppingList, items: updatedItems });

        // Petición real al servidor (Patch para actualizar solo un campo)
        // NOTA: Necesitaríamos un endpoint simple para esto, por ahora es solo visual en React
        // await api.patch(`shopping-items/${itemId}/`, { is_purchased: !currentStatus });
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">🛒 Lista de la Compra</h1>

            {/* Control de Fechas */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                    <input
                        type="date"
                        value={dates.start}
                        onChange={e => setDates({ ...dates, start: e.target.value })}
                        className="border border-gray-300 rounded-lg p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                    <input
                        type="date"
                        value={dates.end}
                        onChange={e => setDates({ ...dates, end: e.target.value })}
                        className="border border-gray-300 rounded-lg p-2"
                    />
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow disabled:opacity-50"
                >
                    {loading ? 'Generando...' : 'Generar Lista'}
                </button>
            </div>

            {/* Resultados */}
            {shoppingList && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-green-800">
                            Lista para {shoppingList.items.length} productos
                        </h2>
                        <span className="text-sm text-green-600">
                            Del {dates.start} al {dates.end}
                        </span>
                    </div>

                    <PDFDownloadLink
                        document={
                            <ShoppingListPDF
                                shoppingList={shoppingList}
                                groupName={activeGroup?.name || "Mi Grupo"}
                            />
                        }
                        fileName={`Compra_${shoppingList.start_date}.pdf`}
                        className="flex items-center gap-2 bg-white border border-green-200 text-green-700 hover:bg-green-100 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition decoration-none"
                    >
                        {({ blob, url, loading, error }) =>
                            loading ? 'Generando PDF...' : '📄 Descargar PDF (Cliente)'
                        }
                    </PDFDownloadLink>

                    <div className="divide-y divide-gray-100">
                        {shoppingList.items.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => toggleItem(item.id, item.is_purchased)}
                                className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition ${item.is_purchased ? 'bg-gray-50' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${item.is_purchased ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                        {item.is_purchased && <span className="text-white text-xs">✓</span>}
                                    </div>
                                    <span className={`text-lg ${item.is_purchased ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                        {item.name}
                                    </span>
                                </div>
                                <div className="font-mono text-gray-600 font-medium">
                                    {item.quantity} <span className="text-xs text-gray-400">{item.unit}</span>
                                </div>
                            </div>
                        ))}

                        {shoppingList.items.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                ¡Nada que comprar! O no has planificado comidas, o tus recetas no tienen ingredientes.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};