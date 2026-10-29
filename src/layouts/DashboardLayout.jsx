import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import "./DashboardLayout.css";

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

    // Cerrar el drawer al navegar. Se ajusta durante el render (patrón oficial
    // de React para estado derivado de props) en vez de dentro de un efecto,
    // que provocaba un render extra en cada navegación.
    const [rutaDelDrawer, setRutaDelDrawer] = useState(location.pathname);
    if (rutaDelDrawer !== location.pathname) {
        setRutaDelDrawer(location.pathname);
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
        </div>
    );
}

export default DashboardLayout;