// ---------------------------------------------------------------------------
// Token de sesión.
// Tras el fix de token, el access JWT viaja en una cookie HttpOnly
// (`access_token`) que el navegador envía automáticamente en cada petición.
// JavaScript NO puede leerla, así que no hay token en localStorage expuesto
// a XSS. Estas utilidades se mantienen como no-op para no romper consumidores
// existentes (RealtimeProvider, código legado).
// ---------------------------------------------------------------------------

const TOKEN_KEY = "uajs_token";

/**
 * Siempre devuelve null: el token no es accesible desde JavaScript (vive en
 * una cookie HttpOnly). Se conserva la firma por compatibilidad.
 */
export function getToken() {
    return null;
}

/**
 * No-op: no hay nada que guardar en localStorage. El navegador gestiona la
 * cookie automáticamente.
 */
export function setToken() {
    // sin operación
}

/**
 * No-op: no hay nada que borrar en localStorage. El logout del servidor
 * borra la cookie (POST /auth/logout).
 */
export function clearToken() {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch {
        // localStorage no disponible
    }
}

export { TOKEN_KEY };
