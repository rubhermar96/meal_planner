import { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import api from '../api/axios';

export const IngredientSelect = ({ value, onChange }) => {
    const [options, setOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 1. Cargar ingredientes al montar
    useEffect(() => {
        loadIngredients();
    }, []);

    const loadIngredients = async () => {
        try {
            const res = await api.get('ingredients/');
            // React-Select necesita el formato { value: id, label: nombre }
            const formatted = res.data.map(i => ({ value: i.id, label: i.name }));
            setOptions(formatted);
        } catch (error) {
            console.error("Error cargando ingredientes", error);
        }
    };

    // 2. Lógica para crear uno nuevo al vuelo
    const handleCreate = async (inputValue) => {
        setIsLoading(true);
        try {
            // POST al backend para crear el ingrediente
            const res = await api.post('ingredients/', { name: inputValue });

            const newOption = { value: res.data.id, label: res.data.name };

            // Actualizamos la lista local y seleccionamos el nuevo
            setOptions((prev) => [...prev, newOption]);
            onChange(res.data.id); // Avisamos al padre del nuevo ID
        } catch (error) {
            alert("Error creando ingrediente. Quizás ya existe.");
        } finally {
            setIsLoading(false);
        }
    };

    // Buscamos el objeto completo para que el Select sepa cuál mostrar
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
            placeholder="Busca o escribe para crear..."
            formatCreateLabel={(inputValue) => `Crear "${inputValue}"`}
            className="text-sm"
        />
    );
};