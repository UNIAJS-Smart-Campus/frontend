import { useState } from "react";
import Icon from "../../components/Icon/Icon";
import SearchBar from "../../components/SearchBar/SearchBar";
import { ROLES, obtenerUsuarios, guardarUsuarios } from "../../utils/users";
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

    const normalizar = (texto) =>
        texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const porRol = filtroRol
        ? items.filter((item) => item.rol === filtroRol)
        : items;

    const porEstado = filtroEstado
        ? porRol.filter((item) => item.estado === filtroEstado)
        : porRol;

    const encontrados = busqueda.trim()
        ? porEstado.filter((item) =>
              [item.usuario, item.nombre, item.correo, item.rol, item.programa]
                  .join(" ")
                  .toLowerCase()
                  .includes(normalizar(busqueda))
          )
        : porEstado;

    const activos = items.filter((item) => item.estado === "Activo").length;
    const contarRol = (rol) => items.filter((item) => item.rol === rol).length;

    const sugerencias = [
        ...new Set(
            items
                .flatMap((item) => [item.usuario, item.nombre, item.correo, item.rol, item.programa])
                .filter(Boolean)
        )
    ];

    const iniciales = (nombre) =>
        (nombre || "?")
            .split(" ")
            .filter(Boolean)
            .map((parte) => parte.charAt(0).toUpperCase())
            .slice(0, 2)
            .join("");

    const mostrarAviso = (mensaje) => {
        setAviso(mensaje);
        setTimeout(() => setAviso(""), 2500);
    };

    const abrirNuevo = () => {
        setEditandoId(null);
        setForm(vacio);
        setError("");
        setModalAbierto(true);
    };

    const abrirEditar = (item) => {
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
    };

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

    const alternarEstado = (item) => {
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
    };

    return (
        <div className="users">
            <div className="users__page-header">
                <div className="users__page-title">
                    <h1>Usuarios</h1>
                    <p>Administra usuarios, roles y estados de acceso.</p>
                </div>

                <button className="users__new-button" onClick={abrirNuevo}>
                    <Icon name="usuarios" size={15} />
                    Nuevo usuario
                </button>
            </div>

            {aviso && (
                <div className="users__toast">
                    <Icon name="info" size={14} />
                    {aviso}
                </div>
            )}

            <div className="users__summary">
                <button
                    className={
                        filtroRol === ""
                            ? "users__summary-card users__summary-card--active"
                            : "users__summary-card"
                    }
                    onClick={() => setFiltroRol("")}
                >
                    <div className="users__summary-icon users__summary-icon--all">
                        <Icon name="usuarios" size={19} />
                    </div>
                    <div>
                        <div className="users__summary-label">Total usuarios</div>
                        <div className="users__summary-number">{items.length}</div>
                    </div>
                </button>

                <button
                    className={
                        filtroEstado === "Activo"
                            ? "users__summary-card users__summary-card--active"
                            : "users__summary-card"
                    }
                    onClick={() =>
                        setFiltroEstado(filtroEstado === "Activo" ? "" : "Activo")
                    }
                >
                    <div className="users__summary-icon users__summary-icon--green">
                        <Icon name="estudiante" size={19} />
                    </div>
                    <div>
                        <div className="users__summary-label">Activos</div>
                        <div className="users__summary-number">{activos}</div>
                    </div>
                </button>

                {ROLES.map((rol) => (
                    <button
                        key={rol.nombre}
                        className={
                            filtroRol === rol.nombre
                                ? "users__summary-card users__summary-card--active"
                                : "users__summary-card"
                        }
                        onClick={() =>
                            setFiltroRol(
                                filtroRol === rol.nombre ? "" : rol.nombre
                            )
                        }
                    >
                        <div
                            className={`users__summary-icon users__summary-icon--${ROL_CLASE[rol.nombre] || "blue"}`}
                        >
                            <Icon name={ROL_ICONO[rol.nombre] || "usuarios"} size={19} />
                        </div>
                        <div>
                            <div className="users__summary-label">{rol.nombre}</div>
                            <div className="users__summary-number">
                                {contarRol(rol.nombre)}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="users__filter-card">
                <div className="users__filters">
                    <div className="users__filter-group users__filter-group--search">
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

                    <div className="users__filter-group">
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

                    <div className="users__filter-group">
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

            <div className="users__list-header">
                <h2>Usuarios del sistema</h2>
                <span>{encontrados.length} registros</span>
            </div>

            {encontrados.length === 0 ? (
                <div className="users__empty">
                    No se encontraron usuarios con los filtros aplicados.
                </div>
            ) : (
                <div className="users__list">
                    {encontrados.map((item) => (
                        <article className="users__item" key={item.id}>
                            <div className="users__avatar">{iniciales(item.nombre)}</div>

                            <div className="users__item-body">
                                <h3>{item.nombre}</h3>
                                <div className="users__item-mail">
                                    <Icon name="solicitudes" size={11} />
                                    {item.correo}
                                </div>

                                <div className="users__item-meta">
                                    <span
                                        className={`users__item-badge ${ROL_CLASE[item.rol] || "blue"}`}
                                    >
                                        {item.rol}
                                    </span>
                                    <span
                                        className={
                                            item.estado === "Activo"
                                                ? "users__item-state users__item-state--active"
                                                : "users__item-state users__item-state--inactive"
                                        }
                                    >
                                        {item.estado}
                                    </span>
                                    <span className="users__item-chip">
                                        @{item.usuario}
                                    </span>
                                </div>
                            </div>

                            <div className="users__item-actions">
                                <button
                                    className="users__edit-button"
                                    onClick={() => abrirEditar(item)}
                                >
                                    <Icon name="perfil" size={12} />
                                    Editar
                                </button>
                                <button
                                    className={
                                        item.estado === "Activo"
                                            ? "users__deactivate-button"
                                            : "users__activate-button"
                                    }
                                    onClick={() => alternarEstado(item)}
                                >
                                    {item.estado === "Activo"
                                        ? "Desactivar"
                                        : "Activar"}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {modalAbierto && (
                <div className="users__overlay" onClick={cerrar}>
                    <div
                        className="users__modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="users__modal-header">
                            <div>
                                <h2>
                                    {editandoId === null
                                        ? "Nuevo usuario"
                                        : "Editar usuario"}
                                </h2>
                                <p>Completa los datos del usuario.</p>
                            </div>
                            <button
                                className="users__modal-close"
                                onClick={cerrar}
                            >
                                ×
                            </button>
                        </div>

                        <form className="users__form" onSubmit={handleSubmit}>
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

                            <div className="users__form-grid">
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

                            <div className="users__form-grid">
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

                            <div className="users__form-grid">
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

                            <div className="users__form-grid">
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

                            <div className="users__modal-actions">
                                <button
                                    type="button"
                                    className="users__cancel-button"
                                    onClick={cerrar}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="users__confirm-button"
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
