import { useMemo, useState } from "react";

function usePagination(items, porPagina = 10) {
    const [pagina, setPagina] = useState(1);

    const totalPaginas = Math.max(1, Math.ceil(items.length / porPagina));
    const paginaSegura = Math.min(pagina, totalPaginas);

    const inicio = (paginaSegura - 1) * porPagina;

    const itemsPagina = useMemo(
        () => items.slice(inicio, inicio + porPagina),
        [items, inicio, porPagina]
    );

    return {
        pagina: paginaSegura,
        setPagina,
        totalPaginas,
        itemsPagina,
        desde: items.length === 0 ? 0 : inicio + 1,
        hasta: inicio + itemsPagina.length
    };
}

export default usePagination;