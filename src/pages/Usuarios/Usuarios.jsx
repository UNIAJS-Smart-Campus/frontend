import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/Icon/Icon";
import SearchBar from "../../components/SearchBar/SearchBar";
import DataTable from "../../components/DataTable/DataTable";
import Pagination from "../../components/Pagination/Pagination";
import useAuth from "../../context/useAuth";
import { ROLES, alternarEstadoUsuario } from "../../utils/users";
import { getUserInitials } from "../../utils/avatar";
import useSearch from "../../hooks/useSearch";
import usePagination from "../../hooks/usePagination";
import useColeccion from "../../hooks/useColeccion";
import useSugerencias from "../../hooks/useSugerencias";
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
    const { items, recargar, cargando, error: errorColeccion, enLinea } = useColeccion("usuarios");

    const [query, setQuery] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [filtroRol, setFiltroRol] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [aviso, setAviso] = useState("");

    // Pipeline de filtros: búsqueda → rol → estado
    const buscados = useSearch(items, busqueda, [
        "cedula", "usuario", "nombre", "correo", "rol", "programa"
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

    // Respaldo local: se usa si Elasticsearch no responde.
    const sugerenciasLocales = useMemo(() => [
        ...new Set(
            items
                .flatMap((i) => [i.cedula, i.usuario, i.nombre, i.correo, i.rol, i.programa])
                .filter(Boolean)
        )
    ], [items]);
    const sugerencias = useSugerencias(query, "USUARIOS", sugerenciasLocales);

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

    const alternarEstado = useCallback(async (item) => {
        try {
            await alternarEstadoUsuario(item);
            const activando = item.estado !== "Activo";
            mostrarAviso(
                activando
                    ? `Usuario "${item.usuario}" activado.`
                    : `Usuario "${item.usuario}" desactivado.`
            );
            await recargar();
        } catch (err) {
            mostrarAviso(err.message || "Error al cambiar el estado del usuario.");
        }
    }, [mostrarAviso, recargar]);

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
            key: "cedula",
            label: "Cédula",
            render: (row) => row.cedula || "—"
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
                    <Link
                        className="users__edit-button"
                        to={`/usuarios/${row.id}/editar`}
                    >
                        <Icon name="perfil" size={12} /> Editar
                    </Link>
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
    ], [alternarEstado]);

    return (
        <div className="page">
            <div className="page__header">
                <div className="page__title">
                    <p>Administra usuarios, roles y estados de acceso.</p>
                </div>
                <Link to="/usuarios/nuevo" className="button button--accent button--md">
                    <Icon name="usuarios" size={15} />
                    Nuevo usuario
                </Link>
            </div>

            {/* Indicador de estado de conexión */}
            {cargando && (
                <div className="toast toast--info">
                    <Icon name="cargando" size={14} />
                    Sincronizando con el servidor…
                </div>
            )}
            {errorColeccion && !enLinea && (
                <div className="toast toast--warning">
                    <Icon name="alerta" size={14} />
                    Sin conexión al servidor. Mostrando datos locales.
                </div>
            )}

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
                            serverSide
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
        </div>
    );
}

export default Usuarios;