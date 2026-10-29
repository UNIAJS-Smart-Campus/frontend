import { usersApi } from "./api";
import { mapearUsuario, mapearUsuarioAPayload } from "./mapeo";
import {
    crearColeccion,
    listar,
    establecer,
    refrescar,
    crear,
    actualizar,
    eliminar
} from "./store";

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

// Semilla inicial (17 usuarios) — sirve como fallback si no hay cache ni backend.
const usuarios = [
    {
        id: 1,
        usuario: "admin",
        cedula: "1023456789",
        nombre: "Natalia Rodríguez",
        correo: "natalia.rodriguez@uajs.edu.co",
        rol: "Administrador",
        programa: "Dirección Académica",
        estado: "Activo",
        cargo: "Coordinadora general",
        campus: "Campus principal",
        foto_perfil: "https://api.dicebear.com/7.x/initials/svg?seed=NR"
    },
    {
        id: 2,
        usuario: "funcionario",
        cedula: "1023456788",
        nombre: "Carlos Méndez",
        correo: "carlos.mendez@uajs.edu.co",
        rol: "Administrativo",
        programa: "Bienestar Universitario",
        estado: "Activo",
        cargo: "Analista de servicios",
        campus: "Campus Norte",
        foto_perfil: "https://api.dicebear.com/7.x/initials/svg?seed=CM"
    },
    {
        id: 3,
        usuario: "profesor",
        cedula: "1023456787",
        nombre: "Laura Gómez",
        correo: "laura.gomez@uajs.edu.co",
        rol: "Docente",
        programa: "Matemáticas",
        estado: "Activo",
        cargo: "Docente titular",
        campus: "Campus central",
        foto_perfil: "https://api.dicebear.com/7.x/initials/svg?seed=LG"
    },
    {
        id: 4,
        usuario: "estudiante",
        cedula: "1023456786",
        nombre: "Andrés Torres",
        correo: "andres.torres@uajs.edu.co",
        rol: "Estudiante",
        programa: "Ingeniería de Sistemas",
        estado: "Activo",
        cargo: "Estudiante",
        campus: "Campus central",
        foto_perfil: "https://api.dicebear.com/7.x/initials/svg?seed=AT"
    },
    {
        id: 5,
        usuario: "docente2",
        cedula: "1023456785",
        nombre: "María Fernanda Cárdenas",
        correo: "mf.cardenas@uajs.edu.co",
        rol: "Docente",
        programa: "Ingeniería de Software",
        estado: "Activo",
        cargo: "Profesora de proyectos",
        campus: "Campus principal",
        foto_perfil: "https://api.dicebear.com/7.x/initials/svg?seed=MC"
    },
    {
        id: 6,
        usuario: "estudiante2",
        cedula: "1023456784",
        nombre: "Valentina Morales",
        correo: "valentina.morales@uajs.edu.co",
        rol: "Estudiante",
        programa: "Administración de Empresas",
        estado: "Activo",
        cargo: "Estudiante",
        campus: "Campus occidente",
        foto_perfil: "https://api.dicebear.com/7.x/initials/svg?seed=VM"
    },
    {
        id: 7,
        usuario: "admin2",
        cedula: "1023456783",
        nombre: "Javier Álvarez",
        correo: "javier.alvarez@uajs.edu.co",
        rol: "Administrador",
        programa: "Tecnología e innovación",
        estado: "Activo",
        cargo: "Director de operación",
        campus: "Campus principal",
        foto_perfil: "https://api.dicebear.com/7.x/initials/svg?seed=JA"
    },
    {
        id: 8,
        usuario: "admvo",
        cedula: "1023456782",
        nombre: "Sofía Jiménez",
        correo: "sofia.jimenez@uajs.edu.co",
        rol: "Administrativo",
        programa: "Servicios estudiantiles",
        estado: "Inactivo",
        cargo: "Coordinadora administrativa",
        campus: "Campus centro",
        foto_perfil: "https://api.dicebear.com/7.x/initials/svg?seed=SJ"
    },
    {
        id: 9,
        usuario: "docente3",
        cedula: "1023456781",
        nombre: "Ricardo Torres",
        correo: "ricardo.torres@uajs.edu.co",
        rol: "Docente",
        programa: "Física",
        estado: "Activo",
        cargo: "Docente de laboratorio",
        campus: "Campus central",
        foto_perfil: "https://api.dicebear.com/7.x/initials/svg?seed=RT"
    },
    {
        id: 10,
        usuario: "estudiante3",
        cedula: "1023456780",
        nombre: "Isabella Ramírez",
        correo: "isabella.ramirez@uajs.edu.co",
        rol: "Estudiante",
        programa: "Ingeniería Civil",
        estado: "Activo",
        cargo: "Estudiante",
        campus: "Campus Norte",
        foto_perfil: "https://api.dicebear.com/7.x/initials/svg?seed=IR"
    },
    {
        id: 11,
        usuario: "admin3",
        cedula: "1023456779",
        nombre: "Andrés Gutiérrez",
        correo: "andres.gutierrez@uajs.edu.co",
        rol: "Administrador",
        programa: "Tecnologías de la información",
        estado: "Activo",
        cargo: "Director de sistemas",
        campus: "Campus principal",
        foto_perfil: "https://api.dicebear.com/7.x/initials/svg?seed=AG"
    },
    {
        id: 12,
        usuario: "admvo2",
        cedula: "1023456778",
        nombre: "Paula Vargas",
        correo: "paula.vargas@uajs.edu.co",
        rol: "Administrativo",
        programa: "Recursos Humanos",
        estado: "Activo",
        cargo: "Analista de talento humano",
        campus: "Campus occidente",
        foto_perfil: "https://api.dicebear.com/7.x/initials/svg?seed=PV"
    },
    {
        id: 13,
        usuario: "docente4",
        cedula: "1023456777",
        nombre: "Fernando Castillo",
        correo: "fernando.castillo@uajs.edu.co",
        rol: "Docente",
        programa: "Economía",
        estado: "Activo",
        cargo: "Docente titular",
        campus: "Campus central",
        foto_perfil: "https://api.dicebear.com/7.x/initials/svg?seed=FC"
    },
    {
        id: 14,
        usuario: "estudiante4",
        cedula: "1023456776",
        nombre: "Camila Herrera",
        correo: "camila.herrera@uajs.edu.co",
        rol: "Estudiante",
        programa: "Derecho",
        estado: "Activo",
        cargo: "Estudiante",
        campus: "Campus centro",
        foto_perfil: "https://api.dicebear.com/7.x/initials/svg?seed=CH"
    },
    {
        id: 15,
        usuario: "admin4",
        cedula: "1023456775",
        nombre: "Luisa Cardona",
        correo: "luisa.cardona@uajs.edu.co",
        rol: "Administrador",
        programa: "Administración",
        estado: "Activo",
        cargo: "Rectora",
        campus: "Campus principal",
        foto_perfil: "https://api.dicebear.com/7.x/initials/svg?seed=LC"
    },
    {
        id: 16,
        usuario: "docente5",
        cedula: "1023456774",
        nombre: "Sebastián Rojas",
        correo: "sebastian.rojas@uajs.edu.co",
        rol: "Docente",
        programa: "Idiomas",
        estado: "Inactivo",
        cargo: "Docente de inglés",
        campus: "Campus occidente",
        foto_perfil: "https://api.dicebear.com/7.x/initials/svg?seed=SR"
    },
    {
        id: 17,
        usuario: "estudiante5",
        cedula: "1023456773",
        nombre: "Daniela Ortiz",
        correo: "daniela.ortiz@uajs.edu.co",
        rol: "Estudiante",
        programa: "Psicología",
        estado: "Activo",
        cargo: "Estudiante",
        campus: "Campus Norte",
        foto_perfil: "https://api.dicebear.com/7.x/initials/svg?seed=DO"
    }
];

export const STORAGE_KEY = "uajs_users";

// ============================================================
// Colección "usuarios" del store.
//
// El mapeo y los helpers de payload viven en mapeo.js; el ciclo
// users <-> mapeo es inocuo porque ambos solo se usan dentro de
// funciones (los bindings de ESM se resuelven en la llamada, no al
// evaluar el módulo).
// ============================================================

const CLAVE_COLECCION = "usuarios";

/** Envía el password solo si el modelo lo trae con valor. */
function payloadDeUsuario(modelo) {
    const payload = mapearUsuarioAPayload(modelo);
    if (!modelo.password) {
        delete payload.password;
    }
    return payload;
}

crearColeccion({
    clave: CLAVE_COLECCION,
    leer: () => usersApi.list(),
    mapear: mapearUsuario,
    semilla: usuarios,
    crear: async (modelo) =>
        mapearUsuario(await usersApi.create(payloadDeUsuario(modelo))),
    actualizar: async (modelo) =>
        mapearUsuario(
            await usersApi.update(modelo.id_usuario ?? modelo.id, payloadDeUsuario(modelo))
        ),
    eliminar: async (modelo) => {
        await usersApi.deactivate(modelo.id_usuario ?? modelo.id);
    }
});

export function obtenerUsuarios() {
    return listar(CLAVE_COLECCION);
}

/** Fija la lista de usuarios en la colección, la cachea y avisa a los suscriptores. */
export function guardarUsuarios(lista) {
    return establecer(CLAVE_COLECCION, Array.isArray(lista) ? lista : []);
}

export function refrescarUsuarios() {
    return refrescar(CLAVE_COLECCION);
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

// ============================================================
// Operaciones asíncronas contra la API (para Usuarios.jsx)
// ============================================================

/**
 * Crea un usuario en el backend.
 * @param {object} modelo - Datos del formulario (camelCase, con password opcional).
 * @returns {Promise<object>} Usuario creado con datos del backend.
 */
export async function crearUsuario(modelo) {
    return crear(CLAVE_COLECCION, modelo);
}

/**
 * Actualiza un usuario en el backend.
 * @param {object} item - Usuario actual (desde la colección).
 * @param {object} cambios - Campos a modificar (camelCase, password opcional).
 * @returns {Promise<object>} Usuario actualizado.
 */
export async function actualizarUsuario(item, cambios) {
    return actualizar(CLAVE_COLECCION, item, cambios);
}

/**
 * Desactiva (soft delete) un usuario en el backend.
 * El endpoint marca estado = 'Inactivo'; localmente sale de la colección
 * hasta el siguiente refresco, que ya trae la fila inactiva.
 * @param {object} item - Usuario a desactivar.
 * @returns {Promise<void>}
 */
export async function desactivarUsuario(item) {
    await eliminar(CLAVE_COLECCION, item);
}

/**
 * Alterna el estado de un usuario (Activo <-> Inactivo).
 * @param {object} item - Usuario a alternar.
 * @returns {Promise<object>} Usuario con estado actualizado.
 */
export async function alternarEstadoUsuario(item) {
    return actualizar(CLAVE_COLECCION, item, {
        estado: item.estado === "Activo" ? "Inactivo" : "Activo"
    });
}

export default usuarios;