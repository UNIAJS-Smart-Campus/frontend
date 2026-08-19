import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Modal from "../../components/Modal/Modal";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import useSearch from "../../hooks/useSearch";
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
            <header className="solicitudes__header">
                <h1 className="solicitudes__title">Solicitudes</h1>
                <p className="solicitudes__subtitle">
                    Consulta y da seguimiento a las solicitudes de servicios.
                </p>
            </header>

            <div className="solicitudes__filters">
                <div className="solicitudes__search">
                    <Input
                        type="search"
                        placeholder="Buscar por número, tipo o descripción…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        id="solicitudes-search"
                    />
                </div>

                <select
                    className="solicitudes__select"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
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

            {filtradas.length > 0 ? (
                <div className="solicitudes__list">
                    {filtradas.map((solicitud) => (
                        <article className="solicitudes__card" key={solicitud.id}>
                            <div className="solicitudes__card-top">
                                <strong className="solicitudes__numero">
                                    {solicitud.id}
                                </strong>
                                <StatusBadge estado={solicitud.estado} />
                            </div>

                            <h2 className="solicitudes__tipo">{solicitud.tipo}</h2>

                            <p className="solicitudes__descripcion">
                                {solicitud.descripcion}
                            </p>

                            <div className="solicitudes__meta">
                                <span>Servicio: {solicitud.servicio}</span>
                                <span>Fecha: {solicitud.fecha}</span>
                                {solicitud.prioridad && (
                                    <span>Prioridad: {solicitud.prioridad}</span>
                                )}
                            </div>

                            <div className="solicitudes__actions">
                                <Link
                                    to={`/solicitudes/${solicitud.id}`}
                                    className="solicitudes__link"
                                >
                                    Ver detalle y seguimiento →
                                </Link>

                                {puedeAvanzar &&
                                    solicitud.estado !== "Cerrada" && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                avanzarEstado(solicitud.id)
                                            }
                                        >
                                            Avanzar estado
                                        </Button>
                                    )}
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <p className="solicitudes__empty">
                    No se encontraron solicitudes con los filtros aplicados.
                </p>
            )}

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