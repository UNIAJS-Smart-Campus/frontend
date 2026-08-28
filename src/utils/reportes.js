import solicitudes, { ESTADOS_SOLICITUD } from "./solicitudes";
import recursos, { TIPOS_RECURSO } from "./recursos";
import eventos, { CATEGORIAS_EVENTO } from "./eventos";
import servicios from "./services";
import pqrs, { TIPOS_PQRS } from "./pqrs";
import { ROLES, obtenerUsuarios } from "./users";

const reservas = [
    { recurso: "Salón 101", estado: "Confirmada" },
    { recurso: "Laboratorio de informática 1", estado: "Pendiente" },
    { recurso: "Auditorio principal", estado: "Confirmada" },
    { recurso: "Laboratorio de química", estado: "Cancelada" },
    { recurso: "Salón 205", estado: "Confirmada" },
    { recurso: "Video proyector", estado: "Pendiente" }
];

const ESTADOS_RESERVA = ["Confirmada", "Pendiente", "Cancelada"];

function contar(lista, campo, categorias) {
    return categorias.map((nombre) => ({
        nombre,
        total: lista.filter((item) => item[campo] === nombre).length
    }));
}

function contarPor(lista, campo) {
    const mapa = new Map();
    lista.forEach((item) => {
        const valor = item[campo];
        mapa.set(valor, (mapa.get(valor) || 0) + 1);
    });
    return [...mapa.entries()]
        .map(([nombre, total]) => ({ nombre, total }))
        .sort((a, b) => b.total - a.total);
}

function construirReportes() {
    const usuarios = obtenerUsuarios();

    const recursosDisponibles = recursos.filter(
        (item) =>
            item.estado === "Activo" && item.disponibilidad === "Disponible"
    ).length;

    const reservasConfirmadas = reservas.filter(
        (r) => r.estado === "Confirmada"
    ).length;

    const pqrsAbiertas = pqrs.filter(
        (p) => !["Resuelta", "Cerrada"].includes(p.estado)
    ).length;

    const masUtilizados = contarPor(reservas, "recurso").slice(0, 5);

    return {
        kpis: [
            {
                etiqueta: "Usuarios registrados",
                valor: usuarios.length,
                icono: "usuarios",
                tendencia: "+4.2%",
                direccion: "up"
            },
            {
                etiqueta: "Solicitudes totales",
                valor: solicitudes.length,
                icono: "solicitudes",
                tendencia: "+8.1%",
                direccion: "up"
            },
            {
                etiqueta: "Recursos disponibles",
                valor: recursosDisponibles,
                icono: "recursos",
                tendencia: "+5.7%",
                direccion: "up"
            },
            {
                etiqueta: "Reservas confirmadas",
                valor: reservasConfirmadas,
                icono: "reservas",
                tendencia: "+12.4%",
                direccion: "up"
            },
            {
                etiqueta: "Eventos programados",
                valor: eventos.length,
                icono: "eventos",
                tendencia: "+2.0%",
                direccion: "up"
            },
            {
                etiqueta: "PQRS abiertas",
                valor: pqrsAbiertas,
                icono: "pqrs",
                tendencia: "-3.1%",
                direccion: "down"
            }
        ],
        solicitudesPorEstado: contar(
            solicitudes,
            "estado",
            ESTADOS_SOLICITUD
        ),
        usuariosPorRol: contar(
            usuarios,
            "rol",
            ROLES.map((rol) => rol.nombre)
        ),
        recursosPorTipo: contar(recursos, "tipo", TIPOS_RECURSO),
        eventosPorCategoria: contar(eventos, "categoria", CATEGORIAS_EVENTO),
        reservasPorEstado: contar(reservas, "estado", ESTADOS_RESERVA),
        pqrsPorTipo: contar(pqrs, "tipo", TIPOS_PQRS),
        masUtilizados,
        serviciosDisponibles: servicios.length,
        totales: {
            solicitudes: solicitudes.length,
            reservas: reservas.length,
            recursos: recursos.length,
            usuarios: usuarios.length,
            pqrs: pqrs.length,
            eventos: eventos.length
        }
    };
}

export default construirReportes;
