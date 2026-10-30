import { useNavigation } from "react-router-dom";
import "./PageLoading.css";

export default function PageLoading() {
    const navigation = useNavigation();
    const isLoading = navigation.state === "loading";

    if (!isLoading) return null;

    return (
        <div className="page-loading__overlay" role="status" aria-live="polite">
            <div className="page-loading__card">
                <div className="page-loading__spinner"></div>
                <span className="page-loading__text">Cargando módulo...</span>
            </div>
        </div>
    );
}
