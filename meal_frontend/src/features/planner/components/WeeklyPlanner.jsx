import { useEffect, useState } from 'react';
import { useWeeklyCalendar } from '../../../hooks/useWeeklyCalendar';
import api from '../../../api/axios';
import { useAuth } from '../../auth/context/AuthContext';
import { RecipeSelectorModal } from './RecipeSelectorModal';
import { EditPlanModal } from './EditPlanModal';
import {
    BuildingStorefrontIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CalendarIcon,
    // Iconos para los Slots
    SunIcon,
    MoonIcon,
    FireIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

// CONFIGURACIÓN DE SLOTS CON HEROICONS
const MEAL_SLOTS = [
    { key: 'BREAKFAST', label: 'Desayuno', icon: SunIcon },
    { key: 'LUNCH', label: 'Comida', icon: FireIcon },
    { key: 'DINNER', label: 'Cena', icon: MoonIcon },
    { key: 'SNACK', label: 'Otros', icon: SparklesIcon },
];

export const WeeklyPlanner = () => {
    const { weekDays, nextWeek, prevWeek, goToToday, startDate, endDate, format, es } = useWeeklyCalendar();
    const { activeGroup } = useAuth();
    const [plans, setPlans] = useState([]);

    const [addingSlot, setAddingSlot] = useState(null);
    const [editingPlan, setEditingPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    // ESTADO MÓVIL
    const [mobileSelectedDate, setMobileSelectedDate] = useState(new Date());

    // HELPER: Comparar fechas
    const checkSameDay = (d1, d2) => {
        const date1 = new Date(d1);
        const date2 = new Date(d2);
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    // EVITAR BUCLE INFINITO
    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');
    const groupId = activeGroup?.id;

    const fetchPlans = async () => {
        if (!groupId) return;
        setLoading(true);
        try {
            const response = await api.get(`plans/?start_date=${startStr}&end_date=${endStr}&group=${groupId}`);
            setPlans(response.data);
        } catch (error) {
            console.error("Error cargando planes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
        setMobileSelectedDate(startDate);
    }, [startStr, endStr, groupId]);

    const getPlansForSlot = (date, slotKey) => {
        return plans.filter(p =>
            checkSameDay(new Date(p.date), date) && p.meal_slot === slotKey
        );
    };

    // --- ACCIONES ---
    const handleSaveMeal = async (planData) => {
        if (!addingSlot || !activeGroup) return;
        try {
            await api.post('plans/', {
                date: format(addingSlot.date, 'yyyy-MM-dd'),
                meal_slot: addingSlot.slotKey,
                group: activeGroup.id,
                ...planData
            });
            setAddingSlot(null);
            fetchPlans();
        } catch (error) {
            alert("Error al guardar.");
        }
    };

    const handleUpdatePlan = async (planId, newServings) => {
        try {
            await api.patch(`plans/${planId}/`, { target_servings: newServings });
            setEditingPlan(null);
            fetchPlans();
        } catch (error) { alert("Error al actualizar"); }
    };

    const handleDeletePlan = async (planId) => {
        try {
            await api.delete(`plans/${planId}/`);
            setEditingPlan(null);
            fetchPlans();
        } catch (error) { alert("Error al eliminar"); }
    };

    // --- TARJETA DE PLAN ---
    const PlanCard = ({ plan }) => {
        if (plan.is_eating_out) {
            return (
                <div
                    onClick={() => setEditingPlan(plan)}
                    className="bg-orange-50 border border-orange-200 rounded-xl p-2.5 cursor-pointer hover:shadow-md transition-all group/card w-full"
                >
                    <div className="flex items-center gap-1.5 mb-1 text-orange-600/80">
                        <BuildingStorefrontIcon className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-wider">Fuera</span>
                    </div>
                    <p className="text-xs font-bold text-gray-800 leading-tight line-clamp-2">
                        {plan.custom_name}
                    </p>
                </div>
            );
        }

        return (
            <div
                onClick={() => setEditingPlan(plan)}
                className="bg-[color:hsl(var(--primary))]/5 border border-[color:hsl(var(--primary))]/20 rounded-xl p-2.5 cursor-pointer hover:shadow-md hover:bg-[color:hsl(var(--primary))]/10 transition-all w-full"
            >
                <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-[color:hsl(var(--foreground))] leading-tight line-clamp-2 mb-1.5">
                        {plan.meal_details?.name}
                    </p>
                </div>
                <div>
                    <span className="text-[9px] font-medium bg-[color:hsl(var(--background))] text-[color:hsl(var(--muted-foreground))] px-1.5 py-0.5 rounded border border-[color:hsl(var(--border))]">
                        {plan.target_servings} rac.
                    </span>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="card border-[color:hsl(var(--border))] shadow-sm bg-[color:hsl(var(--card))] overflow-hidden flex flex-col">

                {/* --- CABECERA --- */}
                <div className="flex items-center justify-between p-4 border-b border-[color:hsl(var(--border))] bg-[color:hsl(var(--muted))]/20 shrink-0">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-[color:hsl(var(--muted-foreground))]" />
                        <h2 className="text-lg font-bold text-[color:hsl(var(--foreground))] capitalize">
                            {format(startDate, 'MMMM', { locale: es })}
                        </h2>
                    </div>

                    <div className="flex items-center gap-1 bg-[color:hsl(var(--background))] rounded-lg border border-[color:hsl(var(--border))] p-1 shadow-sm">
                        <button onClick={prevWeek} className="p-1.5 hover:bg-[color:hsl(var(--muted))] rounded-md transition-colors"><ChevronLeftIcon className="w-4 h-4" /></button>
                        <button onClick={goToToday} className="px-3 py-1 text-xs font-bold text-[color:hsl(var(--primary))] hover:bg-[color:hsl(var(--primary))]/10 rounded-md transition-colors">Hoy</button>
                        <button onClick={nextWeek} className="p-1.5 hover:bg-[color:hsl(var(--muted))] rounded-md transition-colors"><ChevronRightIcon className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* --- VISTA MÓVIL --- */}
                <div className="md:hidden flex flex-col">
                    <div className="grid grid-cols-7 border-b border-[color:hsl(var(--border))] bg-[color:hsl(var(--background))]">
                        {weekDays.map((day) => {
                            const isSelected = checkSameDay(day, mobileSelectedDate);
                            const isToday = checkSameDay(day, new Date());

                            return (
                                <button
                                    key={day.toString()}
                                    onClick={() => setMobileSelectedDate(day)}
                                    className={`flex flex-col items-center justify-center py-3 transition-all relative ${isSelected
                                            ? 'text-[color:hsl(var(--primary))] font-bold'
                                            : 'text-[color:hsl(var(--muted-foreground))] hover:bg-[color:hsl(var(--muted))]/20'
                                        }`}
                                >
                                    <span className="text-[9px] uppercase tracking-tighter mb-0.5">{format(day, 'EEE', { locale: es }).replace('.', '')}</span>
                                    <span className={`text-base leading-none ${isSelected ? 'scale-110' : ''}`}>
                                        {format(day, 'd')}
                                    </span>
                                    {isToday && !isSelected && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[color:hsl(var(--primary))]"></span>}
                                    {isSelected && <span className="absolute bottom-0 w-full h-0.5 bg-[color:hsl(var(--primary))]"></span>}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-4 space-y-6">
                        {MEAL_SLOTS.map((slot) => {
                            const slotPlans = getPlansForSlot(mobileSelectedDate, slot.key);
                            // Icono dinámico
                            const Icon = slot.icon;

                            return (
                                <div key={slot.key} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-2 mb-3">
                                        {/* Icono Renderizado */}
                                        <Icon className="w-5 h-5 text-[color:hsl(var(--primary))]" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-[color:hsl(var(--muted-foreground))]">{slot.label}</h3>
                                        <div className="flex-1 h-px bg-[color:hsl(var(--border))] opacity-50"></div>
                                    </div>

                                    <div className="space-y-3">
                                        {slotPlans.length > 0 ? (
                                            slotPlans.map(plan => (
                                                <PlanCard key={plan.id} plan={plan} />
                                            ))
                                        ) : (
                                            <button
                                                onClick={() => setAddingSlot({ date: mobileSelectedDate, slotKey: slot.key, slotLabel: slot.label })}
                                                className="w-full py-3 rounded-xl border-2 border-dashed border-[color:hsl(var(--border))] text-[color:hsl(var(--muted-foreground))] hover:border-[color:hsl(var(--primary))] hover:text-[color:hsl(var(--primary))] hover:bg-[color:hsl(var(--primary))]/5 transition-all flex items-center justify-center gap-2 text-xs font-medium"
                                            >
                                                + Planificar
                                            </button>
                                        )}

                                        {slotPlans.length > 0 && (
                                            <button
                                                onClick={() => setAddingSlot({ date: mobileSelectedDate, slotKey: slot.key, slotLabel: slot.label })}
                                                className="w-full py-2 text-xs text-[color:hsl(var(--muted-foreground))] hover:text-[color:hsl(var(--primary))] transition-colors border-t border-transparent hover:border-[color:hsl(var(--border))]"
                                            >
                                                + Añadir otro plato
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div className="h-10"></div>
                    </div>
                </div>

                {/* --- VISTA ESCRITORIO --- */}
                <div className="hidden md:block overflow-x-auto custom-scrollbar">
                    <div className="grid grid-cols-8 divide-x divide-[color:hsl(var(--border))] min-w-[900px]">
                        <div className="col-span-1 bg-[color:hsl(var(--muted))]/30">
                            <div className="h-14 border-b border-[color:hsl(var(--border))] bg-[color:hsl(var(--muted))]/50"></div>
                            {MEAL_SLOTS.map(slot => {
                                const Icon = slot.icon;
                                return (
                                    <div key={slot.key} className="min-h-[140px] flex flex-col items-center justify-center p-2 border-b border-[color:hsl(var(--border))] text-[color:hsl(var(--muted-foreground))]">
                                        <Icon className="w-6 h-6 mb-1 opacity-70" />
                                        <span className="text-xs font-bold uppercase tracking-wider writing-mode-vertical-up lg:writing-mode-horizontal text-center">
                                            {slot.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {weekDays.map((day) => {
                            const isToday = checkSameDay(day, new Date());
                            return (
                                <div key={day.toString()} className={`col-span-1 ${isToday ? 'bg-[color:hsl(var(--primary))]/[0.02]' : ''}`}>
                                    <div className={`h-14 flex flex-col items-center justify-center border-b border-[color:hsl(var(--border))] sticky top-0 z-10 backdrop-blur-sm ${isToday
                                            ? 'bg-[color:hsl(var(--primary))] text-white shadow-sm'
                                            : 'bg-[color:hsl(var(--card))]/95 text-[color:hsl(var(--muted-foreground))]'
                                        }`}>
                                        <span className="text-[10px] font-bold uppercase">{format(day, 'EEE', { locale: es })}</span>
                                        <span className={`text-lg font-bold leading-none ${isToday ? 'text-white' : 'text-[color:hsl(var(--foreground))]'}`}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>

                                    {MEAL_SLOTS.map((slot) => {
                                        const slotPlans = getPlansForSlot(day, slot.key);
                                        return (
                                            <div key={`${day}-${slot.key}`} className="min-h-[140px] border-b border-[color:hsl(var(--border))] p-2 flex flex-col gap-2 group relative hover:bg-[color:hsl(var(--muted))]/30 transition-colors">
                                                {slotPlans.map(plan => (
                                                    <div key={plan.id} className="w-full">
                                                        <PlanCard plan={plan} />
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => setAddingSlot({ date: day, slotKey: slot.key, slotLabel: slot.label })}
                                                    className={`flex-1 w-full rounded-lg border-2 border-dashed border-transparent text-[color:hsl(var(--muted-foreground))] flex items-center justify-center transition-all duration-200
                                                        ${slotPlans.length > 0
                                                            ? 'min-h-[30px] opacity-0 group-hover:opacity-100 hover:border-[color:hsl(var(--border))]'
                                                            : 'h-full opacity-0 group-hover:opacity-50 hover:border-[color:hsl(var(--border))] hover:text-[color:hsl(var(--primary))]'
                                                        }`}
                                                >
                                                    <span className="text-2xl font-light">+</span>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            <RecipeSelectorModal
                isOpen={!!addingSlot}
                onClose={() => setAddingSlot(null)}
                onSave={handleSaveMeal}
                date={addingSlot ? format(addingSlot.date, 'dd/MM/yyyy') : ''}
                slotLabel={addingSlot?.slotLabel}
            />

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
