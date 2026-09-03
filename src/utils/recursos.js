export const TIPOS_RECURSO = ["Salas", "Laboratorios", "Auditorios", "Equipos"];

// Categoría de cada tipo: Escenario = espacio físico reservable, Objeto = equipo/bien prestable
export const CATEGORIA_POR_TIPO = {
    Salas: "Escenario",
    Laboratorios: "Escenario",
    Auditorios: "Escenario",
    Equipos: "Objeto"
};

export const CATEGORIAS_RECURSO = ["Escenario", "Objeto"];

export function esEscenario(recurso) {
    return (recurso.categoria ?? CATEGORIA_POR_TIPO[recurso.tipo]) === "Escenario";
}

const recursos = [
    {
        id: "R-001",
        codigo: "REC-101",
        nombre: "Salón 101",
        tipo: "Salas",
        categoria: "Escenario",
        capacidad: 40,
        ubicacion: "Bloque A · Piso 1",
        estado: "Activo",
        disponibilidad: "Disponible"
    },
    {
        id: "R-002",
        codigo: "REC-205",
        nombre: "Salón 205",
        tipo: "Salas",
        categoria: "Escenario",
        capacidad: 30,
        ubicacion: "Bloque A · Piso 2",
        estado: "Activo",
        disponibilidad: "En uso"
    },
    {
        id: "R-003",
        codigo: "REC-LAB1",
        nombre: "Laboratorio de informática 1",
        tipo: "Laboratorios",
        categoria: "Escenario",
        capacidad: 25,
        ubicacion: "Bloque B · Piso 1",
        estado: "Activo",
        disponibilidad: "Disponible"
    },
    {
        id: "R-004",
        codigo: "REC-LABQ",
        nombre: "Laboratorio de química",
        tipo: "Laboratorios",
        categoria: "Escenario",
        capacidad: 20,
        ubicacion: "Bloque B · Piso 2",
        estado: "En mantenimiento",
        disponibilidad: "No disponible"
    },
    {
        id: "R-005",
        codigo: "REC-AUD1",
        nombre: "Auditorio principal",
        tipo: "Auditorios",
        categoria: "Escenario",
        capacidad: 300,
        ubicacion: "Bloque C",
        estado: "Activo",
        disponibilidad: "Disponible"
    },
    {
        id: "R-006",
        codigo: "REC-AUD2",
        nombre: "Auditorio B",
        tipo: "Auditorios",
        categoria: "Escenario",
        capacidad: 120,
        ubicacion: "Bloque C · Piso 2",
        estado: "Activo",
        disponibilidad: "En uso"
    },
    {
        id: "R-007",
        codigo: "REC-EQ1",
        nombre: "Video proyector Epson 4K",
        tipo: "Equipos",
        categoria: "Objeto",
        capacidad: 1,
        ubicacion: "Bodega de tecnología",
        estado: "Activo",
        disponibilidad: "Disponible"
    },
    {
        id: "R-008",
        codigo: "REC-EQ2",
        nombre: "Portátil Lenovo ThinkPad",
        tipo: "Equipos",
        categoria: "Objeto",
        capacidad: 1,
        ubicacion: "Bodega de tecnología",
        estado: "En revisión",
        disponibilidad: "No disponible"
    },
    {
        id: "R-009",
        codigo: "REC-SAL3",
        nombre: "Salón 303",
        tipo: "Salas",
        categoria: "Escenario",
        capacidad: 50,
        ubicacion: "Bloque D · Piso 3",
        estado: "Activo",
        disponibilidad: "Disponible"
    },
    {
        id: "R-010",
        codigo: "REC-LAB2",
        nombre: "Laboratorio de redes",
        tipo: "Laboratorios",
        categoria: "Escenario",
        capacidad: 18,
        ubicacion: "Bloque B · Piso 3",
        estado: "Activo",
        disponibilidad: "En uso"
    }
];

export const STORAGE_KEY = "uajs_recursos";

export function obtenerRecursos() {
    try {
        const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (guardados.length > 0) return guardados;
        guardarRecursos(recursos);
        return recursos;
    } catch {
        return recursos;
    }
}

export function guardarRecursos(lista) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch {
        // si localStorage no está disponible se ignora
    }
}

export const RECURSOS_POR_PERFIL = {
    Administrador: recursos,
    Administrativo: recursos.filter((recurso) => ["Salas", "Laboratorios", "Auditorios"].includes(recurso.tipo)),
    Docente: recursos.filter((recurso) => ["Salas", "Laboratorios", "Auditorios"].includes(recurso.tipo)),
    Estudiante: recursos.filter((recurso) => ["Salas", "Laboratorios", "Auditorios", "Equipos"].includes(recurso.tipo))
};

export function obtenerRecursosPorPerfil(rol = "Estudiante") {
    return RECURSOS_POR_PERFIL[rol] || RECURSOS_POR_PERFIL.Estudiante;
}

export default recursos;