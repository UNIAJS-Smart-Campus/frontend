import AppRoutes from "./routes/AppRoutes";
import AuthProvider from "./context/AuthContext";
import RealtimeProvider from "./context/RealtimeProvider";
import { ToastProvider } from "./context/ToastContext";
import FontSizeBootstrap from "./components/FontSizeToggle/FontSizeBootstrap";

function App() {
  return (
    <AuthProvider>
      <RealtimeProvider>
        <ToastProvider>
          <FontSizeBootstrap />
          <AppRoutes />
        </ToastProvider>
      </RealtimeProvider>
    </AuthProvider>
  );
}

export default App;
