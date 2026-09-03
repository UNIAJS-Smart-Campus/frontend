import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "uajs_font_size";
const LEVELS = [
    { id: "sm", label: "A-", px: 14 },
    { id: "md", label: "A", px: 16 },
    { id: "lg", label: "A+", px: 18 }
];

function readInitial() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const match = LEVELS.find((l) => l.id === stored);
            if (match) return match;
        }
    } catch {
        /* ignorar */
    }
    return LEVELS[1];
}

export default function useFontSize() {
    const [level, setLevel] = useState(readInitial);

    useEffect(() => {
        document.documentElement.style.setProperty("--app-base-font-size", `${level.px}px`);
        try {
            localStorage.setItem(STORAGE_KEY, level.id);
        } catch {
            /* ignorar */
        }
    }, [level]);

    const api = useMemo(
        () => ({
            level,
            levels: LEVELS,
            setLevel,
            increase: () => {
                const idx = LEVELS.findIndex((l) => l.id === level.id);
                if (idx < LEVELS.length - 1) setLevel(LEVELS[idx + 1]);
            },
            decrease: () => {
                const idx = LEVELS.findIndex((l) => l.id === level.id);
                if (idx > 0) setLevel(LEVELS[idx - 1]);
            }
        }),
        [level]
    );

    return api;
}
