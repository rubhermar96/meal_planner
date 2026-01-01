import { useEffect, useState } from 'react';
import { useWeeklyCalendar } from '../hooks/useWeeklyCalendar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
// IMPORTAMOS EL NUEVO MODAL (y quitamos el MealSelectorModal antiguo)
import { RecipeSelectorModal } from './RecipeSelectorModal';
import { EditPlanModal } from './EditPlanModal';
import { BuildingStorefrontIcon } from '@heroicons/react/24/solid'; // Icono para la tarjeta naranja

const MEAL_SLOTS = [
    { key: 'BREAKFAST', label: '☕ Desayuno' },
    { key: 'LUNCH', label: '🍲 Comida' },
    { key: 'DINNER', label: '🌙 Cena' },
    { key: 'SNACK', label: '🍎 Otros' },
];

export const WeeklyPlanner = () => {
    const { weekDays, nextWeek, prevWeek, goToToday, startDate, endDate, format, isSameDay, es } = useWeeklyCalendar();
    const { activeGroup } = useAuth();
    const [plans, setPlans] = useState([]);

    const [addingSlot, setAddingSlot] = useState(null);
    const [editingPlan, setEditingPlan] = useState(null);

    const fetchPlans = async () => {
        if (!activeGroup) return;
        const startStr = format(startDate, 'yyyy-MM-dd');
        const endStr = format(endDate, 'yyyy-MM-dd');
        try {
            // Nota: El backend filtra por el modelo DailyPlan pero la URL puede ser 'plans/' o 'planner/' según lo definiste
            const response = await api.get(`plans/?start_date=${startStr}&end_date=${endStr}&group=${activeGroup.id}`);
            setPlans(response.data);
        } catch (error) {
            console.error("Error cargando planes:", error);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, [startDate, endDate, activeGroup]);

    const getPlansForSlot = (date, slotKey) => {
        return plans.filter(p =>
            isSameDay(new Date(p.date), date) && p.meal_slot === slotKey
        );
    };

    // --- GUARDAR (Admite Receta o Comer Fuera) ---
    const handleSaveMeal = async (planData) => {
        // planData ahora trae: { meal, target_servings, is_eating_out, custom_name }

        if (!addingSlot || !activeGroup) return;

        try {
            await api.post('plans/', { // O 'planner/' según tu urls.py
                date: format(addingSlot.date, 'yyyy-MM-dd'),
                meal_slot: addingSlot.slotKey,
                group: activeGroup.id,

                // AQUÍ ES DONDE OCURRÍA EL ERROR:
                // Antes solo enviabas meal y servings. 
                // Ahora esparcimos (...) todo lo que viene del modal.
                ...planData
            });

            setAddingSlot(null);
            fetchPlans();
        } catch (error) {
            console.error(error);
            // CONSEJO: Imprime el error exacto para saber qué dice el backend
            alert("Error al guardar: " + JSON.stringify(error.response?.data));
        }
    };

    const handleUpdatePlan = async (planId, newServings) => {
        try {
            await api.patch(`plans/${planId}/`, { target_servings: newServings });
            setEditingPlan(null);
            fetchPlans();
        } catch (error) {
            alert("Error al actualizar");
        }
    };

    const handleDeletePlan = async (planId) => {
        try {
            await api.delete(`plans/${planId}/`);
            setEditingPlan(null);
            fetchPlans();
        } catch (error) {
            alert("Error al eliminar");
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden select-none">
                {/* Cabecera Semanal (Igual que antes) */}
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

                {/* Grid */}
                <div className="grid grid-cols-8 divide-x divide-gray-200">
                    {/* Columna Labels */}
                    <div className="col-span-1 bg-gray-50">
                        <div className="h-12 border-b border-gray-200"></div>
                        {MEAL_SLOTS.map(slot => (
                            <div key={slot.key} className="min-h-[8rem] flex items-center justify-center font-medium text-gray-500 text-sm border-b border-gray-100 writing-mode-vertical">
                                {slot.label}
                            </div>
                        ))}
                    </div>

                    {/* Columnas Días */}
                    {weekDays.map((day) => (
                        <div key={day.toString()} className="col-span-1 min-w-[100px]">
                            <div className={`h-12 flex flex-col items-center justify-center border-b border-gray-200 ${isSameDay(day, new Date()) ? 'bg-blue-50' : 'bg-white'}`}>
                                <span className="text-xs font-semibold text-gray-500 uppercase">{format(day, 'EEE', { locale: es })}</span>
                                <span className={`text-sm font-bold ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-900'}`}>{format(day, 'd')}</span>
                            </div>

                            {MEAL_SLOTS.map((slot) => {
                                const slotPlans = getPlansForSlot(day, slot.key);

                                return (
                                    <div key={`${day}-${slot.key}`} className="min-h-[8rem] border-b border-gray-100 p-1 flex flex-col gap-1 hover:bg-gray-50 transition-colors group relative">

                                        {slotPlans.map(plan => {
                                            // LÓGICA DE RENDERIZADO DIFERENTE
                                            if (plan.is_eating_out) {
                                                // TARJETA NARANJA (COMER FUERA)
                                                return (
                                                    <div
                                                        key={plan.id}
                                                        onClick={() => setEditingPlan(plan)}
                                                        className="bg-orange-50 border border-orange-200 rounded p-1.5 cursor-pointer hover:bg-orange-100 transition shadow-sm"
                                                    >
                                                        <div className="flex items-center gap-1 mb-0.5">
                                                            <BuildingStorefrontIcon className="w-3 h-3 text-orange-600" />
                                                            <p className="font-bold text-[10px] text-orange-700 uppercase">Fuera</p>
                                                        </div>
                                                        <p className="font-semibold text-xs text-gray-800 leading-tight">{plan.custom_name}</p>
                                                    </div>
                                                );
                                            }

                                            // TARJETA AZUL (RECETA)
                                            return (
                                                <div
                                                    key={plan.id}
                                                    onClick={() => setEditingPlan(plan)}
                                                    className="bg-blue-100 border border-blue-200 rounded p-1.5 cursor-pointer hover:bg-blue-200 transition shadow-sm"
                                                >
                                                    <p className="font-semibold text-xs text-blue-900 leading-tight mb-0.5">{plan.meal_details?.name}</p>
                                                    <p className="text-[10px] text-blue-700">{plan.target_servings}p</p>
                                                </div>
                                            );
                                        })}

                                        <button
                                            onClick={() => setAddingSlot({ date: day, slotKey: slot.key, slotLabel: slot.label })}
                                            className={`flex-1 rounded border-2 border-transparent border-dashed text-gray-300 hover:border-gray-300 hover:text-gray-400 flex items-center justify-center text-xl font-light transition-all ${slotPlans.length > 0 ? 'min-h-[30px] opacity-0 group-hover:opacity-100' : 'h-full opacity-100'}`}
                                        >
                                            +
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Crear (USAMOS EL NUEVO) */}
            <RecipeSelectorModal
                isOpen={!!addingSlot}
                onClose={() => setAddingSlot(null)}
                onSave={handleSaveMeal}
                date={addingSlot ? format(addingSlot.date, 'dd/MM/yyyy') : ''}
                slotLabel={addingSlot?.slotLabel}
            />

            {/* Modal Editar */}
            <EditPlanModal
                isOpen={!!editingPlan}
                onClose={() => setEditingPlan(null)}
                plan={editingPlan}
                onUpdate={handleUpdatePlan}
                onDelete={handleDeletePlan}
            />
        </>
    );
};