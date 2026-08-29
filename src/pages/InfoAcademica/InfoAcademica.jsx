import { useState } from "react";
import useAuth from "../../context/useAuth";
import Icon from "../../components/Icon/Icon";
import SearchBar from "../../components/SearchBar/SearchBar";
import "./InfoAcademica.css";

const CATEGORIAS = [
    "Aviso académico",
    "Convocatoria",
    "Resultado",
    "Taller",
    "Seminario"
];

const CATEGORIA_ICONO = {
    "Aviso académico": "info",
    Convocatoria: "eventos",
    Resultado: "reportes",
    Taller: "estudiante",
    Seminario: "docente"
};

const CATEGORIA_CLASE = {
    "Aviso académico": "blue",
    Convocatoria: "purple",
    Resultado: "green",
    Taller: "orange",
    Seminario: "red"
};

const publicacionesIniciales = [
    {
        id: 1,
        titulo: "Convocatoria periodo académico 2026-1",
        categoria: "Convocatoria",
        fecha: "2026-03-15",
        autor: "Laura Gómez",
        contenido: "Se abre el período de inscripción para el primer semestre 2026. Los estudiantes deberán completar su matrícula antes del 28 de marzo."
    },
    {
        id: 2,
        titulo: "Taller de Metodología de Investigación",
        categoria: "Taller",
        fecha: "2026-04-10",
        autor: "Laura Gómez",
        contenido: "Se realizará un taller práctico sobre métodos de investigación cuantitativa y cualitativa para estudiantes de posgrado."
    },
    {
        id: 3,
        titulo: "Resultados parciales Cálculo I",
        categoria: "Resultado",
        fecha: "2026-04-22",
        autor: "Laura Gómez",
        contenido: "Se publican los resultados del primer parcial de Cálculo I. Los estudiantes pueden revisar en la plataforma académica."
    }
];

const formVacio = {
    titulo: "",
    categoria: "Aviso académico",
    contenido: ""
};

function InfoAcademica() {
    const [query, setQuery] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [categoria, setCategoria] = useState("");
    const [items, setItems] = useState(publicacionesIniciales);
    const [crearAbierto, setCrearAbierto] = useState(false);
    const [form, setForm] = useState(formVacio);
    const [aviso, setAviso] = useState("");

    const { puede } = useAuth();
    const puedePublicar = puede("publicar_info_academica");

    const normalizar = (texto) =>
        texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filtradasPorCategoria = categoria
        ? items.filter((item) => item.categoria === categoria)
        : items;

    const encontradas = busqueda.trim()
        ? filtradasPorCategoria.filter((item) =>
              [item.titulo, item.categoria, item.contenido, item.autor]
                  .join(" ")
                  .toLowerCase()
                  .includes(normalizar(busqueda))
          )
        : filtradasPorCategoria;

    const contarCategoria = (cat) =>
        cat === ""
            ? items.length
            : items.filter((item) => item.categoria === cat).length;

    const sugerencias = [
        ...new Set(
            items
                .flatMap((item) => [item.titulo, item.categoria, item.autor])
                .filter(Boolean)
        )
    ];

    const fechaLegible = (fecha) => {
        const partes = String(fecha).split("-");
        if (partes.length !== 3) return fecha;
        const meses = [
            "ene", "feb", "mar", "abr", "may", "jun",
            "jul", "ago", "sep", "oct", "nov", "dic"
        ];
        return `${partes[2]} ${meses[Number(partes[1]) - 1]} ${partes[0]}`;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCrear = (e) => {
        e.preventDefault();
        const nueva = {
            id: Date.now(),
            fecha: new Date().toISOString().slice(0, 10),
            autor: "Laura Gómez",
            ...form
        };
        setItems([nueva, ...items]);
        setCrearAbierto(false);
        setForm(formVacio);
        setAviso("Publicación creada correctamente.");
        setTimeout(() => setAviso(""), 2500);
    };

    const cerrar = () => {
        setCrearAbierto(false);
        setForm(formVacio);
    };

    return (
        <div className="info-ac">
            <div className="info-ac__page-header">
                <div className="info-ac__page-title">
                    <h1>Información académica</h1>
                    <p>Consulta los avisos, convocatorias y resultados publicados.</p>
                </div>

                {puedePublicar && (
                    <button
                        className="info-ac__new-button"
                        onClick={() => setCrearAbierto(true)}
                    >
                        <Icon name="estudiante" size={15} />
                        Nueva publicación
                    </button>
                )}
            </div>

            {aviso && (
                <div className="info-ac__toast">
                    <Icon name="info" size={14} />
                    {aviso}
                </div>
            )}

            <div className="info-ac__summary">
                <button
                    className={
                        categoria === ""
                            ? "info-ac__summary-card info-ac__summary-card--active"
                            : "info-ac__summary-card"
                    }
                    onClick={() => setCategoria("")}
                >
                    <div className="info-ac__summary-icon info-ac__summary-icon--all">
                        <Icon name="info" size={19} />
                    </div>
                    <div>
                        <div className="info-ac__summary-label">Todos</div>
                        <div className="info-ac__summary-number">
                            {items.length}
                        </div>
                    </div>
                </button>

                {CATEGORIAS.map((cat) => (
                    <button
                        key={cat}
                        className={
                            categoria === cat
                                ? "info-ac__summary-card info-ac__summary-card--active"
                                : "info-ac__summary-card"
                        }
                        onClick={() => setCategoria(cat)}
                    >
                        <div
                            className={`info-ac__summary-icon info-ac__summary-icon--${CATEGORIA_CLASE[cat] || "blue"}`}
                        >
                            <Icon name={CATEGORIA_ICONO[cat] || "info"} size={19} />
                        </div>
                        <div>
                            <div className="info-ac__summary-label">{cat}</div>
                            <div className="info-ac__summary-number">
                                {contarCategoria(cat)}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="info-ac__filter-card">
                <div className="info-ac__filters">
                    <div className="info-ac__filter-group info-ac__filter-group--search">
                        <label htmlFor="info-search">Buscar</label>
                        <SearchBar
                            id="info-search"
                            placeholder="Título, categoría, contenido o autor…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onSearch={() => setBusqueda(query)}
                            suggestions={sugerencias}
                        />
                    </div>

                    <div className="info-ac__filter-group">
                        <label htmlFor="info-categoria">Categoría</label>
                        <select
                            id="info-categoria"
                            className="info-ac__filter-select"
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                        >
                            <option value="">Todas</option>
                            {CATEGORIAS.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="info-ac__list-header">
                <h2>Publicaciones</h2>
                <span>{encontradas.length} registros</span>
            </div>

            {encontradas.length === 0 ? (
                <div className="info-ac__empty">
                    No se encontraron publicaciones con los filtros aplicados.
                </div>
            ) : (
                <div className="info-ac__list">
                    {encontradas.map((item) => (
                        <article className="info-ac__item" key={item.id}>
                            <div
                                className={`info-ac__item-icon info-ac__item-icon--${CATEGORIA_CLASE[item.categoria] || "blue"}`}
                            >
                                <Icon
                                    name={CATEGORIA_ICONO[item.categoria] || "info"}
                                    size={20}
                                />
                            </div>

                            <div className="info-ac__item-body">
                                <div className="info-ac__item-meta">
                                    <span
                                        className={`info-ac__item-badge ${CATEGORIA_CLASE[item.categoria] || "blue"}`}
                                    >
                                        {item.categoria}
                                    </span>
                                    <span className="info-ac__item-date">
                                        {fechaLegible(item.fecha)}
                                    </span>
                                </div>

                                <h3>{item.titulo}</h3>
                                <p className="info-ac__item-content">
                                    {item.contenido}
                                </p>

                                <div className="info-ac__item-author">
                                    <Icon name="perfil" size={12} />
                                    {item.autor}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {crearAbierto && (
                <div className="info-ac__overlay" onClick={cerrar}>
                    <div
                        className="info-ac__modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="info-ac__modal-header">
                            <div>
                                <h2>Nueva publicación académica</h2>
                                <p>Completa los datos de la publicación.</p>
                            </div>
                            <button
                                className="info-ac__modal-close"
                                onClick={cerrar}
                            >
                                ×
                            </button>
                        </div>

                        <form className="info-ac__form" onSubmit={handleCrear}>
                            <div className="info-ac__form-group">
                                <label htmlFor="info-titulo">Título</label>
                                <input
                                    id="info-titulo"
                                    type="text"
                                    name="titulo"
                                    value={form.titulo}
                                    onChange={handleChange}
                                    placeholder="ej. Convocatoria periodo académico 2026-2"
                                />
                            </div>

                            <div className="info-ac__form-group">
                                <label htmlFor="info-categoria">Categoría</label>
                                <select
                                    id="info-categoria"
                                    name="categoria"
                                    value={form.categoria}
                                    onChange={handleChange}
                                >
                                    {CATEGORIAS.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="info-ac__form-group">
                                <label htmlFor="info-contenido">Contenido</label>
                                <textarea
                                    id="info-contenido"
                                    name="contenido"
                                    rows="4"
                                    value={form.contenido}
                                    onChange={handleChange}
                                    placeholder="Describe la información académica"
                                />
                            </div>

                            <div className="info-ac__modal-actions">
                                <button
                                    type="button"
                                    className="info-ac__cancel-button"
                                    onClick={cerrar}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="info-ac__confirm-button"
                                    disabled={!form.titulo || !form.contenido}
                                >
                                    Publicar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InfoAcademica;
