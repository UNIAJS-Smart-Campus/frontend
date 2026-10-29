// ============================================================
// Mapeo — convierte filas de la BD (snake_case) a los modelos que
// espera el frontend (camelCase y nombres de dominio), y viceversa.
//
// Todas las páginas siguen hablando el "idioma" del frontend; este
// archivo es el unico lugar que conoce los nombres de la BD.
// ============================================================

import { ROLES } from "./users";

// id_rol numerico <-> nombre de rol que usa la UI
export const ID_ROL = {
    1: "Administrador",
    2: "Estudiante",
    3: "Docente",
    4: "Administrativo"
};

export function nombreDeRol(idRol, tipoUsuario) {
    return ID_ROL[Number(idRol)] || tipoUsuario || "Estudiante";
}

export function idDeRol(nombreRol) {
    const encontrado = ROLES.findIndex(
        (r) => r.nombre.toLowerCase() === String(nombreRol || "").toLowerCase()
    );
    return encontrado >= 0 ? encontrado + 1 : 2;
}

const texto = (valor, porDefecto = "") =>
    valor === null || valor === undefined ? porDefecto : valor;

/** MySQL devuelve DATE como 'YYYY-MM-DD'; a veces llega con hora. */
function soloFecha(valor) {
    if (!valor) return "";
    const textoFecha = String(valor);
    return textoFecha.slice(0, 10);
}

/** MySQL devuelve DATETIME como 'YYYY-MM-DD HH:MM:SS'; la UI usa 'YYYY-MM-DD HH:MM'. */
function fechaCorta(valor) {
    if (!valor) return "";
    return String(valor).slice(0, 16).replace("T", " ");
}

// ============================================================
// USUARIOS
// ============================================================
export function mapearUsuario(raw) {
    if (!raw) return null;
    return {
        id: raw.id_usuario,
        id_usuario: raw.id_usuario,
        usuario: texto(raw.usuario, raw.identificacion),
        identificacion: texto(raw.identificacion, raw.usuario),
        cedula: texto(raw.cedula, raw.identificacion),
        nombre: `${texto(raw.nombre)} ${texto(raw.apellido)}`.trim(),
        nombre_principal: texto(raw.nombre),
        apellido: texto(raw.apellido),
        correo: texto(raw.correo),
        telefono: texto(raw.telefono),
        rol: nombreDeRol(raw.id_rol, raw.tipo_usuario),
        id_rol: Number(raw.id_rol) || 2,
        tipo_usuario: texto(raw.tipo_usuario, "Estudiante"),
        programa: texto(raw.programa, "No especificado"),
        cargo: texto(raw.cargo),
        campus: texto(raw.campus, "Campus principal"),
        foto_perfil: texto(raw.foto_perfil, ""),
        foto: texto(raw.foto_perfil, ""),
        estado: texto(raw.estado, "Activo")
    };
}

/** Divide "Nombre Apellido" en las columnas nombre/apellido de la BD. */
function separarNombre(nombreCompleto) {
    const partes = String(nombreCompleto || "").trim().split(/\s+/);
    if (partes.length <= 1) {
        return { nombre: partes[0] || "", apellido: "" };
    }
    const apellido = partes.pop();
    return { nombre: partes.join(" "), apellido };
}

export function mapearUsuarioAPayload(modelo) {
    const { nombre, apellido } = separarNombre(modelo.nombre);
    return {
        identificacion: modelo.identificacion || modelo.usuario || modelo.cedula,
        usuario: modelo.usuario || modelo.identificacion || modelo.cedula,
        cedula: modelo.cedula || modelo.identificacion || null,
        nombre,
        apellido,
        correo: modelo.correo,
        telefono: modelo.telefono || "",
        id_rol: modelo.id_rol ?? idDeRol(modelo.rol),
        tipo_usuario: modelo.tipo_usuario || modelo.rol || "Estudiante",
        programa: modelo.programa || "",
        cargo: modelo.cargo || "",
        campus: modelo.campus || "Campus principal",
        foto_perfil: modelo.foto_perfil || modelo.foto || "",
        estado: modelo.estado || "Activo"
    };
}

/** El login devuelve id_rol numérico; la sesión necesita el nombre del rol. */
export function mapearUsuarioSesion(data) {
    return {
        id: data.id_usuario,
        id_usuario: data.id_usuario,
        usuario: texto(data.usuario, data.identificacion),
        identificacion: texto(data.identificacion),
        nombre: `${texto(data.nombre)} ${texto(data.apellido)}`.trim() || "Usuario",
        correo: texto(data.correo),
        rol: nombreDeRol(data.rol ?? data.id_rol, data.tipo_usuario),
        id_rol: Number(data.rol ?? data.id_rol) || 2,
        programa: texto(data.programa, "No especificado"),
        cargo: texto(data.cargo),
        foto: texto(data.foto_perfil || data.foto, ""),
        token: data.token
    };
}

// ============================================================
// SOLICITUDES
// ============================================================
const SERVICIO_NOMBRE = {
    1: "Solicitudes",
    2: "Reservas",
    3: "Eventos",
    4: "Recursos",
    5: "PQRS"
};

export function mapearSolicitud(raw) {
    if (!raw) return null;

    const idUsuario = raw.id_usuario;
    const idResponsable = raw.id_responsable;
    const nombreUsuario =
        [raw.usuario_nombre, raw.usuario_apellido].filter(Boolean).join(" ") ||
        texto(raw.solicitante) ||
        "Usuario";
    const nombreResponsable = texto(raw.responsable_nombre);

    return {
        id: raw.codigo || `SOL-${raw.id_solicitud}`,
        id_solicitud: raw.id_solicitud,
        codigo: texto(raw.codigo, `SOL-${raw.id_solicitud}`),
        tipo: texto(raw.tipo),
        servicio: texto(raw.servicio_nombre),
        id_servicio: raw.id_servicio ?? null,
        prioridad: texto(raw.prioridad, "Media"),
        dependencia: texto(raw.dependencia),
        fecha: soloFecha(raw.fecha_solicitud),
        fecha_hora: fechaCorta(raw.fecha_solicitud),
        descripcion: texto(raw.descripcion),
        estado: texto(raw.estado, "REGISTRADA"),
        respuesta: texto(raw.respuesta),
        solicitante: texto(raw.solicitante, nombreUsuario),
        usuario: { id: idUsuario, nombre: nombreUsuario },
        responsable: idResponsable ? { id: idResponsable, nombre: nombreResponsable } : null,
        historial: Array.isArray(raw.historial) ? raw.historial : []
    };
}

export function mapearSolicitudAPayload(modelo) {
    return {
        codigo: modelo.codigo || "",
        tipo: modelo.tipo,
        id_usuario: modelo.usuario?.id ?? null,
        id_servicio: modelo.id_servicio ?? null,
        id_responsable: modelo.responsable?.id ?? null,
        prioridad: modelo.prioridad || "Media",
        dependencia: modelo.dependencia || "",
        fecha_solicitud: modelo.fecha || soloFecha(new Date().toISOString()),
        descripcion: modelo.descripcion,
        solicitante: modelo.solicitante || modelo.usuario?.nombre || "",
        estado: modelo.estado || "REGISTRADA",
        respuesta: modelo.respuesta || ""
    };
}

export { SERVICIO_NOMBRE };

// ============================================================
// RESERVAS
// ============================================================
export function mapearReserva(raw) {
    if (!raw) return null;
    return {
        id: raw.id_reserva,
        id_usuario: raw.id_usuario,
        id_recurso: raw.id_recurso,
        usuario: texto(raw.usuario_nombre, "Usuario"),
        recurso: texto(raw.nombre_recurso, "Recurso"),
        tipo_recurso: texto(raw.tipo_recurso),
        fecha: soloFecha(raw.fecha_reserva),
        hora_inicio: texto(raw.hora_inicio).slice(0, 5),
        hora_fin: texto(raw.hora_fin).slice(0, 5),
        motivo: texto(raw.motivo),
        observaciones: texto(raw.observaciones),
        estado: texto(raw.estado, "Confirmada")
    };
}

export function mapearReservaAPayload(modelo) {
    return {
        id_usuario: modelo.id_usuario,
        id_recurso: modelo.id_recurso,
        fecha_reserva: modelo.fecha,
        hora_inicio: modelo.hora_inicio,
        hora_fin: modelo.hora_fin,
        motivo: modelo.motivo || "",
        observaciones: modelo.observaciones || "",
        estado: modelo.estado || "Confirmada"
    };
}

// ============================================================
// EVENTOS
// ============================================================
export function mapearEvento(raw) {
    if (!raw) return null;
    return {
        id: raw.id_evento,
        nombre: texto(raw.nombre_evento),
        titulo: texto(raw.nombre_evento),
        descripcion: texto(raw.descripcion),
        fecha: soloFecha(raw.fecha),
        hora_inicio: texto(raw.hora_inicio).slice(0, 5),
        hora_fin: texto(raw.hora_fin).slice(0, 5),
        ubicacion: texto(raw.ubicacion),
        tipo: texto(raw.tipo_evento),
        estado: texto(raw.estado, "Programado"),
        cupo: Number(raw.cupo) || 0,
        inscritos: Number(raw.inscritos) || 0,
        id_usuario: raw.id_usuario
    };
}

export function mapearEventoAPayload(modelo) {
    return {
        nombre_evento: modelo.nombre || modelo.titulo,
        descripcion: modelo.descripcion || "",
        fecha: modelo.fecha,
        hora_inicio: modelo.hora_inicio,
        hora_fin: modelo.hora_fin,
        ubicacion: modelo.ubicacion,
        tipo_evento: modelo.tipo,
        estado: modelo.estado || "Programado",
        id_usuario: modelo.id_usuario ?? null,
        cupo: Number(modelo.cupo) || 0,
        inscritos: Number(modelo.inscritos) || 0
    };
}

// ============================================================
// RECURSOS
// ============================================================
export function mapearRecurso(raw) {
    if (!raw) return null;
    return {
        id: raw.id_recurso,
        nombre: texto(raw.nombre_recurso),
        codigo: texto(raw.codigo),
        tipo: texto(raw.tipo_recurso),
        descripcion: texto(raw.descripcion),
        ubicacion: texto(raw.ubicacion),
        capacidad: raw.capacidad === null ? null : Number(raw.capacidad),
        estado: texto(raw.estado, "Disponible"),
        disponibilidad: texto(raw.disponibilidad, "Disponible")
    };
}

export function mapearRecursoAPayload(modelo) {
    return {
        nombre_recurso: modelo.nombre,
        codigo: modelo.codigo || "",
        tipo_recurso: modelo.tipo,
        descripcion: modelo.descripcion || "",
        ubicacion: modelo.ubicacion,
        capacidad: modelo.capacidad ?? null,
        estado: modelo.estado || "Disponible",
        disponibilidad: modelo.disponibilidad || modelo.estado || "Disponible"
    };
}

// ============================================================
// NOTIFICACIONES
// ============================================================
export function mapearNotificacion(raw) {
    if (!raw) return null;
    return {
        id: raw.id_notificacion,
        id_usuario: raw.id_usuario,
        titulo: texto(raw.titulo),
        mensaje: texto(raw.mensaje),
        tipo: texto(raw.tipo_notificacion, "info"),
        icono: texto(raw.icono, "bell"),
        leida: Boolean(Number(raw.leida)),
        fecha: fechaCorta(raw.fecha_envio)
    };
}

export function mapearNotificacionAPayload(modelo) {
    return {
        id_usuario: modelo.id_usuario,
        titulo: modelo.titulo,
        mensaje: modelo.mensaje,
        tipo_notificacion: modelo.tipo || "",
        icono: modelo.icono || "",
        leida: modelo.leida ? 1 : 0,
        fecha_envio: modelo.fecha || new Date()
    };
}

// ============================================================
// PQRS
// ============================================================
export function mapearPqrs(raw) {
    if (!raw) return null;
    return {
        id: raw.id_pqrs,
        codigo: `PQRS-${raw.id_pqrs}`,
        id_usuario: raw.id_usuario,
        usuarioId: raw.id_usuario ?? null,
        tipo: texto(raw.tipo),
        fecha: soloFecha(raw.fecha),
        estado: texto(raw.estado, "Abierta"),
        descripcion: texto(raw.descripcion),
        respuesta: texto(raw.respuesta),
        fecha_respuesta: soloFecha(raw.fecha_respuesta),
        // Campos de radicación (persistidos desde la extensión del esquema).
        sede: texto(raw.sede, "SINCELEJO"),
        area: texto(raw.area, "PQRS"),
        asunto: texto(raw.asunto),
        tipoPerfil: texto(raw.tipo_perfil, "Estudiante"),
        tipoDocumento: texto(raw.tipo_documento),
        identificacion: texto(raw.identificacion),
        nombre: texto(raw.nombre),
        telefono: texto(raw.telefono),
        correo: texto(raw.correo),
        prioridad: texto(raw.prioridad, "Media"),
        asignadoA: texto(raw.asignado_a),
        adjunto: raw.adjunto ?? null
    };
}

export function mapearPqrsAPayload(modelo) {
    return {
        id_usuario: modelo.id_usuario ?? modelo.usuarioId ?? null,
        tipo: modelo.tipo,
        fecha: modelo.fecha || soloFecha(new Date().toISOString()),
        estado: modelo.estado || "Abierta",
        descripcion: modelo.descripcion,
        respuesta: modelo.respuesta || null,
        fecha_respuesta: modelo.fecha_respuesta || null,
        sede: modelo.sede || "SINCELEJO",
        area: modelo.area || "PQRS",
        asunto: modelo.asunto || "",
        tipo_perfil: modelo.tipoPerfil || "Estudiante",
        tipo_documento: modelo.tipoDocumento || "",
        identificacion: modelo.identificacion || "",
        nombre: modelo.nombre || "",
        telefono: modelo.telefono || "",
        correo: modelo.correo || "",
        prioridad: modelo.prioridad || "Media",
        asignado_a: modelo.asignadoA || "",
        adjunto: modelo.adjunto ?? null
    };
}

// ============================================================
// INFO ACADÉMICA
// ============================================================
export function mapearPublicacion(raw) {
    if (!raw) return null;
    return {
        id: raw.id_publicacion,
        titulo: texto(raw.titulo),
        categoria: texto(raw.categoria),
        fecha: soloFecha(raw.fecha),
        autor: texto(raw.autor),
        contenido: texto(raw.contenido),
        id_usuario: raw.id_usuario,
        estado: texto(raw.estado, "Publicado"),
        usuario: texto(raw.usuario_nombre),
        // Campos persistidos desde la extensión del esquema.
        programa: texto(raw.programa, "Toda la comunidad"),
        tipoVigencia: texto(raw.tipo_vigencia, "Permanente"),
        vigencia: soloFecha(raw.vigencia),
        destacado: Boolean(Number(raw.destacado))
    };
}

export function mapearPublicacionAPayload(modelo) {
    return {
        id_usuario: modelo.id_usuario ?? null,
        titulo: modelo.titulo,
        categoria: modelo.categoria,
        fecha: modelo.fecha || soloFecha(new Date().toISOString()),
        autor: modelo.autor,
        contenido: modelo.contenido,
        estado: modelo.estado || "Publicado",
        programa: modelo.programa || "Toda la comunidad",
        tipo_vigencia: modelo.tipoVigencia || "Permanente",
        vigencia: modelo.vigencia || null,
        destacado: modelo.destacado ? 1 : 0
    };
}

// ============================================================
// CONFIGURACIÓN
// ============================================================
export function mapearConfiguracion(raw) {
    if (!raw) return null;

    let valor = raw.valor;
    if (typeof valor === "string") {
        try {
            valor = JSON.parse(valor);
        } catch {
            // el valor no era JSON: se usa tal cual
        }
    }

    return {
        id: raw.id_config,
        id_usuario: raw.id_usuario,
        seccion: texto(raw.seccion),
        valor
    };
}

export function mapearConfiguracionAPayload(modelo) {
    return {
        id_usuario: modelo.id_usuario,
        seccion: modelo.seccion,
        valor: modelo.valor
    };
}