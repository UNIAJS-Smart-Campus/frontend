export const ESTADOS_SOLICITUD = [
    "Registrada",
    "En revisión",
    "Asignada",
    "En proceso",
    "Resuelta",
    "Cerrada"
];

const solicitudes = [
    {
        id: "SOL-2026-001",
        tipo: "Reserva de auditorio",
        dependencia: "Bienestar Universitario",
        fecha: "2026-08-10",
        estado: "En proceso",
        solicitante: "Natalia Rodríguez",
        descripcion: "Reserva del auditorio principal para la semana de ingeniería.",
        historial: [
            { estado: "Registrada", fecha: "2026-08-10", detalle: "Solicitud registrada por el estudiante." },
            { estado: "En revisión", fecha: "2026-08-11", detalle: "En revisión por el área administrativa." },
            { estado: "Asignada", fecha: "2026-08-12", detalle: "Auditorio principal asignado." },
            { estado: "En proceso", fecha: "2026-08-14", detalle: "Confirmando horario y logística del evento." }
        ]
    },
    {
        id: "SOL-2026-002",
        tipo: "Constancia académica",
        dependencia: "Registro y Control Académico",
        fecha: "2026-08-12",
        estado: "Registrada",
        solicitante: "Carlos Méndez",
        descripcion: "Solicitud de constancia de notas del semestre actual.",
        historial: [
            { estado: "Registrada", fecha: "2026-08-12", detalle: "Solicitud registrada por el estudiante." }
        ]
    },
    {
        id: "SOL-2026-003",
        tipo: "Reserva de laboratorio",
        servicio: "Reservas",
        fecha: "2026-08-13",
        estado: "Resuelta",
        solicitante: "Lucía Paredes",
        descripcion: "Laboratorio de informática 3 para práctica de redes.",
        historial: [
            { estado: "Registrada", fecha: "2026-08-13", detalle: "Solicitud registrada por la docente." },
            { estado: "En revisión", fecha: "2026-08-13", detalle: "Verificación de disponibilidad del laboratorio." },
            { estado: "Asignada", fecha: "2026-08-14", detalle: "Laboratorio de informática 3 asignado." },
            { estado: "En proceso", fecha: "2026-08-15", detalle: "Práctica de redes en ejecución." },
            { estado: "Resuelta", fecha: "2026-08-16", detalle: "Reserva culminada con éxito." }
        ]
    },
    {
        id: "SOL-2026-004",
        tipo: "Inscripción a evento",
        servicio: "Eventos",
        fecha: "2026-08-14",
        estado: "En revisión",
        solicitante: "Andrés Ruiz",
        descripcion: "Inscripción al seminario de investigación aplicada.",
        historial: [
            { estado: "Registrada", fecha: "2026-08-14", detalle: "Solicitud registrada por el estudiante." },
            { estado: "En revisión", fecha: "2026-08-15", detalle: "Validación de cupos del seminario." }
        ]
    },
    {
        id: "SOL-2026-005",
        tipo: "Queja",
        servicio: "PQRS",
        fecha: "2026-08-15",
        estado: "Asignada",
        solicitante: "María Torres",
        descripcion: "Queja por el estado de los equipos del laboratorio 2.",
        historial: [
            { estado: "Registrada", fecha: "2026-08-15", detalle: "PQRS registrada por la estudiante." },
            { estado: "En revisión", fecha: "2026-08-16", detalle: "Revisión del área de soporte técnico." },
            { estado: "Asignada", fecha: "2026-08-17", detalle: "Caso asignado al técnico responsable." }
        ]
    },
    {
        id: "SOL-2026-006",
        tipo: "Préstamo de equipos",
        servicio: "Recursos",
        fecha: "2026-08-16",
        estado: "Cerrada",
        solicitante: "Jorge Salazar",
        descripcion: "Préstamo de video proyectores para el foro estudiantil.",
        historial: [
            { estado: "Registrada", fecha: "2026-08-16", detalle: "Solicitud registrada por el estudiante." },
            { estado: "En revisión", fecha: "2026-08-17", detalle: "Verificación de disponibilidad de equipos." },
            { estado: "Asignada", fecha: "2026-08-18", detalle: "2 video proyectores asignados." },
            { estado: "En proceso", fecha: "2026-08-19", detalle: "Equipos entregados para el foro." },
            { estado: "Resuelta", fecha: "2026-08-20", detalle: "Equipos devueltos en buen estado." },
            { estado: "Cerrada", fecha: "2026-08-21", detalle: "Solicitud cerrada por el sistema." }
        ]
    }
];

export default solicitudes;