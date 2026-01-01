import { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import api from '../api/axios';

export const IngredientSelect = ({ value, onChange }) => {
    const [options, setOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadIngredients();
    }, []);

    const loadIngredients = async () => {
        try {
            const res = await api.get('ingredients/');
            const formatted = res.data.map(i => ({ value: i.id, label: i.name }));
            setOptions(formatted);
        } catch (error) {
            console.error("Error cargando ingredientes:", error);
        }
    };

    const handleCreate = async (inputValue) => {
        console.log("Intentando crear:", inputValue); // <--- LOG 1
        setIsLoading(true);
        try {
            // Enviamos solo el nombre (el backend pone el usuario)
            const res = await api.post('ingredients/', { name: inputValue });

            console.log("Respuesta del servidor:", res.data); // <--- LOG 2

            // Creamos la opción para el select
            const newOption = { value: res.data.id, label: res.data.name };

            // IMPORTANTE: Actualizamos la lista local INMEDIATAMENTE
            setOptions((prev) => [...prev, newOption]);

            // Avisamos al padre del nuevo ID
            onChange(res.data.id);

        } catch (error) {
            // Si falla, queremos saber por qué (puede ser un error 400 de validación)
            console.error("Error CREANDO ingrediente:", error.response?.data || error.message);
            alert("Error al crear. Mira la consola (F12) para más detalles.");
        } finally {
            setIsLoading(false);
        }
    };

    // Buscamos la opción seleccionada
    const currentOption = options.find(op => op.value === value);

    return (
        <CreatableSelect
            isClearable
            isDisabled={isLoading}
            isLoading={isLoading}
            onChange={(newValue) => onChange(newValue?.value || "")}
            onCreateOption={handleCreate}
            options={options}
            value={currentOption}
            placeholder="Busca o escribe..."
            formatCreateLabel={(inputValue) => `Crear "${inputValue}"`}
            className="text-sm"
        />
    );
};