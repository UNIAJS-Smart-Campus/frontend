import { useMemo } from "react";
import Button from "../../components/Button/Button";
import Icon from "../../components/Icon/Icon";
import construirReportes from "../../utils/reportes";
import "./Reportes.css";

function Reportes() {
    const datos = useMemo(() => construirReportes(), []);

    const graficas = [
        {
            titulo: "Solicitudes por estado",
            filas: datos.solicitudesPorEstado
        },
        {
            titulo: "Usuarios por rol",
            filas: datos.usuariosPorRol
        },
        {
            titulo: "Recursos por tipo",
            filas: datos.recursosPorTipo
        },
        {
            titulo: "Eventos por categoría",
            filas: datos.eventosPorCategoria
        }
    ];

    return (
        <div className="reportes">
            <header className="reportes__header">
                <Button variant="primary" size="md" onClick={() => window.print()}>
                    🖨️ Imprimir reporte
                </Button>
            </header>

            <p className="reportes__fecha">
                Generado el{" "}
                {new Date().toLocaleDateString("es-CO", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                })}
            </p>

            <section className="reportes__kpis">
                {datos.kpis.map((kpi) => (
                    <article className="reportes__kpi" key={kpi.etiqueta}>
                        <span className="reportes__kpi-icon">
                            <Icon name={kpi.icono} size={24} />
                        </span>

                        <strong className="reportes__kpi-value">
                            {kpi.valor}
                        </strong>

                        <span className="reportes__kpi-label">
                            {kpi.etiqueta}
                        </span>
                    </article>
                ))}
            </section>

            <section className="reportes__grid">
                {graficas.map((grafica) => {
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
                                                className="reportes__bar"
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
        </div>
    );
}

export default Reportes;