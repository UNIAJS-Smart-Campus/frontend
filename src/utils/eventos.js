export const CATEGORIAS_EVENTO = ["Académico", "Cultural", "Formación", "Institucional"];

export const ESTADOS_EVENTO = ["Activo", "Finalizado", "Cancelado"];

export const MODALIDADES_EVENTO = ["Presencial", "Virtual", "Híbrido"];

const eventos = [
    {
        id: 1,
        nombre: "Cátedra de inteligencia artificial aplicada",
        fecha: "2026-09-08",
        hora: "09:30",
        lugar: "Auditorio principal",
        categoria: "Académico",
        descripcion: "Jornada académica con expertos en IA aplicada, innovación y transformación digital.",
        estado: "Activo",
        cupo: 150,
        inscritos: 118,
        ponente: "Dra. Ana María López",
        modalidad: "Presencial"
    },
    {
        id: 2,
        nombre: "Taller de emprendimiento y liderazgo",
        fecha: "2026-09-15",
        hora: "14:00",
        lugar: "Salón 205",
        categoria: "Formación",
        descripcion: "Sesión práctica para desarrollar modelos de negocio, pitch y trabajo en equipo.",
        estado: "Activo",
        cupo: 45,
        inscritos: 36,
        ponente: "Daniel Ruiz",
        modalidad: "Híbrido"
    },
    {
        id: 3,
        nombre: "Ciclo de cine y cultura universitaria",
        fecha: "2026-09-18",
        hora: "18:00",
        lugar: "Auditorio B",
        categoria: "Cultural",
        descripcion: "Proyección, conversación y análisis del papel de la cultura en la vida universitaria.",
        estado: "Activo",
        cupo: 90,
        inscritos: 58,
        ponente: "Colectivo cultural UAJS",
        modalidad: "Presencial"
    },
    {
        id: 4,
        nombre: "Feria de empleabilidad 2026",
        fecha: "2026-09-22",
        hora: "08:30",
        lugar: "Patio central",
        categoria: "Institucional",
        descripcion: "Encuentro con empresas, programas de prácticas y oportunidades de empleo para estudiantes.",
        estado: "Activo",
        cupo: 220,
        inscritos: 187,
        ponente: "Vicerrectoría de bienestar y empleabilidad",
        modalidad: "Presencial"
    },
    {
        id: 5,
        nombre: "Seminario de investigación aplicada",
        fecha: "2026-09-29",
        hora: "15:00",
        lugar: "Laboratorio de innovación",
        categoria: "Académico",
        descripcion: "Presentación de proyectos de investigación y resultados de trabajo de grado.",
        estado: "Activo",
        cupo: 60,
        inscritos: 49,
        ponente: "Dra. Carolina Ruiz",
        modalidad: "Virtual"
    },
    {
        id: 6,
        nombre: "Semana de bienestar y salud mental",
        fecha: "2026-10-05",
        hora: "10:00",
        lugar: "Campus principal",
        categoria: "Cultural",
        descripcion: "Actividades de acompañamiento, sensibilización y bienestar para la comunidad universitaria.",
        estado: "Activo",
        cupo: 180,
        inscritos: 142,
        ponente: "Bienestar institucional",
        modalidad: "Híbrido"
    }
];

export const STORAGE_KEY = "uajs_eventos";

export function obtenerEventos() {
    try {
        const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (guardados.length > 0) return guardados;
        guardarEventos(eventos);
        return eventos;
    } catch {
        return eventos;
    }
}

export function guardarEventos(lista) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch {
        // si localStorage no está disponible se ignora
    }
}

const CATEGORIAS_POR_ROL = {
    Administrador: null,
    Administrativo: ["Institucional", "Académico"],
    Docente: ["Académico", "Formación"],
    Estudiante: ["Académico", "Cultural", "Formación"]
};

export function obtenerEventosPorPerfil(rol = "Estudiante") {
    const todos = obtenerEventos();
    const cats = CATEGORIAS_POR_ROL[rol];
    if (!cats) return todos;
    return todos.filter((evento) => cats.includes(evento.categoria));
}

export default eventos;