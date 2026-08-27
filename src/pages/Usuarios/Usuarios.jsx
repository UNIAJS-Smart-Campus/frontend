import { useState } from "react";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Modal from "../../components/Modal/Modal";
import DataTable from "../../components/DataTable/DataTable";
import Pagination from "../../components/Pagination/Pagination";
import useSearch from "../../hooks/useSearch";
import usePagination from "../../hooks/usePagination";
import SearchBar from "../../components/SearchBar/SearchBar";
import {
    ROLES,
    obtenerUsuarios,
    guardarUsuarios
} from "../../utils/users";
import "./Usuarios.css";

const vacio = {
    usuario: "",
    password: "",
    nombre: "",
    correo: "",
    rol: "Estudiante",
    programa: ""
};

function Usuarios() {
    const [items, setItems] = useState(obtenerUsuarios);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [form, setForm] = useState(vacio);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");

    const filtrados = useSearch(items, query, [
        "usuario",
        "nombre",
        "correo",
        "rol",
        "programa"
    ]);

    const { pagina, setPagina, totalPaginas, itemsPagina, desde, hasta } =
        usePagination(filtrados, 10);

    const abrirNuevo = () => {
        setEditandoId(null);
        setForm(vacio);
        setError("");
        setModalAbierto(true);
    };

    const abrirEditar = (item) => {
        setEditandoId(item.id);
        setForm({
            usuario: item.usuario,
            password: item.password,
            nombre: item.nombre,
            correo: item.correo,
            rol: item.rol,
            programa: item.programa
        });
        setError("");
        setModalAbierto(true);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

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
                ...form,
                estado: "Activo"
            };

            const lista = [nuevo, ...items];

            setItems(lista);
            guardarUsuarios(lista);
        } else {
            const lista = items.map((item) =>
                item.id === editandoId ? { ...item, ...form } : item
            );

            setItems(lista);
            guardarUsuarios(lista);
        }

        setModalAbierto(false);
    };

    const alternarEstado = (item) => {
        const lista = items.map((usuario) =>
            usuario.id === item.id
                ? {
                      ...usuario,
                      estado:
                          usuario.estado === "Activo" ? "Inactivo" : "Activo"
                  }
                : usuario
        );

        setItems(lista);
        guardarUsuarios(lista);
    };

    const activos = items.filter((item) => item.estado === "Activo").length;

    return (
        <div className="usuarios">
            <div className="usuarios__stats">
                <article className="usuarios__stat">
                    <strong className="usuarios__stat-value">{items.length}</strong>
                    <span className="usuarios__stat-label">Total de usuarios</span>
                </article>

                <article className="usuarios__stat">
                    <strong className="usuarios__stat-value">{activos}</strong>
                    <span className="usuarios__stat-label">Usuarios activos</span>
                </article>

                <article className="usuarios__stat">
                    <strong className="usuarios__stat-value">{ROLES.length}</strong>
                    <span className="usuarios__stat-label">Roles definidos</span>
                </article>
            </div>

            <div className="usuarios__toolbar">
                <div className="usuarios__search">
                    <SearchBar
                        placeholder="Buscar por usuario, nombre, correo o rol…"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPagina(1);
                        }}
                        id="usuarios-search"
                    />
                </div>

                <span className="usuarios__count">
                    {activos} activos de {items.length}
                </span>

                <Button variant="primary" size="sm" onClick={abrirNuevo}>
                    + Nuevo usuario
                </Button>
            </div>

            <DataTable
                columns={[
                    { label: "Usuario", key: "usuario", strong: true },
                    { label: "Nombre", key: "nombre" },
                    { label: "Correo", key: "correo" },
                    {
                        label: "Rol",
                        render: (item) => (
                            <span
                                className={`usuarios__rol usuarios__rol--${item.rol.toLowerCase()}`}
                            >
                                {item.rol}
                            </span>
                        )
                    },
                    {
                        label: "Estado",
                        render: (item) => (
                            <span
                                className={
                                    item.estado === "Activo"
                                        ? "usuarios__estado usuarios__estado--activo"
                                        : "usuarios__estado usuarios__estado--inactivo"
                                }
                            >
                                {item.estado}
                            </span>
                        )
                    },
                    {
                        label: "Acciones",
                        render: (item) => (
                            <div className="dtable__actions">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => abrirEditar(item)}
                                >
                                    Editar
                                </Button>

                                <Button
                                    variant={
                                        item.estado === "Activo"
                                            ? "outline"
                                            : "primary"
                                    }
                                    size="sm"
                                    onClick={() => alternarEstado(item)}
                                >
                                    {item.estado === "Activo"
                                        ? "Desactivar"
                                        : "Activar"}
                                </Button>
                            </div>
                        )
                    }
                ]}
                rows={itemsPagina}
                emptyMessage="No se encontraron usuarios con la búsqueda aplicada."
            />

            <Pagination
                pagina={pagina}
                totalPaginas={totalPaginas}
                onChange={setPagina}
                desde={desde}
                hasta={hasta}
                total={filtrados.length}
            />

            <Modal
                isOpen={modalAbierto}
                title={editandoId === null ? "Nuevo usuario" : "Editar usuario"}
                onClose={() => setModalAbierto(false)}
            >
                <form className="usuarios__form" onSubmit={handleSubmit}>
                    {error && <p className="usuarios__error">{error}</p>}

                    <Input
                        label="Usuario"
                        type="text"
                        name="usuario"
                        value={form.usuario}
                        onChange={handleChange}
                        placeholder="ej. jperez"
                        id="usuario-nombre-usuario"
                    />

                    <Input
                        label="Contraseña"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        id="usuario-password"
                    />

                    <Input
                        label="Nombre completo"
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder="Nombre y apellido"
                        id="usuario-nombre"
                    />

                    <Input
                        label="Correo institucional"
                        type="email"
                        name="correo"
                        value={form.correo}
                        onChange={handleChange}
                        placeholder="usuario@uajs.edu.co"
                        id="usuario-correo"
                    />

                    <div className="usuarios__form-row">
                        <label className="usuarios__label" htmlFor="usuario-rol">
                            Rol
                        </label>
                        <select
                            className="usuarios__select"
                            name="rol"
                            id="usuario-rol"
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

                    <Input
                        label="Programa / Dependencia"
                        type="text"
                        name="programa"
                        value={form.programa}
                        onChange={handleChange}
                        placeholder="ej. Ingeniería de Sistemas"
                        id="usuario-programa"
                    />

                    <Button
                        variant="primary"
                        type="submit"
                        disabled={
                            !form.usuario ||
                            !form.password ||
                            !form.nombre ||
                            !form.correo ||
                            !form.programa
                        }
                    >
                        {editandoId === null ? "Crear usuario" : "Guardar cambios"}
                    </Button>
                </form>
            </Modal>
        </div>
    );
}

export default Usuarios;
