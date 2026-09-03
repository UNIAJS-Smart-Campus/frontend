import { obtenerSolicitudes, ESTADOS_SOLICITUD } from "./solicitudes";
import { obtenerRecursos, TIPOS_RECURSO } from "./recursos";
import { obtenerReservas, ESTADOS_RESERVA } from "./reservas";
import { obtenerEventos, CATEGORIAS_EVENTO } from "./eventos";
import servicios from "./services";
import { obtenerPqrs, TIPOS_PQRS } from "./pqrs";
import { ROLES, obtenerUsuarios } from "./users";

// ── Helpers ──────────────────────────────────────────────────

/** Cuenta cuántos items de `lista` tienen `lista[campo] === categoría` */
function contar(lista, campo, categorias) {
    return categorias.map((nombre) => ({
        nombre,
        total: lista.filter((item) => item[campo] === nombre).length
    }));
}

/** Agrupa `lista` por `campo` y devuelve [{nombre, total}] ordenado desc */
function contarPor(lista, campo) {
    const mapa = new Map();
    lista.forEach((item) => {
        const valor = item[campo];
        if (valor !== undefined) {
            mapa.set(valor, (mapa.get(valor) || 0) + 1);
        }
    });
    return [...mapa.entries()]
        .map(([nombre, total]) => ({ nombre, total }))
        .sort((a, b) => b.total - a.total);
}

/**
 * Construye la tendencia mensual de los últimos 12 meses usando
 * las fechas reales de solicitudes y reservas.
 * Si un item no tiene campo `fecha`, se ignora.
 */
function calcularTendencia(solicitudes, reservas) {
    const MESES_CORTOS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

    // Generar los últimos 12 meses desde el mes actual (inclusive)
    const ahora = new Date();
    const meses = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(ahora.getFullYear(), ahora.getMonth() - 11 + i, 1);
        return {
            año: d.getFullYear(),
            mes: d.getMonth(),          // 0-11
            etiqueta: MESES_CORTOS[d.getMonth()],
            solicitudes: 0,
            reservas: 0
        };
    });

    // Contar solicitudes por mes
    solicitudes.forEach((s) => {
        if (!s.fecha) return;
        const d = new Date(s.fecha);
        if (isNaN(d)) return;
        const entrada = meses.find(
            (m) => m.año === d.getFullYear() && m.mes === d.getMonth()
        );
        if (entrada) entrada.solicitudes += 1;
    });

    // Contar reservas por mes
    reservas.forEach((r) => {
        if (!r.fecha) return;
        const d = new Date(r.fecha);
        if (isNaN(d)) return;
        const entrada = meses.find(
            (m) => m.año === d.getFullYear() && m.mes === d.getMonth()
        );
        if (entrada) entrada.reservas += 1;
    });

    return meses.map(({ etiqueta, solicitudes, reservas }) => ({
        mes: etiqueta,
        solicitudes,
        reservas
    }));
}

// ── Constructor principal ─────────────────────────────────────

function construirReportes(rol = null, usuarioId = null) {
    // Leer siempre desde localStorage (datos en tiempo real)
    const todosUsuarios  = obtenerUsuarios();
    const todasSolicitudes = obtenerSolicitudes();
    const recursos       = obtenerRecursos();
    const todasReservas  = obtenerReservas();
    const todosEventos   = obtenerEventos();
    const todasPqrs      = obtenerPqrs();

    // Para Admin/Administrativo: vista global del campus.
    // Para Docente/Estudiante: vista personal filtrada por usuarioId.
    const esVistaGlobal =
        !rol || rol === "Administrador" || rol === "Administrativo";

    const solicitudes = esVistaGlobal
        ? todasSolicitudes
        : todasSolicitudes.filter(
              (s) =>
                  s.usuario?.id === usuarioId ||
                  s.usuario?.nombre === usuarioId ||
                  (usuarioId != null && s.usuario?.id == null)
          );

    const reservas = esVistaGlobal
        ? todasReservas
        : todasReservas.filter((r) => r.usuarioId === usuarioId);

    const pqrs = esVistaGlobal
        ? todasPqrs
        : todasPqrs.filter(
              (p) => p.usuarioId === usuarioId || p.solicitante === usuarioId
          );

    const eventos = esVistaGlobal
        ? todosEventos
        : todosEventos; // Los eventos son visibles para todos; no se filtran por usuario.

    // KPI derivados
    const recursosDisponibles = recursos.filter(
        (r) => r.estado === "Activo" && r.disponibilidad === "Disponible"
    ).length;

    const reservasConfirmadas = reservas.filter(
        (r) => r.estado === "Confirmada"
    ).length;

    const pqrsAbiertas = pqrs.filter(
        (p) => !["Resuelta", "Cerrada"].includes(p.estado)
    ).length;

    // Top 5 recursos más reservados (por nombre) sobre las reservas visibles
    const masUtilizados = contarPor(reservas, "recurso").slice(0, 5);

    // Tendencia mensual calculada sobre datos visibles
    const tendenciaMensual = calcularTendencia(solicitudes, reservas);

    return {
        tendenciaMensual,
        alcance: esVistaGlobal ? "global" : "personal",

        kpis: [
            {
                etiqueta: esVistaGlobal
                    ? "Usuarios registrados"
                    : "Mis solicitudes activas",
                valor: esVistaGlobal ? todosUsuarios.length : solicitudes.length,
                icono: esVistaGlobal ? "usuarios" : "solicitudes",
                tendencia: "+4.2%",
                direccion: "up"
            },
            {
                etiqueta: esVistaGlobal
                    ? "Solicitudes totales"
                    : "Mis solicitudes",
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
                etiqueta: esVistaGlobal
                    ? "Reservas confirmadas"
                    : "Mis reservas confirmadas",
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
                etiqueta: esVistaGlobal ? "PQRS abiertas" : "Mis PQRS abiertas",
                valor: pqrsAbiertas,
                icono: "pqrs",
                tendencia: "-3.1%",
                direccion: "down"
            }
        ],

        solicitudesPorEstado:  contar(solicitudes, "estado",    ESTADOS_SOLICITUD),
        // usuariosPorRol solo aplica a vista global; en vista personal no aporta.
        usuariosPorRol:        esVistaGlobal
            ? contar(todosUsuarios, "rol", ROLES.map((r) => r.nombre))
            : [],
        recursosPorTipo:       contar(recursos,    "tipo",       TIPOS_RECURSO),
        eventosPorCategoria:   contar(eventos,     "categoria",  CATEGORIAS_EVENTO),
        reservasPorEstado:     contar(reservas,    "estado",     ESTADOS_RESERVA),
        pqrsPorTipo:           contar(pqrs,        "tipo",       TIPOS_PQRS),

        masUtilizados,
        serviciosDisponibles: servicios.length,

        totales: {
            solicitudes: solicitudes.length,
            reservas:    reservas.length,
            recursos:    recursos.length,
            usuarios:    esVistaGlobal ? todosUsuarios.length : 0,
            pqrs:        pqrs.length,
            eventos:     eventos.length
        }
    };
}

export default construirReportes;
