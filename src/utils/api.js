// ============================================================
// Cliente HTTP del API Gateway (http://localhost:3000/api)
// Todos los microservicios responden con { data } en exito y
// { error } en fallo, salvo search-service que usa { success }.
// ============================================================

const API = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export const API_HABILITADA = Boolean(API);

const TIMEOUT_MS = 60000;
let refreshPromise = null;
const RUTAS_SIN_REFRESH = new Set([
    "/auth/login",
    "/auth/register",
    "/auth/recuperar",
    "/auth/restablecer",
    "/auth/refresh"
]);

// El backend corre en el plan free de Render, que suspende el servicio por
// inactividad y tarda ~50 s en despertar con la primera petición. Se lanza un
// ping en segundo plano al cargar el bundle para que el servidor vaya
// arrancando mientras el usuario navega o escribe sus credenciales.
if (API.startsWith("http")) {
    try {
        const origen = new URL(API).origin;
        fetch(`${origen}/`, { cache: "no-store" }).catch(() => {});
    } catch {
        // URL inválida: la app seguirá mostrando el error al llamar a la API.
    }
}

export function getToken() {
    // El access JWT viaja en una cookie HttpOnly (`access_token`); no es
    // accesible desde JavaScript, así que no hay token en localStorage.
    return null;
}

/** Error de API con el status HTTP para que la UI pueda reacting (401 → logout). */
export class ApiError extends Error {
    constructor(mensaje, status) {
        super(mensaje);
        this.name = "ApiError";
        this.status = status;
    }
}

/**
 * @param {object} [opciones]
 * @param {boolean} [opciones.silencioso=false] Si es true, un 401 NO dispara
 *   el evento "uajs:sesion-expirada". Lo usa la validación de sesión, que
 *   decide por su cuenta cuándo cerrar (y no debe cerrar por un fallo de red).
 */
export async function apiFetch(
    path,
    { method = "GET", body, params, silencioso = false } = {}
) {
    if (!API) {
        throw new ApiError(
            "VITE_API_URL no está configurado. No se puede llamar al backend.",
            0
        );
    }

    const query = params
        ? `?${new URLSearchParams(
              Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
          )}`
        : "";

    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const temporizador = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res;
    try {
        res = await fetch(`${API}${path}${query}`, {
            method,
            headers,
            signal: controller.signal,
            // Enviar cookies HttpOnly (access_token / refresh_token) también
            // en peticiones cross-origin (front en Vercel, API en Render).
            credentials: "include",
            body: body ? JSON.stringify(body) : undefined
        });
    } catch (error) {
        if (error.name === "AbortError") {
            throw new ApiError(
                "El servidor tardó demasiado en responder. Si estaba suspendido, " +
                    "la primera petición puede tardar hasta un minuto: reintenta.",
                0
            );
        }
        throw new ApiError(
            "No hay conexión con el servidor. Verifica que el gateway esté levantado.",
            0
        );
    } finally {
        clearTimeout(temporizador);
    }

    if (res.status === 204) {
        return null;
    }

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
        // Auto-refresh: si el access token expiró, intentamos renovarlo
        // silenciosamente con la cookie de refresh token y reintentamos la
        // petición original una sola vez. Un refreshPromise compartido evita
        // lanzar varios refresh simultáneos cuando varias peticiones caducan
        // al mismo tiempo.
        if (
            res.status === 401 &&
            !silencioso &&
            typeof window !== "undefined" &&
            !RUTAS_SIN_REFRESH.has(path)
        ) {
            if (!refreshPromise) {
                refreshPromise = (async () => {
                    try {
                        const rr = await fetch(`${API}/auth/refresh`, {
                            method: "POST",
                            credentials: "include"
                        });
                        return rr.ok;
                    } catch {
                        return false;
                    }
                })().finally(() => {
                    refreshPromise = null;
                });
            }
            const renovado = await refreshPromise;
            if (renovado) {
                return apiFetch(path, {
                    method,
                    body,
                    params,
                    silencioso: true
                });
            }
            // Renovación falló: la sesión expiró de verdad.
            window.dispatchEvent(
                new CustomEvent("uajs:sesion-expirada", { detail: { url: path } })
            );
        } else if (
            res.status === 401 &&
            !silencioso &&
            typeof window !== "undefined" &&
            !RUTAS_SIN_REFRESH.has(path)
        ) {
            window.dispatchEvent(
                new CustomEvent("uajs:sesion-expirada", { detail: { url: path } })
            );
        }
        throw new ApiError(json.error || `Error ${res.status}`, res.status);
    }

    return json.data !== undefined ? json.data : json;
}

// ============================================================
// APIs POR SERVICIO
//
// Nota sobre los métodos que NO tienen consumidor hoy:
//
//   - `get(id)` de cada servicio (users, requests, events, notifications,
//     feedback, resources, reservations, academic-info, configuration).
//   - `requestsApi.update` y `requestsApi.remove`.
//   - `searchApi.byIndex`, `searchApi.suggest` e `searchApi.indices`.
//
// No son deuda olvidada: son superficie de API a propósito. El front es
// "offline-first" — cada página carga la lista completa con useColeccion y
// resuelve los registros individuales en memoria (p. ej. obtenerXPorId hace
// find sobre la caché). Por eso ninguna vista necesita pedir un id suelto.
//
// Se mantienen envueltos aquí porque:
//   1. ya existen y responden en el backend (verificado),
//   2. documentan el contrato real de cada microservicio,
//   3. evitan que la próxima vista de detalle tenga que escribir el fetch a mano.
// ============================================================

// ==========================================
// AUTH
// ==========================================
export const authApi = {
    login: (cedula, password) =>
        apiFetch("/auth/login", { method: "POST", body: { cedula, password } }),
    register: (payload) => apiFetch("/auth/register", { method: "POST", body: payload }),
    // Recuperación de contraseña. `forgot` es silencioso: si el servicio de
    // correo no está configurado (503) queremos mostrar el error, no disparar
    // el cierre de sesión global.
    forgot: (payload) =>
        apiFetch("/auth/recuperar", { method: "POST", body: payload, silencioso: true }),
    reset: (token, password) =>
        apiFetch("/auth/restablecer", { method: "POST", body: { token, password }, silencioso: true }),
    me: () => apiFetch("/auth/me", { silencioso: true }),
    // Historial real de inicios de sesión (Configuración → Seguridad).
    accesos: () => apiFetch("/auth/accesos", { silencioso: true }),
    // Renueva el access token usando la cookie de refresh token (rota el par).
    refresh: () => apiFetch("/auth/refresh", { method: "POST" }),
    // Cierra la sesión: revoca en el servidor y borra las cookies.
    logout: () => apiFetch("/auth/logout", { method: "POST" })
};

// ==========================================
// USERS
// ==========================================
export const usersApi = {
    list: () => apiFetch("/users"),
    get: (id) => apiFetch(`/users/${id}`),
    create: (data) => apiFetch("/users", { method: "POST", body: data }),
    update: (id, data) => apiFetch(`/users/${id}`, { method: "PUT", body: data }),
    // Soft delete: el servicio marca estado = 'Inactivo'
    deactivate: (id) => apiFetch(`/users/${id}`, { method: "DELETE" }),
    remove: (id) => apiFetch(`/users/${id}`, { method: "DELETE" })
};

// ==========================================
// REQUESTS (SOLICITUDES)
// ==========================================
export const requestsApi = {
    list: () => apiFetch("/requests"),
    get: (id) => apiFetch(`/requests/${id}`),
    create: (data) => apiFetch("/requests", { method: "POST", body: data }),
    update: (id, data) => apiFetch(`/requests/${id}`, { method: "PUT", body: data }),
    advance: (id, data) =>
        apiFetch(`/requests/${id}/avance`, { method: "POST", body: data }),
    addNote: (id, data) =>
        apiFetch(`/requests/${id}/notas`, { method: "POST", body: data }),
    remove: (id) => apiFetch(`/requests/${id}`, { method: "DELETE" })
};

// ==========================================
// EVENTS (EVENTOS)
// ==========================================
export const eventsApi = {
    list: () => apiFetch("/events"),
    get: (id) => apiFetch(`/events/${id}`),
    create: (data) => apiFetch("/events", { method: "POST", body: data }),
    update: (id, data) => apiFetch(`/events/${id}`, { method: "PUT", body: data }),
    remove: (id) => apiFetch(`/events/${id}`, { method: "DELETE" }),
    inscripciones: (id) => apiFetch(`/events/${id}/inscripciones`),
    register: (id, idUsuario) =>
        apiFetch(`/events/${id}/inscripciones`, {
            method: "POST",
            body: { id_usuario: idUsuario }
        }),
    unregister: (id, idUsuario) =>
        apiFetch(`/events/${id}/inscripciones/${idUsuario}`, { method: "DELETE" })
};

// ==========================================
// NOTIFICATIONS (NOTIFICACIONES)
// ==========================================
export const notificationsApi = {
    list: (idUsuario) => apiFetch("/notifications", { params: { id_usuario: idUsuario } }),
    get: (id) => apiFetch(`/notifications/${id}`),
    create: (data) => apiFetch("/notifications", { method: "POST", body: data }),
    update: (id, data) => apiFetch(`/notifications/${id}`, { method: "PUT", body: data }),
    remove: (id) => apiFetch(`/notifications/${id}`, { method: "DELETE" }),
    markRead: (id, idUsuario) =>
        apiFetch(`/notifications/${id}`, {
            method: "PUT",
            body: { id_usuario: idUsuario, leida: 1 }
        }),
    markAllRead: async (idUsuario) => {
        const lista = await apiFetch("/notifications", {
            params: { id_usuario: idUsuario }
        });
        return Promise.all(
            lista
                .filter((n) => !Number(n.leida))
                .map((n) =>
                    apiFetch(`/notifications/${n.id_notificacion}`, {
                        method: "PUT",
                        body: { ...n, leida: 1 }
                    })
                )
        );
    }
};

// ==========================================
// FEEDBACK (PQRS)
// ==========================================
export const feedbackApi = {
    list: () => apiFetch("/feedback"),
    get: (id) => apiFetch(`/feedback/${id}`),
    create: (data) => apiFetch("/feedback", { method: "POST", body: data }),
    update: (id, data) => apiFetch(`/feedback/${id}`, { method: "PUT", body: data }),
    remove: (id) => apiFetch(`/feedback/${id}`, { method: "DELETE" })
};

// ==========================================
// RESOURCES (RECURSOS)
// ==========================================
export const resourcesApi = {
    list: () => apiFetch("/resources"),
    get: (id) => apiFetch(`/resources/${id}`),
    create: (data) => apiFetch("/resources", { method: "POST", body: data }),
    update: (id, data) => apiFetch(`/resources/${id}`, { method: "PUT", body: data }),
    remove: (id) => apiFetch(`/resources/${id}`, { method: "DELETE" })
};

// ==========================================
// RESERVATIONS (RESERVAS)
// ==========================================
export const reservationsApi = {
    list: () => apiFetch("/reservations"),
    get: (id) => apiFetch(`/reservations/${id}`),
    create: (data) => apiFetch("/reservations", { method: "POST", body: data }),
    update: (id, data) => apiFetch(`/reservations/${id}`, { method: "PUT", body: data }),
    remove: (id) => apiFetch(`/reservations/${id}`, { method: "DELETE" })
};

// ==========================================
// CONFIGURATION (CONFIGURACIÓN)
// ==========================================
export const configurationApi = {
    list: (idUsuario) =>
        apiFetch("/configuration", { params: { id_usuario: idUsuario } }),
    get: (id) => apiFetch(`/configuration/${id}`),
    getByUserAndSection: (idUsuario, seccion) =>
        apiFetch(`/configuration/usuario/${idUsuario}/seccion/${seccion}`),
    create: (data) => apiFetch("/configuration", { method: "POST", body: data }),
    update: (id, data) => apiFetch(`/configuration/${id}`, { method: "PUT", body: data }),
    remove: (id) => apiFetch(`/configuration/${id}`, { method: "DELETE" })
};

// ==========================================
// ACADEMIC INFO (INFORMACIÓN ACADÉMICA)
// ==========================================
export const academicInfoApi = {
    list: () => apiFetch("/academic-info"),
    get: (id) => apiFetch(`/academic-info/${id}`),
    create: (data) => apiFetch("/academic-info", { method: "POST", body: data }),
    update: (id, data) => apiFetch(`/academic-info/${id}`, { method: "PUT", body: data }),
    remove: (id) => apiFetch(`/academic-info/${id}`, { method: "DELETE" })
};

// ==========================================
// SEARCH (Elasticsearch)
// A diferencia del resto, no envuelve en { data }.
// ==========================================
export const searchApi = {
    all: (q, tipo, size = 10) => apiFetch("/search", { params: { q, tipo, size } }),
    byIndex: (indice, q, size = 20) =>
        apiFetch(`/search/${indice}`, { params: { q, size } }),
    suggest: (q, size = 5) => apiFetch("/search/suggest", { params: { q, size } }),
    indices: () => apiFetch("/search/indices")
};

// ==========================================
// AUDIT (ACTIVIDAD RECIENTE — solo administrador)
// GET /api/audit: últimas acciones registradas en la tabla `auditoria`.
// El backend responde 403 a cualquier rol que no sea Administrador.
// ==========================================
export const auditApi = {
    listar: (limite = 100) => apiFetch("/audit", { params: { limite } })
};