import { useCallback, useEffect, useRef, useState } from "react";
import { AuthContext } from "./auth-context";
import { permisosDeRol, accionesDeRol } from "../utils/users";
import { authApi } from "../utils/api";
import { mapearUsuarioSesion } from "../utils/mapeo";
import { syncPhotoFromBackend } from "../utils/avatar";
import Modal from "../components/Modal/Modal";
import "../components/Modal/Modal.css";
import "./session-warning.css";

const SESSION_KEY = "uajs_session";
const IDLE_BEFORE_WARNING_MS = 10 * 60 * 1000;
const WARNING_COUNTDOWN_MS = 2 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"];

function getSession() {
    try {
        const guardada = localStorage.getItem(SESSION_KEY);
        if (!guardada) return null;
        
        const parsed = JSON.parse(guardada);
        return parsed && parsed.usuario ? parsed : null;
    } catch (error) {
        console.error("Error al leer sesión:", error);
        // Si hay datos corruptos, limpiarlos
        try {
            localStorage.removeItem(SESSION_KEY);
        } catch {
            // Ignorar errores al limpiar
        }
        return null;
    }
}

function AuthProvider({ children }) {
    const [user, setUser] = useState(getSession);

    const login = async (cedula, password) => {
        try {
            const data = await authApi.login(cedula, password);

            if (!data?.token) {
                throw new Error("El servidor no devolvió un token de sesión.");
            }

            const sesion = mapearUsuarioSesion(data);

            setUser(sesion);

            // Sincronizar la foto de perfil desde la BD hacia localStorage
            // para que getUserPhoto la encuentre en el resto de la sesión.
            if (sesion.foto) {
                syncPhotoFromBackend(sesion.id, sesion.foto);
            }

            try {
                localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
            } catch (storageError) {
                console.warn("No se pudo guardar en localStorage:", storageError);
            }

            return { ok: true, user: sesion };
        } catch (err) {
            console.error("Error en login:", err);
            return {
                ok: false,
                mensaje: err.message || "No se pudo iniciar sesión.",
            };
        }
    };

    const logout = () => {
        setUser(null);
        try {
            localStorage.removeItem(SESSION_KEY);
        } catch {
            // Si localStorage no está disponible se ignora
        }
    };

    // El cliente HTTP avisa con este evento cuando el gateway responde 401
    // (token ausente o expirado). Se cierra la sesión para no dejar la UI
    // mostrando datos que ya no puede sincronizar.
    useEffect(() => {
        const onSesionExpirada = () => {
            setUser((prev) => {
                // Un 401 durante el propio login no debe cerrar nada: ahí
                // todavía no hay sesión que invalidar.
                if (prev) {
                    try {
                        localStorage.removeItem(SESSION_KEY);
                    } catch {
                        // sin localStorage no hay nada que limpiar
                    }
                }
                return null;
            });
        };
        window.addEventListener("uajs:sesion-expirada", onSesionExpirada);
        return () =>
            window.removeEventListener("uajs:sesion-expirada", onSesionExpirada);
    }, []);

    // Validación de sesión al recargar.
    //
    // El JWT dura 24h pero el token se guarda en localStorage: si el usuario
    // fue desactivado, cambió su rol o el token expiró, la UI lo descubriría
    // recién al fallar otra llamada. Aquí se consulta /auth/me UNA vez al
    // montar para refrescar el perfil y detectar tokens inválidos.
    //
    // Decisiones para no expulsar al usuario por un falso positivo:
    //   - authApi.me usa apiFetch "silencioso": un 401 aquí NO dispara el
    //     evento global de sesión expirada (lo maneja esta misma función).
    //   - Solo se cierra con 401/403 reales (token inválido/expirado) o si el
    //     usuario quedó inactivo en la BD.
    //   - Un error de red (status 0), un timeout o un 5xx NO cierran sesión:
    //     se conserva la sesión y la app sigue funcionando offline, que es
    //     justo el diseño del store.
    useEffect(() => {
        const sesionGuardada = getSession();
        if (!sesionGuardada?.token) return undefined;

        let vigente = true;

        authApi
            .me()
            .then((data) => {
                if (!vigente || !data) return;

                if (String(data.estado || "").toLowerCase() === "inactivo") {
                    logout();
                    return;
                }

                setUser((prev) => {
                    if (!prev) return prev;
                    const refrescado = {
                        ...mapearUsuarioSesion({ ...prev, ...data }),
                        // /auth/me no devuelve token: se conserva el vigente.
                        token: prev.token
                    };
                    try {
                        localStorage.setItem(SESSION_KEY, JSON.stringify(refrescado));
                    } catch {
                        // sin localStorage la sesión sigue en memoria
                    }
                    return refrescado;
                });
            })
            .catch((error) => {
                if (!vigente) return;
                // Solo un 401/403 confirma que el token ya no sirve.
                if (error?.status === 401 || error?.status === 403) {
                    logout();
                }
                // Cualquier otro fallo (red, 5xx, timeout) se ignora: la
                // sesión sigue siendo válida desde el punto de vista local.
            });

        return () => {
            vigente = false;
        };
    }, []);

    /**
     * Actualiza campos del usuario en sesión (en memoria y en localStorage).
     * Útil para reflejar la foto de perfil u otros cambios sin re-login.
     */
    const updateUser = (campos) => {
        setUser((prev) => {
            if (!prev) return prev;
            const siguiente = { ...prev, ...campos };
            try {
                localStorage.setItem(SESSION_KEY, JSON.stringify(siguiente));
            } catch {
                // ignorar si no hay espacio
            }
            return siguiente;
        });
        // Sincronizar la foto de perfil hacia localStorage por separado
        // (getUserPhoto la lee de uajs_foto_${id}).
        if (campos.foto !== undefined && user?.id != null) {
            syncPhotoFromBackend(user.id, campos.foto);
        }
    };

    const tienePermiso = (permiso) => {
        if (!user) return false;
        const permisos = permisosDeRol(user.rol);
        return permisos ? permisos.includes(permiso) : false;
    };

    const puede = (accion) => {
        if (!user) return false;
        const acciones = accionesDeRol(user.rol);
        return acciones ? acciones.includes(accion) : false;
    };

    // Helper para verificar el rol del usuario
    const esRol = (rol) => {
        if (!user) return false;
        return user.rol === rol;
    };

    // Helpers específicos para cada rol
    const esAdmin = () => esRol("Administrador");
    const esAdministrativo = () => esRol("Administrativo");
    const esDocente = () => esRol("Docente");
    const esEstudiante = () => esRol("Estudiante");

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            logout,
            updateUser,
            tienePermiso, 
            puede,
            esRol,
            esAdmin,
            esAdministrativo,
            esDocente,
            esEstudiante
        }}>
            {children}
            {user && <SessionGuard onLogout={logout} />}
        </AuthContext.Provider>
    );
}

function SessionGuard({ onLogout }) {
    const [warningOpen, setWarningOpen] = useState(false);
    const [remaining, setRemaining] = useState(WARNING_COUNTDOWN_MS);
    const idleTimerRef = useRef(null);
    const warningTimerRef = useRef(null);
    const countdownRef = useRef(null);
    // Espejo de warningOpen para que los listeners (registrados una sola vez)
    // no dependan de un closure congelado en el primer render.
    const warningOpenRef = useRef(false);
    const onLogoutRef = useRef(onLogout);

    // Espejos de estado/props actualizados en un efecto (sin deps: en cada
    // commit) para que los listeners registrados una sola vez lean el valor
    // vigente sin depender de un closure congelado en el primer render.
    useEffect(() => {
        warningOpenRef.current = warningOpen;
        onLogoutRef.current = onLogout;
    });

    const limpiarTimers = useCallback(() => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }
        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
            warningTimerRef.current = null;
        }
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
    }, []);

    const iniciarAdvertencia = useCallback(() => {
        setRemaining(WARNING_COUNTDOWN_MS);
        countdownRef.current = setInterval(() => {
            setRemaining((prev) => Math.max(0, prev - 1000));
        }, 1000);
        warningTimerRef.current = setTimeout(() => {
            limpiarTimers();
            onLogoutRef.current();
        }, WARNING_COUNTDOWN_MS);
    }, [limpiarTimers]);

    const reiniciarInactividad = useCallback(() => {
        limpiarTimers();
        idleTimerRef.current = setTimeout(() => {
            setWarningOpen(true);
            iniciarAdvertencia();
        }, IDLE_BEFORE_WARNING_MS);
    }, [limpiarTimers, iniciarAdvertencia]);

    useEffect(() => {
        idleTimerRef.current = setTimeout(() => {
            setWarningOpen(true);
            iniciarAdvertencia();
        }, IDLE_BEFORE_WARNING_MS);

        // Mientras el aviso está abierto no se reinicia nada: cualquier
        // mousemove lo cerraría al instante y el aviso nunca sería leído.
        // La sesión solo se prolonga con los botones del modal.
        const onActivity = () => {
            if (warningOpenRef.current) return;
            reiniciarInactividad();
        };
        ACTIVITY_EVENTS.forEach((evt) =>
            window.addEventListener(evt, onActivity, { passive: true })
        );
        return () => {
            limpiarTimers();
            ACTIVITY_EVENTS.forEach((evt) =>
                window.removeEventListener(evt, onActivity)
            );
        };
    }, [limpiarTimers, reiniciarInactividad, iniciarAdvertencia]);

    const prolongar = () => {
        setWarningOpen(false);
        setRemaining(WARNING_COUNTDOWN_MS);
        reiniciarInactividad();
    };

    const cerrarSesionAhora = () => {
        limpiarTimers();
        onLogoutRef.current();
    };

    const minutos = Math.floor(remaining / 60000);
    const segundos = Math.floor((remaining % 60000) / 1000);

    return (
        <Modal
            isOpen={warningOpen}
            title="¿Sigues ahí?"
            subtitle="Tu sesión está a punto de expirar por inactividad."
            onClose={prolongar}
        >
            <div className="session-warning">
                <p>
                    Detectamos que no has tenido actividad en los últimos
                    minutos. Por seguridad, cerraremos tu sesión
                    automáticamente.
                </p>
                <p className="session-warning__countdown">
                    Cierre automático en{" "}
                    <strong>
                        {minutos}:{String(segundos).padStart(2, "0")}
                    </strong>
                </p>
                <div className="session-warning__actions">
                    <button
                        type="button"
                        className="button button--ghost button--md"
                        onClick={cerrarSesionAhora}
                    >
                        Cerrar sesión
                    </button>
                    <button
                        type="button"
                        className="button button--accent button--md"
                        onClick={prolongar}
                    >
                        Prolongar sesión
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default AuthProvider;