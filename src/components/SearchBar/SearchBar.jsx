import { useEffect, useRef, useState } from "react";
import Icon from "../Icon/Icon";
import "./SearchBar.css";

function SearchBar({
    value,
    onChange,
    onSearch,
    placeholder = "Buscar…",
    id,
    suggestions = [],
    description = "Escribe para filtrar",
    maxSuggestions = 8,
}) {
    const [abierto, setAbierto] = useState(false);
    const [activa, setActiva] = useState(-1);
    const wrapRef = useRef(null);

    const normalizar = (texto) =>
        texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const termino = normalizar(value.trim());
    const filtradas = termino
        ? suggestions.filter((s) => normalizar(s).includes(termino)).slice(0, maxSuggestions)
        : [];

    const limpiar = () => {
        onChange({ target: { value: "" } });
        setActiva(-1);
        setAbierto(false);
        onSearch?.();
    };

    const seleccionar = (sugerencia) => {
        onChange({ target: { value: sugerencia } });
        setAbierto(false);
        setActiva(-1);
        onSearch?.();
    };

    const alEscribir = (e) => {
        onChange(e);
        setAbierto(true);
        setActiva(-1);
    };

    const alKeyDown = (e) => {
        if (filtradas.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiva((prev) => (prev + 1) % filtradas.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiva((prev) => (prev <= 0 ? filtradas.length - 1 : prev - 1));
        } else if (e.key === "Enter") {
            if (activa >= 0 && filtradas[activa]) {
                e.preventDefault();
                seleccionar(filtradas[activa]);
            } else {
                setAbierto(false);
            }
        } else if (e.key === "Escape") {
            setAbierto(false);
            setActiva(-1);
        }
    };

    // Al navegar con flechas, mantener visible la sugerencia activa
    useEffect(() => {
        const el = wrapRef.current?.querySelector(
            "[data-active='true']"
        );
        el?.scrollIntoView({ block: "nearest" });
    }, [activa]);

    // Resaltar el término coincidente dentro de la sugerencia
    const resaltar = (sugerencia) => {
        if (!termino) return sugerencia;
        const idx = normalizar(sugerencia).indexOf(termino);
        if (idx === -1) return sugerencia;

        const antes = sugerencia.slice(0, idx);
        const coincidencia = sugerencia.slice(idx, idx + value.trim().length);
        const despues = sugerencia.slice(idx + value.trim().length);

        return (
            <>
                {antes}
                <mark className="searchbar__match">{coincidencia}</mark>
                {despues}
            </>
        );
    };

    return (
        <div className="searchbar-wrap" ref={wrapRef}>
            <form
                className="searchbar"
                role="search"
                onSubmit={(e) => {
                    e.preventDefault();
                    setAbierto(false);
                    setActiva(-1);
                    onSearch?.();
                }}
            >
                <Icon
                    name="buscar"
                    size={16}
                    className="searchbar__icon"
                />

                <input
                    className="searchbar__input"
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={alEscribir}
                    onFocus={() => {
                        setAbierto(true);
                        setActiva(-1);
                    }}
                    onBlur={() => {
                        // Delay para permitir clic en sugerencias
                        setTimeout(() => setAbierto(false), 150);
                    }}
                    onKeyDown={alKeyDown}
                    id={id}
                />

                {value && (
                    <button
                        type="button"
                        className="searchbar__clear"
                        onClick={limpiar}
                        onMouseDown={(e) => e.preventDefault()}
                        aria-label="Limpiar búsqueda"
                    >
                        <svg
                            className="icon"
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M18 6 6 18" />
                            <path d="M6 6 18 18" />
                        </svg>
                    </button>
                )}
            </form>

            {description && (
                <p className="searchbar__description">{description}</p>
            )}

            {abierto && filtradas.length > 0 && (
                <ul className="searchbar__suggestions">
                    {filtradas.map((sugerencia, i) => (
                        <li key={`${sugerencia}-${i}`}>
                            <button
                                type="button"
                                className={`searchbar__suggestion ${
                                    i === activa
                                        ? "searchbar__suggestion--active"
                                        : ""
                                }`}
                                data-active={i === activa}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => seleccionar(sugerencia)}
                            >
                                {resaltar(sugerencia)}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SearchBar;
