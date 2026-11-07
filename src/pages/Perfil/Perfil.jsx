import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import Icon from "../../components/Icon/Icon";
import {
    getAvatarStyle,
    getUserInitials,
    getPhotoByUserId,
} from "../../utils/avatar";
import "./Perfil.css";

// Icono que corresponde al rol (antes estaba hardcodeado "estudiante"
// para todos los usuarios, incluso administradores y docentes).
const ICONO_POR_ROL = {
    Administrador: "admin",
    Administrativo: "admin",
    Coordinador: "admin",
    Docente: "docente"
};

function Perfil() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // La foto es de solo lectura aquí: se cambia desde Configuración.
    const foto = getPhotoByUserId(user?.id) || "";

    const iniciales = getUserInitials(user?.nombre, "U");
    const rol = user?.rol || "Usuario";
    const programa = user?.programa || "—";
    const correo = user?.correo || "—";
    const usuario = user?.usuario || "—";

    // Datos reales que entrega la sesión (mapearUsuarioSesion). Antes la
    // página mostraba valores inventados ("1.102.XXX.XXX", "Facultad de
    // Ingeniería", "2026-II", "+57 300 XXX XXXX", "Sincelejo, Sucre"...).
    const cedula = user?.cedula || "—";
    const telefono = user?.telefono || "—";
    const campus = user?.campus || "—";
    const cargo = user?.cargo || "—";
    const estado = user?.estado || "Activo";
    const cuentaActiva = String(estado).trim().toLowerCase() === "activo";
    const iconoRol = ICONO_POR_ROL[rol] || "estudiante";

    const infoPersonal = [
        { label: "Nombre completo", value: user?.nombre || "—" },
        { label: "Tipo de usuario", value: rol },
        { label: "Usuario", value: usuario },
        { label: "Documento", value: cedula }
    ];

    const infoAcademica = [
        { label: "Programa / Dependencia", value: programa },
        { label: "Campus", value: campus },
        { label: "Cargo", value: cargo }
    ];

    const infoCuenta = [
        { label: "Rol", value: rol.toUpperCase() },
        { label: "Estado", value: estado },
        { label: "Plataforma", value: "UAJS Smart Campus" }
    ];

    return (
        <div className="page">
            <div className="page__header">
                <div className="page__title">
                    <p>Consulta y administra tu información personal y académica.</p>
                </div>

                <button
                    className="button button--outline button--md"
                    onClick={() => navigate("/configuracion")}
                >
                    <Icon name="configuracion" size={14} />
                    Editar información
                </button>
            </div>

            <div className="perfil__hero">
                {/* Avatar de solo lectura: se cambia desde Configuración. */}
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
                </div>

                <div className="perfil__hero-main">
                    <h2>{user?.nombre}</h2>
                    <p>{rol} · Universidad Antonio José de Sucre</p>
                    <span className="perfil__role-badge">
                        <Icon name={iconoRol} size={12} />
                        {rol.toUpperCase()}
                    </span>
                </div>

                <div className="perfil__account-status">
                    <div className="perfil__account-status-label">Estado de cuenta</div>
                    <div
                        className={
                            "perfil__account-status-value" +
                            (cuentaActiva ? "" : " perfil__account-status-value--inactiva")
                        }
                    >
                        <span
                            className={
                                "perfil__status-dot" +
                                (cuentaActiva ? "" : " perfil__status-dot--inactiva")
                            }
                        />
                        {cuentaActiva ? "Cuenta activa" : `Cuenta ${estado.toLowerCase()}`}
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
                            <p>Programa, campus y cargo de la cuenta</p>
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
                            <span className="perfil__contact-value">{telefono}</span>
                        </div>
                    </div>

                    <div className="perfil__contact-item">
                        <div className="perfil__contact-icon">
                            <Icon name="eventos" size={14} />
                        </div>
                        <div className="perfil__contact-info">
                            <span className="perfil__contact-label">Campus</span>
                            <span className="perfil__contact-value">{campus}</span>
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
                            <div className="perfil__security-description">
                                Actualízala cuando lo necesites
                            </div>
                        </div>
                        <button
                            className="perfil__security-button"
                            onClick={() => navigate("/configuracion")}
                        >
                            Cambiar
                        </button>
                    </div>

                    <div className="perfil__security-row">
                        <div className="perfil__security-icon">
                            <Icon name="perfil" size={15} />
                        </div>
                        <div className="perfil__security-info">
                            <div className="perfil__security-title">Autenticación</div>
                            <div className="perfil__security-description">Acceso mediante cuenta institucional</div>
                        </div>
                        <button
                            className="perfil__security-button"
                            onClick={() => navigate("/configuracion")}
                        >
                            Configurar
                        </button>
                    </div>

                    <div className="perfil__security-row">
                        <div className="perfil__security-icon">
                            <Icon name="eventos" size={15} />
                        </div>
                        <div className="perfil__security-info">
                            <div className="perfil__security-title">Último acceso</div>
                            <div className="perfil__security-description">
                                Historial disponible en Configuración
                            </div>
                        </div>
                        <button
                            className="perfil__security-button"
                            onClick={() => navigate("/configuracion")}
                        >
                            Ver
                        </button>
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
