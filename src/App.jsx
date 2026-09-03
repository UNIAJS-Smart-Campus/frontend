import AppRoutes from "./routes/AppRoutes";
import AuthProvider from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import FontSizeBootstrap from "./components/FontSizeToggle/FontSizeBootstrap";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <FontSizeBootstrap />
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
