import { useState } from "react";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Modal from "../../components/Modal/Modal";
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
            <header className="usuarios__header">
                <h1 className="usuarios__title">Gestión de usuarios</h1>
                <p className="usuarios__subtitle">
                    Administra los usuarios de la plataforma, sus roles y
                    permisos de acceso.
                </p>
            </header>

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
                <span className="usuarios__count">
                    {activos} activos de {items.length}
                </span>

                <Button variant="primary" size="sm" onClick={abrirNuevo}>
                    + Nuevo usuario
                </Button>
            </div>

            <div className="usuarios__table">
                <div className="usuarios__row usuarios__row--header">
                    <span className="usuarios__cell">Usuario</span>
                    <span className="usuarios__cell">Nombre</span>
                    <span className="usuarios__cell">Correo</span>
                    <span className="usuarios__cell">Rol</span>
                    <span className="usuarios__cell">Estado</span>
                    <span className="usuarios__cell">Acciones</span>
                </div>

                {items.map((item) => (
                    <div className="usuarios__row" key={item.id}>
                        <span className="usuarios__cell usuarios__cell--code">
                            {item.usuario}
                        </span>
                        <span className="usuarios__cell usuarios__cell--name">
                            {item.nombre}
                        </span>
                        <span className="usuarios__cell">{item.correo}</span>
                        <span className="usuarios__cell">
                            <span
                                className={`usuarios__rol usuarios__rol--${item.rol.toLowerCase()}`}
                            >
                                {item.rol}
                            </span>
                        </span>
                        <span className="usuarios__cell">
                            <span
                                className={
                                    item.estado === "Activo"
                                        ? "usuarios__estado usuarios__estado--activo"
                                        : "usuarios__estado usuarios__estado--inactivo"
                                }
                            >
                                {item.estado}
                            </span>
                        </span>
                        <span className="usuarios__cell usuarios__actions">
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
                        </span>
                    </div>
                ))}
            </div>

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
