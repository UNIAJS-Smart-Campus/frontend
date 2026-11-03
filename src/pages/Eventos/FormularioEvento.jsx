import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Icon from "../../components/Icon/Icon";
import useAuth from "../../context/useAuth";
import { useToast } from "../../context/ToastContext";
import useColeccion from "../../hooks/useColeccion";
import {
    CLAVE_EVENTOS,
    CATEGORIAS_EVENTO,
    ESTADOS_EVENTO,
    crearEvento,
    actualizarEvento
} from "../../utils/eventos";
import "./Eventos.css";
import "./FormularioEvento.css";

const formVacio = {
    nombre: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    ubicacion: "",
    tipo: "Académico",
    descripcion: "",
    cupo: 0,
    estado: "Programado"
};

function datosDe(evento) {
    return {
        nombre: evento.nombre ?? "",
        fecha: evento.fecha ?? "",
        hora_inicio: evento.hora_inicio ?? "",
        hora_fin: evento.hora_fin ?? "",
        ubicacion: evento.ubicacion ?? "",
        tipo: evento.tipo ?? "Académico",
        descripcion: evento.descripcion ?? "",
        cupo: evento.cupo ?? 0,
        estado: evento.estado ?? "Programado"
    };
}

/** Formulario con estado inicial derivado de props (se monta con `key`). */
function FormEvento({ inicial, esEdicion, id, actual, items, userId }) {
    const navigate = useNavigate();
    const toast = useToast();

    const [form, setForm] = useState(inicial);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setError("");
        setForm((prev) => ({
            ...prev,
            [name]: name === "cupo" ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const nombreExiste = items.some(
            (item) =>
                String(item.nombre || "").toLowerCase() ===
                    form.nombre.trim().toLowerCase() && String(item.id) !== String(id)
        );
        if (nombreExiste) {
            setError("Ya existe un evento con ese nombre.");
            return;
        }

        setGuardando(true);
        try {
            if (esEdicion) {
                await actualizarEvento(actual, {
                    ...form,
                    nombre: form.nombre.trim()
                });
                toast.success("Evento actualizado correctamente.");
            } else {
                await crearEvento({
                    ...form,
                    nombre: form.nombre.trim(),
                    id_usuario: userId,
                    inscritos: 0
                });
                toast.success("Evento creado correctamente.");
            }
            navigate("/eventos");
        } catch (fallo) {
            const mensaje =
                fallo?.message || "No se pudo guardar el evento en el servidor.";
            setError(mensaje);
            toast.error(mensaje);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <form className="nuevo-evento__form" onSubmit={handleSubmit} noValidate>
            {error && <p className="eventos__error">{error}</p>}

            <div className="eventos__form-group">
                <label htmlFor="ev-nombre">Nombre del evento</label>
                <input
                    id="ev-nombre"
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="ej. Conferencia de inteligencia artificial"
                />
            </div>

            <div className="eventos__form-group">
                <label htmlFor="ev-fecha">Fecha</label>
                <input
                    id="ev-fecha"
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                />
            </div>

            <div className="eventos__form-grid">
                <div className="eventos__form-group">
                    <label htmlFor="ev-hora">Hora de inicio</label>
                    <input
                        id="ev-hora"
                        type="time"
                        name="hora_inicio"
                        value={form.hora_inicio}
                        onChange={handleChange}
                    />
                </div>

                <div className="eventos__form-group">
                    <label htmlFor="ev-hora-fin">Hora de fin</label>
                    <input
                        id="ev-hora-fin"
                        type="time"
                        name="hora_fin"
                        value={form.hora_fin}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="eventos__form-group">
                <label htmlFor="ev-lugar">Lugar</label>
                <input
                    id="ev-lugar"
                    type="text"
                    name="ubicacion"
                    value={form.ubicacion}
                    onChange={handleChange}
                    placeholder="ej. Auditorio principal"
                />
            </div>

            <div className="eventos__form-grid">
                <div className="eventos__form-group">
                    <label htmlFor="ev-categoria">Categoría</label>
                    <select
                        id="ev-categoria"
                        name="tipo"
                        value={form.tipo}
                        onChange={handleChange}
                    >
                        {CATEGORIAS_EVENTO.map((categoria) => (
                            <option key={categoria} value={categoria}>
                                {categoria}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="eventos__form-group">
                    <label htmlFor="ev-estado">Estado</label>
                    <select
                        id="ev-estado"
                        name="estado"
                        value={form.estado}
                        onChange={handleChange}
                    >
                        {ESTADOS_EVENTO.map((estado) => (
                            <option key={estado} value={estado}>
                                {estado}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="eventos__form-grid">
                <div className="eventos__form-group">
                    <label htmlFor="ev-cupo">Cupo máximo</label>
                    <input
                        id="ev-cupo"
                        type="number"
                        min="1"
                        name="cupo"
                        value={form.cupo}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="eventos__form-group">
                <label htmlFor="ev-desc">Descripción</label>
                <textarea
                    id="ev-desc"
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Describe la actividad"
                    rows="4"
                />
            </div>

            <div className="nuevo-evento__actions">
                <Link to="/eventos" className="button button--ghost button--md">
                    Cancelar
                </Link>
                <button
                    type="submit"
                    className="button button--accent button--md"
                    disabled={
                        guardando ||
                        !form.nombre.trim() ||
                        !form.fecha ||
                        !form.hora_inicio ||
                        !form.hora_fin ||
                        !form.ubicacion.trim() ||
                        !form.cupo
                    }
                >
                    <Icon name="eventos" size={15} />
                    {guardando
                        ? "Guardando…"
                        : esEdicion
                          ? "Guardar cambios"
                          : "Crear evento"}
                </button>
            </div>
        </form>
    );
}

/**
 * Módulo de alta/edición de eventos.
 *   /eventos/nuevo        -> crear
 *   /eventos/:id/editar   -> editar
 * Antes era un modal dentro de /eventos.
 */
function FormularioEvento() {
    const { id } = useParams();
    const { user, puede } = useAuth();

    const esEdicion = Boolean(id);
    const { items, cargando } = useColeccion(CLAVE_EVENTOS);

    const actual = useMemo(
        () => (esEdicion ? items.find((item) => String(item.id) === String(id)) : null),
        [items, id, esEdicion]
    );

    if (!puede("publicar_eventos")) {
        return <Navigate to="/eventos" replace />;
    }

    const volver = (
        <Link to="/eventos" className="nuevo-evento__back">
            ← Volver a eventos
        </Link>
    );

    if (esEdicion && !actual) {
        return (
            <div className="nuevo-evento">
                {volver}
                <p className="nuevo-evento__aviso">
                    {cargando
                        ? "Cargando evento…"
                        : "El evento ya no existe o no se pudo cargar."}
                </p>
            </div>
        );
    }

    return (
        <div className="nuevo-evento">
            {volver}

            <header className="nuevo-evento__header">
                <h1>{esEdicion ? "Editar evento" : "Nuevo evento"}</h1>
                <p>
                    {esEdicion
                        ? "Actualiza los datos del evento. Los cambios se verán en el listado."
                        : "Publica una nueva actividad del campus: conferencia, taller, feria o torneo."}
                </p>
            </header>

            <FormEvento
                key={esEdicion ? `editar-${id}` : "nuevo"}
                inicial={esEdicion ? datosDe(actual) : formVacio}
                esEdicion={esEdicion}
                id={id}
                actual={actual}
                items={items}
                userId={user?.id ?? null}
            />
        </div>
    );
}

export default FormularioEvento;
