import { useState } from "react";
import Button from "../../components/Button/Button";
import DataTable from "../../components/DataTable/DataTable";
import Pagination from "../../components/Pagination/Pagination";
import SearchBar from "../../components/SearchBar/SearchBar";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import Icon from "../../components/Icon/Icon";
import useSearch from "../../hooks/useSearch";
import usePagination from "../../hooks/usePagination";
import notificaciones from "../../utils/notificaciones";
import "./Notificaciones.css";

function Notificaciones() {
    const [items, setItems] = useState(notificaciones);
    const [query, setQuery] = useState("");

    const noLeidas = items.filter((item) => !item.leida).length;

    const filtradas = useSearch(items, query, ["tipo", "mensaje"]);

    const { pagina, setPagina, totalPaginas, itemsPagina, desde, hasta } =
        usePagination(filtradas, 10);

    const marcarLeida = (id) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, leida: true } : item
            )
        );
    };

    const marcarTodasLeidas = () => {
        setItems((prev) => prev.map((item) => ({ ...item, leida: true })));
    };

    const columns = [
        {
            label: "Tipo",
            key: "tipo",
            width: "140px",
            render: (item) => (
                <span className="notificaciones__cell-tipo">
                    <span className="notificaciones__cell-icon">
                        <Icon name={item.icono} size={18} />
                    </span>
                    {item.tipo}
                </span>
            )
        },
        {
            label: "Fecha",
            key: "fecha",
            width: "120px"
        },
        {
            label: "Mensaje",
            key: "mensaje",
            render: (item) => (
                <span className="notificaciones__cell-mensaje">
                    {item.mensaje}
                </span>
            )
        },
        {
            label: "Estado",
            width: "120px",
            render: (item) => (
                <StatusBadge estado={item.leida ? "Leída" : "No leída"} />
            )
        },
        {
            label: "Acciones",
            width: "140px",
            render: (item) =>
                !item.leida ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => marcarLeida(item.id)}
                    >
                        Marcar leída
                    </Button>
                ) : null
        }
    ];

    return (
        <div className="notificaciones">
            <div className="notificaciones__search">
                <SearchBar
                    placeholder="Buscar por tipo o mensaje…"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setPagina(1);
                    }}
                    id="notificaciones-search"
                />
            </div>

            <div className="notificaciones__toolbar">
                <span className="notificaciones__count">
                    {noLeidas} sin leer
                </span>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={marcarTodasLeidas}
                    disabled={noLeidas === 0}
                >
                    Marcar todas como leídas
                </Button>
            </div>

            <DataTable
                columns={columns}
                rows={itemsPagina}
                emptyMessage="No se encontraron notificaciones para la búsqueda aplicada."
            />

            <Pagination
                pagina={pagina}
                totalPaginas={totalPaginas}
                onChange={setPagina}
                desde={desde}
                hasta={hasta}
                total={filtradas.length}
            />

            {filtradas.length === 0 && (
                <p className="notificaciones__empty">
                    No se encontraron notificaciones para «{query}».
                </p>
            )}
        </div>
    );
}

export default Notificaciones;
