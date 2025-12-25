import { useState } from 'react';
import {
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addWeeks,
    subWeeks,
    format,
    isSameDay
} from 'date-fns';
import { es } from 'date-fns/locale'; // Para que los días salgan en español

export const useWeeklyCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Calcular el inicio (Lunes) y fin (Domingo) de la semana actual
    // weekStartsOn: 1 significa que la semana empieza en Lunes
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });

    // Generar un array con los 7 días de esa semana
    const weekDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    // Funciones para navegar
    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    return {
        weekDays,
        currentDate,
        nextWeek,
        prevWeek,
        goToToday,
        startDate,
        endDate,
        format,
        isSameDay,
        es
    };
};