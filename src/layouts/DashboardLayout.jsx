import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import "./DashboardLayout.css";

function DashboardLayout() {
    return (
        <div className="app">
            <Sidebar />

            <div className="app__main">
                <Navbar />

                <main className="app__content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;