import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Icon from "../../components/Icon/Icon";
import useAuth from "../../context/useAuth";
import { useToast } from "../../context/ToastContext";
import useColeccion from "../../hooks/useColeccion";
import { ROLES, crearUsuario, actualizarUsuario } from "../../utils/users";
import { configurationApi } from "../../utils/api";
import "./Usuarios.css";
import "./FormularioUsuario.css";

const ESTADOS = ["Activo", "Inactivo"];
const CAMPOS_OBLIGATORIOS = ["cedula", "usuario", "nombre", "correo", "programa"];

const vacio = {
    cedula: "",
    usuario: "",
    password: "",
    nombre: "",
    correo: "",
    codigo: "",
    telefono: "",
    rol: "Estudiante",
    programa: "",
    estado: "Activo"
};

function datosDe(item) {
    return {
        cedula: item.cedula || "",
        usuario: item.usuario || "",
        password: "",
        nombre: item.nombre || "",
        correo: item.correo || "",
        codigo: item.codigo || "",
        telefono: item.telefono || "",
        rol: item.rol || "Estudiante",
        programa: item.programa || "",
        estado: item.estado || "Activo"
    };
}

/** Formulario con estado inicial derivado de props (se monta con `key`). */
function FormUsuario({ inicial, esEdicion, id, actual, items, recargar }) {
    const navigate = useNavigate();
    const toast = useToast();

    const [form, setForm] = useState(inicial);
    const [error, setError] = useState("");
    const [pwdError, setPwdError] = useState("");
    const [mostrarPass, setMostrarPass] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [programasPorRol, setProgramasPorRol] = useState({});
    const [cargandoProgramas, setCargandoProgramas] = useState(true);

    useEffect(() => {
        let vigente = true;
        configurationApi.rolePermissions()
            .then((configuracion) => {
                if (!vigente || !configuracion) return;
                setProgramasPorRol(Object.fromEntries(
                    ROLES.map((rol) => [rol.nombre, configuracion[rol.nombre]?.programas || []])
                ));
            })
            .catch(() => {
                // El formulario conserva el valor existente si el servicio no responde.
            })
            .finally(() => {
                if (vigente) setCargandoProgramas(false);
            });
        return () => {
            vigente = false;
        };
    }, []);

    const opcionesPrograma = [
        ...new Set([
            ...(programasPorRol[form.rol] || []),
            ...(form.programa ? [form.programa] : [])
        ])
    ];

    const faltantes = CAMPOS_OBLIGATORIOS.filter(
        (campo) => !String(form[campo] ?? "").trim()
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (name === "password") setPwdError("");
        if (error) setError("");
        if (name === "rol") {
            const opciones = programasPorRol[value] || [];
            setForm((prev) => ({
                ...prev,
                rol: value,
                programa: opciones.includes(prev.programa) ? prev.programa : (opciones[0] || "")
            }));
            return;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!esEdicion && !form.password.trim()) {
            setPwdError("La contraseña es obligatoria para crear un usuario.");
            return;
        }
        if (!esEdicion && form.password.trim().length < 6) {
            setPwdError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        const usuarioExiste = items.some(
            (item) =>
                String(item.usuario || "").toLowerCase() ===
                    form.usuario.trim().toLowerCase() && String(item.id) !== String(id)
        );
        if (usuarioExiste) {
            setError("El nombre de usuario ya está en uso.");
            return;
        }

        const cedula = String(form.cedula || "").trim();
        const cedulaExiste = items.some(
            (item) =>
                String(item.cedula || "") === cedula &&
                cedula !== "" &&
                String(item.id) !== String(id)
        );
        if (cedulaExiste) {
            setError("Esa cédula ya está registrada.");
            return;
        }

        const datos = {
            cedula,
            usuario: form.usuario.trim(),
            password: form.password.trim(),
            nombre: form.nombre.trim(),
            correo: form.correo.trim(),
            codigo: form.codigo.trim(),
            telefono: form.telefono.trim(),
            rol: form.rol,
            programa: form.programa.trim(),
            estado: form.estado
        };

        setGuardando(true);
        try {
            if (esEdicion) {
                await actualizarUsuario(actual, datos);
                toast.success("Usuario actualizado correctamente.");
            } else {
                await crearUsuario(datos);
                toast.success("Usuario creado correctamente.");
            }
            // El backend asigna los ids reales: refrescar antes de volver.
            await recargar();
            navigate("/usuarios");
        } catch (err) {
            const mensaje = err?.message || "Error al guardar el usuario.";
            setError(mensaje);
            toast.error(mensaje);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <form className="nuevo-usuario__form" onSubmit={handleSubmit} noValidate>
            {error && <p className="users__error">{error}</p>}

            <p className="users__form-note">
                Los campos marcados con <span>*</span> son obligatorios.
            </p>

            <div className="users__form-group">
                <label htmlFor="u-usuario">
                    Usuario <span className="users__req">*</span>
                </label>
                <input
                    id="u-usuario"
                    type="text"
                    name="usuario"
                    value={form.usuario}
                    onChange={handleChange}
                    placeholder="ej. jperez"
                />
            </div>

            <div className="users__form-group">
                <label htmlFor="u-cedula">
                    Cédula <span className="users__req">*</span>
                </label>
                <input
                    id="u-cedula"
                    type="text"
                    name="cedula"
                    value={form.cedula}
                    onChange={handleChange}
                    placeholder="ej. 1023456789"
                />
            </div>

            <div className="users__form-group">
                <label htmlFor="u-nombre">
                    Nombre completo <span className="users__req">*</span>
                </label>
                <input
                    id="u-nombre"
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="ej. Juan Pérez García"
                />
            </div>

            <div className="form-grid">
                <div className="users__form-group">
                    <label htmlFor="u-correo">
                        Correo <span className="users__req">*</span>
                    </label>
                    <input
                        id="u-correo"
                        type="email"
                        name="correo"
                        value={form.correo}
                        onChange={handleChange}
                        placeholder="usuario@uajs.edu.co"
                    />
                </div>

                <div className="users__form-group">
                    <label htmlFor="u-codigo">Código / Identificación</label>
                    <input
                        id="u-codigo"
                        type="text"
                        name="codigo"
                        value={form.codigo}
                        onChange={handleChange}
                        placeholder="ej. 2024100123"
                    />
                </div>
            </div>

            <div className="form-grid">
                <div className="users__form-group">
                    <label htmlFor="u-telefono">Teléfono</label>
                    <input
                        id="u-telefono"
                        type="tel"
                        name="telefono"
                        value={form.telefono}
                        onChange={handleChange}
                        placeholder="ej. 3001234567"
                    />
                </div>

                <div className="users__form-group">
                    <label htmlFor="u-programa">
                        Programa / Dependencia <span className="users__req">*</span>
                    </label>
                    {opcionesPrograma.length > 0 ? (
                        <select
                            id="u-programa"
                            name="programa"
                            value={form.programa}
                            onChange={handleChange}
                        >
                            <option value="">Selecciona un programa o dependencia</option>
                            {opcionesPrograma.map((programa) => (
                                <option key={programa} value={programa}>
                                    {programa}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            id="u-programa"
                            type="text"
                            name="programa"
                            value={form.programa}
                            onChange={handleChange}
                            placeholder="Configura primero un programa o dependencia"
                            disabled={cargandoProgramas}
                        />
                    )}
                    {!cargandoProgramas && opcionesPrograma.length === 0 && (
                        <small className="users__field-hint">
                            No hay programas configurados para este rol. Agrégalos en Roles por programa.
                        </small>
                    )}
                </div>
            </div>

            <div className="users__form-group">
                <label htmlFor="u-password">
                    {esEdicion ? (
                        "Contraseña (dejar vacío para conservar la actual)"
                    ) : (
                        <>
                            Contraseña <span className="users__req">*</span>
                        </>
                    )}
                </label>
                <div className="users__password-wrap">
                    <input
                        id="u-password"
                        type={mostrarPass ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder={esEdicion ? "••••••••" : "mín. 6 caracteres"}
                    />
                    <button
                        type="button"
                        className="users__password-toggle"
                        onClick={() => setMostrarPass((v) => !v)}
                    >
                        {mostrarPass ? "Ocultar" : "Mostrar"}
                    </button>
                </div>
                {pwdError && <p className="users__pwd-error">{pwdError}</p>}
                {esEdicion && (
                    <p className="users__password-hint">
                        Si dejas este campo vacío, la contraseña actual se conservará
                        sin cambios.
                    </p>
                )}
            </div>

            <div className="form-grid">
                <div className="users__form-group">
                    <label htmlFor="u-rol">Rol</label>
                    <select
                        id="u-rol"
                        name="rol"
                        value={form.rol}
                        onChange={handleChange}
                    >
                        {ROLES.map((rol) => (
                            <option key={rol.nombre} value={rol.nombre}>
                                {rol.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="users__form-group">
                    <label htmlFor="u-estado">Estado</label>
                    <select
                        id="u-estado"
                        name="estado"
                        value={form.estado}
                        onChange={handleChange}
                    >
                        {ESTADOS.map((estado) => (
                            <option key={estado} value={estado}>
                                {estado}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {faltantes.length > 0 && (
                <p className="users__form-pending">
                    Faltan {faltantes.length}{" "}
                    {faltantes.length === 1
                        ? "campo obligatorio por completar"
                        : "campos obligatorios por completar"}
                    .
                </p>
            )}

            <div className="nuevo-usuario__actions">
                <Link to="/usuarios" className="button button--ghost button--md">
                    Cancelar
                </Link>
                <button
                    type="submit"
                    className="button button--accent button--md"
                    disabled={guardando || faltantes.length > 0}
                >
                    <Icon name="usuarios" size={15} />
                    {guardando
                        ? "Guardando…"
                        : esEdicion
                          ? "Guardar cambios"
                          : "Crear usuario"}
                </button>
            </div>
        </form>
    );
}

/**
 * Módulo de alta/edición de usuarios.
 *   /usuarios/nuevo        -> crear
 *   /usuarios/:id/editar   -> editar
 * Antes era un modal dentro de /usuarios.
 */
function FormularioUsuario() {
    const { id } = useParams();
    const { user } = useAuth();

    const esEdicion = Boolean(id);
    const { items, cargando, recargar } = useColeccion("usuarios");

    const actual = useMemo(
        () => (esEdicion ? items.find((item) => String(item.id) === String(id)) : null),
        [items, id, esEdicion]
    );

    // Misma guarda de rol que la página de usuarios.
    if (!user || user.rol !== "Administrador") {
        return <Navigate to="/usuarios" replace />;
    }

    const volver = (
        <Link to="/usuarios" className="nuevo-usuario__back">
            ← Volver a usuarios
        </Link>
    );

    if (esEdicion && !actual) {
        return (
            <div className="nuevo-usuario">
                {volver}
                <p className="nuevo-usuario__aviso">
                    {cargando
                        ? "Cargando usuario…"
                        : "El usuario ya no existe o no se pudo cargar."}
                </p>
            </div>
        );
    }

    return (
        <div className="nuevo-usuario">
            {volver}

            <header className="nuevo-usuario__header">
                <h1>{esEdicion ? "Editar usuario" : "Nuevo usuario"}</h1>
                <p>
                    {esEdicion
                        ? "Actualiza los datos del usuario o cambia su rol y estado."
                        : "Crea una cuenta y define su rol y estado de acceso."}
                </p>
            </header>

            <FormUsuario
                key={esEdicion ? `editar-${id}` : "nuevo"}
                inicial={esEdicion ? datosDe(actual) : vacio}
                esEdicion={esEdicion}
                id={id}
                actual={actual}
                items={items}
                recargar={recargar}
            />
        </div>
    );
}

export default FormularioUsuario;
