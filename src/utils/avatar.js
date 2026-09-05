const CONFIG_STORAGE_KEY = "uajs_config";

// ─── Foto por userId (clave independiente por usuario) ──────────────────────

/**
 * Clave de localStorage para la foto de un usuario concreto.
 * Mantener separado de uajs_config para no mezclar sesión con datos de usuarios.
 */
function fotoKey(userId) {
    return `uajs_foto_${userId}`;
}

/** Devuelve la foto base64 del usuario con ese id, o "" si no tiene. */
export function getPhotoByUserId(userId) {
    if (userId == null) return "";
    try {
        return localStorage.getItem(fotoKey(userId)) || "";
    } catch {
        return "";
    }
}

/** Guarda una foto base64 para el usuario con ese id. */
export function savePhotoByUserId(userId, base64) {
    if (userId == null) return;
    try {
        localStorage.setItem(fotoKey(userId), base64);
    } catch {
        // localStorage lleno u otro error — ignorar silenciosamente
    }
}

/** Elimina la foto del usuario con ese id. */
export function removePhotoByUserId(userId) {
    if (userId == null) return;
    try {
        localStorage.removeItem(fotoKey(userId));
    } catch {
        // ignorar
    }
}

// ─── Funciones legacy (foto del usuario en sesión desde uajs_config) ────────

export function getUserConfig() {
    try {
        const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

export function getUserPhoto(userId) {
    if (userId != null) {
        const porId = getPhotoByUserId(userId);
        if (porId) return porId;
    }
    const config = getUserConfig();
    return typeof config?.cuenta?.foto === "string" ? config.cuenta.foto : "";
}

export function getUserInitials(nombre, fallback = "U") {
    const source = (nombre || fallback).toString().trim();
    if (!source) return fallback[0]?.toUpperCase() || "U";

    const partes = source.split(" ").filter(Boolean);
    if (partes.length === 0) return fallback[0]?.toUpperCase() || "U";

    const initials = partes
        .slice(0, 2)
        .map((parte) => parte.charAt(0).toUpperCase())
        .join("");

    return initials || fallback[0]?.toUpperCase() || "U";
}

export function getAvatarStyle(nombre, fallbackGradient, userId) {
    const foto = getUserPhoto(userId);

    if (foto) {
        return {
            backgroundImage: `url(${foto})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#0b3a66",
            color: "transparent"
        };
    }

    return {
        background: fallbackGradient,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#ffffff"
    };
}
