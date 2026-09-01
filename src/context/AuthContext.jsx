import { useState } from "react";
import { AuthContext } from "./auth-context";
import { permisosDeRol, accionesDeRol } from "../utils/users";
import usuarios from "../utils/users";

const SESSION_KEY = "uajs_session";

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
            const usuario = usuarios.find(
                (u) =>
                    u.usuario === identificacion &&
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
            tienePermiso, 
            puede,
            esRol,
            esAdmin,
            esAdministrativo,
            esDocente,
            esEstudiante
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;