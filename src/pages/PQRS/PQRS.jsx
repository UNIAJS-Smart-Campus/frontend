import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/Icon/Icon";
import SearchBar from "../../components/SearchBar/SearchBar";
import Pagination from "../../components/Pagination/Pagination";
import Modal from "../../components/Modal/Modal";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import useAuth from "../../context/useAuth";
import useToast from "../../context/ToastContext";
import { TIPOS_PQRS } from "../../utils/pqrs";
import { feedbackApi, usersApi } from "../../utils/api";
import usePagination from "../../hooks/usePagination";
import "./PQRS.css";

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
    Registrada: "registered",
    "En proceso": "review"
};

const ESTADOS_PQRS = [
    "Registrada",
    "En revisión",
    "Asignada",
    "En proceso",
    "Resuelta",
    "Cerrada"
];

const PRIORIDADES = ["Alta", "Media", "Baja"];

// Transiciones de estado válidas: desde cada estado, hacia cuáles se puede pasar.
const TRANSICIONES = {
    Registrada: ["En revisión", "Resuelta", "Cerrada"],
    "En revisión": ["Asignada", "En proceso", "Resuelta", "Cerrada"],
    Asignada: ["En proceso", "Resuelta", "Cerrada"],
    "En proceso": ["Resuelta", "Cerrada"],
    Resuelta: ["Cerrada"],
    Cerrada: []
};

const ESTADOS_FINALES = ["Resuelta", "Cerrada"];

// Devuelve el estado siguiente del ciclo de vida (avance de un paso).
function siguienteEstado(estado) {
    const idx = ESTADOS_PQRS.indexOf(estado);
    if (idx === -1 || idx >= ESTADOS_PQRS.length - 1) return estado;
    return ESTADOS_PQRS[idx + 1];
}

const formVacio = {
    estado: "En revisión",
    asignadoA: "",
    prioridad: "Media",
    respuesta: ""
};

function PQRS() {
    const { puede, user } = useAuth();
    const toast = useToast();
    const puedeGestionar = puede("gestionar_solicitudes") || puede("actualizar_estados");

    const [filtroTipo, setFiltroTipo] = useState("Todos");
    const [filtroEstado, setFiltroEstado] = useState("Todos");
    const [query, setQuery] = useState("");
    const [busqueda, setBusqueda] = useState("");

    const [gestionAbierto, setGestionAbierto] = useState(false);
    const [detalleAbierto, setDetalleAbierto] = useState(false);
    const [confirmEliminarAbierto, setConfirmEliminarAbierto] = useState(false);
    const [confirmEstadoAbierto, setConfirmEstadoAbierto] = useState(false);
    const [pendiente, setPendiente] = useState(null);
    const [seleccionada, setSeleccionada] = useState(null);
    const [form, setForm] = useState(formVacio);
    const [aviso, setAviso] = useState("");
    const [errorAviso, setErrorAviso] = useState("");
    const [items, setItems] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [usuarios, setUsuarios] = useState([]);

    const cargar = async () => {
        setCargando(true);
        try {
            const data = await feedbackApi.list();
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error(err.message || "No se pudieron cargar las PQRS.");
            setItems([]);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargar();
        usersApi.list().then((u) => setUsuarios(Array.isArray(u) ? u : [])).catch(() => {});
    }, []);

    const usuariosAsignables = useMemo(
        () =>
            usuarios
                .filter(
                    (u) =>
                        (u.rol === "Administrador" || u.rol === "Administrativo") &&
                        u.estado === "Activo"
                )
                .map((u) => ({ id: u.id, nombre: u.nombre })),
        [usuarios]
    );

    const filtradas = useMemo(() => {
        let lista = items;
        if (filtroTipo !== "Todos") {
            lista = lista.filter((item) => item.tipo === filtroTipo);
        }
        if (filtroEstado !== "Todos") {
            lista = lista.filter((item) => item.estado === filtroEstado);
        }
        if (busqueda.trim()) {
            const q = busqueda.toLowerCase();
            lista = lista.filter((item) =>
                [item.id, item.tipo, item.estado, item.descripcion, item.solicitante, item.asignadoA]
                    .filter(Boolean)
                    .some((campo) => String(campo).toLowerCase().includes(q))
            );
        }
        return lista;
    }, [items, filtroTipo, filtroEstado, busqueda]);

    const { pagina, setPagina, totalPaginas, itemsPagina, desde, hasta } = usePagination(filtradas, puedeGestionar ? 6 : 8);

    const contarPor = (campo, valor) => {
        if (valor === "Todos") return items.length;
        return items.filter((item) => item[campo] === valor).length;
    };

    const contarAbiertas = items.filter(
        (item) => !["Resuelta", "Cerrada"].includes(item.estado)
    ).length;

    const sugerencias = useMemo(() => {
        const set = new Set();
        items.forEach((item) => {
            [item.id, item.tipo, item.estado, item.solicitante, item.asignadoA]
                .filter(Boolean)
                .forEach((v) => set.add(String(v)));
        });
        return [...set];
    }, [items]);

    const mostrarAviso = (texto, esError = false) => {
        if (esError) {
            setErrorAviso(texto);
            setTimeout(() => setErrorAviso(""), 3500);
        } else {
            setAviso(texto);
            setTimeout(() => setAviso(""), 2500);
        }
    };

    const abrirGestion = (item) => {
        setSeleccionada(item);
        setForm({
            estado: item.estado || "En revisión",
            asignadoA: item.asignadoA || "",
            prioridad: item.prioridad || "Media",
            respuesta: item.respuesta || ""
        });
        setGestionAbierto(true);
    };

    const abrirDetalle = (item) => {
        setSeleccionada(item);
        setDetalleAbierto(true);
    };

    const cerrarModales = () => {
        setGestionAbierto(false);
        setDetalleAbierto(false);
        setSeleccionada(null);
        setForm(formVacio);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const guardarPqrsConHistorial = (todas, id, cambios) => {
        const ahora = new Date();
        const fecha = ahora.toISOString().slice(0, 10);
        const hora = ahora.toTimeString().slice(0, 5);
        const historial = [
            ...(cambios.historial || []),
            {
                estado: cambios.estado,
                fecha: `${fecha} ${hora}`,
                detalle: cambios.detalle || ""
            }
        ];
        return todas.map((p) =>
            p.id === id ? { ...p, ...cambios, historial } : p
        );
    };

    const handleGuardar = (e) => {
        e.preventDefault();
        if (!seleccionada) return;

        const estadoInicial = seleccionada.estado || "En revisión";
        const datosCambian = [
            form.asignadoA !== (seleccionada.asignadoA || ""),
            form.prioridad !== (seleccionada.prioridad || "Media"),
            form.respuesta !== (seleccionada.respuesta || "")
        ].some(Boolean);

        // El estado avanza automáticamente un paso en el ciclo de vida.
        const estadoObjetivo = siguienteEstado(estadoInicial);
        const cambiarEstado = estadoObjetivo !== estadoInicial;

        if (!datosCambian && !cambiarEstado) {
            mostrarAviso("No hay cambios para guardar.", true);
            return;
        }

        // Al avanzar a Resuelta se exige una respuesta.
        if (cambiarEstado && estadoObjetivo === "Resuelta" && !form.respuesta.trim()) {
            mostrarAviso("Debes escribir una respuesta para avanzar a Resuelta.", true);
            return;
        }

        setPendiente({
            estadoObjetivo,
            cambiarEstado,
            datosCambian,
            asignadoA: form.asignadoA,
            prioridad: form.prioridad,
            respuesta: form.respuesta
        });
        setConfirmEstadoAbierto(true);
    };

    const confirmarAvanceEstado = async () => {
        if (!seleccionada || !pendiente) return;
        const { estadoObjetivo, cambiarEstado } = pendiente;
        const estadoInicial = seleccionada.estado || "En revisión";
        const estadoFinal = cambiarEstado ? estadoObjetivo : estadoInicial;

        try {
            await feedbackApi.update(seleccionada.id, {
                tipo: seleccionada.tipo,
                fecha: seleccionada.fecha,
                estado: estadoFinal,
                descripcion: seleccionada.descripcion,
                sede: seleccionada.sede,
                tipoPerfil: seleccionada.tipoPerfil,
                tipoDocumento: seleccionada.tipoDocumento,
                identificacion: seleccionada.identificacion,
                nombre: seleccionada.nombre,
                telefono: seleccionada.telefono,
                correo: seleccionada.correo,
                area: seleccionada.area,
                asunto: seleccionada.asunto,
                solicitante: seleccionada.solicitante,
                asignadoA: pendiente.asignadoA,
                prioridad: pendiente.prioridad,
                respuesta: pendiente.respuesta,
                usuarioId: seleccionada.usuarioId
            });
            await cargar();
            mostrarAviso(
                cambiarEstado
                    ? `PQRS avanzó de "${estadoInicial}" a "${estadoFinal}".`
                    : "PQRS actualizada correctamente."
            );
            setConfirmEstadoAbierto(false);
            setPendiente(null);
            cerrarModales();
        } catch (err) {
            toast.error(err.message || "No se pudo actualizar la PQRS.");
        }
    };

    const cancelarAvanceEstado = () => {
        setConfirmEstadoAbierto(false);
        setPendiente(null);
    };

    const handleEliminar = (item) => {
        setSeleccionada(item);
        setConfirmEliminarAbierto(true);
    };

    const confirmarEliminar = async () => {
        if (!seleccionada) return;
        try {
            await feedbackApi.remove(seleccionada.id);
            await cargar();
            toast.success("PQRS eliminada correctamente.");
            cerrarModales();
        } catch (err) {
            toast.error(err.message || "No se pudo eliminar la PQRS.");
        }
    };

    const fechaLegible = (fecha) => {
        const segmentos = String(fecha).split("-");
        if (segmentos.length !== 3) return fecha;
        const meses = [
            "ene", "feb", "mar", "abr", "may", "jun",
            "jul", "ago", "sep", "oct", "nov", "dic"
        ];
        return `${segmentos[2]} ${meses[Number(segmentos[1]) - 1]} ${segmentos[0]}`;
    };

    useEffect(() => {
        setPagina(1);
    }, [filtroTipo, filtroEstado, busqueda, setPagina]);

    return (
        <div className="page">
            <div className="page__header">
                <div className="page__title">
                    <h1>{puedeGestionar ? "Gestión de PQRS" : "Mis PQRS"}</h1>
                    <p>
                        {puedeGestionar
                            ? "Revisa, asigna y responde las peticiones, quejas, reclamos y sugerencias registradas."
                            : "Gestiona tus peticiones, quejas, reclamos y sugerencias."}
                    </p>
                </div>

                <Link to="/pqrs/nueva" className="button button--accent button--md">
                    <Icon name="solicitudes" size={15} />
                    Nueva PQRS
                </Link>
            </div>

            {aviso && (
                <div className="toast toast--success">
                    <Icon name="info" size={14} />
                    {aviso}
                </div>
            )}
            {errorAviso && (
                <div className="toast toast--error">
                    <Icon name="info" size={14} />
                    {errorAviso}
                </div>
            )}

            <div className="summary">
                {puedeGestionar ? (
                    <>
                        <div className="summary__card summary__card--active">
                            <div className="summary__icon pqrs__summary-icon--all">
                                <Icon name="pqrs" size={19} />
                            </div>
                            <div>
                                <div className="summary__number">{items.length}</div>
                                <div className="summary__label">Totales</div>
                            </div>
                        </div>
                        <div className="summary__card">
                            <div className="summary__icon gpqrs__summary-icon--open">
                                <Icon name="pqrs" size={19} />
                            </div>
                            <div>
                                <div className="summary__number">{contarAbiertas}</div>
                                <div className="summary__label">Abiertas</div>
                            </div>
                        </div>
                        {TIPOS_PQRS.map((tipo) => (
                            <button
                                key={tipo}
                                className={
                                    filtroTipo === tipo
                                        ? "summary__card summary__card--active"
                                        : "summary__card"
                                }
                                onClick={() =>
                                    setFiltroTipo(filtroTipo === tipo ? "Todos" : tipo)
                                }
                            >
                                <div
                                    className={`summary__icon pqrs__summary-icon--${TIPO_CLASE[tipo]}`}
                                >
                                    <Icon name={TIPO_ICONO[tipo]} size={19} />
                                </div>
                                <div>
                                    <div className="summary__number">
                                        {contarPor("tipo", tipo)}
                                    </div>
                                    <div className="summary__label">{tipo}</div>
                                </div>
                            </button>
                        ))}
                    </>
                ) : (
                    <>
                        <button
                            className={
                                filtroTipo === "Todos"
                                    ? "summary__card summary__card--active"
                                    : "summary__card"
                            }
                            onClick={() => setFiltroTipo("Todos")}
                        >
                            <div className="summary__icon pqrs__summary-icon--all">
                                <Icon name="pqrs" size={19} />
                            </div>
                            <div>
                                <div className="summary__number">{items.length}</div>
                                <div className="summary__label">Todos</div>
                            </div>
                        </button>
                        {TIPOS_PQRS.map((tipo) => (
                            <button
                                key={tipo}
                                className={
                                    filtroTipo === tipo
                                        ? "summary__card summary__card--active"
                                        : "summary__card"
                                }
                                onClick={() => setFiltroTipo(tipo)}
                            >
                                <div
                                    className={`summary__icon pqrs__summary-icon--${TIPO_CLASE[tipo]}`}
                                >
                                    <Icon name={TIPO_ICONO[tipo]} size={19} />
                                </div>
                                <div>
                                    <div className="summary__number">
                                        {contarPor("tipo", tipo)}
                                    </div>
                                    <div className="summary__label">{tipo}</div>
                                </div>
                            </button>
                        ))}
                    </>
                )}
            </div>

            <div className="filters">
                <div className="filters__grid">
                    <div className="filters__group filters__group--search">
                        <label htmlFor="pqrs-search">Buscar</label>
                        <SearchBar
                            id="pqrs-search"
                            placeholder={puedeGestionar ? "ID, tipo, estado, solicitante…" : "Número, tipo, estado o descripción…"}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onSearch={() => setBusqueda(query)}
                            suggestions={sugerencias}
                        />
                    </div>

                    <div className="filters__group">
                        <label htmlFor="pqrs-tipo">Tipo</label>
                        <select
                            id="pqrs-tipo"
                            className="pqrs__filter-select"
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value)}
                        >
                            <option value="Todos">Todos</option>
                            {TIPOS_PQRS.map((tipo) => (
                                <option key={tipo} value={tipo}>
                                    {tipo}
                                </option>
                            ))}
                        </select>
                    </div>

                    {puedeGestionar && (
                        <div className="filters__group">
                            <label htmlFor="pqrs-estado">Estado</label>
                            <select
                                id="pqrs-estado"
                                className="pqrs__filter-select"
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                            >
                                <option value="Todos">Todos los estados</option>
                                {ESTADOS_PQRS.map((estado) => (
                                    <option key={estado} value={estado}>
                                        {estado}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="list-header">
                <h2>{puedeGestionar ? "PQRS registradas" : "Mis PQRS"}</h2>
                <span className="list-header__meta">
                    {desde}–{hasta} de {filtradas.length} registros
                </span>
            </div>

            {itemsPagina.length === 0 ? (
                <div className="empty">
                    {cargando
                        ? "Cargando PQRS..."
                        : "No se encontraron PQRS con los filtros aplicados."}
                </div>
            ) : (
                <>
                    <div className="pqrs__list">
                        {itemsPagina.map((item) => (
                            <article className={`pqrs__item ${puedeGestionar ? "gpqrs__item" : ""}`} key={item.id}>
                                <div
                                    className={`pqrs__item-icon pqrs__item-icon--${TIPO_CLASE[item.tipo] || "blue"}`}
                                >
                                    <Icon name={TIPO_ICONO[item.tipo] || "pqrs"} size={20} />
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
                                        {puedeGestionar && (
                                            <span className="gpqrs__item-priority">
                                                Prioridad: {item.prioridad || "Media"}
                                            </span>
                                        )}
                                    </div>

                                    <h3>{item.tipo}</h3>
                                    <p className="pqrs__item-desc">
                                        {item.descripcion}
                                    </p>

                                    {puedeGestionar ? (
                                        <div className="gpqrs__item-sub">
                                            <span className="gpqrs__item-chip">
                                                Solicitante: {item.solicitante || "Anónimo"}
                                            </span>
                                            <span className="gpqrs__item-chip">
                                                Asignado a: {item.asignadoA || "Sin asignar"}
                                            </span>
                                            <span className="gpqrs__item-date">
                                                {fechaLegible(item.fecha)}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="pqrs__item-date">
                                            {fechaLegible(item.fecha)}
                                        </span>
                                    )}
                                </div>

                                {puedeGestionar && (
                                    <div className="gpqrs__item-actions">
                                        <button
                                            className="gpqrs__action gpqrs__action--ghost"
                                            onClick={() => abrirDetalle(item)}
                                        >
                                            Ver detalle
                                        </button>
                                        <button
                                            className="gpqrs__action gpqrs__action--primary"
                                            onClick={() => abrirGestion(item)}
                                        >
                                            Gestionar
                                        </button>
                                        <button
                                            className="gpqrs__action gpqrs__action--danger"
                                            onClick={() => handleEliminar(item)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                )}
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

            <Modal
                isOpen={gestionAbierto}
                title={seleccionada ? `Gestionar ${seleccionada.id}` : "Gestionar PQRS"}
                subtitle={
                    seleccionada
                        ? `${seleccionada.tipo} · ${seleccionada.solicitante || "Anónimo"}`
                        : ""
                }
                onClose={cerrarModales}
            >
                {seleccionada && (
                    <form className="gpqrs__modal-form" onSubmit={handleGuardar}>
                        <p className="gpqrs__modal-desc">
                            {seleccionada.descripcion}
                        </p>

                        <div className="form-grid gpqrs__form-grid">
                            <div className="gpqrs__form-group gpqrs__estado-flujo">
                                <label>Estado actual</label>
                                <div className="gpqrs__estado-actual">
                                    <span
                                        className={`pqrs__item-status ${ESTADO_CLASE[seleccionada.estado] || "closed"}`}
                                    >
                                        {seleccionada.estado}
                                    </span>
                                    {siguienteEstado(seleccionada.estado) !== seleccionada.estado && (
                                        <>
                                            <span className="gpqrs__estado-flecha">→</span>
                                            <span className="pqrs__item-status review">
                                                {siguienteEstado(seleccionada.estado)}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <p className="gpqrs__estado-ayuda">
                                    {siguienteEstado(seleccionada.estado) === seleccionada.estado
                                        ? "Esta PQRS ya está en su estado final y no avanzará más."
                                        : `Al guardar, la PQRS avanzará automáticamente a "${siguienteEstado(seleccionada.estado)}" y se te pedirá confirmación.`}
                                </p>
                            </div>

                            <div className="gpqrs__form-group">
                                <label htmlFor="gpqrs-prioridad-edit">Prioridad</label>
                                <select
                                    id="gpqrs-prioridad-edit"
                                    name="prioridad"
                                    value={form.prioridad}
                                    onChange={handleChange}
                                >
                                    {PRIORIDADES.map((p) => (
                                        <option key={p} value={p}>
                                            {p}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="gpqrs__form-group">
                            <label htmlFor="gpqrs-asignado-edit">Asignar a</label>
                            <select
                                id="gpqrs-asignado-edit"
                                name="asignadoA"
                                value={form.asignadoA}
                                onChange={handleChange}
                            >
                                <option value="">Sin asignar</option>
                                {usuariosAsignables.map((u) => (
                                    <option key={u.id} value={u.nombre}>
                                        {u.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="gpqrs__form-group">
                            <label htmlFor="gpqrs-respuesta-edit">Respuesta</label>
                            <textarea
                                id="gpqrs-respuesta-edit"
                                name="respuesta"
                                rows="4"
                                value={form.respuesta}
                                onChange={handleChange}
                                placeholder="Detalla la respuesta o solución brindada al solicitante"
                            />
                        </div>

                        <div className="modal__footer">
                            <div className="gpqrs__modal-actions">
                                <button
                                    type="button"
                                    className="button button--ghost button--md"
                                    onClick={cerrarModales}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="button button--accent button--md"
                                >
                                    Guardar cambios
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </Modal>

            <Modal
                isOpen={detalleAbierto}
                title={seleccionada ? `Detalle ${seleccionada.id}` : "Detalle"}
                subtitle={seleccionada ? seleccionada.tipo : ""}
                onClose={cerrarModales}
            >
                {seleccionada && (
                    <div className="gpqrs__detail">
                        <div className="gpqrs__detail-row">
                            <span>Estado</span>
                            <StatusBadge estado={seleccionada.estado} />
                        </div>
                        <div className="gpqrs__detail-row">
                            <span>Prioridad</span>
                            <strong>{seleccionada.prioridad || "Media"}</strong>
                        </div>
                        <div className="gpqrs__detail-row">
                            <span>Solicitante</span>
                            <strong>{seleccionada.solicitante || "Anónimo"}</strong>
                        </div>
                        <div className="gpqrs__detail-row">
                            <span>Asignado a</span>
                            <strong>{seleccionada.asignadoA || "Sin asignar"}</strong>
                        </div>
                        <div className="gpqrs__detail-row">
                            <span>Fecha</span>
                            <strong>{fechaLegible(seleccionada.fecha)}</strong>
                        </div>

                        <h4>Descripción</h4>
                        <p>{seleccionada.descripcion}</p>

                        {seleccionada.respuesta && (
                            <>
                                <h4>Respuesta enviada</h4>
                                <p>{seleccionada.respuesta}</p>
                            </>
                        )}

                        {Array.isArray(seleccionada.historial) && seleccionada.historial.length > 0 && (
                            <>
                                <h4>Historial</h4>
                                <ol className="gpqrs__timeline">
                                    {seleccionada.historial.map((paso, index) => (
                                        <li key={index}>
                                            <strong>{paso.estado}</strong>
                                            <span>{paso.fecha}</span>
                                            {paso.detalle && <p>{paso.detalle}</p>}
                                        </li>
                                    ))}
                                </ol>
                            </>
                        )}

                        <div className="modal__footer">
                            <button
                                type="button"
                                className="button button--ghost button--md"
                                onClick={cerrarModales}
                            >
                                Cerrar
                            </button>
                            <button
                                type="button"
                                className="button button--accent button--md"
                                onClick={() => {
                                    setDetalleAbierto(false);
                                    abrirGestion(seleccionada);
                                }}
                            >
                                Gestionar
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <ConfirmModal
                isOpen={confirmEliminarAbierto}
                title="Eliminar PQRS"
                message={
                    seleccionada
                        ? `¿Eliminar la PQRS ${seleccionada.id}? Esta acción no se puede deshacer.`
                        : ""
                }
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
                onConfirm={confirmarEliminar}
                onClose={() => {
                    setConfirmEliminarAbierto(false);
                    setSeleccionada(null);
                }}
            />

            <ConfirmModal
                isOpen={confirmEstadoAbierto}
                title="Confirmar avance de estado"
                message={
                    seleccionada && pendiente
                        ? pendiente.cambiarEstado
                            ? `¿Confirmas el avance de la PQRS ${seleccionada.id} de "${seleccionada.estado}" a "${pendiente.estadoObjetivo}"? Esta acción se registrará en el historial.`
                            : "Esta PQRS ya está en su estado final. ¿Guardas los cambios sin modificar el estado?"
                        : ""
                }
                confirmText={pendiente?.cambiarEstado ? "Confirmar avance" : "Guardar"}
                cancelText="Cancelar"
                variant="primary"
                onConfirm={confirmarAvanceEstado}
                onClose={cancelarAvanceEstado}
            />
        </div>
    );
}

export default PQRS;
