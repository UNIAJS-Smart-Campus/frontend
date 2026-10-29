// ============================================================
// Recursos — colección conectada al resources-service.
//
// `tipo_recurso` es ENUM estricto en la BD, por eso TIPOS_RECURSO es la
// lista exacta que acepta el servidor. `estado` y `disponibilidad` son
// VARCHAR, pero el backend siembra con 'Disponible' / 'Ocupada' /
// 'Mantenimiento', así que aquí se normaliza a un vocabulario estable
// para que la UI no dependa de cómo estén escritas esas filas.
// ============================================================

import { resourcesApi } from "./api";
import { mapearRecurso, mapearRecursoAPayload } from "./mapeo";
import {
    crearColeccion,
    listar as listarColeccion,
    refrescar as refrescarColeccion,
    crear as crearEnColeccion,
    actualizar as actualizarEnColeccion,
    eliminar as eliminarDeColeccion,
    limpiarCache
} from "./store";

export const CLAVE_RECURSO = "recursos";

// ENUM estricto de la tabla recursos.
export const TIPOS_RECURSO = ["Salas", "Laboratorios", "Auditorios", "Equipos"];

// Categoría de cada tipo: Escenario = espacio físico reservable, Objeto = equipo/bien prestable
export const CATEGORIA_POR_TIPO = {
    Salas: "Escenario",
    Laboratorios: "Escenario",
    Auditorios: "Escenario",
    Equipos: "Objeto"
};

export const CATEGORIAS_RECURSO = ["Escenario", "Objeto"];

// Vocabulario normalizado de estado y disponibilidad.
export const ESTADOS_RECURSO = ["Disponible", "Mantenimiento", "Inactivo"];
export const DISPONIBILIDADES_RECURSO = ["Disponible", "Ocupado"];

export const STORAGE_KEY = "uajs_recursos";

function sinAcentos(texto) {
    return String(texto ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

export function normalizarTipoRecurso(valor) {
    const buscado = sinAcentos(valor);
    return (
        TIPOS_RECURSO.find((tipo) => sinAcentos(tipo) === buscado) ?? "Salas"
    );
}

export function normalizarEstadoRecurso(valor) {
    const v = sinAcentos(valor);
    if (!v) return "Disponible";
    if (v.includes("mantenimiento") || v.includes("reparacion") || v.includes("revision")) {
        return "Mantenimiento";
    }
    if (v.includes("inactiv") || v.includes("baja") || v.includes("retirado")) {
        return "Inactivo";
    }
    // 'Disponible' y también los estados antiguos tipo 'Activo' / 'Ocupada'.
    return "Disponible";
}

export function normalizarDisponibilidad(valor) {
    const v = sinAcentos(valor);
    if (!v) return "Disponible";
    if (
        v.includes("no disponible") ||
        v.includes("ocupad") ||
        v.includes("reservad") ||
        v.includes("prestad")
    ) {
        return "Ocupado";
    }
    return "Disponible";
}

export function esEscenario(recurso) {
    return (recurso.categoria ?? CATEGORIA_POR_TIPO[recurso.tipo]) === "Escenario";
}

/** Solo se puede reservar lo que está activo y sin uso en ese momento. */
export function esReservable(recurso) {
    return (
        recurso?.estado === "Disponible" && recurso?.disponibilidad === "Disponible"
    );
}

function normalizarRecurso(modelo) {
    if (!modelo) return null;
    const tipo = normalizarTipoRecurso(modelo.tipo);
    return {
        ...modelo,
        tipo,
        categoria: modelo.categoria || CATEGORIA_POR_TIPO[tipo] || "Escenario",
        descripcion: modelo.descripcion || "",
        estado: normalizarEstadoRecurso(modelo.estado),
        disponibilidad: normalizarDisponibilidad(modelo.disponibilidad)
    };
}

function payloadDe(modelo) {
    return mapearRecursoAPayload({
        ...modelo,
        tipo: normalizarTipoRecurso(modelo.tipo),
        estado: normalizarEstadoRecurso(modelo.estado),
        disponibilidad: normalizarDisponibilidad(modelo.disponibilidad)
    });
}

// ============================================================
// SEMILLA (solo si el backend nunca responde)
// ============================================================

export const RECURSOS_BASE = [
    {
        id: "R-001",
        codigo: "REC-101",
        nombre: "Salón 101",
        tipo: "Salas",
        categoria: "Escenario",
        descripcion: "Aula para clases y talleres.",
        capacidad: 40,
        ubicacion: "Bloque A · Piso 1",
        estado: "Disponible",
        disponibilidad: "Disponible"
    },
    {
        id: "R-002",
        codigo: "REC-205",
        nombre: "Salón 205",
        tipo: "Salas",
        categoria: "Escenario",
        descripcion: "Aula para reuniones de trabajo.",
        capacidad: 30,
        ubicacion: "Bloque A · Piso 2",
        estado: "Disponible",
        disponibilidad: "Ocupado"
    },
    {
        id: "R-003",
        codigo: "REC-LAB1",
        nombre: "Laboratorio de informática 1",
        tipo: "Laboratorios",
        categoria: "Escenario",
        descripcion: "Laboratorio de computación.",
        capacidad: 25,
        ubicacion: "Bloque B · Piso 1",
        estado: "Disponible",
        disponibilidad: "Disponible"
    },
    {
        id: "R-004",
        codigo: "REC-LABQ",
        nombre: "Laboratorio de química",
        tipo: "Laboratorios",
        categoria: "Escenario",
        descripcion: "Laboratorio de prácticas de química.",
        capacidad: 20,
        ubicacion: "Bloque B · Piso 2",
        estado: "Mantenimiento",
        disponibilidad: "Ocupado"
    },
    {
        id: "R-005",
        codigo: "REC-AUD1",
        nombre: "Auditorio principal",
        tipo: "Auditorios",
        categoria: "Escenario",
        descripcion: "Auditorio para eventos institucionales.",
        capacidad: 300,
        ubicacion: "Bloque C",
        estado: "Disponible",
        disponibilidad: "Disponible"
    },
    {
        id: "R-006",
        codigo: "REC-AUD2",
        nombre: "Auditorio B",
        tipo: "Auditorios",
        categoria: "Escenario",
        descripcion: "Auditorio mediano para eventos menores.",
        capacidad: 120,
        ubicacion: "Bloque C · Piso 2",
        estado: "Disponible",
        disponibilidad: "Ocupado"
    },
    {
        id: "R-007",
        codigo: "REC-EQ1",
        nombre: "Video proyector Epson 4K",
        tipo: "Equipos",
        categoria: "Objeto",
        descripcion: "Proyector para presentaciones.",
        capacidad: 1,
        ubicacion: "Bodega de tecnología",
        estado: "Disponible",
        disponibilidad: "Disponible"
    },
    {
        id: "R-008",
        codigo: "REC-EQ2",
        nombre: "Portátil Lenovo ThinkPad",
        tipo: "Equipos",
        categoria: "Objeto",
        descripcion: "Equipo portátil para trabajo académico.",
        capacidad: 1,
        ubicacion: "Bodega de tecnología",
        estado: "Mantenimiento",
        disponibilidad: "Ocupado"
    },
    {
        id: "R-009",
        codigo: "REC-SAL3",
        nombre: "Salón 303",
        tipo: "Salas",
        categoria: "Escenario",
        descripcion: "Aula para seminario de investigación.",
        capacidad: 50,
        ubicacion: "Bloque D · Piso 3",
        estado: "Disponible",
        disponibilidad: "Disponible"
    },
    {
        id: "R-010",
        codigo: "REC-LAB2",
        nombre: "Laboratorio de redes",
        tipo: "Laboratorios",
        categoria: "Escenario",
        descripcion: "Laboratorio de configuración de redes.",
        capacidad: 18,
        ubicacion: "Bloque B · Piso 3",
        estado: "Disponible",
        disponibilidad: "Ocupado"
    }
].map(normalizarRecurso);

// ============================================================
// COLECCIÓN
// ============================================================

crearColeccion({
    clave: CLAVE_RECURSO,
    leer: () => resourcesApi.list(),
    // La API devuelve la fila de BD (tipo_recurso, nombre_recurso...); primero
    // se traduce al modelo de la UI y después se normaliza.
    mapear: (raw) => normalizarRecurso(mapearRecurso(raw)),
    semilla: RECURSOS_BASE,
    crear: async (modelo) => {
        const creado = await resourcesApi.create(payloadDe(modelo));
        return normalizarRecurso(mapearRecurso(creado));
    },
    actualizar: async (modelo) => {
        const guardado = await resourcesApi.update(modelo.id, payloadDe(modelo));
        return normalizarRecurso(mapearRecurso(guardado));
    },
    eliminar: async (modelo) => {
        await resourcesApi.remove(modelo.id);
    }
});

// ============================================================
// API PÚBLICA DEL MÓDULO
// ============================================================

export function obtenerRecursos() {
    return listarColeccion(CLAVE_RECURSO);
}

export function refrescarRecursos() {
    return refrescarColeccion(CLAVE_RECURSO);
}

export function limpiarCacheRecursos() {
    limpiarCache(CLAVE_RECURSO);
}

export function crearRecurso(modelo) {
    return crearEnColeccion(CLAVE_RECURSO, modelo);
}

export function actualizarRecurso(modelo, cambios) {
    return actualizarEnColeccion(CLAVE_RECURSO, modelo, cambios);
}

export function eliminarRecurso(modelo) {
    return eliminarDeColeccion(CLAVE_RECURSO, modelo);
}

export function guardarRecursos(lista) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch {
        // si localStorage no está disponible se ignora
    }
    refrescarColeccion(CLAVE_RECURSO);
}

const TIPOS_POR_ROL = {
    Administrador: TIPOS_RECURSO,
    Administrativo: ["Salas", "Laboratorios", "Auditorios"],
    Docente: ["Salas", "Laboratorios", "Auditorios"],
    Estudiante: ["Salas", "Laboratorios", "Auditorios", "Equipos"]
};

export const RECURSOS_POR_PERFIL = {
    Administrador: RECURSOS_BASE,
    Administrativo: RECURSOS_BASE.filter((recurso) =>
        ["Salas", "Laboratorios", "Auditorios"].includes(recurso.tipo)
    ),
    Docente: RECURSOS_BASE.filter((recurso) =>
        ["Salas", "Laboratorios", "Auditorios"].includes(recurso.tipo)
    ),
    Estudiante: RECURSOS_BASE.filter((recurso) =>
        ["Salas", "Laboratorios", "Auditorios", "Equipos"].includes(recurso.tipo)
    )
};

export function obtenerRecursosPorPerfil(rol = "Estudiante") {
    const tipos = TIPOS_POR_ROL[rol];
    const lista = obtenerRecursos();
    if (!tipos) return lista;
    return lista.filter((recurso) => tipos.includes(recurso.tipo));
}

export default RECURSOS_BASE;
