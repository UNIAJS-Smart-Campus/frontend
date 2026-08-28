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
            "info_academica"
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
            "configuracion"
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
        programa: "Ingeniería de Sistemas",
        estado: "Activo"
    },
    {
        id: 2,
        usuario: "funcionario",
        password: "func123",
        nombre: "Carlos Méndez",
        correo: "carlos.mendez@uajs.edu.co",
        rol: "Administrativo",
        programa: "Bienestar Universitario",
        estado: "Activo"
    },
    {
        id: 3,
        usuario: "profesor",
        password: "prof123",
        nombre: "Laura Gómez",
        correo: "laura.gomez@uajs.edu.co",
        rol: "Docente",
        programa: "Matemáticas",
        estado: "Activo"
    },
    {
        id: 4,
        usuario: "estudiante",
        password: "est123",
        nombre: "Andrés Torres",
        correo: "andres.torres@uajs.edu.co",
        rol: "Estudiante",
        programa: "Ingeniería de Sistemas",
        estado: "Activo"
    }
];

export const STORAGE_KEY = "uajs_users";

export function obtenerUsuarios() {
    try {
        const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return guardados.length > 0 ? guardados : usuarios;
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

export function permisosDeRol(rol) {
    const encontrado = ROLES.find((item) => item.nombre === rol);
    return encontrado ? encontrado.permisos : [];
}

export function accionesDeRol(rol) {
    const encontrado = ROLES.find((item) => item.nombre === rol);
    return encontrado ? encontrado.acciones : [];
}

export default usuarios;
