const paths = {
    dashboard: (
        <>
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
        </>
    ),
    solicitudes: (
        <>
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <path d="M9 8h6" />
            <path d="M9 12h6" />
            <path d="M9 16h4" />
        </>
    ),
    reservas: (
        <>
            <rect x="3" y="4" width="18" height="17" rx="2" />
            <path d="M3 9h18" />
            <path d="M8 2v4" />
            <path d="M16 2v4" />
        </>
    ),
    recursos: (
        <>
            <path d="M9 3h6v4l4 9a2 2 0 0 1-2 3H7a2 2 0 0 1-2-3l4-9z" />
            <path d="M7.5 15h9" />
        </>
    ),
    eventos: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </>
    ),
    usuarios: (
        <>
            <circle cx="9" cy="8" r="3" />
            <path d="M3 20a6 6 0 0 1 12 0" />
            <path d="M16 6a3 3 0 0 1 0 6" />
            <path d="M17 14a6 6 0 0 1 4 6" />
        </>
    ),
    reportes: (
        <>
            <path d="M4 20V10" />
            <path d="M10 20V4" />
            <path d="M16 20v-7" />
            <path d="M22 20H2" />
        </>
    ),
    notificaciones: (
        <>
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </>
    ),
    pqrs: (
        <>
            <path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 12z" />
            <path d="M8.5 11h7" />
            <path d="M8.5 14h4" />
        </>
    ),
    perfil: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20a8 8 0 0 1 16 0" />
        </>
    ),
    configuracion: (
        <>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3" />
            <path d="M12 19v3" />
            <path d="M2 12h3" />
            <path d="M19 12h3" />
            <path d="M4.9 4.9l2.1 2.1" />
            <path d="M17 17l2.1 2.1" />
            <path d="M4.9 19.1l2.1-2.1" />
            <path d="M17 7l2.1-2.1" />
        </>
    ),
    estudiante: (
        <>
            <path d="M22 10 12 5 2 10l10 5 10-5z" />
            <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
            <path d="M22 10v5" />
        </>
    ),
    docente: (
        <>
            <rect x="3" y="4" width="18" height="12" rx="1" />
            <path d="M12 16v4" />
            <path d="M8 20h8" />
        </>
    ),
    admin: (
        <path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L4 17l3 3 5.5-5.5a4 4 0 0 0 5.2-5.2l-2.6 2.6-2.1-2.1z" />
    ),
    servicios: (
        <>
            <path d="M4 4h16v16H4z" />
            <path d="M4 9h16" />
            <path d="M9 4v16" />
        </>
    ),
    info: (
        <>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </>
    ),
    buscar: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
        </>
    )
};

function Icon({ name, size, className = "" }) {
    const dim = size
        ? { width: size, height: size }
        : { width: "100%", height: "100%" };

    return (
        <svg
            className={`icon ${className}`.trim()}
            xmlns="http://www.w3.org/2000/svg"
            {...dim}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {paths[name] || null}
        </svg>
    );
}

export default Icon;
