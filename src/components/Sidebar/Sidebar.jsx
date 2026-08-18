import { NavLink } from "react-router-dom";
import menuItems from "../../utils/menu";
import "./Sidebar.css";

function Sidebar({ collapsed }) {
  return (
    <nav className={collapsed ? "sidebar sidebar--collapsed" : "sidebar"}>
      <h2 className="sidebar__title">
        UAJS Smart Campus
      </h2>

      <div className="sidebar__menu">
        {menuItems.map((item) => (
          <NavLink key={item.path} to={item.path} className="sidebar__item">
            {item.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default Sidebar;