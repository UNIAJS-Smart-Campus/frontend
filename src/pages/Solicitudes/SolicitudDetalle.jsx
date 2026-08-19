import { Link, useParams } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { ESTADOS_SOLICITUD } from "../../utils/solicitudes";
import solicitudes from "../../utils/solicitudes";
import "./SolicitudDetalle.css";

function SolicitudDetalle() {
    const { id } = useParams();

    const solicitud = solicitudes.find((item) => item.id === id);

    if (!solicitud) {
        return (
            <div className="solicitud-detalle">
                <h1 className="solicitud-detalle__title">
                    Solicitud no encontrada
                </h1>
                <Link to="/solicitudes" className="solicitud-detalle__back">
                    ← Volver a solicitudes
                </Link>
            </div>
        );
    }

    const estadosAlcanzados = solicitud.historial.map((item) => item.estado);

    return (
        <div className="solicitud-detalle">
            <Link to="/solicitudes" className="solicitud-detalle__back">
                ← Volver a solicitudes
            </Link>

            <header className="solicitud-detalle__header">
                <div className="solicitud-detalle__top">
                    <h1 className="solicitud-detalle__numero">{solicitud.id}</h1>
                    <StatusBadge estado={solicitud.estado} />
                </div>

                <h2 className="solicitud-detalle__tipo">{solicitud.tipo}</h2>

                <p className="solicitud-detalle__descripcion">
                    {solicitud.descripcion}
                </p>

                <div className="solicitud-detalle__meta">
                    <div className="solicitud-detalle__meta-item">
                        <span className="solicitud-detalle__meta-label">Solicitante</span>
                        <span className="solicitud-detalle__meta-value">{solicitud.solicitante}</span>
                    </div>

                    <div className="solicitud-detalle__meta-item">
                        <span className="solicitud-detalle__meta-label">Servicio</span>
                        <span className="solicitud-detalle__meta-value">{solicitud.servicio}</span>
                    </div>

                    <div className="solicitud-detalle__meta-item">
                        <span className="solicitud-detalle__meta-label">Fecha de solicitud</span>
                        <span className="solicitud-detalle__meta-value">{solicitud.fecha}</span>
                    </div>
                </div>
            </header>

            <section className="solicitud-detalle__timeline">
                <h3 className="solicitud-detalle__timeline-title">
                    Evolución del estado
                </h3>

                <ol className="solicitud-detalle__steps">
                    {ESTADOS_SOLICITUD.map((estado) => {
                        const alcanzado = estadosAlcanzados.includes(estado);
                        const esActual = estado === solicitud.estado;

                        let clase = "solicitud-detalle__step";
                        if (alcanzado) clase += " solicitud-detalle__step--done";
                        if (esActual) clase += " solicitud-detalle__step--current";

                        const paso = solicitud.historial.find(
                            (item) => item.estado === estado
                        );

                        return (
                            <li className={clase} key={estado}>
                                <div className="solicitud-detalle__step-marker">
                                    {alcanzado ? "✓" : ""}
                                </div>

                                <div className="solicitud-detalle__step-body">
                                    <strong className="solicitud-detalle__step-name">
                                        {estado}
                                    </strong>

                                    {paso && (
                                        <>
                                            <span className="solicitud-detalle__step-date">
                                                {paso.fecha}
                                            </span>
                                            <p className="solicitud-detalle__step-detail">
                                                {paso.detalle}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </section>
        </div>
    );
}

export default SolicitudDetalle;