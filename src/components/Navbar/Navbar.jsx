import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import notificaciones from "../../utils/notificaciones";
import { getModuleName } from "../../utils/menu";
import useAuth from "../../context/useAuth";
import { useTheme } from "../../context/ThemeContext";
import { getAvatarStyle, getUserInitials, getUserPhoto } from "../../utils/avatar";
import Icon from "../Icon/Icon";
import "./Navbar.css";

function Navbar({ onToggle }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { darkMode, toggleTheme } = useTheme();
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const moduleName = getModuleName(location.pathname);
    const noLeidas = notificaciones.filter((item) => !item.leida).length;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        setDropdownOpen(false);
        logout();
        navigate("/login");
    };

    return (
        <header className="navbar">
            <div className="navbar__left">
                <button className="navbar__menu" onClick={onToggle} aria-label="Alternar menú">
                    ☰
                </button>

                <div className="navbar__module">
                    <span className="navbar__module-kicker">UAJS Smart Campus</span>
                    <h1 className="navbar__title">{moduleName}</h1>
                </div>
            </div>

            <div className="navbar__right">
                <Link to="/notificaciones" className="navbar__notification">
                    <Icon name="notificaciones" size={20} />
                    {noLeidas > 0 && (
                        <span className="navbar__badge">{noLeidas}</span>
                    )}
                </Link>

                <div
                    className="navbar__profile"
                    ref={dropdownRef}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    <div
                        className="navbar__avatar"
                        style={getAvatarStyle(user?.nombre, "linear-gradient(135deg, var(--color-primary), var(--color-primary-600))")}
                        aria-label={user?.nombre || "Usuario"}
                    >
                        {!getUserPhoto() && getUserInitials(user?.nombre, "U")}
                    </div>

                    <div className="navbar__user">
                        <span className="navbar__name">{user?.nombre}</span>
                        <span className="navbar__role">{user?.rol}</span>
                    </div>

                    <button className="navbar__dropdown" aria-label="Opciones de perfil">
                        ▾
                    </button>

                    {dropdownOpen && (
                        <div className="navbar__menu-dropdown">
                            <div className="navbar__dropdown-user">
                                <strong>{user?.nombre}</strong>
                                <span>{user?.correo}</span>
                            </div>

                            <Link
                                to="/perfil"
                                className="navbar__dropdown-item"
                                onClick={() => setDropdownOpen(false)}
                            >
                                 <Icon name="perfil" size={16} /> Ver perfil
                            </Link>

                            <Link
                                to="/configuracion"
                                className="navbar__dropdown-item"
                                onClick={() => setDropdownOpen(false)}
                            >
                                 <Icon name="configuracion" size={16} /> Configuración
                            </Link>

                            <button
                                className="navbar__dropdown-item"
                                onClick={toggleTheme}
                            >
                                {darkMode ? "☀️ Modo claro" : "🌙 Modo oscuro"}
                            </button>

                            <button
                                className="navbar__dropdown-item navbar__dropdown-item--logout"
                                onClick={handleLogout}
                            >
                                🚪 Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;
