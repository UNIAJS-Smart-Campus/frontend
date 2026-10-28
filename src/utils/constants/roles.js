/**
 * Definiciones de rol compartidas.
 *
 * La fuente única de verdad es `utils/users.js`, que a su vez refleja la
 * tabla `roles` de la base de datos:
 *   1 = Administrador, 2 = Estudiante, 3 = Docente, 4 = Administrativo.
 *
 * Este módulo se mantiene como punto de importación estable para pantallas
 * nuevas, sin duplicar la definición de permisos.
 */
export { ROL_IDS, ROLES, permisosDeRol, accionesDeRol } from "../users";

export const ROL_ICONO = {
    Administrador: "configuracion",
    Administrativo: "servicios",
    Docente: "info",
    Estudiante: "estudiante"
};

export const ROL_CLASE = {
    Administrador: "purple",
    Administrativo: "blue",
    Docente: "green",
    Estudiante: "orange"
};
