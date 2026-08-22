const services = [
    {
        name: "Solicitudes",
        icon: "solicitudes",
        category: "Académico",
        path: "/solicitudes",
        description: "Registra y da seguimiento a tus solicitudes de servicios académicos.",
        resources: [
            "Constancias académicas",
            "Certificados de estudio",
            "Cambio de programa",
            "Homologaciones"
        ],
        options: [
            "Crear nueva solicitud",
            "Consultar estado de una solicitud",
            "Seguimiento de la evolución"
        ]
    },
    {
        name: "Reservas",
        icon: "reservas",
        category: "Infraestructura",
        path: "/reservas",
        description: "Reserva salones, laboratorios, auditorios y equipos del campus.",
        resources: [
            "Salones de clase",
            "Laboratorios de informática",
            "Auditorios",
            "Equipos audiovisuales"
        ],
        options: [
            "Seleccionar recurso",
            "Consultar disponibilidad",
            "Registrar reserva"
        ]
    },
    {
        name: "Recursos",
        icon: "recursos",
        category: "Infraestructura",
        path: "/recursos",
        description: "Consulta los recursos disponibles de la universidad.",
        resources: [
            "Espacios físicos",
            "Equipos de laboratorio",
            "Material bibliográfico",
            "Herramientas tecnológicas"
        ],
        options: [
            "Explorar catálogo de recursos",
            "Filtrar por tipo",
            "Ver disponibilidad"
        ]
    },
    {
        name: "Eventos",
        icon: "eventos",
        category: "Cultura",
        path: "/eventos",
        description: "Descubre las actividades y eventos organizados por la comunidad.",
        resources: [
            "Seminarios académicos",
            "Talleres y conferencias",
            "Actividades culturales",
            "Ferias universitarias"
        ],
        options: [
            "Ver agenda de eventos",
            "Inscribirse a un evento",
            "Publicar un evento"
        ]
    },
    {
        name: "Notificaciones",
        icon: "notificaciones",
        category: "Comunicación",
        path: "/notificaciones",
        description: "Recibe avisos de cambios de estado, reservas y eventos.",
        resources: [
            "Cambios de estado de solicitudes",
            "Confirmaciones de reserva",
            "Nuevos eventos",
            "Alertas institucionales"
        ],
        options: [
            "Marcar como leída",
            "Configurar tipo de avisos",
            "Ver historial"
        ]
    },
    {
        name: "PQRS",
        icon: "pqrs",
        category: "Atención",
        path: "/pqrs",
        description: "Presenta peticiones, quejas, reclamos y sugerencias.",
        resources: [
            "Peticiones",
            "Quejas",
            "Reclamos",
            "Sugerencias"
        ],
        options: [
            "Crear nueva PQRS",
            "Consultar mis PQRS",
            "Dar seguimiento a la respuesta"
        ]
    }
];

export default services;
