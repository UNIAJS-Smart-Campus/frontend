import { useState } from "react";
import Icon from "../../components/Icon/Icon";
import SearchBar from "../../components/SearchBar/SearchBar";
import useAuth from "../../context/useAuth";
import useToast from "../../context/ToastContext";
import {
    CATEGORIAS_EVENTO,
    ESTADOS_EVENTO,
    MODALIDADES_EVENTO,
    obtenerEventos,
    guardarEventos,
    estaInscrito,
    cuposDisponibles,
    contarInscritos
} from "../../utils/eventos";
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

const MODALIDAD_CLASE = {
    Presencial: "presencial",
    Virtual: "virtual",
    "Híbrido": "hibrido"
};

const formVacio = {
    nombre: "",
    fecha: "",
    hora: "",
    lugar: "",
    categoria: "Académico",
    descripcion: "",
    cupo: 0,
    estado: "Activo",
    ponente: "",
    modalidad: "Presencial",
    participantes: []
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
    const [items, setItems] = useState(() => obtenerEventos());
    const { user, puede } = useAuth();
    const toast = useToast();
    const esAdmin = puede("publicar_eventos");

    const [query, setQuery] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [categoria, setCategoria] = useState("");
    const [estado, setEstado] = useState("");
    const [orden, setOrden] = useState("fecha");

    const [modalAbierto, setModalAbierto] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [form, setForm] = useState(formVacio);
    const [error, setError] = useState("");

    const [detalleAbierto, setDetalleAbierto] = useState(null);
    const [inscritosDe, setInscritosDe] = useState(null);
    const [aviso, setAviso] = useState("");

    const normalizar = (texto) =>
        texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const porCategoria = categoria
        ? items.filter((e) => e.categoria === categoria)
        : items;

    const porEstado = estado
        ? porCategoria.filter((e) => e.estado === estado)
        : porCategoria;

    const porBusqueda = busqueda.trim()
        ? porEstado.filter((e) =>
              [e.nombre, e.lugar, e.categoria, e.descripcion]
                  .join(" ")
                  .toLowerCase()
                  .includes(normalizar(busqueda))
          )
        : porEstado;

    const encontrados = [...porBusqueda].sort((a, b) => {
        if (orden === "fecha") {
            return (a.fecha || "").localeCompare(b.fecha || "");
        }
        if (orden === "cupo") {
            return (b.cupo - contarInscritos(b)) - (a.cupo - contarInscritos(a));
        }
        return (a.nombre || "").localeCompare(b.nombre || "");
    });

    const contarCategoria = (cat) =>
        items.filter((e) => e.categoria === cat).length;

    const sugerencias = [
        ...new Set(
            items
                .flatMap((e) => [e.nombre, e.lugar, e.categoria])
                .filter(Boolean)
        )
    ];

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
            estado: ev.estado,
            ponente: ev.ponente || "",
            modalidad: ev.modalidad || "Presencial"
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
            const nuevo = { id: Date.now(), ...form, participantes: [] };
            const nueva = [nuevo, ...items];
            setItems(nueva);
            guardarEventos(nueva);
            mostrarAviso("Evento creado correctamente.");
        } else {
            const nueva = items.map((item) => (item.id === editandoId ? { ...item, ...form } : item));
            setItems(nueva);
            guardarEventos(nueva);
            mostrarAviso("Evento actualizado correctamente.");
        }
        setModalAbierto(false);
    };

    const eliminarEvento = (ev) => {
        const nueva = items.filter((item) => item.id !== ev.id);
        setItems(nueva);
        guardarEventos(nueva);
        setDetalleAbierto(null);
        mostrarAviso(`Evento "${ev.nombre}" eliminado.`);
    };

    const cambiarEstado = (ev, nuevoEstado) => {
        const nueva = items.map((item) =>
            item.id === ev.id ? { ...item, estado: nuevoEstado } : item
        );
        setItems(nueva);
        guardarEventos(nueva);
        setDetalleAbierto({ ...ev, estado: nuevoEstado });
        mostrarAviso(`Estado del evento actualizado a "${nuevoEstado}".`);
    };

    const inscribirse = (ev) => {
        if (!user) {
            toast.warning("Inicia sesión para inscribirte.");
            return;
        }
        if (estaInscrito(ev, user.id)) {
            toast.info("Ya estás inscrito en este evento.");
            return;
        }
        if (cuposDisponibles(ev) === 0) {
            toast.error("El evento ya alcanzó su cupo máximo.");
            return;
        }
        const participante = {
            usuarioId: user.id,
            nombre: user.nombre || "Usuario",
            fecha: new Date().toISOString().slice(0, 10)
        };
        const nueva = items.map((item) =>
            item.id === ev.id
                ? { ...item, participantes: [...(item.participantes || []), participante] }
                : item
        );
        setItems(nueva);
        guardarEventos(nueva);
        setDetalleAbierto((prev) =>
            prev && prev.id === ev.id
                ? { ...prev, participantes: [...(prev.participantes || []), participante] }
                : prev
        );
        toast.success(`Te inscribiste a "${ev.nombre}".`);
    };

    const cancelarInscripcion = (ev) => {
        if (!user) return;
        if (!estaInscrito(ev, user.id)) return;
        const nueva = items.map((item) =>
            item.id === ev.id
                ? {
                    ...item,
                    participantes: (item.participantes || []).filter(
                        (p) => p.usuarioId !== user.id
                    )
                }
                : item
        );
        setItems(nueva);
        guardarEventos(nueva);
        setDetalleAbierto((prev) =>
            prev && prev.id === ev.id
                ? {
                    ...prev,
                    participantes: (prev.participantes || []).filter(
                        (p) => p.usuarioId !== user.id
                    )
                }
                : prev
        );
        toast.info("Inscripción cancelada.");
    };

    const verDetalle = (ev) => setDetalleAbierto(ev);

    const detalle = detalleAbierto
        ? items.find((item) => item.id === detalleAbierto.id) || detalleAbierto
        : null;

    return (
        <div className="page">
            <div className="page__header">
                <div className="page__title">
                    <p>Conferencias, talleres y actividades de la UAJS.</p>
                </div>

                {esAdmin && (
                    <button className="button button--accent button--md" onClick={abrirNuevo}>
                        <Icon name="eventos" size={15} />
                        Nuevo evento
                    </button>
                )}
            </div>

            {aviso && (
                <div className="toast toast--success">
                    <Icon name="info" size={14} />
                    {aviso}
                </div>
            )}

            <div className="summary">
                <button
                    className={
                        categoria === ""
                            ? "summary__card summary__card--active"
                            : "summary__card"
                    }
                    onClick={() => setCategoria("")}
                >
                    <div className="summary__icon eventos__summary-icon--all">
                        <Icon name="eventos" size={19} />
                    </div>
                    <div>
                        <div className="summary__number">{items.length}</div>
                        <div className="summary__label">Todos</div>
                    </div>
                </button>

                {CATEGORIAS_EVENTO.map((cat) => (
                    <button
                        key={cat}
                        className={
                            categoria === cat
                                ? "summary__card summary__card--active"
                                : "summary__card"
                        }
                        onClick={() => setCategoria(cat)}
                    >
                        <div className={`summary__icon eventos__summary-icon--${CATEGORIA_CLASE[cat] || "blue"}`}>
                            <Icon name="eventos" size={19} />
                        </div>
                        <div>
                            <div className="summary__number">
                                {items.filter((e) => e.categoria === cat).length}
                            </div>
                            <div className="summary__label">{cat}</div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="filters">
                <div className="filters__grid">
                    <div className="filters__group filters__group--search">
                        <label htmlFor="eventos-search">Buscar</label>
                        <SearchBar
                            id="eventos-search"
                            placeholder="Buscar evento…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onSearch={() => setBusqueda(query)}
                            suggestions={sugerencias}
                        />
                    </div>

                    <div className="filters__group">
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

                    <div className="filters__group">
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

            <div className="list-header">
                <h2>Eventos disponibles</h2>
                <span className="list-header__meta">
                    {encontrados.length} evento(s) encontrado(s)
                </span>
            </div>

            {encontrados.length === 0 ? (
                <div className="empty">
                    No se encontraron eventos con los filtros aplicados.
                </div>
            ) : (
                <div className="eventos__grid">
                    {encontrados.map((ev) => (
                        <article className="eventos__item" key={ev.id}>
                            <div className="eventos__item-top">
                                <span
                                    className={`badge badge--${CATEGORIA_CLASE[ev.categoria] || "blue"}`}
                                >
                                    {ev.categoria}
                                </span>
                                <span
                                    className={`eventos__item-state eventos__item-state--${ESTADO_CLASE[ev.estado] || "active"}`}
                                >
                                    {ev.estado}
                                </span>
                                <span
                                    className={`eventos__item-modalidad eventos__item-modalidad--${MODALIDAD_CLASE[ev.modalidad] || "presencial"}`}
                                >
                                    {ev.modalidad}
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
                                {ev.ponente && (
                                    <span className="eventos__meta-line">
                                        <Icon name="perfil" size={12} />
                                        {ev.ponente}
                                    </span>
                                )}
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

                                <div className="eventos__item-actions">
                                    {!esAdmin && (
                                        <button
                                            className={
                                                estaInscrito(ev, user?.id)
                                                    ? "eventos__inscribir-button eventos__inscribir-button--done"
                                                    : "eventos__inscribir-button"
                                            }
                                            onClick={() =>
                                                estaInscrito(ev, user?.id)
                                                    ? cancelarInscripcion(ev)
                                                    : inscribirse(ev)
                                            }
                                            disabled={
                                                ev.estado !== "Activo" ||
                                                cuposDisponibles(ev) === 0
                                            }
                                        >
                                            {ev.estado !== "Activo"
                                                ? "No disponible"
                                                : cuposDisponibles(ev) === 0 && !estaInscrito(ev, user?.id)
                                                    ? "Cupo agotado"
                                                    : estaInscrito(ev, user?.id)
                                                        ? "Inscrito ✓ · Cancelar"
                                                        : "Inscribirme"}
                                        </button>
                                    )}

                                    <button
                                        className="eventos__view-button"
                                        onClick={() => verDetalle(ev)}
                                    >
                                        Ver
                                    </button>
                                </div>
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
                                    <label htmlFor="ev-ponente">Ponente / organizador</label>
                                    <input
                                        id="ev-ponente"
                                        type="text"
                                        name="ponente"
                                        value={form.ponente}
                                        onChange={handleChange}
                                        placeholder="ej. Dra. Carolina Ruiz"
                                    />
                                </div>

                                <div className="eventos__form-group">
                                    <label htmlFor="ev-modalidad">Modalidad</label>
                                    <select
                                        id="ev-modalidad"
                                        name="modalidad"
                                        value={form.modalidad}
                                        onChange={handleChange}
                                    >
                                        {MODALIDADES_EVENTO.map((mod) => (
                                            <option key={mod} value={mod}>
                                                {mod}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
                                    className={`badge badge--${CATEGORIA_CLASE[detalle.categoria] || "blue"}`}
                                >
                                    {detalle.categoria}
                                </span>
                                <span
                                    className={`eventos__item-state eventos__item-state--${ESTADO_CLASE[detalle.estado] || "active"}`}
                                >
                                    {detalle.estado}
                                </span>
                                <span
                                    className={`eventos__item-modalidad eventos__item-modalidad--${MODALIDAD_CLASE[detalle.modalidad] || "presencial"}`}
                                >
                                    {detalle.modalidad}
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
                            <div className="eventos__detail-item">
                                <Icon name="perfil" size={14} />
                                <span>{detalle.ponente || "Por definir"}</span>
                            </div>
                        </div>

                        <div
                            className={`eventos__cupo-bar ${cuposDisponibles(detalle) === 0 ? "eventos__cupo-bar--full" : ""}`}
                        >
                            <span>
                                {contarInscritos(detalle)} / {detalle.cupo} inscritos
                            </span>
                            <div className="eventos__cupo-track">
                                <div
                                    className="eventos__cupo-fill"
                                    style={{
                                        width: `${detalle.cupo ? Math.min(100, (contarInscritos(detalle) / detalle.cupo) * 100) : 0}%`
                                    }}
                                />
                            </div>
                        </div>

                        {esAdmin ? (
                            <div className="eventos__admin-actions">
                                <button
                                    className="eventos__admin-btn"
                                    onClick={() => {
                                        setInscritosDe(detalle);
                                        setDetalleAbierto(null);
                                    }}
                                >
                                    Ver inscritos ({contarInscritos(detalle)})
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
                            <div className="eventos__subscribe-actions">
                                <button
                                    className={
                                        estaInscrito(detalle, user?.id)
                                            ? "eventos__subscribe-button eventos__subscribe-button--done"
                                            : "eventos__subscribe-button"
                                    }
                                    onClick={() =>
                                        estaInscrito(detalle, user?.id)
                                            ? cancelarInscripcion(detalle)
                                            : inscribirse(detalle)
                                    }
                                    disabled={
                                        detalle.estado !== "Activo" ||
                                        (cuposDisponibles(detalle) === 0 && !estaInscrito(detalle, user?.id))
                                    }
                                >
                                    {detalle.estado !== "Activo"
                                        ? `No disponible (${detalle.estado})`
                                        : estaInscrito(detalle, user?.id)
                                            ? "Inscrito ✓ · Cancelar inscripción"
                                            : cuposDisponibles(detalle) === 0
                                                ? "Cupo agotado"
                                                : "Inscribirme"}
                                </button>
                                {estaInscrito(detalle, user?.id) && (
                                    <span className="eventos__inscrito-badge">
                                        Tu inscripción está confirmada.
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {inscritosDe && (
                <div
                    className="eventos__overlay"
                    onClick={() => setInscritosDe(null)}
                >
                    <div
                        className="eventos__modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="eventos__modal-header">
                            <div>
                                <h2>Inscritos</h2>
                                <p>
                                    {items.find((i) => i.id === inscritosDe.id)?.nombre ||
                                        ""}
                                </p>
                            </div>
                            <button
                                className="eventos__modal-close"
                                onClick={() => setInscritosDe(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="eventos__inscritos">
                            {(() => {
                                const detalle = items.find(
                                    (i) => i.id === inscritosDe.id
                                );
                                const lista = Array.isArray(detalle?.participantes)
                                    ? detalle.participantes
                                    : [];
                                if (lista.length === 0) {
                                    return (
                                        <p className="eventos__empty">
                                            Aún no hay inscritos en este evento.
                                        </p>
                                    );
                                }
                                return (
                                    <ul className="eventos__inscritos-list">
                                        {lista.map((p, i) => (
                                            <li
                                                className="eventos__inscrito"
                                                key={`${p.usuarioId || "anon"}-${i}`}
                                            >
                                                <span className="eventos__inscrito-avatar">
                                                    {(p.nombre || "U")
                                                        .split(" ")
                                                        .map((s) => s[0])
                                                        .join("")
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </span>
                                                <span className="eventos__inscrito-name">
                                                    {p.nombre || "Inscrito"}
                                                </span>
                                                <span className="eventos__inscrito-fecha">
                                                    {p.fecha || ""}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Eventos;
