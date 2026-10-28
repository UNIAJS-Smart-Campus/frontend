export const ROL_IDS = {
    Administrador: 1,
    Administrativo: 2,
    Docente: 3,
    Estudiante: 4,
    Egresado: 5,
    Funcionario: 6,
    Proveedor: 7,
    Visitante: 8
};

export const ROLES = [
    {
        nombre: "Administrador",
        permisos: [
            "dashboard", "usuarios", "solicitudes", "reservas", "recursos",
            "eventos", "notificaciones", "pqrs", "reportes", "perfil",
            "configuracion", "info_academica", "gestion_pqrs"
        ],
        acciones: [
            "registrar_solicitudes", "consultar_solicitudes", "gestionar_solicitudes",
            "actualizar_estados", "realizar_reservas", "gestionar_reservas",
            "solicitar_recursos", "administrar_recursos", "publicar_eventos",
            "consultar_estadisticas", "administrar_usuarios", "administrar_roles",
            "gestionar_servicios", "gestionar_configuracion", "supervisar",
            "publicar_info_academica"
        ]
    },
    {
        nombre: "Administrativo",
        permisos: [
            "dashboard", "solicitudes", "reservas", "recursos", "eventos",
            "notificaciones", "pqrs", "perfil", "reportes", "configuracion",
            "info_academica", "gestion_pqrs"
        ],
        acciones: [
            "consultar_solicitudes", "gestionar_solicitudes", "actualizar_estados",
            "gestionar_reservas", "administrar_recursos", "atender_requerimientos",
            "generar_reportes"
        ]
    },
    {
        nombre: "Docente",
        permisos: [
            "dashboard", "solicitudes", "reservas", "recursos", "eventos",
            "notificaciones", "pqrs", "perfil", "reportes", "info_academica"
        ],
        acciones: [
            "registrar_solicitudes", "consultar_solicitudes", "realizar_reservas",
            "solicitar_recursos", "publicar_eventos", "publicar_info_academica"
        ]
    },
    {
        nombre: "Estudiante",
        permisos: [
            "dashboard", "solicitudes", "reservas", "recursos", "eventos",
            "notificaciones", "pqrs", "perfil", "info_academica"
        ],
        acciones: [
            "registrar_solicitudes", "consultar_solicitudes", "realizar_reservas",
            "solicitar_recursos", "inscribir_eventos"
        ]
    },
    {
        nombre: "Egresado",
        permisos: [
            "dashboard", "solicitudes", "reservas", "eventos", "notificaciones",
            "pqrs", "perfil", "info_academica"
        ],
        acciones: [
            "registrar_solicitudes", "consultar_solicitudes", "realizar_reservas",
            "inscribir_eventos"
        ]
    },
    {
        nombre: "Funcionario",
        permisos: [
            "dashboard", "solicitudes", "reservas", "recursos", "eventos",
            "notificaciones", "pqrs", "perfil", "reportes", "configuracion",
            "info_academica", "gestion_pqrs"
        ],
        acciones: [
            "consultar_solicitudes", "gestionar_solicitudes", "actualizar_estados",
            "gestionar_reservas", "administrar_recursos", "generar_reportes"
        ]
    },
    {
        nombre: "Proveedor",
        permisos: [
            "dashboard", "solicitudes", "reservas", "notificaciones", "pqrs", "perfil"
        ],
        acciones: [
            "registrar_solicitudes", "consultar_solicitudes", "realizar_reservas"
        ]
    },
    {
        nombre: "Visitante",
        permisos: [
            "dashboard", "eventos", "notificaciones", "pqrs"
        ],
        acciones: [
            "inscribir_eventos", "registrar_solicitudes"
        ]
    }
];

export const ROL_ICONO = {
    Administrador: "configuracion",
    Administrativo: "servicios",
    Docente: "info",
    Estudiante: "estudiante",
    Egresado: "perfil",
    Funcionario: "configuracion",
    Proveedor: "recursos",
    Visitante: "info"
};

export const ROL_CLASE = {
    Administrador: "purple",
    Administrativo: "blue",
    Docente: "green",
    Estudiante: "orange",
    Egresado: "teal",
    Funcionario: "indigo",
    Proveedor: "amber",
    Visitante: "gray"
};

export function permisosDeRol(rol) {
    const rolConfig = ROLES.find((r) => r.nombre === rol);
    return rolConfig ? rolConfig.permisos : [];
}

export function accionesDeRol(rol) {
    const rolConfig = ROLES.find((r) => r.nombre === rol);
    return rolConfig ? rolConfig.acciones : [];
}