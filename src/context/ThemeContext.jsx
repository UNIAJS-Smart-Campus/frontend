import { createContext, useContext, useEffect, useMemo, useState } from "react";

const TEMA_KEY = "uajs_tema";
const CONFIG_KEY = "uajs_config";

// Resolvemos el tema inicial desde la configuración guardada (apariencia.tema)
// para respetar la elección previa del usuario, con "sistema" como respaldo.
function temaInicial() {
    try {
        const cfg = JSON.parse(localStorage.getItem(CONFIG_KEY));
        if (cfg?.apariencia?.tema === "claro" || cfg?.apariencia?.tema === "oscuro") {
            return cfg.apariencia.tema;
        }
    } catch {
        /* ignorar config corrupta */
    }
    const previo = localStorage.getItem(TEMA_KEY);
    return previo === "claro" || previo === "oscuro" || previo === "sistema"
        ? previo
        : "sistema";
}

function esOscuro(tema) {
    if (tema === "oscuro") return true;
    if (tema === "claro") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [tema, setTema] = useState(temaInicial);

    // Único lugar que aplica el tema al <html> y lo persiste.
    useEffect(() => {
        const root = document.documentElement;
        const dark = esOscuro(tema);

        root.classList.toggle("dark", dark);
        root.setAttribute("data-theme", dark ? "dark" : "light");

        localStorage.setItem(TEMA_KEY, tema);

        // Reflejar también en la config de Configuración para mantenerla en sync
        try {
            const cfg = JSON.parse(localStorage.getItem(CONFIG_KEY)) || {};
            localStorage.setItem(
                CONFIG_KEY,
                JSON.stringify({ ...cfg, apariencia: { tema } })
            );
        } catch {
            /* ignorar */
        }
    }, [tema]);

    const darkMode = useMemo(() => esOscuro(tema), [tema]);

    const toggleTheme = () => {
        setTema((prev) => {
            if (prev === "sistema") {
                // Si está en "sistema", fuerza al opuesto de la preferencia actual
                return esOscuro("sistema") ? "claro" : "oscuro";
            }
            return prev === "oscuro" ? "claro" : "oscuro";
        });
    };

    return (
        <ThemeContext.Provider value={{ tema, darkMode, toggleTheme, setTema }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    return useContext(ThemeContext);
};
