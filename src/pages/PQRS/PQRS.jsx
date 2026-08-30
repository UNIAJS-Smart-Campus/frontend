import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/Icon/Icon";
import SearchBar from "../../components/SearchBar/SearchBar";
import Pagination from "../../components/Pagination/Pagination";
import pqrsBase, { TIPOS_PQRS } from "../../utils/pqrs";
import useSearch from "../../hooks/useSearch";
import usePagination from "../../hooks/usePagination";
import "./PQRS.css";

const STORAGE_KEY = "uajs_pqrs";

const TIPO_ICONO = {
    Petición: "solicitudes",
    Queja: "pqrs",
    Reclamo: "info",
    Sugerencia: "eventos"
};

const TIPO_CLASE = {
    Petición: "blue",
    Queja: "red",
    Reclamo: "orange",
    Sugerencia: "green"
};

const ESTADO_CLASE = {
    "En revisión": "review",
    Asignada: "assigned",
    Resuelta: "resolved",
    Cerrada: "closed",
    Registrada: "registered"
};

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
    const [busqueda, setBusqueda] = useState("");

    const buscados = useSearch(items, busqueda, ["id", "tipo", "descripcion", "estado"]);

    const filtradas =
        filtro === "Todos"
            ? buscados
            : buscados.filter((item) => item.tipo === filtro);

    const { pagina, setPagina, totalPaginas, itemsPagina, desde, hasta } = usePagination(filtradas, 8);

    const contarTipo = (tipo) =>
        tipo === "Todos"
            ? filtradas.length
            : filtradas.filter((item) => item.tipo === tipo).length;

    const sugerencias = useMemo(() => {
        return [
            ...new Set(
                items
                    .flatMap((item) => [String(item.id), item.tipo, item.estado])
                    .filter(Boolean)
            )
        ];
    }, [items]);

    const fechaLegible = (fecha) => {
        const partes = String(fecha).split("-");
        if (partes.length !== 3) return fecha;
        const meses = [
            "ene", "feb", "mar", "abr", "may", "jun",
            "jul", "ago", "sep", "oct", "nov", "dic"
        ];
        return `${partes[2]} ${meses[Number(partes[1]) - 1]} ${partes[0]}`;
    };

    return (
        <div className="pqrs">
            <div className="pqrs__page-header">
                <div className="pqrs__page-title">
                    <h1>PQRS</h1>
                    <p>
                        Gestiona tus peticiones, quejas, reclamos y sugerencias.
                    </p>
                </div>

                <Link to="/pqrs/nueva" className="pqrs__new-button">
                    <Icon name="solicitudes" size={15} />
                    Nueva PQRS
                </Link>
            </div>

            <div className="pqrs__summary">
                <button
                    className={
                        filtro === "Todos"
                            ? "pqrs__summary-card pqrs__summary-card--active"
                            : "pqrs__summary-card"
                    }
                    onClick={() => setFiltro("Todos")}
                >
                    <div className="pqrs__summary-icon pqrs__summary-icon--all">
                        <Icon name="pqrs" size={19} />
                    </div>
                    <div>
                        <div className="pqrs__summary-label">Todos</div>
                        <div className="pqrs__summary-number">
                            {contarTipo("Todos")}
                        </div>
                    </div>
                </button>

                {TIPOS_PQRS.map((tipo) => (
                    <button
                        key={tipo}
                        className={
                            filtro === tipo
                                ? `pqrs__summary-card pqrs__summary-card--active`
                                : "pqrs__summary-card"
                        }
                        onClick={() => setFiltro(tipo)}
                    >
                        <div
                            className={`pqrs__summary-icon pqrs__summary-icon--${TIPO_CLASE[tipo]}`}
                        >
                            <Icon name={TIPO_ICONO[tipo]} size={19} />
                        </div>
                        <div>
                            <div className="pqrs__summary-label">{tipo}</div>
                            <div className="pqrs__summary-number">
                                {contarTipo(tipo)}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="pqrs__filter-card">
                <div className="pqrs__filters">
                    <div className="pqrs__filter-group pqrs__filter-group--search">
                        <label htmlFor="pqrs-search">Buscar</label>
                        <SearchBar
                            id="pqrs-search"
                            placeholder="Número, tipo, estado o descripción…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onSearch={() => setBusqueda(query)}
                            suggestions={sugerencias}
                        />
                    </div>

                    <div className="pqrs__filter-group">
                        <label htmlFor="pqrs-tipo">Tipo</label>
                        <select
                            id="pqrs-tipo"
                            className="pqrs__filter-select"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        >
                            <option value="Todos">Todos</option>
                            {TIPOS_PQRS.map((tipo) => (
                                <option key={tipo} value={tipo}>
                                    {tipo}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="pqrs__list-header">
                <h2>Mis PQRS</h2>
                <span>
                    {desde}–{hasta} de {filtradas.length} registros
                </span>
            </div>

            {itemsPagina.length === 0 ? (
                <div className="pqrs__empty">
                    No se encontraron PQRS con los filtros aplicados.
                </div>
            ) : (
                <>
                    <div className="pqrs__list">
                        {itemsPagina.map((item) => (
                            <article className="pqrs__item" key={item.id}>
                                <div
                                    className={`pqrs__item-icon pqrs__item-icon--${TIPO_CLASE[item.tipo]}`}
                                >
                                    <Icon name={TIPO_ICONO[item.tipo]} size={20} />
                                </div>

                                <div className="pqrs__item-body">
                                    <div className="pqrs__item-meta">
                                        <span className="pqrs__item-id">
                                            {item.id}
                                        </span>
                                        <span
                                            className={`pqrs__item-status ${ESTADO_CLASE[item.estado] || "closed"}`}
                                        >
                                            {item.estado}
                                        </span>
                                    </div>
                                    <h3>{item.tipo}</h3>
                                    <p className="pqrs__item-desc">
                                        {item.descripcion}
                                    </p>
                                    <span className="pqrs__item-date">
                                        {fechaLegible(item.fecha)}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                    <Pagination
                        pagina={pagina}
                        totalPaginas={totalPaginas}
                        onChange={setPagina}
                        desde={desde}
                        hasta={hasta}
                        total={filtradas.length}
                    />
                </>
            )}
        </div>
    );
}

export default PQRS;
