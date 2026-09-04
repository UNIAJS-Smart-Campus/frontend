import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { notificationsApi } from "../../utils/api";
import { getModuleName } from "../../utils/menu";
import useAuth from "../../context/useAuth";
import { useTheme } from "../../context/ThemeContext";
import { getAvatarStyle, getUserInitials, getUserPhoto } from "../../utils/avatar";
import Icon from "../Icon/Icon";
import FontSizeToggle from "../FontSizeToggle/FontSizeToggle";
import "./Navbar.css";

function Navbar({ onToggle }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [noLeidas, setNoLeidas] = useState(0);
    const { darkMode, toggleTheme } = useTheme();
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const moduleName = getModuleName(location.pathname);

    useEffect(() => {
        let cancelado = false;
        const cargar = async () => {
            try {
                const data = await notificationsApi.list(user?.id);
                if (!cancelado) {
                    setNoLeidas(
                        (Array.isArray(data) ? data : []).filter((n) => !n.leida).length
                    );
                }
            } catch {
                if (!cancelado) setNoLeidas(0);
            }
        };
        cargar();
        return () => { cancelado = true; };
    }, [user?.id]);

    useEffect(() => {
        const actualizarBadge = async () => {
            try {
                const data = await notificationsApi.list(user?.id);
                setNoLeidas(
                    (Array.isArray(data) ? data : []).filter((n) => !n.leida).length
                );
            } catch {
                setNoLeidas(0);
            }
        };
        window.addEventListener("storage", actualizarBadge);
        window.addEventListener("notificaciones-actualizadas", actualizarBadge);
        return () => {
            window.removeEventListener("storage", actualizarBadge);
            window.removeEventListener("notificaciones-actualizadas", actualizarBadge);
        };
    }, [user?.id]);

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
                <FontSizeToggle />

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
                        style={getAvatarStyle(user?.nombre, "linear-gradient(135deg, var(--color-primary), var(--color-primary-600))", user?.id)}
                        aria-label={user?.nombre || "Usuario"}
                    >
                        {!getUserPhoto(user?.id) && getUserInitials(user?.nombre, "U")}
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
