import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import "./Login.css";

const CREDENCIALES = [
    { rol: "Administrador", user: "admin", pass: "admin123", color: "#d32f2f" },
    { rol: "Funcionario", user: "funcionario", pass: "func123", color: "#1976d2" },
    { rol: "Docente", user: "profesor", pass: "prof123", color: "#388e3c" },
    { rol: "Estudiante", user: "estudiante", pass: "est123", color: "#f57c00" },
];

function Login() {
    const [identificacion, setIdentificacion] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const desde = location.state?.from?.pathname || "/dashboard";

    const handleLogin = async () => {
        try {
            const resultado = await login(identificacion, password);
            if (!resultado?.ok) {
                setError(resultado?.mensaje || "Credenciales inválidas");
                return;
            }
            navigate(desde, { replace: true });
        } catch {
            setError("Error inesperado. Inténtalo de nuevo.");
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    handleLogin();  // ✅ se encarga de setLoading(false)
};

const fillCredentials = (identificacion, pass) => {
    setIdentificacion(identificacion);
    setPassword(pass);
    setError("");
};

    return (
        <div className="login">
            <div className="login__card">
                {/* Panel izquierdo */}
                <aside className="login__aside">
                    <div className="login__orb login__orb--tl">
                        <div className="login__orbit">
                            <span className="login__dot" />
                        </div>
                        <div className="login__orbit login__orbit--inner">
                            <span className="login__dot login__dot--inner" />
                        </div>
                    </div>
                    <div className="login__orb login__orb--tr">
                        <div className="login__orbit">
                            <span className="login__dot" />
                        </div>
                        <div className="login__orbit login__orbit--inner">
                            <span className="login__dot login__dot--inner" />
                        </div>
                    </div>
                    <div className="login__orb login__orb--bl">
                        <div className="login__orbit">
                            <span className="login__dot" />
                        </div>
                        <div className="login__orbit login__orbit--inner">
                            <span className="login__dot login__dot--inner" />
                        </div>
                    </div>
                    <div className="login__orb login__orb--br">
                        <div className="login__orbit">
                            <span className="login__dot" />
                        </div>
                        <div className="login__orbit login__orbit--inner">
                            <span className="login__dot login__dot--inner" />
                        </div>
                    </div>
                    <div className="login__aside-inner">
                        <div className="login__brand">
                            <img src="/Logo_Light_UAJS.png" alt="UniAJS - Corporación Universitaria Antonio José de Sucre" className="login__brand-logo" />
                        </div>

                        <div className="login__hero">
                            <h1 className="login__hero-title">
                                Plataforma<br />Inteligente de<br />Gestión
                            </h1>
                            <p className="login__hero-desc">
                                Administra solicitudes, reservas, recursos y más desde un solo lugar.
                            </p>
                        </div>
                    </div>
                </aside>

                {/* Panel derecho: formulario */}
                <main className="login__main">
                    <div className="login__form-box">
                        <div className="login__form-header">
                            <h2>Bienvenido</h2>
                            <p>Ingresa con tu cuenta institucional</p>
                        </div>

                        {error && (
                            <div className="login__error" role="alert">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="login__form" autoComplete="off">
                            <div className="login__field">
                                <label htmlFor="login-identificacion">Identificación</label>
                                <div className="login__input-wrap">
                                    <svg className="login__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                    <input
                                        type="text"
                                        id="login-identificacion"
                                        placeholder="ej. admin"
                                        value={identificacion}
                                        onChange={(e) => setIdentificacion(e.target.value)}
                                        autoComplete="username"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="login__field">
                                <label htmlFor="login-password">Contraseña</label>
                                <div className="login__input-wrap">
                                    <svg className="login__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="login-password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        disabled={loading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="login__toggle-pw"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                        aria-label="Mostrar contraseña"
                                    >
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                                <line x1="1" y1="1" x2="23" y2="23"/>
                                                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="login__actions">
                                <label className="login__checkbox">
                                    <input type="checkbox" />
                                    <span className="login__checkmark" />
                                    <span>Recordarme</span>
                                </label>
                                <Link to="/recuperar" className="login__forgot">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                className="login__submit"
                                disabled={!identificacion || !password || loading}
                            >
                                {loading ? (
                                    <span className="login__spinner" />
                                ) : (
                                    "Iniciar Sesión"
                                )}
                            </button>
                        </form>

                        <div className="login__creds">
                            <h4>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                Credenciales de prueba
                            </h4>
                            <div className="login__creds-grid">
                                {CREDENCIALES.map((c) => (
                                    <button
                                        key={c.user}
                                        type="button"
                                        className="login__cred-btn"
                                        style={{ "--cred-color": c.color }}
                                        onClick={() => fillCredentials(c.user, c.pass)}
                                        disabled={loading}
                                    >
                                        <span className="login__cred-badge">{c.rol}</span>
                                        <span className="login__cred-detail">{c.user} / {c.pass}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Login;
