import { useMemo, useState } from "react";
import useAuth from "../../context/useAuth";
import Icon from "../../components/Icon/Icon";
import DonutChart from "../../components/DonutChart/DonutChart";
import TrendChart from "../../components/TrendChart/TrendChart";
import construirReportes from "../../utils/reportes";
import "./Reportes.css";

const PALETA = [
    "#025E73",
    "#F2B705",
    "#10B981",
    "#8B5CF6",
    "#EF4444",
    "#14B8A6",
    "#F59E0B",
    "#6366F1",
];

// Cuántos meses mostrar según el período seleccionado
const PERIODO_PUNTOS = {
    "Este mes":        1,
    "Últimos 3 meses": 3,
    "Último año":      12,
};

function Reportes() {
    const { user } = useAuth();
    const datos = useMemo(
        () => construirReportes(user?.rol, user?.id),
        [user?.rol, user?.id]
    );
    const [periodo, setPeriodo] = useState("Último año");

    const maxPoints = PERIODO_PUNTOS[periodo] ?? 12;

    const alcance = datos.alcance;

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

    const usuariosPorRol       = colorear(datos.usuariosPorRol);
    const reservasPorEstado    = colorear(datos.reservasPorEstado);
    const pqrsPorTipo          = colorear(datos.pqrsPorTipo);
    const solicitudesPorEstado = colorear(datos.solicitudesPorEstado);
    const recursosPorTipo      = colorear(datos.recursosPorTipo);
    const eventosPorCategoria  = colorear(datos.eventosPorCategoria);

    // Máximo calculado una sola vez fuera del render
    const maxEventos = Math.max(1, ...eventosPorCategoria.map((f) => f.total));

    return (
        <div className="page">
            {/* ── ENCABEZADO ── */}
            <div className="page__header reportes__header">
                <div className="page__title reportes__intro">
                    <span className="reportes__eyebrow">UAJS Smart Campus</span>
                    <h1>{alcance === "personal" ? "Mi reporte" : "Reporte institucional"}</h1>
                    <p>
                        {alcance === "personal"
                            ? "Indicadores de tu actividad en el campus generados el el"
                            : "Indicadores del campus generados el "}
                        <strong>{fechaGeneracion}</strong>.
                    </p>
                </div>

                <div className="page__actions reportes__actions">
                    <div className="reportes__period-wrap">
                        <Icon name="eventos" size={13} className="reportes__period-icon" />
                        <select
                            className="reportes__period"
                            value={periodo}
                            onChange={(e) => setPeriodo(e.target.value)}
                        >
                            <option>Este mes</option>
                            <option>Últimos 3 meses</option>
                            <option>Último año</option>
                        </select>
                    </div>

                    <button
                        className="button button--outline button--md"
                        onClick={() => window.print()}
                    >
                        <Icon name="reportes" size={15} />
                        Exportar
                    </button>
                </div>
            </div>

            {/* ── KPIs ── */}
            <section className="summary">
                {datos.kpis.map((kpi) => (
                    <article className="summary__card" key={kpi.etiqueta}>
                        <div
                            className="summary__icon"
                            style={{
                                background: kpi.direccion === "up"
                                    ? "linear-gradient(135deg,#e8f4ff,#d4eaff)"
                                    : "linear-gradient(135deg,#fff0f0,#ffe0e0)",
                                color: kpi.direccion === "up"
                                    ? "var(--color-primary-600)"
                                    : "var(--color-danger)"
                            }}
                        >
                            <Icon name={kpi.icono} size={18} />
                        </div>
                        <div>
                            <div className="summary__number">{kpi.valor}</div>
                            <div className="summary__label">{kpi.etiqueta}</div>
                        </div>
                        <span className={`reportes__kpi-trend reportes__kpi-trend--${kpi.direccion}`}>
                            {kpi.direccion === "up" ? "▲" : "▼"} {kpi.tendencia}
                        </span>
                    </article>
                ))}
            </section>

            {/* ── STRIP DE TOTALES ── */}
            <section className="reportes__stats-strip">
                {[
                    { label: "Solicitudes", value: datos.totales.solicitudes },
                    { label: "Reservas",    value: datos.totales.reservas    },
                    { label: "Recursos",    value: datos.totales.recursos    },
                    { label: "Servicios",   value: datos.serviciosDisponibles },
                    { label: "Usuarios",    value: datos.totales.usuarios    },
                    { label: "PQRS",        value: datos.totales.pqrs        },
                    { label: "Eventos",     value: datos.totales.eventos     },
                ].map(({ label, value }) => (
                    <div className="reportes__stat" key={label}>
                        <span className="reportes__stat-label">{label}</span>
                        <span className="reportes__stat-value">{value}</span>
                    </div>
                ))}
            </section>

            {/* ── TENDENCIA MENSUAL ── */}
            <article className="card">
                <div className="card__header">
                    <h2 className="reportes__card-title">
                        <span className="reportes__card-icon reportes__card-icon--blue">
                            <Icon name="solicitudes" size={16} />
                        </span>
                        Tendencia mensual de solicitudes y reservas
                        <span className="reportes__card-period">{periodo}</span>
                    </h2>
                </div>
                <div className="reportes__body">
                    <TrendChart
                        data={datos.tendenciaMensual}
                        maxPoints={maxPoints}
                    />
                </div>
            </article>

            {/* ── DONUTS ── */}
            <section className="reportes__donuts">
                {alcance === "global" && (
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
                                        <span className="reportes__leyenda-dot" style={{ background: item.color }} />
                                        <span className="reportes__leyenda-nombre">{item.nombre}</span>
                                        <span className="reportes__leyenda-valor">{item.total}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </article>
                )}

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
                                    <span className="reportes__leyenda-dot" style={{ background: item.color }} />
                                    <span className="reportes__leyenda-nombre">{item.nombre}</span>
                                    <span className="reportes__leyenda-valor">{item.total}</span>
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
                                    <span className="reportes__leyenda-dot" style={{ background: item.color }} />
                                    <span className="reportes__leyenda-nombre">{item.nombre}</span>
                                    <span className="reportes__leyenda-valor">{item.total}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </article>
            </section>

            {/* ── BARRAS HORIZONTALES: Solicitudes + Recursos ── */}
            <section className="reportes__grid">
                {[
                    { titulo: "Solicitudes por estado", icono: "solicitudes", color: "blue",  filas: solicitudesPorEstado },
                    { titulo: "Recursos por tipo",      icono: "recursos",    color: "green", filas: recursosPorTipo      },
                ].map((grafica) => {
                    const maximo = Math.max(1, ...grafica.filas.map((f) => f.total));
                    return (
                        <article className="card" key={grafica.titulo}>
                            <div className="card__header">
                                <h2 className="reportes__card-title">
                                    <span className={`reportes__card-icon reportes__card-icon--${grafica.color}`}>
                                        <Icon name={grafica.icono} size={16} />
                                    </span>
                                    {grafica.titulo}
                                </h2>
                            </div>
                            <div className="reportes__rows">
                                {grafica.filas.map((fila) => (
                                    <div className="reportes__row" key={fila.nombre}>
                                        <span className="reportes__row-label">{fila.nombre}</span>
                                        <div className="reportes__bar-track">
                                            <div
                                                className="reportes__bar"
                                                style={{
                                                    width: `${(fila.total / maximo) * 100}%`,
                                                    background: fila.color
                                                }}
                                            />
                                        </div>
                                        <span className="reportes__row-value">{fila.total}</span>
                                    </div>
                                ))}
                            </div>
                        </article>
                    );
                })}
            </section>

            {/* ── PANELS: Ranking + Eventos (2 columnas) ── */}
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
                            <div className="reportes__rank" key={item.nombre}>
                                <span className="reportes__rank-pos">{indice + 1}</span>
                                <span className="reportes__rank-name">{item.nombre}</span>
                                <span className="reportes__rank-count">{item.total} reservas</span>
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
                        {eventosPorCategoria.map((fila) => (
                            <div className="reportes__row" key={fila.nombre}>
                                <span className="reportes__row-label">{fila.nombre}</span>
                                <div className="reportes__bar-track">
                                    <div
                                        className="reportes__bar"
                                        style={{
                                            width: `${(fila.total / maxEventos) * 100}%`,
                                            background: fila.color
                                        }}
                                    />
                                </div>
                                <span className="reportes__row-value">{fila.total}</span>
                            </div>
                        ))}
                    </div>
                </article>
            </section>
        </div>
    );
}

export default Reportes;
