import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Icon from "../../components/Icon/Icon";
import useAuth from "../../context/useAuth";
import { useToast } from "../../context/ToastContext";
import { crearSolicitud } from "../../utils/solicitudes";
import "./Solicitudes.css";
import "./NuevaSolicitud.css";

// Mismo límite que valida el formulario del backend/UI anterior.
const MAX_PALABRAS_TIPO = 10;
const MAX_PALABRAS_DESCRIPCION = 100;

const SERVICIOS = ["Solicitudes", "Reservas", "Eventos", "Recursos", "PQRS"];
const PRIORIDADES = ["Baja", "Media", "Alta"];

const contarPalabras = (texto = "") =>
    texto.trim() ? texto.trim().split(/\s+/).length : 0;

const formVacio = {
    tipo: "",
    servicio: "",
    descripcion: "",
    prioridad: "Media"
};

/**
 * Módulo (página completa) para registrar una solicitud.
 * Antes era un modal dentro de /solicitudes; ahora tiene su propia ruta
 * /solicitudes/nueva para que el formulario respire y se pueda enlazar.
 */
function NuevaSolicitud() {
    const { user, puede } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const [form, setForm] = useState(formVacio);
    const [errores, setErrores] = useState({});
    const [enviando, setEnviando] = useState(false);

    const puedeRegistrar = puede("registrar_solicitudes");

    // Si el rol no puede registrar, no se muestra el formulario.
    if (!puedeRegistrar) {
        return <Navigate to="/solicitudes" replace />;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errores[name]) {
            setErrores((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validar = () => {
        const nuevos = {};
        const palabrasTipo = contarPalabras(form.tipo);
        if (!form.tipo.trim()) {
            nuevos.tipo = "El tipo es obligatorio.";
        } else if (palabrasTipo > MAX_PALABRAS_TIPO) {
            nuevos.tipo = `Máximo ${MAX_PALABRAS_TIPO} palabras (excede en ${
                palabrasTipo - MAX_PALABRAS_TIPO
            }).`;
        }

        if (!form.servicio) {
            nuevos.servicio = "Selecciona un servicio.";
        }

        const palabrasDescripcion = contarPalabras(form.descripcion);
        if (!form.descripcion.trim()) {
            nuevos.descripcion = "La descripción es obligatoria.";
        } else if (palabrasDescripcion > MAX_PALABRAS_DESCRIPCION) {
            nuevos.descripcion = `Máximo ${MAX_PALABRAS_DESCRIPCION} palabras (excede en ${
                palabrasDescripcion - MAX_PALABRAS_DESCRIPCION
            }).`;
        }

        setErrores(nuevos);
        return Object.keys(nuevos).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validar()) return;

        setEnviando(true);
        try {
            await crearSolicitud(form, user ?? "Usuario");
            toast.success("Solicitud registrada correctamente.");
            navigate("/solicitudes");
        } catch (err) {
            toast.error(err?.message || "No se pudo registrar la solicitud.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="nueva-solicitud">
            <Link to="/solicitudes" className="nueva-solicitud__back">
                ← Volver a solicitudes
            </Link>

            <header className="nueva-solicitud__header">
                <h1>Registrar solicitud</h1>
                <p>
                    Radica una nueva solicitud de servicio. Quedará a nombre de{" "}
                    <strong>
                        {[user?.nombre, user?.apellido].filter(Boolean).join(" ") ||
                            "tu usuario"}
                    </strong>
                    .
                </p>
            </header>

            <form className="nueva-solicitud__form" onSubmit={handleSubmit} noValidate>
                <div className="sols__form-group">
                    <label htmlFor="sol-tipo">Tipo de solicitud *</label>
                    <input
                        id="sol-tipo"
                        type="text"
                        name="tipo"
                        value={form.tipo}
                        onChange={handleChange}
                        placeholder="ej. Constancia académica"
                        className={errores.tipo ? "sols__input--error" : ""}
                    />
                    {errores.tipo ? (
                        <span className="sols__field-error">{errores.tipo}</span>
                    ) : (
                        <span className="sols__field-hint">
                            {contarPalabras(form.tipo)}/{MAX_PALABRAS_TIPO} palabras
                            como máximo
                        </span>
                    )}
                </div>

                <div className="nueva-solicitud__row">
                    <div className="sols__form-group">
                        <label htmlFor="sol-servicio">Servicio *</label>
                        <select
                            id="sol-servicio"
                            name="servicio"
                            value={form.servicio}
                            onChange={handleChange}
                            className={errores.servicio ? "sols__input--error" : ""}
                        >
                            <option value="">Selecciona…</option>
                            {SERVICIOS.map((servicio) => (
                                <option key={servicio} value={servicio}>
                                    {servicio}
                                </option>
                            ))}
                        </select>
                        {errores.servicio && (
                            <span className="sols__field-error">{errores.servicio}</span>
                        )}
                    </div>

                    <div className="sols__form-group">
                        <label htmlFor="sol-prioridad">Prioridad</label>
                        <select
                            id="sol-prioridad"
                            name="prioridad"
                            value={form.prioridad}
                            onChange={handleChange}
                        >
                            {PRIORIDADES.map((prioridad) => (
                                <option key={prioridad} value={prioridad}>
                                    {prioridad}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="sols__form-group">
                    <label htmlFor="sol-descripcion">Descripción *</label>
                    <textarea
                        id="sol-descripcion"
                        name="descripcion"
                        rows="6"
                        value={form.descripcion}
                        onChange={handleChange}
                        placeholder="Describe el motivo de la solicitud"
                        className={errores.descripcion ? "sols__input--error" : ""}
                    />
                    {errores.descripcion ? (
                        <span className="sols__field-error">{errores.descripcion}</span>
                    ) : (
                        <span className="sols__field-hint">
                            {contarPalabras(form.descripcion)}/
                            {MAX_PALABRAS_DESCRIPCION} palabras como máximo
                        </span>
                    )}
                </div>

                <div className="nueva-solicitud__actions">
                    <Link
                        to="/solicitudes"
                        className="button button--ghost button--md"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        className="button button--accent button--md"
                        disabled={enviando}
                    >
                        <Icon name="solicitudes" size={15} />
                        {enviando ? "Registrando…" : "Crear solicitud"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default NuevaSolicitud;
