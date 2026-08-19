export const TIPOS_RECURSO = ["Salas", "Laboratorios", "Auditorios", "Equipos"];

const recursos = [
    {
        id: "R-001",
        codigo: "REC-101",
        nombre: "Salón 101",
        tipo: "Salas",
        capacidad: 40,
        ubicacion: "Bloque A · Piso 1",
        estado: "Activo",
        disponibilidad: "Disponible"
    },
    {
        id: "R-002",
        codigo: "REC-205",
        nombre: "Salón 205",
        tipo: "Salas",
        capacidad: 30,
        ubicacion: "Bloque A · Piso 2",
        estado: "Activo",
        disponibilidad: "Ocupado"
    },
    {
        id: "R-003",
        codigo: "REC-LAB1",
        nombre: "Laboratorio de informática 1",
        tipo: "Laboratorios",
        capacidad: 25,
        ubicacion: "Bloque B · Piso 1",
        estado: "Activo",
        disponibilidad: "Disponible"
    },
    {
        id: "R-004",
        codigo: "REC-LABQ",
        nombre: "Laboratorio de química",
        tipo: "Laboratorios",
        capacidad: 20,
        ubicacion: "Bloque B · Piso 2",
        estado: "En mantenimiento",
        disponibilidad: "Ocupado"
    },
    {
        id: "R-005",
        codigo: "REC-AUD1",
        nombre: "Auditorio principal",
        tipo: "Auditorios",
        capacidad: 300,
        ubicacion: "Bloque C",
        estado: "Activo",
        disponibilidad: "Disponible"
    },
    {
        id: "R-006",
        codigo: "REC-AUD2",
        nombre: "Auditorio B",
        tipo: "Auditorios",
        capacidad: 120,
        ubicacion: "Bloque C · Piso 2",
        estado: "Activo",
        disponibilidad: "Ocupado"
    },
    {
        id: "R-007",
        codigo: "REC-EQ1",
        nombre: "Video proyector",
        tipo: "Equipos",
        capacidad: 1,
        ubicacion: "Bodega de tecnología",
        estado: "Activo",
        disponibilidad: "Disponible"
    },
    {
        id: "R-008",
        codigo: "REC-EQ2",
        nombre: "Computador portátil",
        tipo: "Equipos",
        capacidad: 1,
        ubicacion: "Bodega de tecnología",
        estado: "Inactivo",
        disponibilidad: "Ocupado"
    }
];

export default recursos;