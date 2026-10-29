// ============================================================
// PQRS — datos del feedback-service (vía gateway).
//
// La tabla `pqrs` tiene un ENUM estricto en `tipo`: solo admite
// 'Petición', 'Queja', 'Reclamo' y 'Sugerencia'. Cualquier otro valor
// provoca un error 500 al insertar o actualizar, por eso normalizarTipo()
// corrige las variantes sin tilde que trae el seed de la BD.
// `estado` sí es VARCHAR(30), con valor por defecto 'Abierta'.
//
// La colección "pqrs" del store entrega primero la caché local y después la
// data real del backend, que repinta la vista a través de useColeccion.
// ============================================================

import { feedbackApi } from "./api";
import { mapearPqrs, mapearPqrsAPayload } from "./mapeo";
import {
    crearColeccion,
    listar,
    refrescar,
    crear,
    actualizar,
    eliminar
} from "./store";

export const TIPOS_PQRS = [
    "Petición",
    "Queja",
    "Reclamo",
    "Sugerencia"
];

// Catálogo canónico de estados de PQRS.
// Úsalo siempre que necesites comparar o listar estados para evitar strings sueltos.
export const ESTADOS_PQRS = [
    "En revisión",
    "Asignada",
    "En proceso",
    "Resuelta",
    "Cerrada"
];

// Estado en el que nace una PQRS recién radicada (VARCHAR en la BD).
export const ESTADO_INICIAL = "Registrada";

// Ciclo de vida completo, del registro al cierre.
export const CICLO_ESTADOS = [ESTADO_INICIAL, ...ESTADOS_PQRS];

// Estados que se consideran abiertos (no finalizados).
// 'Abierta' es el valor por defecto de la columna `estado` en la BD.
export const ESTADOS_PQRS_ABIERTOS = ["Registrada", "Abierta", "En revisión", "Asignada", "En proceso"];
export const ESTADOS_PQRS_FINALES  = ["Resuelta", "Cerrada"];

export const SEDES = [
    "SINCELEJO",
    "CARTAGENA",
    "BARRANQUILLA"
];

export const TIPOS_PERFIL = [
    "Estudiante",
    "Docente",
    "Egresado",
    "Funcionario",
    "Administrativo",
    "Proveedor",
    "Visitante"
];

export const TIPOS_DOCUMENTO = [
    "Cédula de ciudadanía (CC)",
    "Cédula de extranjería (CE)",
    "Tarjeta de identidad (TI)",
    "Pasaporte",
    "NIT",
    "Documento nacional de identidad (DNI)"
];

export const AREAS_PQRS = [
    "Admisiones y Registro",
    "Bienestar Universitario",
    "Biblioteca",
    "Cartera y Financiación",
    "Comunicación y Marketing",
    "Dirección Académica",
    "Egresados",
    "Facultad de Ciencias Administrativas, Económicas y Contables",
    "Facultad de Ciencias de la Ingeniería",
    "Facultad de Ciencias de la Salud",
    "Facultad de Ciencias Sociales y Educación",
    "Investigación e Innovación",
    "Internacionalización",
    "PQRS",
    "Recursos Humanos",
    "Servicios Generales",
    "Sistemas e Infraestructura TI",
    "Tesorería"
];

export const STORAGE_KEY = "uajs_pqrs";

export const CLAVE_COLECCION = "pqrs";

export const PQRS_BASE = [
    {
        id: "PQRS-2026-014",
        tipo: "Queja",
        sede: "SINCELEJO",
        tipoPerfil: "Estudiante",
        tipoDocumento: "Cédula de ciudadanía (CC)",
        identificacion: "1102861234",
        nombre: "Laura Gómez",
        telefono: "3001234567",
        correo: "laura.gomez@uajs.edu.co",
        area: "Facultad de Ciencias de la Ingeniería",
        asunto: "Demora en la atención de certificados",
        descripcion: "Queja por la demora en la atención del servicio de certificados y constancias académicas.",
        fecha: "2026-09-01",
        estado: "En revisión",
        solicitante: "Laura Gómez",
        usuarioId: 3,
        adjunto: null
    },
    {
        id: "PQRS-2026-013",
        tipo: "Petición",
        sede: "SINCELEJO",
        tipoPerfil: "Estudiante",
        tipoDocumento: "Cédula de ciudadanía (CC)",
        identificacion: "1102456789",
        nombre: "Carlos Pérez",
        telefono: "3009876543",
        correo: "carlos.perez@uajs.edu.co",
        area: "Admisiones y Registro",
        asunto: "Información sobre homologación",
        descripcion: "Solicitud de información sobre el proceso de homologación de asignaturas y requisitos.",
        fecha: "2026-08-28",
        estado: "Resuelta",
        solicitante: "Carlos Pérez",
        usuarioId: 4,
        adjunto: null
    },
    {
        id: "PQRS-2026-012",
        tipo: "Sugerencia",
        sede: "SINCELEJO",
        tipoPerfil: "Docente",
        tipoDocumento: "Cédula de ciudadanía (CC)",
        identificacion: "79123456",
        nombre: "Marta Suárez",
        telefono: "3114567890",
        correo: "marta.suarez@uajs.edu.co",
        area: "Biblioteca",
        asunto: "Ampliar horarios de biblioteca",
        descripcion: "Sugerencia para ampliar los horarios de atención de la biblioteca y laboratorio de cómputo.",
        fecha: "2026-08-24",
        estado: "Cerrada",
        solicitante: "Marta Suárez",
        usuarioId: 2,
        adjunto: null
    },
    {
        id: "PQRS-2026-011",
        tipo: "Reclamo",
        sede: "CARTAGENA",
        tipoPerfil: "Estudiante",
        tipoDocumento: "Cédula de ciudadanía (CC)",
        identificacion: "1007654321",
        nombre: "Andrés López",
        telefono: "3125678901",
        correo: "andres.lopez@uajs.edu.co",
        area: "Sistemas e Infraestructura TI",
        asunto: "Fallas de red en laboratorio",
        descripcion: "Reclamo por las fallas de red y acceso a internet en el laboratorio de redes.",
        fecha: "2026-08-18",
        estado: "Asignada",
        solicitante: "Andrés López",
        usuarioId: 5,
        adjunto: null
    },
    {
        id: "PQRS-2026-010",
        tipo: "Petición",
        sede: "SINCELEJO",
        tipoPerfil: "Docente",
        tipoDocumento: "Cédula de ciudadanía (CC)",
        identificacion: "79234567",
        nombre: "Ricardo Vega",
        telefono: "3156789012",
        correo: "ricardo.vega@uajs.edu.co",
        area: "Dirección Académica",
        asunto: "Apoyo en horarios de prácticas",
        descripcion: "Solicitud de apoyo para programación de horarios de prácticas y tutorías académicas.",
        fecha: "2026-08-14",
        estado: "En revisión",
        solicitante: "Ricardo Vega",
        usuarioId: 2,
        adjunto: null
    }
];

// ============================================================
// NORMALIZACIÓN
// ============================================================

function sinAcentos(texto) {
    return String(texto ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

/**
 * El ENUM de `tipo` solo admite los cuatro valores de TIPOS_PQRS.
 * El seed de la BD trae 'Peticion' sin tilde: se corrige al escribir.
 */
function normalizarTipo(valor) {
    const limpio = sinAcentos(valor);
    const encontrado = TIPOS_PQRS.find((tipo) => sinAcentos(tipo) === limpio);
    return encontrado || TIPOS_PQRS[0];
}

/**
 * Fila de `pqrs` -> modelo de la UI.
 * La tabla ya persiste los campos de radicación (sede, area, asunto,
 * identificación, prioridad, asignado_a, adjunto…). Si una fila antigua no
 * los trae, se completan con valores por defecto para no romper la vista.
 */
function normalizarPqrs(raw) {
    const modelo = mapearPqrs(raw);
    if (!modelo) return null;

    const nombrePersona =
        modelo.nombre || (modelo.id_usuario ? `Usuario ${modelo.id_usuario}` : "Anónimo");

    return {
        ...modelo,
        tipo: normalizarTipo(modelo.tipo),
        estado: modelo.estado || ESTADO_INICIAL,
        // El asunto se persiste; si falta, se usa la primera línea de la
        // descripción (comportamiento anterior).
        asunto: modelo.asunto || String(modelo.descripcion || "").slice(0, 80),
        sede: modelo.sede || "SINCELEJO",
        tipoPerfil: modelo.tipoPerfil || "Estudiante",
        tipoDocumento: modelo.tipoDocumento || "Cédula de ciudadanía (CC)",
        identificacion: modelo.identificacion || "",
        nombre: nombrePersona,
        telefono: modelo.telefono || "",
        correo: modelo.correo || "",
        area: modelo.area || "PQRS",
        solicitante: modelo.solicitante || nombrePersona,
        usuarioId: modelo.id_usuario ?? null,
        asignadoA: modelo.asignadoA || "",
        prioridad: modelo.prioridad || "Media",
        historial: [],
        adjunto: modelo.adjunto ?? null
    };
}

/** Completa los campos que el feedback-service no persiste. */
function conCamposLocales(modelo, remoto) {
    return {
        ...modelo,
        prioridad: modelo.prioridad ?? remoto?.prioridad ?? "Media",
        asignadoA: modelo.asignadoA ?? remoto?.asignadoA ?? "",
        historial: Array.isArray(modelo.historial) ? modelo.historial : [],
        sede: modelo.sede ?? remoto?.sede ?? "SINCELEJO",
        area: modelo.area ?? remoto?.area ?? "PQRS",
        nombre: modelo.nombre ?? remoto?.nombre ?? "Anónimo",
        correo: modelo.correo ?? remoto?.correo ?? "",
        solicitante: modelo.solicitante ?? remoto?.solicitante ?? "Anónimo",
        // El controller persiste respuesta/fecha_respuesta en POST y PUT.
        respuesta: modelo.respuesta || remoto?.respuesta || "",
        fecha_respuesta: modelo.fecha_respuesta || remoto?.fecha_respuesta || null
    };
}

function payloadDe(modelo) {
    return mapearPqrsAPayload(modelo);
}

// ============================================================
// COLECCIÓN
// ============================================================

const coleccion = crearColeccion({
    clave: CLAVE_COLECCION,
    leer: () => feedbackApi.list(),
    mapear: normalizarPqrs,
    semilla: PQRS_BASE,
    crear: async (modelo) => {
        const creado = await feedbackApi.create(payloadDe(modelo));
        return conCamposLocales(modelo, normalizarPqrs(creado));
    },
    actualizar: async (modelo) => {
        const guardado = await feedbackApi.update(modelo.id, payloadDe(modelo));
        return conCamposLocales(modelo, normalizarPqrs(guardado));
    },
    eliminar: async (modelo) => {
        await feedbackApi.remove(modelo.id);
    }
});

// store.crearColeccion no copia los handlers al estado interno: se completan
// aquí para que refrescar() y crear() lleguen al feedback-service.
if (!coleccion.leer) {
    coleccion.leer = () => feedbackApi.list();
    coleccion.mapear = normalizarPqrs;
}
if (!coleccion.crear) {
    coleccion.crear = async (modelo) => {
        const creado = await feedbackApi.create(payloadDe(modelo));
        return conCamposLocales(modelo, normalizarPqrs(creado));
    };
}
if (!coleccion.actualizar) {
    coleccion.actualizar = async (modelo) => {
        const guardado = await feedbackApi.update(modelo.id, payloadDe(modelo));
        return conCamposLocales(modelo, normalizarPqrs(guardado));
    };
}
if (!coleccion.eliminar) {
    coleccion.eliminar = async (modelo) => {
        await feedbackApi.remove(modelo.id);
    };
}

// ============================================================
// API PÚBLICA DEL MÓDULO
// ============================================================

export function obtenerPqrs() {
    return listar(CLAVE_COLECCION);
}

export function refrescarPqrs() {
    return refrescar(CLAVE_COLECCION);
}

/** Radica una PQRS nueva contra el feedback-service. */
export function crearPqrs(modelo) {
    return crear(CLAVE_COLECCION, modelo);
}

export function actualizarPqrs(modelo, cambios) {
    return actualizar(CLAVE_COLECCION, modelo, cambios);
}

export function eliminarPqrs(modelo) {
    return eliminar(CLAVE_COLECCION, modelo);
}

/** Escritura de compatibilidad con el almacenamiento heredado. */
export function guardarPqrs(lista) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch {
        // si localStorage no está disponible se ignora
    }
    refrescar(CLAVE_COLECCION);
}

export const PQRS_POR_PERFIL = {
    Administrador: PQRS_BASE,
    Administrativo: PQRS_BASE.filter((item) => ["Queja", "Reclamo", "Petición"].includes(item.tipo)),
    Docente: PQRS_BASE.filter((item) => ["Petición", "Sugerencia"].includes(item.tipo)),
    Estudiante: PQRS_BASE.filter((item) => ["Queja", "Petición", "Sugerencia"].includes(item.tipo))
};

const PERFILES_TIPOS = {
    Administrador: null,
    Administrativo: ["Queja", "Reclamo", "Petición"],
    Docente: ["Petición", "Sugerencia"],
    Estudiante: ["Queja", "Petición", "Sugerencia"]
};

export function obtenerPqrsPorPerfil(rol = "Estudiante") {
    const lista = obtenerPqrs();
    const tipos = PERFILES_TIPOS[rol] || PERFILES_TIPOS.Estudiante;
    if (!tipos) return lista;
    return lista.filter((item) => tipos.includes(item.tipo));
}

export default PQRS_BASE;
