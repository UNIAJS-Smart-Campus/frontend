import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import "./DashboardLayout.css";

function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        <div className={collapsed ? "app app--collapsed" : "app"}>
            <Sidebar collapsed={collapsed} />

            <div className="app__main">
                <Navbar onToggle={() => setCollapsed(!collapsed)} />

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