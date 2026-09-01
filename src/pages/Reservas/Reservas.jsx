import { useState, useMemo } from "react";
import Icon from "../../components/Icon/Icon";
import Modal from "../../components/Modal/Modal";
import Input from "../../components/Input/Input";
import SearchBar from "../../components/SearchBar/SearchBar";
import recursos from "../../utils/recursos";
import "./Reservas.css";

const TIPO_VARIANT = {
    Salas: { icono: "reservas", clase: "blue" },
    Laboratorios: { icono: "recursos", clase: "green" },
    Auditorios: { icono: "eventos", clase: "purple" },
    Equipos: { icono: "recursos", clase: "cyan" }
};

const DIAS_SEMANA = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

const RESERVAS_INICIALES = [
    {
        id: "RES-INICIAL-1",
        recurso: "Salón 101",
        fecha: "2026-08-31",
        horaInicio: "10:00",
        horaFin: "12:00",
        proposito: "Reunión de grupo",
        estado: "Confirmada"
    },
    {
        id: "RES-INICIAL-2",
        recurso: "Laboratorio de informática 1",
        fecha: "2026-09-01",
        horaInicio: "14:00",
        horaFin: "16:00",
        proposito: "Práctica de programación",
        estado: "Pendiente"
    },
    {
        id: "RES-INICIAL-3",
        recurso: "Auditorio principal",
        fecha: "2026-09-03",
        horaInicio: "08:00",
        horaFin: "09:00",
        proposito: "Asamblea estudiantil",
        estado: "Confirmada"
    }
];

const ESTADO_CLASE = {
    Confirmada: "confirmed",
    Pendiente: "pending",
    Cancelada: "finished"
};

function esReservable(recurso) {
    return (
        recurso.estado === "Activo" &&
        recurso.disponibilidad === "Disponible"
    );
}

function formatearHora(hora24) {
    if (!hora24) return "";
    const [hora, minuto] = hora24.split(":").map(Number);
    const periodo = hora >= 12 ? "p.m." : "a.m.";
    const hora12 = hora % 12 || 12;
    return `${hora12}:${String(minuto).padStart(2, "0")} ${periodo}`;
}

function Reservas() {
    const [query, setQuery] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [tipo, setTipo] = useState("Todos");
    const [fecha, setFecha] = useState("");
    const [hora, setHora] = useState("Cualquier hora");
    const [recursoSeleccionado, setRecursoSeleccionado] = useState(null);
    const [misReservas, setMisReservas] = useState(RESERVAS_INICIALES);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [form, setForm] = useState({
        fecha: "",
        horaInicio: "",
        horaFin: "",
        proposito: ""
    });
    const [errores, setErrores] = useState({});
    const [confirmacion, setConfirmacion] = useState("");
    const [busquedaAlerta, setBusquedaAlerta] = useState(false);

    const hoy = new Date();
    const hoyStr = hoy.toISOString().split("T")[0];

    const disponibles = useMemo(() => {
        return recursos
            .filter(esReservable)
            .filter((recurso) => {
                const texto = busqueda.toLowerCase().trim();
                if (
                    texto &&
                    !`${recurso.nombre} ${recurso.tipo} ${recurso.ubicacion}`
                        .toLowerCase()
                        .includes(texto)
                ) {
                    return false;
                }
                if (tipo !== "Todos" && recurso.tipo !== tipo) {
                    return false;
                }
                return true;
            });
    }, [busqueda, tipo]);

    const refrescar = () => {
        if (busquedaAlerta) {
            setBusquedaAlerta(false);
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!form.fecha) {
            nuevosErrores.fecha = "La fecha es obligatoria.";
        } else if (form.fecha < hoyStr) {
            nuevosErrores.fecha = "No puedes reservar en una fecha pasada.";
        }

        if (!form.horaInicio) {
            nuevosErrores.horaInicio = "La hora de inicio es obligatoria.";
        } else if (form.horaInicio < "07:00" || form.horaInicio > "21:00") {
            nuevosErrores.horaInicio = "El horario permitido es de 7:00 a.m. a 9:00 p.m.";
        }

        if (!form.horaFin) {
            nuevosErrores.horaFin = "La hora de finalización es obligatoria.";
        } else if (form.horaFin < "07:00" || form.horaFin > "21:00") {
            nuevosErrores.horaFin = "El horario permitido es de 7:00 a.m. a 9:00 p.m.";
        }

        if (form.horaInicio && form.horaFin && form.horaInicio >= form.horaFin) {
            nuevosErrores.horaFin = "La hora de fin debe ser posterior a la hora de inicio.";
        }

        if (Object.keys(nuevosErrores).length === 0 && recursoSeleccionado) {
            const conflicto = misReservas.find((reserva) => {
                if (reserva.recurso !== recursoSeleccionado.nombre) return false;
                if (reserva.fecha !== form.fecha) return false;
                return (
                    form.horaInicio < reserva.horaFin &&
                    reserva.horaInicio < form.horaFin
                );
            });

            if (conflicto) {
                nuevosErrores.conflicto = `Este recurso ya está reservado en la fecha y horario seleccionados (${formatearHora(conflicto.horaInicio)} - ${formatearHora(conflicto.horaFin)}).`;
            }
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrores((prev) => ({ ...prev, [e.target.name]: "", conflicto: "" }));
    };

    const abrirModal = (recurso) => {
        if (recurso) setRecursoSeleccionado(recurso);
        setConfirmacion("");
        setErrores({});
        setForm({ fecha: "", horaInicio: "", horaFin: "", proposito: "" });
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setRecursoSeleccionado(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;

        const nueva = {
            id: `RES-${Date.now()}`,
            recurso: recursoSeleccionado.nombre,
            ...form,
            estado: "Pendiente"
        };

        setMisReservas((prev) => [nueva, ...prev]);
        setConfirmacion(
            `Reserva de "${recursoSeleccionado.nombre}" registrada correctamente.`
        );
        setErrores({});
    };

    const cancelarReserva = (id) => {
        setMisReservas((prev) =>
            prev.map((reserva) =>
                reserva.id === id
                    ? { ...reserva, estado: "Cancelada" }
                    : reserva
            )
        );
    };

    const buscarRecursos = () => {
        setBusqueda(query);
        setBusquedaAlerta(true);
    };

    const sugerencias = useMemo(() => {
        return [
            ...new Set(
                recursos
                    .flatMap((r) => [r.nombre, r.tipo, r.ubicacion, r.codigo])
                    .filter(Boolean)
            )
        ];
    }, []);

    const fechaReferencia = new Date(`${fecha || hoyStr}T00:00:00`);
    const inicioSemana = new Date(fechaReferencia);
    inicioSemana.setDate(fechaReferencia.getDate() - fechaReferencia.getDay() + 1);

    return (
        <div className="page">
            <div className="page__header">
                <div className="page__title">
                    <p>Reserva espacios y recursos disponibles del campus.</p>
                </div>

                <button
                    className="button button--accent button--md"
                    onClick={() => abrirModal(null)}
                >
                    <Icon name="configuracion" size={13} />
                    Nueva reserva
                </button>
            </div>

            <div className="filters">
                <div className="filters__grid">
                    <div className="filters__group filters__group--search">
                        <label className="reservas__filter-label">¿Qué necesitas?</label>
                        <SearchBar
                            id="reservas-search"
                            placeholder="Ej. Laboratorio, Salón 101…"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                refrescar();
                            }}
                            onSearch={buscarRecursos}
                            suggestions={sugerencias}
                        />
                    </div>

                    <div className="filters__group">
                        <label className="reservas__filter-label">Tipo de recurso</label>
                        <select
                            className="reservas__filter-select"
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                        >
                            <option>Todos</option>
                            <option>Salas</option>
                            <option>Laboratorios</option>
                            <option>Auditorios</option>
                            <option>Equipos</option>
                        </select>
                    </div>

                    <div className="filters__group">
                        <label className="reservas__filter-label">Fecha</label>
                        <input
                            className="reservas__filter-input"
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                        />
                    </div>

                    <div className="filters__group">
                        <label className="reservas__filter-label">Hora</label>
                        <select
                            className="reservas__filter-select"
                            value={hora}
                            onChange={(e) => setHora(e.target.value)}
                        >
                            <option>Cualquier hora</option>
                            <option>8:00 a. m.</option>
                            <option>10:00 a. m.</option>
                            <option>12:00 p. m.</option>
                            <option>2:00 p. m.</option>
                            <option>4:00 p. m.</option>
                        </select>
                    </div>

                    {busquedaAlerta && (
                        <p className="reservas__search-alert">
                            {disponibles.length} recurso(s) disponible(s) según tu búsqueda.
                        </p>
                    )}
                </div>
            </div>

            <div className="list-header">
                <h2>Espacios disponibles</h2>
                <span className="list-header__meta">{disponibles.length} recursos encontrados</span>
            </div>

            <div className="reservas__resources">
                {disponibles.length > 0 ? (
                    disponibles.map((recurso) => {
                        const variante = TIPO_VARIANT[recurso.tipo] || TIPO_VARIANT.Salas;
                        return (
                            <div className="reservas__resource-card" key={recurso.id}>
                                <div className={`reservas__resource-image ${variante.clase}-bg`}>
                                    <Icon name={variante.icono} size={40} />
                                    <span className="reservas__available">DISPONIBLE</span>
                                </div>

                                <div className="reservas__resource-content">
                                    <h3>{recurso.nombre}</h3>
                                    <div className="reservas__resource-location">
                                        <Icon name="eventos" size={10} />
                                        {recurso.ubicacion}
                                    </div>

                                    <div className="reservas__resource-info">
                                        <div className="reservas__resource-detail">
                                            <Icon name="estudiante" size={12} />
                                            {recurso.capacidad} personas
                                        </div>
                                        <div className="reservas__resource-detail">
                                            <Icon name="recursos" size={12} />
                                            {recurso.tipo}
                                        </div>
                                    </div>

                                    <button
                                        className="reservas__reserve-button"
                                        onClick={() => abrirModal(recurso)}
                                    >
                                        Reservar espacio
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="empty">
                        No se encontraron recursos disponibles para tu búsqueda.
                    </div>
                )}
            </div>

            <div className="card">
                <div className="card__header">
                    <h2>Mis reservas</h2>
                    <span className="dashboard__card-view">Ver historial →</span>
                </div>

                {misReservas.length > 0 ? (
                    misReservas.map((reserva) => (
                        <div className="reservas__reservation" key={reserva.id}>
                            <div className="reservas__reservation-icon">
                                <Icon name={reserva.recurso.includes("Laboratorio") ? "recursos" : "reservas"} size={17} />
                            </div>

                            <div className="reservas__reservation-info">
                                <div className="reservas__reservation-name">{reserva.recurso}</div>
                                <div className="reservas__reservation-details">
                                    <span>
                                        <Icon name="reservas" size={10} />
                                        {new Date(reserva.fecha + "T00:00:00").toLocaleDateString("es-CO", {
                                            weekday: "long",
                                            day: "numeric",
                                            month: "long"
                                        })}
                                    </span>
                                    <span>
                                        <Icon name="eventos" size={10} />
                                        {formatearHora(reserva.horaInicio)} - {formatearHora(reserva.horaFin)}
                                    </span>
                                    <span>
                                        <Icon name="solicitudes" size={10} />
                                        {reserva.proposito}
                                    </span>
                                </div>
                            </div>

                            <span className={`reservas__reservation-status ${ESTADO_CLASE[reserva.estado] || "pending"}`}>
                                {reserva.estado.toUpperCase()}
                            </span>

                            {reserva.estado !== "Cancelada" && (
                                <div className="reservas__reservation-actions">
                                    <button
                                        className="reservas__action-button"
                                        title="Editar"
                                    >
                                        <Icon name="configuracion" size={13} />
                                    </button>
                                    <button
                                        className="reservas__action-button reservas__action-button--delete"
                                        title="Cancelar"
                                        onClick={() => cancelarReserva(reserva.id)}
                                    >
                                        <Icon name="eventos" size={13} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="empty">Aún no tienes reservas.</div>
                )}
            </div>

            <div className="card">
                <div className="card__header">
                    <h2>Calendario de reservas</h2>
                </div>

                <div className="reservas__calendar-week">
                    {DIAS_SEMANA.map((dia, index) => {
                        const fechaDia = new Date(inicioSemana);
                        fechaDia.setDate(inicioSemana.getDate() + index);
                        const numDia = fechaDia.getDate();
                        const esHoy =
                            fechaDia.getDate() === hoy.getDate() &&
                            fechaDia.getMonth() === hoy.getMonth() &&
                            fechaDia.getFullYear() === hoy.getFullYear();

                        const reservasDia = misReservas.filter(
                            (r) =>
                                new Date(r.fecha + "T00:00:00").toDateString() ===
                                fechaDia.toDateString()
                        );

                        return (
                            <div className="reservas__calendar-day" key={dia}>
                                <div className="reservas__day-name">{dia}</div>
                                <div className={`reservas__day-number${esHoy ? " reservas__day-number--today" : ""}`}>
                                    {numDia}
                                </div>
                                {reservasDia.map((r) => (
                                    <div
                                        className={`reservas__calendar-event${r.recurso.includes("Laboratorio") ? " reservas__calendar-event--green" : r.recurso.includes("Auditorio") ? " reservas__calendar-event--purple" : ""}`}
                                        key={r.id}
                                    >
                                        {r.recurso}
                                        <br />
                                        {formatearHora(r.horaInicio)} - {formatearHora(r.horaFin)}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            <Modal
                isOpen={modalAbierto}
                title={recursoSeleccionado ? `Reservar ${recursoSeleccionado.nombre}` : "Nueva reserva"}
                onClose={cerrarModal}
            >
                {confirmacion ? (
                    <div className="reservas__confirm">
                        <p>{confirmacion}</p>
                        <button className="reservas__confirm-button" onClick={cerrarModal}>
                            Cerrar
                        </button>
                    </div>
                ) : (
                    <form className="reservas__form" onSubmit={handleSubmit}>
                        <div className="reservas__modal-group">
                            <label>Espacio o recurso</label>
                            <select
                                className="reservas__filter-select"
                                value={recursoSeleccionado?.nombre ?? ""}
                                onChange={(e) => {
                                    const recurso = disponibles.find(
                                        (r) => r.nombre === e.target.value
                                    );
                                    if (recurso) {
                                        setRecursoSeleccionado(recurso);
                                        setErrores((prev) => ({ ...prev, conflicto: "" }));
                                    }
                                }}
                            >
                                {disponibles.map((recurso) => (
                                    <option key={recurso.id} value={recurso.nombre}>
                                        {recurso.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Fecha"
                            type="date"
                            name="fecha"
                            value={form.fecha}
                            onChange={handleChange}
                            id="reserva-fecha"
                            min={hoyStr}
                        />
                        {errores.fecha && (
                            <span className="reservas__error">{errores.fecha}</span>
                        )}

                        <div className="reservas__form-row">
                            <div>
                                <Input
                                    label="Hora inicio"
                                    type="time"
                                    name="horaInicio"
                                    value={form.horaInicio}
                                    onChange={handleChange}
                                    id="reserva-inicio"
                                />
                                {errores.horaInicio && (
                                    <span className="reservas__error">{errores.horaInicio}</span>
                                )}
                            </div>

                            <div>
                                <Input
                                    label="Hora fin"
                                    type="time"
                                    name="horaFin"
                                    value={form.horaFin}
                                    onChange={handleChange}
                                    id="reserva-fin"
                                />
                                {errores.horaFin && (
                                    <span className="reservas__error">{errores.horaFin}</span>
                                )}
                            </div>
                        </div>

                        <Input
                            label="Propósito"
                            type="text"
                            name="proposito"
                            placeholder="Describe el propósito de la reserva"
                            value={form.proposito}
                            onChange={handleChange}
                            id="reserva-proposito"
                        />

                        {errores.conflicto && (
                            <div className="reservas__alert reservas__alert--danger">
                                <span className="reservas__alert-icon">⚠️</span>
                                <span>{errores.conflicto}</span>
                            </div>
                        )}

                        <div className="reservas__modal-footer">
                            <button
                                className="reservas__cancel-button"
                                type="button"
                                onClick={cerrarModal}
                            >
                                Cancelar
                            </button>
                            <button
                                className="reservas__confirm-button reservas__confirm-button--primary"
                                type="submit"
                                disabled={!form.fecha || !form.horaInicio || !form.horaFin}
                            >
                                Confirmar reserva
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}

export default Reservas;
