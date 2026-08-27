import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import { obtenerUsuarios } from "../../utils/users";
import "../Login/Login.css";

function Recuperar() {
    const [correo, setCorreo] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        const usuarios = obtenerUsuarios();
        const existe = usuarios.some(
            (item) => item.correo.toLowerCase() === correo.trim().toLowerCase()
        );

        if (!existe) {
            setError(
                "No encontramos una cuenta con ese correo institucional."
            );
            setMensaje("");
            return;
        }

        setError("");
        setMensaje(
            `Se enviaron las instrucciones de recuperación a ${correo.trim()}. Revisa tu bandeja de entrada.`
        );
    };

    return (
        <main className="auth">
            <div className="auth__brand">
                <span className="auth__logo">U</span>
                <h1 className="auth__name">UniAJS</h1>
            </div>

            <div className="auth__card">
                <h2 className="auth__title">Recuperar acceso</h2>
                <p className="auth__subtitle">
                    Ingresa tu correo institucional y te enviaremos las
                    instrucciones para restablecer tu contraseña.
                </p>

                <form className="auth__form" onSubmit={handleSubmit}>
                    {error && <p className="auth__error">{error}</p>}
                    {mensaje && <p className="auth__success">{mensaje}</p>}

                    <Input
                        label="Correo institucional"
                        type="email"
                        name="correo"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        placeholder="usuario@uajs.edu.co"
                        id="recuperar-correo"
                    />

                    <Button
                        variant="primary"
                        type="submit"
                        size="md"
                        disabled={!correo}
                    >
                        Enviar instrucciones
                    </Button>
                </form>

                <div className="auth__footer">
                    <Link to="/login" className="auth__link">
                        ← Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default Recuperar;
