export function construirReportes(solicitudes, reservas, eventos, notificaciones, usuarios, recursos, pqrs, user) {
    const esVistaGlobal = user?.rol === "Administrador" || user?.rol === "Administrativo";

    const solicitudesFiltradas = esVistaGlobal
        ? solicitudes
        : solicitudes.filter((s) => s.usuarioId === user?.id || (user?.id != null && s.usuarioId == null));

    const reservasFiltradas = esVistaGlobal
        ? reservas
        : reservas.filter((r) => r.usuarioId === user?.id);

    const totalSolicitudes = solicitudesFiltradas.length;
    const totalReservas = reservasFiltradas.length;
    const totalEventos = eventos.length;
    const totalNotificaciones = notificaciones.length;
    const totalUsuarios = usuarios.length;
    const totalRecursos = recursos.length;
    const totalPqrs = pqrs.length;

    const solicitudesPorEstadoObj = solicitudesFiltradas.reduce((acc, s) => {
        acc[s.estado] = (acc[s.estado] || 0) + 1;
        return acc;
    }, {});

    const reservasPorEstadoObj = reservasFiltradas.reduce((acc, r) => {
        acc[r.estado] = (acc[r.estado] || 0) + 1;
        return acc;
    }, {});

    const recursosPorTipoObj = recursos.reduce((acc, r) => {
        acc[r.tipo] = (acc[r.tipo] || 0) + 1;
        return acc;
    }, {});

    const eventosPorCategoriaObj = eventos.reduce((acc, e) => {
        const cat = e.categoria || e.tipo || "Sin categoría";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    const usuariosPorRolObj = usuarios.reduce((acc, u) => {
        const rol = u.rol || "Sin rol";
        acc[rol] = (acc[rol] || 0) + 1;
        return acc;
    }, {});

    const pqrsPorTipoObj = pqrs.reduce((acc, p) => {
        const tipo = p.tipo || "Sin tipo";
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
    }, {});

    const notificacionesNoLeidas = notificaciones.filter((n) => !n.leida).length;

    const usuariosPorRol = Object.entries(usuariosPorRolObj).map(([nombre, total]) => ({ nombre, total }));
    const reservasPorEstado = Object.entries(reservasPorEstadoObj).map(([nombre, total]) => ({ nombre, total }));
    const pqrsPorTipo = Object.entries(pqrsPorTipoObj).map(([nombre, total]) => ({ nombre, total }));
    const solicitudesPorEstado = Object.entries(solicitudesPorEstadoObj).map(([nombre, total]) => ({ nombre, total }));
    const recursosPorTipo = Object.entries(recursosPorTipoObj).map(([nombre, total]) => ({ nombre, total }));
    const eventosPorCategoria = Object.entries(eventosPorCategoriaObj).map(([nombre, total]) => ({ nombre, total }));

    const ahora = new Date();
    const tendenciaMensual = [];
    for (let i = 11; i >= 0; i--) {
        const mes = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
        const mesStr = mes.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
        const inicioMes = new Date(mes.getFullYear(), mes.getMonth(), 1);
        const finMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0, 23, 59, 59);

        const solsMes = solicitudesFiltradas.filter((s) => {
            const fecha = new Date(s.fechaCompleta || s.fecha);
            return fecha >= inicioMes && fecha <= finMes;
        }).length;

        const resvsMes = reservasFiltradas.filter((r) => {
            const fecha = new Date(r.fecha);
            return fecha >= inicioMes && fecha <= finMes;
        }).length;

        tendenciaMensual.push({ mes: mesStr, solicitudes: solsMes, reservas: resvsMes });
    }

    const masUtilizados = Object.entries(
        reservasFiltradas.reduce((acc, r) => {
            const nombre = r.recurso || "Sin recurso";
            acc[nombre] = (acc[nombre] || 0) + 1;
            return acc;
        }, {})
    ).map(([nombre, total]) => ({ nombre, total })).sort((a, b) => b.total - a.total).slice(0, 5);

    const serviciosDisponibles = recursos.filter((r) => r.disponibilidad === "Disponible").length;

    function recursosFiltradosPorUsuario() {
        if (esVistaGlobal) return recursos;
        return recursos.filter((r) => reservasFiltradas.some((res) => res.recurso === r.nombre));
    }

    const kpis = [
        { etiqueta: "Solicitudes", valor: totalSolicitudes, direccion: "up", tendencia: "+12%", icono: "solicitudes" },
        { etiqueta: "Reservas", valor: totalReservas, direccion: "up", tendencia: "+8%", icono: "reservas" },
        { etiqueta: "Eventos", valor: totalEventos, direccion: "up", tendencia: "+5%", icono: "eventos" },
        { etiqueta: "Notificaciones", valor: notificacionesNoLeidas, direccion: notificacionesNoLeidas > 0 ? "down" : "up", tendencia: notificacionesNoLeidas > 0 ? "Pendientes" : "Al día", icono: "notificaciones" },
        { etiqueta: esVistaGlobal ? "Usuarios" : "Mis recursos", valor: esVistaGlobal ? totalUsuarios : recursosFiltradosPorUsuario().length, direccion: "up", tendencia: "—", icono: "usuarios" },
    ];

    return {
        alcance: esVistaGlobal ? "global" : "personal",
        totales: {
            solicitudes: totalSolicitudes,
            reservas: totalReservas,
            eventos: totalEventos,
            notificaciones: totalNotificaciones,
            usuarios: totalUsuarios,
            recursos: totalRecursos,
            pqrs: totalPqrs,
            notificacionesNoLeidas,
            serviciosDisponibles
        },
        usuariosPorRol,
        reservasPorEstado,
        pqrsPorTipo,
        solicitudesPorEstado,
        recursosPorTipo,
        eventosPorCategoria,
        kpis,
        tendenciaMensual,
        masUtilizados,
        serviciosDisponibles,
        fechaGeneracion: new Date().toISOString()
    };
}

export const KPIS_DASHBOARD = [
    { key: "solicitudes", label: "Solicitudes", color: "blue" },
    { key: "reservas", label: "Reservas", color: "green" },
    { key: "eventos", label: "Eventos", color: "orange" },
    { key: "notificaciones", label: "Notificaciones", color: "purple" },
    { key: "usuarios", label: "Usuarios", color: "teal" }
];