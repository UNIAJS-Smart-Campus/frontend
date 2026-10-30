import "./PageLoading.css";

/**
 * Pantalla de carga reutilizable.
 *
 * - variant="screen": ocupa toda la ventana (carga inicial o rutas públicas).
 * - variant="content": ocupa solo el área de contenido del dashboard, así el
 *   sidebar y la navbar siguen visibles al cambiar de módulo.
 *
 * Es un componente presentacional a propósito: los fallbacks de <Suspense> no
 * pueden usar hooks de datos (useNavigation exige un data router).
 */
export default function PageLoading({
    variant = "screen",
    label = "Cargando...",
    hint,
}) {
    return (
        <div
            className={`page-loading page-loading--${variant}`}
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            <div className="page-loading__panel">
                <span className="page-loading__spinner" aria-hidden="true" />
                <p className="page-loading__text">{label}</p>
                {hint ? <p className="page-loading__hint">{hint}</p> : null}
                <span className="page-loading__bar" aria-hidden="true">
                    <span className="page-loading__bar-fill" />
                </span>
            </div>
        </div>
    );
}
