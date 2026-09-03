import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../context/useAuth";
import Icon from "../../components/Icon/Icon";
import SearchBar from "../../components/SearchBar/SearchBar";
import Pagination from "../../components/Pagination/Pagination";
import Modal from "../../components/Modal/Modal";
import {
    ESTADOS_SOLICITUD,
    ETIQUETA_ESTADO,
    ESTADO_COLOR,
    ESTADOS_FINALES,
    ACCIONES_POR_ESTADO,
    ORDEN_ESTADOS,
    obtenerSolicitudes,
    crearSolicitud,
    ejecutarAccion,
    progresoDe
} from "../../utils/solicitudes";
import { obtenerUsuarios } from "../../utils/users";
import usePagination from "../../hooks/usePagination";
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

const PRIORIDAD_CLASE = {
    Alta: "alta",
    Media: "media",
    Baja: "baja"
};

const PRIORIDAD_SUMMARY_CLASE = {
    Alta: "red",
    Media: "yellow",
    Baja: "green"
};

const PRIORIDADES = ["Alta", "Media", "Baja"];

const formVacio = {
    tipo: "",
    servicio: "",
    descripcion: "",
    prioridad: "Media"
};

function Solicitudes() {
    const [items, setItems] = useState(() => obtenerSolicitudes());
    const [query, setQuery] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [estado, setEstado] = useState("");
    const [prioridad, setPrioridad] = useState("");
    const [crearAbierto, setCrearAbierto] = useState(false);
    const [rechazarAbierto, setRechazarAbierto] = useState(false);
    const [notaAbierto, setNotaAbierto] = useState(false);
    const [asignarAbierto, setAsignarAbierto] = useState(false);
    const [confirmarAbierto, setConfirmarAbierto] = useState(false);
    const [pausarAbierto, setPausarAbierto] = useState(false);
    const [reabrirAbierto, setReabrirAbierto] = useState(false);
    const [rechazarConfirmarAbierto, setRechazarConfirmarAbierto] = useState(false);
    const [accionPendiente, setAccionPendiente] = useState(null); // { item, accion }
    const [seleccionada, setSeleccionada] = useState(null);
    const [seleccionadoId, setSeleccionadoId] = useState(null);
    const [form, setForm] = useState(formVacio);
    const [formErrores, setFormErrores] = useState({});
    const [nota, setNota] = useState("");
    const [motivoPausa, setMotivoPausa] = useState("");
    const [motivoReabrir, setMotivoReabrir] = useState("");
    const [responsableSeleccionado, setResponsableSeleccionado] = useState(null);
    const [aviso, setAviso] = useState("");

    const { user, puede } = useAuth();
    const puedeGestionar = puede("actualizar_estados") || puede("gestionar_solicitudes");
    const puedeRegistrar = puede("registrar_solicitudes");

    const responsables = useMemo(
        () =>
            obtenerUsuarios()
                .filter(
                    (u) =>
                        (u.rol === "Administrador" || u.rol === "Administrativo") &&
                        u.estado === "Activo"
                )
                .map((u) => ({ id: u.id, nombre: u.nombre })),
        []
    );

    const encontradas = useMemo(() => {
        let result = items;
        if (estado) result = result.filter((item) => item.estado === estado);
        if (prioridad) result = result.filter((item) => item.prioridad === prioridad);
        if (busqueda.trim()) {
            const q = busqueda.trim().toLowerCase();
            result = result.filter(
                (item) =>
                    String(item.id).toLowerCase().includes(q) ||
                    String(item.tipo).toLowerCase().includes(q) ||
                    String(item.servicio).toLowerCase().includes(q) ||
                    String(item.descripcion).toLowerCase().includes(q) ||
                    String(item.usuario?.nombre || "")
                        .toLowerCase()
                        .includes(q) ||
                    String(item.estado).toLowerCase().includes(q)
            );
        }
        return result;
    }, [items, estado, prioridad, busqueda]);

    const { pagina, setPagina, totalPaginas, itemsPagina, desde, hasta } =
        usePagination(encontradas, 6);

    const sugerencias = useMemo(() => {
        return [
            ...new Set(
                items
                    .flatMap((item) => [
                        String(item.id),
                        item.tipo,
                        item.servicio,
                        item.usuario?.nombre
                    ])
                    .filter(Boolean)
            )
        ];
    }, [items]);

    const fechasLegibles = (fecha) => {
        const partes = String(fecha).split("-");
        if (partes.length !== 3) return fecha;
        const meses = [
            "ene", "feb", "mar", "abr", "may", "jun",
            "jul", "ago", "sep", "oct", "nov", "dic"
        ];
        return `${partes[2]} ${meses[Number(partes[1]) - 1]} ${partes[0]}`;
    };

    const mostrarAviso = (texto) => {
        setAviso(texto);
        setTimeout(() => setAviso(""), 2500);
    };

    const cambiarEstado = (nuevoEstado) => {
        setEstado(nuevoEstado);
        setQuery("");
        setBusqueda("");
    };

    const cambiarPrioridad = (nuevaPrioridad) => {
        setPrioridad(nuevaPrioridad);
        setQuery("");
        setBusqueda("");
    };

    const actualizarItem = (actualizada) => {
        setItems((prev) =>
            prev.map((i) => (i.id === actualizada.id ? actualizada : i))
        );
    };

    const accionSimple = (id, accion, datos = {}) => {
        if (!puedeGestionar) {
            mostrarAviso("No tienes permiso para realizar esta acción.");
            return;
        }
        const act = ejecutarAccion(id, accion, {
            usuario: user?.nombre || "Administrador",
            ...datos
        });
        if (act) {
            actualizarItem(act);
            mostrarAviso("Acción ejecutada correctamente.");
        }
    };

    const abrirRechazar = (item) => {
        setSeleccionada(item);
        setSeleccionadoId(item.id);
        setNota("");
        setRechazarAbierto(true);
    };

    const handleRechazarSubmit = (e) => {
        e.preventDefault();
        if (!seleccionadoId || !nota.trim()) return;
        // Si es prioridad Alta, pedir confirmación adicional
        if (seleccionada?.prioridad === "Alta") {
            setRechazarAbierto(false);
            setRechazarConfirmarAbierto(true);
        } else {
            ejecutarRechazo();
        }
    };

    const ejecutarRechazo = () => {
        accionSimple(seleccionadoId, "rechazar", { descripcion: nota.trim() });
        setRechazarConfirmarAbierto(false);
        cerrarRechazar();
    };

    const abrirNota = (item) => {
        setSeleccionada(item);
        setSeleccionadoId(item.id);
        setNota("");
        setNotaAbierto(true);
    };

    const abrirAsignar = (item) => {
        setSeleccionada(item);
        setSeleccionadoId(item.id);
        setResponsableSeleccionado(null);
        setAsignarAbierto(true);
    };

    const handleAgregarNota = (e) => {
        e.preventDefault();
        if (!seleccionadoId || !nota.trim()) return;
        accionSimple(seleccionadoId, "nota", { descripcion: nota.trim() });
        cerrarNota();
    };

    const handleAsignar = (e) => {
        e.preventDefault();
        if (!seleccionadoId || !responsableSeleccionado) return;
        accionSimple(seleccionadoId, "asignar", {
            responsable: responsableSeleccionado
        });
        cerrarAsignar();
    };

    const cerrarRechazar = () => {
        setRechazarAbierto(false);
        setSeleccionada(null);
        setSeleccionadoId(null);
        setNota("");
    };

    const cerrarNota = () => {
        setNotaAbierto(false);
        setSeleccionada(null);
        setSeleccionadoId(null);
        setNota("");
    };

    const cerrarAsignar = () => {
        setAsignarAbierto(false);
        setSeleccionada(null);
        setSeleccionadoId(null);
        setResponsableSeleccionado(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        // Limpiar error del campo al escribir
        if (formErrores[name]) {
            setFormErrores((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validarForm = () => {
        const errores = {};
        if (!form.tipo.trim()) {
            errores.tipo = "El tipo es obligatorio.";
        } else if (form.tipo.trim().length < 10) {
            errores.tipo = `Mínimo 10 caracteres (faltan ${10 - form.tipo.trim().length}).`;
        }
        if (!form.servicio) {
            errores.servicio = "Selecciona un servicio.";
        }
        if (!form.descripcion.trim()) {
            errores.descripcion = "La descripción es obligatoria.";
        } else if (form.descripcion.trim().length < 20) {
            errores.descripcion = `Mínimo 20 caracteres (faltan ${20 - form.descripcion.trim().length}).`;
        }
        return errores;
    };

    const handleCrear = (e) => {
        e.preventDefault();
        const errores = validarForm();
        if (Object.keys(errores).length > 0) {
            setFormErrores(errores);
            return;
        }
        const nueva = crearSolicitud(form, user?.nombre ?? "Usuario");
        setItems((prev) => [nueva, ...prev]);
        setCrearAbierto(false);
        setForm(formVacio);
        setFormErrores({});
        mostrarAviso("Solicitud registrada correctamente.");
    };

    const cerrar = () => {
        setCrearAbierto(false);
        setForm(formVacio);
        setFormErrores({});
    };

    const ACTION_LABELS = {
        revisar: "Revisar",
        asignar: "Asignar",
        proceso: "Iniciar proceso",
        resolver: "Resolver",
        cerrar: "Cerrar",
        pausar: "Pausar",
        reanudar: "Reanudar",
        rechazar: "Rechazar",
        reabrir: "Reabrir"
    };

    const handleAccion = (item, accion) => {
        if (accion === "asignar") {
            abrirAsignar(item);
        } else if (accion === "rechazar") {
            abrirRechazar(item);
        } else if (accion === "pausar") {
            setSeleccionada(item);
            setSeleccionadoId(item.id);
            setMotivoPausa("");
            setPausarAbierto(true);
        } else if (accion === "reabrir") {
            setSeleccionada(item);
            setSeleccionadoId(item.id);
            setMotivoReabrir("");
            setReabrirAbierto(true);
        } else if (accion === "cerrar" || accion === "resolver") {
            setAccionPendiente({ item, accion });
            setConfirmarAbierto(true);
        } else {
            accionSimple(item.id, accion);
        }
    };

    const handleConfirmar = () => {
        if (!accionPendiente) return;
        accionSimple(accionPendiente.item.id, accionPendiente.accion);
        setConfirmarAbierto(false);
        setAccionPendiente(null);
    };

    const handlePausar = (e) => {
        e.preventDefault();
        if (!seleccionadoId || !motivoPausa.trim()) return;
        accionSimple(seleccionadoId, "pausar", { descripcion: motivoPausa.trim() });
        setPausarAbierto(false);
        setSeleccionada(null);
        setSeleccionadoId(null);
        setMotivoPausa("");
    };

    const handleReabrir = (e) => {
        e.preventDefault();
        if (!seleccionadoId || !motivoReabrir.trim()) return;
        accionSimple(seleccionadoId, "reabrir", { descripcion: motivoReabrir.trim() });
        setReabrirAbierto(false);
        setSeleccionada(null);
        setSeleccionadoId(null);
        setMotivoReabrir("");
    };

    return (
        <div className="page">
            <div className="page__header">
                <div className="page__title">
                    <p>
                        Registra y da seguimiento a tus solicitudes de servicios.
                    </p>
                </div>

                {puedeRegistrar && (
                    <button
                        className="button button--accent button--md"
                        onClick={() => setCrearAbierto(true)}
                    >
                        <Icon name="solicitudes" size={15} />
                        Registrar solicitud
                    </button>
                )}
            </div>

            {aviso && (
                <div className="toast toast--success">
                    <Icon name="info" size={14} />
                    {aviso}
                </div>
            )}

            {/* ── SUMMARY ── */}
            <div className="summary">
                <button
                    className={
                        estado === "" && prioridad === ""
                            ? "summary__card summary__card--active"
                            : "summary__card"
                    }
                    onClick={() => {
                        cambiarEstado("");
                        cambiarPrioridad("");
                    }}
                >
                    <div className="summary__icon sols__summary-icon--all">
                        <Icon name="solicitudes" size={19} />
                    </div>
                    <div>
                        <div className="summary__number">{items.length}</div>
                        <div className="summary__label">Todos</div>
                    </div>
                </button>

                {ESTADOS_SOLICITUD.map((estadoItem) => (
                    <button
                        key={estadoItem}
                        className={
                            estado === estadoItem
                                ? "summary__card summary__card--active"
                                : "summary__card"
                        }
                        onClick={() => {
                            cambiarEstado(
                                estado === estadoItem ? "" : estadoItem
                            );
                            setPrioridad("");
                        }}
                    >
                        <div
                            className={`summary__icon sols__summary-icon--${ESTADO_COLOR[estadoItem] || "gray"}`}
                        >
                            <Icon name="solicitudes" size={19} />
                        </div>
                        <div>
                            <div className="summary__number">
                                {items.filter((i) => i.estado === estadoItem)
                                    .length}
                            </div>
                            <div className="summary__label">
                                {ETIQUETA_ESTADO[estadoItem]}
                            </div>
                        </div>
                    </button>
                ))}

                {PRIORIDADES.map((p) => (
                    <button
                        key={p}
                        className={
                            prioridad === p
                                ? "summary__card summary__card--active"
                                : "summary__card"
                        }
                        onClick={() => {
                            cambiarPrioridad(prioridad === p ? "" : p);
                            setEstado("");
                        }}
                    >
                        <div
                            className={`summary__icon sols__summary-icon--${PRIORIDAD_SUMMARY_CLASE[p]}`}
                        >
                            <Icon name="solicitudes" size={19} />
                        </div>
                        <div>
                            <div className="summary__number">
                                {items.filter((i) => i.prioridad === p).length}
                            </div>
                            <div className="summary__label">P: {p}</div>
                        </div>
                    </button>
                ))}
            </div>

            {/* ── FILTROS ── */}
            <div className="filters">
                <div className="filters__grid">
                    <div className="filters__group filters__group--search">
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

                    <div className="filters__group">
                        <label htmlFor="sols-estado">Estado</label>
                        <select
                            id="sols-estado"
                            className="sols__filter-select"
                            value={estado}
                            onChange={(e) => cambiarEstado(e.target.value)}
                        >
                            <option value="">Todos los estados</option>
                            {ESTADOS_SOLICITUD.map((e) => (
                                <option key={e} value={e}>
                                    {ETIQUETA_ESTADO[e]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filters__group">
                        <label htmlFor="sols-prioridad">Prioridad</label>
                        <select
                            id="sols-prioridad"
                            className="sols__filter-select"
                            value={prioridad}
                            onChange={(e) => cambiarPrioridad(e.target.value)}
                        >
                            <option value="">Todas</option>
                            {PRIORIDADES.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* ── HEADER Y PAGINACIÓN ── */}
            {encontradas.length > 0 && (
                <div className="list-header">
                    <h2>Mis solicitudes</h2>
                    <span className="list-header__meta">
                        {desde}–{hasta} de {encontradas.length} registros
                    </span>
                </div>
            )}

            {itemsPagina.length === 0 ? (
                <div className="empty">
                    No se encontraron solicitudes con los filtros aplicados.
                </div>
            ) : (
                <>
                    <div className="sols__list">
                        {itemsPagina.map((item) => (
                            <article className="sols__item" key={item.id}>
                                <div
                                    className={`sols__item-icon sols__item-icon--${SERVICIO_CLASE[item.servicio] || "blue"}`}
                                >
                                    <Icon
                                        name={
                                            SERVICIO_ICONO[item.servicio] ||
                                            "solicitudes"
                                        }
                                        size={20}
                                    />
                                </div>

                                <div className="sols__item-body">
                                    <div className="sols__item-meta">
                                        <span className="sols__item-id">
                                            {item.id}
                                        </span>
                                        <span
                                            className={`sols__item-status ${ESTADO_COLOR[item.estado] || "gray"}`}
                                        >
                                            {ETIQUETA_ESTADO[item.estado] ||
                                                item.estado}
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
                                            {item.usuario?.nombre}
                                        </span>
                                        <span className="sols__item-date">
                                            {fechasLegibles(item.fecha)}
                                        </span>
                                    </div>

                                    <div className="sols__item-responsible">
                                        <span className="sols__item-responsible-label">
                                            Responsable:
                                        </span>{" "}
                                        {item.responsable?.nombre ||
                                            "Sin asignar"}
                                    </div>

                                    {!ESTADOS_FINALES.includes(item.estado) &&
                                        item.estado !== "RECHAZADA" && (
                                            <div className="sols__progress">
                                                <div
                                                    className="sols__progress-fill"
                                                    style={{
                                                        width: `${progresoDe(item.estado)}%`
                                                    }}
                                                />
                                            </div>
                                        )}
                                </div>

                                <div className="sols__item-actions">
                                    <Link
                                        to={`/solicitudes/${item.id}`}
                                        className="sols__details-button"
                                    >
                                        Ver detalle
                                    </Link>

                                    {puedeGestionar && ACCIONES_POR_ESTADO[item.estado]
                                        ?.filter((a) => a !== "nota")
                                        .map((accion) => (
                                            <button
                                                key={accion}
                                                type="button"
                                                className={
                                                    accion === "rechazar"
                                                        ? "sols__reject-button"
                                                        : "sols__advance-button"
                                                }
                                                onClick={() =>
                                                    handleAccion(
                                                        item,
                                                        accion
                                                    )
                                                }
                                            >
                                                {ACTION_LABELS[accion] ||
                                                    accion}
                                            </button>
                                        ))}

                                    {puedeGestionar && (
                                        <button
                                            type="button"
                                            className="sols__note-button"
                                            onClick={() => abrirNota(item)}
                                        >
                                            Agregar nota
                                        </button>
                                    )}
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
                        total={encontradas.length}
                    />
                </>
            )}

            {/* ── Modal: crear solicitud ── */}
            <Modal
                isOpen={crearAbierto}
                title="Registrar solicitud"
                subtitle="Completa los datos de la nueva solicitud."
                onClose={cerrar}
            >
                <form
                    className="sols__modal-form"
                    onSubmit={handleCrear}
                >
                    <div className="form-grid sols__form-grid">
                        <div className="sols__form-group">
                            <label htmlFor="sol-tipo">
                                Tipo de solicitud *
                            </label>
                            <input
                                id="sol-tipo"
                                type="text"
                                name="tipo"
                                value={form.tipo}
                                onChange={handleChange}
                                placeholder="ej. Constancia académica"
                                className={formErrores.tipo ? "sols__input--error" : ""}
                            />
                            {formErrores.tipo ? (
                                <span className="sols__field-error">{formErrores.tipo}</span>
                            ) : (
                                <span className="sols__field-hint">
                                    {form.tipo.trim().length}/10 caracteres mínimos
                                </span>
                            )}
                        </div>

                        <div className="sols__form-group">
                            <label htmlFor="sol-servicio">Servicio *</label>
                            <select
                                id="sol-servicio"
                                name="servicio"
                                value={form.servicio}
                                onChange={handleChange}
                                className={formErrores.servicio ? "sols__input--error" : ""}
                            >
                                <option value="">Selecciona…</option>
                                <option value="Solicitudes">
                                    Solicitudes
                                </option>
                                <option value="Reservas">Reservas</option>
                                <option value="Eventos">Eventos</option>
                                <option value="Recursos">Recursos</option>
                                <option value="PQRS">PQRS</option>
                            </select>
                            {formErrores.servicio && (
                                <span className="sols__field-error">{formErrores.servicio}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-grid">
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
                        <label htmlFor="sol-descripcion">Descripción *</label>
                        <textarea
                            id="sol-descripcion"
                            name="descripcion"
                            rows="4"
                            value={form.descripcion}
                            onChange={handleChange}
                            placeholder="Describe el motivo de la solicitud"
                            className={formErrores.descripcion ? "sols__input--error" : ""}
                        />
                        {formErrores.descripcion ? (
                            <span className="sols__field-error">{formErrores.descripcion}</span>
                        ) : (
                            <span className="sols__field-hint">
                                {form.descripcion.trim().length}/20 caracteres mínimos
                            </span>
                        )}
                    </div>

                    <div className="modal__footer">
                        <button
                            type="button"
                            className="button button--ghost button--md"
                            onClick={cerrar}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="button button--accent button--md"
                        >
                            Crear solicitud
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── Modal: asignar responsable ── */}
            <Modal
                isOpen={asignarAbierto}
                title={
                    seleccionada
                        ? `Asignar responsable a ${seleccionada.id}`
                        : "Asignar responsable"
                }
                subtitle="Selecciona el responsable para esta solicitud."
                onClose={cerrarAsignar}
            >
                <form
                    className="sols__modal-form"
                    onSubmit={handleAsignar}
                >
                    <div className="sols__form-group">
                        <label htmlFor="asignar-responsable">
                            Responsable
                        </label>
                        <select
                            id="asignar-responsable"
                            value={responsableSeleccionado?.id || ""}
                            onChange={(e) => {
                                const resp = responsables.find(
                                    (r) =>
                                        r.id === Number(e.target.value)
                                );
                                setResponsableSeleccionado(resp || null);
                            }}
                        >
                            <option value="">Selecciona…</option>
                            {responsables.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="modal__footer">
                        <button
                            type="button"
                            className="button button--ghost button--md"
                            onClick={cerrarAsignar}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="button button--accent button--md"
                            disabled={!responsableSeleccionado}
                        >
                            Asignar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── Modal: rechazar solicitud ── */}
            <Modal
                isOpen={rechazarAbierto}
                title={
                    seleccionada
                        ? `Rechazar ${seleccionada.id}`
                        : "Rechazar solicitud"
                }
                subtitle="Indica el motivo del rechazo."
                onClose={cerrarRechazar}
            >
                <form
                    className="sols__modal-form"
                    onSubmit={handleRechazarSubmit}
                >
                    <div className="sols__form-group">
                        <label htmlFor="rechazo-motivo">
                            Motivo del rechazo *
                        </label>
                        <textarea
                            id="rechazo-motivo"
                            rows="4"
                            value={nota}
                            onChange={(e) => setNota(e.target.value)}
                            placeholder="Explica por qué se rechaza esta solicitud…"
                        />
                    </div>

                    {seleccionada?.prioridad === "Alta" && (
                        <p className="sols__modal-warning">
                            ⚠️ Esta solicitud es de prioridad <strong>Alta</strong>. Se pedirá confirmación adicional antes de rechazar.
                        </p>
                    )}

                    <div className="modal__footer">
                        <button
                            type="button"
                            className="button button--ghost button--md"
                            onClick={cerrarRechazar}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="button button--danger button--md"
                            disabled={!nota.trim()}
                        >
                            {seleccionada?.prioridad === "Alta" ? "Continuar →" : "Rechazar solicitud"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── Modal: agregar nota ── */}
            <Modal
                isOpen={notaAbierto}
                title={
                    seleccionada
                        ? `Agregar nota a ${seleccionada.id}`
                        : "Agregar nota"
                }
                subtitle="Agrega una nota o comentario a la solicitud."
                onClose={cerrarNota}
            >
                <form
                    className="sols__modal-form"
                    onSubmit={handleAgregarNota}
                >
                    <div className="sols__form-group">
                        <label htmlFor="nota-texto">Nota *</label>
                        <textarea
                            id="nota-texto"
                            rows="4"
                            value={nota}
                            onChange={(e) => setNota(e.target.value)}
                            placeholder="Escribe tu nota o comentario…"
                        />
                    </div>

                    <div className="modal__footer">
                        <button
                            type="button"
                            className="button button--ghost button--md"
                            onClick={cerrarNota}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="button button--accent button--md"
                            disabled={!nota.trim()}
                        >
                            Agregar nota
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── Modal: confirmar acción (Resolver / Cerrar) ── */}
            <Modal
                isOpen={confirmarAbierto}
                title={
                    accionPendiente?.accion === "cerrar"
                        ? "Cerrar solicitud"
                        : "Resolver solicitud"
                }
                subtitle={
                    accionPendiente?.accion === "cerrar"
                        ? "Esta acción marcará la solicitud como cerrada de forma definitiva."
                        : "Esta acción marcará la solicitud como resuelta."
                }
                onClose={() => { setConfirmarAbierto(false); setAccionPendiente(null); }}
            >
                <p className="sols__modal-confirm-text">
                    ¿Confirmas que deseas{" "}
                    <strong>
                        {accionPendiente?.accion === "cerrar" ? "cerrar" : "resolver"}
                    </strong>{" "}
                    la solicitud <strong>{accionPendiente?.item?.id}</strong>?
                </p>
                <div className="modal__footer">
                    <button
                        type="button"
                        className="button button--ghost button--md"
                        onClick={() => { setConfirmarAbierto(false); setAccionPendiente(null); }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="button button--accent button--md"
                        onClick={handleConfirmar}
                    >
                        {accionPendiente?.accion === "cerrar" ? "Sí, cerrar" : "Sí, resolver"}
                    </button>
                </div>
            </Modal>

            {/* ── Modal: pausar solicitud ── */}
            <Modal
                isOpen={pausarAbierto}
                title={seleccionada ? `Pausar ${seleccionada.id}` : "Pausar solicitud"}
                subtitle="Indica el motivo por el que se pausa la atención."
                onClose={() => { setPausarAbierto(false); setSeleccionada(null); setSeleccionadoId(null); setMotivoPausa(""); }}
            >
                <form className="sols__modal-form" onSubmit={handlePausar}>
                    <div className="sols__form-group">
                        <label htmlFor="pausa-motivo">Motivo de la pausa *</label>
                        <textarea
                            id="pausa-motivo"
                            rows="4"
                            value={motivoPausa}
                            onChange={(e) => setMotivoPausa(e.target.value)}
                            placeholder="Explica por qué se pausa esta solicitud…"
                        />
                    </div>
                    <div className="modal__footer">
                        <button
                            type="button"
                            className="button button--ghost button--md"
                            onClick={() => { setPausarAbierto(false); setSeleccionada(null); setSeleccionadoId(null); setMotivoPausa(""); }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="button button--accent button--md"
                            disabled={!motivoPausa.trim()}
                        >
                            Pausar solicitud
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── Modal: reabrir solicitud ── */}
            <Modal
                isOpen={reabrirAbierto}
                title={seleccionada ? `Reabrir ${seleccionada.id}` : "Reabrir solicitud"}
                subtitle="Indica el motivo por el que se reabre esta solicitud."
                onClose={() => { setReabrirAbierto(false); setSeleccionada(null); setSeleccionadoId(null); setMotivoReabrir(""); }}
            >
                <form className="sols__modal-form" onSubmit={handleReabrir}>
                    <div className="sols__form-group">
                        <label htmlFor="reabrir-motivo">Motivo de la reapertura *</label>
                        <textarea
                            id="reabrir-motivo"
                            rows="4"
                            value={motivoReabrir}
                            onChange={(e) => setMotivoReabrir(e.target.value)}
                            placeholder="Explica por qué se reabre esta solicitud…"
                        />
                    </div>
                    <div className="modal__footer">
                        <button
                            type="button"
                            className="button button--ghost button--md"
                            onClick={() => { setReabrirAbierto(false); setSeleccionada(null); setSeleccionadoId(null); setMotivoReabrir(""); }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="button button--accent button--md"
                            disabled={!motivoReabrir.trim()}
                        >
                            Reabrir solicitud
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── Modal: confirmación extra rechazo prioridad Alta ── */}
            <Modal
                isOpen={rechazarConfirmarAbierto}
                title="Confirmar rechazo — Prioridad Alta"
                subtitle="Esta solicitud tiene prioridad Alta. Confirma que deseas rechazarla."
                onClose={() => { setRechazarConfirmarAbierto(false); setRechazarAbierto(true); }}
            >
                <p className="sols__modal-confirm-text">
                    Vas a rechazar la solicitud <strong>{seleccionada?.id}</strong> (<strong>{seleccionada?.tipo}</strong>), que es de prioridad <strong>Alta</strong>. Esta acción quedará registrada en el historial.
                </p>
                <div className="modal__footer">
                    <button
                        type="button"
                        className="button button--ghost button--md"
                        onClick={() => { setRechazarConfirmarAbierto(false); setRechazarAbierto(true); }}
                    >
                        ← Volver
                    </button>
                    <button
                        type="button"
                        className="button button--danger button--md"
                        onClick={ejecutarRechazo}
                    >
                        Confirmar rechazo
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default Solicitudes;
