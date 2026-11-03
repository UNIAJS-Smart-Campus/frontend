import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/Icon/Icon";
import ImagenCategoria from "../../components/ImagenCategoria/ImagenCategoria";
import Modal from "../../components/Modal/Modal";
import SearchBar from "../../components/SearchBar/SearchBar";
import useAuth from "../../context/useAuth";
import useColeccion from "../../hooks/useColeccion";
import useSugerencias from "../../hooks/useSugerencias";
import usePagination from "../../hooks/usePagination";
import Pagination from "../../components/Pagination/Pagination";
import {
    CLAVE_RECURSO,
    CATEGORIA_POR_TIPO,
    CATEGORIAS_RECURSO,
    eliminarRecurso as eliminarRecursoEnApi
} from "../../utils/recursos";
import "./Recursos.css";

const CATEGORIA_VARIANT = {
    Salas: { icono: "reservas", clase: "blue", etiqueta: "Espacio" },
    Laboratorios: { icono: "recursos", clase: "green", etiqueta: "Laboratorio" },
    Auditorios: { icono: "eventos", clase: "purple", etiqueta: "Espacio" },
    Equipos: { icono: "recursos", clase: "orange", etiqueta: "Equipo" }
};

const ESTADO_VARIANT = {
    Disponible: { etiqueta: "DISPONIBLE", clase: "available", bg: "blue" },
    Mantenimiento: { etiqueta: "MANTENIMIENTO", clase: "maintenance", bg: "orange" },
    Inactivo: { etiqueta: "NO DISPONIBLE", clase: "unavailable", bg: "red" }
};

function estadoVisual(recurso) {
    if (recurso.estado === "Mantenimiento") {
        return ESTADO_VARIANT.Mantenimiento;
    }
    if (recurso.estado === "Inactivo") {
        return ESTADO_VARIANT.Inactivo;
    }
    return ESTADO_VARIANT.Disponible;
}

const CATEGORIAS = [
    { valor: "all", etiqueta: "Todas" },
    { valor: "Salas", etiqueta: "Espacios" },
    { valor: "Equipos", etiqueta: "Equipos" },
    { valor: "Laboratorios", etiqueta: "Laboratorios" },
    { valor: "Auditorios", etiqueta: "Auditorios" }
];

const EDIFICIOS = ["Todos", "Bloque A", "Bloque B", "Bloque C"];

function obtenerEdificio(ubicacion) {
    // El backend guarda ubicaciones como 'Edificio A - Piso 1' o 'Bloque A · Piso 1'.
    const bruto = String(ubicacion || "").split("·")[0].split("-")[0].trim();
    return bruto.replace(/^edificio\s+/i, "Bloque ") || "Otro";
}

function Recursos() {
    const { items, recargar, enLinea } = useColeccion(CLAVE_RECURSO);
    const { puede } = useAuth();
    const puedeAdmin = puede("administrar_recursos");

    const [query, setQuery] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [categoria, setCategoria] = useState("all");
    const [categoriaRecurso, setCategoriaRecurso] = useState("Todas");
    const [edificio, setEdificio] = useState("Todos");
    const [estado, setEstado] = useState("Todos");
    const [detalleRecurso, setDetalleRecurso] = useState(null);

    const [aviso, setAviso] = useState("");

    const mostrarAviso = (mensaje) => {
        setAviso(mensaje);
        setTimeout(() => setAviso(""), 2500);
    };

    const stats = useMemo(() => {
        const disponibles = items.filter(
            (r) => r.disponibilidad === "Disponible" && r.estado === "Disponible"
        ).length;
        const mantenimiento = items.filter(
            (r) => r.estado === "Mantenimiento"
        ).length;
        return {
            total: items.length,
            disponibles,
            mantenimiento,
            reservados: items.length - disponibles - mantenimiento
        };
    }, [items]);

    const filtrados = useMemo(() => {
        const texto = busqueda.toLowerCase().trim();
        return items.filter((recurso) => {
            if (
                texto &&
                !`${recurso.nombre} ${recurso.tipo} ${recurso.ubicacion}`
                    .toLowerCase()
                    .includes(texto)
            ) {
                return false;
            }
            if (categoria !== "all" && recurso.tipo !== categoria) {
                return false;
            }
            if (categoriaRecurso !== "Todas") {
                const cat = recurso.categoria ?? CATEGORIA_POR_TIPO[recurso.tipo];
                if (cat !== categoriaRecurso) return false;
            }
            if (
                edificio !== "Todos" &&
                obtenerEdificio(recurso.ubicacion) !== edificio
            ) {
                return false;
            }
            if (estado !== "Todos") {
                if (estado === "Disponible" && recurso.disponibilidad !== "Disponible") {
                    return false;
                }
                if (estado === "Mantenimiento" && recurso.estado !== "Mantenimiento") {
                    return false;
                }
                if (estado === "Reservado" && recurso.disponibilidad === "Disponible") {
                    return false;
                }
            }
            return true;
        });
    }, [busqueda, categoria, categoriaRecurso, edificio, estado, items]);

    const { pagina, setPagina, totalPaginas, itemsPagina, desde, hasta } =
        usePagination(filtrados, 9);

    // Respaldo local: se usa si Elasticsearch no responde.
    const sugerenciasLocales = useMemo(
        () => [
            ...new Set(
                items
                    .flatMap((recurso) => [recurso.nombre, recurso.tipo, recurso.ubicacion])
                    .filter(Boolean)
            )
        ],
        [items]
    );
    const sugerencias = useSugerencias(query, "RECURSOS", sugerenciasLocales);

    const eliminarRecurso = async (recurso) => {
        const confirma = window.confirm(
            `¿Eliminar el recurso "${recurso.nombre}"?`
        );
        if (!confirma) return;
        try {
            await eliminarRecursoEnApi(recurso);
            setDetalleRecurso(null);
            mostrarAviso(`Recurso "${recurso.nombre}" eliminado.`);
        } catch (fallo) {
            mostrarAviso(fallo?.message || "No se pudo eliminar el recurso.");
        }
    };

    return (
        <div className="page">
            <div className="page__header">
                <div className="page__title">
                    <p>Consulta los espacios, equipos y recursos disponibles del campus.</p>
                </div>

                {puedeAdmin && (
                    <Link to="/recursos/nuevo" className="button button--accent button--md">
                        <Icon name="recursos" size={15} />
                        Nuevo recurso
                    </Link>
                )}
            </div>

            {aviso && (
                <div className="toast toast--success">
                    <Icon name="info" size={14} />
                    {aviso}
                </div>
            )}

            {enLinea === false && (
                <div className="toast toast--error">
                    <Icon name="info" size={14} />
                    Sin conexión con el servidor: se muestra la última data sincronizada.
                    <button className="button button--ghost button--sm" onClick={recargar}>
                        Reintentar
                    </button>
                </div>
            )}

            <div className="summary">
                <div className="summary__card">
                    <div className="summary__icon recursos__summary-icon--blue">
                        <Icon name="recursos" size={18} />
                    </div>
                    <div>
                        <div className="summary__number">{stats.total}</div>
                        <div className="summary__label">Recursos totales</div>
                    </div>
                </div>

                <div className="summary__card">
                    <div className="summary__icon recursos__summary-icon--green">
                        <Icon name="estudiante" size={18} />
                    </div>
                    <div>
                        <div className="summary__number">{stats.disponibles}</div>
                        <div className="summary__label">Disponibles</div>
                    </div>
                </div>

                <div className="summary__card">
                    <div className="summary__icon recursos__summary-icon--orange">
                        <Icon name="configuracion" size={18} />
                    </div>
                    <div>
                        <div className="summary__number">{stats.mantenimiento}</div>
                        <div className="summary__label">En mantenimiento</div>
                    </div>
                </div>

                <div className="summary__card">
                    <div className="summary__icon recursos__summary-icon--purple">
                        <Icon name="reservas" size={18} />
                    </div>
                    <div>
                        <div className="summary__number">{stats.reservados}</div>
                        <div className="summary__label">Reservados</div>
                    </div>
                </div>
            </div>

            <div className="filters filters--recursos">
                <div className="filters__grid">
                    <div className="filters__group filters__group--search">
                        <label>Buscar</label>
                        <SearchBar
                            placeholder="Nombre del recurso..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onSearch={() => setBusqueda(query)}
                            suggestions={sugerencias}
                            serverSide
                        />
                    </div>

                    <div className="filters__group">
                        <label>Categoría</label>
                        <select
                            className="recursos__filter-select"
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                        >
                            {CATEGORIAS.map((c) => (
                                <option key={c.valor} value={c.valor}>
                                    {c.etiqueta}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filters__group">
                        <label>Tipo de recurso</label>
                        <select
                            className="recursos__filter-select"
                            value={categoriaRecurso}
                            onChange={(e) => setCategoriaRecurso(e.target.value)}
                        >
                            <option value="Todas">Todos</option>
                            {CATEGORIAS_RECURSO.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filters__group">
                        <label>Edificio</label>
                        <select
                            className="recursos__filter-select"
                            value={edificio}
                            onChange={(e) => setEdificio(e.target.value)}
                        >
                            {EDIFICIOS.map((ed) => (
                                <option key={ed}>{ed}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filters__group">
                        <label>Estado</label>
                        <select
                            className="recursos__filter-select"
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                        >
                            <option>Todos</option>
                            <option>Disponible</option>
                            <option>Reservado</option>
                            <option>Mantenimiento</option>
                        </select>
                    </div>

                    <div className="filters__group">
                        <label>{"\u00a0"}</label>
                        <button
                            className="recursos__filter-button"
                            onClick={() => {
                                setQuery("");
                                setBusqueda("");
                            }}
                        >
                            <Icon name="solicitudes" size={12} />
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            <div className="list-header">
                <h2>Recursos</h2>
                <span className="list-header__meta">Mostrando {filtrados.length} recursos</span>
            </div>

            <div className="recursos__resources">
                {filtrados.length > 0 ? (
                    itemsPagina.map((recurso) => {
                        const categoriaVar =
                            CATEGORIA_VARIANT[recurso.tipo] || CATEGORIA_VARIANT.Salas;
                        const estadoVar = estadoVisual(recurso);

                        return (
                            <div className="recursos__resource-card" key={recurso.id}>
                                <div className={`recursos__resource-image ${estadoVar.bg}-bg`}>
                                    <ImagenCategoria grupo="recurso" tipo={recurso.tipo} semilla={recurso.id} />
                                    <span className={`status ${estadoVar.clase}`}>
                                        {estadoVar.etiqueta}
                                    </span>
                                </div>

                                <div className="recursos__resource-content">
                                    <div className="recursos__resource-type">
                                        {categoriaVar.etiqueta}
                                    </div>
                                    <div className="recursos__resource-categoria">
                                        <span className={`recursos__categoria-badge recursos__categoria-badge--${(recurso.categoria ?? CATEGORIA_POR_TIPO[recurso.tipo]) === "Escenario" ? "escenario" : "objeto"}`}>
                                            {recurso.categoria ?? CATEGORIA_POR_TIPO[recurso.tipo]}
                                        </span>
                                    </div>
                                    <h3>{recurso.nombre}</h3>
                                    <p className="recursos__resource-description">
                                        {recurso.descripcion
                                            ? recurso.descripcion
                                            : `Recurso ${recurso.tipo.toLowerCase()} con capacidad para ${recurso.capacidad} persona(s), ubicado en ${recurso.ubicacion}.`}
                                    </p>

                                    <div className="recursos__resource-details">
                                        <span className="detail">
                                            <Icon name="estudiante" size={11} />
                                            {recurso.capacidad} personas
                                        </span>
                                        <span className="detail">
                                            <Icon name="recursos" size={11} />
                                            {recurso.tipo}
                                        </span>
                                        <span className="detail">
                                            <Icon name="eventos" size={11} />
                                            {obtenerEdificio(recurso.ubicacion)}
                                        </span>
                                    </div>

                                    <div className="recursos__resource-actions">
                                        <button
                                            className="recursos__details-button"
                                            onClick={() => setDetalleRecurso(recurso)}
                                        >
                                            Ver detalles
                                        </button>
                                        {puedeAdmin && (
                                            <>
                                                <Link
                                                    className="recursos__edit-button"
                                                    to={`/recursos/${recurso.id}/editar`}
                                                >
                                                    <Icon name="usuarios" size={12} />
                                                    Editar
                                                </Link>
                                                <button
                                                    className="recursos__delete-button"
                                                    onClick={() => eliminarRecurso(recurso)}
                                                >
                                                    <Icon name="configuracion" size={12} />
                                                    Eliminar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="empty">
                        No se encontraron recursos con los filtros aplicados.
                    </div>
                )}
            </div>

            <Pagination
                pagina={pagina}
                totalPaginas={totalPaginas}
                onChange={setPagina}
                desde={desde}
                hasta={hasta}
                total={filtrados.length}
            />

            <Modal
                isOpen={detalleRecurso !== null}
                title="Detalles del recurso"
                onClose={() => setDetalleRecurso(null)}
            >
                {detalleRecurso && (
                    <div className="recursos__detalle">
                        <div className="recursos__detalle-media">
                            <ImagenCategoria
                                grupo="recurso"
                                tipo={detalleRecurso.tipo}
                                semilla={detalleRecurso.id}
                            />
                        </div>
                        <div className="recursos__detalle-name">{detalleRecurso.nombre}</div>
                        <div className="recursos__detalle-grid">
                            <div className="recursos__detalle-item">
                                <span className="recursos__detalle-label">Código</span>
                                <span className="recursos__detalle-value">{detalleRecurso.codigo}</span>
                            </div>
                            <div className="recursos__detalle-item">
                                <span className="recursos__detalle-label">Tipo</span>
                                <span className="recursos__detalle-value">{detalleRecurso.tipo}</span>
                            </div>
                            <div className="recursos__detalle-item">
                                <span className="recursos__detalle-label">Capacidad</span>
                                <span className="recursos__detalle-value">{detalleRecurso.capacidad} personas</span>
                            </div>
                            <div className="recursos__detalle-item">
                                <span className="recursos__detalle-label">Ubicación</span>
                                <span className="recursos__detalle-value">{detalleRecurso.ubicacion}</span>
                            </div>
                            <div className="recursos__detalle-item">
                                <span className="recursos__detalle-label">Estado</span>
                                <span className="recursos__detalle-value">{detalleRecurso.estado}</span>
                            </div>
                            <div className="recursos__detalle-item">
                                <span className="recursos__detalle-label">Disponibilidad</span>
                                <span className="recursos__detalle-value">{detalleRecurso.disponibilidad}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default Recursos;
