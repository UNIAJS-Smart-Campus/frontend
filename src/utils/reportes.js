import solicitudes, { ESTADOS_SOLICITUD } from "./solicitudes";
import recursos, { TIPOS_RECURSO } from "./recursos";
import eventos, { CATEGORIAS_EVENTO } from "./eventos";
import { ROLES, obtenerUsuarios } from "./users";

function contar(lista, campo, categorias) {
    return categorias.map((nombre) => ({
        nombre,
        total: lista.filter((item) => item[campo] === nombre).length
    }));
}

function construirReportes() {
    const usuarios = obtenerUsuarios();

    const recursosDisponibles = recursos.filter(
        (item) => item.disponibilidad === "Disponible"
    ).length;

    return {
        kpis: [
            {
                etiqueta: "Usuarios registrados",
                valor: usuarios.length,
                icono: "usuarios"
            },
            {
                etiqueta: "Solicitudes totales",
                valor: solicitudes.length,
                icono: "solicitudes"
            },
            {
                etiqueta: "Recursos disponibles",
                valor: recursosDisponibles,
                icono: "recursos"
            },
            {
                etiqueta: "Eventos programados",
                valor: eventos.length,
                icono: "eventos"
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
        eventosPorCategoria: contar(eventos, "categoria", CATEGORIAS_EVENTO)
    };
}

export default construirReportes;