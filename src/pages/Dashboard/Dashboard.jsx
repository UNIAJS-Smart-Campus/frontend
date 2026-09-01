import { useState } from "react";
import { Link } from "react-router-dom";
import solicitudes from "../../utils/solicitudes";
import notificaciones from "../../utils/notificaciones";
import eventos from "../../utils/eventos";
import services from "../../utils/services";
import useAuth from "../../context/useAuth";
import useSearch from "../../hooks/useSearch";
import Icon from "../../components/Icon/Icon";
import SearchBar from "../../components/SearchBar/SearchBar";
import "./Dashboard.css";

const ESTADO_CLASE = {
    "En proceso": "status-blue",
    "En revisión": "status-yellow",
    "Registrada": "status-yellow",
    Asignada: "status-purple",
    Resuelta: "status-green",
    Cerrada: "status-gray"
};

const PROGRESS_STATES = [
    "Registrada",
    "En revisión",
    "Asignada",
    "En proceso",
    "Resuelta",
    "Cerrada"
];

function capitalizar(texto) {
    return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : texto;
}

function Dashboard() {
    const { user } = useAuth();
    const primerNombre = (user?.nombre || "Usuario").split(" ")[0];

    const [query, setQuery] = useState("");
    const [busqueda, setBusqueda] = useState("");

    const serviciosEncontrados = useSearch(services, busqueda, ["name", "category"]);

    const hoy = new Date();
    const [mesVista, setMesVista] = useState(hoy.getMonth());
    const [anioVista, setAnioVista] = useState(hoy.getFullYear());

    const nombreMes = capitalizar(
        hoy.toLocaleDateString("es-CO", { month: "long", day: "numeric", year: "numeric" })
    );
    const diaSemana = capitalizar(
        hoy.toLocaleDateString("es-CO", { weekday: "long" })
    );

    const cambiarMes = (delta) => {
        const nueva = new Date(anioVista, mesVista + delta, 1);
        setMesVista(nueva.getMonth());
        setAnioVista(nueva.getFullYear());
    };

    const mesVistaLabel = capitalizar(
        new Date(anioVista, mesVista, 1).toLocaleDateString("es-CO", {
            month: "long"
        })
    );

    const misSolicitudes = solicitudes.slice(0, 5);
    const noLeidas = notificaciones.filter((item) => !item.leida);
    const proximosEventos = eventos.filter(
        (evento) => new Date(evento.fecha + "T00:00:00") >= hoy
    );
    const eventosProximosCount = proximosEventos.length;
    const reservas = solicitudes.filter((sol) => sol.servicio === "Reservas");

    const primerDia = new Date(anioVista, mesVista, 1).getDay();
    const diasEnMes = new Date(anioVista, mesVista + 1, 0).getDate();
    const diasAnterior = new Date(anioVista, mesVista, 0).getDate();

    const eventosPorDia = new Map();
    eventos.forEach((evento) => {
        const fechaEvento = new Date(evento.fecha + "T00:00:00");
        if (
            fechaEvento.getMonth() === mesVista &&
            fechaEvento.getFullYear() === anioVista
        ) {
            const dia = fechaEvento.getDate();
            if (!eventosPorDia.has(dia)) eventosPorDia.set(dia, []);
            eventosPorDia.get(dia).push(evento);
        }
    });

    const diasSemana = ["LUN", "MAR", "MI", "JUE", "VIE", "SÁB", "DOM"];
    const celdas = [];

    for (let i = 0; i < primerDia; i++) {
        celdas.push(
            <span className="dashboard__calendar-day dashboard__calendar-day--muted" key={`prev-${i}`}>
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
            >
                {dia}
                {eventosDelDia.length > 0 && (
                    <span className="dashboard__calendar-tooltip">
                        {eventosDelDia.map((evento) => (
                            <span className="dashboard__calendar-tooltip-item" key={evento.id}>
                                <strong>{evento.nombre}</strong>
                                <span>
                                    {evento.hora} · {evento.lugar}
                                </span>
                            </span>
                        ))}
                    </span>
                )}
            </span>
        );
    }

    const siguientesDias = 7 - ((primerDia + diasEnMes) % 7 || 7);
    for (let i = 1; i <= siguientesDias; i++) {
        celdas.push(
            <span className="dashboard__calendar-day dashboard__calendar-day--muted" key={`next-${i}`}>
                {i}
            </span>
        );
    }

    const estadoActual = misSolicitudes[0]?.estado || "Registrada";
    const pasoActual = PROGRESS_STATES.findIndex(
        (estado) => estado === estadoActual
    );
    const progresoPorcentaje = (pasoActual / (PROGRESS_STATES.length - 1)) * 100;

    const stats = [
        {
            icono: "solicitudes",
            numero: solicitudes.length,
            titulo: "Solicitudes activas",
            enlace: "Ver todas",
            clase: "blue"
        },
        {
            icono: "reservas",
            numero: reservas.length,
            titulo: "Reservas confirmadas",
            enlace: "Ver mis reservas",
            clase: "green"
        },
        {
            icono: "notificaciones",
            numero: noLeidas.length,
            titulo: "Nuevas notificaciones",
            enlace: "Ver todas",
            clase: "purple"
        },
        {
            icono: "eventos",
            numero: eventosProximosCount,
            titulo: "Eventos próximos",
            enlace: "Ver calendario",
            clase: "yellow"
        }
    ];

    const actividades = [
        {
            icono: "solicitudes",
            titulo: `Se actualizó el estado de tu solicitud ${misSolicitudes[0]?.id}`,
            tiempo: "Hace 15 minutos",
            clase: "blue",
            etiqueta: "EN PROCESO",
            estadoClase: "status-blue"
        },
        {
            icono: "reservas",
            titulo: "Reserva confirmada: Auditorio principal",
            tiempo: "Hace 1 hora",
            clase: "green"
        },
        {
            icono: "notificaciones",
            titulo: "Nueva notificación recibida",
            tiempo: "Hace 3 horas",
            clase: "purple"
        },
        {
            icono: "eventos",
            titulo: "Inscripción confirmada: Taller de UX",
            tiempo: "Hace 5 horas",
            clase: "green"
        },
        {
            icono: "solicitudes",
            titulo: "Solicitud de certificado aprobada",
            tiempo: "Hace 1 día",
            clase: "blue"
        }
    ];

    return (
        <div className="page">
            <div className="page__header">
                <div className="page__title">
                    <h1>Hola, {primerNombre} 👋</h1>
                    <p>Bienvenido a Smart Campus UNIAJS: tu panel central de servicios universitarios.</p>
                </div>

                <div className="dashboard__date-card">
                    <Icon name="calendar" size={20} />
                    <div>
                        <div className="dashboard__date-main">
                            {diaSemana}, {nombreMes}
                        </div>
                        <div className="dashboard__date-sub">
                            {hoy.getDate()}
                        </div>
                    </div>
                </div>
            </div>

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
                        suggestions={services.flatMap((s) => [s.name, s.category])}
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

            <section className="summary">
                {stats.map((stat) => (
                    <article className="summary__card" key={stat.titulo}>
                        <div className={`dashboard__stat-icon ${stat.clase}`}>
                            <Icon name={stat.icono} size={21} />
                        </div>
                        <div>
                            <div className="summary__number">{stat.numero}</div>
                            <div className="summary__label">{stat.titulo}</div>
                        </div>
                    </article>
                ))}
            </section>

            <section className="dashboard__grid">
                <div className="card">
                    <div className="card__header">
                        <h2>Mis solicitudes</h2>
                        <Link to="/solicitudes" className="dashboard__card-view">Ver todas →</Link>
                    </div>

                    {misSolicitudes.map((sol) => (
                        <div className="dashboard__request" key={sol.id}>
                            <div className="dashboard__request-icon">
                                <Icon name={sol.servicio === "Reservas" ? "reservas" : "solicitudes"} size={16} />
                            </div>
                            <div className="dashboard__request-info">
                                <div className="dashboard__request-name">{sol.tipo}</div>
                                <div className="dashboard__request-id">ID: {sol.id}</div>
                            </div>
                            <span className={`status ${ESTADO_CLASE[sol.estado] || "status-gray"}`}>
                                {sol.estado.toUpperCase()}
                            </span>
                            <div className="dashboard__request-date">
                                {new Date(sol.fecha + "T00:00:00").toLocaleDateString("es-CO", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric"
                                })}
                            </div>
                        </div>
                    ))}

                    <div className="dashboard__progress-title">
                        Estados de una solicitud
                    </div>

                    <div className="dashboard__progress">
                        <div className="dashboard__progress-track" />
                        <div
                            className="dashboard__progress-line"
                            style={{ width: `${progresoPorcentaje}%` }}
                        />
                        {PROGRESS_STATES.map((estado, idx) => {
                            const esActivo = idx < pasoActual;
                            const esActual = idx === pasoActual;
                            return (
                                <div
                                    className={
                                        "dashboard__step" +
                                        (esActivo ? " dashboard__step--active" : "") +
                                        (esActual ? " dashboard__step--current" : "")
                                    }
                                    key={estado}
                                >
                                    <div className="dashboard__step-circle" />
                                    <span>{estado.toUpperCase()}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="card">
                    <div className="card__header">
                        <h2>Notificaciones</h2>
                        <Link to="/notificaciones" className="dashboard__card-view">Ver todas →</Link>
                    </div>

                    <div className="dashboard__notification-list">
                        {notificaciones.slice(0, 5).map((notificacion) => (
                            <div className="dashboard__notification" key={notificacion.id}>
                                <div className="dashboard__notification-top">
                                    <span
                                        className={`dashboard__notification-dot dashboard__notification-dot--${notificacion.icono.toLowerCase()}`}
                                    />
                                    <div>
                                        <div className="dashboard__notification-title">{notificacion.tipo}</div>
                                        <div className="dashboard__notification-text">{notificacion.mensaje}</div>
                                        <div className="dashboard__notification-time">
                                            {new Date(notificacion.fecha + "T00:00:00").toLocaleDateString("es-CO", {
                                                day: "numeric",
                                                month: "short"
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="dashboard__bottom-grid">
                <div className="card">
                    <div className="card__header">
                        <h2>Calendario</h2>
                        <Link to="/eventos" className="dashboard__card-view">Ver calendario →</Link>
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
                        <Link to="/eventos" className="dashboard__card-view">Ver toda →</Link>
                    </div>

                    <div className="dashboard__activity-list">
                        {actividades.slice(0, 5).map((actividad, idx) => (
                            <div className="dashboard__activity" key={idx}>
                                <div className={`dashboard__activity-icon ${actividad.clase}`}>
                                    <Icon name={actividad.icono} size={15} />
                                </div>
                                <div className="dashboard__activity-info">
                                    <div className="dashboard__activity-title">{actividad.titulo}</div>
                                    <div className="dashboard__activity-time">{actividad.tiempo}</div>
                                </div>
                                {actividad.etiqueta && (
                                    <span className={`status ${actividad.estadoClase}`}>
                                        {actividad.etiqueta}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Dashboard;
