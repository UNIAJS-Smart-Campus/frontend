import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";

import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import Recuperar from "../pages/Recuperar/Recuperar";
import Servicio from "../pages/Servicio/Servicio";
import NotFound from "../pages/NotFound/NotFound";

import Dashboard from "../pages/Dashboard/Dashboard";
import Solicitudes from "../pages/Solicitudes/Solicitudes";
import SolicitudDetalle from "../pages/Solicitudes/SolicitudDetalle";
import Reservas from "../pages/Reservas/Reservas";
import Recursos from "../pages/Recursos/Recursos";
import Eventos from "../pages/Eventos/Eventos";
import Notificaciones from "../pages/Notificaciones/Notificaciones";
import Perfil from "../pages/Perfil/Perfil";
import Configuracion from "../pages/Configuracion/Configuracion";
import PQRS from "../pages/PQRS/PQRS";
import NuevaPQRS from "../pages/PQRS/NuevaPQRS/NuevaPQRS";
import Usuarios from "../pages/Usuarios/Usuarios";
import Reportes from "../pages/Reportes/Reportes";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar" element={<Recuperar />} />

        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute permiso="dashboard">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicio/:nombre"
            element={
              <ProtectedRoute>
                <Servicio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/solicitudes"
            element={
              <ProtectedRoute permiso="solicitudes">
                <Solicitudes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/solicitudes/:id"
            element={
              <ProtectedRoute>
                <SolicitudDetalle />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservas"
            element={
              <ProtectedRoute permiso="reservas">
                <Reservas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recursos"
            element={
              <ProtectedRoute permiso="recursos">
                <Recursos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eventos"
            element={
              <ProtectedRoute permiso="eventos">
                <Eventos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notificaciones"
            element={
              <ProtectedRoute permiso="notificaciones">
                <Notificaciones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pqrs"
            element={
              <ProtectedRoute permiso="pqrs">
                <PQRS />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pqrs/nueva"
            element={
              <ProtectedRoute permiso="pqrs">
                <NuevaPQRS />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute permiso="perfil">
                <Perfil />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracion"
            element={
              <ProtectedRoute permiso="configuracion">
                <Configuracion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute permiso="usuarios">
                <Usuarios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reportes"
            element={
              <ProtectedRoute permiso="reportes">
                <Reportes />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;