import { useState } from "react";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Modal from "../../components/Modal/Modal";
import DataTable from "../../components/DataTable/DataTable";
import Pagination from "../../components/Pagination/Pagination";
import useSearch from "../../hooks/useSearch";
import usePagination from "../../hooks/usePagination";
import SearchBar from "../../components/SearchBar/SearchBar";
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

    const { pagina, setPagina, totalPaginas, itemsPagina, desde, hasta } =
        usePagination(filtrados, 10);

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
            <div className="eventos__toolbar">
                <div className="eventos__search">
                    <SearchBar
                        placeholder="Buscar evento por nombre, lugar o categoría…"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPagina(1);
                        }}
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

            <DataTable
                columns={[
                    { label: "Evento", key: "nombre", strong: true },
                    {
                        label: "Categoría",
                        render: (evento) => (
                            <span className="eventos__categoria">
                                {evento.categoria}
                            </span>
                        )
                    },
                    { label: "Fecha", key: "fecha" },
                    { label: "Hora", key: "hora" },
                    { label: "Lugar", key: "lugar" }
                ]}
                rows={itemsPagina}
                emptyMessage="No se encontraron eventos para la búsqueda aplicada."
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