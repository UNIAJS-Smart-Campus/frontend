// ============================================================
// useSugerencias — sugerencias del SearchBar desde Elasticsearch.
//
// Sustituye el cálculo en memoria (items -> [textos]) por una consulta al
// search-service, manteniendo el array local como RESPALDO: si el backend
// falla, no hay conexión o Elasticsearch está caído, se devuelven las
// sugerencias locales y la UI sigue funcionando igual que antes.
//
// Detalles:
//   - Debounce de 300 ms para no disparar una petición por tecla.
//   - Mínimo de 2 caracteres, que es lo que exige /api/search.
//   - Guardia de secuencia: se descarta cualquier respuesta que llegue
//     fuera de orden (la última petición es la única que pinta).
// ============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { searchApi, API_HABILITADA } from "../utils/api";
import { normalizarSugerencias } from "../utils/sugerencias";

const DEBOUNCE_MS = 300;
const MIN_CARACTERES = 2;
const LIMITE = 8;

/**
 * @param {string} valor        Texto que se está escribiendo.
 * @param {string} tipo         Entidad de Elasticsearch (USUARIOS, RECURSOS…).
 * @param {string[]} locales    Sugerencias calculadas en memoria (respaldo).
 * @param {number} limite       Máximo de sugerencias devueltas.
 */
function useSugerencias(valor, tipo, locales = [], limite = LIMITE) {
    const [remotas, setRemotas] = useState(null);
    const secuencia = useRef(0);

    const termino = valor.trim();
    const claveConsulta = JSON.stringify([API_HABILITADA, tipo, termino, limite]);

    useEffect(() => {
        const actual = ++secuencia.current;

        // Con menos de 2 caracteres o sin API no se consulta: se usa local.
        if (!API_HABILITADA || !tipo || termino.length < MIN_CARACTERES) {
            return undefined;
        }

        const temporizador = setTimeout(async () => {
            try {
                const payload = await searchApi.all(termino, tipo, limite);
                // Respuesta obsoleta: ya se lanzó otra petición más reciente.
                if (secuencia.current !== actual) return;

                const textos = normalizarSugerencias(payload, tipo);
                setRemotas({
                    clave: claveConsulta,
                    items: textos.length ? textos : null
                });
            } catch {
                if (secuencia.current !== actual) return;
                // Sin backend: se cae al respaldo local.
                setRemotas({ clave: claveConsulta, items: null });
            }
        }, DEBOUNCE_MS);

        return () => clearTimeout(temporizador);
    }, [claveConsulta, termino, tipo, limite]);

    const sugerenciasRemotas =
        remotas?.clave === claveConsulta ? remotas.items : null;

    return useMemo(() => {
        if (sugerenciasRemotas?.length) {
            return sugerenciasRemotas.slice(0, limite);
        }
        return locales.slice(0, limite);
    }, [sugerenciasRemotas, locales, limite]);
}

export default useSugerencias;
