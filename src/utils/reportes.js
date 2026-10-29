// ============================================================
// REPORTES — el backend NO tiene /api/reports.
//
// Los indicadores se derivan de las colecciones del store (solicitudes,
// reservas, recursos, eventos, usuarios y pqrs) que cada módulo ya mantiene
// sincronizadas con su microservicio. La página Reportes pasa esos arrays
// en `fuentes`; si alguno todavía no está disponible se recurre al
// almacenamiento local para que la vista nunca se rompa.
//
// `construirReportes(rol, usuarioId)` sin `fuentes` conserva el
// comportamiento anterior: todo se lee de localStorage.
// ============================================================

import { obtenerSolicitudes, ESTADOS_SOLICITUD, ESTADOS_FINALES } from "./solicitudes";
import { obtenerRecursos, TIPOS_RECURSO } from "./recursos";
import { obtenerReservas, ESTADOS_RESERVA } from "./reservas";
import { obtenerEventos, CATEGORIAS_EVENTO } from "./eventos";
import servicios from "./services";
import { obtenerPqrs, TIPOS_PQRS, ESTADOS_PQRS_FINALES } from "./pqrs";
import { ROLES, obtenerUsuarios } from "./users";

// ── Helpers ──────────────────────────────────────────────────

/** Cuenta cuántos items de `lista` tienen `lista[campo] === categoría` */
function contar(lista, campo, categorias) {
    return categorias.map((nombre) => ({
        nombre,
        total: lista.filter((item) => item[campo] === nombre).length
    }));
}

/**
 * Une el catálogo conocido con los valores que realmente trae la data,
 * para que ninguna categoría real quede fuera del gráfico.
 */
function categoriasConDatos(catalogo, lista, campo) {
    const vistos = new Set(catalogo);
    lista.forEach((item) => {
        const valor = item[campo];
        if (valor) vistos.add(valor);
    });
    return [...vistos];
}

/**
 * LaColección del store y el modelo local no usan exactamente los mismos
 * nombres de campo. Esta función deja cada item con los dos, para que los
 * cálculos de abajo sirvan tanto si la data viene de la API como del
 * almacenamiento local.
 */
function adaptarSolicitudes(lista) {
    return lista.map((item) => ({
        ...item,
        fecha: item.fecha || "",
        usuario: item.usuario || {
            id: item.id_usuario ?? null,
            nombre: item.solicitante || ""
        }
    }));
}

function adaptarReservas(lista) {
    return lista.map((item) => ({
        ...item,
        fecha: item.fecha || "",
        usuarioId: item.usuarioId ?? item.id_usuario ?? null,
        recurso: item.recurso || item.nombre_recurso || ""
    }));
}

function adaptarRecursos(lista) {
    return lista.map((item) => ({
        ...item,
        nombre: item.nombre || item.nombre_recurso || "",
        tipo: item.tipo || item.tipo_recurso || "",
        estado: item.estado || "Disponible",
        disponibilidad: item.disponibilidad || item.estado || "Disponible"
    }));
}

function adaptarEventos(lista) {
    return lista.map((item) => ({
        ...item,
        nombre: item.nombre || item.titulo || "",
        fecha: item.fecha || "",
        hora: item.hora || item.hora_inicio || "",
        lugar: item.lugar || item.ubicacion || "",
        categoria: item.categoria || item.tipo || ""
    }));
}

function adaptarPqrs(lista) {
    return lista.map((item) => ({
        ...item,
        usuarioId: item.usuarioId ?? item.id_usuario ?? null,
        solicitante: item.solicitante || "",
        estado: item.estado || ""
    }));
}

/**
 * Construye la tendencia mensual de los últimos 12 meses usando
 * las fechas reales de solicitudes y reservas.
 *
 * Si hay datos con fecha válida, se calcula la fecha máxima real y se genera
 * una ventana de 12 meses que los cubra. Si no hay datos con fecha válida,
 * se usa la ventana estándar de los últimos 12 meses desde hoy.
 * Si un item no tiene campo `fecha`, se ignora.
 */
function calcularTendencia(solicitudes, reservas) {
    const MESES_CORTOS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

    // Recopilar todas las fechas válidas para determinar el rango real
    const todasFechas = [];
    [...solicitudes, ...reservas].forEach((item) => {
        if (!item.fecha) return;
        const d = new Date(item.fecha);
        if (!isNaN(d)) todasFechas.push(d);
    });

    // Punto de ancla: si hay datos, el último mes con datos; si no, el mes actual
    const ahora = new Date();
    let ancla;
    if (todasFechas.length > 0) {
        const maxFecha = new Date(Math.max(...todasFechas));
        // Usar el mayor entre hoy y la fecha máxima de los datos como ancla del extremo derecho
        ancla = maxFecha > ahora ? maxFecha : ahora;
    } else {
        ancla = ahora;
    }

    // Generar ventana de 12 meses terminando en el mes ancla
    const meses = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(ancla.getFullYear(), ancla.getMonth() - 11 + i, 1);
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

/**
 * @param {string|null} rol        Rol del usuario en sesión.
 * @param {number|string|null} usuarioId  Id del usuario en sesión.
 * @param {object} [fuentes]       Colecciones vivas del store. Si no se
 *                                 pasan, se leen del almacenamiento local.
 */
function construirReportes(rol = null, usuarioId = null, fuentes = null) {
    const tomar = (clave, alternativo) => {
        const desdeStore = fuentes?.[clave];
        if (Array.isArray(desdeStore) && desdeStore.length > 0) return desdeStore;
        return alternativo();
    };

    const todosUsuarios  = tomar("usuarios", obtenerUsuarios);
    const recursos       = adaptarRecursos(tomar("recursos", obtenerRecursos));
    const todosEventos   = adaptarEventos(tomar("eventos", obtenerEventos));
    const todasSolicitudes = adaptarSolicitudes(tomar("solicitudes", obtenerSolicitudes));
    const todasReservas  = adaptarReservas(tomar("reservas", obtenerReservas));
    const todasPqrs      = adaptarPqrs(tomar("pqrs", obtenerPqrs));

    // Para Admin/Administrativo: vista global del campus.
    // Para Docente/Estudiante: vista personal filtrada por usuarioId.
    const esVistaGlobal =
        !rol || rol === "Administrador" || rol === "Administrativo";

    const solicitudes = esVistaGlobal
        ? todasSolicitudes
        : todasSolicitudes.filter(
              (s) =>
                  s.usuario?.id === usuarioId ||
                  s.usuario?.nombre === usuarioId
          );

    const reservas = esVistaGlobal
        ? todasReservas
        : todasReservas.filter((r) => r.usuarioId === usuarioId);

    const pqrs = esVistaGlobal
        ? todasPqrs
        : todasPqrs.filter(
              (p) => p.usuarioId === usuarioId || p.solicitante === usuarioId
          );

    // Los eventos son visibles para todos; no se filtran por usuario.
    const eventos = todosEventos;

    // KPI derivados
    // La columna `estado` de recursos trae 'Disponible'/'Ocupada' en la BD y
    // 'Activo' en el modelo local: se aceptan ambos.
    const recursosDisponibles = recursos.filter(
        (r) =>
            ["Activo", "Disponible"].includes(r.estado) &&
            r.disponibilidad === "Disponible"
    ).length;

    const reservasConfirmadas = reservas.filter(
        (r) => r.estado === "Confirmada"
    ).length;

    // PQRS abiertas usando el catálogo canónico en vez de strings sueltos.
    const pqrsAbiertas = pqrs.filter(
        (p) => !ESTADOS_PQRS_FINALES.includes(p.estado)
    ).length;

    // "activas" = solicitudes que NO están en un estado final.
    const solicitudesActivas = solicitudes.filter(
        (s) => !ESTADOS_FINALES.includes(s.estado)
    ).length;

    // Normalizar el nombre antes de agrupar para evitar duplicados
    // por diferencias de mayúsculas/tildes. Se conserva el nombre original
    // del primer item encontrado para cada clave normalizada.
    const masUtilizados = (() => {
        const mapa = new Map();
        reservas.forEach((r) => {
            if (!r.recurso) return;
            const clave = String(r.recurso).trim().toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (!mapa.has(clave)) {
                mapa.set(clave, { nombre: String(r.recurso).trim(), total: 0 });
            }
            mapa.get(clave).total += 1;
        });
        return [...mapa.values()]
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
    })();

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
                // En vista personal muestra solo las no-finales
                valor: esVistaGlobal ? todosUsuarios.length : solicitudesActivas,
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

        solicitudesPorEstado:  contar(solicitudes, "estado", ESTADOS_SOLICITUD),
        // usuariosPorRol solo aplica a vista global; en vista personal no aporta.
        usuariosPorRol:        esVistaGlobal
            ? contar(todosUsuarios, "rol", ROLES.map((r) => r.nombre))
            : [],
        recursosPorTipo:       contar(
            recursos,
            "tipo",
            categoriasConDatos(TIPOS_RECURSO, recursos, "tipo")
        ),
        eventosPorCategoria:   contar(
            eventos,
            "categoria",
            categoriasConDatos(CATEGORIAS_EVENTO, eventos, "categoria")
        ),
        reservasPorEstado:     contar(
            reservas,
            "estado",
            categoriasConDatos(ESTADOS_RESERVA, reservas, "estado")
        ),
        pqrsPorTipo:           contar(
            pqrs,
            "tipo",
            categoriasConDatos(TIPOS_PQRS, pqrs, "tipo")
        ),

        masUtilizados,
        serviciosDisponibles: servicios.length,

        totales: {
            solicitudes: solicitudes.length,
            reservas:    reservas.length,
            recursos:    recursos.length,
            // En vista personal no tiene sentido mostrar el total
            // de usuarios del sistema; se usa null para que el componente lo omita.
            usuarios:    esVistaGlobal ? todosUsuarios.length : null,
            pqrs:        pqrs.length,
            eventos:     eventos.length
        }
    };
}

export default construirReportes;
