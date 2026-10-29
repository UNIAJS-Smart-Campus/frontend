import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";

const Landing = lazy(() => import("../pages/Landing/Landing"));
const Login = lazy(() => import("../pages/Login/Login"));
const Recuperar = lazy(() => import("../pages/Recuperar/Recuperar"));
const Servicio = lazy(() => import("../pages/Servicio/Servicio"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const Solicitudes = lazy(() => import("../pages/Solicitudes/Solicitudes"));
const SolicitudDetalle = lazy(() => import("../pages/Solicitudes/SolicitudDetalle"));
const Reservas = lazy(() => import("../pages/Reservas/Reservas"));
const Recursos = lazy(() => import("../pages/Recursos/Recursos"));
const Eventos = lazy(() => import("../pages/Eventos/Eventos"));
const Notificaciones = lazy(() => import("../pages/Notificaciones/Notificaciones"));
const Perfil = lazy(() => import("../pages/Perfil/Perfil"));
const Configuracion = lazy(() => import("../pages/Configuracion/Configuracion"));
const PQRS = lazy(() => import("../pages/PQRS/PQRS"));
const NuevaPQRS = lazy(() => import("../pages/PQRS/NuevaPQRS/NuevaPQRS"));
const Usuarios = lazy(() => import("../pages/Usuarios/Usuarios"));
const Reportes = lazy(() => import("../pages/Reportes/Reportes"));
const InfoAcademica = lazy(() => import("../pages/InfoAcademica/InfoAcademica"));
const Servicios = lazy(() => import("../pages/Servicios/Servicios"));

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div role="status" aria-live="polite">
          Cargando UAJS Smart Campus...
        </div>
      }>
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
            path="/servicios"
            element={
              <ProtectedRoute>
                <Servicios />
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
              <ProtectedRoute permiso="solicitudes">
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
          <Route
            path="/info-academica"
            element={
              <ProtectedRoute permiso="info_academica">
                <InfoAcademica />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
