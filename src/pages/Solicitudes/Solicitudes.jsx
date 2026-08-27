import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Modal from "../../components/Modal/Modal";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import DataTable from "../../components/DataTable/DataTable";
import Pagination from "../../components/Pagination/Pagination";
import useSearch from "../../hooks/useSearch";
import usePagination from "../../hooks/usePagination";
import SearchBar from "../../components/SearchBar/SearchBar";
import useAuth from "../../context/useAuth";
import solicitudes, { ESTADOS_SOLICITUD } from "../../utils/solicitudes";
import "./Solicitudes.css";

const formVacio = {
    tipo: "",
    servicio: "",
    descripcion: "",
    prioridad: "Media"
};

function Solicitudes() {
    const [query, setQuery] = useState("");
    const [estado, setEstado] = useState("");
    const [items, setItems] = useState(solicitudes);
    const [crearAbierto, setCrearAbierto] = useState(false);
    const [form, setForm] = useState(formVacio);

    const { user, puede } = useAuth();

    const puedeRegistrar = puede("registrar_solicitudes");
    const puedeAvanzar = puede("actualizar_estados");

    const filtradasPorTexto = useSearch(
        items,
        query,
        ["id", "tipo", "servicio", "descripcion", "solicitante"]
    );

    const filtradas = estado
        ? filtradasPorTexto.filter((item) => item.estado === estado)
        : filtradasPorTexto;

    const { pagina, setPagina, totalPaginas, itemsPagina, desde, hasta } =
        usePagination(filtradas, 10);

    const avanzarEstado = (id) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) {
                    return item;
                }

                const posicion = ESTADOS_SOLICITUD.indexOf(item.estado);
                const siguiente =
                    posicion >= 0 && posicion < ESTADOS_SOLICITUD.length - 1
                        ? ESTADOS_SOLICITUD[posicion + 1]
                        : item.estado;

                return { ...item, estado: siguiente };
            })
        );
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCrear = (e) => {
        e.preventDefault();

        const nueva = {
            id: `SOL-2026-${String(items.length + 1).padStart(3, "0")}`,
            fecha: new Date().toISOString().slice(0, 10),
            estado: "Registrada",
            solicitante: user?.nombre ?? "Usuario",
            ...form
        };

        setItems([nueva, ...items]);
        setCrearAbierto(false);
        setForm(formVacio);
    };

    return (
        <div className="solicitudes">
            <div className="solicitudes__filters">
                <div className="solicitudes__search">
                    <SearchBar
                        placeholder="Buscar por número, tipo o descripción…"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPagina(1);
                        }}
                        id="solicitudes-search"
                    />
                </div>

                <select
                    className="solicitudes__select"
                    value={estado}
                    onChange={(e) => {
                        setEstado(e.target.value);
                        setPagina(1);
                    }}
                >
                    <option value="">Todos los estados</option>
                    {ESTADOS_SOLICITUD.map((estadoItem) => (
                        <option key={estadoItem} value={estadoItem}>
                            {estadoItem}
                        </option>
                    ))}
                </select>

                {puedeRegistrar && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setCrearAbierto(true)}
                    >
                        + Registrar solicitud
                    </Button>
                )}
            </div>

            <DataTable
                columns={[
                    { label: "Número", key: "id", strong: true },
                    { label: "Tipo", key: "tipo" },
                    { label: "Servicio", key: "servicio" },
                    { label: "Fecha", key: "fecha" },
                    {
                        label: "Estado",
                        render: (item) => <StatusBadge estado={item.estado} />
                    },
                    { label: "Solicitante", key: "solicitante" },
                    {
                        label: "Acciones",
                        render: (item) => (
                            <div className="dtable__actions">
                                <Link
                                    to={`/solicitudes/${item.id}`}
                                    className="solicitudes__link"
                                >
                                    Ver detalle
                                </Link>

                                {puedeAvanzar &&
                                    item.estado !== "Cerrada" && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                avanzarEstado(item.id)
                                            }
                                        >
                                            Avanzar
                                        </Button>
                                    )}
                            </div>
                        )
                    }
                ]}
                rows={itemsPagina}
                emptyMessage="No se encontraron solicitudes con los filtros aplicados."
            />

            <Pagination
                pagina={pagina}
                totalPaginas={totalPaginas}
                onChange={setPagina}
                desde={desde}
                hasta={hasta}
                total={filtradas.length}
            />

            <Modal
                isOpen={crearAbierto}
                title="Registrar solicitud"
                onClose={() => setCrearAbierto(false)}
            >
                <form className="solicitudes__form" onSubmit={handleCrear}>
                    <Input
                        label="Tipo de solicitud"
                        type="text"
                        name="tipo"
                        value={form.tipo}
                        onChange={handleChange}
                        placeholder="ej. Constancia académica"
                        id="solicitud-tipo"
                    />

                    <Input
                        label="Servicio"
                        type="text"
                        name="servicio"
                        value={form.servicio}
                        onChange={handleChange}
                        placeholder="ej. Solicitudes"
                        id="solicitud-servicio"
                    />

                    <div className="solicitudes__form-row">
                        <label className="solicitudes__label" htmlFor="solicitud-prioridad">
                            Prioridad
                        </label>
                        <select
                            className="solicitudes__select"
                            name="prioridad"
                            id="solicitud-prioridad"
                            value={form.prioridad}
                            onChange={handleChange}
                        >
                            <option value="Baja">Baja</option>
                            <option value="Media">Media</option>
                            <option value="Alta">Alta</option>
                        </select>
                    </div>

                    <Input
                        label="Descripción"
                        type="textarea"
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        placeholder="Describe el motivo de la solicitud"
                        id="solicitud-descripcion"
                    />

                    <Button
                        variant="primary"
                        type="submit"
                        disabled={!form.tipo || !form.servicio || !form.descripcion}
                    >
                        Crear solicitud
                    </Button>
                </form>
            </Modal>
        </div>
    );
}

export default Solicitudes;