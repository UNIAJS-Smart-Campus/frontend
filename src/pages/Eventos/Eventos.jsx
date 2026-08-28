import { useState } from "react";
import Icon from "../../components/Icon/Icon";
import useAuth from "../../context/useAuth";
import eventos, { CATEGORIAS_EVENTO, ESTADOS_EVENTO } from "../../utils/eventos";
import "./Eventos.css";

const CATEGORIA_CLASE = {
    Académico: "blue",
    Cultural: "orange",
    Formación: "green",
    Institucional: "purple"
};

const ESTADO_CLASE = {
    Activo: "active",
    Finalizado: "done",
    Cancelado: "canceled"
};

const formVacio = {
    nombre: "",
    fecha: "",
    hora: "",
    lugar: "",
    categoria: "Académico",
    descripcion: "",
    cupo: 0,
    estado: "Activo"
};

function formatearFecha(iso) {
    if (!iso) return "";
    const fecha = new Date(iso + "T00:00:00");
    if (Number.isNaN(fecha.getTime())) return iso;
    return fecha.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatearHora(hora) {
    if (!hora) return "";
    const partes = hora.split(":");
    if (partes.length < 2) return hora;
    let h = Number(partes[0]);
    const min = partes[1];
    const sufijo = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${min} ${sufijo}`;
}

function Eventos() {
    const { user } = useAuth();
    const esAdmin = user?.rol === "Administrador";

    const [items, setItems] = useState(eventos);
    const [query, setQuery] = useState("");
    const [categoria, setCategoria] = useState("");
    const [estado, setEstado] = useState("");
    const [orden, setOrden] = useState("fecha");

    const [modalAbierto, setModalAbierto] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [form, setForm] = useState(formVacio);
    const [error, setError] = useState("");

    const [detalleAbierto, setDetalleAbierto] = useState(null);
    const [verInscritosAbierto, setVerInscritosAbierto] = useState(false);
    const [aviso, setAviso] = useState("");

    const normalizar = (texto) =>
        texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const porCategoria = categoria
        ? items.filter((e) => e.categoria === categoria)
        : items;

    const porEstado = estado
        ? porCategoria.filter((e) => e.estado === estado)
        : porCategoria;

    const porBusqueda = query.trim()
        ? porEstado.filter((e) =>
              [e.nombre, e.lugar, e.categoria, e.descripcion]
                  .join(" ")
                  .toLowerCase()
                  .includes(normalizar(query))
          )
        : porEstado;

    const encontrados = [...porBusqueda].sort((a, b) => {
        if (orden === "fecha") {
            return (a.fecha || "").localeCompare(b.fecha || "");
        }
        if (orden === "cupo") {
            return (b.cupo - b.inscritos) - (a.cupo - a.inscritos);
        }
        return (a.nombre || "").localeCompare(b.nombre || "");
    });

    const contarCategoria = (cat) =>
        items.filter((e) => e.categoria === cat).length;

    const mostrarAviso = (mensaje) => {
        setAviso(mensaje);
        setTimeout(() => setAviso(""), 2600);
    };

    const abrirNuevo = () => {
        setEditandoId(null);
        setForm(formVacio);
        setError("");
        setModalAbierto(true);
    };

    const abrirEditar = (ev) => {
        setEditandoId(ev.id);
        setForm({
            nombre: ev.nombre,
            fecha: ev.fecha,
            hora: ev.hora,
            lugar: ev.lugar,
            categoria: ev.categoria,
            descripcion: ev.descripcion,
            cupo: ev.cupo,
            estado: ev.estado
        });
        setError("");
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setError("");
    };

    const handleChange = (e) => {
        const value = e.target.name === "cupo" ? Number(e.target.value) : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const nombreExiste = items.some(
            (item) =>
                item.nombre.toLowerCase() === form.nombre.trim().toLowerCase() &&
                item.id !== editandoId
        );

        if (nombreExiste) {
            setError("Ya existe un evento con ese nombre.");
            return;
        }

        if (editandoId === null) {
            const nuevo = { id: Date.now(), ...form, inscritos: 0 };
            setItems([nuevo, ...items]);
            mostrarAviso("Evento creado correctamente.");
        } else {
            setItems(
                items.map((item) =>
                    item.id === editandoId ? { ...item, ...form } : item
                )
            );
            mostrarAviso("Evento actualizado correctamente.");
        }

        setModalAbierto(false);
    };

    const eliminarEvento = (ev) => {
        setItems(items.filter((item) => item.id !== ev.id));
        setDetalleAbierto(null);
        mostrarAviso(`Evento "${ev.nombre}" eliminado.`);
    };

    const cambiarEstado = (ev, nuevoEstado) => {
        setItems(
            items.map((item) =>
                item.id === ev.id ? { ...item, estado: nuevoEstado } : item
            )
        );
        setDetalleAbierto({ ...ev, estado: nuevoEstado });
        mostrarAviso(`Estado del evento actualizado a "${nuevoEstado}".`);
    };

    const inscribirse = (ev) => {
        if (ev.inscritos >= ev.cupo) {
            mostrarAviso("El evento ya alcanzó su cupo máximo.");
            return;
        }
        setItems(
            items.map((item) =>
                item.id === ev.id
                    ? { ...item, inscritos: item.inscritos + 1 }
                    : item
            )
        );
        setDetalleAbierto({ ...ev, inscritos: ev.inscritos + 1 });
        mostrarAviso("Te has inscrito al evento.");
    };

    const cuposDisponibles = (ev) => {
        const libres = (ev.cupo || 0) - (ev.inscritos || 0);
        return Math.max(0, libres);
    };

    const verDetalle = (ev) => setDetalleAbierto(ev);

    const detalle = detalleAbierto
        ? items.find((item) => item.id === detalleAbierto.id) || detalleAbierto
        : null;

    return (
        <div className="eventos">
            <div className="eventos__page-header">
                <div className="eventos__page-title">
                    <h1>Eventos</h1>
                    <p>Conferencias, talleres y actividades de la UAJS.</p>
                </div>

                {esAdmin && (
                    <button className="eventos__new-button" onClick={abrirNuevo}>
                        <Icon name="eventos" size={15} />
                        Nuevo evento
                    </button>
                )}
            </div>

            {aviso && (
                <div className="eventos__toast">
                    <Icon name="info" size={14} />
                    {aviso}
                </div>
            )}

            <div className="eventos__summary">
                <button
                    className={
                        categoria === ""
                            ? "eventos__summary-card eventos__summary-card--active"
                            : "eventos__summary-card"
                    }
                    onClick={() => setCategoria("")}
                >
                    <div className="eventos__summary-icon eventos__summary-icon--all">
                        <Icon name="eventos" size={19} />
                    </div>
                    <div>
                        <div className="eventos__summary-label">Todos</div>
                        <div className="eventos__summary-number">{items.length}</div>
                    </div>
                </button>

                {CATEGORIAS_EVENTO.map((cat) => (
                    <button
                        key={cat}
                        className={
                            categoria === cat
                                ? "eventos__summary-card eventos__summary-card--active"
                                : "eventos__summary-card"
                        }
                        onClick={() =>
                            setCategoria(categoria === cat ? "" : cat)
                        }
                    >
                        <div
                            className={`eventos__summary-icon eventos__summary-icon--${CATEGORIA_CLASE[cat] || "blue"}`}
                        >
                            <Icon name="eventos" size={19} />
                        </div>
                        <div>
                            <div className="eventos__summary-label">{cat}</div>
                            <div className="eventos__summary-number">
                                {contarCategoria(cat)}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="eventos__filter-card">
                <div className="eventos__filters">
                    <div className="eventos__filter-group eventos__filter-group--search">
                        <label htmlFor="eventos-search">Buscar</label>
                        <input
                            id="eventos-search"
                            type="text"
                            placeholder="Buscar evento…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="eventos__filter-input"
                        />
                    </div>

                    <div className="eventos__filter-group">
                        <label htmlFor="eventos-categoria">Categoría</label>
                        <select
                            id="eventos-categoria"
                            className="eventos__filter-select"
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                        >
                            <option value="">Todas</option>
                            {CATEGORIAS_EVENTO.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="eventos__filter-group">
                        <label htmlFor="eventos-estado">Estado</label>
                        <select
                            id="eventos-estado"
                            className="eventos__filter-select"
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                        >
                            <option value="">Todos</option>
                            {ESTADOS_EVENTO.map((est) => (
                                <option key={est} value={est}>
                                    {est}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="eventos__filter-group">
                        <label htmlFor="eventos-orden">Ordenar por</label>
                        <select
                            id="eventos-orden"
                            className="eventos__filter-select"
                            value={orden}
                            onChange={(e) => setOrden(e.target.value)}
                        >
                            <option value="fecha">Fecha</option>
                            <option value="cupo">Cupos disponibles</option>
                            <option value="nombre">Nombre</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="eventos__list-header">
                <h2>Actividades programadas</h2>
                <span>{encontrados.length} eventos</span>
            </div>

            {encontrados.length === 0 ? (
                <div className="eventos__empty">
                    No se encontraron eventos con los filtros aplicados.
                </div>
            ) : (
                <div className="eventos__grid">
                    {encontrados.map((ev) => (
                        <article className="eventos__item" key={ev.id}>
                            <div className="eventos__item-top">
                                <span
                                    className={`eventos__item-badge ${CATEGORIA_CLASE[ev.categoria] || "blue"}`}
                                >
                                    {ev.categoria}
                                </span>
                                <span
                                    className={`eventos__item-state eventos__item-state--${ESTADO_CLASE[ev.estado] || "active"}`}
                                >
                                    {ev.estado}
                                </span>
                            </div>

                            <h3 className="eventos__item-title">{ev.nombre}</h3>
                            <p className="eventos__item-desc">{ev.descripcion}</p>

                            <div className="eventos__item-meta">
                                <span className="eventos__meta-line">
                                    <Icon name="eventos" size={12} />
                                    {formatearFecha(ev.fecha)}
                                </span>
                                <span className="eventos__meta-line">
                                    <Icon name="info" size={12} />
                                    {formatearHora(ev.hora)}
                                </span>
                                <span className="eventos__meta-line">
                                    <Icon name="recursos" size={12} />
                                    {ev.lugar}
                                </span>
                            </div>

                            <div className="eventos__item-footer">
                                <div className="eventos__cupos">
                                    <span
                                        className={
                                            cuposDisponibles(ev) === 0
                                                ? "eventos__cupos-num eventos__cupos-num--full"
                                                : "eventos__cupos-num"
                                        }
                                    >
                                        {cuposDisponibles(ev)}
                                    </span>
                                    <span className="eventos__cupos-label">
                                        cupos libres de {ev.cupo || 0}
                                    </span>
                                </div>

                                <button
                                    className="eventos__view-button"
                                    onClick={() => verDetalle(ev)}
                                >
                                    Ver
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {modalAbierto && (
                <div className="eventos__overlay" onClick={cerrarModal}>
                    <div
                        className="eventos__modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="eventos__modal-header">
                            <div>
                                <h2>
                                    {editandoId === null
                                        ? "Nuevo evento"
                                        : "Editar evento"}
                                </h2>
                                <p>Completa los datos del evento.</p>
                            </div>
                            <button
                                className="eventos__modal-close"
                                onClick={cerrarModal}
                            >
                                ×
                            </button>
                        </div>

                        <form className="eventos__form" onSubmit={handleSubmit}>
                            {error && <p className="eventos__error">{error}</p>}

                            <div className="eventos__form-group">
                                <label htmlFor="ev-nombre">Nombre del evento</label>
                                <input
                                    id="ev-nombre"
                                    type="text"
                                    name="nombre"
                                    value={form.nombre}
                                    onChange={handleChange}
                                    placeholder="ej. Conferencia de inteligencia artificial"
                                />
                            </div>

                            <div className="eventos__form-grid">
                                <div className="eventos__form-group">
                                    <label htmlFor="ev-fecha">Fecha</label>
                                    <input
                                        id="ev-fecha"
                                        type="date"
                                        name="fecha"
                                        value={form.fecha}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="eventos__form-group">
                                    <label htmlFor="ev-hora">Hora</label>
                                    <input
                                        id="ev-hora"
                                        type="time"
                                        name="hora"
                                        value={form.hora}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="eventos__form-group">
                                <label htmlFor="ev-lugar">Lugar</label>
                                <input
                                    id="ev-lugar"
                                    type="text"
                                    name="lugar"
                                    value={form.lugar}
                                    onChange={handleChange}
                                    placeholder="ej. Auditorio principal"
                                />
                            </div>

                            <div className="eventos__form-grid">
                                <div className="eventos__form-group">
                                    <label htmlFor="ev-categoria">Categoría</label>
                                    <select
                                        id="ev-categoria"
                                        name="categoria"
                                        value={form.categoria}
                                        onChange={handleChange}
                                    >
                                        {CATEGORIAS_EVENTO.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="eventos__form-group">
                                    <label htmlFor="ev-estado">Estado</label>
                                    <select
                                        id="ev-estado"
                                        name="estado"
                                        value={form.estado}
                                        onChange={handleChange}
                                    >
                                        {ESTADOS_EVENTO.map((est) => (
                                            <option key={est} value={est}>
                                                {est}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="eventos__form-grid">
                                <div className="eventos__form-group">
                                    <label htmlFor="ev-cupo">Cupo máximo</label>
                                    <input
                                        id="ev-cupo"
                                        type="number"
                                        min="1"
                                        name="cupo"
                                        value={form.cupo}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="eventos__form-group">
                                <label htmlFor="ev-desc">Descripción</label>
                                <textarea
                                    id="ev-desc"
                                    name="descripcion"
                                    value={form.descripcion}
                                    onChange={handleChange}
                                    placeholder="Describe la actividad"
                                    rows="3"
                                />
                            </div>

                            <div className="eventos__modal-actions">
                                <button
                                    type="button"
                                    className="eventos__cancel-button"
                                    onClick={cerrarModal}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="eventos__confirm-button"
                                    disabled={
                                        !form.nombre ||
                                        !form.fecha ||
                                        !form.hora ||
                                        !form.lugar ||
                                        !form.cupo
                                    }
                                >
                                    {editandoId === null
                                        ? "Crear evento"
                                        : "Guardar cambios"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {detalle && (
                <div
                    className="eventos__overlay"
                    onClick={() => setDetalleAbierto(null)}
                >
                    <div
                        className="eventos__detail"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="eventos__detail-header">
                            <div className="eventos__detail-title">
                                <span
                                    className={`eventos__item-badge ${CATEGORIA_CLASE[detalle.categoria] || "blue"}`}
                                >
                                    {detalle.categoria}
                                </span>
                                <span
                                    className={`eventos__item-state eventos__item-state--${ESTADO_CLASE[detalle.estado] || "active"}`}
                                >
                                    {detalle.estado}
                                </span>
                            </div>
                            <button
                                className="eventos__modal-close"
                                onClick={() => setDetalleAbierto(null)}
                            >
                                ×
                            </button>
                        </div>

                        <h2 className="eventos__detail-name">{detalle.nombre}</h2>
                        <p className="eventos__detail-desc">{detalle.descripcion}</p>

                        <div className="eventos__detail-meta">
                            <div className="eventos__detail-item">
                                <Icon name="eventos" size={14} />
                                <span>{formatearFecha(detalle.fecha)}</span>
                            </div>
                            <div className="eventos__detail-item">
                                <Icon name="info" size={14} />
                                <span>{formatearHora(detalle.hora)}</span>
                            </div>
                            <div className="eventos__detail-item">
                                <Icon name="recursos" size={14} />
                                <span>{detalle.lugar}</span>
                            </div>
                        </div>

                        <div
                            className={`eventos__cupo-bar ${cuposDisponibles(detalle) === 0 ? "eventos__cupo-bar--full" : ""}`}
                        >
                            <span>
                                {detalle.inscritos} / {detalle.cupo} inscritos
                            </span>
                            <div className="eventos__cupo-track">
                                <div
                                    className="eventos__cupo-fill"
                                    style={{
                                        width: `${detalle.cupo ? Math.min(100, (detalle.inscritos / detalle.cupo) * 100) : 0}%`
                                    }}
                                />
                            </div>
                        </div>

                        {esAdmin ? (
                            <div className="eventos__admin-actions">
                                <button
                                    className="eventos__admin-btn"
                                    onClick={() => {
                                        setVerInscritosAbierto(true);
                                        setDetalleAbierto(null);
                                    }}
                                    disabled={!detalle.inscritos}
                                >
                                    Ver inscritos ({detalle.inscritos})
                                </button>
                                <button
                                    className="eventos__admin-btn"
                                    onClick={() => {
                                        setDetalleAbierto(null);
                                        abrirEditar(detalle);
                                    }}
                                >
                                    Editar
                                </button>
                                <button
                                    className="eventos__admin-btn eventos__admin-btn--danger"
                                    onClick={() => eliminarEvento(detalle)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        ) : (
                            <button
                                className="eventos__subscribe-button"
                                onClick={() => inscribirse(detalle)}
                                disabled={
                                    detalle.estado !== "Activo" ||
                                    cuposDisponibles(detalle) === 0
                                }
                            >
                                {detalle.estado !== "Activo"
                                    ? `No disponible (${detalle.estado})`
                                    : cuposDisponibles(detalle) === 0
                                      ? "Cupo agotado"
                                      : "Inscribirme"}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {verInscritosAbierto && (
                <div
                    className="eventos__overlay"
                    onClick={() => setVerInscritosAbierto(false)}
                >
                    <div
                        className="eventos__modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="eventos__modal-header">
                            <div>
                                <h2>Inscritos</h2>
                                <p>
                                    {detalleAbierto
                                        ? items.find((i) => i.id === detalleAbierto.id)?.nombre ||
                                          ""
                                        : ""}
                                </p>
                            </div>
                            <button
                                className="eventos__modal-close"
                                onClick={() => setVerInscritosAbierto(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="eventos__inscritos">
                            {detalleAbierto &&
                            (items.find((i) => i.id === detalleAbierto.id)
                                ?.inscritos || 0) > 0 ? (
                                <ul className="eventos__inscritos-list">
                                    {Array.from({
                                        length: items.find(
                                            (i) => i.id === detalleAbierto.id
                                        ).inscritos
                                    }).map((_, i) => (
                                        <li
                                            className="eventos__inscrito"
                                            key={i}
                                        >
                                            <span className="eventos__inscrito-avatar">
                                                S{i + 1}
                                            </span>
                                            <span className="eventos__inscrito-name">
                                                Estudiante {i + 1}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="eventos__empty">
                                    Aún no hay inscritos en este evento.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Eventos;
