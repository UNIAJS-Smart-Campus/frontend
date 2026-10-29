import { useState, useMemo } from "react";
import Icon from "../../components/Icon/Icon";
import ImagenCategoria from "../../components/ImagenCategoria/ImagenCategoria";
import Modal from "../../components/Modal/Modal";
import Input from "../../components/Input/Input";
import SearchBar from "../../components/SearchBar/SearchBar";
import Pagination from "../../components/Pagination/Pagination";
import useAuth from "../../context/useAuth";
import usePagination from "../../hooks/usePagination";
import useColeccion from "../../hooks/useColeccion";
import useSugerencias from "../../hooks/useSugerencias";
import { CLAVE_RECURSO, TIPOS_RECURSO, esEscenario, esReservable } from "../../utils/recursos";
import {
    CLAVE_RESERVAS,
    crearReserva,
    cancelarReserva as cancelarReservaEnApi,
    mismoRecurso
} from "../../utils/reservas";
import { useToast } from "../../context/ToastContext";
import "./Reservas.css";

const TIPO_VARIANT = {
    Salas: { icono: "reservas", clase: "blue" },
    Laboratorios: { icono: "recursos", clase: "green" },
    Auditorios: { icono: "eventos", clase: "purple" },
    Equipos: { icono: "recursos", clase: "cyan" }
};

const DIAS_SEMANA = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

const ESTADO_CLASE = {
    Confirmada: "confirmed",
    Pendiente: "pending",
    Cancelada: "finished"
};

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
    const { items: recursos, enLinea: enLineaRecursos, recargar: recargarRecursos } =
        useColeccion(CLAVE_RECURSO);
    const { items: misReservas, enLinea, recargar } = useColeccion(CLAVE_RESERVAS);

    const [query, setQuery] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [tipo, setTipo] = useState("Todos");
    const [fecha, setFecha] = useState("");
    const [hora, setHora] = useState("Cualquier hora");
    const [recursoSeleccionado, setRecursoSeleccionado] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [form, setForm] = useState({
        fecha: "",
        hora_inicio: "",
        hora_fin: "",
        motivo: ""
    });
    const [errores, setErrores] = useState({});
    const [confirmacion, setConfirmacion] = useState("");
    const [busquedaAlerta, setBusquedaAlerta] = useState(false);

    const hoy = new Date();
    const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

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
            })
            .filter((recurso) => {
                if (!fecha) return true;
                const tieneReserva = misReservas.some(
                    (r) =>
                        mismoRecurso(r, recurso) &&
                        r.fecha === fecha &&
                        r.estado !== "Cancelada"
                );
                return !tieneReserva;
            });
    }, [busqueda, tipo, fecha, misReservas, recursos]);

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

        if (!form.hora_inicio) {
            nuevosErrores.hora_inicio = "La hora de inicio es obligatoria.";
        } else if (form.hora_inicio < "07:00" || form.hora_inicio > "21:00") {
            nuevosErrores.hora_inicio = "El horario permitido es de 7:00 a.m. a 9:00 p.m.";
        }

        if (!form.hora_fin) {
            nuevosErrores.hora_fin = "La hora de finalización es obligatoria.";
        } else if (form.hora_fin < "07:00" || form.hora_fin > "21:00") {
            nuevosErrores.hora_fin = "El horario permitido es de 7:00 a.m. a 9:00 p.m.";
        }

        if (form.hora_inicio && form.hora_fin && form.hora_inicio >= form.hora_fin) {
            nuevosErrores.hora_fin = "La hora de fin debe ser posterior a la hora de inicio.";
        }

        if (Object.keys(nuevosErrores).length === 0 && recursoSeleccionado) {
            const conflicto = misReservas.find((reserva) => {
                if (!mismoRecurso(reserva, recursoSeleccionado)) return false;
                if (reserva.fecha !== form.fecha) return false;
                if (reserva.estado === "Cancelada") return false;
                return (
                    form.hora_inicio < reserva.hora_fin &&
                    reserva.hora_inicio < form.hora_fin
                );
            });

            if (conflicto) {
                nuevosErrores.conflicto = `Este recurso ya está reservado en la fecha y horario seleccionados (${formatearHora(conflicto.hora_inicio)} - ${formatearHora(conflicto.hora_fin)}).`;
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
        setForm({ fecha: "", hora_inicio: "", hora_fin: "", motivo: "" });
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setRecursoSeleccionado(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;

        if (!user?.id) {
            toast.warning("Inicia sesión para registrar una reserva.");
            return;
        }

        if (!recursoSeleccionado) {
            setErrores({ conflicto: "Selecciona un recurso para reservar." });
            return;
        }

        const nueva = {
            id_usuario: user.id,
            id_recurso: recursoSeleccionado.id,
            recurso: recursoSeleccionado.nombre,
            tipo_recurso: recursoSeleccionado.tipo ?? "",
            usuario: user.nombre ?? "",
            fecha: form.fecha,
            hora_inicio: form.hora_inicio,
            hora_fin: form.hora_fin,
            motivo: form.motivo,
            observaciones: "",
            estado: "Pendiente"
        };

        try {
            await crearReserva(nueva);
            setConfirmacion(
                `Reserva de "${recursoSeleccionado.nombre}" registrada correctamente.`
            );
            setErrores({});
        } catch (fallo) {
            toast.error(fallo?.message || "No se pudo registrar la reserva.");
        }
    };

    const cancelarReserva = async (reserva) => {
        if (!window.confirm("¿Estás seguro de que deseas cancelar esta reserva?")) return;
        try {
            await cancelarReservaEnApi(reserva);
            toast.info("Reserva cancelada.");
        } catch (fallo) {
            toast.error(fallo?.message || "No se pudo cancelar la reserva.");
        }
    };

    const buscarRecursos = () => {
        setBusqueda(query);
        setBusquedaAlerta(true);
    };

    // Las sugerencias de Reservas son los recursos; se consultan al índice
    // RECURSOS de Elasticsearch con respaldo local.
    const sugerenciasLocales = useMemo(() => {
        return [
            ...new Set(
                recursos
                    .flatMap((r) => [r.nombre, r.tipo, r.ubicacion, r.codigo])
                    .filter(Boolean)
            )
        ];
    }, [recursos]);
    const sugerencias = useSugerencias(query, "RECURSOS", sugerenciasLocales);

    const fechaReferencia = new Date(`${fecha || hoyStr}T00:00:00`);
    const inicioSemana = new Date(fechaReferencia);
    inicioSemana.setDate(fechaReferencia.getDate() - fechaReferencia.getDay() + 1);

    const misReservasFiltradas = useMemo(() => {
        if (!user) return misReservas;
        return misReservas.filter(
            (r) => r.id_usuario === user.id || r.id_usuario == null
        );
    }, [misReservas, user]);

    // Ordenar por fecha descendente (más recientes primero) y paginar 10 por página
    const misReservasOrdenadas = useMemo(
        () =>
            [...misReservasFiltradas].sort(
                (a, b) =>
                    new Date(b.fecha + "T" + (b.hora_inicio || "00:00")) -
                    new Date(a.fecha + "T" + (a.hora_inicio || "00:00"))
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
            </div>

            {(enLinea === false || enLineaRecursos === false) && (
                <div className="toast toast--error">
                    <Icon name="info" size={14} />
                    Sin conexión con el servidor: se muestra la última data sincronizada.
                    <button
                        className="button button--ghost button--sm"
                        onClick={() => {
                            recargar();
                            recargarRecursos();
                        }}
                    >
                        Reintentar
                    </button>
                </div>
            )}

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
                            serverSide
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
                            {TIPOS_RECURSO.map((valor) => (
                                <option key={valor}>{valor}</option>
                            ))}
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
                                    <ImagenCategoria grupo="recurso" tipo={recurso.tipo} semilla={recurso.id} />
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

                {misReservasOrdenadas.length === 0 ? (
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
                                        <Icon
                                            name={
                                                reserva.tipo_recurso === "Laboratorios"
                                                    ? "recursos"
                                                    : "reservas"
                                            }
                                            size={17}
                                        />
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
                                                {formatearHora(reserva.hora_inicio)} - {formatearHora(reserva.hora_fin)}
                                            </span>
                                            <span>
                                                <Icon name="solicitudes" size={10} />
                                                {reserva.motivo}
                                            </span>
                                        </div>
                                    </div>

                                    <span className={`reservas__reservation-status ${ESTADO_CLASE[reserva.estado] || "pending"}`}>
                                        {String(reserva.estado || "").toUpperCase()}
                                    </span>

                                    {!esPasada && reserva.estado !== "Cancelada" && (
                                        <div className="reservas__reservation-actions">
                                            <button
                                                type="button"
                                                className="reservas__action-button reservas__action-button--delete"
                                                title="Cancelar reserva"
                                                onClick={() => cancelarReserva(reserva)}
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
                                        className={`reservas__calendar-event${r.tipo_recurso === "Laboratorios" ? " reservas__calendar-event--green" : r.tipo_recurso === "Auditorios" ? " reservas__calendar-event--purple" : ""}`}
                                        key={r.id}
                                    >
                                        {r.recurso}
                                        <br />
                                        {formatearHora(r.hora_inicio)} - {formatearHora(r.hora_fin)}
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
                                    name="hora_inicio"
                                    value={form.hora_inicio}
                                    onChange={handleChange}
                                    id="reserva-inicio"
                                />
                                {errores.hora_inicio && (
                                    <span className="reservas__error">{errores.hora_inicio}</span>
                                )}
                            </div>

                            <div>
                                <Input
                                    label="Hora fin"
                                    type="time"
                                    name="hora_fin"
                                    value={form.hora_fin}
                                    onChange={handleChange}
                                    id="reserva-fin"
                                />
                                {errores.hora_fin && (
                                    <span className="reservas__error">{errores.hora_fin}</span>
                                )}
                            </div>
                        </div>

                        <Input
                            label="Propósito"
                            type="text"
                            name="motivo"
                            placeholder="Describe el propósito de la reserva"
                            value={form.motivo}
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
                                disabled={!form.fecha || !form.hora_inicio || !form.hora_fin}
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
