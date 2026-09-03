export const CATEGORIAS_EVENTO = ["Académico", "Cultural", "Formación", "Institucional"];

export const ESTADOS_EVENTO = ["Activo", "Finalizado", "Cancelado"];

export const MODALIDADES_EVENTO = ["Presencial", "Virtual", "Híbrido"];

function generarParticipantesIniciales(n) {
    const total = Math.max(0, Number(n) || 0);
    const resultado = [];
    for (let i = 0; i < total; i += 1) {
        resultado.push({
            usuarioId: null,
            nombre: `Inscrito #${i + 1}`,
            fecha: "2026-08-30"
        });
    }
    return resultado;
}

const ESTUDIANTES_ACTIVOS = [
    4, 6, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
    27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 39, 40, 41, 42, 43, 44,
    45, 46, 47, 48, 50, 51, 52, 53, 54, 55, 56
];

const CUPO_POR_EVENTO = {
    1: 47,
    2: 35,
    3: 47,
    4: 187,
    5: 47,
    6: 142
};

const INSCRITOS_SEED = Object.fromEntries(
    Object.entries(CUPO_POR_EVENTO).map(([eventoId, cupo]) => {
        const total = Math.min(cupo, ESTUDIANTES_ACTIVOS.length);
        const ronda = [];
        let i = 0;
        while (ronda.length < total) {
            const id = ESTUDIANTES_ACTIVOS[i % ESTUDIANTES_ACTIVOS.length];
            ronda.push(id);
            i += 1;
        }
        return [eventoId, ronda];
    })
);

function lookupNombre(usuarioId) {
    if (usuarioId == null) return "Inscrito";
    const map = {
        4: "Andrés Torres",
        6: "Valentina Morales",
        9: "Camila Restrepo",
        10: "Santiago Pérez",
        11: "Daniela Ortiz",
        12: "Mateo Salazar",
        13: "Isabella Vargas",
        14: "Sebastián Castro",
        15: "Mariana López",
        16: "Tomás Herrera",
        17: "Luciana Ramírez",
        18: "Joaquín Morales",
        19: "Sara Quintero",
        20: "Felipe Mendoza",
        21: "Juliana Ríos",
        22: "David Ospina",
        23: "Paula Aguilar",
        24: "Andrés Felipe Duarte",
        25: "Manuela Cabrera",
        27: "Ana Sofía Castillo",
        28: "Juan Pablo Ramírez",
        29: "María Camila Vega",
        30: "Carlos Andrés Pinilla",
        31: "Laura Daniela Forero",
        32: "Andrés Mauricio León",
        33: "Valentina Espinosa",
        34: "Diego Alejandro Soto",
        35: "Catalina Mejía",
        36: "Jorge Eduardo Bernal",
        37: "Natalia Cardona",
        39: "Sofía Alexandra Ruiz",
        40: "Luis Fernando Castaño",
        41: "Daniela Fernanda Núñez",
        42: "Mauricio Ortiz",
        43: "Alejandra Torres",
        44: "Sergio Iván Montenegro",
        45: "Ximena Alexandra Lara",
        46: "Bryan Stiven Ortiz",
        47: "Tatiana Andrea Ríos",
        48: "Kevin Andrés Saldarriaga",
        50: "Hernán Darío Zapata",
        51: "Laura Melissa Gutiérrez",
        52: "Julián Andrés Cárdenas",
        53: "María José Pacheco",
        54: "Camilo Ernesto Restrepo",
        55: "Melissa Andrea Torres",
        56: "Iván Darío Salazar"
    };
    return map[usuarioId] || `Inscrito #${usuarioId}`;
}

function generarParticipantesPorEvento(eventoId) {
    const ids = INSCRITOS_SEED[eventoId] || [];
    return ids.map((uid) => ({
        usuarioId: uid,
        nombre: lookupNombre(uid),
        fecha: "2026-08-30"
    }));
}

function migrarEvento(ev) {
    if (!ev || typeof ev !== "object") return ev;
    if (Array.isArray(ev.participantes)) return ev;
    const legacy = typeof ev.inscritos === "number" ? ev.inscritos : 0;
    const next = { ...ev };
    delete next.inscritos;
    next.participantes = generarParticipantesIniciales(legacy);
    return next;
}

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
        participantes: generarParticipantesPorEvento(1),
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
        participantes: generarParticipantesPorEvento(2),
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
        participantes: generarParticipantesPorEvento(3),
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
        participantes: generarParticipantesPorEvento(4),
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
        participantes: generarParticipantesPorEvento(5),
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
        participantes: generarParticipantesPorEvento(6),
        ponente: "Bienestar institucional",
        modalidad: "Híbrido"
    }
];

export const STORAGE_KEY = "uajs_eventos";

export function contarInscritos(evento) {
    return Array.isArray(evento?.participantes) ? evento.participantes.length : 0;
}

export function estaInscrito(evento, usuarioId) {
    if (!evento || !Array.isArray(evento.participantes) || usuarioId == null) {
        return false;
    }
    return evento.participantes.some((p) => p.usuarioId === usuarioId);
}

export function cuposDisponibles(evento) {
    const libres = (evento?.cupo || 0) - contarInscritos(evento);
    return Math.max(0, libres);
}

export function obtenerEventos() {
    try {
        const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (Array.isArray(guardados) && guardados.length > 0) {
            const migrados = guardados.map(migrarEvento);
            const necesitaGuardar = migrados.some(
                (m, i) => m !== guardados[i]
            );
            if (necesitaGuardar) guardarEventos(migrados);
            return migrados;
        }
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