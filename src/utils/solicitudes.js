// ============================================================
// SOLICITUDES — Utilidades del módulo
// Modelo tipo mesa de ayuda (helpdesk) con historial de eventos
// tipados y evolución del estado de la solicitud.
//
// El almacenamiento es la colección "solicitudes" del store: primero se
// pinta la caché local y después llega la data del requests-service
// (vía gateway), que repinta la vista a través de useColeccion.
// ============================================================

import { requestsApi } from "./api";
import { mapearSolicitud, mapearSolicitudAPayload } from "./mapeo";
import { crearColeccion, listar, refrescar, crear, establecer } from "./store";

// Estados en código (mayúsculas). ETIQUETA_ESTADO para mostrar.
// Incluye RECHAZADA para que el gráfico de reportes la contabilice.
export const ESTADOS_SOLICITUD = [
    "REGISTRADA",
    "EN_REVISION",
    "ASIGNADA",
    "EN_PROCESO",
    "PAUSADA",
    "RESUELTA",
    "CERRADA",
    "RECHAZADA"
];

// RECHAZADA es terminal y fuera de la cadena lineal.
export const ESTADOS_FINALES = ["CERRADA", "RECHAZADA"];

export const ETIQUETA_ESTADO = {
    REGISTRADA: "Registrada",
    EN_REVISION: "En revisión",
    ASIGNADA: "Asignada",
    EN_PROCESO: "En proceso",
    PAUSADA: "Pausada",
    RESUELTA: "Resuelta",
    CERRADA: "Cerrada",
    RECHAZADA: "Rechazada"
};

// Orden de presentación en progreso/timeline (cadena principal).
export const ORDEN_ESTADOS = [
    "REGISTRADA",
    "EN_REVISION",
    "ASIGNADA",
    "EN_PROCESO",
    "RESUELTA",
    "CERRADA"
];

export const ESTADO_COLOR = {
    REGISTRADA: "yellow",
    EN_REVISION: "blue",
    ASIGNADA: "purple",
    EN_PROCESO: "blue",
    PAUSADA: "gray",
    RESUELTA: "green",
    CERRADA: "gray",
    RECHAZADA: "red"
};

// Acciones disponibles por estado (para mostrar botones coherentes).
export const ACCIONES_POR_ESTADO = {
    REGISTRADA: ["revisar", "rechazar", "nota"],
    EN_REVISION: ["asignar", "rechazar", "nota"],
    ASIGNADA: ["proceso", "rechazar", "nota"],
    EN_PROCESO: ["resolver", "pausar", "nota"],
    PAUSADA: ["reanudar", "nota"],
    RESUELTA: ["cerrar", "reabrir", "nota"],
    CERRADA: ["reabrir", "nota"],
    RECHAZADA: ["reabrir", "nota"]
};

// Tipos de eventos del historial.
export const TIPOS_EVENTO = {
    CREACION: "CREACION",
    ESTADO: "ESTADO",
    NOTA: "NOTA",
    ASIGNACION: "ASIGNACION",
    RECHAZO: "RECHAZO",
    REAPERTURA: "REAPERTURA",
    PAUSA: "PAUSA",
    REANUDA: "REANUDA"
};

const SOLICITUDES_BASE = [
    {
        id: "SOL-2026-001",
        tipo: "Reserva de auditorio",

        historial: [
            { id: 1, tipo: "CREACION", fecha: "2026-09-02 08:20", usuario: "Carlos Méndez", descripcion: "Solicitud registrada." },
            { id: 2, tipo: "NOTA", fecha: "2026-09-02 09:00", usuario: "Carlos Pérez", descripcion: "Se solicita documento de identidad adicional." }
        ]
    },
    {
        id: "SOL-2026-003",
        tipo: "Reserva de laboratorio",
        servicio: "Reservas",
        prioridad: "Media",
        fecha: "2026-09-04",
        estado: "RESUELTA",
        usuario: { id: 12, nombre: "Lucía Paredes" },
        responsable: { id: 4, nombre: "Carlos Pérez" },
        dependencia: "Laboratorios",
        descripcion: "Uso del laboratorio de informática 3 para práctica de redes y configuración básica.",
        historial: [
            { id: 1, tipo: "CREACION", fecha: "2026-09-04 07:40", usuario: "Lucía Paredes", descripcion: "Solicitud registrada." },
            { id: 2, tipo: "ESTADO", estado: "EN_REVISION", fecha: "2026-09-04 08:00", usuario: "Carlos Pérez", descripcion: "Verificación de disponibilidad del laboratorio." },
            { id: 3, tipo: "ASIGNACION", responsable: "Carlos Pérez", fecha: "2026-09-05 09:10", usuario: "Carlos Pérez", descripcion: "Laboratorio asignado para la práctica." },
            { id: 4, tipo: "ESTADO", estado: "EN_PROCESO", fecha: "2026-09-06 14:00", usuario: "Carlos Pérez", descripcion: "Sesión ejecutada con equipos activos." },
            { id: 5, tipo: "ESTADO", estado: "RESUELTA", fecha: "2026-09-07 16:30", usuario: "Carlos Pérez", descripcion: "Reserva cerrada sin incidencias." }
        ]
    },
    {
        id: "SOL-2026-004",
        tipo: "Inscripción a evento",
        servicio: "Eventos",
        prioridad: "Baja",
        fecha: "2026-09-05",
        estado: "REGISTRADA",
        usuario: { id: 28, nombre: "Andrés Ruiz" },
        responsable: null,
        dependencia: "Bienestar Universitario",
        descripcion: "Inscripción al taller de emprendimiento y liderazgo del programa académico.",
        historial: [
            { id: 1, tipo: "CREACION", fecha: "2026-09-05 10:10", usuario: "Andrés Ruiz", descripcion: "Solicitud registrada." }
        ]
    },
    {
        id: "SOL-2026-005",
        tipo: "Soporte técnico",
        servicio: "PQRS",
        prioridad: "Alta",
        fecha: "2026-09-06",
        estado: "PAUSADA",
        usuario: { id: 29, nombre: "María Torres" },
        responsable: { id: 4, nombre: "Carlos Pérez" },
        dependencia: "Infraestructura Tecnológica",
        descripcion: "Reporte de fallas en los equipos del laboratorio de sistemas y conexión a red.",
        historial: [
            { id: 1, tipo: "CREACION", fecha: "2026-09-06 08:00", usuario: "María Torres", descripcion: "Solicitud registrada." },
            { id: 2, tipo: "ESTADO", estado: "EN_REVISION", fecha: "2026-09-06 08:30", usuario: "Carlos Pérez", descripcion: "Caso asignado a soporte tecnológico." },
            { id: 3, tipo: "ASIGNACION", responsable: "Carlos Pérez", fecha: "2026-09-07 09:00", usuario: "Carlos Pérez", descripcion: "Técnico responsable definido para la revisión." },
            { id: 4, tipo: "ESTADO", estado: "EN_PROCESO", fecha: "2026-09-07 11:20", usuario: "Carlos Pérez", descripcion: "Diagnóstico inicial de la falla." },
            { id: 5, tipo: "PAUSA", fecha: "2026-09-08 10:00", usuario: "Carlos Pérez", descripcion: "En espera de respuesta del proveedor de red." }
        ]
    },
    {
        id: "SOL-2026-006",
        tipo: "Préstamo de equipos",
        servicio: "Recursos",
        prioridad: "Media",
        fecha: "2026-09-08",
        estado: "CERRADA",
        usuario: { id: 30, nombre: "Jorge Salazar" },
        responsable: { id: 4, nombre: "Carlos Pérez" },
        dependencia: "Logística",
        descripcion: "Préstamo de dos proyectores para la feria de empleabilidad y actividades de ingreso.",
        historial: [
            { id: 1, tipo: "CREACION", fecha: "2026-09-08 06:50", usuario: "Jorge Salazar", descripcion: "Solicitud registrada." },
            { id: 2, tipo: "ESTADO", estado: "EN_REVISION", fecha: "2026-09-08 07:15", usuario: "Carlos Pérez", descripcion: "Verificación de disponibilidad de equipos." },
            { id: 3, tipo: "ASIGNACION", responsable: "Carlos Pérez", fecha: "2026-09-09 08:40", usuario: "Carlos Pérez", descripcion: "Dos equipos asignados al evento." },
            { id: 4, tipo: "ESTADO", estado: "EN_PROCESO", fecha: "2026-09-10 13:00", usuario: "Carlos Pérez", descripcion: "Entrega finalizada para la actividad." },
            { id: 5, tipo: "ESTADO", estado: "RESUELTA", fecha: "2026-09-12 17:20", usuario: "Carlos Pérez", descripcion: "Equipos devueltos y revisados." },
            { id: 6, tipo: "ESTADO", estado: "CERRADA", fecha: "2026-09-13 09:00", usuario: "Carlos Pérez", descripcion: "Solicitud cerrada por el sistema." }
        ]
    }
];

// ---- Colección del módulo ----

const CLAVE_COLECCION = "solicitudes";

// Nombre del servicio -> id_servicio de la BD.
const SERVICIO_ID = {
    Solicitudes: 1,
    Reservas: 2,
    Eventos: 3,
    Recursos: 4,
    PQRS: 5
};

async function leerRemoto() {
    return requestsApi.list();
}

async function crearRemoto(modelo) {
    const creado = await requestsApi.create(mapearSolicitudAPayload(modelo));
    return mapearSolicitud(creado) || modelo;
}

// Colección: caché local -> render inmediato -> refresco asíncrono desde la API.
const coleccion = crearColeccion({
    clave: CLAVE_COLECCION,
    leer: leerRemoto,
    mapear: mapearSolicitud,
    semilla: SOLICITUDES_BASE,
    crear: crearRemoto
});

function ahora() {
    return new Date().toISOString().slice(0, 16).replace("T", " ");
}

/** Fija la lista en la colección, la cachea y avisa a los suscriptores. */
function fijarLista(lista) {
    establecer(CLAVE_COLECCION, lista);
}

/** Inserta o reemplaza una solicitud dentro de la colección. */
function guardarEnColeccion(solicitud) {
    const lista = obtenerSolicitudes();
    const existe = lista.some((s) => String(s.id) === String(solicitud.id));
    const siguiente = existe
        ? lista.map((s) => (String(s.id) === String(solicitud.id) ? solicitud : s))
        : [solicitud, ...lista];
    fijarLista(siguiente);
}

export function obtenerSolicitudes() {
    return listar(CLAVE_COLECCION);
}

export function guardarSolicitudes(solicitudes) {
    const lista = Array.isArray(solicitudes) && solicitudes.length
        ? solicitudes
        : SOLICITUDES_BASE;
    fijarLista(lista);
}

export function resetSolicitudes() {
    fijarLista(SOLICITUDES_BASE);
    // La semilla queda en pantalla de inmediato; el store vuelve a pedirla
    // al backend en segundo plano.
    refrescar(CLAVE_COLECCION);
}

export function obtenerSolicitudPorId(id) {
    return (
        obtenerSolicitudes().find(
            (s) => String(s.id) === String(id) || String(s.id_solicitud) === String(id)
        ) || null
    );
}

// ---- Filtro por rol ----
const FILTROS_POR_PERFIL = {
    Administrador: null,
    Administrativo: ["Reservas", "PQRS", "Solicitudes"],
    Docente: ["Reservas", "Solicitudes", "Eventos"],
    Estudiante: ["Reservas", "Solicitudes", "Eventos", "Recursos"]
};

export function obtenerSolicitudesPorPerfil(rol = "Estudiante") {
    const todas = obtenerSolicitudes();
    const servicios = FILTROS_POR_PERFIL[rol] ?? FILTROS_POR_PERFIL.Estudiante;
    if (servicios === null) return todas;
    return todas.filter((s) => servicios.includes(s.servicio));
}

// ---- Helpers de estado ----

export function etiquetaEstado(estado) {
    return ETIQUETA_ESTADO[estado] || estado;
}

export function esFinal(estado) {
    return ESTADOS_FINALES.includes(estado);
}

// Siguiente etapa de la cadena lineal principal (ignora rechazada).
export function siguienteEstado(estado) {
    const pos = ORDEN_ESTADOS.indexOf(estado);
    if (pos < 0 || pos >= ORDEN_ESTADOS.length - 1) return null;
    return ORDEN_ESTADOS[pos + 1];
}

export function progresoDe(estado) {
    const pos = ORDEN_ESTADOS.indexOf(estado);
    if (pos < 0) return 0;
    return Math.round((pos / (ORDEN_ESTADOS.length - 1)) * 100);
}

// Resultado de aplicar una acción sobre una solicitud.
// Devuelve { estado, responsable, evento } o null si la acción no aplica.
function aplicarAccion(solicitud, accion, datos = {}) {
    const estado = solicitud.estado;
    const usuario = datos.usuario || solicitud.responsable?.nombre || "Administrador";

    switch (accion) {
        case "crear":
            return {
                estado: "REGISTRADA",
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.CREACION,
                    fecha: datos.fecha,
                    usuario: datos.usuario || "Usuario",
                    descripcion: "Solicitud registrada."
                }
            };

        case "revisar":
            if (estado !== "REGISTRADA") return null;
            return {
                estado: "EN_REVISION",
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.ESTADO,
                    estado: "EN_REVISION",
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.descripcion || "La solicitud pasa a revisión."
                }
            };

        case "asignar":
            if (estado !== "EN_REVISION") return null;
            return {
                estado: "ASIGNADA",
                responsable: datos.responsable ? { id: datos.responsable.id, nombre: datos.responsable.nombre } : solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.ASIGNACION,
                    responsable: datos.responsable?.nombre || "Sin asignar",
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.responsable
                        ? `Asignada a ${datos.responsable.nombre}.`
                        : "Solicitud asignada."
                }
            };

        case "proceso":
            if (estado !== "ASIGNADA") return null;
            return {
                estado: "EN_PROCESO",
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.ESTADO,
                    estado: "EN_PROCESO",
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.descripcion || "Se inicia la atención de la solicitud."
                }
            };

        case "resolver":
            if (estado !== "EN_PROCESO") return null;
            return {
                estado: "RESUELTA",
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.ESTADO,
                    estado: "RESUELTA",
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.descripcion || "Solicitud resuelta."
                }
            };

        case "cerrar":
            if (estado !== "RESUELTA") return null;
            return {
                estado: "CERRADA",
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.ESTADO,
                    estado: "CERRADA",
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.descripcion || "Solicitud cerrada."
                }
            };

        case "pausar":
            if (estado !== "EN_PROCESO") return null;
            return {
                estado: "PAUSADA",
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.PAUSA,
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.descripcion || "Solicitud pausada."
                }
            };

        case "reanudar":
            if (estado !== "PAUSADA") return null;
            return {
                estado: "EN_PROCESO",
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.REANUDA,
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.descripcion || "Se retoma la atención de la solicitud."
                }
            };

        case "rechazar":
            if (!["REGISTRADA", "EN_REVISION", "ASIGNADA"].includes(estado)) return null;
            return {
                estado: "RECHAZADA",
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.RECHAZO,
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.descripcion && datos.descripcion.trim()
                        ? `Rechazada: ${datos.descripcion.trim()}`
                        : "Rechazada (sin motivo)."
                }
            };

        case "reabrir":
            if (!["RESUELTA", "CERRADA", "RECHAZADA"].includes(estado)) return null;
            return {
                estado: "EN_REVISION",
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.REAPERTURA,
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.descripcion && datos.descripcion.trim()
                        ? `Reabierta: ${datos.descripcion.trim()}`
                        : "Solicitud reabierta."
                }
            };

        case "nota":
            return {
                estado: solicitud.estado,
                responsable: solicitud.responsable,
                evento: {
                    tipo: TIPOS_EVENTO.NOTA,
                    fecha: datos.fecha,
                    usuario,
                    descripcion: datos.descripcion && datos.descripcion.trim()
                        ? datos.descripcion.trim()
                        : "Nota sin contenido."
                }
            };

        default:
            return null;
    }
}

// Aplica una acción contra el backend y refleja el resultado en la colección.
// Devuelve la solicitud actualizada o null si la acción no aplica.
export async function ejecutarAccion(id, accion, datos = {}) {
    const solicitud = obtenerSolicitudPorId(id);
    if (!solicitud) return null;

    const resultado = aplicarAccion(solicitud, accion, {
        ...datos,
        fecha: datos.fecha || ahora()
    });
    if (!resultado) return null;

    const historial = solicitud.historial || [];
    const idsExistentes = historial.map((e) => Number(e.id) || 0);
    const maxId = idsExistentes.length ? Math.max(...idsExistentes) : 0;
    const nuevoEvento = {
        ...resultado.evento,
        id: maxId + 1
    };

    // Estado optimista por si el backend no responde.
    const optimista = {
        ...solicitud,
        estado: resultado.estado,
        responsable: resultado.responsable,
        historial: [...historial, nuevoEvento]
    };

    const idBd = solicitud.id_solicitud ?? null;
    if (!idBd) {
        // Solo vive en la caché local: no hay fila que avanzar en la BD.
        guardarEnColeccion(optimista);
        return optimista;
    }

    const cuerpo = {
        accion,
        estado: resultado.estado,
        responsable: resultado.responsable?.id ?? "",
        usuario: datos.usuario || "Administrador",
        descripcion: nuevoEvento.descripcion || ""
    };

    try {
        const remoto = accion === "nota"
            ? await requestsApi.addNote(idBd, {
                  usuario: cuerpo.usuario,
                  descripcion: cuerpo.descripcion
              })
            : await requestsApi.advance(idBd, cuerpo);

        const actualizada = mapearSolicitud(remoto) || optimista;
        guardarEnColeccion(actualizada);
        coleccion.enLinea = true;
        return actualizada;
    } catch {
        // Sin backend se conserva el cambio local para no perder la interacción.
        guardarEnColeccion(optimista);
        return optimista;
    }
}

export async function crearSolicitud(
    { tipo, servicio, descripcion, prioridad = "Media" },
    usuario = "Usuario"
) {
    const lista = obtenerSolicitudes();
    const fecha = ahora();
    const nombreUsuario =
        typeof usuario === "string" ? usuario : usuario?.nombre || "Usuario";
    const idUsuario = typeof usuario === "object" && usuario ? usuario?.id ?? null : null;

    const nueva = {
        id: `SOL-2026-${String(lista.length + 1).padStart(3, "0")}`,
        tipo,
        servicio,
        id_servicio: SERVICIO_ID[servicio] ?? null,
        prioridad,
        fecha: fecha.slice(0, 10),
        estado: "REGISTRADA",
        solicitante: nombreUsuario,
        usuario: { id: idUsuario, nombre: nombreUsuario },
        responsable: null,
        dependencia: "",
        descripcion,
        historial: [
            {
                id: 1,
                tipo: TIPOS_EVENTO.CREACION,
                fecha,
                usuario: nombreUsuario,
                descripcion: "Solicitud registrada."
            }
        ]
    };

    // El store hace el POST optimista y revierte si el backend rechaza;
    // el error se propaga para que la UI lo muestre.
    const creada = await crear(CLAVE_COLECCION, nueva);
    return creada || nueva;
}

export function contarPorEstado(lista, estado) {
    return lista.filter((s) => s.estado === estado).length;
}

export default obtenerSolicitudes();
