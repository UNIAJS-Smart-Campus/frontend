import { useState } from "react";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Modal from "../../components/Modal/Modal";
import useSearch from "../../hooks/useSearch";
import useAuth from "../../context/useAuth";
import eventos, { CATEGORIAS_EVENTO } from "../../utils/eventos";
import "./Eventos.css";

const formVacio = {
    nombre: "",
    fecha: "",
    hora: "",
    lugar: "",
    categoria: "Académico",
    descripcion: ""
};

function Eventos() {
    const [query, setQuery] = useState("");
    const [items, setItems] = useState(eventos);
    const [crearAbierto, setCrearAbierto] = useState(false);
    const [form, setForm] = useState(formVacio);

    const { puede } = useAuth();
    const puedePublicar = puede("publicar_eventos");

    const filtrados = useSearch(
        items,
        query,
        ["nombre", "lugar", "categoria", "descripcion"]
    );

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCrear = (e) => {
        e.preventDefault();

        const nuevo = {
            id: Date.now(),
            ...form
        };

        setItems([nuevo, ...items]);
        setCrearAbierto(false);
        setForm(formVacio);
    };

    return (
        <div className="eventos">
            <header className="eventos__header">
                <h1 className="eventos__title">Eventos</h1>
                <p className="eventos__subtitle">
                    Actividades académicas y culturales de la comunidad
                    universitaria.
                </p>
            </header>

            <div className="eventos__toolbar">
                <div className="eventos__search">
                    <Input
                        type="search"
                        placeholder="Buscar evento por nombre, lugar o categoría…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        id="eventos-search"
                    />
                </div>

                {puedePublicar && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setCrearAbierto(true)}
                    >
                        + Publicar evento
                    </Button>
                )}
            </div>

            <div className="eventos__grid">
                {filtrados.map((evento) => (
                    <article className="eventos__card" key={evento.id}>
                        <div className="eventos__card-top">
                            <span className="eventos__categoria">
                                {evento.categoria}
                            </span>

                            <span className="eventos__hora">{evento.hora}</span>
                        </div>

                        <h2 className="eventos__nombre">{evento.nombre}</h2>

                        <p className="eventos__descripcion">
                            {evento.descripcion}
                        </p>

                        <div className="eventos__meta">
                            <span className="eventos__meta-item">
                                📅 {evento.fecha}
                            </span>
                            <span className="eventos__meta-item">
                                📍 {evento.lugar}
                            </span>
                        </div>
                    </article>
                ))}
            </div>

            {filtrados.length === 0 && (
                <p className="eventos__empty">
                    No se encontraron eventos para «{query}».
                </p>
            )}

            <Modal
                isOpen={crearAbierto}
                title="Publicar evento"
                onClose={() => setCrearAbierto(false)}
            >
                <form className="eventos__form" onSubmit={handleCrear}>
                    <Input
                        label="Nombre del evento"
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder="ej. Conferencia de inteligencia artificial"
                        id="evento-nombre"
                    />

                    <div className="eventos__form-row">
                        <Input
                            label="Fecha"
                            type="date"
                            name="fecha"
                            value={form.fecha}
                            onChange={handleChange}
                            id="evento-fecha"
                        />

                        <Input
                            label="Hora"
                            type="time"
                            name="hora"
                            value={form.hora}
                            onChange={handleChange}
                            id="evento-hora"
                        />
                    </div>

                    <Input
                        label="Lugar"
                        type="text"
                        name="lugar"
                        value={form.lugar}
                        onChange={handleChange}
                        placeholder="ej. Auditorio principal"
                        id="evento-lugar"
                    />

                    <div className="eventos__form-row">
                        <label className="eventos__label" htmlFor="evento-categoria">
                            Categoría
                        </label>
                        <select
                            className="eventos__select"
                            name="categoria"
                            id="evento-categoria"
                            value={form.categoria}
                            onChange={handleChange}
                        >
                            {CATEGORIAS_EVENTO.map((categoria) => (
                                <option key={categoria} value={categoria}>
                                    {categoria}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Descripción"
                        type="textarea"
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        placeholder="Describe la actividad"
                        id="evento-descripcion"
                    />

                    <Button
                        variant="primary"
                        type="submit"
                        disabled={
                            !form.nombre || !form.fecha || !form.hora || !form.lugar
                        }
                    >
                        Publicar evento
                    </Button>
                </form>
            </Modal>
        </div>
    );
}

export default Eventos;