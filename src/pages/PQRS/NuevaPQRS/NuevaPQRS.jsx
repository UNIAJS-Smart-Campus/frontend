import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/Icon/Icon";
import useAuth from "../../../context/useAuth";
import {
    TIPOS_PQRS,
    TIPOS_DOCUMENTO,
    TIPOS_PERFIL,
    SEDES,
    AREAS_PQRS,
    obtenerPqrs,
    guardarPqrs
} from "../../../utils/pqrs";
import "./NuevaPQRS.css";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const FILE_EXTENSIONS = ["pdf", "doc", "docx", "png", "jpg", "jpeg"];

const formVacio = {
    tipo: TIPOS_PQRS[0],
    sede: SEDES[0],
    tipoPerfil: "",
    tipoDocumento: "",
    identificacion: "",
    nombre: "",
    telefono: "",
    correo: "",
    area: "",
    asunto: "",
    descripcion: "",
    aceptaPolitica: false
};

function leerArchivo(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
        reader.readAsDataURL(file);
    });
}

function extensionValida(nombre) {
    const ext = nombre.split(".").pop()?.toLowerCase();
    return FILE_EXTENSIONS.includes(ext);
}

function NuevaPQRS() {
    const { user } = useAuth();
    const [form, setForm] = useState(() => ({
        ...formVacio,
        nombre: user?.nombre || "",
        correo: user?.correo || ""
    }));
    const [adjunto, setAdjunto] = useState(null);
    const [adjuntoNombre, setAdjuntoNombre] = useState("");
    const [errores, setErrores] = useState({});
    const [confirmacion, setConfirmacion] = useState("");
    const inputArchivoRef = useRef(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
        if (errores[name]) {
            setErrores((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validarIdentificacion = () => {
        if (!form.identificacion.trim()) {
            setErrores((prev) => ({ ...prev, identificacion: "La identificación es obligatoria." }));
            return;
        }
        setErrores((prev) => ({ ...prev, identificacion: "" }));
    };

    const handleArchivo = async (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            setAdjunto(null);
            setAdjuntoNombre("");
            return;
        }
        if (file.size > MAX_FILE_BYTES) {
            setErrores((prev) => ({ ...prev, adjunto: "El archivo supera 5 MB." }));
            e.target.value = "";
            return;
        }
        if (!extensionValida(file.name)) {
            setErrores((prev) => ({ ...prev, adjunto: "Formato no permitido. Use PDF, Word o imagen." }));
            e.target.value = "";
            return;
        }
        try {
            const dataUrl = await leerArchivo(file);
            setAdjunto({ nombre: file.name, tipo: file.type, dataUrl });
            setAdjuntoNombre(file.name);
            setErrores((prev) => ({ ...prev, adjunto: "" }));
        } catch (err) {
            setErrores((prev) => ({ ...prev, adjunto: err.message }));
        }
    };

    const eliminarAdjunto = () => {
        setAdjunto(null);
        setAdjuntoNombre("");
        if (inputArchivoRef.current) inputArchivoRef.current.value = "";
    };

    const validar = () => {
        const nuevosErrores = {};
        if (!form.tipo) nuevosErrores.tipo = "Selecciona el tipo de solicitud.";
        if (!form.tipoPerfil) nuevosErrores.tipoPerfil = "Selecciona el tipo de perfil.";
        if (!form.tipoDocumento) nuevosErrores.tipoDocumento = "Selecciona el tipo de documento.";
        if (!form.identificacion.trim()) {
            nuevosErrores.identificacion = "La identificación es obligatoria.";
        }
        if (!form.nombre.trim()) {
            nuevosErrores.nombre = "El nombre es obligatorio.";
        }
        if (!form.telefono.trim()) {
            nuevosErrores.telefono = "El teléfono es obligatorio.";
        } else if (!/^[0-9+\s-]{6,15}$/.test(form.telefono.trim())) {
            nuevosErrores.telefono = "Ingresa un teléfono válido.";
        }
        if (!form.correo.trim()) {
            nuevosErrores.correo = "El correo es obligatorio.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) {
            nuevosErrores.correo = "Ingresa un correo válido.";
        }
        if (!form.area) nuevosErrores.area = "Selecciona el área.";
        if (!form.asunto.trim()) {
            nuevosErrores.asunto = "El asunto es obligatorio.";
        }
        if (!form.descripcion.trim()) {
            nuevosErrores.descripcion = "La descripción es obligatoria.";
        }
        if (!form.aceptaPolitica) {
            nuevosErrores.aceptaPolitica = "Debes aceptar la política de tratamiento de datos.";
        }
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validar()) return;

        const numero = `PQRS-2026-${String(Date.now()).slice(-3)}`;
        const nueva = {
            id: numero,
            tipo: form.tipo,
            sede: form.sede,
            tipoPerfil: form.tipoPerfil,
            tipoDocumento: form.tipoDocumento,
            identificacion: form.identificacion.trim(),
            nombre: form.nombre.trim(),
            telefono: form.telefono.trim(),
            correo: form.correo.trim(),
            area: form.area,
            asunto: form.asunto.trim(),
            descripcion: form.descripcion.trim(),
            fecha: new Date().toISOString().slice(0, 10),
            estado: "Registrada",
            solicitante: user?.nombre || form.nombre.trim() || "Anónimo",
            usuarioId: user?.id ?? null,
            adjunto: adjunto
                ? { nombre: adjunto.nombre, tipo: adjunto.tipo, dataUrl: adjunto.dataUrl }
                : null
        };

        const lista = obtenerPqrs();
        lista.unshift(nueva);
        guardarPqrs(lista);
        setConfirmacion(
            `Tu ${form.tipo.toLowerCase()} fue registrada con el número ${numero}.`
        );
    };

    if (confirmacion) {
        return (
            <div className="nueva-pqrs">
                <Link to="/pqrs" className="nueva-pqrs__back">
                    ← Volver a PQRS
                </Link>
                <div className="nueva-pqrs__confirm">
                    <p>{confirmacion}</p>
                    <p className="nueva-pqrs__confirm-detail">
                        Recibirás respuesta en el correo <strong>{form.correo}</strong>.
                    </p>
                    <Link to="/pqrs" className="nueva-pqrs__submit">
                        Ver mis PQRS
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="nueva-pqrs">
            <Link to="/pqrs" className="nueva-pqrs__back">
                ← Volver a PQRS
            </Link>

            <div className="nueva-pqrs__page-header">
                <div className="nueva-pqrs__page-title">
                    <h1>Radicar PQRS</h1>
                    <p>
                        Para radicar un nuevo PQRS por favor diligencie el siguiente formulario.
                    </p>
                    <p className="nueva-pqrs__required">Campos requeridos.</p>
                </div>
            </div>

            <form className="nueva-pqrs__form" onSubmit={handleSubmit} noValidate>
                <div className="nueva-pqrs__form-group">
                    <label htmlFor="pqrs-tipo">
                        Tipo de solicitud <span className="nueva-pqrs__required-mark">*</span>
                    </label>
                    <select
                        id="pqrs-tipo"
                        className="nueva-pqrs__select"
                        name="tipo"
                        value={form.tipo}
                        onChange={handleChange}
                    >
                        {TIPOS_PQRS.map((tipo) => (
                            <option key={tipo} value={tipo}>
                                {tipo}
                            </option>
                        ))}
                    </select>
                    {errores.tipo && <span className="nueva-pqrs__error">{errores.tipo}</span>}
                </div>

                <div className="nueva-pqrs__form-row">
                    <div className="nueva-pqrs__form-group">
                        <label htmlFor="pqrs-sede">
                            Sede <span className="nueva-pqrs__required-mark">*</span>
                        </label>
                        <select
                            id="pqrs-sede"
                            className="nueva-pqrs__select"
                            name="sede"
                            value={form.sede}
                            onChange={handleChange}
                        >
                            {SEDES.map((sede) => (
                                <option key={sede} value={sede}>{sede}</option>
                            ))}
                        </select>
                    </div>

                    <div className="nueva-pqrs__form-group">
                        <label htmlFor="pqrs-perfil">
                            Tipo de perfil <span className="nueva-pqrs__required-mark">*</span>
                        </label>
                        <select
                            id="pqrs-perfil"
                            className="nueva-pqrs__select"
                            name="tipoPerfil"
                            value={form.tipoPerfil}
                            onChange={handleChange}
                        >
                            <option value="">Seleccione el tipo</option>
                            {TIPOS_PERFIL.map((perfil) => (
                                <option key={perfil} value={perfil}>{perfil}</option>
                            ))}
                        </select>
                        {errores.tipoPerfil && <span className="nueva-pqrs__error">{errores.tipoPerfil}</span>}
                    </div>
                </div>

                <div className="nueva-pqrs__form-row">
                    <div className="nueva-pqrs__form-group">
                        <label htmlFor="pqrs-doc">
                            Tipo de documento <span className="nueva-pqrs__required-mark">*</span>
                        </label>
                        <select
                            id="pqrs-doc"
                            className="nueva-pqrs__select"
                            name="tipoDocumento"
                            value={form.tipoDocumento}
                            onChange={handleChange}
                        >
                            <option value="">Seleccione un tipo</option>
                            {TIPOS_DOCUMENTO.map((doc) => (
                                <option key={doc} value={doc}>{doc}</option>
                            ))}
                        </select>
                        {errores.tipoDocumento && <span className="nueva-pqrs__error">{errores.tipoDocumento}</span>}
                    </div>

                    <div className="nueva-pqrs__form-group">
                        <label htmlFor="pqrs-id">
                            Identificación <span className="nueva-pqrs__required-mark">*</span>
                        </label>
                        <input
                            id="pqrs-id"
                            type="text"
                            name="identificacion"
                            className="nueva-pqrs__input"
                            value={form.identificacion}
                            onChange={handleChange}
                            onBlur={validarIdentificacion}
                            placeholder="Identificación"
                        />
                        <small className="nueva-pqrs__hint">
                            Puedes validar tu identificación para cargar tus datos.
                        </small>
                        {errores.identificacion && <span className="nueva-pqrs__error">{errores.identificacion}</span>}
                    </div>
                </div>

                <div className="nueva-pqrs__form-group">
                    <label htmlFor="pqrs-nombre">
                        Nombre completo <span className="nueva-pqrs__required-mark">*</span>
                    </label>
                    <input
                        id="pqrs-nombre"
                        type="text"
                        name="nombre"
                        className="nueva-pqrs__input"
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder="Nombre de la persona o razón social de la empresa"
                    />
                    {errores.nombre && <span className="nueva-pqrs__error">{errores.nombre}</span>}
                </div>

                <div className="nueva-pqrs__form-row">
                    <div className="nueva-pqrs__form-group">
                        <label htmlFor="pqrs-telefono">
                            Teléfono <span className="nueva-pqrs__required-mark">*</span>
                        </label>
                        <input
                            id="pqrs-telefono"
                            type="tel"
                            name="telefono"
                            className="nueva-pqrs__input"
                            value={form.telefono}
                            onChange={handleChange}
                            placeholder="Número de Teléfono"
                        />
                        {errores.telefono && <span className="nueva-pqrs__error">{errores.telefono}</span>}
                    </div>

                    <div className="nueva-pqrs__form-group">
                        <label htmlFor="pqrs-correo">
                            Correo electrónico <span className="nueva-pqrs__required-mark">*</span>
                        </label>
                        <input
                            id="pqrs-correo"
                            type="email"
                            name="correo"
                            className="nueva-pqrs__input"
                            value={form.correo}
                            onChange={handleChange}
                            placeholder="Correo electrónico"
                        />
                        {errores.correo && <span className="nueva-pqrs__error">{errores.correo}</span>}
                    </div>
                </div>

                <div className="nueva-pqrs__form-group">
                    <label htmlFor="pqrs-area">
                        Área a la que dirige su solicitud <span className="nueva-pqrs__required-mark">*</span>
                    </label>
                    <select
                        id="pqrs-area"
                        className="nueva-pqrs__select"
                        name="area"
                        value={form.area}
                        onChange={handleChange}
                    >
                        <option value="">Seleccione el área hacia donde va dirigida su solicitud</option>
                        {AREAS_PQRS.map((area) => (
                            <option key={area} value={area}>{area}</option>
                        ))}
                    </select>
                    {errores.area && <span className="nueva-pqrs__error">{errores.area}</span>}
                </div>

                <div className="nueva-pqrs__form-group">
                    <label htmlFor="pqrs-asunto">
                        Asunto <span className="nueva-pqrs__required-mark">*</span>
                    </label>
                    <input
                        id="pqrs-asunto"
                        type="text"
                        name="asunto"
                        className="nueva-pqrs__input"
                        value={form.asunto}
                        onChange={handleChange}
                        placeholder="Asunto de su solicitud"
                    />
                    {errores.asunto && <span className="nueva-pqrs__error">{errores.asunto}</span>}
                </div>

                <div className="nueva-pqrs__form-group">
                    <label htmlFor="pqrs-descripcion">
                        Descripción de su solicitud <span className="nueva-pqrs__required-mark">*</span>
                    </label>
                    <textarea
                        id="pqrs-descripcion"
                        className="nueva-pqrs__textarea"
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        placeholder="Describe detalladamente tu solicitud…"
                        rows="5"
                    />
                    {errores.descripcion && <span className="nueva-pqrs__error">{errores.descripcion}</span>}
                </div>

                <div className="nueva-pqrs__form-group">
                    <label htmlFor="pqrs-adjunto">
                        Adjunto o soporte <span className="nueva-pqrs__optional">[PDF, WORD, O IMAGEN] - Máximo 5MB</span>
                    </label>
                    <div className="nueva-pqrs__file-row">
                        <input
                            id="pqrs-adjunto"
                            ref={inputArchivoRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            onChange={handleArchivo}
                            className="nueva-pqrs__file"
                        />
                        {adjuntoNombre && (
                            <button
                                type="button"
                                className="nueva-pqrs__file-remove"
                                onClick={eliminarAdjunto}
                            >
                                Eliminar
                            </button>
                        )}
                    </div>
                    {adjuntoNombre && (
                        <small className="nueva-pqrs__file-name">Archivo: {adjuntoNombre}</small>
                    )}
                    {errores.adjunto && <span className="nueva-pqrs__error">{errores.adjunto}</span>}
                </div>

                <div className="nueva-pqrs__form-group nueva-pqrs__check-group">
                    <label className="nueva-pqrs__check">
                        <input
                            type="checkbox"
                            name="aceptaPolitica"
                            checked={form.aceptaPolitica}
                            onChange={handleChange}
                        />
                        <span>
                            Acepta que ha leído y está de acuerdo con nuestra política de protección de datos.
                            Autorizo el tratamiento de mis datos personales de acuerdo a nuestro aviso de privacidad.
                        </span>
                    </label>
                    {errores.aceptaPolitica && (
                        <span className="nueva-pqrs__error">{errores.aceptaPolitica}</span>
                    )}
                </div>

                <div className="nueva-pqrs__actions">
                    <button
                        type="submit"
                        className="nueva-pqrs__submit"
                    >
                        <Icon name="pqrs" size={15} />
                        Radicar PQRS
                    </button>
                </div>
            </form>
        </div>
    );
}

export default NuevaPQRS;
