import { useState } from "react";
import "./TrendChart.css";

function TrendChart({ data = [], maxPoints = 12 }) {
    const [tooltip, setTooltip] = useState(null); // { index, x, y, mes, solicitudes, reservas }

    const visibles = data.slice(-maxPoints);
    const maximo = Math.max(
        1,
        ...visibles.map((m) => Math.max(m.solicitudes, m.reservas))
    );

    // Calcular puntos para la línea SVG de tendencia
    const chartH = 180;
    const grupoAncho = 100 / visibles.length;

    const puntosLinea = (campo) =>
        visibles
            .map((m, i) => {
                const x = grupoAncho * i + grupoAncho / 2;
                const y = 100 - (m[campo] / maximo) * 88; // 88% del alto para dejar espacio
                return `${x},${y}`;
            })
            .join(" ");

    return (
        <div className="trend">
            {/* Línea de cuadrícula de referencia */}
            <div className="trend__grid-lines">
                {[0, 25, 50, 75, 100].map((pct) => (
                    <div
                        key={pct}
                        className="trend__grid-line"
                        style={{ bottom: `${pct}%` }}
                    >
                        <span className="trend__grid-label">
                            {Math.round((pct / 100) * maximo)}
                        </span>
                    </div>
                ))}
            </div>

            <div className="trend__chart">
                {/* Líneas de tendencia SVG superpuestas */}
                <svg
                    className="trend__lines-svg"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    {/* Área relleno solicitudes */}
                    <defs>
                        <linearGradient id="gradSolicitudes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#025E73" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#025E73" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="gradReservas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F2B705" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#F2B705" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    <polyline
                        className="trend__line trend__line--solicitudes"
                        points={puntosLinea("solicitudes")}
                        fill="none"
                        stroke="#025E73"
                        strokeWidth="0.8"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />
                    <polyline
                        className="trend__line trend__line--reservas"
                        points={puntosLinea("reservas")}
                        fill="none"
                        stroke="#F2B705"
                        strokeWidth="0.8"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Barras */}
                {visibles.map((mes, i) => (
                    <div
                        className={`trend__group${tooltip?.index === i ? " trend__group--active" : ""}`}
                        key={`${mes.mes}-${i}`}
                        onMouseEnter={(e) => {
                            const rect = e.currentTarget.closest(".trend").getBoundingClientRect();
                            const groupRect = e.currentTarget.getBoundingClientRect();
                            setTooltip({
                                index: i,
                                x: groupRect.left - rect.left + groupRect.width / 2,
                                mes: mes.mes,
                                solicitudes: mes.solicitudes,
                                reservas: mes.reservas,
                            });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                    >
                        <div className="trend__cols">
                            <div className="trend__col-wrap">
                                <span className="trend__col-value trend__col-value--sol">
                                    {mes.solicitudes}
                                </span>
                                <div
                                    className="trend__col trend__col--solicitudes"
                                    style={{ height: `${(mes.solicitudes / maximo) * 100}%` }}
                                />
                            </div>
                            <div className="trend__col-wrap">
                                <span className="trend__col-value trend__col-value--res">
                                    {mes.reservas}
                                </span>
                                <div
                                    className="trend__col trend__col--reservas"
                                    style={{ height: `${(mes.reservas / maximo) * 100}%` }}
                                />
                            </div>
                        </div>
                        <span className="trend__label">{mes.mes}</span>
                    </div>
                ))}

                {/* Tooltip flotante */}
                {tooltip && (
                    <div
                        className="trend__tooltip"
                        style={{ left: tooltip.x }}
                    >
                        <span className="trend__tooltip-mes">{tooltip.mes}</span>
                        <div className="trend__tooltip-row">
                            <span className="trend__tooltip-dot trend__tooltip-dot--sol" />
                            <span className="trend__tooltip-key">Solicitudes</span>
                            <strong>{tooltip.solicitudes}</strong>
                        </div>
                        <div className="trend__tooltip-row">
                            <span className="trend__tooltip-dot trend__tooltip-dot--res" />
                            <span className="trend__tooltip-key">Reservas</span>
                            <strong>{tooltip.reservas}</strong>
                        </div>
                    </div>
                )}
            </div>

            <div className="trend__legend">
                <span className="trend__legend-item trend__legend-item--solicitudes">
                    Solicitudes
                </span>
                <span className="trend__legend-item trend__legend-item--reservas">
                    Reservas
                </span>
            </div>
        </div>
    );
}

export default TrendChart;
