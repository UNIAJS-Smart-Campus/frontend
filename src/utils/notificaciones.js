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

export const NOTIFICACIONES_POR_PERFIL = {
    Administrador: notificaciones.map((item) => ({ ...item, prioridad: "alta" })),
    Administrativo: notificaciones.filter((item) => ["Solicitud", "Reserva", "PQRS"].includes(item.tipo)),
    Docente: notificaciones.filter((item) => ["Evento", "Solicitud", "Reserva"].includes(item.tipo)),
    Estudiante: notificaciones.filter((item) => ["Evento", "Reserva", "Solicitud"].includes(item.tipo))
};

export function obtenerNotificacionesPorPerfil(rol = "Estudiante") {
    return NOTIFICACIONES_POR_PERFIL[rol] || NOTIFICACIONES_POR_PERFIL.Estudiante;
}

export default notificaciones;