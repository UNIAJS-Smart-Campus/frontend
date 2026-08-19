export const TIPOS_PQRS = [
    "Petición",
    "Queja",
    "Reclamo",
    "Sugerencia"
];

const pqrs = [
    {
        id: "PQRS-2026-014",
        tipo: "Queja",
        fecha: "2026-08-12",
        estado: "En revisión",
        descripcion: "Queja por la demora en la entrega de constancias académicas."
    },
    {
        id: "PQRS-2026-013",
        tipo: "Petición",
        fecha: "2026-08-09",
        estado: "Resuelta",
        descripcion: "Solicitud de información sobre el proceso de homologación."
    },
    {
        id: "PQRS-2026-012",
        tipo: "Sugerencia",
        fecha: "2026-08-05",
        estado: "Cerrada",
        descripcion: "Sugerencia para ampliar los horarios de atención de la biblioteca."
    },
    {
        id: "PQRS-2026-011",
        tipo: "Reclamo",
        fecha: "2026-08-02",
        estado: "Asignada",
        descripcion: "Reclamo por el estado de los equipos del laboratorio de informática 2."
    }
];

export default pqrs;