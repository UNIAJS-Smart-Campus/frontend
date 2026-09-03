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

export function obtenerPublicaciones() {
    try {
        const guardadas = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (guardadas.length > 0) return guardadas;
        guardarPublicaciones(publicacionesBase);
        return publicacionesBase;
    } catch {
        return publicacionesBase;
    }
}

export function guardarPublicaciones(lista) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch {
        // si localStorage no está disponible se ignora
    }
}

/** Devuelve true si la publicación tiene fecha de vigencia y ya venció */
export function estaVencida(item) {
    if (item.tipoVigencia !== "Hasta" || !item.vigencia) return false;
    return new Date(item.vigencia + "T23:59:59") < new Date();
}

/**
 * Recorre la lista y cambia a "Vencida" toda publicación
 * que esté "Aprobada" y cuya fecha de vigencia ya pasó.
 * Devuelve { lista, hubocambios } para saber si hay que persistir.
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

export default publicacionesBase;
