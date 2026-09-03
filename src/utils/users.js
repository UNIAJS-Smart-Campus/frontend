export const ROLES = [
    {
        nombre: "Administrador",
        permisos: [
            "dashboard",
            "usuarios",
            "solicitudes",
            "reservas",
            "recursos",
            "eventos",
            "notificaciones",
            "pqrs",
            "reportes",
            "perfil",
            "configuracion",
            "info_academica",
            "gestion_pqrs"
        ],
        acciones: [
            "registrar_solicitudes",
            "consultar_solicitudes",
            "gestionar_solicitudes",
            "actualizar_estados",
            "realizar_reservas",
            "gestionar_reservas",
            "solicitar_recursos",
            "administrar_recursos",
            "publicar_eventos",
            "consultar_estadisticas",
            "administrar_usuarios",
            "administrar_roles",
            "gestionar_servicios",
            "gestionar_configuracion",
            "supervisar",
            "publicar_info_academica"
        ]
    },
    {
        nombre: "Administrativo",
        permisos: [
            "dashboard",
            "solicitudes",
            "reservas",
            "recursos",
            "eventos",
            "notificaciones",
            "pqrs",
            "perfil",
            "reportes",
            "configuracion",
            "info_academica",
            "gestion_pqrs"
        ],
        acciones: [
            "consultar_solicitudes",
            "gestionar_solicitudes",
            "actualizar_estados",
            "gestionar_reservas",
            "administrar_recursos",
            "atender_requerimientos",
            "generar_reportes"
        ]
    },
    {
        nombre: "Docente",
        permisos: [
            "dashboard",
            "solicitudes",
            "reservas",
            "recursos",
            "eventos",
            "notificaciones",
            "pqrs",
            "perfil",
            "info_academica",
            "configuracion"
        ],
        acciones: [
            "consultar_solicitudes",
            "realizar_reservas",
            "gestionar_reservas",
            "solicitar_recursos",
            "publicar_info_academica",
            "consultar_info_academica"
        ]
    },
    {
        nombre: "Estudiante",
        permisos: [
            "dashboard",
            "solicitudes",
            "reservas",
            "recursos",
            "eventos",
            "notificaciones",
            "pqrs",
            "perfil",
            "info_academica",
            "configuracion"
        ],
        acciones: [
            "registrar_solicitudes",
            "consultar_solicitudes",
            "realizar_reservas",
            "solicitar_recursos",
            "consultar_info_academica"
        ]
    }
];

const usuarios = [
    {
        id: 1,
        usuario: "admin",
        password: "admin123",
        nombre: "Natalia Rodríguez",
        correo: "natalia.rodriguez@uajs.edu.co",
        rol: "Administrador",
        programa: "Dirección Académica",
        estado: "Activo",
        cargo: "Coordinadora general",
        campus: "Campus principal"
    },
    {
        id: 2,
        usuario: "funcionario",
        password: "func123",
        nombre: "Carlos Méndez",
        correo: "carlos.mendez@uajs.edu.co",
        rol: "Administrativo",
        programa: "Bienestar Universitario",
        estado: "Activo",
        cargo: "Analista de servicios",
        campus: "Campus Norte"
    },
    {
        id: 3,
        usuario: "profesor",
        password: "prof123",
        nombre: "Laura Gómez",
        correo: "laura.gomez@uajs.edu.co",
        rol: "Docente",
        programa: "Matemáticas",
        estado: "Activo",
        cargo: "Docente titular",
        campus: "Campus central"
    },
    {
        id: 4,
        usuario: "estudiante",
        password: "est123",
        nombre: "Andrés Torres",
        correo: "andres.torres@uajs.edu.co",
        rol: "Estudiante",
        programa: "Ingeniería de Sistemas",
        estado: "Activo",
        cargo: "Estudiante",
        campus: "Campus central"
    },
    {
        id: 5,
        usuario: "docente2",
        password: "doc123",
        nombre: "María Fernanda Cárdenas",
        correo: "mf.cardenas@uajs.edu.co",
        rol: "Docente",
        programa: "Ingeniería de Software",
        estado: "Activo",
        cargo: "Profesora de proyectos",
        campus: "Campus principal"
    },
    {
        id: 6,
        usuario: "estudiante2",
        password: "stu123",
        nombre: "Valentina Morales",
        correo: "valentina.morales@uajs.edu.co",
        rol: "Estudiante",
        programa: "Administración de Empresas",
        estado: "Activo",
        cargo: "Estudiante",
        campus: "Campus occidente"
    },
    {
        id: 7,
        usuario: "admin2",
        password: "ua123",
        nombre: "Javier Álvarez",
        correo: "javier.alvarez@uajs.edu.co",
        rol: "Administrador",
        programa: "Tecnología e innovación",
        estado: "Activo",
        cargo: "Director de operación",
        campus: "Campus principal"
    },
    {
        id: 8,
        usuario: "admvo",
        password: "adm123",
        nombre: "Sofía Jiménez",
        correo: "sofia.jimenez@uajs.edu.co",
        rol: "Administrativo",
        programa: "Servicios estudiantiles",
        estado: "Inactivo",
        cargo: "Coordinadora administrativa",
        campus: "Campus centro"
    }
];

export const STORAGE_KEY = "uajs_users";

export function obtenerUsuarios() {
    try {
        const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (guardados.length > 0) return guardados;
        guardarUsuarios(usuarios);
        return usuarios;
    } catch {
        return usuarios;
    }
}

export function guardarUsuarios(lista) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch {
        // si localStorage no está disponible se ignora
    }
}

function buscarRol(rol) {
    if (!rol) return null;
    const exacto = ROLES.find((item) => item.nombre === rol);
    if (exacto) return exacto;
    const objetivo = String(rol).trim().toLowerCase();
    return (
        ROLES.find(
            (item) => String(item.nombre).trim().toLowerCase() === objetivo
        ) || null
    );
}

export function permisosDeRol(rol) {
    const encontrado = buscarRol(rol);
    return encontrado ? encontrado.permisos : [];
}

export function accionesDeRol(rol) {
    const encontrado = buscarRol(rol);
    return encontrado ? encontrado.acciones : [];
}

export default usuarios;
