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

// Estados que se consideran abiertos (no finalizados).
export const ESTADOS_PQRS_ABIERTOS = ["En revisión", "Asignada", "En proceso"];
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

const pqrs = [
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

function migrarPqrs(item) {
    if (!item || typeof item !== "object") return item;
    return {
        sede: "SINCELEJO",
        tipoPerfil: "Estudiante",
        tipoDocumento: "Cédula de ciudadanía (CC)",
        identificacion: "",
        nombre: item.solicitante || "Anónimo",
        telefono: "",
        correo: "",
        area: "PQRS",
        asunto: item.tipo || "Solicitud",
        adjunto: null,
        ...item
    };
}

export function obtenerPqrs() {
    try {
        const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (Array.isArray(guardados) && guardados.length > 0) {
            const migrados = guardados.map(migrarPqrs);
            const necesitaGuardar = migrados.some(
                (m, i) => m !== guardados[i]
            );
            if (necesitaGuardar) guardarPqrs(migrados);
            return migrados;
        }
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