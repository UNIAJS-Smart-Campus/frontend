import { useCallback, useEffect, useState } from "react";
import { listar, refrescar, estadoDe, suscribir } from "../utils/store";

/**
 * Suscribe un componente a una colección del store.
 *
 * El primer render es síncrono con la caché; después el store notifica
 * cada vez que llega data del backend.
 *
 * @param {string} clave  Identificador de la colección.
 * @param {object} [opciones]
 * @param {boolean} [opciones.autoRefresh=true] Refresca al montar.
 */
export function useColeccion(clave, { autoRefresh = true } = {}) {
    const [version, setVersion] = useState(0);

    useEffect(() => suscribir(() => setVersion((v) => v + 1)), []);

    useEffect(() => {
        if (autoRefresh) {
            refrescar(clave);
        }
    }, [clave, autoRefresh]);

    const recargar = useCallback(() => refrescar(clave), [clave]);

    // `version` participates so the component re-renders on store notifications.
    return { items: listar(clave), recargar, ...estadoDe(clave), version };
}

export default useColeccion;