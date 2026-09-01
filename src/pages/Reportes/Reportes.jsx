import { useMemo, useState } from "react";
import Icon from "../../components/Icon/Icon";
import DonutChart from "../../components/DonutChart/DonutChart";
import TrendChart from "../../components/TrendChart/TrendChart";
import construirReportes from "../../utils/reportes";
import "./Reportes.css";

const PALETA = [
    "#1E5F9F",
    "#F4C400",
    "#10B981",
    "#8B5CF6",
    "#EF4444",
    "#14B8A6",
    "#F59E0B",
    "#6366F1",
];

const PERIODO_MESES = {
    "Este mes": 12,
    "Últimos 3 meses": 3,
    "Último año": 12,
};

function Reportes() {
    const datos = useMemo(() => construirReportes(), []);
    const [periodo, setPeriodo] = useState("Este mes");

    const meses = PERIODO_MESES[periodo] || 1;

    const fechaGeneracion = new Date().toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const colorear = (filas) =>
        filas.map((fila, i) => ({
            ...fila,
            color: PALETA[i % PALETA.length]
        }));

    const usuariosPorRol = colorear(datos.usuariosPorRol);
    const reservasPorEstado = colorear(datos.reservasPorEstado);
    const pqrsPorTipo = colorear(datos.pqrsPorTipo);
    const solicitudesPorEstado = colorear(datos.solicitudesPorEstado);
    const recursosPorTipo = colorear(datos.recursosPorTipo);
    const eventosPorCategoria = colorear(datos.eventosPorCategoria);

    const graphCards = [
        {
            titulo: "Solicitudes por estado",
            icono: "solicitudes",
            filas: solicitudesPorEstado
        },
        {
            titulo: "Recursos por tipo",
            icono: "recursos",
            filas: recursosPorTipo
        }
    ];

    return (
        <div className="page">
            <div className="page__header reportes__header">
                <div className="page__title reportes__intro">
                    <span className="reportes__eyebrow">UAJS Smart Campus</span>
                    <h1>Reporte institucional</h1>
                    <p>
                        Indicadores del campus generados el{" "}
                        <strong>{fechaGeneracion}</strong>.
                    </p>
                </div>

                <div className="page__actions reportes__actions">
                    <select
                        className="reportes__period"
                        value={periodo}
                        onChange={(e) => setPeriodo(e.target.value)}
                    >
                        <option>Este mes</option>
                        <option>Últimos 3 meses</option>
                        <option>Último año</option>
                    </select>

                    <button
                        className="button button--outline button--md"
                        onClick={() => window.print()}
                    >
                        <Icon name="reportes" size={15} />
                        Exportar reporte
                    </button>
                </div>
            </div>

            <section className="summary">
                {datos.kpis.map((kpi) => (
                    <article className="summary__card" key={kpi.etiqueta}>
                        <div className="summary__icon">
                            <Icon name={kpi.icono} size={20} />
                        </div>
                        <div>
                            <div className="summary__number">{kpi.valor}</div>
                            <div className="summary__label">{kpi.etiqueta}</div>
                        </div>
                        <span
                            className={`reportes__kpi-trend reportes__kpi-trend--${kpi.direccion}`}
                        >
                            {kpi.direccion === "up" ? "▲" : "▼"} {kpi.tendencia}
                        </span>
                    </article>
                ))}
            </section>

            <section className="reportes__stats-strip">
                <div className="reportes__stat">
                    <span className="reportes__stat-label">Solicitudes</span>
                    <span className="reportes__stat-value">
                        {datos.totales.solicitudes}
                    </span>
                </div>
                <div className="reportes__stat">
                    <span className="reportes__stat-label">Reservas</span>
                    <span className="reportes__stat-value">
                        {datos.totales.reservas}
                    </span>
                </div>
                <div className="reportes__stat">
                    <span className="reportes__stat-label">Recursos</span>
                    <span className="reportes__stat-value">
                        {datos.totales.recursos}
                    </span>
                </div>
                <div className="reportes__stat">
                    <span className="reportes__stat-label">Servicios</span>
                    <span className="reportes__stat-value">
                        {datos.serviciosDisponibles}
                    </span>
                </div>
                <div className="reportes__stat">
                    <span className="reportes__stat-label">Usuarios</span>
                    <span className="reportes__stat-value">
                        {datos.totales.usuarios}
                    </span>
                </div>
                <div className="reportes__stat">
                    <span className="reportes__stat-label">PQRS</span>
                    <span className="reportes__stat-value">
                        {datos.totales.pqrs}
                    </span>
                </div>
                <div className="reportes__stat">
                    <span className="reportes__stat-label">Eventos</span>
                    <span className="reportes__stat-value">
                        {datos.totales.eventos}
                    </span>
                </div>
            </section>

            <article className="card">
                <div className="card__header">
                    <h2 className="reportes__card-title">
                        <span className="reportes__card-icon reportes__card-icon--blue">
                            <Icon name="solicitudes" size={16} />
                        </span>
                        Tendencia mensual de solicitudes y reservas
                    </h2>
                </div>
                <div className="reportes__body">
                    <TrendChart
                        data={datos.tendenciaMensual}
                        maxPoints={meses}
                    />
                </div>
            </article>

            <section className="reportes__donuts">
                <article className="card">
                    <div className="card__header">
                        <h2 className="reportes__card-title">
                            <span className="reportes__card-icon reportes__card-icon--purple">
                                <Icon name="usuarios" size={16} />
                            </span>
                            Usuarios por rol
                        </h2>
                    </div>
                    <div className="reportes__donut-body">
                        <DonutChart data={usuariosPorRol} centerLabel="Usuarios" />
                        <ul className="reportes__leyenda">
                            {usuariosPorRol.map((item) => (
                                <li className="reportes__leyenda-item" key={item.nombre}>
                                    <span
                                        className="reportes__leyenda-dot"
                                        style={{ background: item.color }}
                                    />
                                    <span className="reportes__leyenda-nombre">
                                        {item.nombre}
                                    </span>
                                    <span className="reportes__leyenda-valor">
                                        {item.total}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </article>

                <article className="card">
                    <div className="card__header">
                        <h2 className="reportes__card-title">
                            <span className="reportes__card-icon reportes__card-icon--blue">
                                <Icon name="reservas" size={16} />
                            </span>
                            Reservas por estado
                        </h2>
                    </div>
                    <div className="reportes__donut-body">
                        <DonutChart data={reservasPorEstado} centerLabel="Reservas" />
                        <ul className="reportes__leyenda">
                            {reservasPorEstado.map((item) => (
                                <li className="reportes__leyenda-item" key={item.nombre}>
                                    <span
                                        className="reportes__leyenda-dot"
                                        style={{ background: item.color }}
                                    />
                                    <span className="reportes__leyenda-nombre">
                                        {item.nombre}
                                    </span>
                                    <span className="reportes__leyenda-valor">
                                        {item.total}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </article>

                <article className="card">
                    <div className="card__header">
                        <h2 className="reportes__card-title">
                            <span className="reportes__card-icon reportes__card-icon--purple">
                                <Icon name="pqrs" size={16} />
                            </span>
                            PQRS por tipo
                        </h2>
                    </div>
                    <div className="reportes__donut-body">
                        <DonutChart data={pqrsPorTipo} centerLabel="PQRS" />
                        <ul className="reportes__leyenda">
                            {pqrsPorTipo.map((item) => (
                                <li className="reportes__leyenda-item" key={item.nombre}>
                                    <span
                                        className="reportes__leyenda-dot"
                                        style={{ background: item.color }}
                                    />
                                    <span className="reportes__leyenda-nombre">
                                        {item.nombre}
                                    </span>
                                    <span className="reportes__leyenda-valor">
                                        {item.total}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </article>
            </section>

            <section className="reportes__grid">
                {graphCards.map((grafica) => {
                    const maximo = Math.max(
                        1,
                        ...grafica.filas.map((fila) => fila.total)
                    );

                    return (
                        <article
                            className="card"
                            key={grafica.titulo}
                        >
                            <div className="card__header">
                                <h2 className="reportes__card-title">
                                    <span
                                        className={`reportes__card-icon reportes__card-icon--${
                                            grafica.titulo.includes("Recursos")
                                                ? "green"
                                                : "blue"
                                        }`}
                                    >
                                        <Icon name={grafica.icono} size={16} />
                                    </span>
                                    {grafica.titulo}
                                </h2>
                            </div>

                            <div className="reportes__rows">
                                {grafica.filas.map((fila) => (
                                    <div
                                        className="reportes__row"
                                        key={fila.nombre}
                                    >
                                        <span className="reportes__row-label">
                                            {fila.nombre}
                                        </span>

                                        <div className="reportes__bar-track">
                                            <div
                                                className="reportes__bar"
                                                style={{
                                                    width: `${(fila.total / maximo) * 100}%`,
                                                    background: fila.color
                                                }}
                                            />
                                        </div>

                                        <span className="reportes__row-value">
                                            {fila.total}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </article>
                    );
                })}
            </section>

            <section className="reportes__panels">
                <article className="card">
                    <div className="card__header">
                        <h2 className="reportes__card-title">
                            <span className="reportes__card-icon reportes__card-icon--orange">
                                <Icon name="recursos" size={16} />
                            </span>
                            Recursos más utilizados
                        </h2>
                    </div>
                    <div className="reportes__ranking">
                        {datos.masUtilizados.map((item, indice) => (
                            <div
                                className="reportes__rank"
                                key={item.nombre}
                            >
                                <span className="reportes__rank-pos">
                                    {indice + 1}
                                </span>
                                <span className="reportes__rank-name">
                                    {item.nombre}
                                </span>
                                <span className="reportes__rank-count">
                                    {item.total} reservas
                                </span>
                            </div>
                        ))}
                        {datos.masUtilizados.length === 0 && (
                            <div className="empty">Sin datos.</div>
                        )}
                    </div>
                </article>

                <article className="card">
                    <div className="card__header">
                        <h2 className="reportes__card-title">
                            <span className="reportes__card-icon reportes__card-icon--orange">
                                <Icon name="eventos" size={16} />
                            </span>
                            Eventos por categoría
                        </h2>
                    </div>
                    <div className="reportes__rows">
                        {eventosPorCategoria.map((fila) => {
                            const maximo = Math.max(
                                1,
                                ...eventosPorCategoria.map((f) => f.total)
                            );
                            return (
                                <div
                                    className="reportes__row"
                                    key={fila.nombre}
                                >
                                    <span className="reportes__row-label">
                                        {fila.nombre}
                                    </span>
                                    <div className="reportes__bar-track">
                                        <div
                                            className="reportes__bar"
                                            style={{
                                                width: `${(fila.total / maximo) * 100}%`,
                                                background: fila.color
                                            }}
                                        />
                                    </div>
                                    <span className="reportes__row-value">
                                        {fila.total}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </article>
            </section>
        </div>
    );
}

export default Reportes;
