import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import useAuth from "../../context/useAuth";
import "./Login.css";

function Login() {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const desde = location.state?.from?.pathname || "/dashboard";

    const handleSubmit = (e) => {
        e.preventDefault();

        const resultado = login(usuario, password);

        if (!resultado.ok) {
            setError(resultado.mensaje);
            return;
        }

        navigate(desde, { replace: true });
    };

    return (
        <main className="auth">
            <div className="auth__brand">
                <span className="auth__logo">U</span>
                <h1 className="auth__name">UniAJS</h1>
            </div>

            <div className="auth__card">
                <h2 className="auth__title">Iniciar sesión</h2>
                <p className="auth__subtitle">
                    Ingresa con tu usuario institucional para acceder a la
                    plataforma.
                </p>

                <form className="auth__form" onSubmit={handleSubmit}>
                    {error && <p className="auth__error">{error}</p>}

                    <Input
                        label="Usuario"
                        type="text"
                        name="usuario"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        placeholder="ej. admin"
                        autoComplete="username"
                        id="login-usuario"
                    />

                    <Input
                        label="Contraseña"
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        id="login-password"
                    />

                    <Button
                        variant="primary"
                        type="submit"
                        size="md"
                        className="auth__submit"
                        disabled={!usuario || !password}
                    >
                        Ingresar
                    </Button>
                </form>

                <div className="auth__footer">
                    ¿Olvidaste tu contraseña?{" "}
                    <Link to="/recuperar" className="auth__link">
                        Recuperar acceso
                    </Link>
                </div>

                <p className="auth__hint">
                    <strong>Credenciales de prueba:</strong>
                    <br />• Administrador: <strong>admin</strong> / admin123
                    <br />• Administrativo: <strong>funcionario</strong> / func123
                    <br />• Docente: <strong>profesor</strong> / prof123
                    <br />• Estudiante: <strong>estudiante</strong> / est123
                </p>
            </div>
        </main>
    );
}

export default Login;
