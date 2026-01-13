import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { IngredientSelect } from "../components/IngredientSelect";
import { useAuth } from '../../auth/context/AuthContext';
import {
    ArrowLeftIcon,
    PhotoIcon,
    TrashIcon,
    PlusIcon,
    SparklesIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';

export const CreateRecipePage = () => {
    const navigate = useNavigate();
    const { activeGroup } = useAuth();

    // Estado del formulario
    const [name, setName] = useState("");
    const [baseServings, setBaseServings] = useState(4);
    const [ingredients, setIngredients] = useState([
        { ingredient_id: "", quantity: "", unit: "g" }
    ]);
    const [instructions, setInstructions] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageBase64, setImageBase64] = useState("");
    const [loading, setLoading] = useState(false);

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
            setSelectedImage(URL.createObjectURL(file));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Validamos ingredientes
            const validIngredients = ingredients.filter(i => i.ingredient_id && i.quantity);

            if (validIngredients.length === 0) {
                alert("Añade al menos un ingrediente");
                setLoading(false);
                return;
            }

            // 2. Preparamos los ingredientes
            const ingredientsPayload = validIngredients.map(i => ({
                ingredient: i.ingredient_id,
                quantity: i.quantity,
                unit: i.unit
            }));

            // 3. Objeto base
            const payload = {
                name,
                base_servings: parseInt(baseServings),
                meal_type: "HOME",
                ingredients: ingredientsPayload,
                instructions: instructions
            };

            // 4. Imagen
            if (imageBase64) {
                payload.image = imageBase64;
            }

            await api.post("meals/", payload);
            navigate("/recipes");
        } catch (error) {
            console.error(error);
            alert("Error creando receta.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-[color:hsl(var(--muted-foreground))] animate-pulse">
            <SparklesIcon className="w-10 h-10 mb-4 text-[color:hsl(var(--primary))]" />
            <p>Guardando tu creación...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-32 px-4 font-sans animate-fade-in space-y-8">

            {/* CABECERA */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full hover:bg-[color:hsl(var(--muted))] text-[color:hsl(var(--muted-foreground))] transition-colors"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-[color:hsl(var(--foreground))] tracking-tight">
                        Nueva Receta
                    </h1>
                    <p className="text-[color:hsl(var(--muted-foreground))]">
                        Añade un nuevo plato a tu colección personal.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">

                {/* 1. SECCIÓN IMAGEN (HERO UPLOADER) */}
                <div className="relative group">
                    <div className="aspect-video w-full rounded-3xl overflow-hidden bg-[color:hsl(var(--muted))]/30 border-2 border-dashed border-[color:hsl(var(--border))] relative flex items-center justify-center transition-all group-hover:border-[color:hsl(var(--primary))]">

                        {selectedImage ? (
                            <>
                                <img
                                    src={selectedImage}
                                    alt="Preview"
                                    className="w-full h-full object-cover opacity-100 group-hover:opacity-75 transition-opacity duration-300"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="bg-black/50 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 backdrop-blur-sm">
                                        <PencilSquareIcon className="w-5 h-5" /> Cambiar Foto
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center text-[color:hsl(var(--muted-foreground))]">
                                <PhotoIcon className="w-16 h-16 mb-2 opacity-50" />
                                <p className="font-medium">Sube una foto del plato</p>
                                <p className="text-xs opacity-70">Haz clic para seleccionar</p>
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                </div>

                {/* 2. DATOS BÁSICOS */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-[color:hsl(var(--muted-foreground))] uppercase tracking-wider ml-1">
                            Nombre del Plato
                        </label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="input w-full bg-[color:hsl(var(--background))] text-lg font-bold"
                            placeholder="Ej: Lentejas estofadas"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[color:hsl(var(--muted-foreground))] uppercase tracking-wider ml-1">
                            Raciones
                        </label>
                        <input
                            type="number"
                            value={baseServings}
                            onChange={e => setBaseServings(e.target.value)}
                            className="input w-full bg-[color:hsl(var(--background))]"
                        />
                    </div>
                </div>

                {/* 3. INGREDIENTES */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-lg font-bold text-[color:hsl(var(--foreground))]">Ingredientes</label>
                    </div>

                    <div className="space-y-3">
                        {ingredients.map((row, index) => (
                            <div key={index} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300">

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
                                    className="input w-20 text-center bg-[color:hsl(var(--background))]"
                                />

                                <div className="relative w-24">
                                    <select
                                        value={row.unit}
                                        onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                                        className="input w-full bg-[color:hsl(var(--background))] appearance-none pr-8 text-sm"
                                    >
                                        <option value="g">g</option>
                                        <option value="kg">kg</option>
                                        <option value="ml">ml</option>
                                        <option value="l">l</option>
                                        <option value="u">unds</option>
                                        <option value="tbsp">cda.</option>
                                        <option value="tsp">cdta.</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[color:hsl(var(--muted-foreground))]">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeRow(index)}
                                    className="p-3 text-[color:hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar fila"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={addRow}
                        className="text-sm font-bold text-[color:hsl(var(--primary))] hover:underline flex items-center gap-1"
                    >
                        <PlusIcon className="w-4 h-4" /> Añadir ingrediente
                    </button>
                </div>

                {/* 4. INSTRUCCIONES */}
                <div className="space-y-2">
                    <label className="text-lg font-bold text-[color:hsl(var(--foreground))]">Pasos de preparación</label>
                    <textarea
                        value={instructions}
                        onChange={e => setInstructions(e.target.value)}
                        placeholder="1. Cortar la cebolla...&#10;2. Sofreír..."
                        rows={8}
                        className="input w-full bg-[color:hsl(var(--background))] h-auto py-4 leading-relaxed whitespace-pre-wrap"
                    />
                </div>

                {/* BOTONES ACCIÓN */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-[color:hsl(var(--border))]">
                    <button
                        type="button"
                        onClick={() => navigate("/recipes")}
                        className="px-6 py-2.5 font-bold text-[color:hsl(var(--muted-foreground))] hover:text-[color:hsl(var(--foreground))] transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-primary px-8 py-2.5 shadow-xl shadow-pink-500/20"
                    >
                        Crear Receta
                    </button>
                </div>
            </form>
        </div>
    );
};
