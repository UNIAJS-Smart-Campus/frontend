import { useCallback, useEffect, useMemo, useState } from "react";
import Icon from "../../components/Icon/Icon";
import Modal from "../../components/Modal/Modal";
import Input from "../../components/Input/Input";
import SearchBar from "../../components/SearchBar/SearchBar";
import Pagination from "../../components/Pagination/Pagination";
import { esEscenario } from "../../utils/recursos";
import { reservationsApi, resourcesApi } from "../../utils/api";
import useAuth from "../../context/useAuth";
import useToast from "../../context/useToast";
import usePagination from "../../hooks/usePagination";
import "./Reservas.css";

const TIPO_VARIANT = {
    Salas: { icono: "reservas", clase: "blue" },
    Laboratorios: { icono: "recursos", clase: "green" },
    Auditorios: { icono: "eventos", clase: "purple" },
    Equipos: { icono: "recursos", clase: "cyan" }
};

const DIAS_SEMANA = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

// Franjas usadas por el filtro "Hora". Cada opción cubre una hora completa y
// se compara contra las reservas reales de todos los usuarios.
const HORAS_FILTRO = [
    { value: "Cualquier hora", etiqueta: "Cualquier hora", inicio: "", fin: "" },
    { value: "08:00", etiqueta: "8:00 a. m.", inicio: "08:00", fin: "09:00" },
    { value: "10:00", etiqueta: "10:00 a. m.", inicio: "10:00", fin: "11:00" },
    { value: "12:00", etiqueta: "12:00 p. m.", inicio: "12:00", fin: "13:00" },
    { value: "14:00", etiqueta: "2:00 p. m.", inicio: "14:00", fin: "15:00" },
    { value: "16:00", etiqueta: "4:00 p. m.", inicio: "16:00", fin: "17:00" }
];

const ESTADO_CLASE = {
    Confirmada: "confirmed",
    Pendiente: "pending",
    Cancelada: "finished"
};

// La columna `estado` de la BD usa los mismos valores que `disponibilidad`
// (`Disponible`, `Ocupada`, `Mantenimiento`), no el `Activo` de los datos demo.
// Por eso la disponibilidad es el criterio para habilitar una reserva.
function esReservable(recurso) {
    if (!recurso) return false;
    const estado = String(recurso.estado || "").trim().toLowerCase();
    const disponibilidad = String(recurso.disponibilidad || "").trim().toLowerCase();
    if (estado === "inactivo" || estado.includes("mantenimiento")) return false;
    return disponibilidad === "disponible";
}

function formatearHora(hora24) {
    if (!hora24) return "";
    const [hora, minuto] = hora24.split(":").map(Number);
    const periodo = hora >= 12 ? "p.m." : "a.m.";
    const hora12 = hora % 12 || 12;
    return `${hora12}:${String(minuto).padStart(2, "0")} ${periodo}`;
}

function Reservas() {
    const { user } = useAuth();
    const toast = useToast();
    const [query, setQuery] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [tipo, setTipo] = useState("Todos");
    const [fecha, setFecha] = useState("");
    const [hora, setHora] = useState("Cualquier hora");
    const [recursos, setRecursos] = useState([]);
    const [cargandoRecursos, setCargandoRecursos] = useState(true);
    const [recursoSeleccionado, setRecursoSeleccionado] = useState(null);
    const [misReservas, setMisReservas] = useState([]);
    const [cargandoReservas, setCargandoReservas] = useState(true);
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
    // Reservas de cualquier usuario para la fecha del filtro. Se guarda junto
    // con la fecha consultada para no aplicar datos de un día anterior.
    const [ocupados, setOcupados] = useState({ fecha: "", items: [] });
    const [refrescoOcupados, setRefrescoOcupados] = useState(0);

    const cargarRecursos = useCallback(async () => {
        try {
            const data = await resourcesApi.list();
            setRecursos(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error(err.message || "No se pudieron cargar los recursos.");
            setRecursos([]);
        } finally {
            setCargandoRecursos(false);
        }
    }, [toast]);

    const cargarReservas = useCallback(async () => {
        try {
            const data = await reservationsApi.list();
            setMisReservas(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error(err.message || "No se pudieron cargar las reservas.");
            setMisReservas([]);
        } finally {
            setCargandoReservas(false);
        }
    }, [toast]);

    useEffect(() => {
        // Se difiere al microtask para no ejecutar setState durante el efecto.
        let activo = true;
        Promise.resolve().then(() => {
            if (!activo) return;
            cargarRecursos();
            cargarReservas();
        });
        return () => {
            activo = false;
        };
    }, [cargarRecursos, cargarReservas]);

    useEffect(() => {
        if (!fecha) return undefined;
        let activo = true;
        reservationsApi
            .ocupados({ fecha })
            .then((items) => {
                if (activo) setOcupados({ fecha, items });
            })
            .catch(() => {
                if (activo) setOcupados({ fecha, items: [] });
            });
        return () => {
            activo = false;
        };
    }, [fecha, refrescoOcupados]);

    const hoy = new Date();
    const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

    // Todos los recursos reservables, sin los filtros de la vista. El modal los
    // usa para poder reservar aunque la búsqueda o el filtro no muestren nada.
    const reservables = useMemo(() => recursos.filter(esReservable), [recursos]);

    // Reservas conocidas para una fecha: las ocupaciones globales del backend
    // más las propias (por si se acaba de crear una y aún no se recargó).
    const reservasDelDia = useMemo(() => {
        const propias = misReservas
            .filter((r) => r.fecha === fecha && r.estado !== "Cancelada")
            .map((r) => ({
                recursoId: r.recursoId,
                horaInicio: r.horaInicio,
                horaFin: r.horaFin
            }));
        const otras = ocupados.fecha === fecha ? ocupados.items : [];
        return [...otras, ...propias];
    }, [misReservas, ocupados, fecha]);

    const franjaHoraria = useMemo(
        () => HORAS_FILTRO.find((h) => h.value === hora) || HORAS_FILTRO[0],
        [hora]
    );

    // Mismas reservas, pero para la fecha que se está diligenciando en el modal.
    const reservasParaFormulario = useMemo(() => {
        const propias = misReservas
            .filter((r) => r.fecha === form.fecha && r.estado !== "Cancelada")
            .map((r) => ({
                recursoId: r.recursoId,
                horaInicio: r.horaInicio,
                horaFin: r.horaFin
            }));
        const otras = ocupados.fecha === form.fecha ? ocupados.items : [];
        return [...otras, ...propias];
    }, [misReservas, ocupados, form.fecha]);

    const disponibles = useMemo(() => {
        return reservables
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
            })
            .filter((recurso) => {
                if (!fecha) return true;
                const delRecurso = reservasDelDia.filter(
                    (r) => r.recursoId === recurso.id
                );
                if (!franjaHoraria.inicio) return delRecurso.length === 0;
                return !delRecurso.some(
                    (r) =>
                        franjaHoraria.inicio < r.horaFin &&
                        r.horaInicio < franjaHoraria.fin
                );
            });
    }, [busqueda, tipo, fecha, reservables, reservasDelDia, franjaHoraria]);

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
            const conflicto = reservasParaFormulario.find((reserva) => {
                if (reserva.recursoId !== recursoSeleccionado.id) return false;
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
        const objetivo = recurso ?? reservables[0] ?? null;
        if (!objetivo) {
            toast.error("No hay recursos disponibles para reservar en este momento.");
            return;
        }
        setRecursoSeleccionado(objetivo);
        setConfirmacion("");
        setErrores({});
        setForm({ fecha: hoyStr, horaInicio: "", horaFin: "", proposito: "" });
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setRecursoSeleccionado(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!recursoSeleccionado) {
            setErrores({ conflicto: "Selecciona un espacio o recurso para reservar." });
            return;
        }
        if (!validarFormulario()) return;

        try {
            await reservationsApi.create({
                recursoId: recursoSeleccionado.id,
                fecha: form.fecha,
                horaInicio: form.horaInicio,
                horaFin: form.horaFin,
                motivo: form.proposito,
                estado: "Pendiente"
            });
            await cargarReservas();
            setRefrescoOcupados((n) => n + 1);
            setConfirmacion(
                `Reserva de "${recursoSeleccionado.nombre}" registrada correctamente.`
            );
            setErrores({});
        } catch (err) {
            setErrores({ conflicto: err.message || "No se pudo registrar la reserva." });
        }
    };

    const cancelarReserva = async (id) => {
        if (!window.confirm("¿Estás seguro de que deseas cancelar esta reserva?")) return;
        const reserva = misReservas.find((r) => r.id === id);
        if (!reserva) return;
        try {
            await reservationsApi.update(id, { ...reserva, estado: "Cancelada" });
            await cargarReservas();
            setRefrescoOcupados((n) => n + 1);
        } catch (err) {
            toast.error(err.message || "No se pudo cancelar la reserva.");
        }
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
    }, [recursos]);

    const fechaReferencia = new Date(`${fecha || hoyStr}T00:00:00`);
    const inicioSemana = new Date(fechaReferencia);
    inicioSemana.setDate(fechaReferencia.getDate() - fechaReferencia.getDay() + 1);

    const misReservasFiltradas = useMemo(() => {
        if (!user) return misReservas;
        return misReservas.filter(
            (r) => r.usuarioId === user.id || r.usuarioId == null
        );
    }, [misReservas, user]);

    // Ordenar por fecha descendente (más recientes primero) y paginar 10 por página
    const misReservasOrdenadas = useMemo(
        () =>
            [...misReservasFiltradas].sort(
                (a, b) =>
                    new Date(b.fecha + "T" + (b.horaInicio || "00:00")) -
                    new Date(a.fecha + "T" + (a.horaInicio || "00:00"))
            ),
        [misReservasFiltradas]
    );

    const {
        pagina: paginaReservas,
        setPagina: setPaginaReservas,
        totalPaginas: totalPaginasReservas,
        itemsPagina: itemsPaginaReservas,
        desde: desdeReservas,
        hasta: hastaReservas
    } = usePagination(misReservasOrdenadas, 10);

    return (
        <div className="page">
            <div className="page__header">
                <div className="page__title">
                    <p>Reserva espacios y recursos disponibles del campus.</p>
                </div>

                <button
                    type="button"
                    className="reservas__new-button"
                    onClick={() => abrirModal()}
                    disabled={cargandoRecursos}
                >
                    <Icon name="reservas" size={15} />
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
                            description=""
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
                            {HORAS_FILTRO.map((opcion) => (
                                <option key={opcion.value} value={opcion.value}>
                                    {opcion.etiqueta}
                                </option>
                            ))}
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
                {cargandoRecursos ? (
                    <div className="empty">Cargando recursos disponibles...</div>
                ) : disponibles.length > 0 ? (
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
                                        {esEscenario(recurso) ? "Reservar espacio" : "Solicitar equipo"}
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
                    {misReservasOrdenadas.length > 0 && (
                        <span className="dashboard__card-view">
                            {desdeReservas}–{hastaReservas} de {misReservasOrdenadas.length} reservas
                        </span>
                    )}
                </div>

                {cargandoReservas ? (
                    <div className="empty">Cargando reservas...</div>
                ) : misReservasOrdenadas.length === 0 ? (
                    <div className="empty">Aún no tienes reservas.</div>
                ) : (
                    <>
                        {itemsPaginaReservas.map((reserva) => {
                            const fechaReserva = new Date(reserva.fecha + "T00:00:00");
                            const hoyMedianoche = new Date(hoyStr + "T00:00:00");
                            const esPasada = fechaReserva < hoyMedianoche;
                            return (
                                <div
                                    className={`reservas__reservation${esPasada ? " reservas__reservation--past" : ""}`}
                                    key={reserva.id}
                                >
                                    <div className="reservas__reservation-icon">
                                        <Icon name={reserva.recurso.includes("Laboratorio") ? "recursos" : "reservas"} size={17} />
                                    </div>

                                    <div className="reservas__reservation-info">
                                        <div className="reservas__reservation-name">{reserva.recurso}</div>
                                        <div className="reservas__reservation-details">
                                            <span>
                                                <Icon name="reservas" size={10} />
                                                {fechaReserva.toLocaleDateString("es-CO", {
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

                                    {!esPasada && reserva.estado !== "Cancelada" && (
                                        <div className="reservas__reservation-actions">
                                            <button
                                                type="button"
                                                className="reservas__action-button reservas__action-button--delete"
                                                title="Cancelar reserva"
                                                onClick={() => cancelarReserva(reserva.id)}
                                            >
                                                <Icon name="eventos" size={13} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <Pagination
                            pagina={paginaReservas}
                            totalPaginas={totalPaginasReservas}
                            onChange={setPaginaReservas}
                            desde={desdeReservas}
                            hasta={hastaReservas}
                            total={misReservasOrdenadas.length}
                        />
                    </>
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

                        const reservasDia = misReservasFiltradas.filter(
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
                                value={recursoSeleccionado?.id ?? ""}
                                onChange={(e) => {
                                    const recurso = reservables.find(
                                        (r) => String(r.id) === e.target.value
                                    );
                                    if (recurso) {
                                        setRecursoSeleccionado(recurso);
                                        setErrores((prev) => ({ ...prev, conflicto: "" }));
                                    }
                                }}
                            >
                                {!recursoSeleccionado && (
                                    <option value="" disabled>
                                        Selecciona un recurso
                                    </option>
                                )}
                                {reservables.map((recurso) => (
                                    <option key={recurso.id} value={recurso.id}>
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
