export const UNITS = [
    { value: 'gramos', label: 'gramos', aliases: ['g', 'gr'] },
    { value: 'kilogramos', label: 'kilogramos', aliases: ['kg'] },
    { value: 'mililitros', label: 'mililitros', aliases: ['ml'] },
    { value: 'litros', label: 'litros', aliases: ['l'] },
    { value: 'unidades', label: 'unidades', aliases: ['u', 'unds', 'ud'] },
    { value: 'cucharada', label: 'cucharada', aliases: ['tbsp', 'cda.', 'cda'] },
    { value: 'cucharadita', label: 'cucharadita', aliases: ['tsp', 'cdta.', 'cdta'] },
    { value: 'pizca', label: 'pizca', aliases: [] },
];

export const normalizeUnit = (unit) => {
    if (!unit) return 'gramos';
    const lowerUnit = unit.toLowerCase().trim();
    const found = UNITS.find(u => u.value === lowerUnit || u.aliases.includes(lowerUnit));
    return found ? found.value : unit;
};
