// ============================================================
// Reservas — colección conectada al reservations-service.
//
// El modelo canónico es el de mapearReserva (BD → front). Se agregan
// alias en camelCase (usuarioId, horaInicio, horaFin, proposito) porque
// otras vistas que no dependen de esta migración siguen leyéndolos.
//
// Cancelar una reserva NO la borra: el backend expone PUT con `estado`,
// que es lo que usa la tabla (Confirmada / Pendiente / Cancelada).
// ============================================================

import { reservationsApi } from "./api";
import { mapearReserva, mapearReservaAPayload } from "./mapeo";
import {
    crearColeccion,
    listar as listarColeccion,
    refrescar as refrescarColeccion,
    crear as crearEnColeccion,
    actualizar as actualizarEnColeccion,
    eliminar as eliminarDeColeccion,
    limpiarCache
} from "./store";

export const CLAVE_RESERVAS = "reservas";

// `estado` es VARCHAR en la tabla reservas.
export const ESTADOS_RESERVA = ["Confirmada", "Pendiente", "Cancelada"];

export const STORAGE_KEY = "uajs_reservas";

function sinAcentos(texto) {
    return String(texto ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

export function normalizarEstadoReserva(valor) {
    const encontrado = ESTADOS_RESERVA.find(
        (estado) => sinAcentos(estado) === sinAcentos(valor)
    );
    return encontrado ?? "Pendiente";
}

/** Alias heredados para no romper las vistas que aún usan el nombre viejo. */
function normalizarReserva(modelo) {
    if (!modelo) return null;
    return {
        ...modelo,
        usuarioId: modelo.id_usuario,
        tipoRecurso: modelo.tipo_recurso,
        horaInicio: modelo.hora_inicio,
        horaFin: modelo.hora_fin,
        proposito: modelo.motivo
    };
}

function payloadDe(modelo) {
    return {
        ...mapearReservaAPayload({
            ...modelo,
            motivo: modelo.motivo ?? modelo.proposito ?? "",
            hora_inicio: modelo.hora_inicio || modelo.horaInicio,
            hora_fin: modelo.hora_fin || modelo.horaFin,
            estado: normalizarEstadoReserva(modelo.estado)
        })
    };
}

/** Compara por id cuando ambos lo tienen; si no, cae al nombre del recurso. */
export function mismoRecurso(reserva, recurso) {
    if (!reserva || !recurso) return false;
    if (reserva.id_recurso != null && recurso.id != null) {
        return Number(reserva.id_recurso) === Number(recurso.id);
    }
    return reserva.recurso === recurso.nombre;
}

export function mismoUsuario(reserva, usuarioId) {
    if (!reserva || usuarioId == null) return false;
    if (reserva.id_usuario != null) return Number(reserva.id_usuario) === Number(usuarioId);
    return reserva.usuarioId === usuarioId;
}

// ============================================================
// SEMILLA (solo si el backend nunca responde)
// ============================================================

function fechaSumada(dias) {
    const f = new Date();
    f.setDate(f.getDate() + dias);
    return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
}

export const RESERVAS_BASE = [
    {
        id: "RES-INICIAL-1",
        id_usuario: 4,
        id_recurso: null,
        recurso: "Sala de Conferencias 1",
        tipo_recurso: "Salas",
        usuario: "Andrés Torres",
        fecha: fechaSumada(1),
        hora_inicio: "10:00",
        hora_fin: "12:00",
        motivo: "Reunión de grupo",
        observaciones: "",
        estado: "Confirmada"
    },
    {
        id: "RES-INICIAL-2",
        id_usuario: 4,
        id_recurso: null,
        recurso: "Laboratorio de Informatica 1",
        tipo_recurso: "Laboratorios",
        usuario: "Andrés Torres",
        fecha: fechaSumada(2),
        hora_inicio: "14:00",
        hora_fin: "16:00",
        motivo: "Práctica de programación",
        observaciones: "",
        estado: "Pendiente"
    },
    {
        id: "RES-INICIAL-3",
        id_usuario: 3,
        id_recurso: null,
        recurso: "Auditorio Principal",
        tipo_recurso: "Auditorios",
        usuario: "Laura Gómez",
        fecha: fechaSumada(3),
        hora_inicio: "08:00",
        hora_fin: "09:00",
        motivo: "Asamblea estudiantil",
        observaciones: "",
        estado: "Confirmada"
    },
    {
        id: "RES-INICIAL-4",
        id_usuario: 3,
        id_recurso: null,
        recurso: "Sala de Conferencias 2",
        tipo_recurso: "Salas",
        usuario: "Laura Gómez",
        fecha: fechaSumada(4),
        hora_inicio: "09:00",
        hora_fin: "11:00",
        motivo: "Clase de matemáticas",
        observaciones: "",
        estado: "Confirmada"
    },
    {
        id: "RES-INICIAL-5",
        id_usuario: 4,
        id_recurso: null,
        recurso: "Laboratorio de Física",
        tipo_recurso: "Laboratorios",
        usuario: "Andrés Torres",
        fecha: fechaSumada(5),
        hora_inicio: "13:00",
        hora_fin: "15:00",
        motivo: "Práctica de laboratorio",
        observaciones: "",
        estado: "Cancelada"
    },
    {
        id: "RES-INICIAL-6",
        id_usuario: 1,
        id_recurso: null,
        recurso: "Proyector Portatil 1",
        tipo_recurso: "Equipos",
        usuario: "Natalia Rodríguez",
        fecha: fechaSumada(6),
        hora_inicio: "16:00",
        hora_fin: "18:00",
        motivo: "Presentación de proyecto de grado",
        observaciones: "",
        estado: "Pendiente"
    },
    {
        id: "RES-INICIAL-7",
        id_usuario: 2,
        id_recurso: null,
        recurso: "Auditorio VIP",
        tipo_recurso: "Auditorios",
        usuario: "Carlos Méndez",
        fecha: fechaSumada(7),
        hora_inicio: "15:00",
        hora_fin: "17:00",
        motivo: "Conferencia de empleabilidad",
        observaciones: "",
        estado: "Confirmada"
    },
    {
        id: "RES-INICIAL-8",
        id_usuario: 5,
        id_recurso: null,
        recurso: "Laboratorio de Informatica 1",
        tipo_recurso: "Laboratorios",
        usuario: "María Fernanda Cárdenas",
        fecha: fechaSumada(8),
        hora_inicio: "08:00",
        hora_fin: "10:00",
        motivo: "Práctica de configuración de routers",
        observaciones: "",
        estado: "Confirmada"
    }
].map(normalizarReserva);

// ============================================================
// COLECCIÓN
// ============================================================

crearColeccion({
    clave: CLAVE_RESERVAS,
    leer: () => reservationsApi.list(),
    // La API devuelve la fila de BD (id_reserva, nombre_recurso...); primero
    // se traduce al modelo de la UI y después se normaliza.
    mapear: (raw) => normalizarReserva(mapearReserva(raw)),
    semilla: RESERVAS_BASE,
    crear: async (modelo) => {
        const creada = await reservationsApi.create(payloadDe(modelo));
        return normalizarReserva(mapearReserva(creada));
    },
    actualizar: async (modelo) => {
        const guardada = await reservationsApi.update(modelo.id, payloadDe(modelo));
        return normalizarReserva(mapearReserva(guardada));
    },
    eliminar: async (modelo) => {
        await reservationsApi.remove(modelo.id);
    }
});

// ============================================================
// API PÚBLICA DEL MÓDULO
// ============================================================

export function obtenerReservas() {
    return listarColeccion(CLAVE_RESERVAS);
}

export function refrescarReservas() {
    return refrescarColeccion(CLAVE_RESERVAS);
}

export function limpiarCacheReservas() {
    limpiarCache(CLAVE_RESERVAS);
}

export function crearReserva(modelo) {
    return crearEnColeccion(CLAVE_RESERVAS, modelo);
}

export function actualizarReserva(modelo, cambios) {
    return actualizarEnColeccion(CLAVE_RESERVAS, modelo, cambios);
}

export function eliminarReserva(modelo) {
    return eliminarDeColeccion(CLAVE_RESERVAS, modelo);
}

/** Cancelar reserva: es un PUT de estado, no un DELETE. */
export function cancelarReserva(modelo) {
    return actualizarEnColeccion(CLAVE_RESERVAS, modelo, { estado: "Cancelada" });
}

export function guardarReservas(lista) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch {
        // si localStorage no está disponible se ignora
    }
    refrescarColeccion(CLAVE_RESERVAS);
}

export default RESERVAS_BASE;
