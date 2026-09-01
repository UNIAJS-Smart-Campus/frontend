import "./DonutChart.css";

function DonutChart({
    data = [],
    size = 120,
    thickness = 16,
    centerLabel = "Total",
}) {
    const total = data.reduce((acc, item) => acc + item.total, 0);
    const radius = (size - thickness) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    let acumulado = 0;
    const segmentos = data.map((item) => {
        const fraccion = total > 0 ? item.total / total : 0;
        const segmento = {
            ...item,
            dash: fraccion * circumference,
            offset: acumulado * circumference,
        };
        acumulado += fraccion;
        return segmento;
    });

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
                        className="donut__segment"
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke={item.color}
                        strokeWidth={thickness}
                        strokeDasharray={`${item.dash} ${circumference - item.dash}`}
                        strokeDashoffset={-item.offset}
                        transform={`rotate(-90 ${center} ${center})`}
                    >
                        <title>{`${item.nombre}: ${item.total}`}</title>
                    </circle>
                ))}
            </svg>
            <div className="donut__center">
                <span className="donut__center-value">{total}</span>
                <span className="donut__center-label">{centerLabel}</span>
            </div>
        </div>
    );
}

export default DonutChart;
