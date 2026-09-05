import { useState } from "react";
import "./DonutChart.css";

/**
 * DonutChart — gráfico de dona SVG con animación por strokeDashoffset.
 *
 * Matemática:
 *   circumference = 2 * π * radius
 *
 *   Para cada segmento i:
 *     dash        = (item.total / total) * circumference   ← longitud del arco
 *     gap         = circumference - dash                   ← espacio invisible
 *     offsetFinal = circumference * (1 - fracAcumuladaAntes)
 *
 *   strokeDasharray  = "dash gap"   → fijo, nunca cambia durante la animación
 *   strokeDashoffset = offsetFinal  → la animación lo lleva de `circumference`
 *                                      (segmento invisible) hasta offsetFinal
 *
 *   El rotate(-90) sobre el centro mueve el punto de inicio a las 12 en punto.
 */
function DonutChart({
    data = [],
    size = 130,
    thickness = 18,
    centerLabel = "Total",
}) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const total = data.reduce((acc, item) => acc + item.total, 0);
    const radius = (size - thickness) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    // Construir segmentos con la matemática correcta
    let fracAcumulada = 0;
    const segmentos = data.map((item, i) => {
        const fraccion   = total > 0 ? item.total / total : 0;
        const pct        = Math.round(fraccion * 100);
        const dash       = fraccion * circumference;
        const gap        = circumference - dash;
        // Offset = circunferencia menos el arco ya consumido por segmentos anteriores.
        // Esto posiciona el inicio de este segmento justo donde terminó el anterior.
        const offsetFinal = circumference * (1 - fracAcumulada);

        fracAcumulada += fraccion;

        return {
            ...item,
            index: i,
            fraccion,
            pct,
            dash,
            gap,
            offsetFinal,
        };
    });

    const hoveredItem = hoveredIndex !== null ? segmentos[hoveredIndex] : null;

    return (
        <div className="donut">
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="donut__svg"
                role="img"
                aria-label="Gráfico de distribución"
            >
                {/* Track de fondo */}
                <circle
                    className="donut__track"
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    strokeWidth={thickness}
                />

                {segmentos
                    .filter((item) => item.total > 0)
                    .map((item) => (
                        <circle
                            key={item.nombre}
                            className={[
                                "donut__segment",
                                hoveredIndex === item.index  ? "donut__segment--hovered" : "",
                                hoveredIndex !== null && hoveredIndex !== item.index ? "donut__segment--dimmed" : "",
                            ].filter(Boolean).join(" ")}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke={item.color}
                            strokeWidth={hoveredIndex === item.index ? thickness + 3 : thickness}
                            // strokeDasharray fijo: el segmento siempre ocupa `dash` px de arco
                            strokeDasharray={`${item.dash} ${item.gap}`}
                            // Valor final del offset — la animación CSS parte de `circumference`
                            // y llega aquí, sin tocar strokeDasharray
                            strokeDashoffset={item.offsetFinal}
                            transform={`rotate(-90 ${center} ${center})`}
                            style={{
                                // Variables para la animación en CSS
                                "--donut-offset-from": circumference,
                                "--donut-offset-to":   item.offsetFinal,
                                "--donut-delay":       `${item.index * 0.08}s`,
                            }}
                            onMouseEnter={() => setHoveredIndex(item.index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <title>{`${item.nombre}: ${item.total} (${item.pct}%)`}</title>
                        </circle>
                    ))}
            </svg>

            {/* Centro — muestra el item hovereado o el total */}
            <div className="donut__center">
                {hoveredItem ? (
                    <>
                        <span
                            className="donut__center-value donut__center-value--hover"
                            style={{ color: hoveredItem.color }}
                        >
                            {hoveredItem.total}
                        </span>
                        <span className="donut__center-label donut__center-label--hover">
                            {hoveredItem.pct}%
                        </span>
                    </>
                ) : (
                    <>
                        <span className="donut__center-value">{total}</span>
                        <span className="donut__center-label">{centerLabel}</span>
                    </>
                )}
            </div>
        </div>
    );
}

export default DonutChart;
