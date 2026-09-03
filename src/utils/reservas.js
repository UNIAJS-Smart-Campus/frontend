export const ESTADOS_RESERVA = ["Confirmada", "Pendiente", "Cancelada"];

function fechaSumada(dias) {
    const f = new Date();
    f.setDate(f.getDate() + dias);
    return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
}

const RESERVAS_BASE = [
    {
        id: "RES-INICIAL-1",
        recurso: "Salón 101",
        tipoRecurso: "Salas",
        fecha: fechaSumada(1),
        horaInicio: "10:00",
        horaFin: "12:00",
        proposito: "Reunión de grupo",
        estado: "Confirmada",
        usuarioId: 4,
        usuario: "Andrés Torres"
    },
    {
        id: "RES-INICIAL-2",
        recurso: "Laboratorio de informática 1",
        tipoRecurso: "Laboratorios",
        fecha: fechaSumada(2),
        horaInicio: "14:00",
        horaFin: "16:00",
        proposito: "Práctica de programación",
        estado: "Pendiente",
        usuarioId: 4,
        usuario: "Andrés Torres"
    },
    {
        id: "RES-INICIAL-3",
        recurso: "Auditorio principal",
        tipoRecurso: "Auditorios",
        fecha: fechaSumada(3),
        horaInicio: "08:00",
        horaFin: "09:00",
        proposito: "Asamblea estudiantil",
        estado: "Confirmada",
        usuarioId: 3,
        usuario: "Laura Gómez"
    },
    {
        id: "RES-INICIAL-4",
        recurso: "Salón 205",
        tipoRecurso: "Salas",
        fecha: fechaSumada(4),
        horaInicio: "09:00",
        horaFin: "11:00",
        proposito: "Clase de matemáticas",
        estado: "Confirmada",
        usuarioId: 3,
        usuario: "Laura Gómez"
    },
    {
        id: "RES-INICIAL-5",
        recurso: "Laboratorio de química",
        tipoRecurso: "Laboratorios",
        fecha: fechaSumada(5),
        horaInicio: "13:00",
        horaFin: "15:00",
        proposito: "Práctica de laboratorio",
        estado: "Cancelada",
        usuarioId: 4,
        usuario: "Andrés Torres"
    },
    {
        id: "RES-INICIAL-6",
        recurso: "Video proyector Epson 4K",
        tipoRecurso: "Equipos",
        fecha: fechaSumada(6),
        horaInicio: "16:00",
        horaFin: "18:00",
        proposito: "Presentación de proyecto de grado",
        estado: "Pendiente",
        usuarioId: 1,
        usuario: "Natalia Rodríguez"
    },
    {
        id: "RES-INICIAL-7",
        recurso: "Auditorio B",
        tipoRecurso: "Auditorios",
        fecha: fechaSumada(7),
        horaInicio: "15:00",
        horaFin: "17:00",
        proposito: "Conferencia de empleabilidad",
        estado: "Confirmada",
        usuarioId: 2,
        usuario: "Carlos Méndez"
    },
    {
        id: "RES-INICIAL-8",
        recurso: "Laboratorio de redes",
        tipoRecurso: "Laboratorios",
        fecha: fechaSumada(8),
        horaInicio: "08:00",
        horaFin: "10:00",
        proposito: "Práctica de configuración de routers",
        estado: "Confirmada",
        usuarioId: 5,
        usuario: "María Fernanda Cárdenas"
    }
];

export const STORAGE_KEY = "uajs_reservas";

export function obtenerReservas() {
    try {
        const guardadas = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (guardadas.length > 0) return guardadas;
        guardarReservas(RESERVAS_BASE);
        return RESERVAS_BASE;
    } catch {
        return RESERVAS_BASE;
    }
}

export function guardarReservas(lista) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch {
        // si localStorage no está disponible se ignora
    }
}

export default RESERVAS_BASE;
