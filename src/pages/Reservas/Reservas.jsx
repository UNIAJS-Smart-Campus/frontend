import { useState } from "react";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Modal from "../../components/Modal/Modal";
import DataTable from "../../components/DataTable/DataTable";
import Pagination from "../../components/Pagination/Pagination";
import useSearch from "../../hooks/useSearch";
import usePagination from "../../hooks/usePagination";
import SearchBar from "../../components/SearchBar/SearchBar";
import useAuth from "../../context/useAuth";
import recursos, { TIPOS_RECURSO } from "../../utils/recursos";
import "./Reservas.css";

function Reservas() {
    const [filtro, setFiltro] = useState("Todos");
    const [query, setQuery] = useState("");
    const [recursoSeleccionado, setRecursoSeleccionado] = useState(null);
    const [misReservas, setMisReservas] = useState([]);

    const [form, setForm] = useState({
        fecha: "",
        horaInicio: "",
        horaFin: "",
        proposito: ""
    });

    const [errores, setErrores] = useState({});
    const [confirmacion, setConfirmacion] = useState("");

    const { puede } = useAuth();
    const puedeGestionar = puede("gestionar_reservas");

    const filtradosPorTexto = useSearch(
        recursos,
        query,
        ["nombre", "tipo", "ubicacion"]
    );

    const filtrados = filtro === "Todos"
        ? filtradosPorTexto
        : filtradosPorTexto.filter((recurso) => recurso.tipo === filtro);

    const { pagina, setPagina, totalPaginas, itemsPagina, desde, hasta } =
        usePagination(filtrados, 10);

    const formatearHora = (hora24) => {
        if (!hora24) return "";
        const [hora, minuto] = hora24.split(":").map(Number);
        const periodo = hora >= 12 ? "p.m." : "a.m.";
        const hora12 = hora % 12 || 12;
        return `${hora12}:${String(minuto).padStart(2, "0")} ${periodo}`;
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!form.fecha) {
            nuevosErrores.fecha = "La fecha es obligatoria.";
        } else {
            const hoy = new Date();
            const fechaSeleccionada = new Date(form.fecha + "T00:00:00");
            if (fechaSeleccionada < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())) {
                nuevosErrores.fecha = "No puedes reservar en una fecha pasada.";
            }
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
                if (reserva.recurso !== recursoSeleccionado.nombre) {
                    return false;
                }

                if (reserva.fecha !== form.fecha) {
                    return false;
                }

                const inicioNuevo = form.horaInicio;
                const finNuevo = form.horaFin;
                const inicioExistente = reserva.horaInicio;
                const finExistente = reserva.horaFin;

                return inicioNuevo < finExistente && inicioExistente < finNuevo;
            });

            if (conflicto) {
                nuevosErrores.conflicto = `Este recurso ya está reservado en la fecha y horario seleccionados (${formatearHora(conflicto.horaInicio)} - ${formatearHora(conflicto.horaFin)}).`;
            }
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const openModal = (recurso) => {
        setRecursoSeleccionado(recurso);
        setConfirmacion("");
        setForm({ fecha: "", horaInicio: "", horaFin: "", proposito: "" });
        setErrores({});
    };

    const hoy = new Date().toISOString().split("T")[0];

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrores((prev) => ({ ...prev, [e.target.name]: "", conflicto: "" }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        const nueva = {
            id: `RES-${Date.now()}`,
            recurso: recursoSeleccionado.nombre,
            ...form
        };

        setMisReservas([nueva, ...misReservas]);
        setConfirmacion(
            `Reserva de "${recursoSeleccionado.nombre}" registrada correctamente.`
        );
        setErrores({});
    };

    const cancelarReserva = (id) => {
        setMisReservas((prev) => prev.filter((reserva) => reserva.id !== id));
    };

    return (
        <div className="reservas">
                <div className="reservas__search">
                    <SearchBar
                        placeholder="Buscar recurso por nombre, tipo o ubicación…"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPagina(1);
                        }}
                        id="reservas-search"
                    />
                </div>

            <div className="reservas__filters">
                {["Todos", ...TIPOS_RECURSO].map((tipo) => (
                    <button
                        key={tipo}
                        className={
                            filtro === tipo
                                ? "reservas__filter reservas__filter--active"
                                : "reservas__filter"
                        }
                        onClick={() => {
                            setFiltro(tipo);
                            setPagina(1);
                        }}
                    >
                        {tipo}
                    </button>
                ))}
            </div>

            <DataTable
                columns={[
                    { label: "Recurso", key: "nombre", strong: true },
                    { label: "Tipo", key: "tipo" },
                    { label: "Capacidad", key: "capacidad" },
                    { label: "Ubicación", key: "ubicacion" },
                    {
                        label: "Disponibilidad",
                        render: (recurso) => (
                            <span
                                className={
                                    recurso.disponibilidad === "Disponible"
                                        ? "reservas__disponible"
                                        : "reservas__ocupado"
                                }
                            >
                                {recurso.disponibilidad}
                            </span>
                        )
                    },
                    {
                        label: "Acciones",
                        render: (recurso) => {
                            const disponible =
                                recurso.disponibilidad === "Disponible";

                            return (
                                <Button
                                    variant={disponible ? "primary" : "ghost"}
                                    size="sm"
                                    disabled={!disponible}
                                    onClick={() => openModal(recurso)}
                                >
                                    {disponible ? "Reservar" : "No disponible"}
                                </Button>
                            );
                        }
                    }
                ]}
                rows={itemsPagina}
                emptyMessage="No se encontraron recursos para la búsqueda aplicada."
            />

            <Pagination
                pagina={pagina}
                totalPaginas={totalPaginas}
                onChange={setPagina}
                desde={desde}
                hasta={hasta}
                total={filtrados.length}
            />

            {misReservas.length > 0 && (
                <section className="reservas__mis">
                    <h2 className="reservas__mis-title">Mis reservas</h2>

                    <div className="reservas__mis-list">
                        {misReservas.map((reserva) => (
                            <article className="reservas__mis-item" key={reserva.id}>
                                <div className="reservas__mis-top">
                                    <strong>{reserva.recurso}</strong>

                                    {puedeGestionar && (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() =>
                                                cancelarReserva(reserva.id)
                                            }
                                        >
                                            Cancelar
                                        </Button>
                                    )}
                                </div>

                                <span>
                                    {reserva.fecha} ·{" "}
                                    {formatearHora(reserva.horaInicio)} –{" "}
                                    {formatearHora(reserva.horaFin)}
                                </span>
                                <p>{reserva.proposito}</p>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            <Modal
                isOpen={recursoSeleccionado !== null}
                title={`Reservar ${recursoSeleccionado?.nombre ?? ""}`}
                onClose={() => setRecursoSeleccionado(null)}
            >
                {confirmacion ? (
                    <div className="reservas__confirm">
                        <p>{confirmacion}</p>
                        <Button
                            variant="primary"
                            onClick={() => setRecursoSeleccionado(null)}
                        >
                            Cerrar
                        </Button>
                    </div>
                ) : (
                    <form className="reservas__form" onSubmit={handleSubmit}>
                        <Input
                            label="Fecha"
                            type="date"
                            name="fecha"
                            value={form.fecha}
                            onChange={handleChange}
                            id="reserva-fecha"
                            min={hoy}
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

                        <Button
                            variant="primary"
                            type="submit"
                            disabled={
                                !form.fecha || !form.horaInicio || !form.horaFin
                            }
                        >
                            Registrar reserva
                        </Button>
                    </form>
                )}
            </Modal>
        </div>
    );
}

export default Reservas;