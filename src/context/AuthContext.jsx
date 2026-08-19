import { useState } from "react";
import { AuthContext } from "./auth-context";
import {
    obtenerUsuarios,
    permisosDeRol,
    accionesDeRol
} from "../utils/users";

const SESSION_KEY = "uajs_session";

function getSession() {
    try {
        const guardada = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
        return guardada && guardada.usuario ? guardada : null;
    } catch {
        return null;
    }
}

function AuthProvider({ children }) {
    const [user, setUser] = useState(getSession);

    const login = (usuario, password) => {
        const lista = obtenerUsuarios();
        const encontrado = lista.find(
            (item) =>
                item.usuario === usuario &&
                item.password === password &&
                item.estado === "Activo"
        );

        if (!encontrado) {
            return { ok: false, mensaje: "Usuario o contraseña incorrectos." };
        }

        const sesion = {
            id: encontrado.id,
            usuario: encontrado.usuario,
            nombre: encontrado.nombre,
            correo: encontrado.correo,
            rol: encontrado.rol,
            programa: encontrado.programa
        };

        setUser(sesion);

        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
        } catch {
            // si localStorage no está disponible se ignora
        }

        return { ok: true };
    };

    const logout = () => {
        setUser(null);

        try {
            localStorage.removeItem(SESSION_KEY);
        } catch {
            // si localStorage no está disponible se ignora
        }
    };

    const tienePermiso = (permiso) => {
        if (!user) {
            return false;
        }

        return permisosDeRol(user.rol).includes(permiso);
    };

    const puede = (accion) => {
        if (!user) {
            return false;
        }

        return accionesDeRol(user.rol).includes(accion);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, tienePermiso, puede }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
