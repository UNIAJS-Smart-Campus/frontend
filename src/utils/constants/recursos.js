export const TIPOS_RECURSO = [
    "Salas",
    "Laboratorios",
    "Auditorios",
    "Equipos"
];

export const CATEGORIAS_RECURSO = [
    "Salas",
    "Laboratorios",
    "Auditorios",
    "Equipos",
    "Mobiliario",
    "Tecnologia"
];

export const CATEGORIA_POR_TIPO = {
    "Salas": "Salas",
    "Laboratorios": "Laboratorios",
    "Auditorios": "Auditorios",
    "Equipos": "Equipos"
};

export const ESTADOS_RECURSO = [
    "Activo",
    "Inactivo",
    "En mantenimiento",
    "Retirado"
];

export const DISPONIBILIDADES = [
    "Disponible",
    "Ocupado",
    "En mantenimiento",
    "Reservado"
];

export function esEscenario(tipo) {
    return tipo === "Auditorios" || tipo === "Salas";
}