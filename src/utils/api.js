// ⚠️ API client NO USADO por las páginas actuales (que operan con localStorage).
// Queda preparado para la migración a backend cuando se conecten los microservicios.
const API = import.meta.env.VITE_API_URL;

if (!API && typeof window !== "undefined") {
    console.warn(
        "[api] VITE_API_URL no está definido. Las llamadas a apiFetch fallarán hasta configurar la variable de entorno."
    );
}

function getToken() {
  try {
    const sesion = JSON.parse(localStorage.getItem("uajs_session") || "null");
    return sesion?.token || null;
  } catch {
    return null;
  }
}

export async function apiFetch(path, { method = "GET", body } = {}) {
  if (!API) {
    throw new Error(
        "VITE_API_URL no está configurado. Configure la variable de entorno para habilitar llamadas al backend."
    );
  }
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
  return json.data;
}

// ==========================================
// AUTH
// ==========================================
export const authApi = {
  login: (identificacion, password) =>
    apiFetch("/auth/login", { method: "POST", body: { identificacion, password } }),
  me: () => apiFetch("/auth/me")
};

// ==========================================
// USERS
// ==========================================
export const usersApi = {
  list: () => apiFetch("/users"),
  roles: () => apiFetch("/users/roles")
};

// ==========================================
// REQUESTS (SOLICITUDES)
// ==========================================
export const requestsApi = {
  list: () => apiFetch("/requests"),
  get: (id) => apiFetch(`/requests/${id}`),
  create: (data) => apiFetch("/requests", { method: "POST", body: data }),
  update: (id, data) => apiFetch(`/requests/${id}`, { method: "PUT", body: data }),
  advance: (id) => apiFetch(`/requests/${id}/advance`, { method: "PATCH" }),
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
  register: (id) => apiFetch(`/events/${id}/register`, { method: "POST" })
};

// ==========================================
// NOTIFICATIONS (NOTIFICACIONES)
// ==========================================
export const notificationsApi = {
  list: () => apiFetch("/notifications"),
  markRead: (id) => apiFetch(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => apiFetch("/notifications/read-all", { method: "PATCH" })
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
  create: (data) => apiFetch("/reservations", { method: "POST", body: data })
};

// ==========================================
// SERVICES (SERVICIOS)
// ==========================================
export const servicesApi = {
  list: () => apiFetch("/services")
};

// ==========================================
// REPORTS (REPORTES)
// ==========================================
export const reportsApi = {
  get: () => apiFetch("/reports")
};
