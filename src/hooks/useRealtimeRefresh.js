import { useEffect, useRef } from "react";

/**
 * Ejecuta `callback` cuando el backend avisa por WebSocket que cambió un
 * recurso. Evita polling: solo se refresca cuando hay un cambio real.
 *
 * @param {Function} callback
 * @param {string[]} resources recursos a escuchar (vacío = todos)
 */
function useRealtimeRefresh(callback, resources = []) {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const key = resources.join(",");

    useEffect(() => {
        const handler = (event) => {
            const resource = event?.detail?.resource;
            if (!key || key.split(",").includes(resource)) {
                callbackRef.current?.(event.detail);
            }
        };

        window.addEventListener("smart-campus:data-changed", handler);
        return () => window.removeEventListener("smart-campus:data-changed", handler);
    }, [key]);
}

export default useRealtimeRefresh;
