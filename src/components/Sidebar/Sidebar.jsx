import { NavLink } from "react-router-dom";
import menuSections from "../../utils/menu";
import useAuth from "../../context/useAuth";
import "./Sidebar.css";

function Sidebar({ collapsed }) {
  const { tienePermiso } = useAuth();

  const seccionesVisibles = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.permiso || tienePermiso(item.permiso))
    }))
    .filter((section) => section.items.length > 0);

  const classes = collapsed
    ? "sidebar sidebar--collapsed"
    : "sidebar";

  return (
    <nav className={classes}>
      <div className="sidebar__brand">
        <span className="sidebar__logo">U</span>
        <h2 className="sidebar__title">UAJS Smart Campus</h2>
      </div>

      <div className="sidebar__menu">
        {seccionesVisibles.map((section) => (
          <div className="sidebar__section" key={section.label}>
            <span className="sidebar__section-label">
              {section.label}
            </span>

            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? "sidebar__item sidebar__item--active"
                    : "sidebar__item"
                }
              >
                <span className="sidebar__icon">{item.icon}</span>
                <span className="sidebar__item-name">{item.name}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <footer className="sidebar__footer">
        <span className="sidebar__version">UAJS Smart Campus v0.1</span>
      </footer>
    </nav>
  );
}

export default Sidebar;
