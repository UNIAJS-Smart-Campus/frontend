import { useState } from "react";
import { Link } from "react-router-dom";
import solicitudes from "../../utils/solicitudes";
import notificaciones from "../../utils/notificaciones";
import eventos from "../../utils/eventos";
import useAuth from "../../context/useAuth";
import Icon from "../../components/Icon/Icon";
import "./Dashboard.css";

const ESTADO_CLASE = {
    "En proceso": "status-blue",
    "En revisión": "status-yellow",
    "Registrada": "status-yellow",
    "Asignada": "status-purple",
    "Resuelta": "status-green",
    "Cerrada": "status-gray"
};

const PROGRESS_STATES = [
    "Registrada",
    "En revisión",
    "Asignada",
    "En proceso",
    "Resuelta",
    "Cerrada"
];

const ACCESOS = [
    { icono: "estudiante", titulo: "Información Académica", clase: "quick-blue" },
    { icono: "solicitudes", titulo: "Solicitar Documentos", clase: "quick-green" },
    { icono: "reservas", titulo: "Reservar Espacios", clase: "quick-purple" },
    { icono: "pqrs", titulo: "Tramitar Solicitudes", clase: "quick-yellow" },
    { icono: "info", titulo: "Centro de Ayuda", clase: "quick-cyan" }
];

function capitalizar(texto) {
    return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : texto;
}

function Dashboard() {
    const { user } = useAuth();
    const primerNombre = (user?.nombre || "Usuario").split(" ")[0];

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
        }
    ];

    return (
        <div className="dashboard">
            <div className="dashboard__welcome">
                <div>
                    <h1 className="dashboard__welcome-title">
                        Hola, {primerNombre}!
                    </h1>
                    <p className="dashboard__welcome-subtitle">
                        Bienvenido a UAJS Smart Campus
                    </p>
                </div>

                <div className="dashboard__date-card">
                    <Icon name="reservas" size={20} />
                    <div>
                        <div className="dashboard__date-main">
                            {diaSemana}, {nombreMes}
                        </div>
                        <div className="dashboard__date-sub">
                            Semestre 2026-II
                        </div>
                    </div>
                </div>
            </div>

            <section className="dashboard__stats">
                {stats.map((stat) => (
                    <article className="dashboard__stat-card" key={stat.titulo}>
                        <div className={`dashboard__stat-icon ${stat.clase}`}>
                            <Icon name={stat.icono} size={21} />
                        </div>
                        <div>
                            <div className="dashboard__stat-number">{stat.numero}</div>
                            <div className="dashboard__stat-title">{stat.titulo}</div>
                            <a href="#" className="dashboard__stat-link">
                                {stat.enlace} →
                            </a>
                        </div>
                    </article>
                ))}
            </section>

            <section className="dashboard__grid">
                <div className="dashboard__card dashboard__card--solicitudes">
                    <div className="dashboard__card-title">
                        <h2>Mis solicitudes</h2>
                        <a href="#" className="dashboard__card-view">Ver todas →</a>
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

                <div className="dashboard__card">
                    <div className="dashboard__card-title">
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

                    {proximosEventos.slice(0, 3).map((evento) => (
                        <div className="dashboard__event" key={evento.id}>
                            <div className="dashboard__event-title">{evento.nombre}</div>
                            <div className="dashboard__event-time">
                                {new Date(evento.fecha + "T00:00:00").toLocaleDateString("es-CO", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long"
                                })} a las {evento.hora}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="dashboard__card dashboard__card--notificaciones">
                    <div className="dashboard__card-title">
                        <h2>Notificaciones</h2>
                        <a href="#" className="dashboard__card-view">Ver todas →</a>
                    </div>

                    {notificaciones.slice(0, 3).map((notificacion) => (
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
            </section>

            <section className="dashboard__bottom-grid">
                <div className="dashboard__card">
                    <div className="dashboard__card-title">
                        <h2>Accesos rápidos</h2>
                    </div>

                    <div className="dashboard__quick-access">
                        {ACCESOS.map((acceso) => (
                            <div className={`dashboard__quick-item ${acceso.clase}`} key={acceso.titulo}>
                                <Icon name={acceso.icono} size={22} />
                                <span>{acceso.titulo}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dashboard__card">
                    <div className="dashboard__card-title">
                        <h2>Actividad reciente</h2>
                        <a href="#" className="dashboard__card-view">Ver toda →</a>
                    </div>

                    {actividades.map((actividad, idx) => (
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
            </section>
        </div>
    );
}

export default Dashboard;
