import { WeeklyPlanner } from "../components/WeeklyPlanner";

export const PlannerPage = () => {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Planificador Semanal</h2>
            <WeeklyPlanner />
        </div>
    );
};