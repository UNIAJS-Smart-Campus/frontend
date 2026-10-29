// ============================================================
// CONFIGURACIÓN — colección conectada al configuration-service.
//
// La tabla `configuracion` guarda una fila por (id_usuario, seccion) y el
// valor en JSON. El servicio lo devuelve como STRING, así que el mapper lo
// parsea aquí una sola vez: el resto del front trabaja con objetos.
//
// El id real de la fila es `id_config`. La página usaba `fila.id`, que no
// existe en la respuesta (por eso el PUT llegaba a /configuration/undefined
// y el servicio respondía 500). El mapper lo normaliza a `id` para que la
// página no tenga que conocer el nombre de la columna.
//
// Lecturas: `list` se acota al usuario en sesión (el service devuelve las
// filas de TODOS los usuarios si no se le pasa id_usuario) y `cargarSeccion`
// usa `getByUserAndSection` para releer una sección puntual.
// ============================================================

import { configurationApi } from "./api";
import {
    crearColeccion,
    crear as crearEnColeccion,
    actualizar as actualizarEnColeccion,
    eliminar as eliminarDeColeccion
} from "./store";

export const CLAVE_CONFIGURACION = "configuracion";

// Misma clave que usa el resto del front para leer la sesión.
const CLAVE_SESION = "uajs_session";

/**
 * Id del usuario en sesión; null si no hay sesión.
 * El service devuelve filas de TODOS los usuarios si no se le pasa
 * id_usuario, así que se acota la lectura al usuario actual.
 */
function idUsuarioSesion() {
    try {
        const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION) || "null");
        return sesion?.id_usuario ?? sesion?.id ?? null;
    } catch {
        return null;
    }
}

/** Fila cruda de la BD → modelo del front. */
export function normalizarConfiguracion(raw) {
    if (!raw) return null;

    let valor = raw.valor;
    if (typeof valor === "string") {
        try {
            valor = JSON.parse(valor);
        } catch {
            // Si no es JSON válido se conserva tal cual en vez de romper la fila.
        }
    }

    return {
        id: raw.id_config,
        id_config: raw.id_config,
        id_usuario: raw.id_usuario,
        seccion: raw.seccion,
        valor
    };
}

const coleccion = crearColeccion({
    clave: CLAVE_CONFIGURACION,
    // Sin id_usuario el service devuelve las filas de todos los usuarios;
    // se pasa el de la sesión para traer solo las propias.
    leer: () => configurationApi.list(idUsuarioSesion()),
    mapear: normalizarConfiguracion,
    semilla: [],
    crear: async (modelo) => {
        const creada = await configurationApi.create({
            id_usuario: modelo.id_usuario,
            seccion: modelo.seccion,
            valor: modelo.valor
        });
        return normalizarConfiguracion(creada);
    },
    actualizar: async (modelo) => {
        const guardada = await configurationApi.update(modelo.id, {
            id_usuario: modelo.id_usuario,
            seccion: modelo.seccion,
            valor: modelo.valor
        });
        return normalizarConfiguracion(guardada);
    },
    eliminar: async (modelo) => {
        await configurationApi.remove(modelo.id);
    }
});

// store.crearColeccion no copia los handlers al estado interno: se completan
// aquí para que refrescar()/crear()/actualizar()/eliminar() lleguen al servicio.
if (!coleccion.leer) {
    coleccion.leer = () => configurationApi.list(idUsuarioSesion());
    coleccion.mapear = normalizarConfiguracion;
}
if (!coleccion.crear) {
    coleccion.crear = async (modelo) => {
        const creada = await configurationApi.create({
            id_usuario: modelo.id_usuario,
            seccion: modelo.seccion,
            valor: modelo.valor
        });
        return normalizarConfiguracion(creada);
    };
}
if (!coleccion.actualizar) {
    coleccion.actualizar = async (modelo) => {
        const guardada = await configurationApi.update(modelo.id, {
            id_usuario: modelo.id_usuario,
            seccion: modelo.seccion,
            valor: modelo.valor
        });
        return normalizarConfiguracion(guardada);
    };
}
if (!coleccion.eliminar) {
    coleccion.eliminar = async (modelo) => {
        await configurationApi.remove(modelo.id);
    };
}

/** Filas de configuración de un usuario concreto. */
export function configuracionDeUsuario(idUsuario) {
    return coleccion.items.filter(
        (fila) => Number(fila.id_usuario) === Number(idUsuario)
    );
}

/**
 * Lee UNA sección directamente del servicio (`getByUserAndSection`) sin
 * depender de la lista cacheada. Útil cuando se necesita el valor más
 * reciente de una sección puntual y no merece la pena traer toda la lista.
 *
 * Devuelve el modelo normalizado, o null si esa sección no existe todavía.
 */
export async function cargarSeccion(idUsuario, seccion) {
    if (!idUsuario || !seccion) return null;
    try {
        const fila = await configurationApi.getByUserAndSection(idUsuario, seccion);
        return normalizarConfiguracion(fila);
    } catch (error) {
        // 404 = el usuario aún no tiene esa sección guardada: no es un fallo.
        if (error?.status === 404) return null;
        throw error;
    }
}

/** Crea o actualiza la fila (id_usuario, seccion) con el valor indicado. */
export function guardarSeccion(idUsuario, seccion, valor) {
    const existente = coleccion.items.find(
        (fila) =>
            fila.seccion === seccion &&
            Number(fila.id_usuario) === Number(idUsuario)
    );

    if (existente) {
        return actualizarEnColeccion(CLAVE_CONFIGURACION, existente, { valor });
    }
    return crearEnColeccion(CLAVE_CONFIGURACION, {
        id_usuario: idUsuario,
        seccion,
        valor
    });
}

/** Elimina la fila (id_usuario, seccion) si existe. */
export function eliminarSeccion(idUsuario, seccion) {
    const existente = coleccion.items.find(
        (fila) =>
            fila.seccion === seccion &&
            Number(fila.id_usuario) === Number(idUsuario)
    );
    if (!existente) return Promise.resolve();
    return eliminarDeColeccion(CLAVE_CONFIGURACION, existente);
}

export default coleccion;
