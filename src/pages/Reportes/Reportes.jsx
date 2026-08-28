import { useMemo, useState } from "react";
import Icon from "../../components/Icon/Icon";
import construirReportes from "../../utils/reportes";
import "./Reportes.css";

function Reportes() {
    const datos = useMemo(() => construirReportes(), []);
    const [periodo, setPeriodo] = useState("Este mes");

    const fechaGeneracion = new Date().toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const graphCards = [
        {
            titulo: "Solicitudes por estado",
            icono: "solicitudes",
            filas: datos.solicitudesPorEstado,
            color: "blue"
        },
        {
            titulo: "Usuarios por rol",
            icono: "usuarios",
            filas: datos.usuariosPorRol,
            color: "purple"
        },
        {
            titulo: "Recursos por tipo",
            icono: "recursos",
            filas: datos.recursosPorTipo,
            color: "green"
        },
        {
            titulo: "Eventos por categoría",
            icono: "eventos",
            filas: datos.eventosPorCategoria,
            color: "orange"
        }
    ];

    return (
        <div className="reportes">
            <div className="reportes__page-header">
                <div className="reportes__page-title">
                    <h1>Reportes de analítica</h1>
                    <p>
                        Indicadores del campus generados el{" "}
                        <strong>{fechaGeneracion}</strong>.
                    </p>
                </div>

                <div className="reportes__header-actions">
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
                        className="reportes__print-button"
                        onClick={() => window.print()}
                    >
                        <Icon name="reportes" size={15} />
                        Exportar reporte
                    </button>
                </div>
            </div>

            <section className="reportes__kpis">
                {datos.kpis.map((kpi) => (
                    <article className="reportes__kpi" key={kpi.etiqueta}>
                        <span className="reportes__kpi-icon">
                            <Icon name={kpi.icono} size={20} />
                        </span>

                        <div className="reportes__kpi-body">
                            <strong className="reportes__kpi-value">
                                {kpi.valor}
                            </strong>
                            <span className="reportes__kpi-label">
                                {kpi.etiqueta}
                            </span>
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

            <section className="reportes__grid">
                {graphCards.map((grafica) => {
                    const maximo = Math.max(
                        1,
                        ...grafica.filas.map((fila) => fila.total)
                    );

                    return (
                        <article
                            className="reportes__card"
                            key={grafica.titulo}
                        >
                            <h2 className="reportes__card-title">
                                <span
                                    className={`reportes__card-icon reportes__card-icon--${grafica.color}`}
                                >
                                    <Icon name={grafica.icono} size={16} />
                                </span>
                                {grafica.titulo}
                            </h2>

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
                                                className={`reportes__bar reportes__bar--${grafica.color}`}
                                                style={{
                                                    width: `${(fila.total / maximo) * 100}%`
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
                <article className="reportes__panel">
                    <h2 className="reportes__card-title">
                        <span className="reportes__card-icon reportes__card-icon--orange">
                            <Icon name="recursos" size={16} />
                        </span>
                        Recursos más utilizados
                    </h2>
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
                            <p className="reportes__empty">Sin datos.</p>
                        )}
                    </div>
                </article>

                <article className="reportes__panel">
                    <h2 className="reportes__card-title">
                        <span className="reportes__card-icon reportes__card-icon--blue">
                            <Icon name="reservas" size={16} />
                        </span>
                        Reservas por estado
                    </h2>
                    <div className="reportes__mini-stats">
                        {datos.reservasPorEstado.map((item) => (
                            <div
                                className="reportes__mini"
                                key={item.nombre}
                            >
                                <span className="reportes__mini-value">
                                    {item.total}
                                </span>
                                <span className="reportes__mini-label">
                                    {item.nombre}
                                </span>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="reportes__panel">
                    <h2 className="reportes__card-title">
                        <span className="reportes__card-icon reportes__card-icon--purple">
                            <Icon name="pqrs" size={16} />
                        </span>
                        PQRS por tipo
                    </h2>
                    <div className="reportes__rows">
                        {datos.pqrsPorTipo.map((fila) => {
                            const maximo = Math.max(
                                1,
                                ...datos.pqrsPorTipo.map((f) => f.total)
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
                                            className="reportes__bar reportes__bar--purple"
                                            style={{
                                                width: `${(fila.total / maximo) * 100}%`
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
