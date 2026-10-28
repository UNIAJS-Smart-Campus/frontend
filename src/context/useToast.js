import { useContext } from "react";
import { ToastContext } from "./toast-context";

export default function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
    return ctx;
}
