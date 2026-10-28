import { useCallback, useState } from "react";

function getSavedValue(key, initialValue) {
    try {
        const item = localStorage.getItem(key);
        if (item) {
            return JSON.parse(item);
        }
    } catch {
        // si localStorage no está disponible se ignora
    }
    return typeof initialValue === "function" ? initialValue() : initialValue;
}

function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => getSavedValue(key, initialValue));

    const setStoredValue = useCallback((newValue) => {
        try {
            const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
            setValue(valueToStore);
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch {
            // si localStorage no está disponible se ignora
        }
    }, [key, value]);

    return [value, setStoredValue];
}

export default useLocalStorage;
