// ============================================================
// INFORMACIÓN ACADÉMICA — datos del academic-info-service (vía gateway).
//
// La tabla `info_academica` tiene una columna `estado`. El controller la
// persiste; para que el contenido sea visible se traduce 'Publicado' ->
// 'Aprobada' (el estado que la UI usa como "visible para todos").
//
// Los campos programa, tipo_vigencia, vigencia y destacado también se
// persisten en la tabla desde la extensión del esquema.
//
// La colección "info_academica" del store entrega primero la caché local y
// después la data real del backend, que repinta la vista con useColeccion.
// ============================================================

import { academicInfoApi } from "./api";
import { mapearPublicacion, mapearPublicacionAPayload } from "./mapeo";
import {
    crearColeccion,
    listar,
    refrescar,
    crear,
    actualizar,
    eliminar
} from "./store";

export const CATEGORIAS = [
    "Aviso académico",
    "Convocatoria",
    "Resultado",
    "Taller",
    "Seminario"
];

export const CATEGORIA_ICONO = {
    "Aviso académico": "info",
    Convocatoria: "eventos",
    Resultado: "reportes",
    Taller: "estudiante",
    Seminario: "docente"
};

export const CATEGORIA_CLASE = {
    "Aviso académico": "blue",
    Convocatoria: "purple",
    Resultado: "green",
    Taller: "orange",
    Seminario: "red"
};

export const ESTADOS_PUBLICACION = ["Pendiente", "Aprobada", "Rechazada", "Vencida"];

export const ESTADO_CLASE = {
    Pendiente: "pendiente",
    Aprobada:  "aprobada",
    Rechazada: "rechazada",
    Vencida:   "vencida"
};

export const PROGRAMAS = [
    "Toda la comunidad",
    "Ingeniería de Sistemas",
    "Ingeniería Civil",
    "Administración de Empresas",
    "Contaduría Pública",
    "Derecho",
    "Psicología",
    "Matemáticas",
    "Bienestar Universitario"
];

export const TIPOS_VIGENCIA = ["Permanente", "Hasta"];

export const formVacio = {
    titulo: "",
    categoria: "Aviso académico",
    contenido: "",
    programa: "Toda la comunidad",
    tipoVigencia: "Permanente",
    vigencia: "",
    destacado: false
};

export const STORAGE_KEY = "uajs_info_academica";

export const CLAVE_COLECCION = "info_academica";

const publicacionesBase = [
    {
        id: 1,
        titulo: "Convocatoria periodo académico 2026-1",
        categoria: "Convocatoria",
        fecha: "2026-03-15",
        autor: "Laura Gómez",
        contenido: "Se abre el período de inscripción para el primer semestre 2026. Los estudiantes deberán completar su matrícula antes del 28 de marzo.",
        estado: "Aprobada",
        programa: "Toda la comunidad",
        tipoVigencia: "Hasta",
        vigencia: "2026-03-28",
        destacado: true
    },
    {
        id: 2,
        titulo: "Taller de Metodología de Investigación",
        categoria: "Taller",
        fecha: "2026-04-10",
        autor: "Laura Gómez",
        contenido: "Se realizará un taller práctico sobre métodos de investigación cuantitativa y cualitativa para estudiantes de posgrado.",
        estado: "Aprobada",
        programa: "Matemáticas",
        tipoVigencia: "Hasta",
        vigencia: "2026-04-25",
        destacado: false
    },
    {
        id: 3,
        titulo: "Resultados parciales Cálculo I",
        categoria: "Resultado",
        fecha: "2026-04-22",
        autor: "Laura Gómez",
        contenido: "Se publican los resultados del primer parcial de Cálculo I. Los estudiantes pueden revisar en la plataforma académica.",
        estado: "Aprobada",
        programa: "Ingeniería de Sistemas",
        tipoVigencia: "Permanente",
        vigencia: "",
        destacado: false
    },
    {
        id: 4,
        titulo: "Aviso: mantenimiento plataforma académica",
        categoria: "Aviso académico",
        fecha: "2026-04-28",
        autor: "Carlos Méndez",
        contenido: "La plataforma académica tendrá mantenimiento programado el próximo sábado. El servicio no estará disponible entre las 8:00 y las 12:00.",
        estado: "Pendiente",
        programa: "Toda la comunidad",
        tipoVigencia: "Hasta",
        vigencia: "2026-05-02",
        destacado: false
    }
];

export const PUBLICACIONES_BASE = publicacionesBase;

// ============================================================
// NORMALIZACIÓN
// ============================================================

/**
 * El backend guarda siempre 'Publicado' (valor por defecto de la columna).
 * La UI solo muestra las 'Aprobada' al público, así que se traduce.
 */
function normalizarEstado(valor) {
    const estado = String(valor ?? "").trim();
    if (!estado) return "Aprobada";
    if (ESTADOS_PUBLICACION.includes(estado)) return estado;
    if (estado === "Publicado" || estado === "Publicada") return "Aprobada";
    return "Pendiente";
}

/** Fila de `info_academica` -> modelo de la UI. */
function normalizarPublicacion(raw) {
    const modelo = mapearPublicacion(raw);
    if (!modelo) return null;

    return {
        ...modelo,
        estado: normalizarEstado(modelo.estado),
        // La tabla ya persiste estos campos; si faltan se usa el patrón local
        // para que la lista no se rompa con filas antiguas.
        programa: modelo.programa || "Toda la comunidad",
        tipoVigencia: modelo.tipoVigencia || "Permanente",
        vigencia: modelo.vigencia || "",
        destacado: Boolean(modelo.destacado),
        usuario: modelo.usuario || modelo.autor
    };
}

/** Conserva los campos que la UI gestiona aunque el backend los normalice. */
function conCamposLocales(modelo, remoto) {
    return {
        ...modelo,
        estado: modelo.estado || remoto?.estado || "Aprobada",
        programa: modelo.programa ?? remoto?.programa ?? "Toda la comunidad",
        tipoVigencia: modelo.tipoVigencia ?? remoto?.tipoVigencia ?? "Permanente",
        vigencia: modelo.vigencia ?? remoto?.vigencia ?? "",
        destacado: Boolean(modelo.destacado ?? remoto?.destacado ?? false)
    };
}

function payloadDe(modelo) {
    return mapearPublicacionAPayload(modelo);
}

// ============================================================
// COLECCIÓN
// ============================================================

const coleccion = crearColeccion({
    clave: CLAVE_COLECCION,
    leer: () => academicInfoApi.list(),
    mapear: normalizarPublicacion,
    semilla: PUBLICACIONES_BASE,
    crear: async (modelo) => {
        const creada = await academicInfoApi.create(payloadDe(modelo));
        return conCamposLocales(modelo, normalizarPublicacion(creada));
    },
    actualizar: async (modelo) => {
        const guardada = await academicInfoApi.update(modelo.id, payloadDe(modelo));
        return conCamposLocales(modelo, normalizarPublicacion(guardada));
    },
    eliminar: async (modelo) => {
        await academicInfoApi.remove(modelo.id);
    }
});

// store.crearColeccion no copia los handlers al estado interno: se completan
// aquí para que refrescar() y crear() lleguen al academic-info-service.
if (!coleccion.leer) {
    coleccion.leer = () => academicInfoApi.list();
    coleccion.mapear = normalizarPublicacion;
}
if (!coleccion.crear) {
    coleccion.crear = async (modelo) => {
        const creada = await academicInfoApi.create(payloadDe(modelo));
        return conCamposLocales(modelo, normalizarPublicacion(creada));
    };
}
if (!coleccion.actualizar) {
    coleccion.actualizar = async (modelo) => {
        const guardada = await academicInfoApi.update(modelo.id, payloadDe(modelo));
        return conCamposLocales(modelo, normalizarPublicacion(guardada));
    };
}
if (!coleccion.eliminar) {
    coleccion.eliminar = async (modelo) => {
        await academicInfoApi.remove(modelo.id);
    };
}

// ============================================================
// API PÚBLICA DEL MÓDULO
// ============================================================

/**
 * Lista de publicaciones con el semáforo de vencimiento ya aplicado:
 * lo que estaba 'Aprobada' y cuya fecha de vigencia ya pasó pasa a
 * 'Vencida' (igual que antes, solo en memoria).
 */
export function obtenerPublicaciones() {
    const { lista } = aplicarVencimiento(listar(CLAVE_COLECCION));
    return lista;
}

export function refrescarPublicaciones() {
    return refrescar(CLAVE_COLECCION);
}

export function crearPublicacion(modelo) {
    return crear(CLAVE_COLECCION, modelo);
}

export function actualizarPublicacion(modelo, cambios) {
    return actualizar(CLAVE_COLECCION, modelo, cambios);
}

export function eliminarPublicacion(modelo) {
    return eliminar(CLAVE_COLECCION, modelo);
}

/** Escritura de compatibilidad con el almacenamiento heredado. */
export function guardarPublicaciones(lista) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch {
        // si localStorage no está disponible se ignora
    }
    refrescar(CLAVE_COLECCION);
}

/** Devuelve true si la publicación tiene fecha de vigencia y ya venció */
export function estaVencida(item) {
    if (item.tipoVigencia !== "Hasta" || !item.vigencia) return false;
    return new Date(item.vigencia + "T23:59:59") < new Date();
}

/**
 * Recorre la lista y cambia a "Vencida" toda publicación
 * que esté "Aprobada" y cuya fecha de vigencia ya pasó.
 * Devuelve { lista, huboCambios } para saber si hay que persistir.
 */
export function aplicarVencimiento(lista) {
    let huboCambios = false;
    const actualizada = lista.map((item) => {
        if (item.estado === "Aprobada" && estaVencida(item)) {
            huboCambios = true;
            return { ...item, estado: "Vencida" };
        }
        return item;
    });
    return { lista: actualizada, huboCambios };
}

export default publicacionesBase;
