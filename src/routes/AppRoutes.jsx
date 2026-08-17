import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import Dashboard from "../pages/Dashboard/Dashboard";
import Solicitudes from "../pages/Solicitudes/Solicitudes";
import Reservas from "../pages/Reservas/Reservas";
import Eventos from "../pages/Eventos/Eventos";

function AppRoutes() {

  return (
    <BrowserRouter>

      <Routes>

        <Route element={<DashboardLayout />}>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/solicitudes"
            element={<Solicitudes />}
          />

          <Route
            path="/reservas"
            element={<Reservas />}
          />

          <Route
            path="/eventos"
            element={<Eventos />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default AppRoutes;