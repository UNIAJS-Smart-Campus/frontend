import { useState } from "react";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Modal from "../../components/Modal/Modal";
import useSearch from "../../hooks/useSearch";
import useAuth from "../../context/useAuth";
import recursos, { TIPOS_RECURSO } from "../../utils/recursos";
import "./Recursos.css";

function estadoClase(estado) {
    return estado
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-");
}

const ESTADOS_RECURSO = ["Activo", "Inactivo", "En mantenimiento"];
const DISPONIBILIDADES = ["Disponible", "Ocupado"];

const formVacio = {
    codigo: "",
    nombre: "",
    tipo: "Salas",
    ubicacion: "",
    capacidad: "",
    estado: "Activo",
    disponibilidad: "Disponible"
};

function Recursos() {
    const [query, setQuery] = useState("");
    const [tipo, setTipo] = useState("Todos");
    const [items, setItems] = useState(recursos);
    const [crearAbierto, setCrearAbierto] = useState(false);
    const [form, setForm] = useState(formVacio);

    const { puede } = useAuth();
    const puedeAdministrar = puede("administrar_recursos");

    const filtradosPorTexto = useSearch(
        items,
        query,
        ["codigo", "nombre", "tipo", "ubicacion", "estado"]
    );

    const filtrados = tipo === "Todos"
        ? filtradosPorTexto
        : filtradosPorTexto.filter((recurso) => recurso.tipo === tipo);

    const disponibles = items.filter(
        (recurso) => recurso.disponibilidad === "Disponible"
    ).length;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCrear = (e) => {
        e.preventDefault();

        const nuevo = {
            id: `R-${String(items.length + 1).padStart(3, "0")}`,
            ...form,
            capacidad: Number(form.capacidad) || 1
        };

        setItems([nuevo, ...items]);
        setCrearAbierto(false);
        setForm(formVacio);
    };

    return (
        <div className="recursos">
            <header className="recursos__header">
                <h1 className="recursos__title">Recursos</h1>
                <p className="recursos__subtitle">
                    Catálogo de recursos disponibles de la universidad.
                </p>
            </header>

            <div className="recursos__stats">
                <article className="recursos__stat">
                    <strong className="recursos__stat-value">{items.length}</strong>
                    <span className="recursos__stat-label">Total de recursos</span>
                </article>

                <article className="recursos__stat">
                    <strong className="recursos__stat-value">{disponibles}</strong>
                    <span className="recursos__stat-label">Disponibles</span>
                </article>

                <article className="recursos__stat">
                    <strong className="recursos__stat-value">
                        {items.length - disponibles}
                    </strong>
                    <span className="recursos__stat-label">No disponibles</span>
                </article>
            </div>

            <div className="recursos__filters">
                <div className="recursos__search">
                    <Input
                        type="search"
                        placeholder="Buscar por código, nombre o ubicación…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        id="recursos-search"
                    />
                </div>

                <select
                    className="recursos__select"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                >
                    <option value="Todos">Todos los tipos</option>
                    {TIPOS_RECURSO.map((tipoItem) => (
                        <option key={tipoItem} value={tipoItem}>
                            {tipoItem}
                        </option>
                    ))}
                </select>

                {puedeAdministrar && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setCrearAbierto(true)}
                    >
                        + Nuevo recurso
                    </Button>
                )}
            </div>

            <div className="recursos__table">
                <div className="recursos__row recursos__row--header">
                    <span className="recursos__cell">Código</span>
                    <span className="recursos__cell">Nombre</span>
                    <span className="recursos__cell">Tipo</span>
                    <span className="recursos__cell">Ubicación</span>
                    <span className="recursos__cell">Estado</span>
                    <span className="recursos__cell">Disponibilidad</span>
                </div>

                {filtrados.map((recurso) => (
                    <div className="recursos__row" key={recurso.id}>
                        <span className="recursos__cell recursos__cell--code">
                            {recurso.codigo}
                        </span>
                        <span className="recursos__cell recursos__cell--name">
                            {recurso.nombre}
                        </span>
                        <span className="recursos__cell">{recurso.tipo}</span>
                        <span className="recursos__cell">{recurso.ubicacion}</span>
                        <span className="recursos__cell">
                            <span
                                className={`recursos__estado recursos__estado--${estadoClase(recurso.estado)}`}
                            >
                                {recurso.estado}
                            </span>
                        </span>
                        <span className="recursos__cell">
                            <span
                                className={
                                    recurso.disponibilidad === "Disponible"
                                        ? "recursos__disp recursos__disp--si"
                                        : "recursos__disp recursos__disp--no"
                                }
                            >
                                {recurso.disponibilidad}
                            </span>
                        </span>
                    </div>
                ))}
            </div>

            {filtrados.length === 0 && (
                <p className="recursos__empty">
                    No se encontraron recursos con los filtros aplicados.
                </p>
            )}

            <Modal
                isOpen={crearAbierto}
                title="Nuevo recurso"
                onClose={() => setCrearAbierto(false)}
            >
                <form className="recursos__form" onSubmit={handleCrear}>
                    <Input
                        label="Código"
                        type="text"
                        name="codigo"
                        value={form.codigo}
                        onChange={handleChange}
                        placeholder="ej. REC-301"
                        id="recurso-codigo"
                    />

                    <Input
                        label="Nombre"
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder="ej. Salón 301"
                        id="recurso-nombre"
                    />

                    <div className="recursos__form-row">
                        <label className="recursos__label" htmlFor="recurso-tipo">
                            Tipo
                        </label>
                        <select
                            className="recursos__select"
                            name="tipo"
                            id="recurso-tipo"
                            value={form.tipo}
                            onChange={handleChange}
                        >
                            {TIPOS_RECURSO.map((tipoItem) => (
                                <option key={tipoItem} value={tipoItem}>
                                    {tipoItem}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Ubicación"
                        type="text"
                        name="ubicacion"
                        value={form.ubicacion}
                        onChange={handleChange}
                        placeholder="ej. Bloque A · Piso 2"
                        id="recurso-ubicacion"
                    />

                    <Input
                        label="Capacidad"
                        type="number"
                        name="capacidad"
                        value={form.capacidad}
                        onChange={handleChange}
                        placeholder="ej. 40"
                        id="recurso-capacidad"
                    />

                    <div className="recursos__form-row">
                        <label className="recursos__label" htmlFor="recurso-estado">
                            Estado
                        </label>
                        <select
                            className="recursos__select"
                            name="estado"
                            id="recurso-estado"
                            value={form.estado}
                            onChange={handleChange}
                        >
                            {ESTADOS_RECURSO.map((estadoItem) => (
                                <option key={estadoItem} value={estadoItem}>
                                    {estadoItem}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="recursos__form-row">
                        <label className="recursos__label" htmlFor="recurso-disp">
                            Disponibilidad
                        </label>
                        <select
                            className="recursos__select"
                            name="disponibilidad"
                            id="recurso-disp"
                            value={form.disponibilidad}
                            onChange={handleChange}
                        >
                            {DISPONIBILIDADES.map((disp) => (
                                <option key={disp} value={disp}>
                                    {disp}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button
                        variant="primary"
                        type="submit"
                        disabled={!form.codigo || !form.nombre || !form.ubicacion}
                    >
                        Crear recurso
                    </Button>
                </form>
            </Modal>
        </div>
    );
}

export default Recursos;