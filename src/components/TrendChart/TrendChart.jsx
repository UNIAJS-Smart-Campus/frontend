import "./TrendChart.css";

function TrendChart({ data = [], maxPoints = 12 }) {
    const visibles = data.slice(-maxPoints);
    const maximo = Math.max(
        1,
        ...visibles.map((m) => Math.max(m.solicitudes, m.reservas))
    );

    return (
        <div className="trend">
            <div className="trend__chart">
                {visibles.map((mes, i) => (
                    <div className="trend__group" key={`${mes.mes}-${i}`}>
                        <div className="trend__cols">
                            <div
                                className="trend__col trend__col--solicitudes"
                                title={`Solicitudes ${mes.mes}: ${mes.solicitudes}`}
                                style={{
                                    height: `${(mes.solicitudes / maximo) * 100}%`
                                }}
                            />
                            <div
                                className="trend__col trend__col--reservas"
                                title={`Reservas ${mes.mes}: ${mes.reservas}`}
                                style={{
                                    height: `${(mes.reservas / maximo) * 100}%`
                                }}
                            />
                        </div>
                        <span className="trend__label">{mes.mes}</span>
                    </div>
                ))}
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
