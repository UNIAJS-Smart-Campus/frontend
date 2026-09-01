import { useCallback, useMemo, useState } from "react";
import Icon from "../../components/Icon/Icon";
import SearchBar from "../../components/SearchBar/SearchBar";
import DataTable from "../../components/DataTable/DataTable";
import Pagination from "../../components/Pagination/Pagination";
import { ROLES, obtenerUsuarios, guardarUsuarios } from "../../utils/users";
import useSearch from "../../hooks/useSearch";
import usePagination from "../../hooks/usePagination";
import { getAvatarStyle, getUserInitials, getUserPhoto } from "../../utils/avatar";
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

const vacio = {
    usuario: "",
    password: "",
    nombre: "",
    apellido: "",
    correo: "",
    codigo: "",
    telefono: "",
    rol: "Estudiante",
    programa: "",
    estado: "Activo"
};

function Usuarios() {
    const [items, setItems] = useState(obtenerUsuarios);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [form, setForm] = useState(vacio);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [filtroRol, setFiltroRol] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [aviso, setAviso] = useState("");
    const [mostrarPass, setMostrarPass] = useState(false);

    const buscados = useSearch(items, busqueda, ["usuario", "nombre", "correo", "rol", "programa"]);

    const porRol = filtroRol
        ? buscados.filter((item) => item.rol === filtroRol)
        : buscados;

    const porEstado = filtroEstado
        ? porRol.filter((item) => item.estado === filtroEstado)
        : porRol;

    const { pagina, setPagina, totalPaginas, itemsPagina, desde, hasta } = usePagination(porEstado, 8);

    const iniciales = (nombre) => getUserInitials(nombre, "?");

    const activos = items.filter((item) => item.estado === "Activo").length;
    const contarRol = (rol) => items.filter((item) => item.rol === rol).length;

    const sugerencias = useMemo(() => {
        return [
            ...new Set(
                items
                    .flatMap((item) => [item.usuario, item.nombre, item.correo, item.rol, item.programa])
                    .filter(Boolean)
            )
        ];
    }, [items]);

    const mostrarAviso = useCallback((mensaje) => {
        setAviso(mensaje);
        setTimeout(() => setAviso(""), 2500);
    }, []);

    const abrirNuevo = () => {
        setEditandoId(null);
        setForm(vacio);
        setError("");
        setModalAbierto(true);
    };

    const abrirEditar = useCallback((item) => {
        const partes = (item.nombre || "").split(" ");
        const nombre = partes.length > 1 ? partes.slice(0, -1).join(" ") : partes[0] || "";
        const apellido = partes.length > 1 ? partes[partes.length - 1] : "";

        setEditandoId(item.id);
        setForm({
            usuario: item.usuario,
            password: item.password,
            nombre,
            apellido,
            correo: item.correo,
            codigo: item.codigo || "",
            telefono: item.telefono || "",
            rol: item.rol,
            programa: item.programa,
            estado: item.estado || "Activo"
        });
        setError("");
        setModalAbierto(true);
    }, []);

    const cerrar = () => {
        setModalAbierto(false);
        setError("");
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const nombreCompleto =
            `${form.nombre} ${form.apellido}`.trim() || form.nombre.trim();

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
            const nuevo = {
                id: Date.now(),
                usuario: form.usuario,
                password: form.password || "uajs123",
                nombre: nombreCompleto,
                correo: form.correo,
                codigo: form.codigo,
                telefono: form.telefono,
                rol: form.rol,
                programa: form.programa,
                estado: form.estado
            };
            const lista = [nuevo, ...items];
            setItems(lista);
            guardarUsuarios(lista);
            mostrarAviso("Usuario creado correctamente.");
        } else {
            const lista = items.map((item) =>
                item.id === editandoId
                    ? {
                          ...item,
                          usuario: form.usuario,
                          password: form.password,
                          nombre: nombreCompleto,
                          correo: form.correo,
                          codigo: form.codigo,
                          telefono: form.telefono,
                          rol: form.rol,
                          programa: form.programa,
                          estado: form.estado
                      }
                    : item
            );
            setItems(lista);
            guardarUsuarios(lista);
            mostrarAviso("Usuario actualizado correctamente.");
        }

        setModalAbierto(false);
    };

    const alternarEstado = useCallback((item) => {
        const activando = item.estado !== "Activo";
        const lista = items.map((usuario) =>
            usuario.id === item.id
                ? {
                      ...usuario,
                      estado: usuario.estado === "Activo" ? "Inactivo" : "Activo"
                  }
                : usuario
        );
        setItems(lista);
        guardarUsuarios(lista);
        mostrarAviso(
            activando
                ? `Usuario "${item.usuario}" activado.`
                : `Usuario "${item.usuario}" desactivado.`
        );
    }, [items, mostrarAviso]);

    const columns = useMemo(() => [
        {
            key: "nombre",
            label: "Usuario",
            render: (row) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        className="users__avatar"
                        style={getAvatarStyle(row.nombre, "linear-gradient(135deg, var(--color-primary-600), var(--color-primary))")}
                        aria-label={row.nombre || "Usuario"}
                    >
                        {!getUserPhoto() && iniciales(row.nombre)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600 }}>{row.nombre}</div>
                        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{row.correo}</div>
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

            <div className="summary">
                <button
                    className={
                        filtroRol === "" && filtroEstado === ""
                            ? "summary__card summary__card--active"
                            : "summary__card"
                    }
                    onClick={() => {
                        setFiltroRol("");
                        setFiltroEstado("");
                    }}
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
                    onClick={() =>
                        setFiltroEstado(filtroEstado === "Activo" ? "" : "Activo")
                    }
                >
                    <div className="summary__icon users__summary-icon--green">
                        <Icon name="estudiante" size={19} />
                    </div>
                    <div>
                        <div className="summary__number">{activos}</div>
                        <div className="summary__label">Activos</div>
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
                        onClick={() =>
                            setFiltroRol(
                                filtroRol === rol.nombre ? "" : rol.nombre
                            )
                        }
                    >
                        <div
                            className={`summary__icon users__summary-icon--${ROL_CLASE[rol.nombre] || "blue"}`}
                        >
                            <Icon name={ROL_ICONO[rol.nombre] || "usuarios"} size={19} />
                        </div>
                        <div>
                            <div className="summary__number">
                                {contarRol(rol.nombre)}
                            </div>
                            <div className="summary__label">{rol.nombre}</div>
                        </div>
                    </button>
                ))}
            </div>

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
                        <select
                            id="users-rol"
                            className="users__filter-select"
                            value={filtroRol}
                            onChange={(e) => setFiltroRol(e.target.value)}
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
                        <select
                            id="users-estado"
                            className="users__filter-select"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                            <option value="">Todos</option>
                            {ESTADOS.map((est) => (
                                <option key={est} value={est}>
                                    {est}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="list-header">
                <h2>Usuarios del sistema</h2>
                <span className="list-header__meta">
                    {desde}–{hasta} de {porEstado.length} registros
                </span>
            </div>

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

            {modalAbierto && (
                <div className="overlay" onClick={cerrar}>
                    <div
                        className="modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal__header">
                            <div>
                                <h2 className="modal__title">
                                    {editandoId === null
                                        ? "Nuevo usuario"
                                        : "Editar usuario"}
                                </h2>
                                <p className="modal__subtitle">Completa los datos del usuario.</p>
                            </div>
                            <button
                                className="modal__close"
                                onClick={cerrar}
                            >
                                ×
                            </button>
                        </div>

                        <form className="modal__body" onSubmit={handleSubmit}>
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

                            <div className="form-grid">
                                <div className="users__form-group">
                                    <label htmlFor="u-nombre">Nombre</label>
                                    <input
                                        id="u-nombre"
                                        type="text"
                                        name="nombre"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        placeholder="Nombre"
                                    />
                                </div>

                                <div className="users__form-group">
                                    <label htmlFor="u-apellido">Apellido</label>
                                    <input
                                        id="u-apellido"
                                        type="text"
                                        name="apellido"
                                        value={form.apellido}
                                        onChange={handleChange}
                                        placeholder="Apellido"
                                    />
                                </div>
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
                                        type="text"
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

                            <div className="users__form-group">
                                <label htmlFor="u-password">
                                    {editandoId === null
                                        ? "Contraseña"
                                        : "Contraseña (dejar en blanco para no cambiar)"}
                                </label>
                                <div className="users__password-wrap">
                                    <input
                                        id="u-password"
                                        type={mostrarPass ? "text" : "password"}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="users__password-toggle"
                                        onClick={() => setMostrarPass(!mostrarPass)}
                                        title={mostrarPass ? "Ocultar" : "Mostrar"}
                                    >
                                        {mostrarPass ? "Ocultar" : "Mostrar"}
                                    </button>
                                </div>
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
                                            <option
                                                key={rol.nombre}
                                                value={rol.nombre}
                                            >
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
                                            <option key={est} value={est}>
                                                {est}
                                            </option>
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
                                        !form.nombre ||
                                        !form.correo ||
                                        !form.programa
                                    }
                                >
                                    {editandoId === null
                                        ? "Crear usuario"
                                        : "Guardar cambios"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Usuarios;
