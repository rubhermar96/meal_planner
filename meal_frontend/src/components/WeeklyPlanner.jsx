import { useEffect, useState } from 'react';
import { useWeeklyCalendar } from '../hooks/useWeeklyCalendar';
import api from '../api/axios';
import { MealSelectorModal } from './MealSelectorModal'; // <--- Importamos el modal

const MEAL_SLOTS = [
    { key: 'BREAKFAST', label: '☕ Desayuno' },
    { key: 'LUNCH', label: '🍲 Comida' },
    { key: 'DINNER', label: '🌙 Cena' },
    { key: 'SNACK', label: '🍎 Otros' },
];

export const WeeklyPlanner = () => {
    const { weekDays, nextWeek, prevWeek, goToToday, startDate, endDate, format, isSameDay, es } = useWeeklyCalendar();
    const [plans, setPlans] = useState([]);

    // Estado para controlar el Modal
    // Si es null, el modal está cerrado. Si tiene datos, está abierto.
    const [activeSlot, setActiveSlot] = useState(null);

    // Función para recargar datos
    const fetchPlans = async () => {
        const startStr = format(startDate, 'yyyy-MM-dd');
        const endStr = format(endDate, 'yyyy-MM-dd');
        try {
            const response = await api.get(`plans/?start_date=${startStr}&end_date=${endStr}`);
            setPlans(response.data);
        } catch (error) {
            console.error("Error cargando planes:", error);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, [startDate, endDate]);

    const getPlanForSlot = (date, slotKey) => {
        return plans.find(p =>
            isSameDay(new Date(p.date), date) && p.meal_slot === slotKey
        );
    };

    // --- Lógica de Guardado ---
    const handleSaveMeal = async ({ mealId, servings }) => {
        if (!activeSlot) return;

        try {
            // 1. Buscamos el ID del grupo (temporalmente hardcodeado a 1 o el primero que tengas)
            // Idealmente esto vendría de un Contexto de Usuario
            const GROUP_ID = 1;

            const payload = {
                date: format(activeSlot.date, 'yyyy-MM-dd'),
                meal_slot: activeSlot.slotKey,
                meal: mealId,
                target_servings: servings,
                group: GROUP_ID
            };

            await api.post('plans/', payload);

            // 2. Cerrar modal y refrescar calendario
            setActiveSlot(null);
            fetchPlans();

        } catch (error) {
            alert("Error al guardar: " + JSON.stringify(error.response?.data));
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* ... (Esta parte de la cabecera es igual que antes) ... */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-700 capitalize">
                        {format(startDate, 'MMMM yyyy', { locale: es })}
                    </h2>
                    <div className="flex space-x-2">
                        <button onClick={prevWeek} className="p-2 hover:bg-gray-200 rounded-lg text-gray-600">← Ant</button>
                        <button onClick={goToToday} className="px-3 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg">Hoy</button>
                        <button onClick={nextWeek} className="p-2 hover:bg-gray-200 rounded-lg text-gray-600">Sig →</button>
                    </div>
                </div>

                <div className="grid grid-cols-8 divide-x divide-gray-200">
                    <div className="col-span-1 bg-gray-50">
                        <div className="h-12 border-b border-gray-200"></div>
                        {MEAL_SLOTS.map(slot => (
                            <div key={slot.key} className="h-32 flex items-center justify-center font-medium text-gray-500 text-sm border-b border-gray-100">
                                {slot.label}
                            </div>
                        ))}
                    </div>

                    {weekDays.map((day) => (
                        <div key={day.toString()} className="col-span-1 min-w-[120px]">
                            <div className={`h-12 flex flex-col items-center justify-center border-b border-gray-200 ${isSameDay(day, new Date()) ? 'bg-blue-50' : 'bg-white'}`}>
                                <span className="text-xs font-semibold text-gray-500 uppercase">{format(day, 'EEE', { locale: es })}</span>
                                <span className={`text-sm font-bold ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-900'}`}>{format(day, 'd')}</span>
                            </div>

                            {MEAL_SLOTS.map((slot) => {
                                const plan = getPlanForSlot(day, slot.key);
                                return (
                                    <div key={`${day}-${slot.key}`} className="h-32 border-b border-gray-100 p-1 hover:bg-gray-50 transition-colors">
                                        {plan ? (
                                            <div className="h-full bg-blue-100 border border-blue-200 rounded-lg p-2 flex flex-col justify-between cursor-pointer hover:bg-blue-200 transition">
                                                <span className="font-semibold text-sm text-blue-900 line-clamp-2">{plan.meal_details.name}</span>
                                                <span className="text-xs text-blue-700">{plan.target_servings} pers.</span>
                                            </div>
                                        ) : (
                                            <button
                                                /* AQUÍ ESTÁ EL CAMBIO: Al hacer click, abrimos el modal */
                                                onClick={() => setActiveSlot({ date: day, slotKey: slot.key, slotLabel: slot.label })}
                                                className="w-full h-full text-transparent hover:text-gray-400 flex items-center justify-center text-2xl font-light border-2 border-transparent hover:border-dashed hover:border-gray-300 rounded-lg"
                                            >
                                                +
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Renderizamos el Modal aquí fuera */}
            <MealSelectorModal
                isOpen={!!activeSlot}
                onClose={() => setActiveSlot(null)}
                onSave={handleSaveMeal}
                date={activeSlot ? format(activeSlot.date, 'dd/MM/yyyy') : ''}
                slotLabel={activeSlot?.slotLabel}
            />
        </>
    );
};