import { useState } from "react";
import ServiceCard from "../../components/ServiceCard/ServiceCard";
import SearchBar from "../../components/SearchBar/SearchBar";
import useAuth from "../../context/useAuth";
import services from "../../utils/services";
import "./Servicios.css";

const PATH_PERMISO = {
    "/solicitudes": "solicitudes",
    "/reservas": "reservas",
    "/recursos": "recursos",
    "/eventos": "eventos",
    "/notificaciones": "notificaciones",
    "/pqrs": "pqrs"
};

function Servicios() {
    const { tienePermiso } = useAuth();
    const [query, setQuery] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [categoria, setCategoria] = useState("");

    const visibles = services.filter((service) => {
        const permiso = PATH_PERMISO[service.path];
        return !permiso || tienePermiso(permiso);
    });

    const normalizar = (texto) =>
        texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const porCategoria = categoria
        ? visibles.filter((s) => s.category === categoria)
        : visibles;

    const encontrados = busqueda.trim()
        ? porCategoria.filter((s) =>
              [s.name, s.category, s.description]
                  .join(" ")
                  .toLowerCase()
                  .includes(normalizar(busqueda))
          )
        : porCategoria;

    const categorias = [...new Set(visibles.map((s) => s.category))];

    const sugerencias = [
        ...new Set(
            visibles.flatMap((s) => [s.name, s.category]).filter(Boolean)
        )
    ];

    return (
        <div className="servicios">
            <div className="servicios__page-header">
                <div className="servicios__page-title">
                    <h1>Servicios</h1>
                    <p>
                        Encuentra los servicios universitarios disponibles y
                        accede a cada módulo.
                    </p>
                </div>
            </div>

            <div className="servicios__filter-card">
                <div className="servicios__search">
                    <SearchBar
                        placeholder="Buscar servicio por nombre o categoría…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onSearch={() => setBusqueda(query)}
                        suggestions={sugerencias}
                    />
                </div>

                <div className="servicios__chips">
                    <button
                        className={
                            categoria === ""
                                ? "servicios__chip servicios__chip--active"
                                : "servicios__chip"
                        }
                        onClick={() => setCategoria("")}
                    >
                        Todos
                    </button>
                    {categorias.map((cat) => (
                        <button
                            key={cat}
                            className={
                                categoria === cat
                                    ? "servicios__chip servicios__chip--active"
                                    : "servicios__chip"
                            }
                            onClick={() =>
                                setCategoria(categoria === cat ? "" : cat)
                            }
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="servicios__count">
                {encontrados.length}{" "}
                {encontrados.length === 1 ? "servicio" : "servicios"}
                {categoria ? ` en ${categoria}` : ""}
            </div>

            {encontrados.length === 0 ? (
                <p className="servicios__empty">
                    No se encontraron servicios con la búsqueda aplicada.
                </p>
            ) : (
                <div className="servicios__grid">
                    {encontrados.map((service) => (
                        <ServiceCard service={service} key={service.name} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Servicios;
