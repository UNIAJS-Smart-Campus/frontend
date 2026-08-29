import { useState } from "react";
import "./SearchBar.css";

function SearchBar({ value, onChange, onSearch, placeholder, id, suggestions = [] }) {
    const [abierto, setAbierto] = useState(false);

    const normalizar = (texto) =>
        texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const termino = normalizar(value.trim());
    const filtradas = termino
        ? suggestions.filter((s) => normalizar(s).includes(termino)).slice(0, 8)
        : [];

    const seleccionar = (sugerencia) => {
        onChange({ target: { value: sugerencia } });
        setAbierto(false);
        onSearch?.();
    };

    return (
        <div className="searchbar-wrap">
            <form
                className="searchbar"
                role="search"
                onSubmit={(e) => {
                    e.preventDefault();
                    setAbierto(false);
                    onSearch?.();
                }}
            >
                <input
                    className="searchbar__input"
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => {
                        onChange(e);
                        setAbierto(true);
                    }}
                    onFocus={() => setAbierto(true)}
                    onBlur={() => setTimeout(() => setAbierto(false), 150)}
                    id={id}
                />
                <button type="submit" className="searchbar__button">
                    Buscar
                </button>
            </form>

            {abierto && filtradas.length > 0 && (
                <ul className="searchbar__suggestions">
                    {filtradas.map((sugerencia) => (
                        <li key={sugerencia}>
                            <button
                                type="button"
                                className="searchbar__suggestion"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => seleccionar(sugerencia)}
                            >
                                {sugerencia}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SearchBar;
