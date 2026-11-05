import { useEffect, useMemo, useState } from "react";
import useAuth from "../../context/useAuth";
import useColeccion from "../../hooks/useColeccion";
import Icon from "../../components/Icon/Icon";
import { configurationApi } from "../../utils/api";
import { ROLES } from "../../utils/users";
import "./RolesPrograma.css";

function RolesPrograma() {
    const { user, esAdmin } = useAuth();
    const { items: usuarios } = useColeccion("usuarios");
    const [rolSeleccionado, setRolSeleccionado] = useState(ROLES[0]?.nombre || "");
    const [asignaciones, setAsignaciones] = useState(() =>
        Object.fromEntries(ROLES.map((rol) => [rol.nombre, []]))
    );
    const [nuevoPrograma, setNuevoPrograma] = useState("");
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [guardado, setGuardado] = useState(false);

    useEffect(() => {
        if (!user || !esAdmin()) {
            setCargando(false);
            return undefined;
        }
        let vigente = true;
        configurationApi.rolePermissions()
            .then((data) => {
                if (!vigente || !data) return;
                setAsignaciones(Object.fromEntries(
                    ROLES.map((rol) => [rol.nombre, [...(data[rol.nombre]?.programas || [])]])
                ));
            })
            .catch((err) => {
                if (vigente) setError(err.message || "No se pudieron cargar las asignaciones.");
            })
            .finally(() => {
                if (vigente) setCargando(false);
            });
        return () => {
            vigente = false;
        };
    }, [user?.id, user?.rol, esAdmin]);

    const usuariosActivos = useMemo(
        () => usuarios.filter((item) => String(item.estado || "").toLowerCase() === "activo"),
        [usuarios]
    );

    const contar = (programa) => usuariosActivos.filter((item) =>
        item.rol === rolSeleccionado
        && String(item.programa || "").trim().toLowerCase() === programa.toLowerCase()
    ).length;

    const agregar = (event) => {
        event.preventDefault();
        const programa = nuevoPrograma.trim();
        if (!programa) return;
        setAsignaciones((actuales) => {
            const lista = actuales[rolSeleccionado] || [];
            if (lista.some((item) => item.toLowerCase() === programa.toLowerCase())) return actuales;
            return { ...actuales, [rolSeleccionado]: [...lista, programa] };
        });
        setNuevoPrograma("");
        setGuardado(false);
    };

    const eliminar = (programa) => {
        setAsignaciones((actuales) => ({
            ...actuales,
            [rolSeleccionado]: actuales[rolSeleccionado].filter((item) => item !== programa)
        }));
        setGuardado(false);
    };

    const guardar = async () => {
        setGuardando(true);
        setError("");
        try {
            const actual = await configurationApi.rolePermissions();
            const roles = Object.fromEntries(ROLES.map((rol) => [
                rol.nombre,
                {
                    permisos: actual?.[rol.nombre]?.permisos || rol.permisos,
                    acciones: actual?.[rol.nombre]?.acciones || rol.acciones,
                    programas: asignaciones[rol.nombre] || []
                }
            ]));
            await configurationApi.updateRolePermissions(roles);
            setGuardado(true);
        } catch (err) {
            setError(err.message || "No se pudieron guardar las asignaciones.");
        } finally {
            setGuardando(false);
        }
    };

    if (!esAdmin()) {
        return <div className="page"><div className="roles-programa__denied">Solo el administrador puede gestionar roles por programa y dependencia.</div></div>;
    }

    const lista = asignaciones[rolSeleccionado] || [];

    return (
        <div className="page roles-programa">
            <div className="page__header">
                <div className="page__title">
                    <h1>Roles por programa y dependencia</h1>
                    <p>Administra las asignaciones académicas e institucionales de cada rol.</p>
                </div>
                {guardado && <span className="badge badge--green">Cambios guardados</span>}
            </div>

            {error && <div className="badge badge--red" role="alert">{error}</div>}

            <section className="roles-programa__card">
                <div className="roles-programa__intro">
                    <div className="roles-programa__icon"><Icon name="usuarios" size={20} /></div>
                    <div>
                        <h2>Asignaciones de roles</h2>
                        <p>Ejemplo: asigna <strong>Matemáticas</strong> al rol <strong>Docente</strong> para consultar cuántos profesores pertenecen a ese programa.</p>
                    </div>
                </div>

                <div className="config__role-tabs">
                    {ROLES.map((rol) => (
                        <button
                            key={rol.nombre}
                            className={rolSeleccionado === rol.nombre ? "config__role-tab config__role-tab--active" : "config__role-tab"}
                            onClick={() => setRolSeleccionado(rol.nombre)}
                        >
                            {rol.nombre}
                        </button>
                    ))}
                </div>

                {cargando ? <p>Cargando asignaciones...</p> : (
                    <>
                        <form className="roles-programa__form" onSubmit={agregar}>
                            <label htmlFor="programa-dependencia">Programa / Dependencia para {rolSeleccionado}</label>
                            <div>
                                <input
                                    id="programa-dependencia"
                                    value={nuevoPrograma}
                                    onChange={(event) => setNuevoPrograma(event.target.value)}
                                    placeholder="Ej. Matemáticas o Bienestar Universitario"
                                />
                                <button className="config__outline-button" type="submit">Agregar</button>
                            </div>
                        </form>

                        <div className="config__program-table-wrap">
                            <table className="config__program-table">
                                <thead>
                                    <tr>
                                        <th>Rol</th>
                                        <th>Programa / Dependencia</th>
                                        <th>Usuarios activos</th>
                                        <th aria-label="Acciones" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {lista.length ? lista.map((programa) => (
                                        <tr key={programa}>
                                            <td>{rolSeleccionado}</td>
                                            <td>{programa}</td>
                                            <td><strong>{contar(programa)}</strong></td>
                                            <td><button className="config__table-delete" onClick={() => eliminar(programa)} type="button">Eliminar</button></td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4">No hay asignaciones para este rol.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button className="config__primary-button" onClick={guardar} disabled={guardando}>
                            {guardando ? "Guardando..." : "Guardar asignaciones"}
                        </button>
                    </>
                )}
            </section>
        </div>
    );
}

export default RolesPrograma;
