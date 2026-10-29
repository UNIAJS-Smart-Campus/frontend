// ============================================================
// Eventos — colección conectada al events-service.
//
// El modelo que usa la UI es el que devuelve mapearEvento (BD → front),
// con algunos alias heredados (categoria/hora/lugar) para no romper las
// vistas que todavía los leen. El contador de inscritos lo mantiene el
// backend: aquí solo se consulta y se actualiza llamando a la API de
// inscripciones, nunca se recalcula en cliente.
// ============================================================

import { obtenerUsuarios } from "./users";
import { eventsApi } from "./api";
import { mapearEvento, mapearEventoAPayload } from "./mapeo";
import {
    crearColeccion,
    listar as listarColeccion,
    refrescar as refrescarColeccion,
    crear as crearEnColeccion,
    actualizar as actualizarEnColeccion,
    eliminar as eliminarDeColeccion,
    limpiarCache
} from "./store";

export const CLAVE_EVENTOS = "eventos";

// Estos valores son ENUM estricto en la tabla eventos_y_actividades.
// Cambiarlos aquí provoke errores 500 al insertar o actualizar.
export const CATEGORIAS_EVENTO = [
    "Académico",
    "Cultural",
    "Deportivo",
    "Formación"
];

// `estado` es VARCHAR en la BD; el valor por defecto del backend es 'Programado'.
export const ESTADOS_EVENTO = [
    "Programado",
    "En curso",
    "Finalizado",
    "Cancelado"
];

// La tabla no tiene columna de modalidad: se conserva el dato por
// compatibilidad, pero no se envía al backend.
export const MODALIDADES_EVENTO = ["Presencial", "Virtual", "Híbrido"];

export const STORAGE_KEY = "uajs_eventos";

const ESTADOS_INSCRIBIBLES = ["Programado", "En curso", "Activo"];

function sinAcentos(texto) {
    return String(texto ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

/** Cualquier valor fuera del ENUM produciría un 500; se cae a Académico. */
export function normalizarTipoEvento(valor) {
    const buscado = sinAcentos(valor);
    const encontrado = CATEGORIAS_EVENTO.find(
        (tipo) => sinAcentos(tipo) === buscado
    );
    return encontrado ?? "Académico";
}

export function normalizarEstadoEvento(valor) {
    const encontrado = ESTADOS_EVENTO.find(
        (estado) => sinAcentos(estado) === sinAcentos(valor)
    );
    return encontrado ?? "Programado";
}

function sumarHora(hora, horas) {
    const partes = String(hora || "").split(":");
    const base = Number(partes[0]);
    if (Number.isNaN(base)) return hora;
    const total = Math.min(23, base + horas);
    return `${String(total).padStart(2, "0")}:${partes[1] || "00"}`;
}

function payloadDe(modelo) {
    const horaInicio = modelo.hora_inicio || modelo.hora || "";
    return mapearEventoAPayload({
        ...modelo,
        nombre: modelo.nombre || modelo.titulo,
        hora_inicio: horaInicio,
        // hora_fin es NOT NULL en la BD y el formulario solo pide una hora.
        hora_fin: modelo.hora_fin || sumarHora(horaInicio, 1),
        ubicacion: modelo.ubicacion || modelo.lugar || "Por definir",
        tipo: normalizarTipoEvento(modelo.tipo ?? modelo.categoria),
        estado: normalizarEstadoEvento(modelo.estado),
        inscritos: Number(modelo.inscritos) || 0
    });
}

// ============================================================
// MODELO DE FRONT
// ============================================================

/**
 * Agrega los alias que la UI histórica usa (categoria, hora, lugar)
 * sobre el modelo oficial, para que las vistas que no puedo migrar
 * sigan funcionando sin cambiar de contrato.
 */
function normalizarEvento(modelo) {
    if (!modelo) return null;
    return {
        ...modelo,
        titulo: modelo.titulo || modelo.nombre,
        categoria: modelo.tipo || modelo.categoria,
        hora: modelo.hora_inicio,
        lugar: modelo.ubicacion
    };
}

// ============================================================
// INSCRIPCIONES
// ============================================================

// idEvento -> { usuarios: Set<number>, lista: [] }
const inscripcionesPorEvento = new Map();
// idEvento -> Map<usuarioId, participante> — solo cuando el backend no responde
const participantesLocales = new Map();

function esFalloDeConexion(error) {
    // status 0 = el gateway no respondió (ApiError de api.js).
    return Number(error?.status) === 0;
}

export function participantesDe(evento) {
    if (!evento) return [];
    const remotos =
        inscripcionesPorEvento.get(evento.id)?.lista ??
        (Array.isArray(evento.participantes) ? evento.participantes : []);
    const locales = participantesLocales.get(evento.id);
    if (!locales || locales.size === 0) return remotos;
    const yaEstan = new Set(remotos.map((p) => Number(p.usuarioId)));
    return [
        ...remotos,
        ...Array.from(locales.values()).filter((p) => !yaEstan.has(Number(p.usuarioId)))
    ];
}

/** Trae el padrón real de inscritos del backend (para el panel del admin). */
export async function cargarInscripciones(idEvento) {
    try {
        const filas = await eventsApi.inscripciones(idEvento);
        const lista = (filas ?? []).map((fila) => ({
            id_inscripcion: fila.id_inscripcion,
            usuarioId: Number(fila.id_usuario),
            nombre:
                `${fila.nombre ?? ""} ${fila.apellido ?? ""}`.trim() ||
                "Participante",
            fecha: String(fila.fecha_inscripcion ?? "").slice(0, 10)
        }));
        inscripcionesPorEvento.set(idEvento, {
            usuarios: new Set(lista.map((p) => p.usuarioId)),
            lista
        });
        return lista;
    } catch {
        // Sin backend se muestra lo que haya en la copia local.
        return participantesDe({ id: idEvento });
    }
}

function marcarInscripcionLocal(idEvento, usuarioId, nombre, inscrito) {
    const participantes = participantesLocales.get(idEvento) ?? new Map();
    if (inscrito) {
        participantes.set(Number(usuarioId), {
            usuarioId: Number(usuarioId),
            nombre: nombre || "Usuario",
            fecha: new Date().toISOString().slice(0, 10)
        });
    } else {
        participantes.delete(Number(usuarioId));
    }
    if (participantes.size === 0) {
        participantesLocales.delete(idEvento);
    } else {
        participantesLocales.set(idEvento, participantes);
    }
}

// ============================================================
// SEMILLA (solo se usa si el backend no responde nunca)
// ============================================================

function generarParticipantesIniciales(n) {
    const total = Math.max(0, Number(n) || 0);
    if (total === 0) return [];

    const usuarios = obtenerUsuarios().filter((u) => u.estado === "Activo");
    if (usuarios.length === 0) return [];

    const fechas = [
        "2026-08-25", "2026-08-26", "2026-08-27", "2026-08-28",
        "2026-08-29", "2026-08-30", "2026-08-31", "2026-09-01"
    ];

    const resultado = [];
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

export const EVENTOS_BASE = [
    {
        id: 1,
        nombre: "Cátedra de inteligencia artificial aplicada",
        titulo: "Cátedra de inteligencia artificial aplicada",
        descripcion: "Jornada académica con expertos en IA aplicada, innovación y transformación digital.",
        fecha: "2026-09-08",
        hora_inicio: "09:30",
        hora_fin: "11:30",
        ubicacion: "Auditorio principal",
        tipo: "Académico",
        estado: "Programado",
        cupo: 150,
        inscritos: 6,
        participantes: generarParticipantesIniciales(6)
    },
    {
        id: 2,
        nombre: "Taller de emprendimiento y liderazgo",
        titulo: "Taller de emprendimiento y liderazgo",
        descripcion: "Sesión práctica para desarrollar modelos de negocio, pitch y trabajo en equipo.",
        fecha: "2026-09-15",
        hora_inicio: "14:00",
        hora_fin: "16:00",
        ubicacion: "Salón 205",
        tipo: "Formación",
        estado: "Programado",
        cupo: 45,
        inscritos: 4,
        participantes: generarParticipantesIniciales(4)
    },
    {
        id: 3,
        nombre: "Ciclo de cine y cultura universitaria",
        titulo: "Ciclo de cine y cultura universitaria",
        descripcion: "Proyección, conversación y análisis del papel de la cultura en la vida universitaria.",
        fecha: "2026-09-18",
        hora_inicio: "18:00",
        hora_fin: "20:00",
        ubicacion: "Auditorio B",
        tipo: "Cultural",
        estado: "Programado",
        cupo: 90,
        inscritos: 5,
        participantes: generarParticipantesIniciales(5)
    },
    {
        id: 4,
        nombre: "Torneo deportivo intercampus",
        titulo: "Torneo deportivo intercampus",
        descripcion: "Encuentro deportivo entre facultades con representación de cada programa.",
        fecha: "2026-09-22",
        hora_inicio: "08:30",
        hora_fin: "12:30",
        ubicacion: "Cancha central",
        tipo: "Deportivo",
        estado: "Programado",
        cupo: 220,
        inscritos: 7,
        participantes: generarParticipantesIniciales(7)
    },
    {
        id: 5,
        nombre: "Seminario de investigación aplicada",
        titulo: "Seminario de investigación aplicada",
        descripcion: "Presentación de proyectos de investigación y resultados de trabajo de grado.",
        fecha: "2026-09-29",
        hora_inicio: "15:00",
        hora_fin: "17:00",
        ubicacion: "Laboratorio de innovación",
        tipo: "Académico",
        estado: "Programado",
        cupo: 60,
        inscritos: 3,
        participantes: generarParticipantesIniciales(3)
    },
    {
        id: 6,
        nombre: "Semana de bienestar y salud mental",
        titulo: "Semana de bienestar y salud mental",
        descripcion: "Actividades de acompañamiento, sensibilización y bienestar para la comunidad universitaria.",
        fecha: "2026-10-05",
        hora_inicio: "10:00",
        hora_fin: "12:00",
        ubicacion: "Campus principal",
        tipo: "Cultural",
        estado: "Programado",
        cupo: 180,
        inscritos: 7,
        participantes: generarParticipantesIniciales(7)
    }
];

// ============================================================
// COLECCIÓN
// ============================================================

crearColeccion({
    clave: CLAVE_EVENTOS,
    leer: () => eventsApi.list(),
    // La API devuelve la fila de BD (tipo_evento, nombre_evento...); primero
    // se traduce al modelo de la UI y después se normaliza.
    mapear: (raw) => normalizarEvento(mapearEvento(raw)),
    semilla: EVENTOS_BASE,
    crear: async (modelo) => {
        const creado = await eventsApi.create(payloadDe(modelo));
        return normalizarEvento(mapearEvento(creado));
    },
    actualizar: async (modelo) => {
        const guardado = await eventsApi.update(modelo.id, payloadDe(modelo));
        return normalizarEvento(mapearEvento(guardado));
    },
    eliminar: async (modelo) => {
        await eventsApi.remove(modelo.id);
    }
});

// ============================================================
// API PÚBLICA DEL MÓDULO
// ============================================================

export function obtenerEventos() {
    return listarColeccion(CLAVE_EVENTOS);
}

export function refrescarEventos() {
    return refrescarColeccion(CLAVE_EVENTOS);
}

export function limpiarCacheEventos() {
    limpiarCache(CLAVE_EVENTOS);
}

export function crearEvento(modelo) {
    return crearEnColeccion(CLAVE_EVENTOS, modelo);
}

export function actualizarEvento(modelo, cambios) {
    return actualizarEnColeccion(CLAVE_EVENTOS, modelo, cambios);
}

export function eliminarEvento(modelo) {
    return eliminarDeColeccion(CLAVE_EVENTOS, modelo);
}

/**
 * Escritura de compatibilidad: la colección es la fuente de verdad, así que
 * solo se deja la lista en el almacenamiento heredado y se pide resync.
 */
export function guardarEventos(lista) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch {
        // si localStorage no está disponible se ignora
    }
    refrescarColeccion(CLAVE_EVENTOS);
}

export function contarInscritos(evento) {
    if (!evento) return 0;
    const base = Array.isArray(evento.participantes)
        ? evento.participantes.length
        : Number(evento.inscritos) || 0;
    return base + (participantesLocales.get(evento.id)?.size ?? 0);
}

export function estaInscrito(evento, usuarioId) {
    if (!evento || usuarioId == null) return false;
    const cache = inscripcionesPorEvento.get(evento.id);
    if (cache) return cache.usuarios.has(Number(usuarioId));
    if (participantesLocales.get(evento.id)?.has(Number(usuarioId))) return true;
    return (
        Array.isArray(evento.participantes) &&
        evento.participantes.some((p) => Number(p.usuarioId) === Number(usuarioId))
    );
}

export function cuposDisponibles(evento) {
    const libres = (evento?.cupo || 0) - contarInscritos(evento);
    return Math.max(0, libres);
}

/** Solo se pueden abrir inscripciones mientras el evento está vigente. */
export function esEventoInscripcionAbierta(evento) {
    if (!evento) return false;
    return ESTADOS_INSCRIBIBLES.includes(String(evento.estado));
}

/**
 * Inscribe al usuario contra el backend. El cupo y el contador los
 * valida y actualiza el propio servidor.
 * @returns {Promise<{offline?: boolean}>}
 */
export async function inscribirEvento(evento, usuarioId, nombre) {
    if (!evento || usuarioId == null) {
        throw new Error("No se puede inscribir sin un usuario identificado.");
    }

    try {
        await eventsApi.register(evento.id, usuarioId);
        marcarInscripcionLocal(evento.id, usuarioId, nombre, false);
        const cache = inscripcionesPorEvento.get(evento.id);
        if (cache && !cache.usuarios.has(Number(usuarioId))) {
            cache.usuarios.add(Number(usuarioId));
            cache.lista = [
                ...cache.lista,
                {
                    usuarioId: Number(usuarioId),
                    nombre: nombre || "Usuario",
                    fecha: new Date().toISOString().slice(0, 10)
                }
            ];
        }
        await refrescarColeccion(CLAVE_EVENTOS);
        return {};
    } catch (error) {
        if (!esFalloDeConexion(error)) throw error;
        // Sin backend se conserva el comportamiento offline.
        marcarInscripcionLocal(evento.id, usuarioId, nombre, true);
        return { offline: true };
    }
}

/** Desinscribe al usuario; el backend descuenta el contador. */
export async function desinscribirEvento(evento, usuarioId) {
    if (!evento || usuarioId == null) return { offline: true };

    try {
        await eventsApi.unregister(evento.id, usuarioId);
        const cache = inscripcionesPorEvento.get(evento.id);
        if (cache) {
            cache.usuarios.delete(Number(usuarioId));
            cache.lista = cache.lista.filter((p) => Number(p.usuarioId) !== Number(usuarioId));
        }
        marcarInscripcionLocal(evento.id, usuarioId, null, false);
        await refrescarColeccion(CLAVE_EVENTOS);
        return {};
    } catch (error) {
        if (!esFalloDeConexion(error)) throw error;
        marcarInscripcionLocal(evento.id, usuarioId, null, false);
        return { offline: true };
    }
}

const CATEGORIAS_POR_ROL = {
    Administrador: null,
    Administrativo: ["Deportivo", "Académico"],
    Docente: ["Académico", "Formación"],
    Estudiante: ["Académico", "Cultural", "Formación"]
};

export function obtenerEventosPorPerfil(rol = "Estudiante") {
    const todos = obtenerEventos();
    const categorias = CATEGORIAS_POR_ROL[rol];
    if (!categorias) return todos;
    return todos.filter((evento) => categorias.includes(evento.tipo));
}

export default EVENTOS_BASE;
