import { WeeklyPlanner } from "../components/WeeklyPlanner";
import { SparklesIcon } from '@heroicons/react/24/outline';

export const PlannerPage = () => {
    return (
        <div className="space-y-6 font-sans animate-fade-in pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[color:hsl(var(--foreground))] tracking-tight">Planificador</h1>
                    <p className="text-[color:hsl(var(--muted-foreground))] mt-1">
                        Organiza tu menú semanal y genera la lista de la compra.
                    </p>
                </div>
                <div className="hidden md:block">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[color:hsl(var(--primary))]/10 text-[color:hsl(var(--primary))]">
                        <SparklesIcon className="w-3.5 h-3.5" /> Vista Semanal
                    </span>
                </div>
            </div>

            {/* El planificador se encarga de su propio contenedor */}
            <WeeklyPlanner />
        </div>
    );
};