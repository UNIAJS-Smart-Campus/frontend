import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import Icon from "../components/Icon/Icon";
import "./Toast.css";

const ToastContext = createContext(null);

let _id = 0;

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
        const { type = "info", duration = 3200 } = options;
        const id = ++_id;
        setToasts((prev) => [...prev, { id, message, type }]);
        const timer = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
        return id;
    }, [dismiss]);

    const api = useMemo(
        () => ({
            notify,
            success: (msg, opts) => notify(msg, { ...opts, type: "success" }),
            error: (msg, opts) => notify(msg, { ...opts, type: "error", duration: 4500 }),
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
                        <Icon name="info" size={14} />
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

export default function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
    return ctx;
}
