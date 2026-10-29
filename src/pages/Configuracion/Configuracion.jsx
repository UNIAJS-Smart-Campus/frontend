import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useAuth from "../../context/useAuth";
import { useTheme } from "../../context/ThemeContext";
import useFontSize from "../../hooks/useFontSize";
import useColeccion from "../../hooks/useColeccion";
import Icon from "../../components/Icon/Icon";
import { usersApi } from "../../utils/api";
import {
    CLAVE_CONFIGURACION,
    configuracionDeUsuario,
    cargarSeccion,
    guardarSeccion,
    eliminarSeccion
} from "../../utils/configuration";
import {
    getPhotoByUserId,
    savePhotoByUserId,
    removePhotoByUserId,
} from "../../utils/avatar";
import "./Configuracion.css";

const STORAGE_KEY = "uajs_config";

// La tabla `configuracion` tiene una fila por (id_usuario, seccion) y guarda
// `valor` como JSON; el configuration-service ya devuelve el valor parseado.
const SECCIONES = [
    { id: "cuenta", icon: "perfil", titulo: "Cuenta" },
    { id: "seguridad", icon: "configuracion", titulo: "Seguridad" },
    { id: "notificaciones", icon: "notificaciones", titulo: "Notificaciones" },
    { id: "apariencia", icon: "dashboard", titulo: "Apariencia" },
    { id: "preferencias", icon: "servicios", titulo: "Preferencias" },
    { id: "privacidad", icon: "info", titulo: "Privacidad" },
    { id: "zona-peligro", icon: "recursos", titulo: "Zona de peligro" }
];

// Secciones que se sincronizan con el backend. "zona-peligro" es solo UI.
const SECCIONES_SINCRONIZABLES = SECCIONES
    .map((item) => item.id)
    .filter((id) => id !== "zona-peligro");

const MODULOS_NOTIFICACION = [
    { id: "solicitudes", etiqueta: "Solicitudes" },
    { id: "reservas", etiqueta: "Reservas" },
    { id: "eventos", etiqueta: "Eventos" },
    { id: "pqrs", etiqueta: "PQRS" },
    { id: "info_academica", etiqueta: "Información académica" }
];

// configBase ya NO incluye idioma/zona/fecha en "cuenta" —
// esos campos viven únicamente en "preferencias".
const configBase = {
    cuenta: {
        correo: "",
        telefono: "",
        foto: ""
    },
    seguridad: {
        cerrarSesiones: false,
        historialAccesos: []
    },
    notificaciones: {
        canales: {
            plataforma: true,
            correo: true
        },
        modulos: MODULOS_NOTIFICACION.reduce(
            (acc, m) => ({ ...acc, [m.id]: true }),
            {}
        )
    },
    apariencia: {
        tema: "sistema"
    },
    preferencias: {
        idioma: "Español",
        zonaHoraria: "Bogotá (CO) — GMT-5",
        formatoFecha: "DD/MM/YYYY",
        formatoHora: "24"
    },
    privacidad: {
        nombrePublico: true,
        comunicaciones: true,
        infoAcademicaPerfil: true
    }
};

const ACCESOS_MOCK = [
    { dispositivo: "Chrome · Windows", ubicacion: "Sincelejo, Colombia", ip: "190.25.XX.XX", fecha: "Hoy, 10:23 a. m.", actual: true },
    { dispositivo: "App Móvil · Android", ubicacion: "Sincelejo, Colombia", ip: "186.100.XX.XX", fecha: "Ayer, 8:40 p. m.", actual: false },
    { dispositivo: "Safari · iPhone", ubicacion: "Montería, Colombia", ip: "170.145.XX.XX", fecha: "12 ago, 2:15 p. m.", actual: false }
];

function Toggle({ activo, onClick, label }) {
    return (
        <button
            className={
                activo
                    ? "config__toggle config__toggle--on"
                    : "config__toggle"
            }
            onClick={onClick}
            aria-label={label || "Alternar"}
        >
            <span className="config__toggle-knob" />
        </button>
    );
}

function mergeConfig(base, extra) {
    if (!extra || typeof extra !== "object") return base;
    const resultado = Array.isArray(base) ? [...base] : { ...base };
    Object.keys(extra).forEach((clave) => {
        const valorExtra = extra[clave];
        const valorBase = resultado[clave];
        if (
            valorExtra &&
            typeof valorExtra === "object" &&
            !Array.isArray(valorExtra) &&
            valorBase &&
            typeof valorBase === "object" &&
            !Array.isArray(valorBase)
        ) {
            resultado[clave] = mergeConfig(valorBase, valorExtra);
        } else {
            resultado[clave] = valorExtra;
        }
    });
    return resultado;
}

function normalizarConfiguracion(base, extra) {
    const merged = mergeConfig(base, extra);

    if (merged?.notificaciones) {
        const canalesBase = { ...base.notificaciones.canales };
        const canalesMerged = { ...canalesBase, ...(merged.notificaciones.canales || {}) };

        delete canalesMerged.push;
        delete canalesMerged.sms;
        delete canalesMerged.alertas;

        merged.notificaciones = {
            ...base.notificaciones,
            ...merged.notificaciones,
            canales: {
                plataforma: Boolean(canalesMerged.plataforma ?? true),
                correo: Boolean(canalesMerged.correo ?? true)
            }
        };
    }

    // Eliminar campos de idioma/zona/fecha que antes vivían en "cuenta"
    if (merged?.cuenta) {
        delete merged.cuenta.idioma;
        delete merged.cuenta.zonaHoraria;
        delete merged.cuenta.formatoFecha;
    }

    return merged;
}

function Configuracion() {
    const { user, logout, updateUser } = useAuth();
    const { tema, setTema } = useTheme();
    const { levels, level, setLevel } = useFontSize();
    const { items: todasLasFilas, recargar: recargarConfig } = useColeccion(CLAVE_CONFIGURACION);
    // La colección pide al servicio solo las filas del usuario en sesión
    // (list(id_usuario)); el filtro por id se mantiene como red de seguridad.
    const remotas = useMemo(
        () => configuracionDeUsuario(user?.id),
        // todasLasFilas entra como dependencia para recalcular al refrescar.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [todasLasFilas, user?.id]
    );

    const [errorConfig, setErrorConfig] = useState("");

    const [config, setConfig] = useState(() => {
        try {
            const guardada = JSON.parse(localStorage.getItem(STORAGE_KEY));
            const fotoPorId = user?.id ? getPhotoByUserId(user.id) : "";
            const base = {
                ...configBase,
                cuenta: {
                    ...configBase.cuenta,
                    correo: user?.correo || "",
                    foto: fotoPorId || configBase.cuenta.foto
                }
            };
            const merged = guardada ? normalizarConfiguracion(base, guardada) : base;

            // Priorizar foto de uajs_foto_${userId} sobre la de uajs_config
            const fotoFinal = fotoPorId || merged?.cuenta?.foto || "";
            if (user?.id && fotoFinal && fotoFinal !== fotoPorId) {
                savePhotoByUserId(user.id, fotoFinal);
            }
            merged.cuenta = { ...merged.cuenta, foto: fotoFinal };

            return merged;
        } catch {
            const fotoPorId = user?.id ? getPhotoByUserId(user.id) : "";
            return {
                ...configBase,
                cuenta: {
                    ...configBase.cuenta,
                    correo: user?.correo || "",
                    foto: fotoPorId || configBase.cuenta.foto
                }
            };
        }
    });

    const [seccion, setSeccion] = useState("cuenta");
    const [guardado, setGuardado] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    // Usuario al que ya se le aplicó la configuración que llegó del backend.
    const [configAplicadaPara, setConfigAplicadaPara] = useState(null);

    // Estado local del formulario de cuenta (se sincroniza con config.cuenta al guardar)
    const [correoEditable, setCorreoEditable] = useState(
        () => config.cuenta.correo || user?.correo || ""
    );
    const [telefonoEditable, setTelefonoEditable] = useState(
        () => config.cuenta.telefono || ""
    );

    // Estado del formulario de contraseña con validación
    const [pwdForm, setPwdForm] = useState({
        actual: "",
        nueva: "",
        confirmar: ""
    });
    const [pwdError, setPwdError] = useState("");
    const [pwdOk, setPwdOk] = useState(false);

    // Estado de confirmación para acciones de Zona de peligro
    const [confirmando, setConfirmando] = useState(null); // "sesiones" | "desactivar"

    const inicialesUsuario =
        (user?.nombre || "Usuario")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((parte) => parte[0]?.toUpperCase() || "")
            .join("") || "U";

    // Persistir en localStorage cada vez que cambia config
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }, [config]);

    // ── Sincronización con el configuration-service ──────────
    // Cada sección se guarda como una fila de `configuracion`
    // (UNIQUE id_usuario + seccion) con el valor en JSON.
    const configRef = useRef(config);
    const idUsuarioRef = useRef(user?.id);
    const pendientesRef = useRef(new Set());
    const timerRef = useRef(null);

    // Los refs se actualizan en un efecto (sin deps: en cada commit) y no
    // durante el render: escribir un ref mientras se renderiza puede dejar el
    // valor desincronizado si React descarta el render.
    useEffect(() => {
        configRef.current = config;
        idUsuarioRef.current = user?.id;
    });

    // La foto de perfil es un dataURL: pesa demasiado para la tabla
    // `configuracion` y vive en `usuarios.foto_perfil`, así que no viaja
    // al configuration-service. Se sincroniza a la BD directamente en
    // manejarFoto / eliminarFoto mediante usersApi.update.
    const valorParaBackend = (seccion, valor) => {
        if (seccion !== "cuenta") return valor;
        const resto = { ...(valor || {}) };
        delete resto.foto;
        return resto;
    };

    const volcarPendientes = useCallback(async () => {
        const pendientes = [...pendientesRef.current];
        pendientesRef.current.clear();
        const idUsuario = idUsuarioRef.current;
        if (!pendientes.length || !idUsuario) return;

        try {
            for (const nombre of pendientes) {
                const valor = valorParaBackend(nombre, configRef.current?.[nombre]);
                if (valor === undefined) continue;
                // guardarSeccion resuelve si hay que crear o actualizar la fila
                // (id_usuario, seccion) usando el id_config real.
                await guardarSeccion(idUsuario, nombre, valor);

                // Confirmación puntual: se relee SOLO la sección guardada
                // (getByUserAndSection) para verificar que quedó con el valor
                // enviado, sin volver a traer toda la lista.
                await cargarSeccion(idUsuario, nombre);
            }
            setErrorConfig("");
            await recargarConfig();
        } catch (error) {
            setErrorConfig(
                error.message || "No se pudieron guardar los cambios en el servidor."
            );
        }
    }, [recargarConfig]);

    const programarGuardado = useCallback((secciones) => {
        const lista = Array.isArray(secciones) ? secciones : [secciones];
        lista
            .filter((nombre) => SECCIONES_SINCRONIZABLES.includes(nombre))
            .forEach((nombre) => pendientesRef.current.add(nombre));
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            volcarPendientes();
        }, 700);
    }, [volcarPendientes]);

    // Limpia el temporizador si la pantalla se desmonta antes del volcado.
    useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    // Mezcla la configuración que llega del backend sobre los valores por
    // defecto. Solo se aplica una vez por usuario para no pisar lo que el
    // usuario está editando en ese momento.
    //
    // Se ajusta durante el render (patrón oficial de React para derivar estado
    // de props) en lugar de dentro de un efecto: el efecto provocaba un render
    // en cascada y, con StrictMode, una doble ejecución.
    const idUsuarioActual = user?.id ?? null;
    if (configAplicadaPara !== idUsuarioActual && remotas.length) {
        setConfigAplicadaPara(idUsuarioActual);

        const porSeccion = {};
        remotas.forEach((fila) => {
            if (fila?.seccion) porSeccion[fila.seccion] = fila.valor;
        });

        const base = {
            ...configBase,
            cuenta: {
                ...configBase.cuenta,
                ...porSeccion.cuenta,
                foto: config.cuenta?.foto || ""
            }
        };
        const mergeado = normalizarConfiguracion(base, {
            ...porSeccion,
            cuenta: porSeccion.cuenta
        });
        // El correo de la sesión es la fuente de verdad del perfil.
        mergeado.cuenta = {
            ...mergeado.cuenta,
            correo: config.cuenta?.correo || user?.correo || ""
        };

        setConfig({ ...config, ...mergeado, cuenta: mergeado.cuenta });
        if (!correoEditable) setCorreoEditable(user?.correo || "");
        if (!telefonoEditable) {
            setTelefonoEditable(porSeccion.cuenta?.telefono || "");
        }
    }

    // Auto-ocultar el aviso de guardado
    useEffect(() => {
        let timer;
        if (guardado) {
            timer = setTimeout(() => setGuardado(false), 2500);
        }
        return () => clearTimeout(timer);
    }, [guardado]);

    const marcarGuardado = (...secciones) => {
        setGuardado(true);
        setErrorConfig("");
        programarGuardado(secciones);
    };

    const cambiar = (ruta) => (e) => {
        setConfig((prev) => {
            const copia = JSON.parse(JSON.stringify(prev));
            const partes = ruta.split(".");
            let obj = copia;
            for (let i = 0; i < partes.length - 1; i++) {
                obj = obj[partes[i]];
            }
            obj[partes[partes.length - 1]] =
                e.target.type === "checkbox" ? e.target.checked : e.target.value;
            return copia;
        });
        marcarGuardado(ruta.split(".")[0]);
    };

    const alternar = (ruta) => () => {
        setConfig((prev) => {
            const copia = JSON.parse(JSON.stringify(prev));
            const partes = ruta.split(".");
            let obj = copia;
            for (let i = 0; i < partes.length - 1; i++) {
                obj = obj[partes[i]];
            }
            obj[partes[partes.length - 1]] = !obj[partes[partes.length - 1]];
            return copia;
        });
        marcarGuardado(ruta.split(".")[0]);
    };

    // Guardar cuenta: persiste correo y teléfono en config.cuenta
    const guardarCuenta = (e) => {
        e.preventDefault();
        setConfig((prev) => ({
            ...prev,
            cuenta: {
                ...prev.cuenta,
                correo: correoEditable.trim(),
                telefono: telefonoEditable.trim()
            }
        }));
        updateUser({ correo: correoEditable.trim() });
        marcarGuardado("cuenta");
    };

    const manejarFoto = async (event) => {
        const archivo = event.target.files?.[0];
        if (!archivo || !archivo.type.startsWith("image/")) return;

        const lector = new FileReader();
        lector.onload = async (e) => {
            const dataUrl = e.target?.result;
            if (!dataUrl) return;
            setConfig((prev) => ({
                ...prev,
                cuenta: { ...prev.cuenta, foto: dataUrl }
            }));
            savePhotoByUserId(user?.id, dataUrl);
            updateUser({ foto: dataUrl });
            // Sincronizar foto_perfil en la BD (usuarios table)
            try {
                await usersApi.update(user?.id, { foto_perfil: dataUrl });
            } catch (err) {
                console.warn("No se pudo sincronizar la foto a la BD:", err);
            }
            marcarGuardado();
        };
        lector.readAsDataURL(archivo);

        if (event.target) {
            event.target.value = "";
        }
    };

    const eliminarFoto = async () => {
        setConfig((prev) => ({
            ...prev,
            cuenta: { ...prev.cuenta, foto: "" }
        }));
        removePhotoByUserId(user?.id);
        updateUser({ foto: "" });
        // Sincronizar el borrado de foto_perfil en la BD
        try {
            await usersApi.update(user?.id, { foto_perfil: "" });
        } catch (err) {
            console.warn("No se pudo limpiar la foto en la BD:", err);
        }
        marcarGuardado();
    };

    // Cambiar contraseña con validación
    const actualizarPassword = (e) => {
        e.preventDefault();
        setPwdError("");
        setPwdOk(false);

        if (!pwdForm.actual.trim()) {
            setPwdError("Ingresa tu contraseña actual.");
            return;
        }
        if (pwdForm.nueva.length < 8) {
            setPwdError("La nueva contraseña debe tener al menos 8 caracteres.");
            return;
        }
        if (!/[0-9]/.test(pwdForm.nueva)) {
            setPwdError("La nueva contraseña debe incluir al menos un número.");
            return;
        }
        if (pwdForm.nueva !== pwdForm.confirmar) {
            setPwdError("La nueva contraseña y la confirmación no coinciden.");
            return;
        }
        if (pwdForm.nueva === pwdForm.actual) {
            setPwdError("La nueva contraseña no puede ser igual a la actual.");
            return;
        }

        // Aquí iría la llamada real a la API; por ahora es simulación
        setPwdForm({ actual: "", nueva: "", confirmar: "" });
        setPwdOk(true);
        setTimeout(() => setPwdOk(false), 3000);
    };

    // Selector de tema (conectado al ThemeContext)
    const aplicarTema = (valor) => {
        setTema(valor);
        setConfig((prev) => ({
            ...prev,
            apariencia: { ...prev.apariencia, tema: valor }
        }));
        marcarGuardado("apariencia");
    };

    const temas = [
        { valor: "claro", etiqueta: "Claro", icono: "dashboard" },
        { valor: "oscuro", etiqueta: "Oscuro", icono: "recursos" },
        { valor: "sistema", etiqueta: "Sistema", icono: "servicios" }
    ];

    // Handlers de Zona de peligro
    const cerrarTodasSesiones = () => {
        if (confirmando === "sesiones") {
            logout();
        } else {
            setConfirmando("sesiones");
        }
    };

    const solicitarDesactivacion = async () => {
        if (confirmando === "desactivar") {
            // Acción irreversible confirmada: se elimina la configuración
            // guardada del usuario en el servidor (DELETE /configuration/:id).
            try {
                const secciones = configuracionDeUsuario(user?.id).map(
                    (fila) => fila.seccion
                );
                for (const nombre of secciones) {
                    await eliminarSeccion(user?.id, nombre);
                }
                setErrorConfig("");
            } catch (error) {
                setErrorConfig(
                    error.message ||
                        "No se pudo eliminar la configuración en el servidor."
                );
            }
            marcarGuardado();
            setConfirmando(null);
        } else {
            setConfirmando("desactivar");
        }
    };

    const cancelarConfirmacion = () => setConfirmando(null);

    // Cerrar sesión individual en un dispositivo
    const cerrarSesionDispositivo = () => {
        // Simulación: en producción llamaría a /api/auth/sessions DELETE
        marcarGuardado();
    };

    return (
        <div className="page">
            <div className="page__header">
                <div className="page__title">
                    <p>Controla cómo funciona tu cuenta y tus preferencias.</p>
                </div>

                {guardado && !errorConfig && (
                    <span className="badge badge--green">
                        <Icon name="info" size={12} />
                        Cambios guardados
                    </span>
                )}
                {errorConfig && (
                    <span className="badge badge--red" role="alert">
                        <Icon name="solicitudes" size={12} />
                        {errorConfig}
                    </span>
                )}
            </div>

            <div className="config__layout">
                <aside className="config__side">
                    <nav className="config__menu">
                        {SECCIONES.map((item) => (
                            <button
                                key={item.id}
                                className={
                                    seccion === item.id
                                        ? "config__menu-item config__menu-item--active"
                                        : "config__menu-item"
                                }
                                onClick={() => setSeccion(item.id)}
                            >
                                <Icon name={item.icon} size={17} />
                                {item.titulo}
                            </button>
                        ))}
                    </nav>
                </aside>

                <div className="config__content">
                    {/* ============ CUENTA ============ */}
                    {seccion === "cuenta" && (
                        <section className="config__card">
                            <div className="config__card-header">
                                <div className="config__card-header-icon">
                                    <Icon name="perfil" size={17} />
                                </div>
                                <div>
                                    <h2>Cuenta</h2>
                                    <p>Información de contacto de tu cuenta.</p>
                                </div>
                            </div>

                            <form className="config__form" onSubmit={guardarCuenta}>
                                <div className="config__profile-photo">
                                    <div
                                        className="config__avatar-preview"
                                        style={
                                            config.cuenta.foto
                                                ? {
                                                    backgroundImage: `url(${config.cuenta.foto})`,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center"
                                                }
                                                : undefined
                                        }
                                    >
                                        {!config.cuenta.foto && inicialesUsuario}
                                    </div>

                                    <div className="config__profile-photo-info">
                                        <strong>Foto de perfil</strong>
                                        <p>Sube una imagen para personalizar tu cuenta.</p>
                                        <div className="config__upload-actions">
                                            <label className="config__upload-button">
                                                <input type="file" accept="image/*" onChange={manejarFoto} />
                                                <span>Seleccionar foto</span>
                                            </label>
                                            {config.cuenta.foto && (
                                                <button
                                                    type="button"
                                                    className="config__outline-button"
                                                    onClick={eliminarFoto}
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="config__form-grid">
                                    <div className="config__form-group">
                                        <label htmlFor="cfg-correo">Correo electrónico</label>
                                        <input
                                            id="cfg-correo"
                                            type="email"
                                            value={correoEditable}
                                            onChange={(e) => setCorreoEditable(e.target.value)}
                                            placeholder="correo@uajs.edu.co"
                                        />
                                    </div>

                                    <div className="config__form-group">
                                        <label htmlFor="cfg-telefono">Teléfono</label>
                                        <input
                                            id="cfg-telefono"
                                            type="tel"
                                            value={telefonoEditable}
                                            onChange={(e) => setTelefonoEditable(e.target.value)}
                                            placeholder="ej. 3001234567"
                                        />
                                    </div>
                                </div>

                                <div className="config__form-actions">
                                    <button type="submit" className="config__submit">
                                        Guardar cambios
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    {/* ============ SEGURIDAD ============ */}
                    {seccion === "seguridad" && (
                        <>
                            <section className="config__card">
                                <div className="config__card-header">
                                    <div className="config__card-header-icon">
                                        <Icon name="configuracion" size={17} />
                                    </div>
                                    <div>
                                        <h2>Cambiar contraseña</h2>
                                        <p>Asegura tu cuenta con una contraseña segura.</p>
                                    </div>
                                </div>

                                <form className="config__form" onSubmit={actualizarPassword}>
                                    {pwdError && (
                                        <p className="config__pwd-error">{pwdError}</p>
                                    )}
                                    {pwdOk && (
                                        <p className="config__pwd-ok">
                                            <Icon name="info" size={13} />
                                            Contraseña actualizada correctamente.
                                        </p>
                                    )}

                                    <div className="config__form-group">
                                        <label htmlFor="pwd-actual">Contraseña actual</label>
                                        <div className="config__password">
                                            <input
                                                id="pwd-actual"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={pwdForm.actual}
                                                onChange={(e) =>
                                                    setPwdForm((p) => ({ ...p, actual: e.target.value }))
                                                }
                                            />
                                            <button
                                                type="button"
                                                className="config__password-toggle"
                                                onClick={() => setShowPassword((v) => !v)}
                                            >
                                                {showPassword ? "Ocultar" : "Mostrar"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="config__form-grid">
                                        <div className="config__form-group">
                                            <label htmlFor="pwd-nueva">Nueva contraseña</label>
                                            <input
                                                id="pwd-nueva"
                                                type="password"
                                                placeholder="••••••••"
                                                value={pwdForm.nueva}
                                                onChange={(e) =>
                                                    setPwdForm((p) => ({ ...p, nueva: e.target.value }))
                                                }
                                            />
                                        </div>
                                        <div className="config__form-group">
                                            <label htmlFor="pwd-confirmar">Confirmar contraseña</label>
                                            <input
                                                id="pwd-confirmar"
                                                type="password"
                                                placeholder="••••••••"
                                                value={pwdForm.confirmar}
                                                onChange={(e) =>
                                                    setPwdForm((p) => ({ ...p, confirmar: e.target.value }))
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="config__password-hint">
                                        Usa al menos 8 caracteres con números y letras. No puede
                                        ser igual a la contraseña actual.
                                    </div>

                                    <div className="config__form-actions">
                                        <button
                                            type="submit"
                                            className="config__submit"
                                            disabled={
                                                !pwdForm.actual ||
                                                !pwdForm.nueva ||
                                                !pwdForm.confirmar
                                            }
                                        >
                                            Actualizar contraseña
                                        </button>
                                    </div>
                                </form>
                            </section>

                            <section className="config__card">
                                <div className="config__card-header">
                                    <div className="config__card-header-icon">
                                        <Icon name="usuarios" size={17} />
                                    </div>
                                    <div>
                                        <h2>Sesiones y dispositivos</h2>
                                        <p>Sesión actual y accesos recientes a tu cuenta.</p>
                                    </div>
                                </div>

                                <div className="config__list">
                                    {ACCESOS_MOCK.map((acceso, idx) => (
                                        <div className="config__row" key={idx}>
                                            <div className="config__row-icon">
                                                <Icon name="configuracion" size={16} />
                                            </div>
                                            <div className="config__row-info">
                                                <div className="config__row-title">
                                                    {acceso.dispositivo}
                                                    {acceso.actual && (
                                                        <span className="config__tag">Actual</span>
                                                    )}
                                                </div>
                                                <div className="config__row-desc">
                                                    {acceso.ubicacion} · {acceso.ip} · {acceso.fecha}
                                                </div>
                                            </div>
                                            {!acceso.actual && (
                                                <button
                                                    className="config__outline-button"
                                                    onClick={() => cerrarSesionDispositivo(acceso.dispositivo)}
                                                >
                                                    Cerrar
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="config__card">
                                <div className="config__card-header">
                                    <div className="config__card-header-icon">
                                        <Icon name="info" size={17} />
                                    </div>
                                    <div>
                                        <h2>Protección adicional</h2>
                                        <p>Funciones que llegarán con la autenticación real.</p>
                                    </div>
                                </div>

                                <div className="config__list">
                                    <div className="config__row">
                                        <div className="config__row-info">
                                            <div className="config__row-title">
                                                Autenticación en dos pasos (2FA)
                                            </div>
                                            <div className="config__row-desc">
                                                Refuerza la seguridad al iniciar sesión.
                                            </div>
                                        </div>
                                        <span className="config__tag config__tag--muted">Próximamente</span>
                                    </div>
                                    <div className="config__row">
                                        <div className="config__row-info">
                                            <div className="config__row-title">
                                                Claves de respaldo
                                            </div>
                                            <div className="config__row-desc">
                                                Códigos para acceder si pierdes el acceso.
                                            </div>
                                        </div>
                                        <span className="config__tag config__tag--muted">Próximamente</span>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    {/* ============ NOTIFICACIONES ============ */}
                    {seccion === "notificaciones" && (
                        <>
                            <section className="config__card">
                                <div className="config__card-header">
                                    <div className="config__card-header-icon">
                                        <Icon name="notificaciones" size={17} />
                                    </div>
                                    <div>
                                        <h2>Canales</h2>
                                        <p>Por qué medios deseas recibir los avisos.</p>
                                    </div>
                                </div>

                                <div className="config__list">
                                    <div className="config__row">
                                        <div className="config__row-icon">
                                            <Icon name="perfil" size={16} />
                                        </div>
                                        <div className="config__row-info">
                                            <div className="config__row-title">Dentro de la plataforma</div>
                                            <div className="config__row-desc">Notificaciones al ingresar a Smart Campus.</div>
                                        </div>
                                        <Toggle
                                            activo={config.notificaciones.canales.plataforma}
                                            onClick={alternar("notificaciones.canales.plataforma")}
                                            label="Notificaciones en plataforma"
                                        />
                                    </div>

                                    <div className="config__row">
                                        <div className="config__row-icon">
                                            <Icon name="solicitudes" size={16} />
                                        </div>
                                        <div className="config__row-info">
                                            <div className="config__row-title">Correo electrónico</div>
                                            <div className="config__row-desc">Recibe resúmenes en tu correo institucional.</div>
                                        </div>
                                        <Toggle
                                            activo={config.notificaciones.canales.correo}
                                            onClick={alternar("notificaciones.canales.correo")}
                                            label="Correo electrónico"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="config__card">
                                <div className="config__card-header">
                                    <div className="config__card-header-icon">
                                        <Icon name="eventos" size={17} />
                                    </div>
                                    <div>
                                        <h2>Preferencias por tipo</h2>
                                        <p>Qué actividades quieres que te notifiquen.</p>
                                    </div>
                                </div>

                                <div className="config__list">
                                    {MODULOS_NOTIFICACION.map((modulo) => (
                                        <div className="config__row" key={modulo.id}>
                                            <div className="config__row-info">
                                                <div className="config__row-title">{modulo.etiqueta}</div>
                                                <div className="config__row-desc">
                                                    Recibir una notificación por cambios en {modulo.etiqueta.toLowerCase()}.
                                                </div>
                                            </div>
                                            <Toggle
                                                activo={config.notificaciones.modulos[modulo.id]}
                                                onClick={alternar(`notificaciones.modulos.${modulo.id}`)}
                                                label={`Notificar ${modulo.etiqueta}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </>
                    )}

                    {/* ============ APARIENCIA ============ */}
                    {seccion === "apariencia" && (
                        <section className="config__card">
                            <div className="config__card-header">
                                <div className="config__card-header-icon">
                                    <Icon name="dashboard" size={17} />
                                </div>
                                <div>
                                    <h2>Tema</h2>
                                    <p>Elige cómo se ve la interfaz.</p>
                                </div>
                            </div>

                            <div className="config__themes">
                                {temas.map((opcion) => (
                                    <button
                                        key={opcion.valor}
                                        type="button"
                                        className={
                                            tema === opcion.valor
                                                ? "config__theme config__theme--active"
                                                : "config__theme"
                                        }
                                        onClick={() => aplicarTema(opcion.valor)}
                                    >
                                        <span className="config__theme-icon">
                                            <Icon name={opcion.icono} size={20} />
                                        </span>
                                        <span className="config__theme-label">{opcion.etiqueta}</span>
                                    </button>
                                ))}
                            </div>

                            <p className="config__privacy-text">
                                <strong>Sistema</strong> sigue la preferencia de tu sistema
                                operativo. <strong>Claro</strong> u <strong>Oscuro</strong> aplican
                                el tema de forma permanente independientemente del SO.
                            </p>

                            <div className="config__card-divider" />

                            <div className="config__card-header">
                                <div className="config__card-header-icon">
                                    <Icon name="servicios" size={17} />
                                </div>
                                <div>
                                    <h2>Tamaño de fuente</h2>
                                    <p>Ajusta el tamaño del texto de la aplicación.</p>
                                </div>
                            </div>

                            <div className="config__fontsize" role="group" aria-label="Tamaño de fuente">
                                {levels.map((opcion) => (
                                    <button
                                        key={opcion.id}
                                        type="button"
                                        className={
                                            opcion.id === level.id
                                                ? "config__fontsize-btn config__fontsize-btn--active"
                                                : "config__fontsize-btn"
                                        }
                                        aria-pressed={opcion.id === level.id}
                                        onClick={() => setLevel(opcion)}
                                    >
                                        {opcion.label}
                                        <span>{opcion.px}px</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ============ PREFERENCIAS ============ */}
                    {seccion === "preferencias" && (
                        <section className="config__card">
                            <div className="config__card-header">
                                <div className="config__card-header-icon">
                                    <Icon name="servicios" size={17} />
                                </div>
                                <div>
                                    <h2>Preferencias regionales</h2>
                                    <p>Idioma, zona horaria y formatos de fecha y hora.</p>
                                </div>
                            </div>

                            <form className="config__form" onSubmit={(e) => { e.preventDefault(); marcarGuardado(); }}>
                                <div className="config__form-group">
                                    <label htmlFor="pref-idioma">Idioma</label>
                                    <select
                                        id="pref-idioma"
                                        className="config__select"
                                        value={config.preferencias.idioma}
                                        onChange={cambiar("preferencias.idioma")}
                                    >
                                        <option>Español</option>
                                        <option>English</option>
                                    </select>
                                </div>

                                <div className="config__form-group">
                                    <label htmlFor="pref-zona">Zona horaria</label>
                                    <select
                                        id="pref-zona"
                                        className="config__select"
                                        value={config.preferencias.zonaHoraria}
                                        onChange={cambiar("preferencias.zonaHoraria")}
                                    >
                                        <option>Bogotá (CO) — GMT-5</option>
                                        <option>Lima (PE) — GMT-5</option>
                                        <option>Quito (EC) — GMT-5</option>
                                    </select>
                                </div>

                                <div className="config__form-grid">
                                    <div className="config__form-group">
                                        <label htmlFor="pref-fecha">Formato de fecha</label>
                                        <select
                                            id="pref-fecha"
                                            className="config__select"
                                            value={config.preferencias.formatoFecha}
                                            onChange={cambiar("preferencias.formatoFecha")}
                                        >
                                            <option>DD/MM/YYYY</option>
                                            <option>MM/DD/YYYY</option>
                                            <option>YYYY-MM-DD</option>
                                        </select>
                                    </div>

                                    <div className="config__form-group">
                                        <label htmlFor="pref-hora">Formato de hora</label>
                                        <select
                                            id="pref-hora"
                                            className="config__select"
                                            value={config.preferencias.formatoHora}
                                            onChange={cambiar("preferencias.formatoHora")}
                                        >
                                            <option value="24">24 horas</option>
                                            <option value="12">12 horas (AM/PM)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="config__form-actions">
                                    <button type="submit" className="config__submit">
                                        Guardar cambios
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    {/* ============ PRIVACIDAD ============ */}
                    {seccion === "privacidad" && (
                        <>
                            <section className="config__card">
                                <div className="config__card-header">
                                    <div className="config__card-header-icon">
                                        <Icon name="info" size={17} />
                                    </div>
                                    <div>
                                        <h2>Privacidad</h2>
                                        <p>Controla cómo se usa tu información.</p>
                                    </div>
                                </div>

                                <div className="config__list">
                                    <div className="config__row">
                                        <div className="config__row-icon">
                                            <Icon name="perfil" size={16} />
                                        </div>
                                        <div className="config__row-info">
                                            <div className="config__row-title">Mostrar mi nombre en actividades públicas</div>
                                            <div className="config__row-desc">Aparecer en la lista de participantes de eventos.</div>
                                        </div>
                                        <Toggle
                                            activo={config.privacidad.nombrePublico}
                                            onClick={alternar("privacidad.nombrePublico")}
                                            label="Mostrar nombre"
                                        />
                                    </div>

                                    <div className="config__row">
                                        <div className="config__row-icon">
                                            <Icon name="notificaciones" size={16} />
                                        </div>
                                        <div className="config__row-info">
                                            <div className="config__row-title">Permitir comunicaciones institucionales</div>
                                            <div className="config__row-desc">Recibir comunicados oficiales de la universidad.</div>
                                        </div>
                                        <Toggle
                                            activo={config.privacidad.comunicaciones}
                                            onClick={alternar("privacidad.comunicaciones")}
                                            label="Comunicaciones institucionales"
                                        />
                                    </div>

                                    <div className="config__row">
                                        <div className="config__row-icon">
                                            <Icon name="info" size={16} />
                                        </div>
                                        <div className="config__row-info">
                                            <div className="config__row-title">Mostrar información académica en mi perfil</div>
                                            <div className="config__row-desc">Programa, semestre y facultad visibles.</div>
                                        </div>
                                        <Toggle
                                            activo={config.privacidad.infoAcademicaPerfil}
                                            onClick={alternar("privacidad.infoAcademicaPerfil")}
                                            label="Info académica en perfil"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="config__card">
                                <div className="config__card-header">
                                    <div className="config__card-header-icon">
                                        <Icon name="configuracion" size={17} />
                                    </div>
                                    <div>
                                        <h2>Datos y privacidad</h2>
                                        <p>Conoce el tratamiento de tus datos.</p>
                                    </div>
                                </div>
                                <p className="config__privacy-text">
                                    UAJS Smart Campus utiliza tu información únicamente para
                                    fines académicos y administrativos. Puedes revisar la política
                                    de protección de datos y solicitar la rectificación o
                                    supresión de tus datos ante la oficina de tecnología.
                                </p>
                                <div className="config__form-actions">
                                    <button className="config__outline-button" onClick={marcarGuardado}>
                                        Consultar política de datos
                                    </button>
                                </div>
                            </section>
                        </>
                    )}

                    {/* ============ ZONA DE PELIGRO ============ */}
                    {seccion === "zona-peligro" && (
                        <section className="config__card config__card--danger">
                            <div className="config__card-header">
                                <div className="config__card-header-icon">
                                    <Icon name="recursos" size={17} />
                                </div>
                                <div>
                                    <h2>Zona de peligro</h2>
                                    <p>Estas acciones son irreversibles y requieren confirmación.</p>
                                </div>
                            </div>

                            {/* Cerrar todas las sesiones */}
                            <div className="config__row">
                                <div className="config__row-info">
                                    <div className="config__row-title">
                                        Cerrar todas las sesiones
                                    </div>
                                    <div className="config__row-desc">
                                        Finaliza tu sesión activa en todos los equipos conectados.
                                        Serás redirigido al login.
                                    </div>
                                    {confirmando === "sesiones" && (
                                        <div className="config__confirm-inline">
                                            <span>¿Confirmas cerrar todas las sesiones?</span>
                                            <button
                                                className="config__danger-button"
                                                onClick={cerrarTodasSesiones}
                                            >
                                                Sí, cerrar sesiones
                                            </button>
                                            <button
                                                className="config__outline-button"
                                                onClick={cancelarConfirmacion}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {confirmando !== "sesiones" && (
                                    <button
                                        className="config__danger-button"
                                        onClick={cerrarTodasSesiones}
                                    >
                                        Cerrar sesiones
                                    </button>
                                )}
                            </div>

                            {/* Solicitar desactivación */}
                            <div className="config__row">
                                <div className="config__row-info">
                                    <div className="config__row-title">
                                        Solicitar desactivación de cuenta
                                    </div>
                                    <div className="config__row-desc">
                                        Solicita la desactivación temporal de tu cuenta. La
                                        administración revisará la solicitud.
                                    </div>
                                    {confirmando === "desactivar" && (
                                        <div className="config__confirm-inline">
                                            <span>¿Confirmas enviar la solicitud de desactivación?</span>
                                            <button
                                                className="config__danger-button config__danger-button--delete"
                                                onClick={solicitarDesactivacion}
                                            >
                                                Sí, solicitar
                                            </button>
                                            <button
                                                className="config__outline-button"
                                                onClick={cancelarConfirmacion}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {confirmando !== "desactivar" && (
                                    <button
                                        className="config__danger-button config__danger-button--delete"
                                        onClick={solicitarDesactivacion}
                                    >
                                        Solicitar desactivación
                                    </button>
                                )}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Configuracion;
