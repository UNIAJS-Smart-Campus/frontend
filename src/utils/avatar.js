const CONFIG_STORAGE_KEY = "uajs_config";

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

export function getUserPhoto() {
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

export function getAvatarStyle(nombre, fallbackGradient) {
    const foto = getUserPhoto();

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
