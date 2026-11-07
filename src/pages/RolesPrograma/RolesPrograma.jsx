import { useEffect, useMemo, useRef, useState } from "react";
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
        Object.fromEntries(ROLES.map((rol) => [rol.nombre, [...(rol.programas || [])]]))
    );
    const [nuevoPrograma, setNuevoPrograma] = useState("");
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [guardado, setGuardado] = useState(false);
    const permisosRolesRef = useRef(null);

    // Programas descubiertos automáticamente a partir de los usuarios existentes.
    const programasDescubiertos = useMemo(() => {
        const grupos = Object.fromEntries(ROLES.map((rol) => [rol.nombre, new Set()]));
        for (const u of usuarios || []) {
            if (String(u?.estado || "").toLowerCase() !== "activo") continue;
            const rol = (u?.rol || "").trim();
            const prog = (u?.programa || "").trim();
            if (!rol || !prog) continue;
            if (!grupos[rol]) grupos[rol] = new Set();
            grupos[rol].add(prog);
        }
        return Object.fromEntries(
            Object.entries(grupos).map(([rol, set]) => [rol, [...set]])
        );
    }, [usuarios]);

    useEffect(() => {
        if (!user || !esAdmin()) {
            setCargando(false);
            return undefined;
        }
        let vigente = true;
        configurationApi.rolePermissions()
            .then((data) => {
                if (!vigente || !data) return;
                permisosRolesRef.current = data;
                setAsignaciones(Object.fromEntries(
                    ROLES.map((rol) => {
                        const guardados = data[rol.nombre]?.programas || rol.programas || [];
                        const descubiertos = programasDescubiertos[rol.nombre] || [];
                        // Unir ambos, eliminando duplicados (sin distinguir mayúsculas).
                        const vistos = new Set();
                        const union = [];
                        for (const p of [...guardados, ...descubiertos]) {
                            const key = String(p).trim().toLowerCase();
                            if (!key || vistos.has(key)) continue;
                            vistos.add(key);
                            union.push(String(p).trim());
                        }
                        return [rol.nombre, union];
                    })
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
    }, [user?.id, user?.rol, esAdmin, programasDescubiertos]);

    const usuariosActivos = useMemo(
        () => usuarios.filter((item) => String(item.estado || "").toLowerCase() === "activo"),
        [usuarios]
    );

    const contar = (programa) => usuariosActivos.filter((item) =>
        item.rol === rolSeleccionado
        && String(item.programa || "").trim().toLowerCase() === programa.toLowerCase()
    ).length;

    const guardar = async (asignacionesParaGuardar) => {
        // Defensa: si se invoca desde un evento (onClick={guardar}), el primer
        // argumento es el evento y NO las asignaciones. Se ignora lo que no sea
        // un objeto plano para no borrar los programas guardados.
        const esObjetoValido =
            asignacionesParaGuardar &&
            typeof asignacionesParaGuardar === "object" &&
            !Array.isArray(asignacionesParaGuardar);
        const origen = esObjetoValido ? asignacionesParaGuardar : asignaciones;

        setGuardando(true);
        setError("");
        try {
            const actual = permisosRolesRef.current || {};
            const roles = Object.fromEntries(ROLES.map((rol) => [
                rol.nombre,
                {
                    permisos: actual?.[rol.nombre]?.permisos || rol.permisos,
                    acciones: actual?.[rol.nombre]?.acciones || rol.acciones,
                    programas: origen[rol.nombre] || []
                }
            ]));
            await configurationApi.updateRolePermissions(roles);
            permisosRolesRef.current = roles;
            setGuardado(true);
        } catch (err) {
            setError(err.message || "No se pudieron guardar las asignaciones.");
        } finally {
            setGuardando(false);
        }
    };

    const agregar = async (event) => {
        event.preventDefault();
        const programa = nuevoPrograma.trim();
        if (!programa || guardando) return;

        const lista = asignaciones[rolSeleccionado] || [];
        if (lista.some((item) => item.toLowerCase() === programa.toLowerCase())) return;

        const nuevasAsignaciones = {
            ...asignaciones,
            [rolSeleccionado]: [...lista, programa]
        };
        setAsignaciones(nuevasAsignaciones);
        setNuevoPrograma("");
        setGuardado(false);
        await guardar(nuevasAsignaciones);
    };

    const eliminar = (programa) => {
        setAsignaciones((actuales) => ({
            ...actuales,
            [rolSeleccionado]: actuales[rolSeleccionado].filter((item) => item !== programa)
        }));
        setGuardado(false);
    };

    if (!esAdmin()) {
        return <div className="page"><div className="roles-programa__denied">Solo el administrador puede gestionar roles por programa y dependencia.</div></div>;
    }

    const lista = asignaciones[rolSeleccionado] || [];

    return (
        <div className="page roles-programa">
            {guardado && <div className="page__header"><span className="badge badge--green">Cambios guardados</span></div>}

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
                        <button
                            className="config__primary-button"
                            onClick={() => guardar()}
                            disabled={guardando}
                        >
                            {guardando ? "Guardando..." : "Guardar asignaciones"}
                        </button>
                    </>
                )}
            </section>
        </div>
    );
}

export default RolesPrograma;
