import { useState } from "react";
import Input from "../../components/Input/Input";
import ServiceCard from "../../components/ServiceCard/ServiceCard";
import useSearch from "../../hooks/useSearch";
import services from "../../utils/services";
import "./Dashboard.css";

const indicators = [
    {
        label: "Solicitudes pendientes",
        value: 12,
        icon: "📋"
    },
    {
        label: "Reservas realizadas",
        value: 34,
        icon: "📅"
    },
    {
        label: "Notificaciones no leídas",
        value: 5,
        icon: "🔔"
    },
    {
        label: "Eventos próximos",
        value: 8,
        icon: "🎉"
    }
];

function Dashboard() {
    const [query, setQuery] = useState("");

    const filteredServices = useSearch(
        services,
        query,
        ["name", "category", "description"]
    );

    return (
        <div className="dashboard">
            <header className="dashboard__header">
                <h1 className="dashboard__title">Dashboard</h1>
                <p className="dashboard__subtitle">
                    Bienvenido a UAJS Smart Campus. Consulta tus servicios y
                    gestiona tus actividades.
                </p>
            </header>

            <section className="dashboard__indicators">
                {indicators.map((item) => (
                    <article className="dashboard__widget" key={item.label}>
                        <span className="dashboard__widget-icon">{item.icon}</span>
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
                <Input
                    type="search"
                    placeholder="Buscar servicio por nombre o categoría…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    id="dashboard-search"
                />
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