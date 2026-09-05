import { useRef, useState } from "react";
import useAuth from "../../context/useAuth";
import Icon from "../../components/Icon/Icon";
import {
    getAvatarStyle,
    getUserInitials,
    getPhotoByUserId,
    savePhotoByUserId,
    removePhotoByUserId,
} from "../../utils/avatar";
import "./Perfil.css";

function Perfil() {
    const { user, updateUser } = useAuth();
    const inputRef = useRef(null);

    // Foto vigente: primero busca por userId, si no existe usa la de la sesión
    const [foto, setFoto] = useState(() => getPhotoByUserId(user?.id) || "");
    const [errorFoto, setErrorFoto] = useState("");

    const iniciales = getUserInitials(user?.nombre, "U");
    const rol = user?.rol || "Usuario";
    const programa = user?.programa || "—";
    const correo = user?.correo || "—";
    const usuario = user?.usuario || "—";

    // ── Subir foto ──────────────────────────────────────────────────────────
    const handleFotoChange = (e) => {
        const archivo = e.target.files?.[0];
        if (!archivo) return;

        // Validar tipo
        if (!archivo.type.startsWith("image/")) {
            setErrorFoto("Solo se permiten imágenes (JPG, PNG, WEBP).");
            return;
        }
        // Límite 2 MB
        if (archivo.size > 2 * 1024 * 1024) {
            setErrorFoto("La imagen no debe superar 2 MB.");
            return;
        }

        setErrorFoto("");
        const reader = new FileReader();
        reader.onload = (ev) => {
            const base64 = ev.target.result;
            savePhotoByUserId(user?.id, base64);
            setFoto(base64);
            updateUser({ foto: base64 });
        };
        reader.readAsDataURL(archivo);
        // Limpiar el input para que vuelva a disparar si se selecciona el mismo archivo
        e.target.value = "";
    };

    // ── Eliminar foto ───────────────────────────────────────────────────────
    const handleEliminarFoto = () => {
        removePhotoByUserId(user?.id);
        setFoto("");
        updateUser({ foto: "" });
    };

    const infoPersonal = [
        { label: "Nombre completo", value: user?.nombre || "—" },
        { label: "Tipo de usuario", value: rol },
        { label: "Usuario", value: usuario },
        { label: "Documento", value: "1.102.XXX.XXX" }
    ];

    const infoAcademica = [
        { label: "Programa / Dependencia", value: programa },
        { label: "Facultad", value: "Facultad de Ingeniería" },
        { label: "Semestre", value: "2026-II" },
        { label: "Tipo de usuario", value: rol }
    ];

    const infoCuenta = [
        { label: "Rol", value: rol.toUpperCase() },
        { label: "Estado", value: "Activa" },
        { label: "Fecha de registro", value: "15 de enero de 2025" },
        { label: "Plataforma", value: "UAJS Smart Campus" }
    ];

    return (
        <div className="page">
            <div className="page__header">
                <div className="page__title">
                    <p>Consulta y administra tu información personal y académica.</p>
                </div>

                <button className="button button--outline button--md">
                    <Icon name="configuracion" size={14} />
                    Editar información
                </button>
            </div>

            <div className="perfil__hero">
                {/* ── Avatar con uploader ── */}
                <div className="perfil__avatar-wrap">
                    <div
                        className="perfil__big-avatar"
                        style={
                            foto
                                ? {
                                    backgroundImage: `url(${foto})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat",
                                    color: "transparent",
                                }
                                : getAvatarStyle(
                                    user?.nombre,
                                    "linear-gradient(135deg, var(--color-primary), var(--color-primary-700))"
                                )
                        }
                        aria-label={user?.nombre || "Usuario"}
                    >
                        {!foto && iniciales}
                    </div>

                    {/* Overlay de cámara */}
                    <button
                        type="button"
                        className="perfil__avatar-overlay"
                        onClick={() => inputRef.current?.click()}
                        title="Cambiar foto de perfil"
                        aria-label="Cambiar foto de perfil"
                    >
                        <span className="perfil__avatar-overlay-icon">📷</span>
                        <span className="perfil__avatar-overlay-text">
                            {foto ? "Cambiar" : "Subir foto"}
                        </span>
                    </button>

                    {/* Input oculto */}
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="perfil__avatar-input"
                        onChange={handleFotoChange}
                        aria-label="Seleccionar foto de perfil"
                    />

                    {/* Botón eliminar — solo visible si hay foto */}
                    {foto && (
                        <button
                            type="button"
                            className="perfil__avatar-remove"
                            onClick={handleEliminarFoto}
                            title="Eliminar foto"
                        >
                            ✕ Eliminar
                        </button>
                    )}

                    {/* Error de validación */}
                    {errorFoto && (
                        <p style={{ fontSize: 9, color: "var(--color-danger)", marginTop: 4, textAlign: "center", maxWidth: 110 }}>
                            {errorFoto}
                        </p>
                    )}
                </div>

                <div className="perfil__hero-main">
                    <h2>{user?.nombre}</h2>
                    <p>Estudiante · Universidad Antonio José de Sucre</p>
                    <span className="perfil__role-badge">
                        <Icon name="estudiante" size={12} />
                        {rol.toUpperCase()}
                    </span>
                </div>

                <div className="perfil__account-status">
                    <div className="perfil__account-status-label">Estado de cuenta</div>
                    <div className="perfil__account-status-value">
                        <span className="perfil__status-dot" />
                        Cuenta activa
                    </div>
                </div>
            </div>

            <div className="perfil__grid">
                <div className="card">
                    <div className="card__header">
                        <div className="perfil__card-header-icon">
                            <Icon name="perfil" size={16} />
                        </div>
                        <div>
                            <h2>Información personal</h2>
                            <p>Datos básicos del usuario</p>
                        </div>
                    </div>

                    <div className="perfil__info-grid">
                        {infoPersonal.map((item) => (
                            <div className="perfil__info-item" key={item.label}>
                                <span className="perfil__info-label">{item.label}</span>
                                <span className="perfil__info-value">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card__header">
                        <div className="perfil__card-header-icon">
                            <Icon name="estudiante" size={16} />
                        </div>
                        <div>
                            <h2>Información académica</h2>
                            <p>Información del estudiante</p>
                        </div>
                    </div>

                    <div className="perfil__info-grid">
                        {infoAcademica.map((item) => (
                            <div className="perfil__info-item" key={item.label}>
                                <span className="perfil__info-label">{item.label}</span>
                                <span className="perfil__info-value">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card__header">
                        <div className="perfil__card-header-icon">
                            <Icon name="notificaciones" size={16} />
                        </div>
                        <div>
                            <h2>Datos de contacto</h2>
                            <p>Información para comunicaciones</p>
                        </div>
                    </div>

                    <div className="perfil__contact-item">
                        <div className="perfil__contact-icon">
                            <Icon name="solicitudes" size={14} />
                        </div>
                        <div className="perfil__contact-info">
                            <span className="perfil__contact-label">Correo institucional</span>
                            <span className="perfil__contact-value">{correo}</span>
                        </div>
                    </div>

                    <div className="perfil__contact-item">
                        <div className="perfil__contact-icon">
                            <Icon name="reservas" size={14} />
                        </div>
                        <div className="perfil__contact-info">
                            <span className="perfil__contact-label">Teléfono</span>
                            <span className="perfil__contact-value">+57 300 XXX XXXX</span>
                        </div>
                    </div>

                    <div className="perfil__contact-item">
                        <div className="perfil__contact-icon">
                            <Icon name="eventos" size={14} />
                        </div>
                        <div className="perfil__contact-info">
                            <span className="perfil__contact-label">Ubicación</span>
                            <span className="perfil__contact-value">Sincelejo, Sucre</span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card__header">
                        <div className="perfil__card-header-icon">
                            <Icon name="configuracion" size={16} />
                        </div>
                        <div>
                            <h2>Seguridad</h2>
                            <p>Configuración de tu cuenta</p>
                        </div>
                    </div>

                    <div className="perfil__security-row">
                        <div className="perfil__security-icon">
                            <Icon name="configuracion" size={15} />
                        </div>
                        <div className="perfil__security-info">
                            <div className="perfil__security-title">Contraseña</div>
                            <div className="perfil__security-description">Última modificación hace 30 días</div>
                        </div>
                        <button className="perfil__security-button">Cambiar</button>
                    </div>

                    <div className="perfil__security-row">
                        <div className="perfil__security-icon">
                            <Icon name="perfil" size={15} />
                        </div>
                        <div className="perfil__security-info">
                            <div className="perfil__security-title">Autenticación</div>
                            <div className="perfil__security-description">Acceso mediante cuenta institucional</div>
                        </div>
                        <button className="perfil__security-button">Configurar</button>
                    </div>

                    <div className="perfil__security-row">
                        <div className="perfil__security-icon">
                            <Icon name="eventos" size={15} />
                        </div>
                        <div className="perfil__security-info">
                            <div className="perfil__security-title">Último acceso</div>
                            <div className="perfil__security-description">Hoy, 10:23 a. m.</div>
                        </div>
                        <button className="perfil__security-button">Ver</button>
                    </div>
                </div>

                <div className="card perfil__card--full">
                    <div className="card__header">
                        <div className="perfil__card-header-icon">
                            <Icon name="info" size={16} />
                        </div>
                        <div>
                            <h2>Información de la cuenta</h2>
                            <p>Datos relacionados con tu cuenta dentro de Smart Campus</p>
                        </div>
                    </div>

                    <div className="perfil__info-grid">
                        {infoCuenta.map((item) => (
                            <div className="perfil__info-item" key={item.label}>
                                <span className="perfil__info-label">{item.label}</span>
                                <span className="perfil__info-value">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Perfil;
