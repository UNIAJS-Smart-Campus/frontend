export const CATEGORIAS = [
    "Convocatoria",
    "Taller",
    "Resultado",
    "Aviso academico",
    "Evento",
    "Otro"
];

export const CATEGORIA_ICONO = {
    Convocatoria: "info",
    Taller: "servicios",
    Resultado: "notificaciones",
    "Aviso academico": "notificaciones",
    Evento: "eventos",
    Otro: "info"
};

export const CATEGORIA_CLASE = {
    Convocatoria: "blue",
    Taller: "green",
    Resultado: "purple",
    "Aviso academico": "orange",
    Evento: "blue",
    Otro: "gray"
};

export const ESTADO_CLASE = {
    Pendiente: "orange",
    Aprobada: "green",
    Rechazada: "red",
    Vencida: "gray"
};

export const PROGRAMAS = [
    "Ingenieria de Sistemas",
    "Ingenieria Electronica",
    "Ingenieria Industrial",
    "Administracion de Empresas",
    "Contaduria Publica",
    "Derecho",
    "Psicologia",
    "Enfermeria",
    "Medicina Veterinaria",
    "Zootecnia"
];

export const formVacio = {
    titulo: "",
    categoria: "",
    fecha: new Date().toISOString().slice(0, 10),
    autor: "",
    contenido: "",
    estado: "Pendiente",
    id_usuario: null
};