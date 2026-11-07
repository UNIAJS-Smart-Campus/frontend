import { Component } from "react";
import "./ErrorBoundary.css";

/**
 * Límite de error de React: si un componente lanza durante el render,
 * en vez de dejar la pantalla en blanco muestra un fallback con opciones
 * de recuperación.
 *
 * Dos variantes (mismas convenciones que PageLoading):
 * - variant="content": embebido en el área de contenido. El sidebar y la
 *   navbar siguen visibles, así el usuario puede navegar a otro módulo.
 * - variant="screen": pantalla completa, última línea de defensa (se usa
 *   fuera de los routers, donde ya no hay navegación disponible).
 *
 * `resetKey` (p. ej. location.pathname) limpia el error automáticamente
 * cuando el usuario cambia de ruta, sin tener que pulsar "Reintentar".
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null, detalle: "" };
        this.reintentar = this.reintentar.bind(this);
    }

    static getDerivedStateFromError(error) {
        // Durante el render se cambia al fallback; el detalle se recoge
        // en componentDidCatch.
        return { error };
    }

    componentDidCatch(error, info) {
        this.setState({
            detalle: (info && info.componentStack) || ""
        });
    }

    componentDidUpdate(prevProps) {
        if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
            this.reintentar();
        }
    }

    reintentar() {
        this.setState({ error: null, detalle: "" });
    }

    render() {
        const { error, detalle } = this.state;
        const { variant = "content", children } = this.props;

        if (!error) return children;

        const esPantallaCompleta = variant === "screen";

        return (
            <div className={`error-boundary error-boundary--${variant}`} role="alert">
                <div className="error-boundary__panel">
                    <span className="error-boundary__icon" aria-hidden="true">
                        !
                    </span>

                    <h2 className="error-boundary__title">
                        {esPantallaCompleta
                            ? "No se pudo iniciar la aplicación"
                            : "Este módulo no cargó correctamente"}
                    </h2>

                    <p className="error-boundary__hint">
                        {esPantallaCompleta
                            ? "Ocurrió un error inesperado al arrancar. Recarga la página para volver a intentarlo."
                            : "Ocurrió un error inesperado al mostrar esta sección. Tus datos no se vieron afectados: puedes reintentar o volver al inicio."}
                    </p>

                    <div className="error-boundary__actions">
                        <button
                            type="button"
                            className="button button--primary button--md"
                            onClick={this.reintentar}
                        >
                            Reintentar
                        </button>
                        <button
                            type="button"
                            className="button button--outline button--md"
                            onClick={() => window.location.assign("/")}
                        >
                            Volver al inicio
                        </button>
                        {esPantallaCompleta ? (
                            <button
                                type="button"
                                className="button button--outline button--md"
                                onClick={() => window.location.reload()}
                            >
                                Recargar
                            </button>
                        ) : null}
                    </div>

                    {error && error.message ? (
                        <details className="error-boundary__details">
                            <summary>Detalle técnico</summary>
                            <pre>
                                {String(error.message)}
                                {detalle ? `\n${detalle.trim()}` : ""}
                            </pre>
                        </details>
                    ) : null}
                </div>
            </div>
        );
    }
}

export default ErrorBoundary;
