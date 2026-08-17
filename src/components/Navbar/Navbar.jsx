import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
    return (
        <nav className="navbar">

            <h2 className="navbar__title">
                UAJS Smart Campus
            </h2>

            <div className="navbar__menu">

                <NavLink to="/" className="navbar__item">
                    Dashboard
                </NavLink>

                <NavLink to="/solicitudes" className="navbar__item">
                    Solicitudes
                </NavLink>

                <NavLink to="/reservas" className="navbar__item">
                    Reservas
                </NavLink>

                <NavLink to="/eventos" className="navbar__item">
                    Eventos
                </NavLink>

            </div>

        </nav>
    );
}

export default Navbar;