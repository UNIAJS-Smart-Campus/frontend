import { useEffect, useState } from "react";
import useAuth from "../../context/useAuth";
import { useTheme } from "../../context/ThemeContext";
import Icon from "../../components/Icon/Icon";
import "./Configuracion.css";

const STORAGE_KEY = "uajs_config";

const SECCIONES = [
    { id: "cuenta", icon: "perfil", titulo: "Cuenta" },
    { id: "seguridad", icon: "configuracion", titulo: "Seguridad" },
    { id: "notificaciones", icon: "notificaciones", titulo: "Notificaciones" },
    { id: "apariencia", icon: "dashboard", titulo: "Apariencia" },
    { id: "preferencias", icon: "servicios", titulo: "Preferencias" },
    { id: "privacidad", icon: "info", titulo: "Privacidad" },
    { id: "zona-peligro", icon: "recursos", titulo: "Zona de peligro" }
];

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
    const { user, logout } = useAuth();
    const { tema, setTema } = useTheme();

    const [config, setConfig] = useState(() => {
        try {
            const guardada = JSON.parse(localStorage.getItem(STORAGE_KEY));
            // Inicializar correo desde la sesión si el config guardado está vacío
            const base = {
                ...configBase,
                cuenta: {
                    ...configBase.cuenta,
                    correo: user?.correo || ""
                }
            };
            return guardada ? normalizarConfiguracion(base, guardada) : base;
        } catch {
            return {
                ...configBase,
                cuenta: {
                    ...configBase.cuenta,
                    correo: user?.correo || ""
                }
            };
        }
    });

    const [seccion, setSeccion] = useState("cuenta");
    const [guardado, setGuardado] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

    // Auto-ocultar el aviso de guardado
    useEffect(() => {
        let timer;
        if (guardado) {
            timer = setTimeout(() => setGuardado(false), 2500);
        }
        return () => clearTimeout(timer);
    }, [guardado]);

    const marcarGuardado = () => setGuardado(true);

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
        marcarGuardado();
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
        marcarGuardado();
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
        marcarGuardado();
    };

    const manejarFoto = (event) => {
        const archivo = event.target.files?.[0];
        if (!archivo || !archivo.type.startsWith("image/")) return;

        const lector = new FileReader();
        lector.onload = (e) => {
            const dataUrl = e.target?.result;
            if (!dataUrl) return;
            setConfig((prev) => ({
                ...prev,
                cuenta: { ...prev.cuenta, foto: dataUrl }
            }));
            marcarGuardado();
        };
        lector.readAsDataURL(archivo);

        if (event.target) {
            event.target.value = "";
        }
    };

    const eliminarFoto = () => {
        setConfig((prev) => ({
            ...prev,
            cuenta: { ...prev.cuenta, foto: "" }
        }));
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
        marcarGuardado();
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

    const solicitarDesactivacion = () => {
        if (confirmando === "desactivar") {
            // Aquí iría la llamada a la API de desactivación
            marcarGuardado();
            setConfirmando(null);
        } else {
            setConfirmando("desactivar");
        }
    };

    const cancelarConfirmacion = () => setConfirmando(null);

    // Cerrar sesión individual en un dispositivo
    const cerrarSesionDispositivo = (dispositivo) => {
        // Simulación: en producción llamaría a /api/auth/sessions DELETE
        marcarGuardado();
    };

    return (
        <div className="page">
            <div className="page__header">
                <div className="page__title">
                    <p>Controla cómo funciona tu cuenta y tus preferencias.</p>
                </div>

                {guardado && (
                    <span className="badge badge--green">
                        <Icon name="info" size={12} />
                        Cambios guardados
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
                                {temas.map((tema) => (
                                    <button
                                        key={tema.valor}
                                        type="button"
                                        className={
                                            tema === tema.valor
                                                ? "config__theme config__theme--active"
                                                : "config__theme"
                                        }
                                        onClick={() => aplicarTema(tema.valor)}
                                    >
                                        <span className="config__theme-icon">
                                            <Icon name={tema.icono} size={20} />
                                        </span>
                                        <span className="config__theme-label">{tema.etiqueta}</span>
                                    </button>
                                ))}
                            </div>

                            <p className="config__privacy-text">
                                <strong>Sistema</strong> sigue la preferencia de tu sistema
                                operativo. <strong>Claro</strong> u <strong>Oscuro</strong> aplican
                                el tema de forma permanente independientemente del SO.
                            </p>
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
