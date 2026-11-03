import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Icon from "../../components/Icon/Icon";
import Input from "../../components/Input/Input";
import useAuth from "../../context/useAuth";
import { useToast } from "../../context/ToastContext";
import useColeccion from "../../hooks/useColeccion";
import {
    CLAVE_RECURSO,
    TIPOS_RECURSO,
    CATEGORIA_POR_TIPO,
    CATEGORIAS_RECURSO,
    ESTADOS_RECURSO,
    DISPONIBILIDADES_RECURSO,
    crearRecurso,
    actualizarRecurso
} from "../../utils/recursos";
import "./Recursos.css";
import "./FormularioRecurso.css";

const formVacio = {
    nombre: "",
    codigo: "",
    tipo: "Salas",
    categoria: "Escenario",
    capacidad: "",
    ubicacion: "",
    descripcion: "",
    estado: "Disponible",
    disponibilidad: "Disponible"
};

function datosDe(recurso) {
    return {
        nombre: recurso.nombre ?? "",
        codigo: recurso.codigo ?? "",
        tipo: recurso.tipo ?? "Salas",
        categoria:
            recurso.categoria ?? CATEGORIA_POR_TIPO[recurso.tipo] ?? "Escenario",
        capacidad: String(recurso.capacidad ?? ""),
        ubicacion: recurso.ubicacion ?? "",
        descripcion: recurso.descripcion ?? "",
        estado: recurso.estado ?? "Disponible",
        disponibilidad: recurso.disponibilidad ?? "Disponible"
    };
}

/**
 * Formulario en sí. Se monta con `key` (id del recurso o "nuevo"), así el
 * estado inicial sale de las props sin necesidad de sincronizar con efectos.
 */
function FormRecurso({ inicial, esEdicion, id, actual, items }) {
    const navigate = useNavigate();
    const toast = useToast();

    const [form, setForm] = useState(inicial);
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setError("");
        if (name === "tipo") {
            setForm((prev) => ({
                ...prev,
                tipo: value,
                categoria: CATEGORIA_POR_TIPO[value] ?? prev.categoria
            }));
            return;
        }
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.nombre.trim() || !form.codigo.trim()) {
            setError("El nombre y el código son obligatorios.");
            return;
        }
        if (!form.ubicacion.trim()) {
            setError("La ubicación es obligatoria.");
            return;
        }

        const duplicado = items.some(
            (item) =>
                (item.codigo || "").toLowerCase() ===
                    form.codigo.trim().toLowerCase() &&
                String(item.id) !== String(id)
        );
        if (duplicado) {
            setError("Ya existe un recurso con ese código.");
            return;
        }

        const datos = {
            nombre: form.nombre.trim(),
            codigo: form.codigo.trim(),
            tipo: form.tipo,
            categoria:
                form.categoria || CATEGORIA_POR_TIPO[form.tipo] || "Escenario",
            descripcion: (form.descripcion || "").trim(),
            capacidad: Number(form.capacidad) || 1,
            ubicacion: form.ubicacion.trim() || "Bloque A",
            estado: form.estado,
            disponibilidad: form.disponibilidad
        };

        setEnviando(true);
        try {
            if (esEdicion) {
                await actualizarRecurso(actual, datos);
                toast.success("Recurso actualizado correctamente.");
            } else {
                await crearRecurso(datos);
                toast.success("Recurso creado correctamente.");
            }
            navigate("/recursos");
        } catch (fallo) {
            const mensaje =
                fallo?.message || "No se pudo guardar el recurso en el servidor.";
            setError(mensaje);
            toast.error(mensaje);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <form className="nuevo-recurso__form" onSubmit={handleSubmit} noValidate>
            {error && <p className="recursos__error">{error}</p>}

            <Input
                label="Nombre del recurso"
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                id="recurso-crud-nombre"
                placeholder="Ej. Salón 102"
            />

            <Input
                label="Código"
                type="text"
                name="codigo"
                value={form.codigo}
                onChange={handleChange}
                id="recurso-crud-codigo"
                placeholder="Ej. REC-102"
            />

            <div className="recursos__form-row">
                <div>
                    <label className="recursos__field-label" htmlFor="recurso-crud-tipo">
                        Tipo
                    </label>
                    <select
                        id="recurso-crud-tipo"
                        className="recursos__filter-select"
                        name="tipo"
                        value={form.tipo}
                        onChange={handleChange}
                    >
                        {TIPOS_RECURSO.map((tipo) => (
                            <option key={tipo} value={tipo}>
                                {tipo}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label
                        className="recursos__field-label"
                        htmlFor="recurso-crud-categoria"
                    >
                        Categoría
                    </label>
                    <select
                        id="recurso-crud-categoria"
                        className="recursos__filter-select"
                        name="categoria"
                        value={form.categoria}
                        onChange={handleChange}
                    >
                        {CATEGORIAS_RECURSO.map((categoria) => (
                            <option key={categoria} value={categoria}>
                                {categoria}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="recursos__form-row">
                <div>
                    <label
                        className="recursos__field-label"
                        htmlFor="recurso-crud-capacidad"
                    >
                        Capacidad
                    </label>
                    <input
                        id="recurso-crud-capacidad"
                        className="recursos__filter-input"
                        type="number"
                        min="1"
                        name="capacidad"
                        value={form.capacidad}
                        onChange={handleChange}
                        placeholder="Ej. 40"
                    />
                </div>
            </div>

            <Input
                label="Ubicación"
                type="text"
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                id="recurso-crud-ubicacion"
                placeholder="Ej. Bloque A · Piso 1"
            />

            <Input
                label="Descripción"
                type="text"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                id="recurso-crud-descripcion"
                placeholder="Ej. Sala para reuniones y talleres"
            />

            <div className="recursos__form-row">
                <div>
                    <label className="recursos__field-label" htmlFor="recurso-crud-estado">
                        Estado
                    </label>
                    <select
                        id="recurso-crud-estado"
                        className="recursos__filter-select"
                        name="estado"
                        value={form.estado}
                        onChange={handleChange}
                    >
                        {ESTADOS_RECURSO.map((estado) => (
                            <option key={estado} value={estado}>
                                {estado}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label
                        className="recursos__field-label"
                        htmlFor="recurso-crud-disponibilidad"
                    >
                        Disponibilidad
                    </label>
                    <select
                        id="recurso-crud-disponibilidad"
                        className="recursos__filter-select"
                        name="disponibilidad"
                        value={form.disponibilidad}
                        onChange={handleChange}
                    >
                        {DISPONIBILIDADES_RECURSO.map((disponibilidad) => (
                            <option key={disponibilidad} value={disponibilidad}>
                                {disponibilidad}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="nuevo-recurso__actions">
                <Link to="/recursos" className="button button--ghost button--md">
                    Cancelar
                </Link>
                <button
                    type="submit"
                    className="button button--accent button--md"
                    disabled={enviando || !form.nombre.trim() || !form.codigo.trim()}
                >
                    <Icon name="recursos" size={15} />
                    {enviando
                        ? "Guardando…"
                        : esEdicion
                          ? "Guardar cambios"
                          : "Crear recurso"}
                </button>
            </div>
        </form>
    );
}

/**
 * Módulo de alta/edición de recursos.
 *   /recursos/nuevo        -> crear
 *   /recursos/:id/editar   -> editar
 * Antes era un modal único dentro de /recursos.
 */
function FormularioRecurso() {
    const { id } = useParams();
    const { puede } = useAuth();

    const esEdicion = Boolean(id);
    const { items, cargando } = useColeccion(CLAVE_RECURSO);

    const actual = useMemo(
        () => (esEdicion ? items.find((item) => String(item.id) === String(id)) : null),
        [items, id, esEdicion]
    );

    if (!puede("administrar_recursos")) {
        return <Navigate to="/recursos" replace />;
    }

    const volver = (
        <Link to="/recursos" className="nuevo-recurso__back">
            ← Volver a recursos
        </Link>
    );

    // Edición con el recurso aún cargando o inexistente.
    if (esEdicion && !actual) {
        return (
            <div className="nuevo-recurso">
                {volver}
                <p className="nuevo-recurso__aviso">
                    {cargando
                        ? "Cargando recurso…"
                        : "El recurso ya no existe o no se pudo cargar."}
                </p>
            </div>
        );
    }

    return (
        <div className="nuevo-recurso">
            {volver}

            <header className="nuevo-recurso__header">
                <h1>{esEdicion ? "Editar recurso" : "Nuevo recurso"}</h1>
                <p>
                    {esEdicion
                        ? "Actualiza los datos del recurso. Los cambios se verán en el catálogo."
                        : "Registra un nuevo espacio o equipo del campus para que pueda reservarse."}
                </p>
            </header>

            <FormRecurso
                key={esEdicion ? `editar-${id}` : "nuevo"}
                inicial={esEdicion ? datosDe(actual) : formVacio}
                esEdicion={esEdicion}
                id={id}
                actual={actual}
                items={items}
            />
        </div>
    );
}

export default FormularioRecurso;
