import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import useAuth from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";
import "./DashboardLayout.css";

function SessionWarning() {
    const { mostrarAviso, cuentaRegresiva, prolongar, logout } = useAuth();
    const { darkMode } = useTheme();
    if (!mostrarAviso) return null;
    return (
        <div className="session-warning-overlay" role="alertdialog" aria-modal="true" data-theme={darkMode ? "dark" : "light"} onClick={() => logout()}>
            <div className="session-warning" onClick={(e) => e.stopPropagation()}>
                <div className="session-warning__icon" aria-hidden="true">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4M12 16h.01" />
                    </svg>
                </div>
                <h2 className="session-warning__title">Tu sesión está por expirar</h2>
                <p className="session-warning__message">Hemos detectado inactividad. Serás desconectado automáticamente por seguridad.</p>
                <div className="session-warning__countdown" aria-live="polite" aria-atomic="true">
                    <span className="session-warning__countdown-label">Cerrando sesión en</span>
                    <strong className="session-warning__countdown-value">{cuentaRegresiva}s</strong>
                </div>
                <div className="session-warning__progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.max(0, Math.min(100, (cuentaRegresiva / 5) * 100))}>
                    <div className="session-warning__progress-bar" style={{ width: `${Math.max(0, Math.min(100, (cuentaRegresiva / 5) * 100))}%` }} data-critical={cuentaRegresiva <= 10} />
                </div>
                <div className="session-warning__actions">
                    <button className="btn btn--ghost session-warning__btn-logout" onClick={() => logout()}>
                        Cerrar sesión
                    </button>
                    <button className="btn btn--primary session-warning__btn-extend" onClick={prolongar}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M12 6v6l4 2" />
                        </svg>
                        Extender
                    </button>
                </div>
            </div>
        </div>
    );
}

const MQ_MOBILE = "(max-width: 768px)";

function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined" && window.matchMedia(MQ_MOBILE).matches
    );
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Sincronizar el estado con el tamaño del viewport (mobile = drawer off-canvas)
    useEffect(() => {
        const mq = window.matchMedia(MQ_MOBILE);
        const handler = (e) => {
            setIsMobile(e.matches);
            if (!e.matches) setSidebarOpen(false);
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    // Cerrar el drawer al navegar
    const [pathAnterior, setPathAnterior] = useState(location.pathname);
    if (location.pathname !== pathAnterior) {
        setPathAnterior(location.pathname);
        setSidebarOpen(false);
    }

    useKeyboardShortcuts({
        onEscape: () => {
            if (sidebarOpen) setSidebarOpen(false);
            document.activeElement?.blur?.();
        }
    });

    const toggleSidebar = () => {
        if (isMobile) {
            setSidebarOpen((v) => !v);
        } else {
            setCollapsed((v) => !v);
        }
    };

    const classes = [
        "app",
        collapsed ? "app--collapsed" : "",
        sidebarOpen ? "app--sidebar-open" : ""
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={classes}>
            <Sidebar
                collapsed={collapsed}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {sidebarOpen && (
                <div
                    className="app__backdrop"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div className="app__main">
                <Navbar onToggle={toggleSidebar} />

                <main className="app__content">
                    <div className="app__content-inner" key={location.pathname}>
                        <Outlet />
                    </div>
                </main>
            </div>
            <SessionWarning />
        </div>
    );
}

export default DashboardLayout;