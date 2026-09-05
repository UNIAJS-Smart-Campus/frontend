import { useState } from "react";
import { Link } from "react-router-dom";
import { obtenerUsuarios } from "../../utils/users";
import BrandLogo from "../../components/BrandLogo/BrandLogo";
import "../Login/Login.css";

function Recuperar() {
    const [cedula, setCedula] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        const usuarios = obtenerUsuarios();
        const usuario = usuarios.find(
            (item) => String(item.cedula) === String(cedula).trim()
        );

        if (!usuario) {
            setError("No encontramos una cuenta con esa cédula.");
            setMensaje("");
            return;
        }

        setError("");
        setMensaje(`Se enviaron las instrucciones de recuperación a ${usuario.correo || "tu correo institucional"}. Revisa tu bandeja de entrada.`);
    };

    return (
        <div className="login">
            <div className="login__card">
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
                            <BrandLogo
                                className="login__brand-logo"
                                alt="UniAJS - Corporación Universitaria Antonio José de Sucre"
                            />
                        </div>

                        <div className="login__hero">
                            <h1 className="login__hero-title">
                                Recupera el<br />acceso a tu<br />cuenta
                            </h1>
                            <p className="login__hero-desc">
                                Te enviaremos las instrucciones para restablecer tu contraseña a tu correo institucional.
                            </p>                        </div>
                    </div>
                </aside>

                <main className="login__main">
                    <div className="login__form-box">
                        <div className="login__form-header">
                            <h2>Recuperar acceso</h2>
                            <p>Ingresa tu número de cédula para continuar</p>
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

                        {mensaje && (
                            <div className="login__success" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px 14px',
                                marginBottom: '20px',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#059669',
                                background: '#ecfdf5',
                                borderLeft: '4px solid #059669',
                                borderRadius: '8px'
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                                <span>{mensaje}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="login__form" autoComplete="off">
                            <div className="login__field">
                                <label htmlFor="recuperar-cedula">Cédula</label>
                                <div className="login__input-wrap">
                                    <svg className="login__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                                        <line x1="7" y1="15" x2="7" y2="15"/>
                                        <line x1="2" y1="9" x2="22" y2="9"/>
                                    </svg>
                                    <input
                                        type="text"
                                        id="recuperar-cedula"
                                        placeholder="Número de cédula"
                                        value={cedula}
                                        onChange={(e) => setCedula(e.target.value)}
                                        required
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="login__submit" disabled={!cedula}>
                                Enviar instrucciones
                            </button>
                        </form>

                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
                            <Link to="/login" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: 'var(--color-primary-600)',
                                textDecoration: 'none'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="19" y1="12" x2="5" y2="12"/>
                                    <polyline points="12 19 5 12 12 5"/>
                                </svg>
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Recuperar;
