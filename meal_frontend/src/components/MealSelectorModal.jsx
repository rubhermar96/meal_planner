import { useState, useEffect } from 'react';
import api from '../api/axios';

export const MealSelectorModal = ({ isOpen, onClose, onSave, date, slotLabel }) => {
    const [meals, setMeals] = useState([]);
    const [selectedMealId, setSelectedMealId] = useState('');
    const [servings, setServings] = useState(2); // Por defecto 2 personas

    // Cargar recetas al abrir el modal
    useEffect(() => {
        if (isOpen) {
            api.get('meals/').then(res => {
                setMeals(res.data);
                // Seleccionar la primera por defecto si hay
                if (res.data.length > 0) setSelectedMealId(res.data[0].id);
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Enviamos al padre los datos elegidos
        onSave({
            mealId: selectedMealId,
            servings: parseInt(servings)
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                {/* Cabecera */}
                <div className="bg-blue-600 px-6 py-4">
                    <h3 className="text-white font-bold text-lg">Añadir {slotLabel}</h3>
                    <p className="text-blue-100 text-sm">Para el día {date}</p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Selector de Receta */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué vamos a comer?</label>
                        <select
                            value={selectedMealId}
                            onChange={(e) => setSelectedMealId(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {meals.map(meal => (
                                <option key={meal.id} value={meal.id}>
                                    {meal.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selector de Raciones */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Personas (Raciones)</label>
                        <div className="flex items-center space-x-3">
                            <button type="button" onClick={() => setServings(s => Math.max(1, s - 1))} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold">-</button>
                            <input
                                type="number"
                                value={servings}
                                onChange={(e) => setServings(parseInt(e.target.value))}
                                className="w-16 text-center border-b-2 border-gray-300 focus:border-blue-500 outline-none text-lg font-bold"
                            />
                            <button type="button" onClick={() => setServings(s => s + 1)} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold">+</button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Calcularemos los ingredientes automáticamente.</p>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition"
                        >
                            Guardar Comida
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};