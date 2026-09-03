import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useAuth from "../../context/useAuth";
import Icon from "../../components/Icon/Icon";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import Modal from "../../components/Modal/Modal";
import {
    ETIQUETA_ESTADO,
    ESTADOS_FINALES,
    ACCIONES_POR_ESTADO,
    ORDEN_ESTADOS,
    obtenerSolicitudPorId,
    ejecutarAccion,
    progresoDe
} from "../../utils/solicitudes";
import { obtenerUsuarios } from "../../utils/users";
import "./SolicitudDetalle.css";

const PRIORIDAD_CLASE = {
    Alta: "alta",
    Media: "media",
    Baja: "baja"
};

const TIPO_ICONO = {
    CREACION: "✓",
    ESTADO: "●",
    NOTA: "📝",
    ASIGNACION: "👤",
    RECHAZO: "✕",
    REAPERTURA: "↺",
    PAUSA: "⏸",
    REANUDA: "▶"
};

const TIPO_ICONO_CLASE = {
    CREACION: "sol-det__timeline-icon--green",
    ESTADO: "sol-det__timeline-icon--blue",
    NOTA: "sol-det__timeline-icon--gray",
    ASIGNACION: "sol-det__timeline-icon--purple",
    RECHAZO: "sol-det__timeline-icon--red",
    REAPERTURA: "sol-det__timeline-icon--yellow",
    PAUSA: "sol-det__timeline-icon--yellow",
    REANUDA: "sol-det__timeline-icon--blue"
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

function SolicitudDetalle() {
    const { id } = useParams();
    const { user, puede } = useAuth();

    const [solicitud, setSolicitud] = useState(() =>
        obtenerSolicitudPorId(id)
    );

    useEffect(() => {
        setSolicitud(obtenerSolicitudPorId(id));
    }, [id]);
    const [aviso, setAviso] = useState("");

    const [rechazarAbierto, setRechazarAbierto] = useState(false);
    const [notaAbierto, setNotaAbierto] = useState(false);
    const [asignarAbierto, setAsignarAbierto] = useState(false);
    const [confirmarAbierto, setConfirmarAbierto] = useState(false);
    const [pausarAbierto, setPausarAbierto] = useState(false);
    const [reabrirAbierto, setReabrirAbierto] = useState(false);
    const [rechazarConfirmarAbierto, setRechazarConfirmarAbierto] = useState(false);
    const [accionPendiente, setAccionPendiente] = useState(null);
    const [motivo, setMotivo] = useState("");
    const [motivoPausa, setMotivoPausa] = useState("");
    const [motivoReabrir, setMotivoReabrir] = useState("");
    const [nota, setNota] = useState("");
    const [responsableSeleccionado, setResponsableSeleccionado] =
        useState(null);

    const puedeGestionar =
        puede("actualizar_estados") || puede("gestionar_solicitudes");

    const responsables = useMemo(
        () =>
            obtenerUsuarios()
                .filter(
                    (u) =>
                        (u.rol === "Administrador" ||
                            u.rol === "Administrativo") &&
                        u.estado === "Activo"
                )
                .map((u) => ({ id: u.id, nombre: u.nombre })),
        []
    );

    const accionesDisponibles = useMemo(() => {
        const mapa = (ACCIONES_POR_ESTADO && typeof ACCIONES_POR_ESTADO === "object")
            ? ACCIONES_POR_ESTADO
            : {};
        const fallback = {
            REGISTRADA: ["revisar", "rechazar"],
            EN_REVISION: ["asignar", "rechazar"],
            ASIGNADA: ["proceso", "rechazar"],
            EN_PROCESO: ["resolver", "pausar"],
            PAUSADA: ["reanudar"],
            RESUELTA: ["cerrar", "reabrir"],
            CERRADA: ["reabrir"],
            RECHAZADA: ["reabrir"]
        };
        const estado = solicitud?.estado;
        const base = estado ? mapa[estado] : null;
        const lista = Array.isArray(base) && base.length ? base : (estado ? fallback[estado] || [] : []);
        return lista;
    }, [solicitud?.estado]);

    const indicesAlcanzados = useMemo(() => {
        if (!solicitud?.historial) return new Set();
        const estados = new Set();
        solicitud.historial.forEach((h) => {
            if (h.estado && ORDEN_ESTADOS.includes(h.estado)) {
                const idx = ORDEN_ESTADOS.indexOf(h.estado);
                for (let i = 0; i <= idx; i++) {
                    estados.add(ORDEN_ESTADOS[i]);
                }
            }
        });
        return estados;
    }, [solicitud?.historial]);

    const abrirNota = () => {
        setNota("");
        setNotaAbierto(true);
    };

    const mostrarAviso = (texto) => {
        setAviso(texto);
        setTimeout(() => setAviso(""), 2500);
    };

    const accionSimple = (accion, datos = {}) => {
        if (!solicitud) return;
        if (!puedeGestionar) {
            mostrarAviso("No tienes permiso para realizar esta acción.");
            return;
        }
        const act = ejecutarAccion(solicitud.id, accion, {
            usuario: user?.nombre || "Administrador",
            ...datos
        });
        if (act) {
            setSolicitud(act);
            mostrarAviso("Acción ejecutada correctamente.");
        }
    };

    const handleRechazarSubmit = (e) => {
        e.preventDefault();
        if (!motivo.trim()) return;
        if (solicitud?.prioridad === "Alta") {
            setRechazarAbierto(false);
            setRechazarConfirmarAbierto(true);
        } else {
            ejecutarRechazo();
        }
    };

    const ejecutarRechazo = () => {
        accionSimple("rechazar", { descripcion: motivo.trim() });
        setRechazarConfirmarAbierto(false);
        setRechazarAbierto(false);
        setMotivo("");
    };

    const handleAgregarNota = (e) => {
        e.preventDefault();
        if (!nota.trim()) return;
        accionSimple("nota", { descripcion: nota.trim() });
        setNotaAbierto(false);
        setNota("");
    };

    const handleAsignar = (e) => {
        e.preventDefault();
        if (!responsableSeleccionado) return;
        accionSimple("asignar", {
            responsable: responsableSeleccionado
        });
        setAsignarAbierto(false);
        setResponsableSeleccionado(null);
    };

    const handlePausar = (e) => {
        e.preventDefault();
        if (!motivoPausa.trim()) return;
        accionSimple("pausar", { descripcion: motivoPausa.trim() });
        setPausarAbierto(false);
        setMotivoPausa("");
    };

    const handleReabrir = (e) => {
        e.preventDefault();
        if (!motivoReabrir.trim()) return;
        accionSimple("reabrir", { descripcion: motivoReabrir.trim() });
        setReabrirAbierto(false);
        setMotivoReabrir("");
    };

    const handleConfirmar = () => {
        if (!accionPendiente) return;
        accionSimple(accionPendiente);
        setConfirmarAbierto(false);
        setAccionPendiente(null);
    };

    const handleAccion = (accion) => {
        if (accion === "asignar") {
            setResponsableSeleccionado(null);
            setAsignarAbierto(true);
        } else if (accion === "rechazar") {
            setMotivo("");
            setRechazarAbierto(true);
        } else if (accion === "pausar") {
            setMotivoPausa("");
            setPausarAbierto(true);
        } else if (accion === "reabrir") {
            setMotivoReabrir("");
            setReabrirAbierto(true);
        } else if (accion === "cerrar" || accion === "resolver") {
            setAccionPendiente(accion);
            setConfirmarAbierto(true);
        } else {
            accionSimple(accion);
        }
    };

    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return "";
        const [fecha, hora] = fechaStr.split(" ");
        if (!fecha) return fechaStr;
        const partes = fecha.split("-");
        if (partes.length !== 3) return fechaStr;
        const meses = [
            "ene", "feb", "mar", "abr", "may", "jun",
            "jul", "ago", "sep", "oct", "nov", "dic"
        ];
        const fechaLegible = `${partes[2]} ${meses[Number(partes[1]) - 1]} ${partes[0]}`;
        return hora ? `${fechaLegible}, ${hora}` : fechaLegible;
    };

    if (!solicitud) {
        return (
            <div className="page">
                <Link
                    to="/solicitudes"
                    className="solicitud-detalle__back"
                >
                    ← Volver a solicitudes
                </Link>
                <div className="empty">Solicitud no encontrada.</div>
            </div>
        );
    }

    const esRechazada = solicitud.estado === "RECHAZADA";
    const esFinal = ESTADOS_FINALES.includes(solicitud.estado);

    return (
        <div className="page">
            <Link
                to="/solicitudes"
                className="solicitud-detalle__back"
            >
                ← Volver a solicitudes
            </Link>

            {aviso && (
                <div className="toast toast--success">
                    <Icon name="info" size={14} />
                    {aviso}
                </div>
            )}

            {/* ── HEADER ── */}
            <header className="solicitud-detalle__header">
                <div className="solicitud-detalle__top">
                    <h1 className="solicitud-detalle__numero">
                        {solicitud.id}
                    </h1>
                    <div className="solicitud-detalle__badges">
                        <StatusBadge estado={solicitud.estado} />
                        {solicitud.prioridad && (
                            <span
                                className={`sols__item-priority sols__item-priority--${PRIORIDAD_CLASE[solicitud.prioridad] || "media"}`}
                            >
                                {solicitud.prioridad}
                            </span>
                        )}
                    </div>
                </div>

                <h2 className="solicitud-detalle__tipo">
                    {solicitud.tipo}
                </h2>
                <p className="solicitud-detalle__descripcion">
                    {solicitud.descripcion}
                </p>

                <div className="solicitud-detalle__meta">
                    <div className="solicitud-detalle__meta-item">
                        <span className="solicitud-detalle__meta-label">
                            Solicitante
                        </span>
                        <span className="solicitud-detalle__meta-value">
                            {solicitud.usuario?.nombre}
                        </span>
                    </div>

                    <div className="solicitud-detalle__meta-item">
                        <span className="solicitud-detalle__meta-label">
                            Responsable
                        </span>
                        <span className="solicitud-detalle__meta-value">
                            {solicitud.responsable?.nombre ||
                                "Sin asignar"}
                        </span>
                    </div>

                    <div className="solicitud-detalle__meta-item">
                        <span className="solicitud-detalle__meta-label">
                            Dependencia
                        </span>
                        <span className="solicitud-detalle__meta-value">
                            {solicitud.dependencia || "—"}
                        </span>
                    </div>

                    <div className="solicitud-detalle__meta-item">
                        <span className="solicitud-detalle__meta-label">
                            Servicio
                        </span>
                        <span className="solicitud-detalle__meta-value">
                            {solicitud.servicio}
                        </span>
                    </div>

                    <div className="solicitud-detalle__meta-item">
                        <span className="solicitud-detalle__meta-label">
                            Fecha de solicitud
                        </span>
                        <span className="solicitud-detalle__meta-value">
                            {solicitud.fecha}
                        </span>
                    </div>
                </div>

                {/* ── Progress bar ── */}
                {!esRechazada && (
                    <div className="sol-det__progress-wrapper">
                        <div className="sol-det__progress-bar">
                            <div
                                className="sol-det__progress-fill"
                                style={{
                                    width: `${progresoDe(solicitud.estado)}%`
                                }}
                            />
                        </div>
                        <span className="sol-det__progress-label">
                            {progresoDe(solicitud.estado)}%
                        </span>
                    </div>
                )}

                {/* ── Steps chips ── */}
                {!esRechazada && (
                    <div className="sol-det__steps">
                        {ORDEN_ESTADOS.map((estado) => {
                            const alcanzado =
                                indicesAlcanzados.has(estado);
                            const esActual =
                                estado === solicitud.estado;
                            let clase = "sol-det__step-chip";
                            if (alcanzado)
                                clase += " sol-det__step-chip--done";
                            if (esActual)
                                clase += " sol-det__step-chip--current";
                            return (
                                <span className={clase} key={estado}>
                                    {alcanzado && (
                                        <span className="sol-det__step-check">
                                            ✓
                                        </span>
                                    )}
                                    {ETIQUETA_ESTADO[estado]}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* ── Acciones contextuales ── */}
                {puedeGestionar && (
                <div className="solicitud-detalle__actions">
                    {accionesDisponibles
                        .filter((a) => a !== "nota")
                        .map((accion) => (
                            <button
                                type="button"
                                key={accion}
                                className={
                                    accion === "rechazar"
                                        ? "button button--danger button--md"
                                        : accion === "reabrir"
                                            ? "button button--ghost button--md"
                                            : "button button--accent button--md"
                                }
                                onClick={() => handleAccion(accion)}
                            >
                                {ACTION_LABELS[accion] || accion}
                            </button>
                        ))}
                    <button
                        type="button"
                        className="button button--ghost button--md"
                        onClick={abrirNota}
                    >
                        <Icon name="info" size={14} />
                        Agregar nota
                    </button>
                </div>
                )}
            </header>

            {/* ── TIMELINE ── */}
            <section className="solicitud-detalle__timeline">
                <h3 className="solicitud-detalle__timeline-title">
                    Historial de la solicitud
                </h3>

                <ol className="sol-det__timeline">
                    {[...(solicitud.historial || [])]
                        .reverse()
                        .map((evento, idx) => (
                            <li
                                className="sol-det__timeline-item"
                                key={`${evento.id ?? "evt"}-${idx}`}
                            >
                                <div
                                    className={`sol-det__timeline-dot ${TIPO_ICONO_CLASE[evento.tipo] || "sol-det__timeline-icon--gray"}`}
                                >
                                    {TIPO_ICONO[evento.tipo] || "●"}
                                </div>
                                <div className="sol-det__timeline-content">
                                    <div className="sol-det__timeline-header">
                                        <span className="sol-det__timeline-type">
                                            {evento.tipo === "ESTADO"
                                                ? ETIQUETA_ESTADO[
                                                      evento.estado
                                                  ] || evento.estado
                                                : evento.tipo ===
                                                    "ASIGNACION"
                                                    ? `Asignado a ${evento.responsable}`
                                                    : evento.tipo ===
                                                        "RECHAZO"
                                                        ? "Rechazada"
                                                        : evento.tipo ===
                                                            "PAUSA"
                                                            ? "Pausada"
                                                            : evento.tipo ===
                                                                "REANUDA"
                                                                ? "Reanudada"
                                                                : evento.tipo ===
                                                                    "REAPERTURA"
                                                                    ? "Reapertura"
                                                                    : evento.tipo ===
                                                                        "CREACION"
                                                                        ? "Creada"
                                                                        : evento.tipo}
                                        </span>
                                        <span className="sol-det__timeline-date">
                                            {formatearFecha(
                                                evento.fecha
                                            )}
                                        </span>
                                    </div>
                                    <span className="sol-det__timeline-user">
                                        {evento.usuario}
                                    </span>
                                    {evento.descripcion && (
                                        <p className="sol-det__timeline-desc">
                                            {evento.descripcion}
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                </ol>
            </section>

            {/* ── Modal: asignar responsable ── */}
            <Modal
                isOpen={asignarAbierto}
                title={`Asignar responsable a ${solicitud.id}`}
                subtitle="Selecciona el responsable para esta solicitud."
                onClose={() => setAsignarAbierto(false)}
            >
                <form
                    className="sols__modal-form"
                    onSubmit={handleAsignar}
                >
                    <div className="sols__form-group">
                        <label htmlFor="det-asignar-responsable">
                            Responsable
                        </label>
                        <select
                            id="det-asignar-responsable"
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
                            onClick={() => setAsignarAbierto(false)}
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

            {/* ── Modal: rechazar ── */}
            <Modal
                isOpen={rechazarAbierto}
                title={`Rechazar ${solicitud.id}`}
                subtitle="Indica el motivo del rechazo."
                onClose={() => setRechazarAbierto(false)}
            >
                <form
                    className="sols__modal-form"
                    onSubmit={handleRechazarSubmit}
                >
                    <div className="sols__form-group">
                        <label htmlFor="det-rechazo-motivo">
                            Motivo del rechazo *
                        </label>
                        <textarea
                            id="det-rechazo-motivo"
                            rows="4"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Explica por qué se rechaza esta solicitud…"
                        />
                    </div>

                    {solicitud.prioridad === "Alta" && (
                        <p className="sols__modal-warning">
                            ⚠️ Esta solicitud es de prioridad <strong>Alta</strong>. Se pedirá confirmación adicional antes de rechazar.
                        </p>
                    )}

                    <div className="modal__footer">
                        <button
                            type="button"
                            className="button button--ghost button--md"
                            onClick={() => setRechazarAbierto(false)}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="button button--danger button--md"
                            disabled={!motivo.trim()}
                        >
                            {solicitud.prioridad === "Alta" ? "Continuar →" : "Rechazar solicitud"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── Modal: agregar nota ── */}
            <Modal
                isOpen={notaAbierto}
                title={`Agregar nota a ${solicitud.id}`}
                subtitle="Agrega un comentario al historial."
                onClose={() => setNotaAbierto(false)}
            >
                <form
                    className="sols__modal-form"
                    onSubmit={handleAgregarNota}
                >
                    <div className="sols__form-group">
                        <label htmlFor="det-nota-texto">Nota *</label>
                        <textarea
                            id="det-nota-texto"
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
                            onClick={() => setNotaAbierto(false)}
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
                    accionPendiente === "cerrar"
                        ? "Cerrar solicitud"
                        : "Resolver solicitud"
                }
                subtitle={
                    accionPendiente === "cerrar"
                        ? "Esta acción marcará la solicitud como cerrada de forma definitiva."
                        : "Esta acción marcará la solicitud como resuelta."
                }
                onClose={() => { setConfirmarAbierto(false); setAccionPendiente(null); }}
            >
                <p className="sols__modal-confirm-text">
                    ¿Confirmas que deseas{" "}
                    <strong>
                        {accionPendiente === "cerrar" ? "cerrar" : "resolver"}
                    </strong>{" "}
                    la solicitud <strong>{solicitud.id}</strong>?
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
                        {accionPendiente === "cerrar" ? "Sí, cerrar" : "Sí, resolver"}
                    </button>
                </div>
            </Modal>

            {/* ── Modal: pausar solicitud ── */}
            <Modal
                isOpen={pausarAbierto}
                title={`Pausar ${solicitud.id}`}
                subtitle="Indica el motivo por el que se pausa la atención."
                onClose={() => { setPausarAbierto(false); setMotivoPausa(""); }}
            >
                <form className="sols__modal-form" onSubmit={handlePausar}>
                    <div className="sols__form-group">
                        <label htmlFor="det-pausa-motivo">Motivo de la pausa *</label>
                        <textarea
                            id="det-pausa-motivo"
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
                            onClick={() => { setPausarAbierto(false); setMotivoPausa(""); }}
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
                title={`Reabrir ${solicitud.id}`}
                subtitle="Indica el motivo por el que se reabre esta solicitud."
                onClose={() => { setReabrirAbierto(false); setMotivoReabrir(""); }}
            >
                <form className="sols__modal-form" onSubmit={handleReabrir}>
                    <div className="sols__form-group">
                        <label htmlFor="det-reabrir-motivo">Motivo de la reapertura *</label>
                        <textarea
                            id="det-reabrir-motivo"
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
                            onClick={() => { setReabrirAbierto(false); setMotivoReabrir(""); }}
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
                    Vas a rechazar la solicitud <strong>{solicitud.id}</strong> (<strong>{solicitud.tipo}</strong>), que es de prioridad <strong>Alta</strong>. Esta acción quedará registrada en el historial.
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

export default SolicitudDetalle;
