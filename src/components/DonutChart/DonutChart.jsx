import { useState } from "react";
import "./DonutChart.css";

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

    let acumulado = 0;
    const segmentos = data.map((item, i) => {
        const fraccion = total > 0 ? item.total / total : 0;
        const pct = Math.round(fraccion * 100);
        const segmento = {
            ...item,
            index: i,
            fraccion,
            pct,
            dash: fraccion * circumference,
            offset: acumulado * circumference,
        };
        acumulado += fraccion;
        return segmento;
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
                            className={`donut__segment${hoveredIndex === item.index ? " donut__segment--hovered" : ""}${hoveredIndex !== null && hoveredIndex !== item.index ? " donut__segment--dimmed" : ""}`}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke={item.color}
                            strokeWidth={hoveredIndex === item.index ? thickness + 3 : thickness}
                            strokeDasharray={`${item.dash} ${circumference - item.dash}`}
                            strokeDashoffset={-item.offset}
                            transform={`rotate(-90 ${center} ${center})`}
                            style={{
                                "--donut-delay": `${item.index * 0.08}s`,
                                "--donut-dash": `${item.dash}`,
                                "--donut-circum": `${circumference}`,
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
