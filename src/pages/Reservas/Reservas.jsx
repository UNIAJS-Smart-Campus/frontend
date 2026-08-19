import { useState } from "react";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Modal from "../../components/Modal/Modal";
import useSearch from "../../hooks/useSearch";
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

    const openModal = (recurso) => {
        setRecursoSeleccionado(recurso);
        setConfirmacion("");
        setForm({ fecha: "", horaInicio: "", horaFin: "", proposito: "" });
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const nueva = {
            id: `RES-${Date.now()}`,
            recurso: recursoSeleccionado.nombre,
            ...form
        };

        setMisReservas([nueva, ...misReservas]);
        setConfirmacion(
            `Reserva de "${recursoSeleccionado.nombre}" registrada correctamente.`
        );
    };

    const cancelarReserva = (id) => {
        setMisReservas((prev) => prev.filter((reserva) => reserva.id !== id));
    };

    return (
        <div className="reservas">
            <header className="reservas__header">
                <h1 className="reservas__title">Reservas</h1>
                <p className="reservas__subtitle">
                    Consulta la disponibilidad de los recursos y registra tu
                    reserva.
                </p>
            </header>

            <div className="reservas__search">
                <Input
                    type="search"
                    placeholder="Buscar recurso por nombre, tipo o ubicación…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
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
                        onClick={() => setFiltro(tipo)}
                    >
                        {tipo}
                    </button>
                ))}
            </div>

            <section className="reservas__grid">
                {filtrados.map((recurso) => {
                    const disponible = recurso.disponibilidad === "Disponible";

                    return (
                        <article className="reservas__card" key={recurso.id}>
                            <div className="reservas__card-top">
                                <span className="reservas__tipo">{recurso.tipo}</span>
                                <span
                                    className={
                                        disponible
                                            ? "reservas__disponible"
                                            : "reservas__ocupado"
                                    }
                                >
                                    {recurso.disponibilidad}
                                </span>
                            </div>

                            <h2 className="reservas__nombre">{recurso.nombre}</h2>

                            <p className="reservas__capacidad">
                                Capacidad: {recurso.capacidad}
                            </p>

                            <Button
                                variant={disponible ? "primary" : "ghost"}
                                disabled={!disponible}
                                onClick={() => openModal(recurso)}
                            >
                                {disponible ? "Reservar" : "No disponible"}
                            </Button>
                        </article>
                    );
                })}
            </section>

            {filtrados.length === 0 && (
                <p className="reservas__empty">
                    No se encontraron recursos para «{query}».
                </p>
            )}

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
                                    {reserva.fecha} · {reserva.horaInicio} –{" "}
                                    {reserva.horaFin}
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
                        />

                        <div className="reservas__form-row">
                            <Input
                                label="Hora inicio"
                                type="time"
                                name="horaInicio"
                                value={form.horaInicio}
                                onChange={handleChange}
                                id="reserva-inicio"
                            />

                            <Input
                                label="Hora fin"
                                type="time"
                                name="horaFin"
                                value={form.horaFin}
                                onChange={handleChange}
                                id="reserva-fin"
                            />
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