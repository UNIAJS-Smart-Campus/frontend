import { obtenerUsuarios } from "./users";

export const CATEGORIAS_EVENTO = ["Académico", "Cultural", "Formación", "Institucional"];

export const ESTADOS_EVENTO = ["Activo", "Finalizado", "Cancelado"];

export const MODALIDADES_EVENTO = ["Presencial", "Virtual", "Híbrido"];

function generarParticipantesIniciales(n) {
    const total = Math.max(0, Number(n) || 0);
    if (total === 0) return [];

    const usuarios = obtenerUsuarios().filter((u) => u.estado === "Activo");
    if (usuarios.length === 0) return [];

    const resultado = [];
    const fechas = [
        "2026-08-25", "2026-08-26", "2026-08-27", "2026-08-28",
        "2026-08-29", "2026-08-30", "2026-08-31", "2026-09-01"
    ];

    for (let i = 0; i < total; i += 1) {
        const u = usuarios[i % usuarios.length];
        resultado.push({
            usuarioId: u.id,
            nombre: u.nombre,
            fecha: fechas[i % fechas.length]
        });
    }
    return resultado;
}

// Número de inscritos ficticios por usuario (id del evento precargado)
const INSCRITOS_MOCK_POR_EVENTO = {
    1: 6,
    2: 4,
    3: 5,
    4: 7,
    5: 3,
    6: 7
};

function migrarEvento(ev) {
    if (!ev || typeof ev !== "object") return ev;

    const participantes = Array.isArray(ev.participantes) ? ev.participantes : [];
    // ¿Hay participantes que ya llegaron con usuario real (no null)?
    const participantesReales = participantes.filter((p) => p.usuarioId != null);

    // Para eventos precargados (id conocido), siempre garantizar que tengamos
    // los inscritos ficticios iniciales si no hay ningún participante real.
    if (INSCRITOS_MOCK_POR_EVENTO[ev.id] != null && participantesReales.length === 0) {
        return {
            ...ev,
            participantes: generarParticipantesIniciales(INSCRITOS_MOCK_POR_EVENTO[ev.id]),
            _migrado: true
        };
    }

    // Ya migrado y con participantes → no tocar
    if (ev._migrado) return ev;

    let next = { ...ev };
    const legacy = typeof next.inscritos === "number" ? next.inscritos : 0;
    delete next.inscritos;

    const participantesNull = participantes.filter((p) => p.usuarioId == null);

    // Evento no precargado con número legacy + cero participantes → poblar
    if (participantes.length === 0 && legacy > 0) {
        next.participantes = generarParticipantesIniciales(legacy);
        next._migrado = true;
        return next;
    }

    // Convertir cualquier participante null restante a un usuario real
    if (participantesNull.length > 0) {
        const reales = obtenerUsuarios().filter((u) => u.estado === "Activo");
        let idx = 0;
        const convertidos = participantes.map((p) => {
            if (p.usuarioId != null) return p;
            const rep = reales[idx % reales.length];
            idx += 1;
            return rep ? { ...p, usuarioId: rep.id, nombre: rep.nombre } : p;
        });
        next.participantes = convertidos;
    }

    next._migrado = true;
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
        participantes: generarParticipantesIniciales(6),
        _migrado: true,
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
        participantes: generarParticipantesIniciales(4),
        _migrado: true,
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
        participantes: generarParticipantesIniciales(5),
        _migrado: true,
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
        participantes: generarParticipantesIniciales(7),
        _migrado: true,
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
        participantes: generarParticipantesIniciales(3),
        _migrado: true,
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
        participantes: generarParticipantesIniciales(7),
        _migrado: true,
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