const menuSections = [
    {
        label: "Principal",
        items: [
            {
                name: "Dashboard",
                path: "/dashboard",
                icon: "dashboard",
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
                icon: "solicitudes",
                permiso: "solicitudes"
            },
            {
                name: "Reservas",
                path: "/reservas",
                icon: "reservas",
                permiso: "reservas"
            },
            {
                name: "Recursos",
                path: "/recursos",
                icon: "recursos",
                permiso: "recursos"
            },
            {
                name: "Eventos",
                path: "/eventos",
                icon: "eventos",
                permiso: "eventos"
            },
            {
                name: "Info Académica",
                path: "/info-academica",
                icon: "info",
                permiso: "info_academica"
            },
            {
                name: "Usuarios",
                path: "/usuarios",
                icon: "usuarios",
                permiso: "usuarios"
            }
        ]
    },
    {
        label: "Reportes",
        items: [
            {
                name: "Reportes",
                path: "/reportes",
                icon: "reportes",
                permiso: "reportes"
            }
        ]
    },
    {
        label: "Comunicación",
        items: [
            {
                name: "Notificaciones",
                path: "/notificaciones",
                icon: "notificaciones",
                permiso: "notificaciones"
            },
            {
                name: "PQRS",
                path: "/pqrs",
                icon: "pqrs",
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
                icon: "perfil",
                permiso: "perfil"
            },
            {
                name: "Configuración",
                path: "/configuracion",
                icon: "configuracion",
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

    if (pathname === "/info-academica") {
        return "Información Académica";
    }

    if (pathname.startsWith("/solicitudes/")) {
        return "Detalle de solicitud";
    }

    if (pathname === "/servicios") {
        return "Servicios";
    }

    if (pathname.startsWith("/servicio/")) {
        return "Servicio";
    }

    const flat = menuSections.flatMap((section) => section.items);

    const match = flat.find((item) => item.path === pathname);

    return match ? match.name : "UniAJS";
}

export default menuSections;
