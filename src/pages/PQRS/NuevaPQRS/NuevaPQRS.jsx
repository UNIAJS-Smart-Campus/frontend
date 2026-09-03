import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/Icon/Icon";
import useAuth from "../../../context/useAuth";
import { TIPOS_PQRS, obtenerPqrs, guardarPqrs } from "../../../utils/pqrs";
import "./NuevaPQRS.css";

function NuevaPQRS() {
    const { user } = useAuth();
    const [form, setForm] = useState({
        tipo: TIPOS_PQRS[0],
        descripcion: ""
    });

    const [confirmacion, setConfirmacion] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const numero = `PQRS-2026-${String(Date.now()).slice(-3)}`;
        const nueva = {
            id: numero,
            tipo: form.tipo,
            fecha: new Date().toISOString().slice(0, 10),
            estado: "Registrada",
            descripcion: form.descripcion,
            solicitante: user?.nombre || "Anónimo",
            usuarioId: user?.id ?? null
        };
        const lista = obtenerPqrs();
        lista.unshift(nueva);
        guardarPqrs(lista);
        setConfirmacion(
            `Tu ${form.tipo.toLowerCase()} fue registrada con el número ${numero}.`
        );
    };

    return (
        <div className="nueva-pqrs">
            <Link to="/pqrs" className="nueva-pqrs__back">
                ← Volver a PQRS
            </Link>

            <div className="nueva-pqrs__page-header">
                <div className="nueva-pqrs__page-title">
                    <h1>Nueva PQRS</h1>
                    <p>
                        Registra una petición, queja, reclamo o sugerencia.
                    </p>
                </div>
            </div>

            {confirmacion ? (
                <div className="nueva-pqrs__confirm">
                    <p>{confirmacion}</p>
                    <Link to="/pqrs" className="nueva-pqrs__submit">
                        Ver mis PQRS
                    </Link>
                </div>
            ) : (
                <form className="nueva-pqrs__form" onSubmit={handleSubmit}>
                    <div className="nueva-pqrs__form-group">
                        <label htmlFor="pqrs-tipo">Tipo de PQRS</label>
                        <select
                            id="pqrs-tipo"
                            className="nueva-pqrs__select"
                            name="tipo"
                            value={form.tipo}
                            onChange={handleChange}
                        >
                            {TIPOS_PQRS.map((tipo) => (
                                <option key={tipo} value={tipo}>
                                    {tipo}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="nueva-pqrs__form-group">
                        <label htmlFor="pqrs-descripcion">Descripción</label>
                        <textarea
                            id="pqrs-descripcion"
                            className="nueva-pqrs__textarea"
                            name="descripcion"
                            placeholder="Describe tu petición, queja, reclamo o sugerencia…"
                            value={form.descripcion}
                            onChange={handleChange}
                            rows="5"
                        />
                    </div>

                    <div className="nueva-pqrs__actions">
                        <button
                            type="submit"
                            className="nueva-pqrs__submit"
                            disabled={!form.descripcion.trim()}
                        >
                            <Icon name="pqrs" size={15} />
                            Enviar PQRS
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default NuevaPQRS;
