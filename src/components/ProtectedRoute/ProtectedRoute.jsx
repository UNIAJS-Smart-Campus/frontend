import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../context/useAuth";

function ProtectedRoute({ children, permiso }) {
    const { user, hydrated, tienePermiso } = useAuth();
    const location = useLocation();

    if (!hydrated) {
        return null; // o un spinner mientras hidrata
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
