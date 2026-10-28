import { useCallback, useEffect, useRef, useState } from "react";
import { AuthContext } from "./auth-context";
import { permisosDeRol, accionesDeRol } from "../utils/constants/roles";
import { authApi } from "../utils/api";
import { getToken, setToken, clearToken } from "../utils/authToken";
import "./session-warning.css";

const IDLE_BEFORE_WARNING_MS = 30 * 60 * 1000;
const WARNING_COUNTDOWN_MS = 5 * 60 * 1000;
//const IDLE_BEFORE_WARNING_MS = 5 *1000;   // 5 seg antes de aviso
//const WARNING_COUNTDOWN_MS = 5 * 1000;     // 5 seg cuenta regresiva = 10 seg total
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"];
const SESSION_KEY = "uajs_session";

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [hydrated, setHydrated] = useState(false);
    const [mostrarAviso, setMostrarAviso] = useState(false);
    const [cuentaRegresiva, setCuentaRegresiva] = useState(WARNING_COUNTDOWN_MS / 1000);
    const temporizadorRef = useRef(null);
    const temporizadorInactividadRef = useRef(null);
    const temporizadorAvisoRef = useRef(null);

    // Restaurar sesión al montar (localStorage + backend)
    useEffect(() => {
        let cancelled = false;

        const restaurarSesion = async () => {
            const token = getToken();
            let sesionGuardada = null;

            try {
                const guardada = localStorage.getItem(SESSION_KEY);
                if (guardada) sesionGuardada = JSON.parse(guardada);
            } catch {
                // ignorar errores de parseo
            }

            // Sin token la sesión local ya no es válida (antes no se guardaba).
            if (!token) {
                localStorage.removeItem(SESSION_KEY);
                if (!cancelled) {
                    setUser(null);
                    setHydrated(true);
                }
                return;
            }

            if (sesionGuardada?.id && !cancelled) {
                setUser(sesionGuardada);
            }

            // Validar con backend (source of truth).
            try {
                const data = await authApi.me();
                if (!cancelled && data?.id_usuario) {
                    const sesion = {
                        id: data.id_usuario,
                        usuario: data.usuario || data.identificacion,
                        nombre: [data.nombre, data.apellido].filter(Boolean).join(" ").trim()
                            || data.nombre || data.usuario || "Usuario",
                        correo: data.correo || "",
                        rol: data.tipo_usuario || (typeof data.rol === "string" ? data.rol : "") || "Estudiante",
                        programa: data.programa || "No especificado",
                        foto: data.foto || ""
                    };
                    setUser(sesion);
                    localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
                } else if (!cancelled) {
                    localStorage.removeItem(SESSION_KEY);
                    clearToken();
                    setUser(null);
                }
            } catch (error) {
                if (!cancelled && error?.status === 401) {
                    localStorage.removeItem(SESSION_KEY);
                    clearToken();
                    setUser(null);
                }
                // Si es un error de red, mantener la sesión local.
            } finally {
                if (!cancelled) setHydrated(true);
            }
        };

        restaurarSesion();
        return () => { cancelled = true; };
    }, []);

    const login = async (identificacion, password) => {
        try {
            const data = await authApi.login(identificacion, password);

            const sesion = {
                id: data.id_usuario,
                usuario: data.usuario || data.identificacion,
                nombre: [data.nombre, data.apellido].filter(Boolean).join(" ").trim()
                    || data.nombre || data.usuario || "Usuario",
                correo: data.correo || "",
                rol: data.tipo_usuario || (typeof data.rol === "string" ? data.rol : "") || "Estudiante",
                programa: data.programa || "No especificado",
                foto: data.foto || ""
            };

            setToken(data.token);
            setUser(sesion);
            localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
            resetearTemporizadores();
            return { ok: true, user: sesion };
        } catch (err) {
            console.error("Error en login:", err);
            return {
                ok: false,
                mensaje: err.message || "No se pudo iniciar sesión."
            };
        }
    };

    const logout = useCallback(() => {
        clearTimeout(temporizadorInactividadRef.current);
        clearTimeout(temporizadorAvisoRef.current);
        clearTimeout(temporizadorRef.current);
        temporizadorInactividadRef.current = null;
        temporizadorAvisoRef.current = null;
        temporizadorRef.current = null;
        localStorage.removeItem(SESSION_KEY);
        clearToken();
        setUser(null);
        setMostrarAviso(false);
        setCuentaRegresiva(WARNING_COUNTDOWN_MS / 1000);
    }, []);

    // El cliente HTTP avisa cuando el token expiró o fue rechazado.
    useEffect(() => {
        const handleExpired = () => logout();
        window.addEventListener("uajs:session-expired", handleExpired);
        return () => window.removeEventListener("uajs:session-expired", handleExpired);
    }, [logout]);

    const _updateUser = useCallback((campos) => {
        setUser((prev) => {
            if (!prev) return null;
            const siguiente = { ...prev, ...campos };
            return siguiente;
        });
    }, []);

    const _tienePermiso = useCallback((permiso) => {
        if (!user) return false;
        const permisos = permisosDeRol(user.rol);
        return permisos.includes(permiso);
    }, [user]);

    const _puede = useCallback((accion) => {
        if (!user) return false;
        const acciones = accionesDeRol(user.rol);
        return acciones.includes(accion);
    }, [user]);

    const _esRol = useCallback((rol) => user?.rol === rol, [user]);
    const _esAdmin = useCallback(() => user?.rol === "Administrador", [user]);
    const _esDocente = useCallback(() => user?.rol === "Docente", [user]);
    const _esEstudiante = useCallback(() => user?.rol === "Estudiante", [user]);

    const resetearTemporizadores = useCallback(() => {
        clearTimeout(temporizadorInactividadRef.current);
        clearTimeout(temporizadorAvisoRef.current);

        temporizadorInactividadRef.current = setTimeout(() => {
            setMostrarAviso(true);
            temporizadorAvisoRef.current = setTimeout(() => {
                logout();
            }, WARNING_COUNTDOWN_MS);
        }, IDLE_BEFORE_WARNING_MS);
    }, []);

    useEffect(() => {
        const manejarActividad = () => {
            if (!mostrarAviso) resetearTemporizadores();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                resetearTemporizadores();
            }
        };

        ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, manejarActividad, { passive: true }));
        document.addEventListener("visibilitychange", handleVisibilityChange);

        resetearTemporizadores();

        return () => {
            ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, manejarActividad));
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            clearTimeout(temporizadorInactividadRef.current);
            clearTimeout(temporizadorAvisoRef.current);
        };
    }, [resetearTemporizadores, mostrarAviso]);

    useEffect(() => {
        if (!mostrarAviso) return;
        let segundos = WARNING_COUNTDOWN_MS / 1000;
        setTimeout(() => setCuentaRegresiva(segundos), 0);
        temporizadorRef.current = setInterval(() => {
            segundos -= 1;
            if (segundos <= 0) {
                clearInterval(temporizadorRef.current);
                logout();
            } else {
                setCuentaRegresiva(segundos);
            }
        }, 1000);
        return () => clearInterval(temporizadorRef.current);
    }, [mostrarAviso]);

    const prolongar = useCallback(() => {
        resetearTemporizadores();
    }, [resetearTemporizadores]);

    const cerrarAviso = useCallback(() => {
        setMostrarAviso(false);
    }, []);

    const value = {
        user,
        hydrated,
        login,
        logout,
        updateUser: _updateUser,
        tienePermiso: _tienePermiso,
        puede: _puede,
        esRol: _esRol,
        esAdmin: _esAdmin,
        esDocente: _esDocente,
        esEstudiante: _esEstudiante,
        prolongar,
        mostrarAviso,
        cuentaRegresiva,
        cerrarAviso
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;