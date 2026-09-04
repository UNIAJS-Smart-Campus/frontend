export const ROL_IDS = {
    Administrador: 1,
    Docente: 2,
    Estudiante: 3,
    Egresado: 4,
    Funcionario: 5,
    Administrativo: 6,
    Proveedor: 7,
    Visitante: 8
};

export const ROLES = [
    {
        nombre: "Administrador",
        permisos: [
            "dashboard",
            "usuarios",
            "solicitudes",
            "reservas",
            "recursos",
            "eventos",
            "notificaciones",
            "pqrs",
            "reportes",
            "perfil",
            "configuracion",
            "info_academica",
            "gestion_pqrs"
        ],
        acciones: [
            "registrar_solicitudes",
            "consultar_solicitudes",
            "gestionar_solicitudes",
            "actualizar_estados",
            "realizar_reservas",
            "gestionar_reservas",
            "solicitar_recursos",
            "administrar_recursos",
            "publicar_eventos",
            "consultar_estadisticas",
            "administrar_usuarios",
            "administrar_roles",
            "gestionar_servicios",
            "gestionar_configuracion",
            "supervisar",
            "publicar_info_academica"
        ]
    },
    {
        nombre: "Administrativo",
        permisos: [
            "dashboard",
            "solicitudes",
            "reservas",
            "recursos",
            "eventos",
            "notificaciones",
            "pqrs",
            "perfil",
            "reportes",
            "configuracion",
            "info_academica",
            "gestion_pqrs"
        ],
        acciones: [
            "consultar_solicitudes",
            "gestionar_solicitudes",
            "actualizar_estados",
            "gestionar_reservas",
            "administrar_recursos",
            "atender_requerimientos",
            "generar_reportes"
        ]
    },
    {
        nombre: "Docente",
        permisos: [
            "dashboard",
            "solicitudes",
            "reservas",
            "recursos",
            "eventos",
            "notificaciones",
            "pqrs",
            "perfil",
            "info_academica",
            "configuracion"
        ],
        acciones: [
            "consultar_solicitudes",
            "realizar_reservas",
            "gestionar_reservas",
            "solicitar_recursos",
            "publicar_info_academica",
            "consultar_info_academica"
        ]
    },
    {
        nombre: "Estudiante",
        permisos: [
            "dashboard",
            "solicitudes",
            "reservas",
            "recursos",
            "eventos",
            "notificaciones",
            "pqrs",
            "perfil",
            "info_academica",
            "configuracion"
        ],
        acciones: [
            "registrar_solicitudes",
            "consultar_solicitudes",
            "realizar_reservas",
            "solicitar_recursos",
            "consultar_info_academica"
        ]
    }
];

const usuarios = [
    {
        id: 1,
        usuario: "admin",
        cedula: "1023456789",
        password: "admin123",
        nombre: "Natalia Rodríguez",
        correo: "natalia.rodriguez@uajs.edu.co",
        rol: "Administrador",
        programa: "Dirección Académica",
        estado: "Activo",
        cargo: "Coordinadora general",
        campus: "Campus principal"
    },
    {
        id: 2,
        usuario: "funcionario",
        cedula: "1023456788",
        password: "func123",
        nombre: "Carlos Méndez",
        correo: "carlos.mendez@uajs.edu.co",
        rol: "Administrativo",
        programa: "Bienestar Universitario",
        estado: "Activo",
        cargo: "Analista de servicios",
        campus: "Campus Norte"
    },
    {
        id: 3,
        usuario: "profesor",
        cedula: "1023456787",
        password: "prof123",
        nombre: "Laura Gómez",
        correo: "laura.gomez@uajs.edu.co",
        rol: "Docente",
        programa: "Matemáticas",
        estado: "Activo",
        cargo: "Docente titular",
        campus: "Campus central"
    },
    {
        id: 4,
        usuario: "estudiante",
        cedula: "1023456786",
        password: "est123",
        nombre: "Andrés Torres",
        correo: "andres.torres@uajs.edu.co",
        rol: "Estudiante",
        programa: "Ingeniería de Sistemas",
        estado: "Activo",
        cargo: "Estudiante",
        campus: "Campus central"
    },
    {
        id: 5,
        usuario: "docente2",
        cedula: "1023456785",
        password: "doc123",
        nombre: "María Fernanda Cárdenas",
        correo: "mf.cardenas@uajs.edu.co",
        rol: "Docente",
        programa: "Ingeniería de Software",
        estado: "Activo",
        cargo: "Profesora de proyectos",
        campus: "Campus principal"
    },
    {
        id: 6,
        usuario: "estudiante2",
        cedula: "1023456784",
        password: "stu123",
        nombre: "Valentina Morales",
        correo: "valentina.morales@uajs.edu.co",
        rol: "Estudiante",
        programa: "Administración de Empresas",
        estado: "Activo",
        cargo: "Estudiante",
        campus: "Campus occidente"
    },
    {
        id: 7,
        usuario: "admin2",
        cedula: "1023456783",
        password: "ua123",
        nombre: "Javier Álvarez",
        correo: "javier.alvarez@uajs.edu.co",
        rol: "Administrador",
        programa: "Tecnología e innovación",
        estado: "Activo",
        cargo: "Director de operación",
        campus: "Campus principal"
    },
    {
        id: 8,
        usuario: "admvo",
        cedula: "1023456782",
        password: "adm123",
        nombre: "Sofía Jiménez",
        correo: "sofia.jimenez@uajs.edu.co",
        rol: "Administrativo",
        programa: "Servicios estudiantiles",
        estado: "Inactivo",
        cargo: "Coordinadora administrativa",
        campus: "Campus centro"
    },
    {
        id: 9,
        usuario: "docente3",
        cedula: "1023456781",
        password: "doc456",
        nombre: "Ricardo Torres",
        correo: "ricardo.torres@uajs.edu.co",
        rol: "Docente",
        programa: "Física",
        estado: "Activo",
        cargo: "Docente de laboratorio",
        campus: "Campus central"
    },
    {
        id: 10,
        usuario: "estudiante3",
        cedula: "1023456780",
        password: "stu456",
        nombre: "Isabella Ramírez",
        correo: "isabella.ramirez@uajs.edu.co",
        rol: "Estudiante",
        programa: "Ingeniería Civil",
        estado: "Activo",
        cargo: "Estudiante",
        campus: "Campus Norte"
    },
    {
        id: 11,
        usuario: "admin3",
        cedula: "1023456779",
        password: "admin456",
        nombre: "Andrés Gutiérrez",
        correo: "andres.gutierrez@uajs.edu.co",
        rol: "Administrador",
        programa: "Tecnologías de la información",
        estado: "Activo",
        cargo: "Director de sistemas",
        campus: "Campus principal"
    },
    {
        id: 12,
        usuario: "admvo2",
        cedula: "1023456778",
        password: "adm456",
        nombre: "Paula Vargas",
        correo: "paula.vargas@uajs.edu.co",
        rol: "Administrativo",
        programa: "Recursos Humanos",
        estado: "Activo",
        cargo: "Analista de talento humano",
        campus: "Campus occidente"
    },
    {
        id: 13,
        usuario: "docente4",
        cedula: "1023456777",
        password: "doc789",
        nombre: "Fernando Castillo",
        correo: "fernando.castillo@uajs.edu.co",
        rol: "Docente",
        programa: "Economía",
        estado: "Activo",
        cargo: "Docente titular",
        campus: "Campus central"
    },
    {
        id: 14,
        usuario: "estudiante4",
        cedula: "1023456776",
        password: "stu789",
        nombre: "Camila Herrera",
        correo: "camila.herrera@uajs.edu.co",
        rol: "Estudiante",
        programa: "Derecho",
        estado: "Activo",
        cargo: "Estudiante",
        campus: "Campus centro"
    },
    {
        id: 15,
        usuario: "admin4",
        cedula: "1023456775",
        password: "admin789",
        nombre: "Luisa Cardona",
        correo: "luisa.cardona@uajs.edu.co",
        rol: "Administrador",
        programa: "Administración",
        estado: "Activo",
        cargo: "Rectora",
        campus: "Campus principal"
    },
    {
        id: 16,
        usuario: "docente5",
        cedula: "1023456774",
        password: "doc000",
        nombre: "Sebastián Rojas",
        correo: "sebastian.rojas@uajs.edu.co",
        rol: "Docente",
        programa: "Idiomas",
        estado: "Inactivo",
        cargo: "Docente de inglés",
        campus: "Campus occidente"
    },
    {
        id: 17,
        usuario: "estudiante5",
        cedula: "1023456773",
        password: "stu000",
        nombre: "Daniela Ortiz",
        correo: "daniela.ortiz@uajs.edu.co",
        rol: "Estudiante",
        programa: "Psicología",
        estado: "Activo",
        cargo: "Estudiante",
        campus: "Campus Norte"
    }
];

export const STORAGE_KEY = "uajs_users";

export function obtenerUsuarios() {
    try {
        const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        let cambio = false;
        if (guardados.length > 0) {
            // Asegurar que los usuarios base estén presentes (evita IDs duplicados)
            // y rellenar campos base que falten (p.ej. cedula).
            const fusionados = [...guardados];
            const idsGuardados = new Set(guardados.map((u) => u.id));
            const basePorId = {};
            usuarios.forEach((base) => { basePorId[base.id] = base; });

            usuarios.forEach((base) => {
                if (!idsGuardados.has(base.id)) {
                    fusionados.push(base);
                    cambio = true;
                }
            });

            const indexados = fusionados.map((u) => {
                const base = basePorId[u.id];
                if (!base) return u;
                let m = false;
                const actualizado = { ...u };
                ["cedula", "correo", "programa", "cargo", "campus"].forEach((campo) => {
                    if ((!u[campo] || u[campo] === "") && base[campo]) {
                        actualizado[campo] = base[campo];
                        m = true;
                    }
                });
                if (m) cambio = true;
                return actualizado;
            });

            if (cambio) {
                guardarUsuarios(indexados);
            }
            return indexados;
        }
        guardarUsuarios(usuarios);
        return usuarios;
    } catch {
        return usuarios;
    }
}

export function guardarUsuarios(lista) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch {
        // si localStorage no está disponible se ignora
    }
}

function buscarRol(rol) {
    if (!rol) return null;
    const exacto = ROLES.find((item) => item.nombre === rol);
    if (exacto) return exacto;
    const objetivo = String(rol).trim().toLowerCase();
    return (
        ROLES.find(
            (item) => String(item.nombre).trim().toLowerCase() === objetivo
        ) || null
    );
}

export function permisosDeRol(rol) {
    const encontrado = buscarRol(rol);
    return encontrado ? encontrado.permisos : [];
}

export function accionesDeRol(rol) {
    const encontrado = buscarRol(rol);
    return encontrado ? encontrado.acciones : [];
}

export default usuarios;
