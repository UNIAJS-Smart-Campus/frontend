import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Icon from "../../components/Icon/Icon";
import Input from "../../components/Input/Input";
import useAuth from "../../context/useAuth";
import { useToast } from "../../context/ToastContext";
import useColeccion from "../../hooks/useColeccion";
import { CLAVE_RECURSO, esReservable } from "../../utils/recursos";
import {
    CLAVE_RESERVAS,
    crearReserva,
    mismoRecurso
} from "../../utils/reservas";
import "./Reservas.css";
import "./NuevaReserva.css";

function formatearHora(hora24) {
    if (!hora24) return "";
    const [hora, minuto] = hora24.split(":").map(Number);
    const periodo = hora >= 12 ? "p.m." : "a.m.";
    const hora12 = hora % 12 || 12;
    return `${hora12}:${String(minuto).padStart(2, "0")} ${periodo}`;
}

function fechaDeHoy() {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(
        hoy.getDate()
    ).padStart(2, "0")}`;
}

/**
 * Módulo (página completa) para reservar un espacio o equipo.
 * Antes era un modal en /reservas; ahora vive en /reservas/nueva y acepta
 * ?recurso=<id> para llegar con el recurso ya elegido desde una tarjeta.
 */
function NuevaReserva() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [searchParams] = useSearchParams();

    const { items: recursos } = useColeccion(CLAVE_RECURSO);
    const { items: misReservas } = useColeccion(CLAVE_RESERVAS);

    const hoyStr = useMemo(() => fechaDeHoy(), []);

    const disponibles = useMemo(
        () => recursos.filter(esReservable),
        [recursos]
    );

    // Recurso preseleccionado por la tarjeta (?recurso=ID).
    const [recursoId, setRecursoId] = useState(() => {
        const id = searchParams.get("recurso");
        return id && disponibles.some((r) => String(r.id) === String(id)) ? String(id) : "";
    });

    const [form, setForm] = useState({
        fecha: "",
        hora_inicio: "",
        hora_fin: "",
        motivo: ""
    });
    const [errores, setErrores] = useState({});
    const [enviando, setEnviando] = useState(false);

    const recursoSeleccionado = useMemo(
        () => disponibles.find((r) => String(r.id) === recursoId) || null,
        [disponibles, recursoId]
    );

    // Reservas del recurso en la fecha elegida, para mostrar los horarios
    // ya ocupados antes de enviar.
    const ocupados = useMemo(() => {
        if (!recursoSeleccionado || !form.fecha) return [];
        return misReservas
            .filter(
                (r) =>
                    mismoRecurso(r, recursoSeleccionado) &&
                    r.fecha === form.fecha &&
                    r.estado !== "Cancelada"
            )
            .sort((a, b) => String(a.hora_inicio).localeCompare(String(b.hora_inicio)));
    }, [misReservas, recursoSeleccionado, form.fecha]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errores[name]) {
            setErrores((prev) => ({ ...prev, [name]: "", conflicto: "" }));
        }
    };

    const validar = () => {
        const nuevos = {};

        if (!recursoSeleccionado) {
            nuevos.recurso = "Selecciona un espacio o recurso.";
        }

        if (!form.fecha) {
            nuevos.fecha = "La fecha es obligatoria.";
        } else if (form.fecha < hoyStr) {
            nuevos.fecha = "No puedes reservar en una fecha pasada.";
        }

        if (!form.hora_inicio) {
            nuevos.hora_inicio = "La hora de inicio es obligatoria.";
        } else if (form.hora_inicio < "07:00" || form.hora_inicio > "21:00") {
            nuevos.hora_inicio = "El horario permitido es de 7:00 a.m. a 9:00 p.m.";
        }

        if (!form.hora_fin) {
            nuevos.hora_fin = "La hora de finalización es obligatoria.";
        } else if (form.hora_fin < "07:00" || form.hora_fin > "21:00") {
            nuevos.hora_fin = "El horario permitido es de 7:00 a.m. a 9:00 p.m.";
        }

        if (
            form.hora_inicio &&
            form.hora_fin &&
            form.hora_inicio >= form.hora_fin
        ) {
            nuevos.hora_fin = "La hora de fin debe ser posterior a la hora de inicio.";
        }

        if (
            Object.keys(nuevos).length === 0 &&
            recursoSeleccionado &&
            form.fecha &&
            form.hora_inicio &&
            form.hora_fin
        ) {
            const conflicto = ocupados.find(
                (reserva) =>
                    form.hora_inicio < reserva.hora_fin &&
                    reserva.hora_inicio < form.hora_fin
            );
            if (conflicto) {
                nuevos.conflicto = `Este recurso ya está reservado en la fecha y horario seleccionados (${formatearHora(
                    conflicto.hora_inicio
                )} - ${formatearHora(conflicto.hora_fin)}).`;
            }
        }

        setErrores(nuevos);
        return Object.keys(nuevos).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validar()) return;

        if (!user?.id) {
            toast.warning("Inicia sesión para registrar una reserva.");
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

        setEnviando(true);
        try {
            await crearReserva(nueva);
            toast.success(
                `Reserva de "${recursoSeleccionado.nombre}" registrada correctamente.`
            );
            navigate("/reservas");
        } catch (fallo) {
            toast.error(fallo?.message || "No se pudo registrar la reserva.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="nueva-reserva">
            <Link to="/reservas" className="nueva-reserva__back">
                ← Volver a reservas
            </Link>

            <header className="nueva-reserva__header">
                <h1>Reservar espacio</h1>
                <p>
                    Elige un espacio o equipo disponible, la fecha y el horario.
                    Quedará a nombre de{" "}
                    <strong>
                        {[user?.nombre, user?.apellido].filter(Boolean).join(" ") ||
                            "tu usuario"}
                    </strong>
                    .
                </p>
            </header>

            <form className="nueva-reserva__form" onSubmit={handleSubmit} noValidate>
                <div className="reservas__modal-group">
                    <label htmlFor="reserva-recurso">Espacio o recurso *</label>
                    <select
                        id="reserva-recurso"
                        className="reservas__filter-select"
                        value={recursoId}
                        onChange={(e) => {
                            setRecursoId(e.target.value);
                            setErrores((prev) => ({ ...prev, recurso: "", conflicto: "" }));
                        }}
                    >
                        <option value="">Selecciona un espacio o equipo…</option>
                        {disponibles.map((recurso) => (
                            <option key={recurso.id} value={String(recurso.id)}>
                                {recurso.nombre} — {recurso.tipo}
                                {recurso.ubicacion ? ` · ${recurso.ubicacion}` : ""}
                            </option>
                        ))}
                    </select>
                    {errores.recurso && (
                        <span className="reservas__error">{errores.recurso}</span>
                    )}
                    {!disponibles.length && (
                        <span className="nueva-reserva__hint">
                            No hay recursos disponibles en este momento.
                        </span>
                    )}
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

                {ocupados.length > 0 && (
                    <div className="nueva-reserva__ocupados">
                        <span className="nueva-reserva__ocupados-titulo">
                            Horarios ya reservados ese día:
                        </span>
                        {ocupados.map((r) => (
                            <span className="nueva-reserva__chip" key={r.id}>
                                {formatearHora(r.hora_inicio)} - {formatearHora(r.hora_fin)}
                            </span>
                        ))}
                    </div>
                )}

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

                <div className="nueva-reserva__actions">
                    <Link to="/reservas" className="button button--ghost button--md">
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        className="button button--accent button--md"
                        disabled={enviando || !disponibles.length}
                    >
                        <Icon name="reservas" size={15} />
                        {enviando ? "Registrando…" : "Confirmar reserva"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default NuevaReserva;
