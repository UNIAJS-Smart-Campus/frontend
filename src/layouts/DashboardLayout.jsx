import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import "./DashboardLayout.css";

function DashboardLayout() {
    return (
        <div className="app">

            <Navbar />

            <main className="app__content">
                <Outlet />
            </main>

        </div>
    );
}

export default DashboardLayout;