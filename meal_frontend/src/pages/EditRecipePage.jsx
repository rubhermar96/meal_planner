import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { IngredientSelect } from "../components/IngredientSelect"; // Usamos tu componente
import { useAuth } from '../context/AuthContext';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const EditRecipePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Estados del formulario (Igual que en Create)
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [baseServings, setBaseServings] = useState(4);
    const [ingredients, setIngredients] = useState([]);
    const [instructions, setInstructions] = useState("");

    // Estados para imagen
    const [currentImageUrl, setCurrentImageUrl] = useState(null); // URL actual (Cloudinary/Local)
    const [previewImage, setPreviewImage] = useState(null);       // Preview si subes una nueva
    const [newImageBase64, setNewImageBase64] = useState(null);   // Base64 para enviar si cambia

    // 1. CARGAR DATOS AL INICIAR
    useEffect(() => {
        const loadRecipe = async () => {
            try {
                const res = await api.get(`meals/${id}/`);
                const meal = res.data;

                setName(meal.name);
                setBaseServings(meal.base_servings);
                setInstructions(meal.instructions || "");
                setCurrentImageUrl(meal.image);

                // MAPEO CRÍTICO: Backend devuelve { ingredient: ID } -> Frontend espera { ingredient_id: ID }
                const formattedIngredients = meal.ingredients.map(ing => ({
                    ingredient_id: ing.ingredient,
                    quantity: ing.quantity,
                    unit: ing.unit
                }));
                setIngredients(formattedIngredients);

            } catch (error) {
                console.error("Error cargando receta", error);
                alert("No se pudo cargar la receta.");
                navigate('/recipes');
            } finally {
                setLoading(false);
            }
        };
        loadRecipe();
    }, [id, navigate]);

    // --- MISMOS MANEJADORES QUE EN CREATE ---

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file)); // Preview local
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImageBase64(reader.result); // Guardamos el Base64 nuevo
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 1. Validar
            const validIngredients = ingredients.filter(i => i.ingredient_id && i.quantity);
            if (validIngredients.length === 0) {
                alert("Añade al menos un ingrediente");
                return;
            }

            // 2. Mapear para el Backend
            const ingredientsPayload = validIngredients.map(i => ({
                ingredient: i.ingredient_id,
                quantity: i.quantity,
                unit: i.unit
            }));

            const payload = {
                name,
                base_servings: parseInt(baseServings),
                meal_type: "HOME",
                ingredients: ingredientsPayload,
                instructions: instructions,
                // NOTA: No enviamos 'image' aquí todavía
            };

            // Lógica de Imagen: Solo enviamos el campo si hay una NUEVA imagen
            if (newImageBase64) {
                payload.image = newImageBase64;
            }

            // 3. Enviar PUT
            await api.put(`meals/${id}/`, payload);
            navigate(`/recipes/${id}`); // Volver al detalle

        } catch (error) {
            console.error(error);
            alert("Error editando receta: " + JSON.stringify(error.response?.data));
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando...</div>;

    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-200 mt-6 pb-20">

            {/* Cabecera con botón volver */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-blue-600">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">✏️ Editar Receta</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* NOMBRE Y RACIONES */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plato</label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
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

                {/* IMAGEN (Con lógica de preview de edición) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Foto del plato</label>
                    <div className="flex items-start gap-4">
                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 relative">
                            {(previewImage || currentImageUrl) ? (
                                <img
                                    src={previewImage || currentImageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-400 text-xs text-center px-2">Sin imagen</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Sube una foto solo si quieres cambiar la actual.
                            </p>
                        </div>
                    </div>
                </div>

                {/* INGREDIENTES (USANDO TU COMPONENTE IngredientSelect) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ingredientes</label>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        {ingredients.map((row, index) => (
                            <div key={index} className="flex gap-2 items-start">

                                {/* Componente Reuse */}
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
                                    className="w-20 border border-gray-300 rounded p-2 text-sm h-[38px]"
                                />

                                {/* Selector de Unidades idéntico al de Create */}
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

                {/* INSTRUCCIONES */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pasos de la Receta</label>
                    <textarea
                        value={instructions}
                        onChange={e => setInstructions(e.target.value)}
                        placeholder="1. Cortar la cebolla...&#10;2. Sofreír..."
                        rows={6}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none whitespace-pre-wrap"
                    />
                </div>

                {/* BOTONES */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate(`/recipes/${id}`)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-transparent hover:border-gray-300 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
};