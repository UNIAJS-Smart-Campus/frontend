import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import Dashboard from "../pages/Dashboard/Dashboard";
import Solicitudes from "../pages/Solicitudes/Solicitudes";
import Reservas from "../pages/Reservas/Reservas";
import Recursos from "../pages/Recursos/Recursos";
import Eventos from "../pages/Eventos/Eventos";
import Notificaciones from "../pages/Notificaciones/Notificaciones";
import Perfil from "../pages/Perfil/Perfil";
import Configuracion from "../pages/Configuracion/Configuracion";
import PQRS from "../pages/PQRS/PQRS";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/solicitudes" element={<Solicitudes />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/recursos" element={<Recursos />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
          <Route path="/pqrs" element={<PQRS />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;