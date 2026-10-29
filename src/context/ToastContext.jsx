import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import Icon from "../components/Icon/Icon";
import "./Toast.css";

const ToastContext = createContext(null);

let _id = 0;

// Iconos disponibles en components/Icon/Icon.jsx por tipo de toast.
const ICONO_POR_TIPO = {
    success: "pqrs",
    error: "solicitudes",
    warning: "notificaciones",
    info: "info"
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timersRef = useRef(new Map());

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
    }, []);

    const notify = useCallback((message, options = {}) => {
        const { type = "info", duration } = options;
        // Los errores se quedan más tiempo en pantalla que el resto.
        const ms = duration ?? (type === "error" ? 4500 : 3200);
        const id = ++_id;
        setToasts((prev) => [...prev, { id, message, type }]);
        const timer = setTimeout(() => dismiss(id), ms);
        timersRef.current.set(id, timer);
        return id;
    }, [dismiss]);

    const api = useMemo(
        () => ({
            notify,
            success: (msg, opts) => notify(msg, { ...opts, type: "success" }),
            error: (msg, opts) => notify(msg, { ...opts, type: "error" }),
            info: (msg, opts) => notify(msg, { ...opts, type: "info" }),
            warning: (msg, opts) => notify(msg, { ...opts, type: "warning" }),
            dismiss
        }),
        [notify, dismiss]
    );

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div className="toast-container" role="region" aria-label="Notificaciones">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast toast--${t.type}`}>
                        <Icon name={ICONO_POR_TIPO[t.type] || "info"} size={14} />
                        <span>{t.message}</span>
                        <button
                            type="button"
                            className="toast__close"
                            onClick={() => dismiss(t.id)}
                            aria-label="Cerrar notificación"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
    return ctx;
}
