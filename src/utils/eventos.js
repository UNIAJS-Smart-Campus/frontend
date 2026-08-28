export const CATEGORIAS_EVENTO = ["Académico", "Cultural", "Formación", "Institucional"];

export const ESTADOS_EVENTO = ["Activo", "Finalizado", "Cancelado"];

const eventos = [
    {
        id: 1,
        nombre: "Semana de la Ingeniería",
        fecha: "2026-08-20",
        hora: "09:00",
        lugar: "Auditorio principal",
        categoria: "Académico",
        descripcion: "Jornada de conferencias y talleres con invitados del sector productivo.",
        estado: "Finalizado",
        cupo: 120,
        inscritos: 104
    },
    {
        id: 2,
        nombre: "Seminario de investigación aplicada",
        fecha: "2026-08-22",
        hora: "14:00",
        lugar: "Salón 205",
        categoria: "Académico",
        descripcion: "Presentación de proyectos de investigación de estudiantes y docentes.",
        estado: "Finalizado",
        cupo: 40,
        inscritos: 38
    },
    {
        id: 3,
        nombre: "Foro estudiantil",
        fecha: "2026-08-25",
        hora: "10:00",
        lugar: "Auditorio B",
        categoria: "Cultural",
        descripcion: "Espacio de diálogo sobre la vida universitaria y bienestar estudiantil.",
        estado: "Activo",
        cupo: 80,
        inscritos: 52
    },
    {
        id: 4,
        nombre: "Feria universitaria 2026",
        fecha: "2026-08-28",
        hora: "08:00",
        lugar: "Patio central",
        categoria: "Cultural",
        descripcion: "Exposición de programas académicos, servicios y emprendimientos estudiantiles.",
        estado: "Activo",
        cupo: 200,
        inscritos: 176
    },
    {
        id: 5,
        nombre: "Taller de emprendimiento",
        fecha: "2026-09-02",
        hora: "15:00",
        lugar: "Laboratorio de informática 1",
        categoria: "Formación",
        descripcion: "Taller práctico para la creación de planes de negocio.",
        estado: "Activo",
        cupo: 30,
        inscritos: 12
    }
];

export default eventos;