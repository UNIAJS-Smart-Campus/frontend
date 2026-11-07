import AppRoutes from "./routes/AppRoutes";
import AuthProvider from "./context/AuthContext";
import RealtimeProvider from "./context/RealtimeProvider";
import { ToastProvider } from "./context/ToastContext";
import FontSizeBootstrap from "./components/FontSizeToggle/FontSizeBootstrap";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

function App() {
  return (
    // Última línea de defensa: si un provider o una ruta pública fallan,
    // se muestra un fallback con opciones de recuperación en vez de una
    // pantalla en blanco.
    <ErrorBoundary variant="screen">
      <AuthProvider>
        <ToastProvider>
          <RealtimeProvider>
            <FontSizeBootstrap />
            <AppRoutes />
          </RealtimeProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
