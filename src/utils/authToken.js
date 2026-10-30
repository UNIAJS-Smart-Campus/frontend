const TOKEN_KEY = "uajs_token";
const SESSION_KEY = "uajs_session";

/**
 * Token de la sesión.
 *
 * El login guarda la sesión completa en `uajs_session`; durante un tiempo
 * `uajs_token` quedó sin escribir, así que Socket.IO nunca recibía token.
 * Se mantiene `uajs_token` como fuente principal y se cae a la sesión para
 * sesiones creadas antes de este cambio.
 */
export function getToken() {
    try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) return token;

        const sesion = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
        return sesion?.token || null;
    } catch {
        return null;
    }
}

export function setToken(token) {
    try {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    } catch {
        // localStorage no disponible
    }
}

export function clearToken() {
    setToken(null);
}
