import { useState } from "react";
import SearchBar from "../../components/SearchBar/SearchBar";
import ServiceCard from "../../components/ServiceCard/ServiceCard";
import Icon from "../../components/Icon/Icon";
import useSearch from "../../hooks/useSearch";
import services from "../../utils/services";
import eventos from "../../utils/eventos";
import "./Dashboard.css";

const indicators = [
    {
        label: "Solicitudes pendientes",
        value: 12,
        icon: "solicitudes"
    },
    {
        label: "Reservas realizadas",
        value: 34,
        icon: "reservas"
    },
    {
        label: "Notificaciones no leídas",
        value: 5,
        icon: "notificaciones"
    },
    {
        label: "Eventos próximos",
        value: eventos.length,
        icon: "eventos"
    }
];

function Dashboard() {
    const [query, setQuery] = useState("");

    const filteredServices = useSearch(
        services,
        query,
        ["name", "category", "description"]
    );

    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    const primerDia = new Date(anioActual, mesActual, 1).getDay();
    const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();

    const eventosPorDia = new Set(
        eventos
            .filter((evento) => {
                const fechaEvento = new Date(evento.fecha + "T00:00:00");
                return (
                    fechaEvento.getMonth() === mesActual &&
                    fechaEvento.getFullYear() === anioActual
                );
            })
            .map((evento) => new Date(evento.fecha + "T00:00:00").getDate())
    );

    const nombreMes = hoy.toLocaleString("es-CO", { month: "long" });
    const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const celdas = [];

    for (let i = 0; i < primerDia; i++) {
        celdas.push(<div className="dashboard__calendar-day dashboard__calendar-day--empty" key={`e-${i}`} />);
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
        const esHoy = dia === hoy.getDate();
        const tieneEvento = eventosPorDia.has(dia);

        celdas.push(
            <div
                className={
                    "dashboard__calendar-day" +
                    (esHoy ? " dashboard__calendar-day--today" : "") +
                    (tieneEvento ? " dashboard__calendar-day--has-event" : "")
                }
                key={dia}
            >
                <span className="dashboard__calendar-day-number">{dia}</span>
                {tieneEvento && <span className="dashboard__calendar-dot" />}
            </div>
        );
    }

    const proximosEventos = eventos
        .filter((evento) => new Date(evento.fecha + "T00:00:00") >= hoy)
        .slice(0, 5);

    return (
        <div className="dashboard">
            <section className="dashboard__indicators">
                {indicators.map((item) => (
                    <article className="dashboard__widget" key={item.label}>
                        <span className="dashboard__widget-icon">
                            <Icon name={item.icon} />
                        </span>
                        <div className="dashboard__widget-info">
                            <strong className="dashboard__widget-value">
                                {item.value}
                            </strong>
                            <span className="dashboard__widget-label">
                                {item.label}
                            </span>
                        </div>
                    </article>
                ))}
            </section>

            <section className="dashboard__search">
                <SearchBar
                    placeholder="Buscar servicio por nombre o categoría…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    id="dashboard-search"
                />
            </section>

            <section className="dashboard__calendar">
                <h2 className="dashboard__calendar-title">
                    {nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)} de {anioActual}
                </h2>

                <div className="dashboard__calendar-body">
                    <div className="dashboard__calendar-grid">
                        {diasSemana.map((dia) => (
                            <div
                                className="dashboard__calendar-day dashboard__calendar-day--header"
                                key={dia}
                            >
                                {dia}
                            </div>
                        ))}
                        {celdas}
                    </div>

                    <aside className="dashboard__calendar-sidebar">
                        <h3 className="dashboard__calendar-section-title">Próximos eventos</h3>
                        {proximosEventos.length > 0 ? (
                            proximosEventos.map((evento) => (
                                <div className="dashboard__calendar-event" key={evento.id}>
                                    <span className="dashboard__calendar-event-date">
                                        {new Date(evento.fecha + "T00:00:00").toLocaleDateString("es-CO", {
                                            day: "numeric",
                                            month: "short"
                                        })}
                                    </span>
                                    <span className="dashboard__calendar-event-name">{evento.nombre}</span>
                                </div>
                            ))
                        ) : (
                            <p className="dashboard__calendar-empty">No hay eventos próximos.</p>
                        )}
                    </aside>
                </div>
            </section>

            <section className="dashboard__services">
                {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                        <ServiceCard key={service.name} service={service} />
                    ))
                ) : (
                    <p className="dashboard__empty">
                        No se encontraron servicios para «{query}».
                    </p>
                )}
            </section>
        </div>
    );
}

export default Dashboard;