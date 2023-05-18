import { useState } from "react";

type Setter<T> = (value: T | ((val: T) => T)) => void;

const useStorage = <T>(key: string, initialValue: T): [T, Setter<T>] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.log("Error reading localStorage:", error);
            return initialValue;
        }
    });

    const setValue: Setter<T> = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.log("Error setting localStorage:", error);
        }
    };

    return [storedValue, setValue];
};

export default useStorage;
