import "./Pagination.css";

function Pagination({
    pagina,
    totalPaginas,
    onChange,
    desde,
    hasta,
    total
}) {
    if (totalPaginas <= 1) {
        return null;
    }

    const inicio = Math.max(1, pagina - 2);
    const fin = Math.min(totalPaginas, inicio + 4);

    const numeros = [];
    for (let i = inicio; i <= fin; i += 1) {
        numeros.push(i);
    }

    return (
        <div className="pag">
            <span className="pag__info">
                {desde}–{hasta} de {total} registros
            </span>

            <div className="pag__buttons">
                <button
                    type="button"
                    className="pag__btn"
                    disabled={pagina === 1}
                    onClick={() => onChange(pagina - 1)}
                    aria-label="Página anterior"
                >
                    ‹
                </button>

                {inicio > 1 && (
                    <button
                        type="button"
                        className="pag__btn"
                        onClick={() => onChange(1)}
                    >
                        1
                    </button>
                )}

                {inicio > 2 && <span className="pag__gap">…</span>}

                {numeros.map((numero) => (
                    <button
                        key={numero}
                        type="button"
                        className={
                            numero === pagina
                                ? "pag__btn pag__btn--active"
                                : "pag__btn"
                        }
                        onClick={() => onChange(numero)}
                    >
                        {numero}
                    </button>
                ))}

                {fin < totalPaginas - 1 && <span className="pag__gap">…</span>}

                {fin < totalPaginas && (
                    <button
                        type="button"
                        className="pag__btn"
                        onClick={() => onChange(totalPaginas)}
                    >
                        {totalPaginas}
                    </button>
                )}

                <button
                    type="button"
                    className="pag__btn"
                    disabled={pagina === totalPaginas}
                    onClick={() => onChange(pagina + 1)}
                    aria-label="Página siguiente"
                >
                    ›
                </button>
            </div>
        </div>
    );
}

export default Pagination;