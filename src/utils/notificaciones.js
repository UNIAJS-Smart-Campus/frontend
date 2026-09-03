export const STORAGE_KEY = "uajs_notificaciones";

export function obtenerNotificaciones() {
    try {
        const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (guardados.length > 0) return guardados;
        guardarNotificaciones(notificaciones);
        return notificaciones;
    } catch {
        return notificaciones;
    }
}

export function guardarNotificaciones(lista) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
        // Notificar a componentes en la misma pestaña (ej. badge del Navbar)
        window.dispatchEvent(new Event("notificaciones-actualizadas"));
    } catch {
        // si localStorage no está disponible se ignora
    }
}

const notificaciones = [
    {
        id: 1,
        tipo: "Solicitud",
        icono: "solicitudes",
        mensaje: "Tu solicitud SOL-2026-001 cambió a 'En proceso' para la reserva del auditorio principal.",
        fecha: "2026-09-03",
        leida: false
    },
    {
        id: 2,
        tipo: "Reserva",
        icono: "reservas",
        mensaje: "La reserva del laboratorio de informática 3 quedó confirmada para el 6 de septiembre.",
        fecha: "2026-09-05",
        leida: false
    },
    {
        id: 3,
        tipo: "Evento",
        icono: "eventos",
        mensaje: "Nuevo evento: Cátedra de inteligencia artificial aplicada, abierta a toda la comunidad.",
        fecha: "2026-09-06",
        leida: true
    },
    {
        id: 4,
        tipo: "PQRS",
        icono: "pqrs",
        mensaje: "Tu caso de soporte técnico fue asignado al equipo de infraestructura tecnológica.",
        fecha: "2026-09-07",
        leida: false
    },
    {
        id: 5,
        tipo: "Reserva",
        icono: "reservas",
        mensaje: "Recordatorio: la reserva del salón 205 vence mañana y requiere confirmación final.",
        fecha: "2026-09-08",
        leida: true
    },
    {
        id: 6,
        tipo: "Evento",
        icono: "eventos",
        mensaje: "Publicación: Feria de empleabilidad 2026 con empresas y oportunidades de práctica.",
        fecha: "2026-09-09",
        leida: true
    }
];

export function obtenerNotificacionesPorPerfil(rol = "Estudiante") {
    const lista = obtenerNotificaciones();
    const filtros = {
        Administrador: () => true,
        Administrativo: (item) => ["Solicitud", "Reserva", "PQRS"].includes(item.tipo),
        Docente: (item) => ["Evento", "Solicitud", "Reserva"].includes(item.tipo),
        Estudiante: (item) => ["Evento", "Reserva", "Solicitud"].includes(item.tipo)
    };
    const filtro = filtros[rol] || filtros.Estudiante;
    if (rol === "Administrador") {
        return lista.map((item) => ({ ...item, prioridad: "alta" }));
    }
    return lista.filter(filtro);
}

export default notificaciones;