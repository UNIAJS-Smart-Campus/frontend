import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import BrandLogo from "../../components/BrandLogo/BrandLogo";
import "./Login.css";

const CREDENCIALES = [
    { rol: "Administrador", user: "1023456789", pass: "admin123", color: "#d32f2f" },
    { rol: "Funcionario", user: "1023456788", pass: "func123", color: "#1976d2" },
    { rol: "Docente", user: "1023456787", pass: "prof123", color: "#388e3c" },
    { rol: "Estudiante", user: "1023456786", pass: "est123", color: "#f57c00" },
];

const PARTICULAS = [
    { top: "18%", left: "6%", size: 6, delay: 0, dur: 10 },
    { top: "26%", left: "72%", size: 4, delay: 1.5, dur: 8 },
    { top: "40%", left: "12%", size: 3, delay: 3, dur: 12 },
    { top: "15%", left: "45%", size: 5, delay: 2, dur: 9 },
    { top: "60%", left: "82%", size: 4, delay: 0.8, dur: 11 },
    { top: "70%", left: "20%", size: 3, delay: 4, dur: 8 },
    { top: "50%", left: "60%", size: 5, delay: 2.6, dur: 13 },
    { top: "80%", left: "68%", size: 6, delay: 1, dur: 10 },
    { top: "88%", left: "35%", size: 4, delay: 5, dur: 9 },
    { top: "32%", left: "90%", size: 3, delay: 3.5, dur: 7 },
    { top: "8%", left: "25%", size: 4, delay: 4.5, dur: 12 },
    { top: "55%", left: "4%", size: 5, delay: 6, dur: 10 },
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

    useEffect(() => {
        const root = document.documentElement;
        const prevTema = root.getAttribute("data-theme");
        const prevClase = root.classList.contains("dark");
        root.setAttribute("data-theme", "light");
        root.classList.remove("dark");
        return () => {
            if (prevTema) root.setAttribute("data-theme", prevTema);
            else root.removeAttribute("data-theme");
            if (prevClase) root.classList.add("dark");
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const resultado = await login(identificacion, password);
            if (!resultado?.ok) {
                setError(resultado?.mensaje || "Credenciales inválidas");
                return;
            }
            navigate(desde, { replace: true });
        } catch {
            setError("Error inesperado. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const fillCredentials = (id, pass) => {
        setIdentificacion(id);
        setPassword(pass);
        setError("");
    };

    return (
        <div className="login">
            {/* Panel izquierdo: marca */}
            <aside className="login__aside">
                <div className="login__particles" aria-hidden="true">
                    {PARTICULAS.map((p, i) => (
                        <span
                            key={i}
                            className="login__particle"
                            style={{
                                top: p.top,
                                left: p.left,
                                width: `${p.size}px`,
                                height: `${p.size}px`,
                                animationDuration: `${p.dur}s`,
                                animationDelay: `${p.delay}s`,
                            }}
                        />
                    ))}
                </div>
                <div className="login__orb login__orb--tr" aria-hidden="true">
                    <span className="login__orb-dot" />
                </div>
                <div className="login__orb login__orb--bl" aria-hidden="true">
                    <span className="login__orb-dot" />
                </div>
                <div className="login__aside-inner">
                    <BrandLogo
                        className="login__logo"
                        alt="UniAJS - Corporación Universitaria Antonio José de Sucre"
                    />
                    <span className="login__tag">PLATAFORMA UNIVERSITARIA</span>
                    <h1 className="login__title">
                        UAJS <span>Smart Campus</span>
                    </h1>
                    <p className="login__desc">
                        Una plataforma integrada para consultar y gestionar los
                        servicios universitarios desde un solo lugar.
                    </p>
                    <div className="login__features">
                        <span className="login__feature">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                            Acceso centralizado
                        </span>
                        <span className="login__feature">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                            Servicios universitarios
                        </span>
                        <span className="login__feature">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                            Información integrada
                        </span>
                    </div>
                </div>
            </aside>

            {/* Panel derecho: formulario */}
            <section className="login__panel">
                <div className="login__card">
                    <span className="login__welcome">BIENVENIDO</span>
                    <h2 className="login__heading">Ingresa a Smart Campus</h2>
                    <p className="login__text">
                        Accede a los servicios de la Universidad Antonio José de Sucre.
                    </p>

                    {error && (
                        <div className="login__error" role="alert">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login__form" autoComplete="off">
                        <div className="login__field">
                            <label htmlFor="login-identificacion">Cédula</label>
                            <input
                                type="text"
                                id="login-identificacion"
                                placeholder="Número de cédula"
                                value={identificacion}
                                onChange={(e) => setIdentificacion(e.target.value)}
                                autoComplete="username"
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="login__field">
                            <label htmlFor="login-password">Contraseña</label>
                            <div className="login__input-wrap">
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
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
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
                                <span className="login__submit-label">
                                    Ingresar
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="login__creds">
                        <h4>Credenciales de prueba</h4>
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

                    <small className="login__demo">Prototipo académico · Datos ficticios</small>
                </div>
            </section>
        </div>
    );
}

export default Login;