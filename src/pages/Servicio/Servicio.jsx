import { Link, useParams } from "react-router-dom";
import Button from "../../components/Button/Button";
import services from "../../utils/services";
import "./Servicio.css";

function Servicio() {
    const { nombre } = useParams();

    const service = services.find(
        (item) => item.name.toLowerCase() === nombre.toLowerCase()
    );

    if (!service) {
        return (
            <div className="servicio">
                <h1 className="servicio__title">Servicio no encontrado</h1>
                <p className="servicio__subtitle">
                    El servicio que buscas no existe.
                </p>
                <Link to="/dashboard">
                    <Button variant="primary">Volver al Dashboard</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="servicio">
            <header className="servicio__header">
                <Link to="/dashboard" className="servicio__back">
                    ← Volver a servicios
                </Link>

                <div className="servicio__brand">
                    <span className="servicio__icon">{service.icon}</span>
                    <div>
                        <span className="servicio__category">{service.category}</span>
                        <h1 className="servicio__title">{service.name}</h1>
                    </div>
                </div>

                <p className="servicio__description">{service.description}</p>
            </header>

            <div className="servicio__columns">
                <section className="servicio__card">
                    <h2 className="servicio__card-title">Recursos disponibles</h2>

                    <ul className="servicio__list">
                        {service.resources.map((resource) => (
                            <li className="servicio__item" key={resource}>
                                {resource}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="servicio__card">
                    <h2 className="servicio__card-title">Opciones del servicio</h2>

                    <ul className="servicio__list">
                        {service.options.map((option) => (
                            <li className="servicio__item" key={option}>
                                {option}
                            </li>
                        ))}
                    </ul>

                    <Link to={service.path} className="servicio__action">
                        <Button variant="primary" size="lg">
                            Ir al módulo de {service.name}
                        </Button>
                    </Link>
                </section>
            </div>
        </div>
    );
}

export default Servicio;