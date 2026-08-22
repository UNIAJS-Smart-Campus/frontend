<<<<<<< HEAD
import AppRoutes from "./routes/AppRoutes";
import AuthProvider from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
=======
function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--color-text-muted)',
      fontSize: '14px'
    }}>
      Cargando UAJS Smart Campus...
    </div>
  )
>>>>>>> ac5ae9be2c2bd33e4ccb7d1248ef68bfa47a3bec
}

export default App;
