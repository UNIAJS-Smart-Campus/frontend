import { NavLink } from "react-router-dom";
import menuSections from "../../utils/menu";
import useAuth from "../../context/useAuth";
import Icon from "../Icon/Icon";
import BrandLogo from "../BrandLogo/BrandLogo";
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
        <BrandLogo className="sidebar__logo" />
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
                <span className="sidebar__icon">
                  <Icon name={item.icon} />
                </span>
                <span className="sidebar__item-name">{item.name}</span>
              </NavLink>
            ))}
          </div>
        ))}

        <footer className="sidebar__footer">
          <span className="sidebar__version">UniAJS v0.4.0</span>
        </footer>
      </div>
    </nav>
  );
}

export default Sidebar;
