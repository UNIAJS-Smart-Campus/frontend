import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import { TIPOS_PQRS } from "../../../utils/pqrs";
import "./NuevaPQRS.css";

const STORAGE_KEY = "uajs_pqrs";

function NuevaPQRS() {
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

        const numero = `PQRS-2026-${String(15 + Math.floor(Math.random() * 900)).padStart(3, "0")}`;

        const nueva = {
            id: numero,
            tipo: form.tipo,
            fecha: new Date().toISOString().slice(0, 10),
            estado: "Registrada",
            descripcion: form.descripcion
        };

        try {
            const actuales = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            localStorage.setItem(STORAGE_KEY, JSON.stringify([nueva, ...actuales]));
        } catch {
            // si localStorage no está disponible se ignora
        }

        setConfirmacion(
            `Tu ${form.tipo.toLowerCase()} fue registrada con el número ${numero}.`
        );
    };

    return (
        <div className="nueva-pqrs">
            <Link to="/pqrs" className="nueva-pqrs__back">
                ← Volver a PQRS
            </Link>

            <header className="nueva-pqrs__header">
                <h1 className="nueva-pqrs__title">Nueva PQRS</h1>
                <p className="nueva-pqrs__subtitle">
                    Registra una petición, queja, reclamo o sugerencia.
                </p>
            </header>

            {confirmacion ? (
                <div className="nueva-pqrs__confirm">
                    <p>{confirmacion}</p>
                    <Link to="/pqrs">
                        <Button variant="primary">Ver mis PQRS</Button>
                    </Link>
                </div>
            ) : (
                <form className="nueva-pqrs__form" onSubmit={handleSubmit}>
                    <label className="nueva-pqrs__label" htmlFor="pqrs-tipo">
                        Tipo de PQRS
                    </label>

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

                    <Input
                        label="Descripción"
                        type="textarea"
                        name="descripcion"
                        placeholder="Describe tu petición, queja, reclamo o sugerencia…"
                        value={form.descripcion}
                        onChange={handleChange}
                        id="pqrs-descripcion"
                    />

                    <Button
                        variant="primary"
                        type="submit"
                        disabled={!form.descripcion.trim()}
                    >
                        Enviar PQRS
                    </Button>
                </form>
            )}
        </div>
    );
}

export default NuevaPQRS;