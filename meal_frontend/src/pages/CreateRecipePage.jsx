import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { IngredientSelect } from "../components/IngredientSelect"; // <--- Importamos

export const CreateRecipePage = () => {
    const navigate = useNavigate();

    // Estado del formulario
    const [name, setName] = useState("");
    const [baseServings, setBaseServings] = useState(4);
    const [ingredients, setIngredients] = useState([
        { ingredient_id: "", quantity: "", unit: "g" }
    ]);

    // NOTA: He borrado el useEffect de availableIngredients, ya no hace falta aquí.

    const addRow = () => {
        setIngredients([...ingredients, { ingredient_id: "", quantity: "", unit: "g" }]);
    };

    const removeRow = (index) => {
        const newList = [...ingredients];
        newList.splice(index, 1);
        setIngredients(newList);
    };

    const handleIngredientChange = (index, field, value) => {
        const newList = [...ingredients];
        newList[index][field] = value;
        setIngredients(newList);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const validIngredients = ingredients.filter(i => i.ingredient_id && i.quantity);

            const payload = {
                name,
                base_servings: parseInt(baseServings),
                meal_type: "HOME",
                group: 1,
                ingredients: validIngredients
            };

            await api.post("meals/", payload);
            navigate("/recipes");
        } catch (error) {
            alert("Error creando receta: " + JSON.stringify(error.response?.data));
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-200 mt-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">🍳 Nueva Receta</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plato</label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ej: Lentejas estofadas"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Raciones Base</label>
                        <input
                            type="number"
                            value={baseServings}
                            onChange={e => setBaseServings(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ingredientes</label>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        {ingredients.map((row, index) => (
                            <div key={index} className="flex gap-2 items-start">

                                {/* AQUI ESTÁ EL CAMBIO: Usamos nuestro componente */}
                                <div className="flex-1">
                                    <IngredientSelect
                                        value={row.ingredient_id}
                                        onChange={(newId) => handleIngredientChange(index, "ingredient_id", newId)}
                                    />
                                </div>

                                <input
                                    required
                                    type="number"
                                    placeholder="Cant."
                                    value={row.quantity}
                                    onChange={(e) => handleIngredientChange(index, "quantity", e.target.value)}
                                    className="w-20 border border-gray-300 rounded p-2 text-sm h-[38px]" // Altura ajustada para igualar al select
                                />

                                <select
                                    value={row.unit}
                                    onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                                    className="w-24 border border-gray-300 rounded p-2 text-sm h-[38px] bg-white"
                                >
                                    <option value="g">g</option>
                                    <option value="kg">kg</option>
                                    <option value="ml">ml</option>
                                    <option value="l">l</option>
                                    <option value="u">unds</option>
                                    <option value="tbsp">cda.</option>
                                    <option value="tsp">cdta.</option>
                                </select>

                                <button
                                    type="button"
                                    onClick={() => removeRow(index)}
                                    className="text-red-500 hover:text-red-700 font-bold px-2 h-[38px] flex items-center"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addRow}
                            className="mt-2 text-sm text-blue-600 font-medium hover:underline"
                        >
                            + Añadir otro ingrediente
                        </button>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/recipes")}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow"
                    >
                        Guardar Receta
                    </button>
                </div>
            </form>
        </div>
    );
};