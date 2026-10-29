// ============================================================
// NOTIFICACIONES — datos del notifications-service (vía gateway).
//
// La tabla `notificaciones` es por usuario: el id se toma de la sesión
// (`uajs_session`), igual que hace api.js con getToken().
//
// La colección "notificaciones" del store entrega primero la caché local
// (paint instantáneo) y después la data real del backend, que repinta la
// vista a través de useColeccion.
// ============================================================

import { notificationsApi } from "./api";
import { mapearNotificacion, mapearNotificacionAPayload } from "./mapeo";
import {
    crearColeccion,
    listar,
    estadoDe,
    refrescar,
    crear,
    actualizar,
    eliminar,
    establecer,
    suscribir
} from "./store";

export const STORAGE_KEY = "uajs_notificaciones";

export const CLAVE_COLECCION = "notificaciones";

const CLAVE_SESION = "uajs_session";

// Categorías que la UI (pestañas de Notificaciones y tarjeta del Dashboard)
// conoce. La BD guarda `tipo_notificacion` en minúsculas y singular.
const TIPOS_UI = {
    solicitud: "Solicitud",
    solicitudes: "Solicitud",
    reserva: "Reserva",
    reservas: "Reserva",
    evento: "Evento",
    eventos: "Evento",
    pqrs: "PQRS",
    soporte: "PQRS",
    info: "Evento",
    sistema: "Evento"
};

// Iconos que existen en components/Icon/Icon.jsx. Los que llegan de la BD
// (check, calendar, clock...) no están y se substitutes por el del tipo.
const ICONOS = [
    "dashboard",
    "solicitudes",
    "reservas",
    "recursos",
    "eventos",
    "usuarios",
    "reportes",
    "notificaciones",
    "pqrs",
    "perfil",
    "configuracion",
    "estudiante",
    "docente",
    "admin",
    "servicios",
    "info",
    "buscar"
];

const ICONO_POR_TIPO = {
    Solicitud: "solicitudes",
    Reserva: "reservas",
    Evento: "eventos",
    PQRS: "pqrs"
};

function sinAcentos(texto) {
    return String(texto ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

/** Id del usuario en sesión; null si no hay sesión válida. */
export function idUsuarioActual() {
    try {
        const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION) || "null");
        return sesion?.id_usuario ?? sesion?.id ?? null;
    } catch {
        return null;
    }
}

/** "YYYY-MM-DD HH:MM" (así llega de la BD) -> "YYYY-MM-DD" para la UI. */
function soloFecha(valor) {
    return valor ? String(valor).slice(0, 10) : "";
}

function normalizarTipo(valor) {
    const normalizado = sinAcentos(valor);
    return TIPOS_UI[normalizado] || (valor ? String(valor) : "Evento");
}

function normalizarIcono(valor, tipo) {
    const icono = sinAcentos(valor);
    if (ICONOS.includes(icono)) return icono;
    return ICONO_POR_TIPO[tipo] || "notificaciones";
}

/**
 * Fila de `notificaciones` -> modelo que usan las páginas.
 * Mantiene los campos del mapper y añade los que la UI necesita.
 */
function normalizarNotificacion(raw) {
    const modelo = mapearNotificacion(raw);
    if (!modelo) return null;

    const tipo = normalizarTipo(modelo.tipo);
    return {
        ...modelo,
        tipo,
        icono: normalizarIcono(modelo.icono, tipo),
        fecha: soloFecha(modelo.fecha),
        leida: Boolean(modelo.leida)
    };
}

function payloadDe(modelo) {
    return mapearNotificacionAPayload({
        ...modelo,
        fecha: modelo.fecha ? `${modelo.fecha} 00:00:00` : new Date()
    });
}

/** Datos precargados: solo se usan mientras la API no responde. */
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

// ============================================================
// COLECCIÓN
// ============================================================

// La semilla entra por `semilla`: el store la pinta en el primer render y la
// reemplaza en cuanto llega la data del notifications-service.
crearColeccion({
    clave: CLAVE_COLECCION,
    // El id se resuelve en cada lectura: si cambia la sesión, la siguiente
    // refresco ya trae las notificaciones del usuario nuevo.
    leer: () => notificationsApi.list(idUsuarioActual()),
    mapear: normalizarNotificacion,
    semilla: notificaciones,
    crear: async (modelo) =>
        normalizarNotificacion(
            await notificationsApi.create(
                payloadDe({ ...modelo, id_usuario: modelo.id_usuario ?? idUsuarioActual() })
            )
        ),
    actualizar: async (modelo) =>
        normalizarNotificacion(
            await notificationsApi.update(modelo.id, payloadDe(modelo))
        ),
    eliminar: async (modelo) => {
        await notificationsApi.remove(modelo.id);
    }
});

// ============================================================
// API PÚBLICA DEL MÓDULO
// ============================================================

/** Escribe en el almacenamiento heredado y avisa al badge del Navbar. */
function persistir(lista) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch {
        // si localStorage no está disponible se ignora
    }
    // Notificar a componentes en la misma pestaña (ej. badge del Navbar)
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("notificaciones-actualizadas"));
    }
}

// Cada vez que el store repinta, el almacenamiento heredado queda al día para
// los componentes que leen de forma síncrona (p. ej. Navbar). Se compara el
// contenido para no escribir en cada notificación de cualquier colección.
let ultimoVolcado = null;
suscribir(() => {
    const lista = listar(CLAVE_COLECCION);
    const volcado = JSON.stringify(lista);
    if (volcado === ultimoVolcado) return;
    ultimoVolcado = volcado;
    persistir(lista);
});

export function obtenerNotificaciones() {
    const lista = listar(CLAVE_COLECCION);
    if (lista.length > 0) return lista;
    // Lista vacía de verdad (usuario sin avisos) o backend caído: en el primer
    // caso se respeta el vacío; en el segundo se pintan los datos precargados.
    return estadoDe(CLAVE_COLECCION).enLinea ? [] : notificaciones;
}

export function guardarNotificaciones(lista) {
    const contenido = Array.isArray(lista) ? lista : [];
    // `establecer` cachea y notifica, así el Navbar y useColeccion se repintan.
    establecer(CLAVE_COLECCION, contenido);
    persistir(contenido);
}

export function refrescarNotificaciones() {
    return refrescar(CLAVE_COLECCION);
}
/**
 * Marca una notificación como leída.
 *
 * OJO: el backend no tiene PATCH /notifications/:id/read. El PUT actualiza
 * TODAS las columnas, así que hay que reenviar la fila completa
 * (notificationsApi.markRead solo manda id_usuario + leida y el controller
 * dejaría titulo/mensaje en NULL, que son NOT NULL).
 */
export async function marcarLeida(item) {
    return actualizar(CLAVE_COLECCION, item, { leida: true });
}

/** Marca como leídas todas las notificaciones del usuario en sesión. */
export async function marcarTodasLeidas() {
    const idUsuario = idUsuarioActual();
    const lista = listar(CLAVE_COLECCION).filter((item) => !item.leida);
    if (!lista.length) return lista;

    if (idUsuario == null) {
        // Sin sesión no se puede garantizar el propietario: solo se marca en
        // la colección local para no romper la UI.
        for (const item of lista) {
            await actualizar(CLAVE_COLECCION, item, { leida: true });
        }
        return lista;
    }

    // markAllRead reenvía cada fila completa con leida = 1.
    await notificationsApi.markAllRead(idUsuario);
    await refrescar(CLAVE_COLECCION);
    return listar(CLAVE_COLECCION);
}

export function crearNotificacion(modelo) {
    return crear(CLAVE_COLECCION, modelo);
}

export function eliminarNotificacion(modelo) {
    return eliminar(CLAVE_COLECCION, modelo);
}

export function obtenerNotificacionesPorPerfil(rol = "Estudiante") {
    const lista = obtenerNotificaciones();
    const filtros = {
        Administrador: () => true,
        Administrativo: (item) => ["Solicitud", "Reserva", "PQRS"].includes(item.tipo),
        Docente: (item) => ["Evento", "Solicitud", "Reserva"].includes(item.tipo),
        Estudiante: (item) => ["Evento", "Reserva", "Solicitud"].includes(item.tipo)
    };
    const filtro = filtros[rol] || filtros.Estudiante;
    if (rol === "Administrador") {
        return lista.map((item) => ({ ...item, prioridad: "alta" }));
    }
    return lista.filter(filtro);
}

export default notificaciones;
