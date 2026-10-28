import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ESCAPABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

export default function useKeyboardShortcuts({
    onFocusSearch,
    onEscape,
    enabled = true
} = {}) {
    const navigate = useNavigate();
    const prefixPressedRef = useRef(false);
    const prefixTimerRef = useRef(null);

    useEffect(() => {
        if (!enabled) return undefined;

        const resetPrefix = () => {
            prefixPressedRef.current = false;
            if (prefixTimerRef.current) {
                clearTimeout(prefixTimerRef.current);
                prefixTimerRef.current = null;
            }
        };

        const handler = (e) => {
            const target = e.target;
            const tag = target?.tagName;
            const isEditable = tag && (ESCAPABLE_TAGS.has(tag) || target.isContentEditable);

            if (e.key === "Escape") {
                if (isEditable) return;
                onEscape?.();
                return;
            }

            if (isEditable) return;

            if (e.key === "/") {
                e.preventDefault();
                const target = document.querySelector("[data-search-shortcut]");
                if (target) {
                    target.focus();
                } else {
                    window.dispatchEvent(new CustomEvent("shortcut:search"));
                }
                onFocusSearch?.();
                return;
            }

            if (e.key === "g") {
                prefixPressedRef.current = true;
                if (prefixTimerRef.current) clearTimeout(prefixTimerRef.current);
                prefixTimerRef.current = setTimeout(resetPrefix, 1500);
                return;
            }

            if (prefixPressedRef.current) {
                const map = {
                    d: "/dashboard",
                    s: "/solicitudes",
                    r: "/reservas",
                    p: "/pqrs",
                    n: "/notificaciones",
                    e: "/eventos",
                    i: "/info-academica",
                    c: "/configuracion"
                };
                const target2 = map[e.key.toLowerCase()];
                if (target2) {
                    e.preventDefault();
                    navigate(target2);
                }
                resetPrefix();
            }
        };

        window.addEventListener("keydown", handler);
        return () => {
            window.removeEventListener("keydown", handler);
            if (prefixTimerRef.current) clearTimeout(prefixTimerRef.current);
        };
    }, [enabled, navigate, onFocusSearch, onEscape]);
}
