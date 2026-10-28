import AppRoutes from "./routes/AppRoutes";
import AuthProvider from "./context/AuthContext";
import RealtimeProvider from "./context/RealtimeProvider";
import { ToastProvider } from "./context/ToastContext";
import FontSizeBootstrap from "./components/FontSizeToggle/FontSizeBootstrap";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RealtimeProvider>
          <FontSizeBootstrap />
          <AppRoutes />
        </RealtimeProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
