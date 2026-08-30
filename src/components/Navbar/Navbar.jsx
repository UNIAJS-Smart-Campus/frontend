import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import notificaciones from "../../utils/notificaciones";
import { getModuleName } from "../../utils/menu";
import useAuth from "../../context/useAuth";
import useLocalStorage from "../../hooks/useLocalStorage";
import Icon from "../Icon/Icon";
import "./Navbar.css";

const THEME_KEY = "uajs_theme";

function getInitialTheme() {
    try {
        const guardado = localStorage.getItem(THEME_KEY);
        if (guardado === "dark" || guardado === "light") {
            return guardado;
        }
    } catch {
        // si localStorage no está disponible se ignora
    }

    try {
        if (
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
            return "dark";
        }
    } catch {
        // si matchMedia no está disponible se ignora
    }

    return "light";
}

function Navbar({ onToggle }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [theme, setTheme] = useLocalStorage(THEME_KEY, getInitialTheme);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const moduleName = getModuleName(location.pathname);
    const noLeidas = notificaciones.filter((item) => !item.leida).length;

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

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

                <h1 className="navbar__title">{moduleName}</h1>
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
                    <div className="navbar__avatar">
                        {user?.nombre?.charAt(0) ?? "U"}
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
                                {theme === "dark" ? "☀️ Modo claro" : "🌙 Modo oscuro"}
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
