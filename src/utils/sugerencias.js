// ============================================================
// SUGERENCIAS — campos por entidad que alimentan el desplegable del
// SearchBar cuando las sugerencias vienen del search-service
// (Elasticsearch) en vez de calcularse en memoria.
//
// Los nombres de campo son los del `_source` que indexa search-service
// (ver backend/services/search-service/src/services/indexer.js), no los
// del modelo de la UI. Se usan para construir el texto visible de cada
// sugerencia. El primer campo con valor es el que se muestra.
// ============================================================

// tipo de entidad -> campos del _source que se pueden mostrar
export const CAMPOS_SUGERENCIA = {
    USUARIOS: ["nombre_completo", "correo", "identificacion", "programa"],
    RECURSOS: ["nombre_recurso", "codigo", "tipo_recurso", "ubicacion"],
    EVENTOS: ["nombre_evento", "tipo_evento", "ubicacion"],
    SOLICITUDES: ["codigo", "tipo", "solicitante"],
    PQRS: ["asunto", "area", "nombre", "tipo"],
    INFO_ACADEMICA: ["titulo", "categoria", "autor", "programa"],
    RESERVAS: ["recurso", "motivo", "usuario", "tipo_recurso"]
};

/**
 * Texto visible de un hit de Elasticsearch para la entidad indicada.
 * Devuelve null si el _source no aporta nada mostrable.
 */
function textoDe(source, tipo) {
    const campos = CAMPOS_SUGERENCIA[tipo] || Object.keys(source || {});
    for (const campo of campos) {
        const valor = source?.[campo];
        if (valor !== null && valor !== undefined && String(valor).trim()) {
            return String(valor).trim();
        }
    }
    // PQRS y solicitudes se identifican en la UI por su número, no por un
    // campo de texto propio.
    if (tipo === "PQRS" && source?.id_pqrs != null) {
        return `PQRS-${source.id_pqrs}`;
    }
    if (tipo === "SOLICITUDES" && source?.id_solicitud != null) {
        return `SOL-${source.id_solicitud}`;
    }
    return null;
}

/**
 * Aplana la respuesta de /api/search (o /api/search/:index) en una lista
 * de strings lista para el SearchBar, filtrando los hits que no aportan
 * texto y quitando duplicados.
 */
export function normalizarSugerencias(payload, tipo) {
    const resultados = Array.isArray(payload?.results)
        ? payload.results
        : payload?.hits
        ? [{ hits: payload.hits }]
        : [];

    const textos = [];
    for (const bloque of resultados) {
        for (const hit of bloque?.hits || []) {
            const texto = textoDe(hit?.source, tipo);
            if (texto) textos.push(texto);
        }
    }
    return [...new Set(textos)];
}

export default CAMPOS_SUGERENCIA;
