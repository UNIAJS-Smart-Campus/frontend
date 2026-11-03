import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Icon from "../../components/Icon/Icon";
import useAuth from "../../context/useAuth";
import { useToast } from "../../context/ToastContext";
import {
    CATEGORIAS,
    PROGRAMAS,
    formVacio,
    crearPublicacion
} from "../../utils/infoAcademica";
import "./InfoAcademica.css";
import "./NuevaPublicacion.css";

const HOY = new Date().toISOString().slice(0, 10);

/**
 * Módulo (página completa) para publicar información académica.
 * Antes era un modal dentro de /info-academica; ahora vive en
 * /info-academica/nueva.
 */
function NuevaPublicacion() {
    const { user, puede } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const [form, setForm] = useState(formVacio);
    const [errores, setErrores] = useState({});
    const [enviando, setEnviando] = useState(false);

    if (!puede("publicar_info_academica")) {
        return <Navigate to="/info-academica" replace />;
    }

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
        if (errores[name]) {
            setErrores((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validar = () => {
        const err = {};
        if (!form.titulo.trim()) err.titulo = "El título es obligatorio.";
        if (!form.contenido.trim()) err.contenido = "El contenido es obligatorio.";
        if (form.tipoVigencia === "Hasta") {
            if (!form.vigencia) err.vigencia = "Debes indicar la fecha límite.";
            else if (form.vigencia < HOY) {
                err.vigencia = "La fecha límite no puede ser anterior a hoy.";
            }
        }
        setErrores(err);
        return Object.keys(err).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validar()) return;

        const nueva = {
            fecha: HOY,
            autor: user?.nombre ?? "Usuario",
            estado: "Pendiente",
            ...form,
            vigencia: form.tipoVigencia === "Hasta" ? form.vigencia : ""
        };

        setEnviando(true);
        try {
            await crearPublicacion(nueva);
            toast.success("Publicación creada correctamente.");
            navigate("/info-academica");
        } catch (error) {
            toast.error(error?.message || "No se pudo crear la publicación.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="nueva-publicacion">
            <Link to="/info-academica" className="nueva-publicacion__back">
                ← Volver a información académica
            </Link>

            <header className="nueva-publicacion__header">
                <h1>Nueva publicación académica</h1>
                <p>
                    Publica un aviso, convocatoria o resultado para la comunidad.
                    Quedará a nombre de{" "}
                    <strong>{user?.nombre || "tu usuario"}</strong>.
                </p>
            </header>

            <form className="nueva-publicacion__form" onSubmit={handleSubmit} noValidate>
                <div className="info-ac__form-group">
                    <label htmlFor="if-titulo">Título *</label>
                    <input
                        id="if-titulo"
                        type="text"
                        name="titulo"
                        value={form.titulo}
                        onChange={handleChange}
                        placeholder="ej. Convocatoria periodo académico 2026-2"
                        className={errores.titulo ? "info-ac__input--error" : ""}
                    />
                    {errores.titulo && (
                        <span className="info-ac__field-error">{errores.titulo}</span>
                    )}
                </div>

                <div className="info-ac__form-group">
                    <label htmlFor="if-categoria">Categoría</label>
                    <select
                        id="if-categoria"
                        name="categoria"
                        value={form.categoria}
                        onChange={handleChange}
                    >
                        {CATEGORIAS.map((categoria) => (
                            <option key={categoria} value={categoria}>
                                {categoria}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-grid">
                    <div className="info-ac__form-group">
                        <label htmlFor="if-programa">Dirigido a</label>
                        <select
                            id="if-programa"
                            name="programa"
                            value={form.programa}
                            onChange={handleChange}
                        >
                            {PROGRAMAS.map((programa) => (
                                <option key={programa} value={programa}>
                                    {programa}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="info-ac__form-group">
                        <label htmlFor="if-tipo-vigencia">Vigencia</label>
                        <select
                            id="if-tipo-vigencia"
                            name="tipoVigencia"
                            value={form.tipoVigencia}
                            onChange={handleChange}
                        >
                            <option value="Permanente">Permanente</option>
                            <option value="Hasta">Hasta una fecha</option>
                        </select>
                    </div>
                </div>

                {form.tipoVigencia === "Hasta" && (
                    <div className="info-ac__form-group">
                        <label htmlFor="if-vigencia">Fecha límite *</label>
                        <input
                            id="if-vigencia"
                            type="date"
                            name="vigencia"
                            value={form.vigencia}
                            min={HOY}
                            onChange={handleChange}
                            className={errores.vigencia ? "info-ac__input--error" : ""}
                        />
                        {errores.vigencia && (
                            <span className="info-ac__field-error">{errores.vigencia}</span>
                        )}
                    </div>
                )}

                <div className="info-ac__form-group">
                    <label htmlFor="if-contenido">Contenido *</label>
                    <textarea
                        id="if-contenido"
                        name="contenido"
                        rows="6"
                        value={form.contenido}
                        onChange={handleChange}
                        placeholder="Describe la información académica"
                        className={errores.contenido ? "info-ac__input--error" : ""}
                    />
                    {errores.contenido && (
                        <span className="info-ac__field-error">{errores.contenido}</span>
                    )}
                </div>

                <label className="info-ac__check">
                    <input
                        type="checkbox"
                        name="destacado"
                        checked={form.destacado}
                        onChange={handleChange}
                    />
                    <span>Destacar publicación (fijar al inicio del tablero)</span>
                </label>

                <div className="nueva-publicacion__actions">
                    <Link to="/info-academica" className="button button--ghost button--md">
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        className="button button--accent button--md"
                        disabled={enviando}
                    >
                        <Icon name="estudiante" size={15} />
                        {enviando ? "Publicando…" : "Publicar"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default NuevaPublicacion;
