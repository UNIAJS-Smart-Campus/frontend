export const ESTADOS_SOLICITUD = [
    "REGISTRADA",
    "EN_REVISION",
    "ASIGNADA",
    "EN_PROCESO",
    "RESUELTA",
    "CERRADA",
    "RECHAZADA",
    "REABIERTA",
    "PAUSADA"
];

export const ESTADOS_FINALES = [
    "RESUELTA",
    "CERRADA",
    "RECHAZADA"
];

export const ACCIONES_POR_ESTADO = {
    REGISTRADA: ["revisar", "cancelar"],
    EN_REVISION: ["aprobar", "rechazar", "reasignar", "cancelar"],
    ASIGNADA: ["iniciar", "reasignar", "cancelar"],
    EN_PROCESO: ["resolver", "pausar", "reasignar", "cancelar"],
    RESUELTA: ["cerrar", "reabrir"],
    CERRADA: ["reabrir"],
    RECHAZADA: ["reabrir"],
    REABIERTA: ["revisar", "cancelar"],
    PAUSADA: ["reanudar", "cancelar"]
};

export const ETIQUETA_ESTADO = {
    REGISTRADA: "Registrada",
    EN_REVISION: "En revisión",
    ASIGNADA: "Asignada",
    EN_PROCESO: "En proceso",
    RESUELTA: "Resuelta",
    CERRADA: "Cerrada",
    RECHAZADA: "Rechazada",
    REABIERTA: "Reabierta",
    PAUSADA: "Pausada"
};

export const ETIQUETA_ACCION = {
    revisar: "Revisar",
    cancelar: "Cancelar",
    aprobar: "Aprobar",
    rechazar: "Rechazar",
    reasignar: "Reasignar",
    iniciar: "Iniciar",
    resolver: "Resolver",
    pausar: "Pausar",
    cerrar: "Cerrar",
    reabrir: "Reabrir",
    reanudar: "Reanudar"
};

export const MAPA_ESTADO_SOLICITUD = {
    "registrada": "REGISTRADA",
    "en revision": "EN_REVISION",
    "en revisión": "EN_REVISION",
    "asignada": "ASIGNADA",
    "en proceso": "EN_PROCESO",
    "resuelta": "RESUELTA",
    "cerrada": "CERRADA",
    "rechazada": "RECHAZADA",
    "reabierta": "REABIERTA",
    "pausada": "PAUSADA"
};

export const TIPOS_SOLICITUD = [
    "Reserva de auditorio",
    "Constancia académica",
    "Reserva de laboratorio",
    "Inscripción a evento",
    "Queja",
    "Préstamo de equipos",
    "Constancia académica",
    "Certificado de estudio",
    "Cambio de programa",
    "Homologaciones"
];

export const PRIORIDADES = ["Baja", "Media", "Alta", "Crítica"];

export const ESTADO_COLOR = {
    REGISTRADA: "gray",
    EN_REVISION: "blue",
    ASIGNADA: "purple",
    EN_PROCESO: "orange",
    RESUELTA: "green",
    CERRADA: "gray",
    RECHAZADA: "red",
    REABIERTA: "blue",
    PAUSADA: "orange"
};

export const ORDEN_ESTADOS = [
    "REGISTRADA",
    "EN_REVISION",
    "ASIGNADA",
    "EN_PROCESO",
    "RESUELTA",
    "CERRADA"
];

export function progresoDe(estado) {
    const idx = ORDEN_ESTADOS.indexOf(estado);
    if (idx === -1) return 0;
    return Math.round(((idx + 1) / ORDEN_ESTADOS.length) * 100);
}