import { useMemo } from "react";

function useSearch(items, query, fields = []) {
    const normalized = query.trim().toLowerCase();

    const results = useMemo(() => {
        if (!normalized) {
            return items;
        }

        return items.filter((item) =>
            fields.some((field) =>
                String(item[field] ?? "").toLowerCase().includes(normalized)
            )
        );
    }, [items, normalized, fields]);

    return results;
}

export default useSearch;