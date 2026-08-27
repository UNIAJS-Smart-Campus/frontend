import { Link } from "react-router-dom";
import Icon from "../Icon/Icon";
import "./ServiceCard.css";

function ServiceCard({ service }) {
    return (
        <article className="service-card">
            <div className="service-card__header">
                <span className="service-card__icon">
                    <Icon name={service.icon} />
                </span>

                <span className="service-card__category">{service.category}</span>
            </div>

            <h3 className="service-card__title">{service.name}</h3>

            <p className="service-card__description">{service.description}</p>

            <Link
                to={`/servicio/${encodeURIComponent(service.name)}`}
                className="service-card__link"
            >
                Ver detalle →
            </Link>
        </article>
    );
}

export default ServiceCard;