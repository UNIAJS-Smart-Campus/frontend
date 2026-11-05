import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../context/useAuth";
import PageLoading from "../PageLoading/PageLoading";

function ProtectedRoute({ children, permiso }) {
    const { user, authReady, tienePermiso } = useAuth();
    const location = useLocation();

    if (!authReady) {
        return (
            <PageLoading
                variant="screen"
                label="Validando sesión..."
                hint="Comprobando tus credenciales"
            />
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (permiso && !tienePermiso(permiso)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;
