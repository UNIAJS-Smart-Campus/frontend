import AppRoutes from "./routes/AppRoutes";
import AuthProvider from "./context/AuthContext";
import FontSizeBootstrap from "./components/FontSizeToggle/FontSizeBootstrap";

function App() {
  return (
    <AuthProvider>
      <FontSizeBootstrap />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
