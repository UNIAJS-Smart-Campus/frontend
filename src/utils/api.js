// ============================================================
// Cliente HTTP central para Smart Campus UAJS
// Todas las llamadas pasan por el API Gateway (VITE_API_URL).
// ============================================================

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

export async function apiFetch(path, { method = "GET", body, query } = {}) {
    if (!API) {
        throw new Error(
            "VITE_API_URL no está configurado. Configure la variable de entorno para habilitar llamadas al backend."
        );
    }

    let url = `${API}${path}`;
    if (query && typeof query === "object") {
        const qs = new URLSearchParams();
        Object.entries(query).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== "") qs.append(k, v);
        });
        const s = qs.toString();
        if (s) url += (path.includes("?") ? "&" : "?") + s;
    }

    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
    // La mayoría de endpoints devuelve `{ data }`; los de búsqueda y salud
    // responden directamente el objeto, por eso se conserva como respaldo.
    return json.data ?? json;
}

// ============================================================
// Normalización: backend (español) -> frontend
// ============================================================

export function normalizeUsuario(u = {}) {
    if (!u || typeof u !== "object") return u;
    return {
        id: u.id_usuario,
        identificacion: u.identificacion,
        usuario: u.usuario,
        nombre: [u.nombre, u.apellido].filter(Boolean).join(" ").trim() || u.nombre || "",
        correo: u.correo,
        telefono: u.telefono,
        rol: u.tipo_usuario || u.rol || u.nombre_rol,
        id_rol: u.id_rol,
        programa: u.programa,
        estado: u.estado || "Activo"
    };
}

export function normalizeRecurso(r = {}) {
    if (!r || typeof r !== "object") return r;
    const nombre = r.nombre_recurso ?? r.nombre ?? "";
    const tipo = r.tipo_recurso ?? r.tipo ?? "";
    return {
        id: r.id_recurso ?? r.id,
        codigo: r.codigo ?? "",
        nombre,
        tipo,
        capacidad: r.capacidad,
        ubicacion: r.ubicacion,
        estado: r.estado || "Activo",
        disponibilidad: r.disponibilidad || "Disponible"
    };
}

export function normalizeReserva(r = {}) {
    if (!r || typeof r !== "object") return r;
    return {
        id: r.id_reserva ?? r.id,
        recursoId: r.id_recurso ?? r.recursoId ?? null,
        id_recurso: r.id_recurso ?? r.recursoId ?? null,
        recurso: r.nombre_recurso ?? r.recurso ?? "",
        tipoRecurso: r.tipo_recurso ?? r.tipoRecurso ?? "",
        usuarioId: r.id_usuario ?? r.usuarioId ?? null,
        usuario: [r.usuario_nombre, r.usuario_apellido].filter(Boolean).join(" ").trim()
            || r.usuario || "",
        fecha: r.fecha_reserva ?? r.fecha ?? "",
        horaInicio: (r.hora_inicio ?? r.horaInicio ?? "").slice(0, 5),
        horaFin: (r.hora_fin ?? r.horaFin ?? "").slice(0, 5),
        motivo: r.motivo ?? r.proposito ?? "",
        estado: r.estado || "Pendiente"
    };
}

export function denormalizeReserva(r = {}) {
    return {
        id_usuario: r.usuarioId ?? r.id_usuario ?? null,
        id_recurso: r.recursoId ?? r.id_recurso ?? null,
        fecha_reserva: fechaCorta(r.fecha || r.fecha_reserva),
        hora_inicio: r.horaInicio ?? r.hora_inicio,
        hora_fin: r.horaFin ?? r.hora_fin,
        motivo: r.motivo ?? r.proposito ?? "",
        estado: r.estado || "Pendiente"
    };
}

export function normalizeEvento(e = {}) {
    if (!e || typeof e !== "object") return e;
    return {
        id: e.id_evento ?? e.id,
        nombre: e.nombre_evento ?? e.nombre ?? "",
        fecha: (e.fecha ?? "").slice(0, 10),
        hora: (e.hora_inicio ?? e.hora ?? "").slice(0, 5),
        horaInicio: (e.hora_inicio ?? "").slice(0, 5),
        horaFin: (e.hora_fin ?? "").slice(0, 5),
        lugar: e.ubicacion ?? e.lugar ?? "",
        ubicacion: e.ubicacion ?? e.lugar ?? "",
        tipo: e.tipo_evento ?? e.categoria ?? "",
        categoria: e.tipo_evento ?? e.categoria ?? "",
        descripcion: e.descripcion ?? "",
        estado: e.estado || "Activo",
        cupo: Number(e.cupo ?? 0),
        inscritos: Number(e.inscritos ?? 0),
        id_usuario: e.id_usuario ?? null,
        ponente: e.ponente ?? "",
        modalidad: e.modalidad ?? "Presencial",
        participantes: e.participantes || []
    };
}

export function denormalizeEvento(e = {}) {
    return {
        nombre_evento: e.nombre,
        descripcion: e.descripcion,
        fecha: fechaCorta(e.fecha),
        hora_inicio: e.hora || e.horaInicio,
        hora_fin: e.horaFin,
        ubicacion: e.lugar || e.ubicacion,
        tipo_evento: e.categoria || e.tipo,
        estado: e.estado || "Activo",
        cupo: Number(e.cupo ?? 0),
        id_usuario: e.id_usuario ?? null
    };
}

export function normalizeNotificacion(n = {}) {
    if (!n || typeof n !== "object") return n;
    const fecha = n.fecha_envio ?? n.fecha ?? "";
    const tipoRaw = String(n.tipo_notificacion ?? n.tipo ?? "").trim();
    const tipo = tipoRaw.toLowerCase() === "pqrs"
        ? "PQRS"
        : tipoRaw
            ? tipoRaw.charAt(0).toUpperCase() + tipoRaw.slice(1).toLowerCase()
            : "";
    return {
        id: n.id_notificacion ?? n.id,
        titulo: n.titulo ?? "",
        mensaje: n.mensaje ?? "",
        tipo,
        icono: n.icono ?? "notificaciones",
        leida: Boolean(Number(n.leida ?? 0)),
        fecha: typeof fecha === "string" ? fecha.slice(0, 10) : "",
        id_usuario: n.id_usuario ?? null
    };
}

export function normalizeSolicitud(s = {}) {
    if (!s || typeof s !== "object") return s;
    const fecha = s.fecha_solicitud ?? s.fecha ?? "";
    const isoFecha = typeof fecha === "string" ? fecha.slice(0, 10) : "";
    const estadoCrudo = String(s.estado || "REGISTRADA").trim().toUpperCase();
    const historialCrudo = typeof s.historial === "string" ? safeParse(s.historial) : s.historial;
    return {
        id: s.id_solicitud ?? s.id,
        codigo: s.codigo ?? "",
        tipo: s.tipo ?? "",
        servicio: s.servicio_nombre ?? s.servicio ?? "",
        id_servicio: s.id_servicio ?? null,
        usuarioId: s.id_usuario ?? null,
        usuario: s.usuario
            ? s.usuario
            : { id: s.id_usuario ?? null, nombre: [s.usuario_nombre, s.usuario_apellido].filter(Boolean).join(" ").trim() },
        fecha: isoFecha,
        fechaCompleta: typeof fecha === "string" ? fecha : "",
        // La BD guarda los estados en mayúsculas; `RADICADA` es una variante
        // vieja que quedó en datos semilla.
        estado: estadoCrudo === "RADICADA" ? "REGISTRADA" : estadoCrudo,
        descripcion: s.descripcion ?? "",
        respuesta: s.respuesta ?? "",
        solicitante: s.solicitante ?? "",
        prioridad: s.prioridad || "Media",
        dependencia: s.dependencia ?? "",
        responsable: s.responsable
            ? s.responsable
            : (s.responsable_nombre
                ? { id: s.id_responsable ?? s.responsable_id ?? null, nombre: s.responsable_nombre }
                : null),
        historial: Array.isArray(historialCrudo) ? historialCrudo : []
    };
}

export function denormalizeSolicitud(s = {}) {
    return {
        tipo: s.tipo,
        descripcion: s.descripcion,
        id_usuario: s.usuarioId ?? null,
        servicio: s.servicio ?? "",
        id_servicio: s.id_servicio ?? null,
        id_responsable: s.id_responsable ?? s.responsable?.id ?? null,
        solicitante: s.solicitante ?? s.usuario?.nombre ?? "",
        dependencia: s.dependencia ?? "",
        estado: s.estado || "REGISTRADA",
        respuesta: s.respuesta ?? "",
        prioridad: s.prioridad || "Media",
        codigo: s.codigo ?? "",
        fecha_solicitud: fechaCorta(s.fecha || s.fechaCompleta),
        historial: s.historial,
        motivo: s.motivo
    };
}

export function normalizePqrs(p = {}) {
    if (!p || typeof p !== "object") return p;
    return {
        id: p.id_pqrs ?? p.id,
        tipo: p.tipo ?? "",
        fecha: (p.fecha ?? "").slice(0, 10),
        estado: p.estado || "Registrada",
        descripcion: p.descripcion ?? "",
        sede: p.sede ?? "SINCELEJO",
        tipoPerfil: p.tipoPerfil ?? p.tipo_perfil ?? "Estudiante",
        tipoDocumento: p.tipoDocumento ?? p.tipo_documento ?? "",
        identificacion: p.identificacion ?? "",
        nombre: p.nombre ?? p.solicitante ?? "Anónimo",
        telefono: p.telefono ?? "",
        correo: p.correo ?? "",
        area: p.area ?? "",
        asunto: p.asunto ?? "",
        solicitante: p.solicitante ?? p.nombre ?? "Anónimo",
        asignadoA: p.asignadoA ?? p.asignado_a ?? "",
        prioridad: p.prioridad || "Media",
        respuesta: p.respuesta ?? "",
        usuarioId: p.usuarioId ?? p.id_usuario ?? null,
        adjunto: p.adjunto ?? null,
        historial: p.historial || []
    };
}

export function denormalizePqrs(p = {}) {
    return {
        tipo: p.tipo,
        fecha: fechaCorta(p.fecha),
        estado: p.estado || "Registrada",
        descripcion: p.descripcion,
        sede: p.sede,
        tipo_perfil: p.tipoPerfil,
        tipo_documento: p.tipoDocumento,
        identificacion: p.identificacion,
        nombre: p.nombre,
        telefono: p.telefono,
        correo: p.correo,
        area: p.area,
        asunto: p.asunto,
        solicitante: p.solicitante ?? p.nombre,
        asignado_a: p.asignadoA,
        prioridad: p.prioridad || "Media",
        respuesta: p.respuesta ?? "",
        id_usuario: p.usuarioId ?? null
    };
}

export function normalizePublicacion(p = {}) {
    if (!p || typeof p !== "object") return p;
    return {
        id: p.id_publicacion ?? p.id,
        titulo: p.titulo ?? "",
        categoria: p.categoria ?? "",
        fecha: (p.fecha ?? "").slice(0, 10),
        autor: p.autor ?? p.usuario_nombre ?? "",
        contenido: p.contenido ?? "",
        estado: p.estado || "Pendiente",
        id_usuario: p.id_usuario ?? null
    };
}

export function denormalizePublicacion(p = {}) {
    return {
        titulo: p.titulo,
        categoria: p.categoria,
        fecha: fechaCorta(p.fecha),
        autor: p.autor,
        contenido: p.contenido,
        estado: p.estado || "Pendiente",
        id_usuario: p.id_usuario ?? null
    };
}

export function normalizeConfiguracion(c = {}) {
    if (!c || typeof c !== "object") return c;
    return {
        id: c.id_config ?? c.id,
        id_usuario: c.id_usuario,
        seccion: c.seccion,
        valor: typeof c.valor === "string" ? safeParse(c.valor) : c.valor
    };
}

function safeParse(v) {
    try {
        return JSON.parse(v);
    } catch {
        return v;
    }
}

// MySQL DATE no acepta el ISO completo (`2026-09-08T00:00:00.000Z`) y devuelve
// error 1292, que el backend traduce a 500. Para columnas DATE se recorta a
// `YYYY-MM-DD` antes de enviar.
function fechaCorta(valor) {
    if (!valor) return undefined;
    return String(valor).slice(0, 10);
}

// ============================================================
// AUTH
// ============================================================
export const authApi = {
    login: (identificacion, password) =>
        apiFetch("/api/auth/login", { method: "POST", body: { identificacion, password } }),
    register: (data) =>
        apiFetch("/api/auth/register", { method: "POST", body: data }),
    me: () => apiFetch("/api/auth/me")
};

// ============================================================
// USERS
// ============================================================
export const usersApi = {
    list: async () => {
        const data = await apiFetch("/api/users");
        return Array.isArray(data) ? data.map(normalizeUsuario) : data;
    },
    get: async (id) => normalizeUsuario(await apiFetch(`/api/users/${id}`)),
    create: async (data) => normalizeUsuario(await apiFetch("/api/users", { method: "POST", body: data })),
    update: async (id, data) => normalizeUsuario(await apiFetch(`/api/users/${id}`, { method: "PUT", body: data })),
    remove: (id) => apiFetch(`/api/users/${id}`, { method: "DELETE" })
};

// ============================================================
// RESOURCES
// ============================================================
export const resourcesApi = {
    list: async () => {
        const data = await apiFetch("/api/resources");
        return Array.isArray(data) ? data.map(normalizeRecurso) : data;
    },
    get: async (id) => normalizeRecurso(await apiFetch(`/api/resources/${id}`)),
    create: async (data) => normalizeRecurso(await apiFetch("/api/resources", { method: "POST", body: data })),
    update: async (id, data) => normalizeRecurso(await apiFetch(`/api/resources/${id}`, { method: "PUT", body: data })),
    remove: (id) => apiFetch(`/api/resources/${id}`, { method: "DELETE" })
};

// ============================================================
// RESERVATIONS
// ============================================================
export const reservationsApi = {
    list: async () => {
        const data = await apiFetch("/api/reservations");
        return Array.isArray(data) ? data.map(normalizeReserva) : data;
    },
    get: async (id) => normalizeReserva(await apiFetch(`/api/reservations/${id}`)),
    // Reservas (de cualquier usuario) que ocupan un recurso en una fecha/hora.
    ocupados: async ({ fecha, horaInicio, horaFin } = {}) => {
        const data = await apiFetch("/api/reservations/ocupados", {
            query: {
                fecha,
                hora_inicio: horaInicio,
                hora_fin: horaFin
            }
        });
        return Array.isArray(data)
            ? data.map((r) => ({
                id: r.id_reserva ?? r.id,
                recursoId: r.id_recurso ?? r.recursoId ?? null,
                horaInicio: (r.hora_inicio ?? r.horaInicio ?? "").slice(0, 5),
                horaFin: (r.hora_fin ?? r.horaFin ?? "").slice(0, 5)
            }))
            : [];
    },
    create: async (data) => normalizeReserva(await apiFetch("/api/reservations", { method: "POST", body: denormalizeReserva(data) })),
    update: async (id, data) => {
        const payload = await denormalizeReserva(data);
        return normalizeReserva(await apiFetch(`/api/reservations/${id}`, { method: "PUT", body: payload }));
    },
    remove: (id) => apiFetch(`/api/reservations/${id}`, { method: "DELETE" })
};

// ============================================================
// EVENTS
// ============================================================
export const eventsApi = {
    list: async () => {
        const data = await apiFetch("/api/events");
        return Array.isArray(data) ? data.map(normalizeEvento) : data;
    },
    get: async (id) => normalizeEvento(await apiFetch(`/api/events/${id}`)),
    create: async (data) => normalizeEvento(await apiFetch("/api/events", { method: "POST", body: denormalizeEvento(data) })),
    update: async (id, data) =>
        normalizeEvento(await apiFetch(`/api/events/${id}`, { method: "PUT", body: denormalizeEvento(data) })),
    remove: (id) => apiFetch(`/api/events/${id}`, { method: "DELETE" }),
    register: (id) => apiFetch(`/api/events/${id}/register`, { method: "POST" }),
    unregister: (id) => apiFetch(`/api/events/${id}/register`, { method: "DELETE" })
};

// ============================================================
// NOTIFICATIONS
// ============================================================
export const notificationsApi = {
    list: async (id_usuario) => {
        const data = await apiFetch("/api/notifications", { query: id_usuario ? { id_usuario } : undefined });
        return Array.isArray(data) ? data.map(normalizeNotificacion) : data;
    },
    get: async (id) => normalizeNotificacion(await apiFetch(`/api/notifications/${id}`)),
    markRead: (id) => apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" }),
    markAllRead: () => apiFetch("/api/notifications/read-all", { method: "PATCH" })
};

// ============================================================
// REQUESTS (SOLICITUDES)
// ============================================================
export const requestsApi = {
    list: async () => {
        const data = await apiFetch("/api/requests");
        return Array.isArray(data) ? data.map(normalizeSolicitud) : data;
    },
    get: async (id) => normalizeSolicitud(await apiFetch(`/api/requests/${id}`)),
    create: async (data) => normalizeSolicitud(await apiFetch("/api/requests", { method: "POST", body: denormalizeSolicitud(data) })),
    update: async (id, data) =>
        normalizeSolicitud(await apiFetch(`/api/requests/${id}`, { method: "PUT", body: denormalizeSolicitud(data) })),
    remove: (id) => apiFetch(`/api/requests/${id}`, { method: "DELETE" })
};

// ============================================================
// FEEDBACK (PQRS)
// ============================================================
export const feedbackApi = {
    list: async () => {
        const data = await apiFetch("/api/feedback");
        return Array.isArray(data) ? data.map(normalizePqrs) : data;
    },
    get: async (id) => normalizePqrs(await apiFetch(`/api/feedback/${id}`)),
    create: async (data) => normalizePqrs(await apiFetch("/api/feedback", { method: "POST", body: denormalizePqrs(data) })),
    update: async (id, data) =>
        normalizePqrs(await apiFetch(`/api/feedback/${id}`, { method: "PUT", body: denormalizePqrs(data) })),
    remove: (id) => apiFetch(`/api/feedback/${id}`, { method: "DELETE" })
};

// ============================================================
// ACADEMIC INFO
// ============================================================
export const academicInfoApi = {
    list: async () => {
        const data = await apiFetch("/api/academic-info");
        return Array.isArray(data) ? data.map(normalizePublicacion) : data;
    },
    get: async (id) => normalizePublicacion(await apiFetch(`/api/academic-info/${id}`)),
    create: async (data) => normalizePublicacion(await apiFetch("/api/academic-info", { method: "POST", body: denormalizePublicacion(data) })),
    update: async (id, data) =>
        normalizePublicacion(await apiFetch(`/api/academic-info/${id}`, { method: "PUT", body: denormalizePublicacion(data) })),
    remove: (id) => apiFetch(`/api/academic-info/${id}`, { method: "DELETE" })
};

// ============================================================
// SEARCH (ELASTICSEARCH)
// ============================================================
export const searchApi = {
    search: async (q, { tipo, from = 0, size = 10 } = {}) => {
        const data = await apiFetch("/api/search", {
            query: { q, tipo, from, size }
        });
        return {
            total: Number(data?.total) || 0,
            results: Array.isArray(data?.results) ? data.results : []
        };
    },
    byIndex: (index, q, { from = 0, size = 20 } = {}) =>
        apiFetch(`/api/search/${index}`, { query: { q, from, size } }),
    suggest: async (q) => {
        const data = await apiFetch("/api/search/suggest", { query: { q } });
        return Array.isArray(data?.suggestions) ? data.suggestions : [];
    },
    indices: async () => {
        const data = await apiFetch("/api/search/indices");
        return Array.isArray(data?.indices) ? data.indices : [];
    }
};

// ============================================================
// CONFIGURATION
// ============================================================
export const configurationApi = {
    list: async (id_usuario) => {
        const data = await apiFetch("/api/configuration", { query: id_usuario ? { id_usuario } : undefined });
        return Array.isArray(data) ? data.map(normalizeConfiguracion) : data;
    },
    get: async (id) => normalizeConfiguracion(await apiFetch(`/api/configuration/${id}`)),
    byUserSection: async (id_usuario, seccion) =>
        normalizeConfiguracion(await apiFetch(`/api/configuration/usuario/${id_usuario}/seccion/${encodeURIComponent(seccion)}`)),
    create: async (data) => normalizeConfiguracion(await apiFetch("/api/configuration", { method: "POST", body: data })),
    update: async (id, data) => normalizeConfiguracion(await apiFetch(`/api/configuration/${id}`, { method: "PUT", body: data })),
    remove: (id) => apiFetch(`/api/configuration/${id}`, { method: "DELETE" })
};