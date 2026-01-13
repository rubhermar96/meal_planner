import { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import api from '../../../api/axios';

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
        setIsLoading(true);
        try {
            // Creamos el ingrediente
            const res = await api.post('ingredients/', { name: inputValue });

            // Lo añadimos a la lista local
            const newOption = { value: res.data.id, label: res.data.name };
            setOptions((prev) => [...prev, newOption]);

            // Seleccionamos el nuevo valor automáticamente
            onChange(res.data.id);

        } catch (error) {
            console.error("Error creando ingrediente:", error);
            alert("No se pudo crear el ingrediente.");
        } finally {
            setIsLoading(false);
        }
    };

    const currentOption = options.find(op => op.value === value);

    // --- ESTILOS PERSONALIZADOS PARA QUE PAREZCA TAILWIND ---
    // React-Select usa JS para estilos, así que mapeamos tus variables CSS aquí.
    const customStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: 'hsl(var(--background))',
            borderColor: state.isFocused ? 'hsl(var(--primary))' : 'hsl(var(--border))', // Borde gris suave o Berry al foco
            borderWidth: '1px',
            borderRadius: '0.5rem', // rounded-lg
            padding: '2px',
            boxShadow: state.isFocused ? '0 0 0 1px hsl(var(--primary))' : 'none', // Anillo de foco Berry
            '&:hover': {
                borderColor: state.isFocused ? 'hsl(var(--primary))' : 'hsl(var(--border))',
            },
            minHeight: '42px', // Altura consistente con los otros inputs
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.75rem', // rounded-xl
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', // shadow-lg
            zIndex: 50,
            overflow: 'hidden',
            padding: 0
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? 'hsl(var(--muted))' : 'transparent', // Hover gris suave
            color: 'hsl(var(--foreground))',
            cursor: 'pointer',
            padding: '10px 12px',
            fontSize: '0.875rem', // text-sm
            '&:active': {
                backgroundColor: 'hsl(var(--primary))',
                color: 'white'
            },
            '&:hover': {
                backgroundColor: 'hsl(var(--primary))',
                color: 'white',
            }
        }),
        singleValue: (base) => ({
            ...base,
            color: 'hsl(var(--foreground))',
            fontWeight: 500,
        }),
        input: (base) => ({
            ...base,
            color: 'hsl(var(--foreground))',
        }),
        placeholder: (base) => ({
            ...base,
            color: 'hsl(var(--muted-foreground))',
            fontSize: '0.875rem',
        }),
    };

    return (
        <CreatableSelect
            isClearable
            isDisabled={isLoading}
            isLoading={isLoading}
            onChange={(newValue) => onChange(newValue?.value || "")}
            onCreateOption={handleCreate}
            options={options}
            value={currentOption}
            placeholder="Selecciona o escribe..."
            formatCreateLabel={(inputValue) => `✨ Crear nuevo: "${inputValue}"`}
            styles={customStyles} // APLICAMOS LOS ESTILOS
            classNamePrefix="react-select"
        />
    );
};
