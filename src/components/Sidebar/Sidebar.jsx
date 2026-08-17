import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <nav className="sidebar">
      <h2 className="sidebar__title">
        UAJS Smart Campus
      </h2>

      <div className="sidebar__menu">
        <NavLink to="/" className="sidebar__item">
          Dashboard
        </NavLink>

        <NavLink to="/solicitudes" className="sidebar__item">
          Solicitudes
        </NavLink>

        <NavLink to="/reservas" className="sidebar__item">
          Reservas
        </NavLink>

        <NavLink to="/recursos" className="sidebar__item">
          Recursos
        </NavLink>

        <NavLink to="/eventos" className="sidebar__item">
          Eventos
        </NavLink>

        <NavLink to="/notificaciones" className="sidebar__item">
          Notificaciones
        </NavLink>

        <NavLink to="/pqrs" className="sidebar__item">
          PQRS
        </NavLink>

        <NavLink to="/perfil" className="sidebar__item">
          Perfil
        </NavLink>

        <NavLink to="/configuracion" className="sidebar__item">
          Configuración
        </NavLink>
      </div>
    </nav>
  );
}

export default Sidebar;