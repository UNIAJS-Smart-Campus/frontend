import { useState } from "react";
import useAuth from "../../context/useAuth";
import Icon from "../../components/Icon/Icon";
import SearchBar from "../../components/SearchBar/SearchBar";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import {
    CATEGORIAS,
    CATEGORIA_ICONO,
    CATEGORIA_CLASE,
    ESTADO_CLASE,
    PROGRAMAS,
    formVacio,
    obtenerPublicaciones,
    guardarPublicaciones,
    aplicarVencimiento
} from "../../utils/infoAcademica";
import "./InfoAcademica.css";

const HOY = new Date().toISOString().slice(0, 10);

function InfoAcademica() {
    const { user, puede } = useAuth();
    const puedePublicar = puede("publicar_info_academica");

    const [query,        setQuery]        = useState("");
    const [busqueda,     setBusqueda]     = useState("");
    const [categoria,    setCategoria]    = useState("");
    const [items,        setItems]        = useState(() => {
        // Al cargar: transitar Aprobada → Vencida si la fecha de vigencia ya pasó
        const { lista, huboCambios } = aplicarVencimiento(obtenerPublicaciones());
        if (huboCambios) guardarPublicaciones(lista);
        return lista;
    });
    const [crearAbierto, setCrearAbierto] = useState(false);
    const [confirm,       setConfirm]      = useState(null);
    const [form,          setForm]         = useState(formVacio);
    const [errores,      setErrores]      = useState({});
    const [aviso,        setAviso]        = useState("");

    // ── Helpers ──────────────────────────────────────────────
    const mostrarAviso = (msg) => {
        setAviso(msg);
        setTimeout(() => setAviso(""), 3000);
    };

    const normalizar = (texto) =>
        texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const fechaLegible = (fecha) => {
        const partes = String(fecha).split("-");
        if (partes.length !== 3) return fecha;
        const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
        return `${partes[2]} ${meses[Number(partes[1]) - 1]} ${partes[0]}`;
    };

    // ── Visibilidad por rol ────────────────────────────────────
    // puedePublicar (Admin/Administrativo): ve todo excepto eliminadas
    // Docente/Estudiante: solo publicaciones Aprobadas (no Vencidas, no Pendientes, no Rechazadas)
    const visibles = puedePublicar
        ? items
        : items.filter((i) => i.estado === "Aprobada");

    const filtradasPorCategoria = categoria
        ? visibles.filter((i) => i.categoria === categoria)
        : visibles;

    const encontradas = (
        busqueda.trim()
            ? filtradasPorCategoria.filter((i) =>
                  [i.titulo, i.categoria, i.contenido, i.autor]
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
            : visibles.filter((i) => i.categoria === cat).length;

    const sugerencias = [
        ...new Set(
            items.flatMap((i) => [i.titulo, i.categoria, i.autor]).filter(Boolean)
        )
    ];

    // ── Formulario ────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
        setErrores((prev) => ({ ...prev, [name]: "" }));
    };

    const validar = () => {
        const err = {};
        if (!form.titulo.trim())    err.titulo   = "El título es obligatorio.";
        if (!form.contenido.trim()) err.contenido = "El contenido es obligatorio.";
        if (form.tipoVigencia === "Hasta") {
            if (!form.vigencia)        err.vigencia = "Debes indicar la fecha límite.";
            else if (form.vigencia < HOY) err.vigencia = "La fecha límite no puede ser anterior a hoy.";
        }
        setErrores(err);
        return Object.keys(err).length === 0;
    };

    const handleCrear = (e) => {
        e.preventDefault();
        if (!validar()) return;

        const nueva = {
            id: Date.now(),
            fecha: HOY,
            autor: user?.nombre ?? "Usuario",
            estado: "Pendiente",
            ...form,
            vigencia: form.tipoVigencia === "Hasta" ? form.vigencia : ""
        };

        const actualizadas = [nueva, ...items];
        setItems(actualizadas);
        guardarPublicaciones(actualizadas);
        setCrearAbierto(false);
        setForm(formVacio);
        setErrores({});
        mostrarAviso("Publicación creada correctamente.");
    };

    const cambiarEstado = (id, nuevoEstado) => {
        const actualizadas = items.map((i) =>
            i.id === id ? { ...i, estado: nuevoEstado } : i
        );
        setItems(actualizadas);
        guardarPublicaciones(actualizadas);
        mostrarAviso(`Publicación ${nuevoEstado.toLowerCase()}.`);
    };

    const eliminarPublicacion = (id) => {
        const actualizadas = items.filter((i) => i.id !== id);
        setItems(actualizadas);
        guardarPublicaciones(actualizadas);
        mostrarAviso("Publicación eliminada.");
    };

    // ── Confirmaciones ────────────────────────────────────────
    const pedirConfirmarAprobar = (id, titulo) =>
        setConfirm({ tipo: "aprobar", id, titulo });
    const pedirConfirmarRechazar = (id, titulo) =>
        setConfirm({ tipo: "rechazar", id, titulo });
    const pedirConfirmarEliminar = (id, titulo) =>
        setConfirm({ tipo: "eliminar", id, titulo });

    const confirmarAccion = () => {
        if (!confirm) return;
        const { tipo, id } = confirm;
        if (tipo === "aprobar") cambiarEstado(id, "Aprobada");
        else if (tipo === "rechazar") cambiarEstado(id, "Rechazada");
        else if (tipo === "eliminar") eliminarPublicacion(id);
        setConfirm(null);
    };

    const cerrar = () => {
        setCrearAbierto(false);
        setForm(formVacio);
        setErrores({});
    };

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="page">

            {/* ── HEADER ── */}
            <div className="page__header">
                <div className="page__title">
                    <h1>Información académica</h1>
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

            {/* ── AVISO ── */}
            {aviso && (
                <div className="toast toast--success">
                    <Icon name="info" size={14} />
                    {aviso}
                </div>
            )}

            {/* ── SUMMARY / FILTROS POR CATEGORÍA ── */}
            <section className="info-ac__summary">
                <button
                    className={`summary__card${categoria === "" ? " summary__card--active" : ""}`}
                    onClick={() => setCategoria("")}
                >
                    <div className="summary__icon info-ac__icon--all">
                        <Icon name="info" size={19} />
                    </div>
                    <div>
                        <div className="summary__number">{visibles.length}</div>
                        <div className="summary__label">Todos</div>
                    </div>
                </button>

                {CATEGORIAS.map((cat) => {
                    const count = contarCategoria(cat);
                    return (
                        <button
                            key={cat}
                            className={`summary__card${categoria === cat ? " summary__card--active" : ""}${count === 0 ? " summary__card--empty" : ""}`}
                            onClick={() => setCategoria(cat)}
                        >
                            <div className={`summary__icon info-ac__icon--${CATEGORIA_CLASE[cat] || "blue"}`}>
                                <Icon name={CATEGORIA_ICONO[cat] || "info"} size={19} />
                            </div>
                            <div>
                                <div className="summary__number">{count}</div>
                                <div className="summary__label">{cat}</div>
                            </div>
                        </button>
                    );
                })}
            </section>

            {/* ── FILTROS ── */}
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
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* ── LISTA ── */}
            <div className="list-header">
                <h2>Publicaciones</h2>
                <span className="list-header__meta">{encontradas.length} registros</span>
            </div>

            {encontradas.length === 0 ? (
                <div className="empty">
                    <div className="empty__icon">📭</div>
                    <div className="empty__title">Sin publicaciones</div>
                    <p className="empty__text">No se encontraron publicaciones con los filtros aplicados.</p>
                </div>
            ) : (
                <div className="info-ac__list">
                    {encontradas.map((item) => {
                        const esVencida = item.estado === "Vencida";
                        return (
                            <article
                                className={[
                                    "info-ac__item",
                                    item.destacado ? "info-ac__item--destacado" : "",
                                    esVencida      ? "info-ac__item--vencida"   : ""
                                ].filter(Boolean).join(" ")}
                                key={item.id}
                            >
                                <div className={`info-ac__item-icon info-ac__item-icon--${CATEGORIA_CLASE[item.categoria] || "blue"}`}>
                                    <Icon name={CATEGORIA_ICONO[item.categoria] || "info"} size={20} />
                                </div>

                                <div className="info-ac__item-body">
                                    <div className="info-ac__item-meta">
                                        <span className={`info-ac__item-badge info-ac__item-badge--${CATEGORIA_CLASE[item.categoria] || "blue"}`}>
                                            {item.categoria}
                                        </span>
                                        <span className={`info-ac__item-state info-ac__item-state--${ESTADO_CLASE[item.estado] || "pendiente"}`}>
                                            {item.estado}
                                        </span>
                                        {item.destacado && (
                                            <span className="info-ac__item-pin">⭐ Destacado</span>
                                        )}
                                        <span className="info-ac__item-date">
                                            {fechaLegible(item.fecha)}
                                        </span>
                                    </div>

                                    <h3>{item.titulo}</h3>
                                    <p className="info-ac__item-content">{item.contenido}</p>

                                    <div className="info-ac__item-footer">
                                        <span className="info-ac__item-program">
                                            <Icon name="estudiante" size={12} />
                                            {item.programa}
                                        </span>
                                        {item.tipoVigencia === "Hasta" ? (
                                            <span className={`info-ac__item-vigencia${esVencida ? " info-ac__item-vigencia--vencida" : ""}`}>
                                                <Icon name="eventos" size={12} />
                                                {esVencida ? "Venció: " : "Hasta: "}
                                                {fechaLegible(item.vigencia)}
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
                                                onClick={() => pedirConfirmarAprobar(item.id, item.titulo)}
                                            >
                                                Aprobar
                                            </button>
                                        )}
                                        {item.estado !== "Rechazada" && (
                                            <button
                                                type="button"
                                                className="info-ac__action info-ac__action--reject"
                                                onClick={() => pedirConfirmarRechazar(item.id, item.titulo)}
                                            >
                                                Rechazar
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="info-ac__action info-ac__action--delete"
                                            onClick={() => pedirConfirmarEliminar(item.id, item.titulo)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}

            {/* ── MODAL CREAR ── */}
            {crearAbierto && (
                <div className="info-ac__overlay" onClick={cerrar}>
                    <div className="info-ac__modal" onClick={(e) => e.stopPropagation()}>
                        <div className="info-ac__modal-header">
                            <div>
                                <h2>Nueva publicación académica</h2>
                                <p>Completa los datos de la publicación.</p>
                            </div>
                            <button className="info-ac__modal-close" onClick={cerrar}>×</button>
                        </div>

                        <form className="info-ac__form" onSubmit={handleCrear} noValidate>

                            <div className="info-ac__form-group">
                                <label htmlFor="if-titulo">Título *</label>
                                <input
                                    id="if-titulo"
                                    type="text"
                                    name="titulo"
                                    value={form.titulo}
                                    onChange={handleChange}
                                    placeholder="ej. Convocatoria periodo académico 2026-2"
                                    className={errores.titulo ? "info-ac__input--error" : ""}
                                />
                                {errores.titulo && (
                                    <span className="info-ac__field-error">{errores.titulo}</span>
                                )}
                            </div>

                            <div className="info-ac__form-group">
                                <label htmlFor="if-categoria">Categoría</label>
                                <select
                                    id="if-categoria"
                                    name="categoria"
                                    value={form.categoria}
                                    onChange={handleChange}
                                >
                                    {CATEGORIAS.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-grid">
                                <div className="info-ac__form-group">
                                    <label htmlFor="if-programa">Dirigido a</label>
                                    <select
                                        id="if-programa"
                                        name="programa"
                                        value={form.programa}
                                        onChange={handleChange}
                                    >
                                        {PROGRAMAS.map((prog) => (
                                            <option key={prog} value={prog}>{prog}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="info-ac__form-group">
                                    <label htmlFor="if-tipo-vigencia">Vigencia</label>
                                    <select
                                        id="if-tipo-vigencia"
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
                                    <label htmlFor="if-vigencia">Fecha límite *</label>
                                    <input
                                        id="if-vigencia"
                                        type="date"
                                        name="vigencia"
                                        value={form.vigencia}
                                        min={HOY}
                                        onChange={handleChange}
                                        className={errores.vigencia ? "info-ac__input--error" : ""}
                                    />
                                    {errores.vigencia && (
                                        <span className="info-ac__field-error">{errores.vigencia}</span>
                                    )}
                                </div>
                            )}

                            <div className="info-ac__form-group">
                                <label htmlFor="if-contenido">Contenido *</label>
                                <textarea
                                    id="if-contenido"
                                    name="contenido"
                                    rows="4"
                                    value={form.contenido}
                                    onChange={handleChange}
                                    placeholder="Describe la información académica"
                                    className={errores.contenido ? "info-ac__input--error" : ""}
                                />
                                {errores.contenido && (
                                    <span className="info-ac__field-error">{errores.contenido}</span>
                                )}
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
                                <button type="button" className="info-ac__cancel-button" onClick={cerrar}>
                                    Cancelar
                                </button>
                                <button type="submit" className="info-ac__confirm-button">
                                    Publicar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── CONFIRMACIÓN DE ACCIONES ── */}
            <ConfirmModal
                isOpen={Boolean(confirm)}
                title={
                    confirm?.tipo === "eliminar"
                        ? "Eliminar publicación"
                        : confirm?.tipo === "aprobar"
                        ? "Aprobar publicación"
                        : "Rechazar publicación"
                }
                message={
                    confirm
                        ? confirm.tipo === "eliminar"
                            ? `¿Eliminar la publicación "${confirm.titulo}"? Esta acción no se puede deshacer.`
                            : confirm.tipo === "aprobar"
                            ? `¿Aprobar la publicación "${confirm.titulo}"? Será visible para toda la comunidad.`
                            : `¿Rechazar la publicación "${confirm.titulo}"? No aparecerá en el tablero para los demás usuarios.`
                        : ""
                }
                confirmText={
                    confirm?.tipo === "aprobar" ? "Aprobar" : confirm?.tipo === "eliminar" ? "Eliminar" : "Rechazar"
                }
                cancelText="Cancelar"
                variant={confirm?.tipo === "aprobar" ? "primary" : "danger"}
                onConfirm={confirmarAccion}
                onClose={() => setConfirm(null)}
            />
        </div>
    );
}

export default InfoAcademica;
