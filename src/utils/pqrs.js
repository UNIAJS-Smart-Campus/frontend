export const TIPOS_PQRS = [
    "Petición",
    "Queja",
    "Reclamo",
    "Sugerencia"
];

export const STORAGE_KEY = "uajs_pqrs";

const pqrs = [
    {
        id: "PQRS-2026-014",
        tipo: "Queja",
        fecha: "2026-09-01",
        estado: "En revisión",
        descripcion: "Queja por la demora en la atención del servicio de certificados y constancias académicas."
    },
    {
        id: "PQRS-2026-013",
        tipo: "Petición",
        fecha: "2026-08-28",
        estado: "Resuelta",
        descripcion: "Solicitud de información sobre el proceso de homologación de asignaturas y requisitos."
    },
    {
        id: "PQRS-2026-012",
        tipo: "Sugerencia",
        fecha: "2026-08-24",
        estado: "Cerrada",
        descripcion: "Sugerencia para ampliar los horarios de atención de la biblioteca y laboratorio de cómputo."
    },
    {
        id: "PQRS-2026-011",
        tipo: "Reclamo",
        fecha: "2026-08-18",
        estado: "Asignada",
        descripcion: "Reclamo por las fallas de red y acceso a internet en el laboratorio de redes."
    },
    {
        id: "PQRS-2026-010",
        tipo: "Petición",
        fecha: "2026-08-14",
        estado: "En revisión",
        descripcion: "Solicitud de apoyo para programación de horarios de prácticas y tutorías académicas."
    }
];

export function obtenerPqrs() {
    try {
        const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (guardados.length > 0) return guardados;
        guardarPqrs(pqrs);
        return pqrs;
    } catch {
        return pqrs;
    }
}

export function guardarPqrs(lista) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch {
        // si localStorage no está disponible se ignora
    }
}

export const PQRS_POR_PERFIL = {
    Administrador: pqrs,
    Administrativo: pqrs.filter((item) => ["Queja", "Reclamo", "Petición"].includes(item.tipo)),
    Docente: pqrs.filter((item) => ["Petición", "Sugerencia"].includes(item.tipo)),
    Estudiante: pqrs.filter((item) => ["Queja", "Petición", "Sugerencia"].includes(item.tipo))
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

export default pqrs;