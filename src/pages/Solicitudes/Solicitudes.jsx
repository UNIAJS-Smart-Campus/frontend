import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../context/useAuth";
import Icon from "../../components/Icon/Icon";
import SearchBar from "../../components/SearchBar/SearchBar";
import solicitudes, { ESTADOS_SOLICITUD } from "../../utils/solicitudes";
import "./Solicitudes.css";

const SERVICIO_ICONO = {
    Reservas: "reservas",
    Solicitudes: "solicitudes",
    Eventos: "eventos",
    PQRS: "pqrs",
    Recursos: "recursos"
};

const SERVICIO_CLASE = {
    Reservas: "blue",
    Solicitudes: "green",
    Eventos: "purple",
    PQRS: "red",
    Recursos: "orange"
};

const ESTADO_CLASE = {
    "En proceso": "blue",
    "En revisión": "blue",
    Registrada: "yellow",
    Asignada: "purple",
    Resuelta: "green",
    Cerrada: "gray"
};

const PRIORIDAD_CLASE = {
    Alta: "alta",
    Media: "media",
    Baja: "baja"
};

const formVacio = {
    tipo: "",
    servicio: "",
    descripcion: "",
    prioridad: "Media"
};

function Solicitudes() {
    const [query, setQuery] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [estado, setEstado] = useState("");
    const [items, setItems] = useState(solicitudes);
    const [crearAbierto, setCrearAbierto] = useState(false);
    const [form, setForm] = useState(formVacio);
    const [aviso, setAviso] = useState("");

    const { user, puede } = useAuth();

    const puedeRegistrar = puede("registrar_solicitudes");
    const puedeAvanzar = puede("actualizar_estados");

    const normalizar = (texto) =>
        texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filtradasPorEstado = estado
        ? items.filter((item) => item.estado === estado)
        : items;

    const encontradas = busqueda.trim()
        ? filtradasPorEstado.filter((item) =>
              [item.id, item.tipo, item.servicio, item.descripcion, item.solicitante, item.estado]
                  .join(" ")
                  .toLowerCase()
                  .includes(normalizar(busqueda))
          )
        : filtradasPorEstado;

    const contarPorEstado = (estadoItem) =>
        items.filter((item) => item.estado === estadoItem).length;

    const sugerencias = [
        ...new Set(
            items
                .flatMap((item) => [String(item.id), item.tipo, item.servicio, item.solicitante])
                .filter(Boolean)
        )
    ];

    const fechasLegibles = (fecha) => {
        const partes = String(fecha).split("-");
        if (partes.length !== 3) return fecha;
        const meses = [
            "ene", "feb", "mar", "abr", "may", "jun",
            "jul", "ago", "sep", "oct", "nov", "dic"
        ];
        return `${partes[2]} ${meses[Number(partes[1]) - 1]} ${partes[0]}`;
    };

    const avanzarEstado = (id) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;
                const posicion = ESTADOS_SOLICITUD.indexOf(item.estado);
                const siguiente =
                    posicion >= 0 && posicion < ESTADOS_SOLICITUD.length - 1
                        ? ESTADOS_SOLICITUD[posicion + 1]
                        : item.estado;
                return { ...item, estado: siguiente };
            })
        );
        setAviso("Estado de la solicitud actualizado.");
        setTimeout(() => setAviso(""), 2500);
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
        setAviso("Solicitud registrada correctamente.");
        setTimeout(() => setAviso(""), 2500);
    };

    const cerrar = () => {
        setCrearAbierto(false);
        setForm(formVacio);
    };

    return (
        <div className="sols">
            <div className="sols__page-header">
                <div className="sols__page-title">
                    <h1>Solicitudes</h1>
                    <p>Registra y da seguimiento a tus solicitudes de servicios.</p>
                </div>

                {puedeRegistrar && (
                    <button
                        className="sols__new-button"
                        onClick={() => setCrearAbierto(true)}
                    >
                        <Icon name="solicitudes" size={15} />
                        Registrar solicitud
                    </button>
                )}
            </div>

            {aviso && (
                <div className="sols__toast">
                    <Icon name="info" size={14} />
                    {aviso}
                </div>
            )}

            <div className="sols__summary">
                <button
                    className={
                        estado === ""
                            ? "sols__summary-card sols__summary-card--active"
                            : "sols__summary-card"
                    }
                    onClick={() => setEstado("")}
                >
                    <div className="sols__summary-icon sols__summary-icon--all">
                        <Icon name="solicitudes" size={19} />
                    </div>
                    <div>
                        <div className="sols__summary-label">Todos</div>
                        <div className="sols__summary-number">{items.length}</div>
                    </div>
                </button>

                {ESTADOS_SOLICITUD.map((estadoItem) => (
                    <button
                        key={estadoItem}
                        className={
                            estado === estadoItem
                                ? "sols__summary-card sols__summary-card--active"
                                : "sols__summary-card"
                        }
                        onClick={() => setEstado(estadoItem)}
                    >
                        <div
                            className={`sols__summary-icon sols__summary-icon--${ESTADO_CLASE[estadoItem] || "gray"}`}
                        >
                            <Icon name="solicitudes" size={19} />
                        </div>
                        <div>
                            <div className="sols__summary-label">
                                {estadoItem}
                            </div>
                            <div className="sols__summary-number">
                                {contarPorEstado(estadoItem)}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="sols__filter-card">
                <div className="sols__filters">
                    <div className="sols__filter-group sols__filter-group--search">
                        <label htmlFor="sols-search">Buscar</label>
                        <SearchBar
                            id="sols-search"
                            placeholder="Número, tipo, servicio, solicitante…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onSearch={() => setBusqueda(query)}
                            suggestions={sugerencias}
                        />
                    </div>

                    <div className="sols__filter-group">
                        <label htmlFor="sols-estado">Estado</label>
                        <select
                            id="sols-estado"
                            className="sols__filter-select"
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
                    </div>
                </div>
            </div>

            <div className="sols__list-header">
                <h2>Mis solicitudes</h2>
                <span>{encontradas.length} registros</span>
            </div>

            {encontradas.length === 0 ? (
                <div className="sols__empty">
                    No se encontraron solicitudes con los filtros aplicados.
                </div>
            ) : (
                <div className="sols__list">
                    {encontradas.map((item) => (
                        <article className="sols__item" key={item.id}>
                            <div
                                className={`sols__item-icon sols__item-icon--${SERVICIO_CLASE[item.servicio] || "blue"}`}
                            >
                                <Icon
                                    name={SERVICIO_ICONO[item.servicio] || "solicitudes"}
                                    size={20}
                                />
                            </div>

                            <div className="sols__item-body">
                                <div className="sols__item-meta">
                                    <span className="sols__item-id">
                                        {item.id}
                                    </span>
                                    <span
                                        className={`sols__item-status ${ESTADO_CLASE[item.estado] || "gray"}`}
                                    >
                                        {item.estado}
                                    </span>
                                    <span
                                        className={`sols__item-priority sols__item-priority--${PRIORIDAD_CLASE[item.prioridad] || "media"}`}
                                    >
                                        {item.prioridad || "Media"}
                                    </span>
                                </div>

                                <h3>{item.tipo}</h3>
                                <p className="sols__item-desc">
                                    {item.descripcion}
                                </p>

                                <div className="sols__item-sub">
                                    <span className="sols__item-chip">
                                        {item.servicio}
                                    </span>
                                    <span className="sols__item-sol">
                                        {item.solicitante}
                                    </span>
                                    <span className="sols__item-date">
                                        {fechasLegibles(item.fecha)}
                                    </span>
                                </div>
                            </div>

                            <div className="sols__item-actions">
                                <Link
                                    to={`/solicitudes/${item.id}`}
                                    className="sols__details-button"
                                >
                                    Ver detalle
                                </Link>

                                {puedeAvanzar && item.estado !== "Cerrada" && (
                                    <button
                                        className="sols__advance-button"
                                        onClick={() => avanzarEstado(item.id)}
                                    >
                                        Avanzar
                                    </button>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {crearAbierto && (
                <div className="sols__overlay" onClick={cerrar}>
                    <div
                        className="sols__modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sols__modal-header">
                            <div>
                                <h2>Registrar solicitud</h2>
                                <p>Completa los datos de la nueva solicitud.</p>
                            </div>
                            <button
                                className="sols__modal-close"
                                onClick={cerrar}
                            >
                                ×
                            </button>
                        </div>

                        <form className="sols__form" onSubmit={handleCrear}>
                            <div className="sols__form-grid">
                                <div className="sols__form-group">
                                    <label htmlFor="sol-tipo">Tipo de solicitud</label>
                                    <input
                                        id="sol-tipo"
                                        type="text"
                                        name="tipo"
                                        value={form.tipo}
                                        onChange={handleChange}
                                        placeholder="ej. Constancia académica"
                                    />
                                </div>

                                <div className="sols__form-group">
                                    <label htmlFor="sol-servicio">Servicio</label>
                                    <select
                                        id="sol-servicio"
                                        name="servicio"
                                        value={form.servicio}
                                        onChange={handleChange}
                                    >
                                        <option value="">Selecciona…</option>
                                        <option value="Solicitudes">Solicitudes</option>
                                        <option value="Reservas">Reservas</option>
                                        <option value="Eventos">Eventos</option>
                                        <option value="Recursos">Recursos</option>
                                        <option value="PQRS">PQRS</option>
                                    </select>
                                </div>
                            </div>

                            <div className="sols__form-grid">
                                <div className="sols__form-group">
                                    <label htmlFor="sol-prioridad">Prioridad</label>
                                    <select
                                        id="sol-prioridad"
                                        name="prioridad"
                                        value={form.prioridad}
                                        onChange={handleChange}
                                    >
                                        <option value="Baja">Baja</option>
                                        <option value="Media">Media</option>
                                        <option value="Alta">Alta</option>
                                    </select>
                                </div>
                            </div>

                            <div className="sols__form-group">
                                <label htmlFor="sol-descripcion">Descripción</label>
                                <textarea
                                    id="sol-descripcion"
                                    name="descripcion"
                                    rows="4"
                                    value={form.descripcion}
                                    onChange={handleChange}
                                    placeholder="Describe el motivo de la solicitud"
                                />
                            </div>

                            <div className="sols__modal-actions">
                                <button
                                    type="button"
                                    className="sols__cancel-button"
                                    onClick={cerrar}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="sols__confirm-button"
                                    disabled={
                                        !form.tipo ||
                                        !form.servicio ||
                                        !form.descripcion
                                    }
                                >
                                    Crear solicitud
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Solicitudes;
