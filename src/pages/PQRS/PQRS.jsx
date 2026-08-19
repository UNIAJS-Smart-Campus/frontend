import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import useSearch from "../../hooks/useSearch";
import pqrsBase, { TIPOS_PQRS } from "../../utils/pqrs";
import "./PQRS.css";

const STORAGE_KEY = "uajs_pqrs";

function PQRS() {
    const [items] = useState(() => {
        try {
            const guardadas = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            return guardadas.length > 0 ? [...guardadas, ...pqrsBase] : pqrsBase;
        } catch {
            return pqrsBase;
        }
    });
    const [filtro, setFiltro] = useState("Todos");
    const [query, setQuery] = useState("");

    const filtradasPorTexto = useSearch(
        items,
        query,
        ["id", "tipo", "descripcion"]
    );

    const filtradas = filtro === "Todos"
        ? filtradasPorTexto
        : filtradasPorTexto.filter((item) => item.tipo === filtro);

    const contarTipo = (tipo) =>
        items.filter((item) => item.tipo === tipo).length;

    return (
        <div className="pqrs">
            <header className="pqrs__header">
                <h1 className="pqrs__title">PQRS</h1>
                <p className="pqrs__subtitle">
                    Peticiones, quejas, reclamos y sugerencias de la comunidad
                    universitaria.
                </p>
            </header>

            <div className="pqrs__stats">
                {TIPOS_PQRS.map((tipo) => (
                    <article className="pqrs__stat" key={tipo}>
                        <strong className="pqrs__stat-value">
                            {contarTipo(tipo)}
                        </strong>
                        <span className="pqrs__stat-label">{tipo}s</span>
                    </article>
                ))}
            </div>

            <div className="pqrs__toolbar">
                <div className="pqrs__search">
                    <Input
                        type="search"
                        placeholder="Buscar por número, tipo o descripción…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        id="pqrs-search"
                    />
                </div>

                <select
                    className="pqrs__select"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                >
                    <option value="Todos">Todos los tipos</option>
                    {TIPOS_PQRS.map((tipo) => (
                        <option key={tipo} value={tipo}>
                            {tipo}
                        </option>
                    ))}
                </select>

                <Link to="/pqrs/nueva">
                    <Button variant="primary">Nueva PQRS</Button>
                </Link>
            </div>

            <section className="pqrs__list">
                {filtradas.map((item) => (
                    <article className="pqrs__card" key={item.id}>
                        <div className="pqrs__card-top">
                            <strong className="pqrs__numero">{item.id}</strong>
                            <StatusBadge estado={item.estado} />
                        </div>

                        <span className="pqrs__tipo">{item.tipo}</span>

                        <p className="pqrs__descripcion">{item.descripcion}</p>

                        <span className="pqrs__fecha">{item.fecha}</span>
                    </article>
                ))}
            </section>

            {filtradas.length === 0 && (
                <p className="pqrs__empty">
                    No se encontraron PQRS con los filtros aplicados.
                </p>
            )}
        </div>
    );
}

export default PQRS;