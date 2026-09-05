import { useState } from "react";
import "./TrendChart.css";

/**
 * TrendChart — barras agrupadas con línea de tendencia SVG superpuesta.
 *
 * Alineación SVG ↔ barras:
 *   El contenedor .trend__chart tiene height fija (CSS: 200px) y
 *   padding-top de BAR_PADDING_TOP px. Las barras viven en .trend__cols
 *   cuya altura útil es:  chartH - BAR_PADDING_TOP - LABEL_H
 *
 *   El SVG cubre exactamente esa misma región:
 *     inset-top    = BAR_PADDING_TOP
 *     inset-bottom = LABEL_H   (altura del label del eje X)
 *     inset-left   = AXIS_W    (ancho reservado para el eje Y)
 *
 *   Con viewBox="0 0 100 100" y preserveAspectRatio="none":
 *     x del punto i = (i + 0.5) / n * 100        → centro del grupo i
 *     y del punto i = (1 - valor/maximo) * 100    → 0 = arriba, 100 = abajo
 *
 *   Así y=0 corresponde al techo de las barras (maximo) y
 *   y=100 corresponde a la base (0), igual que las barras CSS.
 */

// Estos valores DEBEN coincidir con el CSS:
const CHART_H      = 200;  // .trend__chart height
const BAR_PAD_TOP  = 12;   // .trend__chart padding-top
const LABEL_H      = 22;   // altura aproximada del .trend__label + gap
const AXIS_W       = 36;   // .trend__chart padding-left (eje Y)

function TrendChart({ data = [], maxPoints = 12 }) {
    const [tooltip, setTooltip] = useState(null);

    const visibles = data.slice(-maxPoints);
    const n = visibles.length || 1;

    const maximo = Math.max(
        1,
        ...visibles.map((m) => Math.max(m.solicitudes, m.reservas))
    );

    /**
     * Calcula los puntos de la polyline en el espacio viewBox 0-100.
     *   x: centro del grupo i dentro del ancho total
     *   y: altura proporcional, 0 = tope, 100 = base
     */
    const puntosLinea = (campo) =>
        visibles
            .map((m, i) => {
                const x = (i + 0.5) / n * 100;
                const y = (1 - m[campo] / maximo) * 100;
                return `${x.toFixed(2)},${y.toFixed(2)}`;
            })
            .join(" ");

    // Altura útil de la barra en px (para pasar como CSS var al SVG si se necesita)
    const barAreaH = CHART_H - BAR_PAD_TOP - LABEL_H;

    return (
        <div className="trend">
            {/* ── Cuadrícula de referencia (eje Y) ── */}
            <div
                className="trend__grid-lines"
                style={{
                    // Alinear exactamente con la zona de barras
                    top:    BAR_PAD_TOP,
                    bottom: LABEL_H,
                    left:   AXIS_W,
                    right:  0,
                }}
            >
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

            {/* ── Área principal: barras + SVG superpuesto ── */}
            <div className="trend__chart">
                {/*
                  SVG alineado pixel-perfect con el área de barras:
                  - inset-top    = BAR_PAD_TOP  (mismo padding-top que .trend__chart)
                  - inset-bottom = LABEL_H      (deja libre el espacio del label)
                  - inset-left   = AXIS_W       (deja libre el eje Y)
                */}
                <svg
                    className="trend__lines-svg"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    style={{
                        top:    BAR_PAD_TOP,
                        bottom: LABEL_H,
                        left:   AXIS_W,
                        right:  0,
                    }}
                >
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

                {/* ── Grupos de barras ── */}
                {visibles.map((mes, i) => (
                    <div
                        className={`trend__group${tooltip?.index === i ? " trend__group--active" : ""}`}
                        key={`${mes.mes}-${i}`}
                        onMouseEnter={(e) => {
                            const trendRect = e.currentTarget.closest(".trend").getBoundingClientRect();
                            const groupRect = e.currentTarget.getBoundingClientRect();
                            setTooltip({
                                index: i,
                                x: groupRect.left - trendRect.left + groupRect.width / 2,
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

                {/* ── Tooltip flotante ── */}
                {tooltip && (
                    <div
                        className="trend__tooltip"
                        style={{
                            // Clampear para que no se salga en los extremos
                            left: `clamp(65px, ${tooltip.x}px, calc(100% - 65px))`,
                        }}
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

            {/* ── Leyenda ── */}
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
