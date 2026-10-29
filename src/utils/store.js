// ============================================================
// Colecciones — puente entre el backend y los módulos del frontend.
//
// Las páginas siguen llamando funciones síncronas (obtenerX(), crearX()),
// pero por debajo cada colección:
//   1. devuelve de inmediato la caché local (paint instantáneo),
//   2. refresca desde la API en segundo plano,
//   3. notifica a los suscriptores cuando llegan los datos remotos.
//
// Así ninguna página necesita un estado de "cargando" propio, y si el
// backend está caído la app sigue funcionando con el último cache.
// ============================================================

const PREFIJO_CACHE = "uajs_cache_";
const TTL_CACHE_MS = 5 * 60 * 1000;
// Ventana mínima entre dos sincronizaciones no forzadas de la misma colección.
const MIN_MS_ENTRE_REFRESCOS = 15 * 1000;

const colecciones = new Map();
const suscriptores = new Set();

function notificar() {
    suscriptores.forEach((fn) => {
        try {
            fn();
        } catch {
            // un suscriptor roto no debe tumbar a los demás
        }
    });
}

export function suscribir(fn) {
    suscriptores.add(fn);
    return () => suscriptores.delete(fn);
}

function leerCache(clave) {
    try {
        const crudo = localStorage.getItem(PREFIJO_CACHE + clave);
        if (!crudo) return null;
        const { datos, guardadoEn } = JSON.parse(crudo);
        if (!Array.isArray(datos)) return null;
        // Una caché más vieja que el TTL no se usa: se descarta para no pintar
        // datos viejos antes de que llegue la API.
        if (typeof guardadoEn === "number" && Date.now() - guardadoEn > TTL_CACHE_MS) {
            return null;
        }
        return datos;
    } catch {
        return null;
    }
}

function escribirCache(clave, datos) {
    try {
        localStorage.setItem(
            PREFIJO_CACHE + clave,
            JSON.stringify({ datos, guardadoEn: Date.now() })
        );
    } catch {
        // sin localStorage disponible el store sigue funcionando en memoria
    }
}

/**
 * Crea una colección conectada a la API.
 *
 * @param {object} config
 * @param {string} config.clave          Identificador de la colección.
 * @param {Function} config.leer         () => Promise<raw[]> — GET de la API.
 * @param {Function} [config.mapear]     (raw) => item — fila de BD → modelo del front.
 * @param {Array} [config.semilla]       Datos iniciales si no hay cache.
 * @param {Function} [config.crear]      (item) => Promise<item>
 * @param {Function} [config.actualizar] (item) => Promise<item>
 * @param {Function} [config.eliminar]   (item) => Promise<void>
 */
export function crearColeccion({
    clave,
    leer,
    mapear = (raw) => raw,
    semilla = [],
    crear,
    actualizar,
    eliminar
}) {
    if (!colecciones.has(clave)) {
        const cacheado = leerCache(clave);
        const estado = {
            clave,
            items: cacheado ?? semilla ?? [],
            cargando: false,
            error: null,
            enLinea: cacheado ? null : false,
            refrescoEnVuelo: null,
            ultimoOk: null,
            // Las operaciones quedan en el estado: refrescar/crear/actualizar/
            // eliminar las consultan desde aquí y no desde el argumento.
            leer,
            mapear,
            crear,
            actualizar,
            eliminar
        };

        colecciones.set(clave, estado);

        // Primera carga desde la API, sin bloquear el render.
        if (leer) {
            queueMicrotask(() => refrescar(clave));
        }
    }
    return colecciones.get(clave);
}

export function listar(clave) {
    const estado = colecciones.get(clave);
    return estado ? estado.items : [];
}

export function estadoDe(clave) {
    const estado = colecciones.get(clave);
    return {
        cargando: Boolean(estado?.cargando),
        error: estado?.error ?? null,
        enLinea: estado ? estado.enLinea !== false : false,
        origen: estado?.enLinea === false ? "local" : "api"
    };
}

export async function refrescar(clave, { forzar = false } = {}) {
    const estado = colecciones.get(clave);
    if (!estado || !estado.leer) return estado?.items ?? [];

    // Un refresco en vuelo se comparte: varias páginas pueden montar la misma
    // colección a la vez y no debe dispararse una petición por montaje.
    if (estado.refrescoEnVuelo && !forzar) {
        return estado.refrescoEnVuelo;
    }
    // Y si la última sincronización es reciente, no se repite: navigating
    // entre páginas no debe reventar un GET por cada una.
    if (
        !forzar &&
        estado.ultimoOk != null &&
        Date.now() - estado.ultimoOk < MIN_MS_ENTRE_REFRESCOS
    ) {
        return estado.items;
    }

    estado.cargando = true;
    estado.error = null;

    const promesa = (async () => {
        try {
            const remoto = await estado.leer();
            estado.items = (remoto ?? []).map(estado.mapear).filter(Boolean);
            estado.enLinea = true;
            estado.ultimoOk = Date.now();
            escribirCache(clave, estado.items);
        } catch (error) {
            estado.error = error.message || "No se pudo sincronizar con el servidor";
            // Se conserva la caché local: la app sigue usable sin backend.
            estado.enLinea = false;
        } finally {
            estado.cargando = false;
            estado.refrescoEnVuelo = null;
            notificar();
        }
        return estado.items;
    })();

    estado.refrescoEnVuelo = promesa;
    return promesa;
}

/** Crea un registro y lo agrega a la caché; revierte si el backend falla. */
export async function crear(clave, item) {
    const estado = colecciones.get(clave);
    if (!estado?.crear) return item;

    const previo = estado.items;
    const optimista = { ...item, id: item.id ?? `tmp-${Date.now()}` };
    estado.items = [optimista, ...estado.items];
    notificar();

    let creado = optimista;
    try {
        creado = (await estado.crear(item)) ?? optimista;
        estado.items = estado.items.map((i) => (i === optimista ? creado : i));
        estado.enLinea = true;
    } catch (error) {
        estado.items = previo;
        estado.error = error.message;
        escribirCache(clave, estado.items);
        notificar();
        throw error;
    }

    escribirCache(clave, estado.items);
    notificar();
    return creado;
}

export async function actualizar(clave, item, cambios) {
    const estado = colecciones.get(clave);
    if (!estado?.actualizar) return item;

    const previo = estado.items;
    const fusionado = { ...item, ...cambios };
    estado.items = estado.items.map((i) => (i.id === item.id ? fusionado : i));
    notificar();

    let guardado = fusionado;
    try {
        guardado = (await estado.actualizar(fusionado)) ?? fusionado;
        estado.items = estado.items.map((i) => (i.id === item.id ? guardado : i));
        estado.enLinea = true;
    } catch (error) {
        estado.items = previo;
        estado.error = error.message;
        throw error;
    } finally {
        escribirCache(clave, estado.items);
        notificar();
    }
    return guardado;
}

export async function eliminar(clave, item) {
    const estado = colecciones.get(clave);
    if (!estado?.eliminar) return;

    const previo = estado.items;
    estado.items = estado.items.filter((i) => i.id !== item.id);
    notificar();

    try {
        await estado.eliminar(item);
        estado.enLinea = true;
    } catch (error) {
        estado.items = previo;
        estado.error = error.message;
        throw error;
    } finally {
        escribirCache(clave, estado.items);
        notificar();
    }
}

/** Reemplaza la lista completa de una colección (semilla, reset, fusiones). */
export function establecer(clave, items) {
    const estado = colecciones.get(clave);
    if (!estado) return items;
    estado.items = items;
    escribirCache(clave, items);
    notificar();
    return items;
}

/** Aplica una transformación local sobre los items y notifica. */
export function modificar(clave, fn) {
    const estado = colecciones.get(clave);
    if (!estado) return [];
    estado.items = fn(estado.items);
    escribirCache(clave, estado.items);
    notificar();
    return estado.items;
}

/** Descarta la caché local de una colección (útil al cambiar de usuario). */
export function limpiarCache(clave) {
    try {
        localStorage.removeItem(PREFIJO_CACHE + clave);
    } catch {
        // sin localStorage no hay nada que limpiar
    }
    const estado = colecciones.get(clave);
    if (estado) {
        estado.enLinea = false;
        // La próxima lectura normal debe volver a pegarle a la API.
        estado.ultimoOk = null;
        notificar();
    }
}

export { TTL_CACHE_MS };