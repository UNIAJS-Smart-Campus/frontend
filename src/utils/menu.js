const menuSections = [
    {
        label: "Principal",
        items: [
            {
                name: "Dashboard",
                path: "/dashboard",
                icon: "📊",
                permiso: "dashboard"
            }
        ]
    },
    {
        label: "Gestión",
        items: [
            {
                name: "Solicitudes",
                path: "/solicitudes",
                icon: "📋",
                permiso: "solicitudes"
            },
            {
                name: "Reservas",
                path: "/reservas",
                icon: "📅",
                permiso: "reservas"
            },
            {
                name: "Recursos",
                path: "/recursos",
                icon: "🧪",
                permiso: "recursos"
            },
            {
                name: "Eventos",
                path: "/eventos",
                icon: "🎉",
                permiso: "eventos"
            },
            {
                name: "Usuarios",
                path: "/usuarios",
                icon: "👥",
                permiso: "usuarios"
            }
        ]
    },
    {
        label: "Comunicación",
        items: [
            {
                name: "Notificaciones",
                path: "/notificaciones",
                icon: "🔔",
                permiso: "notificaciones"
            },
            {
                name: "PQRS",
                path: "/pqrs",
                icon: "💬",
                permiso: "pqrs"
            }
        ]
    },
    {
        label: "Cuenta",
        items: [
            {
                name: "Perfil",
                path: "/perfil",
                icon: "👤",
                permiso: "perfil"
            },
            {
                name: "Configuración",
                path: "/configuracion",
                icon: "⚙️",
                permiso: "configuracion"
            }
        ]
    }
];

export function getModuleName(pathname) {
    if (pathname === "/pqrs/nueva") {
        return "Nueva PQRS";
    }

    if (pathname === "/usuarios") {
        return "Gestión de usuarios";
    }

    if (pathname.startsWith("/solicitudes/")) {
        return "Detalle de solicitud";
    }

    if (pathname.startsWith("/servicio/")) {
        return "Servicio";
    }

    const flat = menuSections.flatMap((section) => section.items);

    const match = flat.find((item) => item.path === pathname);

    return match ? match.name : "UAJS Smart Campus";
}

export default menuSections;
