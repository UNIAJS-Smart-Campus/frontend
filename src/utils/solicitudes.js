// ============================================================
// SOLICITUDES — Utilidades del módulo
// Modelo tipo mesa de ayuda (helpdesk) con historial de eventos
// tipados y evolucion del estado de la solicitud.
// ============================================================

// Estados en código (mayúsculas). ETIQUETA_ESTADO para mostrar.
// Incluye RECHAZADA para que el gráfico de reportes la contabilice.
export const ESTADOS_SOLICITUD = [
    "REGISTRADA",
    "EN_REVISION",
    "ASIGNADA",
    "EN_PROCESO",
    "PAUSADA",
    "RESUELTA",
    "CERRADA",
    "RECHAZADA"
];

// RECHAZADA es terminal y fuera de la cadena lineal.
export const ESTADOS_FINALES = ["CERRADA", "RECHAZADA"];

export const ETIQUETA_ESTADO = {
    REGISTRADA: "Registrada",
    EN_REVISION: "En revisión",
    ASIGNADA: "Asignada",
    EN_PROCESO: "En proceso",
    PAUSADA: "Pausada",
    RESUELTA: "Resuelta",
    CERRADA: "Cerrada",
    RECHAZADA: "Rechazada"
};

// Orden de presentación en progreso/timeline (cadena principal).
export const ORDEN_ESTADOS = [
    "REGISTRADA",
    "EN_REVISION",
    "ASIGNADA",
    "EN_PROCESO",
    "RESUELTA",
    "CERRADA"
];

export const ESTADO_COLOR = {
    REGISTRADA: "yellow",
    EN_REVISION: "blue",
    ASIGNADA: "purple",
    EN_PROCESO: "blue",
    PAUSADA: "gray",
    RESUELTA: "green",
    CERRADA: "gray",
    RECHAZADA: "red"
};

// Acciones disponibles por estado (para mostrar botones coherentes).
export const ACCIONES_POR_ESTADO = {
    REGISTRADA: ["revisar", "rechazar", "nota"],
    EN_REVISION: ["asignar", "rechazar", "nota"],
    ASIGNADA: ["proceso", "rechazar", "nota"],
    EN_PROCESO: ["resolver", "pausar", "nota"],
    PAUSADA: ["reanudar", "nota"],
    RESUELTA: ["cerrar", "reabrir", "nota"],
    CERRADA: ["reabrir", "nota"],
    RECHAZADA: ["reabrir", "nota"]
};

// Tipos de eventos del historial.
export const TIPOS_EVENTO = {
    CREACION: "CREACION",
    ESTADO: "ESTADO",
    NOTA: "NOTA",
    ASIGNACION: "ASIGNACION",
    RECHAZO: "RECHAZO",
    REAPERTURA: "REAPERTURA",
    PAUSA: "PAUSA",
    REANUDA: "REANUDA"
};

const SOLICITUDES_BASE = [
    {
        id: "SOL-2026-001",
        tipo: "Reserva de auditorio",

        historial: [
            { id: 1, tipo: "CREACION", fecha: "2026-09-02 08:20", usuario: "Carlos Méndez", descripcion: "Solicitud registrada." },
            { id: 2, tipo: "NOTA", fecha: "2026-09-02 09:00", usuario: "Carlos Pérez", descripcion: "Se solicita documento de identidad adicional." }
        ]
    },
    {
        id: "SOL-2026-003",
        tipo: "Reserva de laboratorio",
        servicio: "Reservas",
        prioridad: "Media",
        fecha: "2026-09-04",
        estado: "RESUELTA",
        usuario: { id: 12, nombre: "Lucía Paredes" },
        responsable: { id: 4, nombre: "Carlos Pérez" },
        dependencia: "Laboratorios",
        descripcion: "Uso del laboratorio de informática 3 para práctica de redes y configuración básica.",
        historial: [
            { id: 1, tipo: "CREACION", fecha: "2026-09-04 07:40", usuario: "Lucía Paredes", descripcion: "Solicitud registrada." },
            { id: 2, tipo: "ESTADO", estado: "EN_REVISION", fecha: "2026-09-04 08:00", usuario: "Carlos Pérez", descripcion: "Verificación de disponibilidad del laboratorio." },
            { id: 3, tipo: "ASIGNACION", responsable: "Carlos Pérez", fecha: "2026-09-05 09:10", usuario: "Carlos Pérez", descripcion: "Laboratorio asignado para la práctica." },
            { id: 4, tipo: "ESTADO", estado: "EN_PROCESO", fecha: "2026-09-06 14:00", usuario: "Carlos Pérez", descripcion: "Sesión ejecutada con equipos activos." },
            { id: 5, tipo: "ESTADO", estado: "RESUELTA", fecha: "2026-09-07 16:30", usuario: "Carlos Pérez", descripcion: "Reserva cerrada sin incidencias." }
        ]
    },
    {
        id: "SOL-2026-004",
        tipo: "Inscripción a evento",
        servicio: "Eventos",
        prioridad: "Baja",
        fecha: "2026-09-05",
        estado: "REGISTRADA",
        usuario: { id: 28, nombre: "Andrés Ruiz" },
        responsable: null,
        dependencia: "Bienestar Universitario",
        descripcion: "Inscripción al taller de emprendimiento y liderazgo del programa académico.",
        historial: [
            { id: 1, tipo: "CREACION", fecha: "2026-09-05 10:10", usuario: "Andrés Ruiz", descripcion: "Solicitud registrada." }
        ]
    },
    {
        id: "SOL-2026-005",
        tipo: "Soporte técnico",
        servicio: "PQRS",
        prioridad: "Alta",
        fecha: "2026-09-06",
        estado: "PAUSADA",
        usuario: { id: 29, nombre: "María Torres" },
        responsable: { id: 4, nombre: "Carlos Pérez" },
        dependencia: "Infraestructura Tecnológica",
        descripcion: "Reporte de fallas en los equipos del laboratorio de sistemas y conexión a red.",
        historial: [
            { id: 1, tipo: "CREACION", fecha: "2026-09-06 08:00", usuario: "María Torres", descripcion: "Solicitud registrada." },
            { id: 2, tipo: "ESTADO", estado: "EN_REVISION", fecha: "2026-09-06 08:30", usuario: "Carlos Pérez", descripcion: "Caso asignado a soporte tecnológico." },
            { id: 3, tipo: "ASIGNACION", responsable: "Carlos Pérez", fecha: "2026-09-07 09:00", usuario: "Carlos Pérez", descripcion: "Técnico responsable definido para la revisión." },
            { id: 4, tipo: "ESTADO", estado: "EN_PROCESO", fecha: "2026-09-07 11:20", usuario: "Carlos Pérez", descripcion: "Diagnóstico inicial de la falla." },
            { id: 5, tipo: "PAUSA", fecha: "2026-09-08 10:00", usuario: "Carlos Pérez", descripcion: "En espera de respuesta del proveedor de red." }
        ]
    },
    {
        id: "SOL-2026-006",
        tipo: "Préstamo de equipos",
        servicio: "Recursos",
        prioridad: "Media",
        fecha: "2026-09-08",
        estado: "CERRADA",
        usuario: { id: 30, nombre: "Jorge Salazar" },
        responsable: { id: 4, nombre: "Carlos Pérez" },
        dependencia: "Logística",
        descripcion: "Préstamo de dos proyectores para la feria de empleabilidad y actividades de ingreso.",
        historial: [
            { id: 1, tipo: "CREACION", fecha: "2026-09-08 06:50", usuario: "Jorge Salazar", descripcion: "Solicitud registrada." },
            { id: 2, tipo: "ESTADO", estado: "EN_REVISION", fecha: "2026-09-08 07:15", usuario: "Carlos Pérez", descripcion: "Verificación de disponibilidad de equipos." },
            { id: 3, tipo: "ASIGNACION", responsable: "Carlos Pérez", fecha: "2026-09-09 08:40", usuario: "Carlos Pérez", descripcion: "Dos equipos asignados al evento." },
            { id: 4, tipo: "ESTADO", estado: "EN_PROCESO", fecha: "2026-09-10 13:00", usuario: "Carlos Pérez", descripcion: "Entrega finalizada para la actividad." },
            { id: 5, tipo: "ESTADO", estado: "RESUELTA", fecha: "2026-09-12 17:20", usuario: "Carlos Pérez", descripcion: "Equipos devueltos y revisados." },
            { id: 6, tipo: "ESTADO", estado: "CERRADA", fecha: "2026-09-13 09:00", usuario: "Carlos Pérez", descripcion: "Solicitud cerrada por el sistema." }
        ]
    }
];

const STORAGE_KEY = "ua_js_solicitudes";

function esSolicitudValida(s) {
    return s && typeof s === "object"
        && typeof s.id === "string" && s.id.startsWith("SOL-")
        && typeof s.estado === "string" && s.estado.length > 0
        && typeof s.tipo === "string" && s.tipo.length > 0
        && typeof s.servicio === "string"
        && typeof s.fecha === "string"
        && s.usuario && typeof s.usuario === "object"
        && Array.isArray(s.historial);
}

function repararSolicitudes(lista) {
    if (!Array.isArray(lista) || !lista.length) return SOLICITUDES_BASE;
    const baseMap = {};
    SOLICITUDES_BASE.forEach((s) => { baseMap[s.id] = s; });

    const reparadas = lista.map((s) => {
        if (esSolicitudValida(s)) return s;
        const base = baseMap[s.id];
        return base || s;
    });

    const idsBase = SOLICITUDES_BASE.map((s) => s.id);
    const idsActuales = reparadas.map((s) => s.id);
    idsBase.forEach((id) => {
        if (!idsActuales.includes(id)) {
            reparadas.push(baseMap[id]);
        }
    });

    return reparadas;
}

export function obtenerSolicitudes() {
    if (typeof window === "undefined") return SOLICITUDES_BASE;

    try {
        const guardadas = localStorage.getItem(STORAGE_KEY);
        if (!guardadas) {
            guardarSolicitudes(SOLICITUDES_BASE);
            return SOLICITUDES_BASE;
        }
        const parsed = JSON.parse(guardadas);
        if (!Array.isArray(parsed) || !parsed.length) {
            guardarSolicitudes(SOLICITUDES_BASE);
            return SOLICITUDES_BASE;
        }
        const reparadas = repararSolicitudes(parsed);
        if (JSON.stringify(reparadas) !== JSON.stringify(parsed)) {
            guardarSolicitudes(reparadas);
        }
        return reparadas;
    } catch {
        guardarSolicitudes(SOLICITUDES_BASE);
        return SOLICITUDES_BASE;
    }
}

export function guardarSolicitudes(solicitudes) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudes));
    } catch {
        // si localStorage no está disponible se ignora
    }
}

export function resetSolicitudes() {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // si localStorage no está disponible se ignora
    }
    guardarSolicitudes(SOLICITUDES_BASE);
}

export function obtenerSolicitudPorId(id) {
    return obtenerSolicitudes().find((s) => String(s.id) === String(id)) || null;
}

// ---- Filtro por rol ----
const FILTROS_POR_PERFIL = {
    Administrador: null,
    Administrativo: ["Reservas", "PQRS", "Solicitudes"],
    Docente: ["Reservas", "Solicitudes", "Eventos"],
    Estudiante: ["Reservas", "Solicitudes", "Eventos", "Recursos"]
};

export function obtenerSolicitudesPorPerfil(rol = "Estudiante") {
    const todas = obtenerSolicitudes();
    const servicios = FILTROS_POR_PERFIL[rol] ?? FILTROS_POR_PERFIL.Estudiante;
    if (servicios === null) return todas;
    return todas.filter((s) => servicios.includes(s.servicio));
}

// ---- Helpers de estado ----

export function etiquetaEstado(estado) {
    return ETIQUETA_ESTADO[estado] || estado;
}

export function esFinal(estado) {
    return ESTADOS_FINALES.includes(estado);
}

// Siguiente etapa de la cadena lineal principal (ignora rechazada).
export function siguienteEstado(estado) {
    const pos = ORDEN_ESTADOS.indexOf(estado);
    if (pos < 0 || pos >= ORDEN_ESTADOS.length - 1) return null;
    return ORDEN_ESTADOS[pos + 1];
}

export function progresoDe(estado) {
    const pos = ORDEN_ESTADOS.indexOf(estado);
    if (pos < 0) return 0;
    return Math.round((pos / (ORDEN_ESTADOS.length - 1)) * 100);
}

// Resultado de aplicar una acción sobre una solicitud.
// Devuelve { estado, responsable, evento } o null si la acción no aplica.
function aplicarAccion(solicitud, accion, datos = {}) {
    const estado = solicitud.estado;
    const usuario = datos.usuario || solicitud.responsable?.nombre || "Administrador";

    switch (accion) {
        case "crear":
            return {
                estado: "REGISTRADA",
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.CREACION,
                    fecha: datos.fecha,
                    usuario: datos.usuario || "Usuario",
                    descripcion: "Solicitud registrada."
                }
            };

        case "revisar":
            if (estado !== "REGISTRADA") return null;
            return {
                estado: "EN_REVISION",
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.ESTADO,
                    estado: "EN_REVISION",
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.descripcion || "La solicitud pasa a revisión."
                }
            };

        case "asignar":
            if (estado !== "EN_REVISION") return null;
            return {
                estado: "ASIGNADA",
                responsable: datos.responsable ? { id: datos.responsable.id, nombre: datos.responsable.nombre } : solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.ASIGNACION,
                    responsable: datos.responsable?.nombre || "Sin asignar",
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.responsable
                        ? `Asignada a ${datos.responsable.nombre}.`
                        : "Solicitud asignada."
                }
            };

        case "proceso":
            if (estado !== "ASIGNADA") return null;
            return {
                estado: "EN_PROCESO",
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.ESTADO,
                    estado: "EN_PROCESO",
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.descripcion || "Se inicia la atención de la solicitud."
                }
            };

        case "resolver":
            if (estado !== "EN_PROCESO") return null;
            return {
                estado: "RESUELTA",
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.ESTADO,
                    estado: "RESUELTA",
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.descripcion || "Solicitud resuelta."
                }
            };

        case "cerrar":
            if (estado !== "RESUELTA") return null;
            return {
                estado: "CERRADA",
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.ESTADO,
                    estado: "CERRADA",
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.descripcion || "Solicitud cerrada."
                }
            };

        case "pausar":
            if (estado !== "EN_PROCESO") return null;
            return {
                estado: "PAUSADA",
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.PAUSA,
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.descripcion || "Solicitud pausada."
                }
            };

        case "reanudar":
            if (estado !== "PAUSADA") return null;
            return {
                estado: "EN_PROCESO",
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.REANUDA,
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.descripcion || "Se retoma la atención de la solicitud."
                }
            };

        case "rechazar":
            if (!["REGISTRADA", "EN_REVISION", "ASIGNADA"].includes(estado)) return null;
            return {
                estado: "RECHAZADA",
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.RECHAZO,
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.descripcion && datos.descripcion.trim()
                        ? `Rechazada: ${datos.descripcion.trim()}`
                        : "Rechazada (sin motivo)."
                }
            };

        case "reabrir":
            if (!["RESUELTA", "CERRADA", "RECHAZADA"].includes(estado)) return null;
            return {
                estado: "EN_REVISION",
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.REAPERTURA,
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.descripcion && datos.descripcion.trim()
                        ? `Reabierta: ${datos.descripcion.trim()}`
                        : "Solicitud reabierta."
                }
            };

        case "nota":
            return {
                estado: solicitud.estado,
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.NOTA,
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.descripcion && datos.descripcion.trim()
                        ? datos.descripcion.trim()
                        : "Nota sin contenido."
                }
            };

        default:
            return null;
    }
}

// Aplica una acción y persiste. Devuelve la solicitud actualizada o null.
export function ejecutarAccion(id, accion, datos = {}) {
    const lista = obtenerSolicitudes();
    const index = lista.findIndex((s) => String(s.id) === String(id));
    if (index < 0) return null;

    const solicitud = lista[index];
    const resultado = aplicarAccion(solicitud, accion, {
        ...datos,
        fecha: datos.fecha || new Date().toISOString().slice(0, 16).replace("T", " ")
    });
    if (!resultado) return null;

    const idsExistentes = (solicitud.historial || []).map((e) => Number(e.id) || 0);
    const maxId = idsExistentes.length ? Math.max(...idsExistentes) : 0;
    const nuevoEvento = {
        ...resultado.evento,
        id: maxId + 1
    };

    const actualizada = {
        ...solicitud,
        estado: resultado.estado,
        responsable: resultado.responsable,
        historial: [...(solicitud.historial || []), nuevoEvento]
    };

    lista[index] = actualizada;
    guardarSolicitudes(lista);
    return actualizada;
}

export function crearSolicitud({ tipo, servicio, descripcion, prioridad = "Media" }, usuario = "Usuario") {
    const lista = obtenerSolicitudes();
    const fecha = new Date().toISOString().slice(0, 16).replace("T", " ");
    const fechaSolo = fecha.slice(0, 10);

    const nueva = {
        id: `SOL-2026-${String(lista.length + 1).padStart(3, "0")}`,
        tipo,
        servicio,
        prioridad,
        fecha: fechaSolo,
        estado: "REGISTRADA",
        usuario: { id: null, nombre: typeof usuario === "string" ? usuario : usuario?.nombre || "Usuario" },
        responsable: null,
        dependencia: "",
        descripcion,
        historial: [
            { id: 1, tipo: "CREACION", fecha, usuario: typeof usuario === "string" ? usuario : usuario?.nombre || "Usuario", descripcion: "Solicitud registrada." }
        ]
    };

    lista.unshift(nueva);
    guardarSolicitudes(lista);
    return nueva;
}

export function contarPorEstado(lista, estado) {
    return lista.filter((s) => s.estado === estado).length;
}

export default obtenerSolicitudes();
