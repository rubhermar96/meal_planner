// frontend/src/components/MealList.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";

export const MealList = () => {
    const [meals, setMeals] = useState([]);

    useEffect(() => {
        // Pedimos las recetas al cargar el componente
        api.get("meals/")
            .then((response) => {
                console.log("Datos recibidos:", response.data);
                setMeals(response.data);
            })
            .catch((error) => {
                console.error("Error cargando recetas:", error);
            });
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meals.map((meal) => (
                <div key={meal.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800">{meal.name}</h3>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">
                        {meal.meal_type === 'HOME' ? '🏠 Casera' : '🌮 Fuera'}
                    </span>

                    <div className="mt-4">
                        <h4 className="font-semibold text-gray-600 text-sm">Ingredientes:</h4>
                        <ul className="list-disc list-inside text-gray-500 text-sm mt-1">
                            {meal.ingredients.map((ing) => (
                                <li key={ing.id}>
                                    {ing.quantity} {ing.unit} de {ing.ingredient_name}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
};