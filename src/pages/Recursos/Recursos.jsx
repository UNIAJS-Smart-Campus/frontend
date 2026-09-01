import { useState, useMemo } from "react";
import Icon from "../../components/Icon/Icon";
import Modal from "../../components/Modal/Modal";
import Input from "../../components/Input/Input";
import SearchBar from "../../components/SearchBar/SearchBar";
import useAuth from "../../context/useAuth";
import { TIPOS_RECURSO, obtenerRecursos, guardarRecursos } from "../../utils/recursos";
import "./Recursos.css";

const CATEGORIA_VARIANT = {
    Salas: { icono: "reservas", clase: "blue", etiqueta: "Espacio" },
    Laboratorios: { icono: "recursos", clase: "green", etiqueta: "Laboratorio" },
    Auditorios: { icono: "eventos", clase: "purple", etiqueta: "Espacio" },
    Equipos: { icono: "recursos", clase: "orange", etiqueta: "Equipo" }
};

const ESTADO_VARIANT = {
    Disponible: { etiqueta: "DISPONIBLE", clase: "available", bg: "blue" },
    "En mantenimiento": { etiqueta: "MANTENIMIENTO", clase: "maintenance", bg: "orange" },
    Ocupado: { etiqueta: "OCUPADO", clase: "unavailable", bg: "red" },
    Inactivo: { etiqueta: "NO DISPONIBLE", clase: "unavailable", bg: "red" }
};

function estadoVisual(recurso) {
    if (recurso.estado === "En mantenimiento") {
        return ESTADO_VARIANT["En mantenimiento"];
    }
    if (recurso.estado === "Inactivo") {
        return ESTADO_VARIANT.Inactivo;
    }
    if (recurso.disponibilidad === "Disponible") {
        return ESTADO_VARIANT.Disponible;
    }
    return ESTADO_VARIANT.Ocupado;
}

function esReservable(recurso) {
    return (
        recurso.estado === "Activo" &&
        recurso.disponibilidad === "Disponible"
    );
}

const CATEGORIAS = [
    { valor: "all", etiqueta: "Todas" },
    { valor: "Salas", etiqueta: "Espacios" },
    { valor: "Equipos", etiqueta: "Equipos" },
    { valor: "Laboratorios", etiqueta: "Laboratorios" },
    { valor: "Auditorios", etiqueta: "Auditorios" }
];

const EDIFICIOS = ["Todos", "Bloque A", "Bloque B", "Bloque C"];

function obtenerEdificio(ubicacion) {
    const bloque = (ubicacion || "").split("·")[0].trim();
    return bloque || "Otro";
}

function Recursos() {
    const { puede } = useAuth();
    const puedeAdmin = puede("administrar_recursos");

    const [items, setItems] = useState(obtenerRecursos);
    const [query, setQuery] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [categoria, setCategoria] = useState("all");
    const [edificio, setEdificio] = useState("Todos");
    const [estado, setEstado] = useState("Todos");
    const [recursoSeleccionado, setRecursoSeleccionado] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [detalleRecurso, setDetalleRecurso] = useState(null);
    const [form, setForm] = useState({
        fecha: "",
        horaInicio: "10:00",
        horaFin: "12:00",
        motivo: ""
    });
    const [errores, setErrores] = useState({});
    const [confirmacion, setConfirmacion] = useState("");

    const [crudAbierto, setCrudAbierto] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [formRecurso, setFormRecurso] = useState({
        nombre: "",
        codigo: "",
        tipo: "Salas",
        capacidad: "",
        ubicacion: "",
        estado: "Activo",
        disponibilidad: "Disponible"
    });
    const [errorRecurso, setErrorRecurso] = useState("");
    const [aviso, setAviso] = useState("");

    const hoyStr = new Date().toISOString().split("T")[0];

    const mostrarAviso = (mensaje) => {
        setAviso(mensaje);
        setTimeout(() => setAviso(""), 2500);
    };

    const stats = useMemo(() => {
        const disponibles = items.filter(
            (r) => r.disponibilidad === "Disponible"
        ).length;
        const mantenimiento = items.filter(
            (r) => r.estado === "En mantenimiento"
        ).length;
        return {
            total: items.length,
            disponibles,
            mantenimiento,
            reservados: items.length - disponibles - mantenimiento
        };
    }, [items]);

    const filtrados = useMemo(() => {
        const texto = busqueda.toLowerCase().trim();
        return items.filter((recurso) => {
            if (
                texto &&
                !`${recurso.nombre} ${recurso.tipo} ${recurso.ubicacion}`
                    .toLowerCase()
                    .includes(texto)
            ) {
                return false;
            }
            if (categoria !== "all" && recurso.tipo !== categoria) {
                return false;
            }
            if (
                edificio !== "Todos" &&
                obtenerEdificio(recurso.ubicacion) !== edificio
            ) {
                return false;
            }
            if (estado !== "Todos") {
                if (estado === "Disponible" && !esReservable(recurso)) {
                    return false;
                }
                if (estado === "Mantenimiento" && recurso.estado !== "En mantenimiento") {
                    return false;
                }
                if (estado === "Reservado" && esReservable(recurso)) {
                    return false;
                }
            }
            return true;
        });
    }, [busqueda, categoria, edificio, estado, items]);

    const sugerencias = [
        ...new Set(
            items
                .flatMap((recurso) => [recurso.nombre, recurso.tipo, recurso.ubicacion])
                .filter(Boolean)
        )
    ];

    const abrirReserva = (recurso) => {
        if (!esReservable(recurso)) return;
        setRecursoSeleccionado(recurso);
        setConfirmacion("");
        setErrores({});
        setForm({ fecha: "", horaInicio: "10:00", horaFin: "12:00", motivo: "" });
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setRecursoSeleccionado(null);
    };

    const validarFormulario = () => {
        const nuevos = {};
        if (!form.fecha) {
            nuevos.fecha = "La fecha es obligatoria.";
        } else if (form.fecha < hoyStr) {
            nuevos.fecha = "No puedes reservar en una fecha pasada.";
        }
        if (form.horaInicio >= form.horaFin) {
            nuevos.horaFin = "La hora de fin debe ser posterior a la de inicio.";
        }
        setErrores(nuevos);
        return Object.keys(nuevos).length === 0;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrores((prev) => ({ ...prev, [e.target.name]: "" }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;
        setConfirmacion(
            `La solicitud de reserva de "${recursoSeleccionado.nombre}" fue registrada correctamente.`
        );
        setErrores({});
    };

    const abrirNuevoRecurso = () => {
        setEditandoId(null);
        setFormRecurso({
            nombre: "",
            codigo: "",
            tipo: "Salas",
            capacidad: "",
            ubicacion: "",
            estado: "Activo",
            disponibilidad: "Disponible"
        });
        setErrorRecurso("");
        setCrudAbierto(true);
    };

    const abrirEditarRecurso = (recurso) => {
        setEditandoId(recurso.id);
        setFormRecurso({
            nombre: recurso.nombre,
            codigo: recurso.codigo,
            tipo: recurso.tipo,
            capacidad: String(recurso.capacidad),
            ubicacion: recurso.ubicacion,
            estado: recurso.estado,
            disponibilidad: recurso.disponibilidad
        });
        setErrorRecurso("");
        setCrudAbierto(true);
    };

    const cerrarCrud = () => {
        setCrudAbierto(false);
        setErrorRecurso("");
    };

    const handleRecursoChange = (e) => {
        setFormRecurso({ ...formRecurso, [e.target.name]: e.target.value });
    };

    const handleRecursoSubmit = (e) => {
        e.preventDefault();

        if (!formRecurso.nombre.trim() || !formRecurso.codigo.trim()) {
            setErrorRecurso("El nombre y el código son obligatorios.");
            return;
        }

        const duplicado = items.some(
            (item) =>
                item.codigo.toLowerCase() === formRecurso.codigo.trim().toLowerCase() &&
                item.id !== editandoId
        );
        if (duplicado) {
            setErrorRecurso("Ya existe un recurso con ese código.");
            return;
        }

        const nuevoId =
            editandoId ||
            `R-${String(Date.now()).slice(-6)}-${Math.floor(Math.random() * 90 + 10)}`;

        const datos = {
            id: nuevoId,
            nombre: formRecurso.nombre.trim(),
            codigo: formRecurso.codigo.trim(),
            tipo: formRecurso.tipo,
            capacidad: Number(formRecurso.capacidad) || 1,
            ubicacion: formRecurso.ubicacion.trim() || "Bloque A",
            estado: formRecurso.estado,
            disponibilidad: formRecurso.disponibilidad
        };

        if (editandoId === null) {
            const lista = [...items, datos];
            setItems(lista);
            guardarRecursos(lista);
            mostrarAviso("Recurso creado correctamente.");
        } else {
            const lista = items.map((item) => (item.id === editandoId ? datos : item));
            setItems(lista);
            guardarRecursos(lista);
            mostrarAviso("Recurso actualizado correctamente.");
        }

        setCrudAbierto(false);
    };

    const eliminarRecurso = (recurso) => {
        const confirma = window.confirm(
            `¿Eliminar el recurso "${recurso.nombre}"?`
        );
        if (!confirma) return;
        const lista = items.filter((item) => item.id !== recurso.id);
        setItems(lista);
        guardarRecursos(lista);
        mostrarAviso(`Recurso "${recurso.nombre}" eliminado.`);
    };

    return (
        <div className="page">
            <div className="page__header">
                <div className="page__title">
                    <p>Consulta los espacios, equipos y recursos disponibles del campus.</p>
                </div>

                {puedeAdmin && (
                    <button className="button button--accent button--md" onClick={abrirNuevoRecurso}>
                        <Icon name="recursos" size={15} />
                        Nuevo recurso
                    </button>
                )}
            </div>

            {aviso && (
                <div className="toast toast--success">
                    <Icon name="info" size={14} />
                    {aviso}
                </div>
            )}

            <div className="summary">
                <div className="summary__card">
                    <div className="summary__icon recursos__summary-icon--blue">
                        <Icon name="recursos" size={18} />
                    </div>
                    <div>
                        <div className="summary__number">{stats.total}</div>
                        <div className="summary__label">Recursos totales</div>
                    </div>
                </div>

                <div className="summary__card">
                    <div className="summary__icon recursos__summary-icon--green">
                        <Icon name="estudiante" size={18} />
                    </div>
                    <div>
                        <div className="summary__number">{stats.disponibles}</div>
                        <div className="summary__label">Disponibles</div>
                    </div>
                </div>

                <div className="summary__card">
                    <div className="summary__icon recursos__summary-icon--orange">
                        <Icon name="configuracion" size={18} />
                    </div>
                    <div>
                        <div className="summary__number">{stats.mantenimiento}</div>
                        <div className="summary__label">En mantenimiento</div>
                    </div>
                </div>

                <div className="summary__card">
                    <div className="summary__icon recursos__summary-icon--purple">
                        <Icon name="reservas" size={18} />
                    </div>
                    <div>
                        <div className="summary__number">{stats.reservados}</div>
                        <div className="summary__label">Reservados</div>
                    </div>
                </div>
            </div>

            <div className="filters filters--recursos">
                <div className="filters__grid">
                    <div className="filters__group filters__group--search">
                        <label>Buscar</label>
                        <SearchBar
                            placeholder="Nombre del recurso..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onSearch={() => setBusqueda(query)}
                            suggestions={sugerencias}
                        />
                    </div>

                    <div className="filters__group">
                        <label>Categoría</label>
                        <select
                            className="recursos__filter-select"
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                        >
                            {CATEGORIAS.map((c) => (
                                <option key={c.valor} value={c.valor}>
                                    {c.etiqueta}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filters__group">
                        <label>Edificio</label>
                        <select
                            className="recursos__filter-select"
                            value={edificio}
                            onChange={(e) => setEdificio(e.target.value)}
                        >
                            {EDIFICIOS.map((ed) => (
                                <option key={ed}>{ed}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filters__group">
                        <label>Estado</label>
                        <select
                            className="recursos__filter-select"
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                        >
                            <option>Todos</option>
                            <option>Disponible</option>
                            <option>Reservado</option>
                            <option>Mantenimiento</option>
                        </select>
                    </div>

                    <button
                        className="recursos__filter-button"
                        onClick={() => {
                            setQuery("");
                            setBusqueda("");
                        }}
                    >
                        <Icon name="solicitudes" size={12} />
                        Limpiar
                    </button>
                </div>
            </div>

            <div className="list-header">
                <h2>Recursos</h2>
                <span className="list-header__meta">Mostrando {filtrados.length} recursos</span>
            </div>

            <div className="recursos__resources">
                {filtrados.length > 0 ? (
                    filtrados.map((recurso) => {
                        const categoriaVar =
                            CATEGORIA_VARIANT[recurso.tipo] || CATEGORIA_VARIANT.Salas;
                        const estadoVar = estadoVisual(recurso);
                        const reservable = esReservable(recurso);

                        return (
                            <div className="recursos__resource-card" key={recurso.id}>
                                <div className={`recursos__resource-image ${estadoVar.bg}-bg`}>
                                    <Icon name={categoriaVar.icono} size={44} />
                                    <span className={`status ${estadoVar.clase}`}>
                                        {estadoVar.etiqueta}
                                    </span>
                                </div>

                                <div className="recursos__resource-content">
                                    <div className="recursos__resource-type">
                                        {categoriaVar.etiqueta}
                                    </div>
                                    <h3>{recurso.nombre}</h3>
                                    <p className="recursos__resource-description">
                                        Recurso {recurso.tipo.toLowerCase()} con capacidad para
                                        {" "}{recurso.capacidad} persona(s), ubicado en {recurso.ubicacion}.
                                    </p>

                                    <div className="recursos__resource-details">
                                        <span className="detail">
                                            <Icon name="estudiante" size={11} />
                                            {recurso.capacidad} personas
                                        </span>
                                        <span className="detail">
                                            <Icon name="recursos" size={11} />
                                            {recurso.tipo}
                                        </span>
                                        <span className="detail">
                                            <Icon name="eventos" size={11} />
                                            {obtenerEdificio(recurso.ubicacion)}
                                        </span>
                                    </div>

                                    <div className="recursos__resource-actions">
                                        <button
                                            className="recursos__details-button"
                                            onClick={() => setDetalleRecurso(recurso)}
                                        >
                                            Ver detalles
                                        </button>
                                        <button
                                            className="recursos__reserve-button"
                                            disabled={!reservable}
                                            onClick={() => abrirReserva(recurso)}
                                        >
                                            {reservable ? "Reservar" : "No disponible"}
                                        </button>
                                        {puedeAdmin && (
                                            <>
                                                <button
                                                    className="recursos__edit-button"
                                                    onClick={() => abrirEditarRecurso(recurso)}
                                                >
                                                    <Icon name="usuarios" size={12} />
                                                    Editar
                                                </button>
                                                <button
                                                    className="recursos__delete-button"
                                                    onClick={() => eliminarRecurso(recurso)}
                                                >
                                                    <Icon name="configuracion" size={12} />
                                                    Eliminar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="empty">
                        No se encontraron recursos con los filtros aplicados.
                    </div>
                )}
            </div>

            <Modal
                isOpen={modalAbierto}
                title="Reservar recurso"
                onClose={cerrarModal}
            >
                {confirmacion ? (
                    <div className="recursos__confirm">
                        <p>{confirmacion}</p>
                        <button className="recursos__confirm-button" onClick={cerrarModal}>
                            Cerrar
                        </button>
                    </div>
                ) : (
                    <form className="recursos__form" onSubmit={handleSubmit}>
                        <div className="recursos__modal-info">
                            <strong>{recursoSeleccionado?.nombre}</strong>
                            <span>Selecciona la fecha y horario de la reserva.</span>
                        </div>

                        <Input
                            label="Fecha"
                            type="date"
                            name="fecha"
                            value={form.fecha}
                            onChange={handleChange}
                            id="recurso-fecha"
                            min={hoyStr}
                        />
                        {errores.fecha && (
                            <span className="recursos__error">{errores.fecha}</span>
                        )}

                        <div className="recursos__form-row">
                            <div>
                                <Input
                                    label="Hora de inicio"
                                    type="time"
                                    name="horaInicio"
                                    value={form.horaInicio}
                                    onChange={handleChange}
                                    id="recurso-inicio"
                                />
                            </div>
                            <div>
                                <Input
                                    label="Hora de finalización"
                                    type="time"
                                    name="horaFin"
                                    value={form.horaFin}
                                    onChange={handleChange}
                                    id="recurso-fin"
                                />
                                {errores.horaFin && (
                                    <span className="recursos__error">{errores.horaFin}</span>
                                )}
                            </div>
                        </div>

                        <Input
                            label="Motivo de la reserva"
                            type="text"
                            name="motivo"
                            placeholder="Ej. Trabajo grupal"
                            value={form.motivo}
                            onChange={handleChange}
                            id="recurso-motivo"
                        />

                        <div className="recursos__modal-footer">
                            <button
                                className="recursos__cancel-button"
                                type="button"
                                onClick={cerrarModal}
                            >
                                Cancelar
                            </button>
                            <button
                                className="recursos__confirm-button recursos__confirm-button--primary"
                                type="submit"
                                disabled={!form.fecha}
                            >
                                Confirmar reserva
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            <Modal
                isOpen={detalleRecurso !== null}
                title="Detalles del recurso"
                onClose={() => setDetalleRecurso(null)}
            >
                {detalleRecurso && (
                    <div className="recursos__detalle">
                        <div className="recursos__detalle-name">{detalleRecurso.nombre}</div>
                        <div className="recursos__detalle-grid">
                            <div className="recursos__detalle-item">
                                <span className="recursos__detalle-label">Código</span>
                                <span className="recursos__detalle-value">{detalleRecurso.codigo}</span>
                            </div>
                            <div className="recursos__detalle-item">
                                <span className="recursos__detalle-label">Tipo</span>
                                <span className="recursos__detalle-value">{detalleRecurso.tipo}</span>
                            </div>
                            <div className="recursos__detalle-item">
                                <span className="recursos__detalle-label">Capacidad</span>
                                <span className="recursos__detalle-value">{detalleRecurso.capacidad} personas</span>
                            </div>
                            <div className="recursos__detalle-item">
                                <span className="recursos__detalle-label">Ubicación</span>
                                <span className="recursos__detalle-value">{detalleRecurso.ubicacion}</span>
                            </div>
                            <div className="recursos__detalle-item">
                                <span className="recursos__detalle-label">Estado</span>
                                <span className="recursos__detalle-value">{detalleRecurso.estado}</span>
                            </div>
                            <div className="recursos__detalle-item">
                                <span className="recursos__detalle-label">Disponibilidad</span>
                                <span className="recursos__detalle-value">{detalleRecurso.disponibilidad}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={crudAbierto}
                title={editandoId === null ? "Nuevo recurso" : "Editar recurso"}
                onClose={cerrarCrud}
            >
                <form className="recursos__form" onSubmit={handleRecursoSubmit}>
                    {errorRecurso && <p className="recursos__error">{errorRecurso}</p>}

                    <Input
                        label="Nombre del recurso"
                        type="text"
                        name="nombre"
                        value={formRecurso.nombre}
                        onChange={handleRecursoChange}
                        id="recurso-crud-nombre"
                        placeholder="Ej. Salón 102"
                    />

                    <Input
                        label="Código"
                        type="text"
                        name="codigo"
                        value={formRecurso.codigo}
                        onChange={handleRecursoChange}
                        id="recurso-crud-codigo"
                        placeholder="Ej. REC-102"
                    />

                    <div className="recursos__form-row">
                        <div>
                            <label className="recursos__field-label">Tipo</label>
                            <select
                                className="recursos__filter-select"
                                name="tipo"
                                value={formRecurso.tipo}
                                onChange={handleRecursoChange}
                            >
                                {TIPOS_RECURSO.map((tipo) => (
                                    <option key={tipo} value={tipo}>
                                        {tipo}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="recursos__field-label">Capacidad</label>
                            <input
                                className="recursos__filter-input"
                                type="number"
                                min="1"
                                name="capacidad"
                                value={formRecurso.capacidad}
                                onChange={handleRecursoChange}
                                placeholder="Ej. 40"
                            />
                        </div>
                    </div>

                    <Input
                        label="Ubicación"
                        type="text"
                        name="ubicacion"
                        value={formRecurso.ubicacion}
                        onChange={handleRecursoChange}
                        id="recurso-crud-ubicacion"
                        placeholder="Ej. Bloque A · Piso 1"
                    />

                    <div className="recursos__form-row">
                        <div>
                            <label className="recursos__field-label">Estado</label>
                            <select
                                className="recursos__filter-select"
                                name="estado"
                                value={formRecurso.estado}
                                onChange={handleRecursoChange}
                            >
                                <option value="Activo">Activo</option>
                                <option value="En mantenimiento">En mantenimiento</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </div>
                        <div>
                            <label className="recursos__field-label">Disponibilidad</label>
                            <select
                                className="recursos__filter-select"
                                name="disponibilidad"
                                value={formRecurso.disponibilidad}
                                onChange={handleRecursoChange}
                            >
                                <option value="Disponible">Disponible</option>
                                <option value="Ocupado">Ocupado</option>
                            </select>
                        </div>
                    </div>

                    <div className="recursos__modal-footer">
                        <button
                            className="recursos__cancel-button"
                            type="button"
                            onClick={cerrarCrud}
                        >
                            Cancelar
                        </button>
                        <button
                            className="recursos__confirm-button recursos__confirm-button--primary"
                            type="submit"
                            disabled={!formRecurso.nombre.trim() || !formRecurso.codigo.trim()}
                        >
                            {editandoId === null ? "Crear recurso" : "Guardar cambios"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default Recursos;
