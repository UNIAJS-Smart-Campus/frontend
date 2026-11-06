import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/Icon/Icon";
import ImagenCategoria from "../../components/ImagenCategoria/ImagenCategoria";
import SearchBar from "../../components/SearchBar/SearchBar";
import useAuth from "../../context/useAuth";
import { useToast } from "../../context/ToastContext";
import useColeccion from "../../hooks/useColeccion";
import useSugerencias from "../../hooks/useSugerencias";
import Pagination from "../../components/Pagination/Pagination";
import { eventsApi } from "../../utils/api";
import { establecer } from "../../utils/store";
import {
    CLAVE_EVENTOS,
    CATEGORIAS_EVENTO,
    ESTADOS_EVENTO,
    eliminarEvento as eliminarEventoEnApi,
    estaInscrito,
    esEventoInscripcionAbierta,
    cargarInscripciones,
    participantesDe,
    inscribirEvento,
    desinscribirEvento,
    cuposDisponibles,
    contarInscritos,
    obtenerDetalleInscriptos,
    adaptarEventoRemoto
} from "../../utils/eventos";
import "./Eventos.css";

const CATEGORIA_CLASE = {
    Académico: "blue",
    Cultural: "orange",
    Formación: "green",
    Deportivo: "purple"
};

const ESTADO_CLASE = {
    Programado: "active",
    "En curso": "active",
    Finalizado: "done",
    Cancelado: "canceled"
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
    const { items } = useColeccion(CLAVE_EVENTOS, { autoRefresh: false });
    const { user, puede } = useAuth();
    const toast = useToast();
    const esAdmin = puede("publicar_eventos");

    const [query, setQuery] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [categoria, setCategoria] = useState("");
    const [estado, setEstado] = useState("");
    const [orden, setOrden] = useState("fecha");

    const [detalleAbierto, setDetalleAbierto] = useState(null);
    const [inscritosDe, setInscritosDe] = useState(null);
    const [aviso, setAviso] = useState("");
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalEventos, setTotalEventos] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState(null);
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        let cancelado = false;
        setCargando(true);
        eventsApi.list({ page: pagina, limit: 6 })
            .then((respuesta) => {
                if (cancelado) return;
                const paginaRemota = respuesta?.items ? respuesta : { items: respuesta };
                const eventos = (paginaRemota.items || [])
                    .map(adaptarEventoRemoto)
                    .filter(Boolean);
                establecer(CLAVE_EVENTOS, eventos);
                setTotalEventos(Number(paginaRemota.pagination?.total) || eventos.length);
                setTotalPaginas(
                    Math.max(1, Number(paginaRemota.pagination?.totalPages) || 1)
                );
                setErrorCarga(null);
            })
            .catch((error) => {
                if (!cancelado) setErrorCarga(error);
            })
            .finally(() => {
                if (!cancelado) setCargando(false);
            });
        return () => {
            cancelado = true;
        };
    }, [pagina, intento]);

    // El padrón real de inscritos lo expone el backend; se pide al abrir el detalle.
    useEffect(() => {
        const idEvento = detalleAbierto?.id ?? inscritosDe?.id;
        if (idEvento != null) {
            cargarInscripciones(idEvento);
        }
    }, [detalleAbierto?.id, inscritosDe?.id]);

    const normalizar = (texto) =>
        texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const porCategoria = categoria
        ? items.filter((e) => e.tipo === categoria)
        : items;

    const porEstado = estado
        ? porCategoria.filter((e) => e.estado === estado)
        : porCategoria;

    const porBusqueda = busqueda.trim()
        ? porEstado.filter((e) =>
              [e.nombre, e.ubicacion, e.tipo, e.descripcion]
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

    // Respaldo local: se usa si Elasticsearch no responde.
    const sugerenciasLocales = useMemo(
        () => [
            ...new Set(
                items
                    .flatMap((e) => [e.nombre, e.ubicacion, e.tipo])
                    .filter(Boolean)
            )
        ],
        [items]
    );
    const sugerencias = useSugerencias(query, "EVENTOS", sugerenciasLocales);

    const mostrarAviso = (mensaje) => {
        setAviso(mensaje);
        setTimeout(() => setAviso(""), 2600);
    };

    const eliminarEvento = async (ev) => {
        try {
            await eliminarEventoEnApi(ev);
            setDetalleAbierto(null);
            setInscritosDe(null);
            mostrarAviso(`Evento "${ev.nombre}" eliminado.`);
        } catch (fallo) {
            toast.error(fallo?.message || "No se pudo eliminar el evento.");
        }
    };


    const inscribirse = async (ev) => {
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
        try {
            const resultado = await inscribirEvento(ev, user.id, user.nombre);
            if (resultado.offline) {
                toast.warning("No hay conexión con el servidor: la inscripción quedó solo local.");
            } else {
                toast.success(`Te inscribiste a "${ev.nombre}".`);
            }
        } catch (fallo) {
            toast.error(fallo?.message || "No se pudo completar la inscripción.");
        }
    };

    const cancelarInscripcion = async (ev) => {
        if (!user) return;
        if (!estaInscrito(ev, user.id)) return;
        try {
            const resultado = await desinscribirEvento(ev, user.id);
            if (resultado.offline) {
                toast.warning("No hay conexión con el servidor: la cancelación quedó solo local.");
            } else {
                toast.info("Inscripción cancelada.");
            }
        } catch (fallo) {
            toast.error(fallo?.message || "No se pudo cancelar la inscripción.");
        }
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
                    <Link to="/eventos/nuevo" className="button button--accent button--md">
                        <Icon name="eventos" size={15} />
                        Nuevo evento
                    </Link>
                )}
            </div>

            {aviso && (
                <div className="toast toast--success">
                    <Icon name="info" size={14} />
                    {aviso}
                </div>
            )}

            {errorCarga && (
                <div className="toast toast--error">
                    <Icon name="info" size={14} />
                    Sin conexión con el servidor: se muestra la última página sincronizada.
                    <button
                        className="button button--ghost button--sm"
                        onClick={() => setIntento((actual) => actual + 1)}
                    >
                        Reintentar
                    </button>
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
                                {items.filter((e) => e.tipo === cat).length}
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
                            serverSide
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
                    {totalEventos} evento(s) disponible(s)
                </span>
            </div>

            {cargando ? (
                <div className="empty">Cargando eventos…</div>
            ) : encontrados.length === 0 ? (
                <div className="empty">
                    No se encontraron eventos con los filtros aplicados.
                </div>
            ) : (
                <div className="eventos__grid">
                    {encontrados.map((ev) => (
                        <article className="eventos__item" key={ev.id}>
                            <div className="eventos__item-media">
                                <ImagenCategoria grupo="evento" tipo={ev.tipo} semilla={ev.id} />
                            </div>

                            <div className="eventos__item-top">
                                <span
                                    className={`badge badge--${CATEGORIA_CLASE[ev.tipo] || "blue"}`}
                                >
                                    {ev.tipo}
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
                                    {formatearHora(ev.hora_inicio)}
                                </span>
                                <span className="eventos__meta-line">
                                    <Icon name="recursos" size={12} />
                                    {ev.ubicacion}
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
                                                !esEventoInscripcionAbierta(ev) ||
                                                cuposDisponibles(ev) === 0
                                            }
                                        >
                                            {!esEventoInscripcionAbierta(ev)
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

            <Pagination
                pagina={pagina}
                totalPaginas={totalPaginas}
                onChange={setPagina}
            />

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
                                    className={`badge badge--${CATEGORIA_CLASE[detalle.tipo] || "blue"}`}
                                >
                                    {detalle.tipo}
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
                                <span>
                                    {formatearHora(detalle.hora_inicio)} -{" "}
                                    {formatearHora(detalle.hora_fin)}
                                </span>
                            </div>
                            <div className="eventos__detail-item">
                                <Icon name="recursos" size={14} />
                                <span>{detalle.ubicacion}</span>
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
                                <Link
                                    className="eventos__admin-btn"
                                    to={`/eventos/${detalle.id}/editar`}
                                    onClick={() => setDetalleAbierto(null)}
                                >
                                    Editar
                                </Link>
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
                                        !esEventoInscripcionAbierta(detalle) ||
                                        (cuposDisponibles(detalle) === 0 && !estaInscrito(detalle, user?.id))
                                    }
                                >
                                    {!esEventoInscripcionAbierta(detalle)
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
                                // Usar obtenerDetalleInscriptos para mostrar cédula, nombre, carrera
                                // y fecha de inscripción en formato de tabla tipo Excel
                                obtenerDetalleInscriptos(detalle?.id).then(
                                    lista => {
                                        if (lista.length === 0) {
                                            return (
                                                <p className="eventos__empty">
                                                    Aún no hay inscritos en este evento.
                                                </p>
                                            );
                                        }
                                        return (
                                            <div className="eventos__inscritos-table">
                                                <h3>Lista de Inscritos</h3>
                                                <table className="eventos__inscritos-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Cédula</th>
                                                            <th>Nombre</th>
                                                            <th>Carrera</th>
                                                            <th>Fecha de Inscripción</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {lista.map((p, i) => (
                                                            <tr key={`${p.cedula}-${i}`}>
                                                                <td>{p.cedula}</td>
                                                                <td>{p.nombre}</td>
                                                                <td>{p.programa}</td>
                                                                <td>{p.fechaInscripcion}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <button
                                                    className="eventos__print-button"
                                                    onClick={() => window.print()}
                                                >
                                                    Imprimir
                                                </button>
                                            </div>
                                        );
                                    }
                                ).catch(() => {
                                    if (lista.length === 0) {
                                        return (
                                            <p className="eventos__empty">
                                                Aún no hay inscritos en este evento.
                                            </p>
                                        );
                                    }
                                    return null;
                                });
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Eventos;
