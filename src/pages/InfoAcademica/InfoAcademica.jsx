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

const ESTADOS_PUBLICACION = ["Pendiente", "Aprobada", "Rechazada"];

const ESTADO_CLASE = {
    Pendiente: "pendiente",
    Aprobada: "aprobada",
    Rechazada: "rechazada"
};

const PROGRAMAS = [
    "Toda la comunidad",
    "Ingeniería de Sistemas",
    "Ingeniería Civil",
    "Administración de Empresas",
    "Contaduría Pública",
    "Derecho",
    "Psicología",
    "Matemáticas",
    "Bienestar Universitario"
];

const publicacionesIniciales = [
    {
        id: 1,
        titulo: "Convocatoria periodo académico 2026-1",
        categoria: "Convocatoria",
        fecha: "2026-03-15",
        autor: "Laura Gómez",
        contenido: "Se abre el período de inscripción para el primer semestre 2026. Los estudiantes deberán completar su matrícula antes del 28 de marzo.",
        estado: "Aprobada",
        programa: "Toda la comunidad",
        tipoVigencia: "Hasta",
        vigencia: "2026-03-28",
        destacado: true
    },
    {
        id: 2,
        titulo: "Taller de Metodología de Investigación",
        categoria: "Taller",
        fecha: "2026-04-10",
        autor: "Laura Gómez",
        contenido: "Se realizará un taller práctico sobre métodos de investigación cuantitativa y cualitativa para estudiantes de posgrado.",
        estado: "Aprobada",
        programa: "Matemáticas",
        tipoVigencia: "Hasta",
        vigencia: "2026-04-25",
        destacado: false
    },
    {
        id: 3,
        titulo: "Resultados parciales Cálculo I",
        categoria: "Resultado",
        fecha: "2026-04-22",
        autor: "Laura Gómez",
        contenido: "Se publican los resultados del primer parcial de Cálculo I. Los estudiantes pueden revisar en la plataforma académica.",
        estado: "Aprobada",
        programa: "Ingeniería de Sistemas",
        tipoVigencia: "Permanente",
        vigencia: "",
        destacado: false
    },
    {
        id: 4,
        titulo: "Aviso: mantenimiento plataforma académica",
        categoria: "Aviso académico",
        fecha: "2026-04-28",
        autor: "Carlos Méndez",
        contenido: "La plataforma académica tendrá mantenimiento programado el próximo sábado. El servicio no estará disponible entre las 8:00 y las 12:00.",
        estado: "Pendiente",
        programa: "Toda la comunidad",
        tipoVigencia: "Hasta",
        vigencia: "2026-05-02",
        destacado: false
    }
];

const formVacio = {
    titulo: "",
    categoria: "Aviso académico",
    contenido: "",
    programa: "Toda la comunidad",
    tipoVigencia: "Permanente",
    vigencia: "",
    destacado: false
};

function InfoAcademica() {
    const [query, setQuery] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [categoria, setCategoria] = useState("");
    const [items, setItems] = useState(publicacionesIniciales);
    const [crearAbierto, setCrearAbierto] = useState(false);
    const [form, setForm] = useState(formVacio);
    const [aviso, setAviso] = useState("");

    const { user, puede } = useAuth();
    const puedePublicar = puede("publicar_info_academica");

    const normalizar = (texto) =>
        texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const visibles = puedePublicar
        ? items
        : items.filter((item) => item.estado === "Aprobada");

    const filtradasPorCategoria = categoria
        ? visibles.filter((item) => item.categoria === categoria)
        : visibles;

    const encontradas = (
        busqueda.trim()
            ? filtradasPorCategoria.filter((item) =>
                  [item.titulo, item.categoria, item.contenido, item.autor]
                      .join(" ")
                      .toLowerCase()
                      .includes(normalizar(busqueda))
              )
            : filtradasPorCategoria
    )
        .slice()
        .sort((a, b) => Number(b.destacado) - Number(a.destacado));

    const contarCategoria = (cat) =>
        cat === ""
            ? visibles.length
            : visibles.filter((item) => item.categoria === cat).length;

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
        const { name, type, checked, value } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleCrear = (e) => {
        e.preventDefault();
        const nueva = {
            id: Date.now(),
            fecha: new Date().toISOString().slice(0, 10),
            autor: user?.nombre ?? "Usuario",
            estado: "Pendiente",
            ...form,
            vigencia: form.tipoVigencia === "Hasta" ? form.vigencia : ""
        };
        setItems([nueva, ...items]);
        setCrearAbierto(false);
        setForm(formVacio);
        setAviso("Publicación creada correctamente.");
        setTimeout(() => setAviso(""), 2500);
    };

    const cambiarEstado = (id, nuevoEstado) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, estado: nuevoEstado } : item
            )
        );
        setAviso(`Publicación ${nuevoEstado.toLowerCase()}.`);
        setTimeout(() => setAviso(""), 2500);
    };

    const eliminarPublicacion = (id) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setAviso("Publicación eliminada.");
        setTimeout(() => setAviso(""), 2500);
    };

    const cerrar = () => {
        setCrearAbierto(false);
        setForm(formVacio);
    };

    return (
        <div className="page">
            <div className="page__header">
                <div className="page__title">
                    <p>Consulta los avisos, convocatorias y resultados publicados.</p>
                </div>

                {puedePublicar && (
                    <button
                        className="button button--accent button--md"
                        onClick={() => setCrearAbierto(true)}
                    >
                        <Icon name="estudiante" size={15} />
                        Nueva publicación
                    </button>
                )}
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
                        categoria === ""
                            ? "summary__card summary__card--active"
                            : "summary__card"
                    }
                    onClick={() => setCategoria("")}
                >
                    <div className="summary__icon info-ac__summary-icon--all">
                        <Icon name="info" size={19} />
                    </div>
                    <div>
                        <div className="summary__number">
                            {visibles.length}
                        </div>
                        <div className="summary__label">Todos</div>
                    </div>
                </button>

                {CATEGORIAS.map((cat) => (
                    <button
                        key={cat}
                        className={
                            categoria === cat
                                ? "summary__card summary__card--active"
                                : "summary__card"
                        }
                        onClick={() => setCategoria(cat)}
                    >
                        <div
                            className={`summary__icon info-ac__summary-icon--${CATEGORIA_CLASE[cat] || "blue"}`}
                        >
                            <Icon name={CATEGORIA_ICONO[cat] || "info"} size={19} />
                        </div>
                        <div>
                            <div className="summary__number">
                                {contarCategoria(cat)}
                            </div>
                            <div className="summary__label">{cat}</div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="filters">
                <div className="filters__grid">
                    <div className="filters__group filters__group--search">
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

                    <div className="filters__group">
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

            <div className="list-header">
                <h2>Publicaciones</h2>
                <span className="list-header__meta">{encontradas.length} registros</span>
            </div>

            {encontradas.length === 0 ? (
                <div className="empty">
                    No se encontraron publicaciones con los filtros aplicados.
                </div>
            ) : (
                <div className="info-ac__list">
                    {encontradas.map((item) => (
                        <article
                            className={`info-ac__item ${item.destacado ? "info-ac__item--destacado" : ""}`}
                            key={item.id}
                        >
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
                                    <span
                                        className={`info-ac__item-state info-ac__item-state--${ESTADO_CLASE[item.estado] || "pendiente"}`}
                                    >
                                        {item.estado}
                                    </span>
                                    {item.destacado && (
                                        <span className="info-ac__item-destacado">
                                            Destacado
                                        </span>
                                    )}
                                    <span className="info-ac__item-date">
                                        {fechaLegible(item.fecha)}
                                    </span>
                                </div>

                                <h3>{item.titulo}</h3>
                                <p className="info-ac__item-content">
                                    {item.contenido}
                                </p>

                                <div className="info-ac__item-footer">
                                    <span className="info-ac__item-program">
                                        <Icon name="estudiante" size={12} />
                                        {item.programa}
                                    </span>
                                    {item.tipoVigencia === "Hasta" ? (
                                        <span className="info-ac__item-vigencia">
                                            <Icon name="eventos" size={12} />
                                            Hasta: {fechaLegible(item.vigencia)}
                                        </span>
                                    ) : (
                                        <span className="info-ac__item-vigencia info-ac__item-vigencia--permanente">
                                            <Icon name="info" size={12} />
                                            Permanente
                                        </span>
                                    )}
                                    <span className="info-ac__item-author">
                                        <Icon name="perfil" size={12} />
                                        {item.autor}
                                    </span>
                                </div>
                            </div>

                            {puedePublicar && (
                                <div className="info-ac__item-actions">
                                    {item.estado !== "Aprobada" && (
                                        <button
                                            type="button"
                                            className="info-ac__action info-ac__action--approve"
                                            onClick={() => cambiarEstado(item.id, "Aprobada")}
                                        >
                                            Aprobar
                                        </button>
                                    )}
                                    {item.estado !== "Rechazada" && (
                                        <button
                                            type="button"
                                            className="info-ac__action info-ac__action--reject"
                                            onClick={() => cambiarEstado(item.id, "Rechazada")}
                                        >
                                            Rechazar
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="info-ac__action info-ac__action--delete"
                                        onClick={() => eliminarPublicacion(item.id)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            )}
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

                            <div className="form-grid">
                                <div className="info-ac__form-group">
                                    <label htmlFor="info-programa">Dirigido a</label>
                                    <select
                                        id="info-programa"
                                        name="programa"
                                        value={form.programa}
                                        onChange={handleChange}
                                    >
                                        {PROGRAMAS.map((prog) => (
                                            <option key={prog} value={prog}>
                                                {prog}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="info-ac__form-group">
                                    <label htmlFor="info-vigencia">Vigencia</label>
                                    <select
                                        id="info-vigencia"
                                        name="tipoVigencia"
                                        value={form.tipoVigencia}
                                        onChange={handleChange}
                                    >
                                        <option value="Permanente">Permanente</option>
                                        <option value="Hasta">Hasta una fecha</option>
                                    </select>
                                </div>
                            </div>

                            {form.tipoVigencia === "Hasta" && (
                                <div className="info-ac__form-group">
                                    <label htmlFor="info-vigencia-fecha">Fecha límite</label>
                                    <input
                                        id="info-vigencia-fecha"
                                        type="date"
                                        name="vigencia"
                                        value={form.vigencia}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}

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

                            <label className="info-ac__check">
                                <input
                                    type="checkbox"
                                    name="destacado"
                                    checked={form.destacado}
                                    onChange={handleChange}
                                />
                                <span>Destacar publicación (fijar al inicio del tablero)</span>
                            </label>

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
