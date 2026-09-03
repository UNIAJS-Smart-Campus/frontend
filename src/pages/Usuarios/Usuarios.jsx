import { useCallback, useMemo, useState } from "react";
import Icon from "../../components/Icon/Icon";
import SearchBar from "../../components/SearchBar/SearchBar";
import DataTable from "../../components/DataTable/DataTable";
import Pagination from "../../components/Pagination/Pagination";
import Modal from "../../components/Modal/Modal";
import useAuth from "../../context/useAuth";
import { ROLES, obtenerUsuarios, guardarUsuarios } from "../../utils/users";
import { getUserInitials } from "../../utils/avatar";
import useSearch from "../../hooks/useSearch";
import usePagination from "../../hooks/usePagination";
import "./Usuarios.css";

const ROL_ICONO = {
    Administrador: "admin",
    Administrativo: "configuracion",
    Docente: "docente",
    Estudiante: "estudiante"
};

const ROL_CLASE = {
    Administrador: "purple",
    Administrativo: "orange",
    Docente: "green",
    Estudiante: "blue"
};

const ESTADOS = ["Activo", "Inactivo"];

// TAREA 3: form unificado con "nombre" como campo completo, sin "apellido"
const vacio = {
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

// TAREA 1: genera iniciales basadas en el nombre de la fila, sin tocar la sesión
function inicialesPorNombre(nombre) {
    return getUserInitials(nombre, "?");
}

// TAREA 1: estilo de avatar basado únicamente en el nombre de la fila
function avatarStylePorNombre() {
    return {
        background: "linear-gradient(135deg, var(--color-primary-600), var(--color-primary))",
        color: "#ffffff"
    };
}

function Usuarios() {
    const { user } = useAuth();

    // TAREA 5: guarda de rol — acceso solo para Administrador
    if (!user || user.rol !== "Administrador") {
        return (
            <div className="page">
                <div className="users__access-denied">
                    <Icon name="usuarios" size={40} />
                    <p>No tienes permiso para acceder a la gestión de usuarios.</p>
                </div>
            </div>
        );
    }

    return <UsuariosAdmin />;
}

function UsuariosAdmin() {
    const [items, setItems] = useState(obtenerUsuarios);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [form, setForm] = useState(vacio);
    const [pwdError, setPwdError] = useState("");
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [filtroRol, setFiltroRol] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [aviso, setAviso] = useState("");
    const [mostrarPass, setMostrarPass] = useState(false);

    // Pipeline de filtros: búsqueda → rol → estado
    const buscados = useSearch(items, busqueda, [
        "usuario", "nombre", "correo", "rol", "programa"
    ]);
    const porRol = filtroRol
        ? buscados.filter((item) => item.rol === filtroRol)
        : buscados;
    const porEstado = filtroEstado
        ? porRol.filter((item) => item.estado === filtroEstado)
        : porRol;

    const { pagina, setPagina, totalPaginas, itemsPagina, desde, hasta } =
        usePagination(porEstado, 8);

    const activos   = items.filter((i) => i.estado === "Activo").length;
    const inactivos = items.filter((i) => i.estado === "Inactivo").length;
    const contarRol = (rol) => items.filter((i) => i.rol === rol).length;

    const sugerencias = useMemo(() => [
        ...new Set(
            items
                .flatMap((i) => [i.usuario, i.nombre, i.correo, i.rol, i.programa])
                .filter(Boolean)
        )
    ], [items]);

    const mostrarAviso = useCallback((mensaje) => {
        setAviso(mensaje);
        setTimeout(() => setAviso(""), 2500);
    }, []);

    // TAREA 8: limpiar búsqueda al cambiar filtros
    const cambiarFiltroRol = (valor) => {
        setFiltroRol(valor);
        setQuery("");
        setBusqueda("");
    };

    const cambiarFiltroEstado = (valor) => {
        setFiltroEstado(valor);
        setQuery("");
        setBusqueda("");
    };

    const abrirNuevo = () => {
        setEditandoId(null);
        setForm(vacio);
        setError("");
        setPwdError("");
        setModalAbierto(true);
    };

    // TAREA 3: abrirEditar ya no separa nombre/apellido
    const abrirEditar = useCallback((item) => {
        setEditandoId(item.id);
        setForm({
            usuario:   item.usuario,
            password:  "",              // TAREA 2: campo vacío al editar — se preserva si no cambia
            nombre:    item.nombre,
            correo:    item.correo,
            codigo:    item.codigo   || "",
            telefono:  item.telefono || "",
            rol:       item.rol,
            programa:  item.programa,
            estado:    item.estado   || "Activo"
        });
        setError("");
        setPwdError("");
        setModalAbierto(true);
    }, []);

    const cerrar = () => {
        setModalAbierto(false);
        setError("");
        setPwdError("");
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (e.target.name === "password") setPwdError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // TAREA 9: validar contraseña en creación
        if (editandoId === null && !form.password.trim()) {
            setPwdError("La contraseña es obligatoria para crear un usuario.");
            return;
        }
        if (editandoId === null && form.password.trim().length < 6) {
            setPwdError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        const usuarioExiste = items.some(
            (item) =>
                item.usuario.toLowerCase() === form.usuario.trim().toLowerCase() &&
                item.id !== editandoId
        );
        if (usuarioExiste) {
            setError("El nombre de usuario ya está en uso.");
            return;
        }

        if (editandoId === null) {
            // Crear nuevo usuario
            const nuevo = {
                id:       Date.now(),
                usuario:  form.usuario.trim(),
                password: form.password.trim(),
                nombre:   form.nombre.trim(),       // TAREA 3: nombre completo directo
                correo:   form.correo.trim(),
                codigo:   form.codigo.trim(),
                telefono: form.telefono.trim(),
                rol:      form.rol,
                programa: form.programa.trim(),
                estado:   form.estado
            };
            const lista = [nuevo, ...items];
            setItems(lista);
            guardarUsuarios(lista);
            mostrarAviso("Usuario creado correctamente.");
        } else {
            // Editar usuario existente
            const lista = items.map((item) => {
                if (item.id !== editandoId) return item;
                return {
                    ...item,
                    usuario:  form.usuario.trim(),
                    // TAREA 2: preservar contraseña anterior si el campo queda vacío
                    password: form.password.trim() || item.password,
                    nombre:   form.nombre.trim(),   // TAREA 3: nombre completo directo
                    correo:   form.correo.trim(),
                    codigo:   form.codigo.trim(),
                    telefono: form.telefono.trim(),
                    rol:      form.rol,
                    programa: form.programa.trim(),
                    estado:   form.estado
                };
            });
            setItems(lista);
            guardarUsuarios(lista);
            mostrarAviso("Usuario actualizado correctamente.");
        }

        setModalAbierto(false);
    };

    const alternarEstado = useCallback((item) => {
        const activando = item.estado !== "Activo";
        const lista = items.map((u) =>
            u.id === item.id
                ? { ...u, estado: activando ? "Activo" : "Inactivo" }
                : u
        );
        setItems(lista);
        guardarUsuarios(lista);
        mostrarAviso(
            activando
                ? `Usuario "${item.usuario}" activado.`
                : `Usuario "${item.usuario}" desactivado.`
        );
    }, [items, mostrarAviso]);

    // TAREA 1: columnas con avatar por fila (sin foto de sesión)
    const columns = useMemo(() => [
        {
            key: "nombre",
            label: "Usuario",
            render: (row) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        className="users__avatar"
                        style={avatarStylePorNombre()}
                        aria-label={row.nombre || "Usuario"}
                    >
                        {inicialesPorNombre(row.nombre)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600 }}>{row.nombre}</div>
                        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                            {row.correo}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: "rol",
            label: "Rol",
            render: (row) => (
                <span className={`users__item-badge ${ROL_CLASE[row.rol] || "blue"}`}>
                    {row.rol}
                </span>
            )
        },
        {
            key: "estado",
            label: "Estado",
            render: (row) => (
                <span
                    className={
                        row.estado === "Activo"
                            ? "users__item-state users__item-state--active"
                            : "users__item-state users__item-state--inactive"
                    }
                >
                    {row.estado}
                </span>
            )
        },
        {
            key: "programa",
            label: "Programa"
        },
        {
            key: "acciones",
            label: "Acciones",
            render: (row) => (
                <div className="dtable__actions">
                    <button
                        className="users__edit-button"
                        onClick={() => abrirEditar(row)}
                    >
                        <Icon name="perfil" size={12} /> Editar
                    </button>
                    <button
                        className={
                            row.estado === "Activo"
                                ? "users__deactivate-button"
                                : "users__activate-button"
                        }
                        onClick={() => alternarEstado(row)}
                    >
                        {row.estado === "Activo" ? "Desactivar" : "Activar"}
                    </button>
                </div>
            )
        }
    ], [abrirEditar, alternarEstado]);

    return (
        <div className="page">
            <div className="page__header">
                <div className="page__title">
                    <p>Administra usuarios, roles y estados de acceso.</p>
                </div>
                <button className="button button--accent button--md" onClick={abrirNuevo}>
                    <Icon name="usuarios" size={15} />
                    Nuevo usuario
                </button>
            </div>

            {aviso && (
                <div className="toast toast--success">
                    <Icon name="info" size={14} />
                    {aviso}
                </div>
            )}

            {/* Summary */}
            <div className="summary">
                <button
                    className={
                        filtroRol === "" && filtroEstado === ""
                            ? "summary__card summary__card--active"
                            : "summary__card"
                    }
                    onClick={() => { cambiarFiltroRol(""); cambiarFiltroEstado(""); }}
                >
                    <div className="summary__icon users__summary-icon--all">
                        <Icon name="usuarios" size={19} />
                    </div>
                    <div>
                        <div className="summary__number">{items.length}</div>
                        <div className="summary__label">Total usuarios</div>
                    </div>
                </button>

                <button
                    className={
                        filtroEstado === "Activo"
                            ? "summary__card summary__card--active"
                            : "summary__card"
                    }
                    onClick={() => cambiarFiltroEstado(filtroEstado === "Activo" ? "" : "Activo")}
                >
                    <div className="summary__icon users__summary-icon--green">
                        <Icon name="estudiante" size={19} />
                    </div>
                    <div>
                        <div className="summary__number">{activos}</div>
                        <div className="summary__label">Activos</div>
                    </div>
                </button>

                <button
                    className={
                        filtroEstado === "Inactivo"
                            ? "summary__card summary__card--active"
                            : "summary__card"
                    }
                    onClick={() => cambiarFiltroEstado(filtroEstado === "Inactivo" ? "" : "Inactivo")}
                >
                    <div className="summary__icon users__summary-icon--gray">
                        <Icon name="usuarios" size={19} />
                    </div>
                    <div>
                        <div className="summary__number">{inactivos}</div>
                        <div className="summary__label">Inactivos</div>
                    </div>
                </button>

                {ROLES.map((rol) => (
                    <button
                        key={rol.nombre}
                        className={
                            filtroRol === rol.nombre
                                ? "summary__card summary__card--active"
                                : "summary__card"
                        }
                        onClick={() => cambiarFiltroRol(filtroRol === rol.nombre ? "" : rol.nombre)}
                    >
                        <div className={`summary__icon users__summary-icon--${ROL_CLASE[rol.nombre] || "blue"}`}>
                            <Icon name={ROL_ICONO[rol.nombre] || "usuarios"} size={19} />
                        </div>
                        <div>
                            <div className="summary__number">{contarRol(rol.nombre)}</div>
                            <div className="summary__label">{rol.nombre}</div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="filters">
                <div className="filters__grid">
                    <div className="filters__group filters__group--search">
                        <label htmlFor="users-search">Buscar</label>
                        <SearchBar
                            id="users-search"
                            placeholder="Buscar usuario…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onSearch={() => setBusqueda(query)}
                            suggestions={sugerencias}
                        />
                    </div>

                    <div className="filters__group">
                        <label htmlFor="users-rol">Rol</label>
                        {/* TAREA 8: onChange limpia búsqueda */}
                        <select
                            id="users-rol"
                            className="users__filter-select"
                            value={filtroRol}
                            onChange={(e) => cambiarFiltroRol(e.target.value)}
                        >
                            <option value="">Todos</option>
                            {ROLES.map((rol) => (
                                <option key={rol.nombre} value={rol.nombre}>
                                    {rol.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filters__group">
                        <label htmlFor="users-estado">Estado</label>
                        {/* TAREA 8: onChange limpia búsqueda */}
                        <select
                            id="users-estado"
                            className="users__filter-select"
                            value={filtroEstado}
                            onChange={(e) => cambiarFiltroEstado(e.target.value)}
                        >
                            <option value="">Todos</option>
                            {ESTADOS.map((est) => (
                                <option key={est} value={est}>{est}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* TAREA 4: contador usa porEstado.length (que ya incluye búsqueda) */}
            {porEstado.length > 0 && (
                <div className="list-header">
                    <h2>Usuarios del sistema</h2>
                    <span className="list-header__meta">
                        {desde}–{hasta} de {porEstado.length} registros
                    </span>
                </div>
            )}

            {itemsPagina.length === 0 ? (
                <div className="empty">
                    No se encontraron usuarios con los filtros aplicados.
                </div>
            ) : (
                <>
                    <DataTable
                        columns={columns}
                        rows={itemsPagina}
                        keyField="id"
                        emptyMessage="No hay registros para mostrar."
                    />
                    <Pagination
                        pagina={pagina}
                        totalPaginas={totalPaginas}
                        onChange={setPagina}
                        desde={desde}
                        hasta={hasta}
                        total={porEstado.length}
                    />
                </>
            )}

            {/* Modal crear/editar */}
            <Modal
                isOpen={modalAbierto}
                title={editandoId === null ? "Nuevo usuario" : "Editar usuario"}
                subtitle="Completa los datos del usuario."
                onClose={cerrar}
            >
                <form onSubmit={handleSubmit}>
                    {error && <p className="users__error">{error}</p>}

                    <div className="users__form-group">
                        <label htmlFor="u-usuario">Usuario</label>
                        <input
                            id="u-usuario"
                            type="text"
                            name="usuario"
                            value={form.usuario}
                            onChange={handleChange}
                            placeholder="ej. jperez"
                        />
                    </div>

                    {/* TAREA 3: campo único "Nombre completo" */}
                    <div className="users__form-group">
                        <label htmlFor="u-nombre">Nombre completo</label>
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
                            <label htmlFor="u-correo">Correo</label>
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
                            <label htmlFor="u-programa">Programa / Dependencia</label>
                            <input
                                id="u-programa"
                                type="text"
                                name="programa"
                                value={form.programa}
                                onChange={handleChange}
                                placeholder="ej. Ingeniería de Sistemas"
                            />
                        </div>
                    </div>

                    {/* TAREA 2 & 9: campo contraseña con validación y hint */}
                    <div className="users__form-group">
                        <label htmlFor="u-password">
                            {editandoId === null
                                ? "Contraseña *"
                                : "Contraseña (dejar vacío para conservar la actual)"}
                        </label>
                        <div className="users__password-wrap">
                            <input
                                id="u-password"
                                type={mostrarPass ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder={editandoId === null ? "mín. 6 caracteres" : "••••••••"}
                            />
                            <button
                                type="button"
                                className="users__password-toggle"
                                onClick={() => setMostrarPass((v) => !v)}
                            >
                                {mostrarPass ? "Ocultar" : "Mostrar"}
                            </button>
                        </div>
                        {pwdError && (
                            <p className="users__pwd-error">{pwdError}</p>
                        )}
                        {editandoId !== null && (
                            <p className="users__password-hint">
                                Si dejas este campo vacío, la contraseña actual se conservará sin cambios.
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
                                {ESTADOS.map((est) => (
                                    <option key={est} value={est}>{est}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="modal__footer">
                        <button
                            type="button"
                            className="button button--ghost button--md"
                            onClick={cerrar}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="button button--accent button--md"
                            disabled={
                                !form.usuario ||
                                !form.nombre  ||
                                !form.correo  ||
                                !form.programa
                            }
                        >
                            {editandoId === null ? "Crear usuario" : "Guardar cambios"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default Usuarios;
