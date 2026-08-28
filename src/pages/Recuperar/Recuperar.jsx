import { useState } from "react";
import { Link } from "react-router-dom";
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
            setError("No encontramos una cuenta con ese correo institucional.");
            setMensaje("");
            return;
        }

        setError("");
        setMensaje(`Se enviaron las instrucciones de recuperación a ${correo.trim()}. Revisa tu bandeja de entrada.`);
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
                            <img src="/uniajs-logo-light.svg" alt="UniAJS - Corporación Universitaria Antonio José de Sucre" className="login__brand-logo" />
                        </div>

                        <div className="login__hero">
                            <h1 className="login__hero-title">
                                Recupera el<br />acceso a tu<br />cuenta
                            </h1>
                            <p className="login__hero-desc">
                                Te enviaremos las instrucciones para restablecer tu contraseña a tu correo institucional.
                            </p>
                        </div>
                    </div>
                </aside>

                <main className="login__main">
                    <div className="login__form-box">
                        <div className="login__form-header">
                            <h2>Recuperar acceso</h2>
                            <p>Ingresa tu correo institucional para continuar</p>
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
                                <label htmlFor="recuperar-correo">Correo institucional</label>
                                <div className="login__input-wrap">
                                    <svg className="login__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                    <input
                                        type="email"
                                        id="recuperar-correo"
                                        placeholder="usuario@uajs.edu.co"
                                        value={correo}
                                        onChange={(e) => setCorreo(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="login__submit" disabled={!correo}>
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
