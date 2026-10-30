import { useEffect } from "react";
import useAuth from "./useAuth";
import { getToken } from "../utils/authToken";
import { refrescar } from "../utils/store";

// Al llegar un evento, se refresca la colección para que el badge y la lista
// usen la misma fuente que el resto de la app (en vez de quedar desfasados).
function refrescarNotificaciones() {
    refrescar("notificaciones")
        .catch(() => {})
        .finally(() => emitirEvento("notificaciones-actualizadas", {}));
}

function resolverUrlWebSocket() {
    const explicita = import.meta.env.VITE_WS_URL;
    if (explicita) return explicita.replace(/\/+$/, "");

    // En desarrollo, Vite reenvía /socket.io al gateway (vite.config.js).
    if (import.meta.env.DEV) return window.location.origin;

    // En producción no se intenta si no hay URL: el mock/Vercel no exponen
    // Socket.IO y el navegador quedaría reintentando en bucle.
    return null;
}

function emitirEvento(nombre, detail) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(nombre, { detail }));
}

function RealtimeProvider({ children }) {
    const { user } = useAuth();

    useEffect(() => {
        if (!user?.id) return undefined;

        const token = getToken();
        if (!token) return undefined;

        const wsUrl = resolverUrlWebSocket();
        if (!wsUrl) return undefined;

        let cancelado = false;
        let socket;

        // socket.io-client se descarga en un chunk aparte, solo cuando hay
        // sesión iniciada: la landing y el login no cargan la librería.
        import("socket.io-client")
            .then(({ io }) => {
                if (cancelado) return;

                socket = io(wsUrl, {
                    path: "/socket.io",
                    transports: ["websocket", "polling"],
                    auth: { token },
                    reconnection: true,
                    reconnectionAttempts: Infinity,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 10000
                });

                socket.on("connect_error", (error) => {
                    if (/token/i.test(error?.message || "")) {
                        emitirEvento("uajs:session-expired", {});
                    }
                });

                // Llega una notificación nueva para el usuario.
                socket.on("notification:new", (payload = {}) => {
                    emitirEvento("smart-campus:notification", payload);
                    refrescarNotificaciones();
                    if (typeof payload.unreadCount === "number") {
                        emitirEvento("notificaciones-contador", {
                            unreadCount: payload.unreadCount
                        });
                    }
                });

                // Cambió el estado de una notificación (por ejemplo, fue leída).
                socket.on("notification:updated", (payload = {}) => {
                    refrescarNotificaciones();
                    if (typeof payload.unreadCount === "number") {
                        emitirEvento("notificaciones-contador", {
                            unreadCount: payload.unreadCount
                        });
                    }
                });

                socket.on("notifications:count", (payload = {}) => {
                    if (typeof payload.unreadCount === "number") {
                        emitirEvento("notificaciones-contador", {
                            unreadCount: payload.unreadCount
                        });
                    }
                });

                socket.on("notifications:all-read", () => {
                    refrescarNotificaciones();
                    emitirEvento("notificaciones-contador", { unreadCount: 0 });
                });

                // Cambios en cualquier recurso (solicitudes, reservas, eventos, PQRS...).
                socket.on("data:changed", (payload = {}) => {
                    emitirEvento("smart-campus:data-changed", payload);
                });
            })
            .catch(() => {
                // Sin tiempo real la app sigue funcionando; solo se pierden las
                // notificaciones en vivo.
            });

        return () => {
            cancelado = true;
            if (socket) {
                socket.removeAllListeners();
                socket.disconnect();
            }
        };
    }, [user?.id, user?.rol]);

    return children;
}

export default RealtimeProvider;
