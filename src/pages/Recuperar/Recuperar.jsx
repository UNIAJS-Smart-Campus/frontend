import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authApi } from "../../utils/api";
import BrandLogo from "../../components/BrandLogo/BrandLogo";
import "../Login/Login.css";

// ============================================================
// RECUPERAR ACCESO
//
// Dos modos en la misma ruta `/recuperar`:
//   - sin ?token  -> el usuario pide el enlace (se envía por correo).
//   - con ?token  -> viene del correo: define la nueva contraseña.
//
// Todo pasa por el backend (`/auth/recuperar` y `/auth/restablecer`). Si el
// servicio de correo no está configurado, el backend responde 503 y aquí se
// muestra el mensaje tal cual: no se finge que se envió nada.
// ============================================================

function Recuperar() {
    const [params] = useSearchParams();
    const token = params.get("token") || "";

    const [identificacion, setIdentificacion] = useState("");
    const [password, setPassword] = useState("");
    const [confirmar, setConfirmar] = useState("");

    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);

    // Modo 1: solicitar el enlace de recuperación.
    const solicitar = async (e) => {
        e.preventDefault();
        setError("");
        setMensaje("");
        setEnviando(true);
        try {
            const data = await authApi.forgot({ identificacion });
            setMensaje(data?.mensaje || "Revisa el correo registrado en tu cuenta.");
        } catch (err) {
            setError(err?.message || "No se pudo procesar la solicitud.");
        } finally {
            setEnviando(false);
        }
    };

    // Modo 2: definir la nueva contraseña con el token del correo.
    const restablecer = async (e) => {
        e.preventDefault();
        setError("");
        setMensaje("");
        if (password !== confirmar) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        setEnviando(true);
        try {
            const data = await authApi.reset(token, password);
            setMensaje(data?.mensaje || "Contraseña actualizada. Ya puedes iniciar sesión.");
            setPassword("");
            setConfirmar("");
        } catch (err) {
            setError(err?.message || "El enlace no es válido o ya expiró.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="login">
            <aside className="login__aside">
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

                    <h1 className="login__title">
                        {token ? (
                            <>Crea tu<br />nueva<br />contraseña</>
                        ) : (
                            <>Recupera el<br />acceso a tu<br />cuenta</>
                        )}
                    </h1>
                    <p className="login__desc">
                        {token
                            ? "Elige una contraseña nueva para volver a entrar a tu cuenta."
                            : "Te enviaremos un enlace para restablecer tu contraseña al correo registrado en tu cuenta."}
                    </p>
                </div>
            </aside>

            <section className="login__panel">
                <div className="login__card">
                    <div className="login__form-header">
                        <h2>{token ? "Nueva contraseña" : "Recuperar acceso"}</h2>
                        <p>
                            {token
                                ? "Ingresa y confirma tu nueva contraseña"
                                : "Ingresa tu correo o número de cédula"}
                        </p>
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
                        <div className="login__success" role="alert">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                            <span>{mensaje}</span>
                        </div>
                    )}

                    {token ? (
                        <form onSubmit={restablecer} className="login__form" autoComplete="off">
                            <div className="login__field">
                                <label htmlFor="nueva-password">Nueva contraseña</label>
                                <input
                                    type="password"
                                    id="nueva-password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div className="login__field">
                                <label htmlFor="confirmar-password">Confirmar contraseña</label>
                                <input
                                    type="password"
                                    id="confirmar-password"
                                    placeholder="Repite la contraseña"
                                    value={confirmar}
                                    onChange={(e) => setConfirmar(e.target.value)}
                                    minLength={6}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="login__submit"
                                disabled={!password || !confirmar || enviando}
                            >
                                {enviando ? "Guardando..." : "Guardar contraseña"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={solicitar} className="login__form" autoComplete="off">
                            <div className="login__field">
                                <label htmlFor="recuperar-identificacion">Correo o número de cédula</label>
                                <input
                                    type="text"
                                    id="recuperar-identificacion"
                                    placeholder="Ej.: correo@uajs.edu.co o 1023456789"
                                    value={identificacion}
                                    onChange={(e) => setIdentificacion(e.target.value)}
                                    required
                                />
                                <p className="login__hint">
                                    El enlace llegará siempre al correo registrado en tu cuenta.
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="login__submit"
                                disabled={!identificacion || enviando}
                            >
                                {enviando ? "Enviando..." : "Enviar instrucciones"}
                            </button>
                        </form>
                    )}

                    <div className="login__back-link">
                        <Link to="/login">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"/>
                                <polyline points="12 19 5 12 12 5"/>
                            </svg>
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Recuperar;
