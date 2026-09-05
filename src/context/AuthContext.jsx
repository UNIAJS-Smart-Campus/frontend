import { useEffect, useRef, useState } from "react";
import { AuthContext } from "./auth-context";
import { permisosDeRol, accionesDeRol, obtenerUsuarios } from "../utils/users";
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

    const login = async (identificacion, password) => {
        try {
            const usuario = obtenerUsuarios().find(
                (u) =>
                    (u.cedula === identificacion ||
                        u.usuario === identificacion) &&
                    u.password === password
            );

            if (!usuario) {
                throw new Error("Credenciales inválidas");
            }

            const sesion = {
                id: usuario.id,
                usuario: usuario.usuario,
                nombre: usuario.nombre || "Usuario",
                correo: usuario.correo || "",
                rol: usuario.rol,
                programa: usuario.programa || "No especificado",
                token: "mock-token-" + btoa(usuario.usuario),
            };

            setUser(sesion);

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

    const limpiarTimers = () => {
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
    };

    const iniciarAdvertencia = () => {
        setRemaining(WARNING_COUNTDOWN_MS);
        countdownRef.current = setInterval(() => {
            setRemaining((prev) => Math.max(0, prev - 1000));
        }, 1000);
        warningTimerRef.current = setTimeout(() => {
            limpiarTimers();
            onLogout();
        }, WARNING_COUNTDOWN_MS);
    };

    const reiniciarInactividad = () => {
        limpiarTimers();
        if (warningOpen) {
            setWarningOpen(false);
        }
        idleTimerRef.current = setTimeout(() => {
            setWarningOpen(true);
            iniciarAdvertencia();
        }, IDLE_BEFORE_WARNING_MS);
    };

    useEffect(() => {
        reiniciarInactividad();
        const onActivity = () => {
            if (!warningOpen) reiniciarInactividad();
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
    }, []);

    const prolongar = () => {
        setWarningOpen(false);
        reiniciarInactividad();
    };

    const cerrarSesionAhora = () => {
        limpiarTimers();
        onLogout();
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