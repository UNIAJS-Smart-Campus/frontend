import "./DataTable.css";

function DataTable({
    columns,
    rows,
    keyField = "id",
    emptyMessage = "No hay registros para mostrar."
}) {
    return (
        <div className="dtable">
            <div className="dtable__scroll">
                <table className="dtable__table">
                    <thead className="dtable__head">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key ?? col.label}
                                    className="dtable__th"
                                    style={
                                        col.width
                                            ? { width: col.width }
                                            : undefined
                                    }
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="dtable__body">
                        {rows.map((row) => (
                            <tr
                                className="dtable__row"
                                key={String(row[keyField])}
                            >
                                {columns.map((col) => (
                                    <td
                                        key={col.key ?? col.label}
                                        className={`dtable__td${col.strong ? " dtable__td--strong" : ""}`}
                                    >
                                        {col.render
                                            ? col.render(row)
                                            : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {rows.length === 0 && (
                <p className="dtable__empty">{emptyMessage}</p>
            )}
        </div>
    );
}

export default DataTable;