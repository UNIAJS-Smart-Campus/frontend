import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "../../components/Icon/Icon";
import DataTable from "../../components/DataTable/DataTable";
import { auditApi } from "../../utils/api";
import "./Auditoria.css";

// Etiquetas legibles para las acciones que guarda la tabla `auditoria`.
const ETIQUETA_ACCION = {
    CREAR: "Creación",
    ACTUALIZAR: "Edición",
    ELIMINAR: "Eliminación",
    LOGIN: "Inicio de sesión"
};

// Tarjetas del resumen: el clic de cada una filtra la tabla por esa acción.
const FILTROS = [
    { id: "", etiqueta: "Todos", icono: "reportes" },
    { id: "CREAR", etiqueta: "Creaciones", icono: "solicitudes" },
    { id: "ACTUALIZAR", etiqueta: "Ediciones", icono: "configuracion" },
    { id: "ELIMINAR", etiqueta: "Eliminaciones", icono: "eventos" },
    { id: "LOGIN", etiqueta: "Sesiones", icono: "usuarios" }
];

/** "03 nov 2026, 10:05 p. m." en la zona horaria del navegador. */
function formatearFecha(valor) {
    if (!valor) return "—";
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return String(valor);
    return fecha.toLocaleString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

/** `detalle` puede venir como objeto (JSON parseado) o como texto antiguo. */
function detalleDe(fila) {
    return fila?.detalle && typeof fila.detalle === "object" ? fila.detalle : {};
}

function Auditoria() {
    const [filas, setFilas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [filtro, setFiltro] = useState("");
    const cancelado = useRef(false);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError("");
        try {
            const data = await auditApi.listar(100);
            if (!cancelado.current) setFilas(Array.isArray(data) ? data : []);
        } catch (e) {
            if (!cancelado.current) setError(e?.message || "No se pudo cargar la actividad.");
        } finally {
            if (!cancelado.current) setCargando(false);
        }
    }, []);

    // Los setState ocurren tras el `await` (no de forma síncrona dentro del
    // cuerpo del effect), por lo que no infringen la regla
    // react-hooks/set-state-in-effect de React 19.
    useEffect(() => {
        cancelado.current = false;
        void (async () => {
            await cargar();
        })();
        return () => {
            cancelado.current = true;
        };
    }, [cargar]);

    const visibles = useMemo(
        () => (filtro ? filas.filter((fila) => fila.accion === filtro) : filas),
        [filas, filtro]
    );

    const conteo = (accion) => filas.filter((fila) => fila.accion === accion).length;

    const columnas = [
        {
            key: "fecha",
            label: "Fecha",
            width: "165px",
            render: (fila) => (
                <time dateTime={fila.fecha}>{formatearFecha(fila.fecha)}</time>
            )
        },
        {
            key: "usuario",
            label: "Usuario",
            render: (fila) => (
                <>
                    <strong>
                        {fila.nombre ||
                            (fila.id_usuario ? `Usuario #${fila.id_usuario}` : "Sin usuario")}
                    </strong>
                    {fila.usuario && <div className="actividad__sub">@{fila.usuario}</div>}
                </>
            )
        },
        {
            key: "accion",
            label: "Acción",
            width: "155px",
            render: (fila) => (
                <span
                    className={`actividad__badge actividad__badge--${String(
                        fila.accion || ""
                    ).toLowerCase()}`}
                >
                    {ETIQUETA_ACCION[fila.accion] || fila.accion || "—"}
                </span>
            )
        },
        {
            key: "detalle",
            label: "Detalle",
            render: (fila) => {
                const detalle = detalleDe(fila);
                if (fila.accion === "LOGIN") {
                    return (
                        <>
                            <span>{detalle.dispositivo || "Dispositivo desconocido"}</span>
                            <div className="actividad__sub">Inicio de sesión en la plataforma</div>
                        </>
                    );
                }
                return (
                    <>
                        <code className="actividad__ruta">
                            {detalle.metodo} {detalle.ruta || fila.entidad}
                        </code>
                        <div className="actividad__sub">
                            {fila.entidad}
                            {fila.id_entidad ? ` · registro #${fila.id_entidad}` : ""}
                        </div>
                    </>
                );
            }
        },
        {
            key: "origen",
            label: "Origen",
            width: "185px",
            render: (fila) => {
                const detalle = detalleDe(fila);
                if (fila.accion === "LOGIN") {
                    return <span className="actividad__sub">{detalle.ip || "IP no registrada"}</span>;
                }
                return (
                    <>
                        {detalle.estado != null && <span>HTTP {detalle.estado}</span>}
                        <div className="actividad__sub">{detalle.ip || "IP no registrada"}</div>
                    </>
                );
            }
        }
    ];

    return (
        <div className="page">
            <div className="page__header">
                <div className="page__title">
                    <p>Registro de acciones de administración y accesos recientes.</p>
                </div>
                <button
                    type="button"
                    className="button button--accent button--md"
                    onClick={cargar}
                    disabled={cargando}
                >
                    <Icon name="notificaciones" size={15} />
                    {cargando ? "Actualizando…" : "Actualizar"}
                </button>
            </div>

            {cargando && (
                <div className="toast toast--info">
                    <Icon name="info" size={14} />
                    Sincronizando con el servidor…
                </div>
            )}
            {error && (
                <div className="toast toast--warning" role="alert">
                    <Icon name="info" size={14} />
                    {error}
                </div>
            )}

            {/* Resumen por tipo de acción: el clic también filtra. */}
            <div className="summary">
                {FILTROS.map((item) => (
                    <button
                        key={item.id || "todos"}
                        type="button"
                        className={
                            filtro === item.id
                                ? "summary__card summary__card--active"
                                : "summary__card"
                        }
                        onClick={() => setFiltro(item.id)}
                    >
                        <div
                            className={`summary__icon actividad__icon actividad__icon--${
                                item.id ? item.id.toLowerCase() : "todos"
                            }`}
                        >
                            <Icon name={item.icono} size={19} />
                        </div>
                        <div>
                            <div className="summary__number">
                                {item.id ? conteo(item.id) : filas.length}
                            </div>
                            <div className="summary__label">{item.etiqueta}</div>
                        </div>
                    </button>
                ))}
            </div>

            <DataTable
                columns={columnas}
                rows={visibles}
                emptyMessage="No hay registros para este filtro."
            />
        </div>
    );
}

export default Auditoria;
