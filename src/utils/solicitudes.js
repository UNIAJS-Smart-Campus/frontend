export const ESTADOS_SOLICITUD = [
    "Registrada",
    "En revisión",
    "Asignada",
    "En proceso",
    "Resuelta",
    "Cerrada"
];

const SOLICITUDES_BASE = [
    {
        id: "SOL-2026-001",
        tipo: "Reserva de auditorio",
        servicio: "Reservas",
        fecha: "2026-09-01",
        estado: "En proceso",
        solicitante: "Natalia Rodríguez",
        descripcion: "Reserva del auditorio principal para la cátedra de inteligencia artificial aplicada.",
        historial: [
            { estado: "Registrada", fecha: "2026-09-01", detalle: "Solicitud registrada por la estudiante." },
            { estado: "En revisión", fecha: "2026-09-01", detalle: "Verificación de disponibilidad y logística del espacio." },
            { estado: "Asignada", fecha: "2026-09-02", detalle: "Auditorio principal asignado para la actividad." },
            { estado: "En proceso", fecha: "2026-09-03", detalle: "Se está confirmando la agenda y recursos audiovisuales." }
        ]
    },
    {
        id: "SOL-2026-002",
        tipo: "Constancia académica",
        servicio: "Solicitudes",
        fecha: "2026-09-02",
        estado: "Registrada",
        solicitante: "Carlos Méndez",
        descripcion: "Solicitud de constancia de notas para trámites administrativos del semestre actual.",
        historial: [
            { estado: "Registrada", fecha: "2026-09-02", detalle: "Solicitud enviada por el estudiante." }
        ]
    },
    {
        id: "SOL-2026-003",
        tipo: "Reserva de laboratorio",
        servicio: "Reservas",
        fecha: "2026-09-04",
        estado: "Resuelta",
        solicitante: "Lucía Paredes",
        descripcion: "Uso del laboratorio de informática 3 para práctica de redes y configuración básica.",
        historial: [
            { estado: "Registrada", fecha: "2026-09-04", detalle: "Solicitud registrada por la docente." },
            { estado: "En revisión", fecha: "2026-09-04", detalle: "Verificación de disponibilidad del laboratorio." },
            { estado: "Asignada", fecha: "2026-09-05", detalle: "Laboratorio asignado para la práctica." },
            { estado: "En proceso", fecha: "2026-09-06", detalle: "Sesión ejecutada con equipos activos." },
            { estado: "Resuelta", fecha: "2026-09-07", detalle: "Reserva cerrada sin incidencias." }
        ]
    },
    {
        id: "SOL-2026-004",
        tipo: "Inscripción a evento",
        servicio: "Eventos",
        fecha: "2026-09-05",
        estado: "En revisión",
        solicitante: "Andrés Ruiz",
        descripcion: "Inscripción al taller de emprendimiento y liderazgo del programa académico.",
        historial: [
            { estado: "Registrada", fecha: "2026-09-05", detalle: "Solicitud registrada por el estudiante." },
            { estado: "En revisión", fecha: "2026-09-06", detalle: "Validación de cupos y requisitos del taller." }
        ]
    },
    {
        id: "SOL-2026-005",
        tipo: "Soporte técnico",
        servicio: "PQRS",
        fecha: "2026-09-06",
        estado: "Asignada",
        solicitante: "María Torres",
        descripcion: "Reporte de fallas en los equipos del laboratorio de sistemas y conexión a red.",
        historial: [
            { estado: "Registrada", fecha: "2026-09-06", detalle: "PQRS registrada por la estudiante." },
            { estado: "En revisión", fecha: "2026-09-06", detalle: "Caso asignado a soporte tecnológico." },
            { estado: "Asignada", fecha: "2026-09-07", detalle: "Técnico responsable definido para la revisión." }
        ]
    },
    {
        id: "SOL-2026-006",
        tipo: "Préstamo de equipos",
        servicio: "Recursos",
        fecha: "2026-09-08",
        estado: "Cerrada",
        solicitante: "Jorge Salazar",
        descripcion: "Préstamo de dos proyectores para la feria de empleabilidad y actividades de ingreso.",
        historial: [
            { estado: "Registrada", fecha: "2026-09-08", detalle: "Solicitud registrada por el estudiante." },
            { estado: "En revisión", fecha: "2026-09-08", detalle: "Verificación de disponibilidad de equipos." },
            { estado: "Asignada", fecha: "2026-09-09", detalle: "Dos equipos asignados al evento." },
            { estado: "En proceso", fecha: "2026-09-10", detalle: "Entrega finalizada para la actividad." },
            { estado: "Resuelta", fecha: "2026-09-12", detalle: "Equipos devueltos y revisados." },
            { estado: "Cerrada", fecha: "2026-09-13", detalle: "Solicitud cerrada por el sistema." }
        ]
    }
];

const STORAGE_KEY = "ua_js_solicitudes";

export function obtenerSolicitudes() {
    if (typeof window === "undefined") return SOLICITUDES_BASE;

    try {
        const guardadas = localStorage.getItem(STORAGE_KEY);
        if (!guardadas) return SOLICITUDES_BASE;
        const parsed = JSON.parse(guardadas);
        return Array.isArray(parsed) && parsed.length ? parsed : SOLICITUDES_BASE;
    } catch {
        return SOLICITUDES_BASE;
    }
}

export function guardarSolicitudes(solicitudes) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudes));
}

export function crearSolicitud({ tipo, servicio, descripcion, prioridad = "Media" }, solicitante = "Usuario") {
    const actual = obtenerSolicitudes();
    const fecha = new Date().toISOString().slice(0, 10);
    const nueva = {
        id: `SOL-2026-${String(actual.length + 1).padStart(3, "0")}`,
        tipo,
        servicio,
        descripcion,
        prioridad,
        fecha,
        estado: "Registrada",
        solicitante,
        historial: [
            {
                estado: "Registrada",
                fecha,
                detalle: "Solicitud registrada por el usuario."
            }
        ]
    };

    const actualizadas = [nueva, ...actual];
    guardarSolicitudes(actualizadas);
    return nueva;
}

export const SOLICITUDES_POR_PERFIL = {
    Administrador: obtenerSolicitudes(),
    Administrativo: obtenerSolicitudes().filter((solicitud) => ["Reservas", "PQRS", "Solicitudes"].includes(solicitud.servicio)),
    Docente: obtenerSolicitudes().filter((solicitud) => ["Reservas", "Solicitudes", "Eventos"].includes(solicitud.servicio)),
    Estudiante: obtenerSolicitudes().filter((solicitud) => ["Reservas", "Solicitudes", "Eventos", "Recursos"].includes(solicitud.servicio))
};

export function obtenerSolicitudesPorPerfil(rol = "Estudiante") {
    return (SOLICITUDES_POR_PERFIL[rol] || SOLICITUDES_POR_PERFIL.Estudiante) ?? SOLICITUDES_POR_PERFIL.Estudiante;
}

export default obtenerSolicitudes();