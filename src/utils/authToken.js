const SESSION_KEY = "uajs_session";

/**
 * El token vive dentro de la sesión (`uajs_session`), que es la única
 * fuente de verdad. Antes se leía una clave `uajs_token` que nunca se
 * escribía y por eso el WebSocket se quedaba sin autenticación.
 */
export function getToken() {
    try {
        const sesion = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
        return sesion?.token || null;
    } catch {
        return null;
    }
}

export function setToken(token) {
    try {
        const sesion = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
        if (!sesion) return;
        localStorage.setItem(SESSION_KEY, JSON.stringify({ ...sesion, token: token || null }));
    } catch {
        // localStorage no disponible
    }
}

export function clearToken() {
    setToken(null);
}
