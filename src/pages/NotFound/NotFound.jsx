import { Link } from "react-router-dom";
import Button from "../../components/Button/Button";
import "./NotFound.css";

function NotFound() {
    return (
        <div className="notfound">
            <p className="notfound__code">404</p>

            <h1 className="notfound__title">
                Página no encontrada
            </h1>

            <p className="notfound__text">
                La dirección que buscas no existe o fue movida. Verifica el
                enlace o vuelve al panel principal.
            </p>

            <div className="notfound__actions">
                <Link to="/dashboard" className="notfound__link">
                    <Button variant="primary" size="md">
                        Volver al panel
                    </Button>
                </Link>

                <Link to="/login" className="notfound__link">
                    <Button variant="outline" size="md">
                        Iniciar sesión
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default NotFound;