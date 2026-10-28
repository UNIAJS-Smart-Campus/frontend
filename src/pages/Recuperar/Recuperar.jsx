import { useState } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../../components/BrandLogo/BrandLogo";
import "../Login/Login.css";

function Recuperar() {
    const [cedula, setCedula] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setMensaje("");

        if (!cedula.trim()) {
            setError("Ingresa tu número de cédula.");
            return;
        }

        // Respuesta genérica: no revela si la cuenta existe ni expone datos de usuarios.
        setMensaje(
            "Si la cédula está registrada, recibirás las instrucciones de recuperación en tu correo institucional."
        );
    };

    return (
        <div className="login">
            {/* Panel izquierdo: marca */}
            <aside className="login__aside">
                <div className="login__particles" aria-hidden="true">
                    <span
                        className="login__particle"
                        style={{
                            top: "18%",
                            left: "6%",
                            width: "6px",
                            height: "6px",
                            animationDuration: "10s",
                            animationDelay: "0s",
                        }}
                    />
                    <span
                        className="login__particle"
                        style={{
                            top: "26%",
                            left: "72%",
                            width: "4px",
                            height: "4px",
                            animationDuration: "8s",
                            animationDelay: "1.5s",
                        }}
                    />
                    <span
                        className="login__particle"
                        style={{
                            top: "40%",
                            left: "12%",
                            width: "3px",
                            height: "3px",
                            animationDuration: "12s",
                            animationDelay: "3s",
                        }}
                    />
                    <span
                        className="login__particle"
                        style={{
                            top: "15%",
                            left: "45%",
                            width: "5px",
                            height: "5px",
                            animationDuration: "9s",
                            animationDelay: "2s",
                        }}
                    />
                    <span
                        className="login__particle"
                        style={{
                            top: "60%",
                            left: "82%",
                            width: "4px",
                            height: "4px",
                            animationDuration: "11s",
                            animationDelay: "0.8s",
                        }}
                    />
                    <span
                        className="login__particle"
                        style={{
                            top: "70%",
                            left: "20%",
                            width: "3px",
                            height: "3px",
                            animationDuration: "8s",
                            animationDelay: "4s",
                        }}
                    />
                    <span
                        className="login__particle"
                        style={{
                            top: "50%",
                            left: "60%",
                            width: "5px",
                            height: "5px",
                            animationDuration: "13s",
                            animationDelay: "2.6s",
                        }}
                    />
                    <span
                        className="login__particle"
                        style={{
                            top: "80%",
                            left: "68%",
                            width: "6px",
                            height: "6px",
                            animationDuration: "10s",
                            animationDelay: "1s",
                        }}
                    />
                    <span
                        className="login__particle"
                        style={{
                            top: "88%",
                            left: "35%",
                            width: "4px",
                            height: "4px",
                            animationDuration: "9s",
                            animationDelay: "5s",
                        }}
                    />
                    <span
                        className="login__particle"
                        style={{
                            top: "32%",
                            left: "90%",
                            width: "3px",
                            height: "3px",
                            animationDuration: "7s",
                            animationDelay: "3.5s",
                        }}
                    />
                    <span
                        className="login__particle"
                        style={{
                            top: "8%",
                            left: "25%",
                            width: "4px",
                            height: "4px",
                            animationDuration: "12s",
                            animationDelay: "4.5s",
                        }}
                    />
                    <span
                        className="login__particle"
                        style={{
                            top: "55%",
                            left: "4%",
                            width: "5px",
                            height: "5px",
                            animationDuration: "10s",
                            animationDelay: "6s",
                        }}
                    />
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
                        Ingresa tu cédula para recibir las instrucciones de recuperación
                        de contraseña en tu correo institucional.
                    </p>
                </div>
            </aside>

            {/* Panel derecho: formulario */}
            <section className="login__panel">
                <div className="login__card">
                    <span className="login__welcome">RECUPERAR ACCESO</span>
                    <h2 className="login__heading">Restablece tu contraseña</h2>
                    <p className="login__text">
                        Te enviaremos un enlace a tu correo institucional para que puedas
                        crear una nueva contraseña.
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

                    {mensaje && (
                        <div className="login__error" style={{
                            color: '#059669',
                            background: '#ecfdf5',
                            borderLeftColor: '#059669'
                        }} role="status">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                            <span>{mensaje}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login__form" autoComplete="off">
                        <div className="login__field">
                            <label htmlFor="recuperar-cedula">Cédula</label>
                            <input
                                type="text"
                                id="recuperar-cedula"
                                placeholder="Número de cédula"
                                value={cedula}
                                onChange={(e) => setCedula(e.target.value)}
                                autoComplete="username"
                                required
                                inputMode="numeric"
                                pattern="[0-9]*"
                            />
                        </div>

                        <button
                            type="submit"
                            className="login__submit"
                            disabled={!cedula}
                        >
                            Enviar instrucciones
                        </button>
                    </form>

                    <div className="login__creds">
                        <h4>Credenciales de prueba</h4>
                        <div className="login__creds-grid">
                            <button
                                type="button"
                                className="login__cred-btn"
                                style={{ "--cred-color": "#d32f2f" }}
                                onClick={() => setCedula("1023456789")}
                            >
                                <span className="login__cred-badge">Administrador</span>
                                <span className="login__cred-detail">1023456789 / admin123</span>
                            </button>
                            <button
                                type="button"
                                className="login__cred-btn"
                                style={{ "--cred-color": "#1976d2" }}
                                onClick={() => setCedula("1023456788")}
                            >
                                <span className="login__cred-badge">Funcionario</span>
                                <span className="login__cred-detail">1023456788 / func123</span>
                            </button>
                            <button
                                type="button"
                                className="login__cred-btn"
                                style={{ "--cred-color": "#388e3c" }}
                                onClick={() => setCedula("1023456787")}
                            >
                                <span className="login__cred-badge">Docente</span>
                                <span className="login__cred-detail">1023456787 / prof123</span>
                            </button>
                            <button
                                type="button"
                                className="login__cred-btn"
                                style={{ "--cred-color": "#f57c00" }}
                                onClick={() => setCedula("1023456786")}
                            >
                                <span className="login__cred-badge">Estudiante</span>
                                <span className="login__cred-detail">1023456786 / est123</span>
                            </button>
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <Link to="/login" className="login__forgot" style={{ fontSize: '13px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                                <line x1="19" y1="12" x2="5" y2="12"/>
                                <polyline points="12 19 5 12 12 5"/>
                            </svg>
                            Volver al inicio de sesión
                        </Link>
                    </div>

                    <small className="login__demo">Prototipo académico · Datos ficticios</small>
                </div>
            </section>
        </div>
    );
}

export default Recuperar;