import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button/Button";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import DataTable from "../../components/DataTable/DataTable";
import Pagination from "../../components/Pagination/Pagination";
import useSearch from "../../hooks/useSearch";
import usePagination from "../../hooks/usePagination";
import SearchBar from "../../components/SearchBar/SearchBar";
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

    const { pagina, setPagina, totalPaginas, itemsPagina, desde, hasta } =
        usePagination(filtradas, 10);

    const contarTipo = (tipo) =>
        items.filter((item) => item.tipo === tipo).length;

    return (
        <div className="pqrs">
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
                    <SearchBar
                        placeholder="Buscar por número, tipo o descripción…"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPagina(1);
                        }}
                        id="pqrs-search"
                    />
                </div>

                <select
                    className="pqrs__select"
                    value={filtro}
                    onChange={(e) => {
                        setFiltro(e.target.value);
                        setPagina(1);
                    }}
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

            <DataTable
                columns={[
                    { label: "Número", key: "id", strong: true },
                    { label: "Tipo", key: "tipo" },
                    {
                        label: "Estado",
                        render: (item) => <StatusBadge estado={item.estado} />
                    },
                    { label: "Fecha", key: "fecha" },
                    { label: "Descripción", key: "descripcion" }
                ]}
                rows={itemsPagina}
                emptyMessage="No se encontraron PQRS con los filtros aplicados."
            />

            <Pagination
                pagina={pagina}
                totalPaginas={totalPaginas}
                onChange={setPagina}
                desde={desde}
                hasta={hasta}
                total={filtradas.length}
            />
        </div>
    );
}

export default PQRS;