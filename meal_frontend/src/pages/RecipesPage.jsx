import { Link } from "react-router-dom"; // <--- Importar Link
import { MealList } from "../components/MealList";

export const RecipesPage = () => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Mis Recetas</h1>

                <Link
                    to="/recipes/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
                >
                    + Nueva Receta
                </Link>
            </div>
            <MealList />
        </div>
    );
};