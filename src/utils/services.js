// ============================================================
// SERVICIOS — catálogo de módulos de la plataforma.
//
// DECISIÓN: estos datos siguen siendo estáticos a propósito.
// El backend no expone /api/services; la tabla `servicios` del esquema
// (id_servicio, nombre, descripcion, estado) es la que usa el módulo de
// Solicitudes para clasificar cada trámite (ver SERVICIO_NOMBRE en
// mapeo.js), NO el catálogo de módulos que muestra esta pantalla.
//
// Cada tarjeta es un acceso a un módulo de la app (Solicitudes, Reservas,
// Recursos, Eventos, Notificaciones, PQRS) con su ícono, categoría y
// descripción: no existe tabla que los describa, así que inventar una
// llamada a la API solo produciría errores. Para los datos vivos de cada
// módulo se usan sus colecciones del store (recursos, eventos, pqrs...).
// ============================================================

const services = [
    {
        name: "Solicitudes",
        icon: "solicitudes",
        category: "Académico",
        path: "/solicitudes",
        description: "Gestiona trámites académicos y servicios institucionales del Smart Campus UNIAJS.",
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
        description: "Consulta y reserva espacios, aulas, laboratorios y equipos del campus inteligente.",
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
        description: "Explora el catálogo de recursos universitarios disponibles para la comunidad.",
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
        description: "Descubre actividades académicas, culturales y comunitarias de la universidad.",
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
        description: "Recibe avisos relevantes sobre solicitudes, reservas, eventos y comunicaciones institucionales.",
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
        description: "Presenta peticiones, quejas, reclamos y sugerencias para mejorar la experiencia universitaria.",
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
