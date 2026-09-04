import { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../context/useAuth";
import useSearch from "../../hooks/useSearch";
import Icon from "../../components/Icon/Icon";
import SearchBar from "../../components/SearchBar/SearchBar";
import { ESTADOS_FINALES } from "../../utils/solicitudes";
import {
    reservationsApi,
    notificationsApi,
    eventsApi,
    requestsApi
} from "../../utils/api";
import services from "../../utils/services";
import "./Dashboard.css";

function capitalizar(texto) {
    return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : texto;
}

// Ajusta getDay() de domingo=0 a lunes=0
function primerDiaLunes(fecha) {
    return (fecha.getDay() + 6) % 7;
}

function Dashboard() {
    const { user, tienePermiso } = useAuth();
    const primerNombre = (user?.nombre || "Usuario").split(" ")[0];

    const [query, setQuery]       = useState("");
    const [busqueda, setBusqueda] = useState("");

    // TAREA 8: estado para posición del tooltip del calendario
    const [tooltip, setTooltip] = useState(null); // { dia, x, y, eventos }

    const hoy = new Date();
    const [mesVista, setMesVista]   = useState(hoy.getMonth());
    const [anioVista, setAnioVista] = useState(hoy.getFullYear());

    const [solicitudes, setSolicitudes] = useState([]);
    const [misReservas, setMisReservas] = useState([]);
    const [notificaciones, setNotificaciones] = useState([]);
    const [eventos, setEventos] = useState([]);

    useEffect(() => {
        requestsApi.list().then((d) => setSolicitudes(Array.isArray(d) ? d : [])).catch(() => setSolicitudes([]));
        reservationsApi.list().then((d) => setMisReservas(Array.isArray(d) ? d : [])).catch(() => setMisReservas([]));
        notificationsApi.list(user?.id).then((d) => setNotificaciones(Array.isArray(d) ? d : [])).catch(() => setNotificaciones([]));
        eventsApi.list().then((d) => setEventos(Array.isArray(d) ? d : [])).catch(() => setEventos([]));
    }, [user?.id]);

    // TAREA 5: filtrar servicios por permiso del usuario
    const serviciosFiltrados = useMemo(
        () => services.filter((s) => tienePermiso(s.path.replace("/", ""))),
        [tienePermiso]
    );

    const serviciosEncontrados = useSearch(serviciosFiltrados, busqueda, ["name", "category"]);

    // TAREA 1: formato correcto sin duplicar día de la semana
    const diaSemana = capitalizar(hoy.toLocaleDateString("es-CO", { weekday: "long" }));
    const fechaFormateada = capitalizar(
        hoy.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
    );

    const cambiarMes = (delta) => {
        const nueva = new Date(anioVista, mesVista + delta, 1);
        setMesVista(nueva.getMonth());
        setAnioVista(nueva.getFullYear());
    };

    const mesVistaLabel = capitalizar(
        new Date(anioVista, mesVista, 1).toLocaleDateString("es-CO", { month: "long" })
    );

    // Alcance: Admin/Administrativo ven métricas globales del campus; Docente/Estudiante ven solo lo propio.
    const esVistaGlobal =
        user?.rol === "Administrador" || user?.rol === "Administrativo";

    const solicitudesPersonales = useMemo(
        () =>
            esVistaGlobal
                ? solicitudes
                : solicitudes.filter(
                      (s) =>
                          s.usuario?.id === user?.id ||
                          (user?.id != null && s.usuario?.id == null)
                  ),
        [solicitudes, user, esVistaGlobal]
    );

    const reservasPersonales = useMemo(
        () =>
            esVistaGlobal
                ? misReservas
                : misReservas.filter((r) => r.usuarioId === user?.id),
        [misReservas, user, esVistaGlobal]
    );

    const misSolicitudes = solicitudesPersonales.slice(0, 5);

    const noLeidas            = notificaciones.filter((n) => !n.leida);
    const proximosEventos     = eventos.filter(
        (e) => new Date(e.fecha + "T00:00:00") >= hoy
    );
    const reservasConfirmadas = reservasPersonales.filter((r) => r.estado === "Confirmada");

    // TAREA 2: solo solicitudes NO finalizadas
    const solicitudesActivas = solicitudesPersonales.filter(
        (s) => !ESTADOS_FINALES.includes(s.estado)
    );

    // Calendario
    const primerDia   = primerDiaLunes(new Date(anioVista, mesVista, 1));
    const diasEnMes   = new Date(anioVista, mesVista + 1, 0).getDate();
    const diasAnterior = new Date(anioVista, mesVista, 0).getDate();

    const eventosPorDia = useMemo(() => {
        const mapa = new Map();
        eventos.forEach((evento) => {
            const d = new Date(evento.fecha + "T00:00:00");
            if (d.getMonth() === mesVista && d.getFullYear() === anioVista) {
                const dia = d.getDate();
                if (!mapa.has(dia)) mapa.set(dia, []);
                mapa.get(dia).push(evento);
            }
        });
        return mapa;
    }, [eventos, mesVista, anioVista]);

    const diasSemana = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

    // TAREA 8: manejador de hover con posición del cursor para tooltip con position:fixed
    const handleDiaMouseEnter = useCallback((e, dia, eventosDelDia) => {
        if (!eventosDelDia.length) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            dia,
            eventos: eventosDelDia,
            x: rect.left + rect.width / 2,
            y: rect.top
        });
    }, []);

    const handleDiaMouseLeave = useCallback(() => {
        setTooltip(null);
    }, []);

    const celdas = [];

    for (let i = 0; i < primerDia; i++) {
        celdas.push(
            <span
                className="dashboard__calendar-day dashboard__calendar-day--muted"
                key={`prev-${i}`}
            >
                {diasAnterior - primerDia + 1 + i}
            </span>
        );
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
        const esHoy =
            dia === hoy.getDate() &&
            mesVista === hoy.getMonth() &&
            anioVista === hoy.getFullYear();
        const eventosDelDia = eventosPorDia.get(dia) || [];

        celdas.push(
            <span
                className={
                    "dashboard__calendar-day" +
                    (esHoy ? " dashboard__calendar-day--selected" : "") +
                    (eventosDelDia.length ? " dashboard__calendar-day--event" : "")
                }
                key={dia}
                onMouseEnter={(e) => handleDiaMouseEnter(e, dia, eventosDelDia)}
                onMouseLeave={handleDiaMouseLeave}
            >
                {dia}
            </span>
        );
    }

    const totalCeldas    = primerDia + diasEnMes;
    const siguientesDias = totalCeldas % 7 === 0 ? 0 : 7 - (totalCeldas % 7);
    for (let i = 1; i <= siguientesDias; i++) {
        celdas.push(
            <span
                className="dashboard__calendar-day dashboard__calendar-day--muted"
                key={`next-${i}`}
            >
                {i}
            </span>
        );
    }

    const stats = [
        {
            icono:  "solicitudes",
            // TAREA 2: solo solicitudes activas (no finalizadas)
            numero: solicitudesActivas.length,
            titulo: "Solicitudes activas",
            clase:  "blue"
        },
        {
            icono:  "reservas",
            numero: reservasConfirmadas.length,
            titulo: "Reservas confirmadas",
            clase:  "green"
        },
        {
            icono:  "notificaciones",
            numero: noLeidas.length,
            titulo: "Nuevas notificaciones",
            clase:  "purple"
        },
        {
            icono:  "eventos",
            numero: proximosEventos.length,
            titulo: "Eventos próximos",
            clase:  "yellow"
        }
    ];

    const actividades = useMemo(() => {
        const items = [];

        solicitudesPersonales.slice(0, 2).forEach((sol) => {
            items.push({
                icono:       sol.servicio === "Reservas" ? "reservas" : "solicitudes",
                titulo:      `Solicitud ${sol.id} — ${sol.tipo}`,
                tiempo:      new Date(sol.fecha + "T00:00:00").toLocaleDateString("es-CO", {
                    day: "numeric", month: "short"
                }),
                clase:       "blue"
            });
        });

        notificaciones.slice(0, 2).forEach((n) => {
            items.push({
                icono:  n.icono,
                titulo: n.mensaje,
                tiempo: new Date(n.fecha + "T00:00:00").toLocaleDateString("es-CO", {
                    day: "numeric", month: "short"
                }),
                clase: "purple"
            });
        });

        proximosEventos.slice(0, 1).forEach((e) => {
            items.push({
                icono:  "eventos",
                titulo: `Próximo evento: ${e.nombre}`,
                tiempo: new Date(e.fecha + "T00:00:00").toLocaleDateString("es-CO", {
                    day: "numeric", month: "short"
                }),
                clase: "yellow"
            });
        });

        return items.slice(0, 5);
    }, [solicitudesPersonales, notificaciones, proximosEventos]);

    return (
        <div className="page">
            {/* ── HEADER ── */}
            <div className="page__header">
                <div className="page__title">
                    <h1>Hola, {primerNombre} 👋</h1>
                    <p>Bienvenido a Smart Campus UAJS: tu panel central de servicios universitarios.</p>
                </div>

                {/* TAREA 1: formato corregido — diaSemana y fechaFormateada sin duplicar */}
                {/* TAREA 7: reemplazado Icon name='calendar' por 'reservas' */}
                <div className="dashboard__date-card">
                    <Icon name="reservas" size={20} />
                    <div>
                        <div className="dashboard__date-main">{diaSemana}</div>
                        <div className="dashboard__date-sub">{fechaFormateada}</div>
                    </div>
                </div>
            </div>

            {/* ── SERVICIOS ── */}
            <section className="dashboard__services">
                <div className="dashboard__services-header">
                    <h2 className="dashboard__services-title">Servicios disponibles</h2>
                    <p className="dashboard__services-subtitle">
                        Explora y accede rápidamente a los servicios del campus.
                    </p>
                </div>

                <div className="dashboard__search-container">
                    <SearchBar
                        id="dashboard-search"
                        placeholder="Buscar servicios, reservas, recursos…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onSearch={() => setBusqueda(query)}
                        suggestions={serviciosFiltrados.flatMap((s) => [s.name, s.category])}
                    />
                </div>

                {serviciosEncontrados.length === 0 ? (
                    <div className="dashboard__services-empty">
                        <Icon name="info" size={32} />
                        <p>No se encontraron servicios que coincidan con tu búsqueda.</p>
                    </div>
                ) : (
                    <div className="dashboard__services-grid">
                        {serviciosEncontrados.map((service) => (
                            <Link
                                to={service.path}
                                className="dashboard__service-card"
                                key={service.name}
                            >
                                <div className="dashboard__service-icon">
                                    <Icon name={service.icon} size={28} />
                                </div>
                                <div className="dashboard__service-info">
                                    <h3 className="dashboard__service-name">{service.name}</h3>
                                    <span className="dashboard__service-category">{service.category}</span>
                                </div>
                                <span className="dashboard__service-arrow">→</span>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* ── KPIs ── */}
            <section className="summary">
                {stats.map((stat) => (
                    <article className="summary__card" key={stat.titulo}>
                        <div className={`dashboard__stat-icon dashboard__stat-icon--${stat.clase}`}>
                            <Icon name={stat.icono} size={21} />
                        </div>
                        <div>
                            <div className="summary__number">{stat.numero}</div>
                            <div className="summary__label">{stat.titulo}</div>
                        </div>
                    </article>
                ))}
            </section>

            {/* ── GRID: Solicitudes + Notificaciones ── */}
            <section className="dashboard__grid">
                <div className="card">
                    <div className="card__header">
                        <h2>Mis solicitudes</h2>
                        <Link to="/solicitudes" className="dashboard__card-view">Ver todas →</Link>
                    </div>

                    {misSolicitudes.length === 0 ? (
                        <div className="empty">No tienes solicitudes registradas.</div>
                    ) : (
                        misSolicitudes.map((sol) => (
                            <div className="dashboard__request" key={sol.id}>
                                <div className="dashboard__request-icon">
                                    <Icon
                                        name={sol.servicio === "Reservas" ? "reservas" : "solicitudes"}
                                        size={16}
                                    />
                                </div>
                                <div className="dashboard__request-info">
                                    <div className="dashboard__request-name">{sol.tipo}</div>
                                    <div className="dashboard__request-id">ID: {sol.id}</div>
                                </div>
                                <div className="dashboard__request-date">
                                    {new Date(sol.fecha + "T00:00:00").toLocaleDateString("es-CO", {
                                        day: "2-digit", month: "2-digit", year: "numeric"
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="card">
                    <div className="card__header">
                        <h2>Notificaciones</h2>
                        <Link to="/notificaciones" className="dashboard__card-view">Ver todas →</Link>
                    </div>

                    <div className="dashboard__notification-list">
                        {notificaciones.slice(0, 5).map((notificacion) => (
                            <div
                                className={`dashboard__notification${!notificacion.leida ? " dashboard__notification--unread" : ""}`}
                                key={notificacion.id}
                            >
                                <div className="dashboard__notification-top">
                                    <span className={`dashboard__notification-dot dashboard__notification-dot--${notificacion.icono}`} />
                                    <div>
                                        <div className="dashboard__notification-title">{notificacion.tipo}</div>
                                        <div className="dashboard__notification-text">{notificacion.mensaje}</div>
                                        <div className="dashboard__notification-time">
                                            {new Date(notificacion.fecha + "T00:00:00").toLocaleDateString("es-CO", {
                                                day: "numeric", month: "short"
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {notificaciones.length === 0 && (
                            <div className="empty">No tienes notificaciones.</div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── BOTTOM GRID: Calendario + Actividad reciente ── */}
            <section className="dashboard__bottom-grid">
                <div className="card">
                    <div className="card__header">
                        <h2>Calendario</h2>
                        <Link to="/eventos" className="dashboard__card-view">Ver eventos →</Link>
                    </div>

                    <div className="dashboard__calendar-header">
                        <button
                            type="button"
                            className="dashboard__calendar-nav"
                            aria-label="Mes anterior"
                            onClick={() => cambiarMes(-1)}
                        >
                            ‹
                        </button>
                        <span className="dashboard__calendar-month">
                            {mesVistaLabel} {anioVista}
                        </span>
                        <button
                            type="button"
                            className="dashboard__calendar-nav"
                            aria-label="Mes siguiente"
                            onClick={() => cambiarMes(1)}
                        >
                            ›
                        </button>
                    </div>

                    <div className="dashboard__weekdays">
                        {diasSemana.map((dia) => (
                            <span key={dia}>{dia}</span>
                        ))}
                    </div>

                    <div className="dashboard__days">{celdas}</div>
                </div>

                <div className="card">
                    <div className="card__header">
                        <h2>Actividad reciente</h2>
                        <Link to="/solicitudes" className="dashboard__card-view">Ver todo →</Link>
                    </div>

                    <div className="dashboard__activity-list">
                        {actividades.length === 0 ? (
                            <div className="empty">Sin actividad reciente.</div>
                        ) : (
                            actividades.map((actividad, idx) => (
                                <div className="dashboard__activity" key={idx}>
                                    <div className={`dashboard__activity-icon dashboard__activity-icon--${actividad.clase}`}>
                                        <Icon name={actividad.icono} size={15} />
                                    </div>
                                    <div className="dashboard__activity-info">
                                        <div className="dashboard__activity-title">{actividad.titulo}</div>
                                        <div className="dashboard__activity-time">{actividad.tiempo}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* TAREA 8: tooltip del calendario renderizado fuera del grid con position:fixed */}
            {tooltip && (
                <div
                    className="dashboard__calendar-tooltip-portal"
                    style={{
                        left: tooltip.x,
                        top:  tooltip.y - 8,
                        transform: "translate(-50%, -100%)"
                    }}
                >
                    {tooltip.eventos.map((evento) => (
                        <span className="dashboard__calendar-tooltip-item" key={evento.id}>
                            <strong>{evento.nombre}</strong>
                            <span>{evento.hora} · {evento.lugar}</span>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dashboard;
