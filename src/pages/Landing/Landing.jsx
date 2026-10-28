import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon/Icon";
import ServiceCard from "../../components/ServiceCard/ServiceCard";
import BrandLogo from "../../components/BrandLogo/BrandLogo";
import FontSizeToggle from "../../components/FontSizeToggle/FontSizeToggle";
import useAuth from "../../context/useAuth";
import services from "../../utils/services";
import "./Landing.css";

const REDIRECT_SECONDS = 5;

const profiles = [
    {
        name: "Estudiantes",
        icon: "estudiante",
        description: "Solicitan servicios, reservan espacios y consultan eventos académicos."
    },
    {
        name: "Docentes",
        icon: "docente",
        description: "Gestionan salones, laboratorios y actividades de sus asignaturas."
    },
    {
        name: "Administradores",
        icon: "admin",
        description: "Administran recursos, usuarios, reservas y la configuración del campus."
    }
];

const INSTITUCIONAL = {
    telefono: "323 5996414",
    whatsapp: "310 2037579",
    whatsappLink: "https://wa.me/573102037579",
    direccion: "Edificio Sede E, Barrio La María, Sincelejo, Calle 27 No 21-50",
    email: "info@uniajs.edu.co",
    vigencia: "Resolución Personería Jurídica No. 2302 de 2003 (30 de Sep. 2003)",
    snies: "Código SNIES 2850"
};

const SOBRE_NOSOTROS = {
    mision: "La Corporación Universitaria Antonio José de Sucre es una institución de educación superior de carácter privado dedicada a la formación integral de ciudadanos competentes, críticos y con visión global. A través de un modelo pedagógico flexible centrado en el aprendizaje activo, promueve trayectorias formativas inclusivas, articulando la investigación, la innovación, el emprendimiento y la proyección social para resolver problemáticas pertinentes del entorno.",
    vision: "La Corporación se proyecta como una institución referente en la región por la pertinencia y flexibilidad de su oferta académica y por su capacidad de formar ciudadanos competentes, íntegros, críticos y con visión global, aportando soluciones a los desafíos del territorio e impulsando trayectorias formativas a lo largo de la vida."
};

function Landing() {
    const [seconds, setSeconds] = useState(REDIRECT_SECONDS);
    const [paused, setPaused] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (paused) return undefined;
        if (seconds <= 0) return undefined;
        const timer = setTimeout(() => {
            setSeconds((prev) => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
    }, [seconds, paused]);

    useEffect(() => {
        if (seconds > 0 || paused) return;
        const target = user ? "/dashboard" : "/login";
        navigate(target);
    }, [seconds, paused, navigate, user]);

    useEffect(() => {
        const pausar = () => setPaused(true);
        window.addEventListener("keydown", pausar, { once: true });
        window.addEventListener("click", pausar, { once: true });
        window.addEventListener("touchstart", pausar, { once: true });
        return () => {
            window.removeEventListener("keydown", pausar);
            window.removeEventListener("click", pausar);
            window.removeEventListener("touchstart", pausar);
        };
    }, []);

    const handleLogin = () => {
        setPaused(true);
        navigate("/login");
    };

    return (
        <div className="landing">
            <header className="landing__header">
                <div className="landing__brand">
                    <BrandLogo
                        className="landing__logo"
                        alt="UAJS Smart Campus — Universidad Antonio José de Sucre"
                    />
                    <div className="landing__brand-copy">
                        <span className="landing__eyebrow">Proyecto Integrador</span>
                        <strong>UAJS Smart Campus</strong>
                    </div>
                </div>

                <div className="landing__header-tools">
                    <FontSizeToggle />
                </div>
            </header>

            <section className="landing__hero">
                <span className="landing__badge">Campus inteligente • gestión universitaria</span>

                <h2 className="landing__title">
                    Plataforma institucional para conectar servicios, comunidad y operaciones del campus.
                </h2>

                <p className="landing__subtitle">
                    Smart Campus UNIAJS centraliza solicitudes, reservas, recursos,
                    eventos, notificaciones y atención al estudiante en una sola experiencia digital.
                </p>

                <div className="landing__actions">
                    <button
                        type="button"
                        className="landing__primary"
                        onClick={handleLogin}
                    >
                        Iniciar sesión
                    </button>
                </div>

                <p className="landing__countdown">
                    {paused
                        ? "Redirección automática cancelada — usa el botón para continuar."
                        : <>Redirección automática al panel en{" "}
                            <strong>{seconds}</strong> segundos…</>}
                </p>
            </section>

            <section className="landing__section">
                <h3 className="landing__section-title">Nuestros servicios</h3>

                <div className="landing__grid landing__grid--services">
                    {services.map((service) => (
                        <ServiceCard service={service} key={service.name} />
                    ))}
                </div>
            </section>

            <section className="landing__section">
                <h3 className="landing__section-title">Perfiles de usuario</h3>

                <div className="landing__grid">
                    {profiles.map((profile) => (
                        <article className="landing__card landing__card--profile" key={profile.name}>
                            <span className="landing__card-icon">
                                <Icon name={profile.icon} size={32} />
                            </span>
                            <h4 className="landing__card-title">{profile.name}</h4>
                            <p className="landing__card-text">{profile.description}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="landing__section landing__section--about">
                <h3 className="landing__section-title">Sobre nosotros</h3>

                <div className="landing__about-grid">
                    <article className="landing__about-card">
                        <header className="landing__about-header">
                            <Icon name="info" size={18} />
                            <h4>Misión</h4>
                        </header>
                        <p>{SOBRE_NOSOTROS.mision}</p>
                    </article>

                    <article className="landing__about-card">
                        <header className="landing__about-header">
                            <Icon name="eventos" size={18} />
                            <h4>Visión</h4>
                        </header>
                        <p>{SOBRE_NOSOTROS.vision}</p>
                    </article>
                </div>
            </section>

            <section className="landing__section landing__section--contact">
                <h3 className="landing__section-title">Contáctanos</h3>

                <div className="landing__contact-grid">
                    <a
                        className="landing__contact-card"
                        href={`tel:${INSTITUCIONAL.telefono.replace(/\s/g, "")}`}
                    >
                        <span className="landing__contact-icon">
                            <Icon name="solicitudes" size={20} />
                        </span>
                        <div>
                            <strong>Teléfono fijo</strong>
                            <span>{INSTITUCIONAL.telefono}</span>
                        </div>
                    </a>

                    <a
                        className="landing__contact-card landing__contact-card--accent"
                        href={INSTITUCIONAL.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className="landing__contact-icon">
                            <Icon name="notificaciones" size={20} />
                        </span>
                        <div>
                            <strong>WhatsApp</strong>
                            <span>{INSTITUCIONAL.whatsapp}</span>
                        </div>
                    </a>

                    <div className="landing__contact-card">
                        <span className="landing__contact-icon">
                            <Icon name="recursos" size={20} />
                        </span>
                        <div>
                            <strong>Dirección</strong>
                            <span>{INSTITUCIONAL.direccion}</span>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="landing__footer">
                <div className="landing__footer-grid">
                    <div>
                        <h5 className="landing__footer-title">Institucional</h5>
                        <p className="landing__footer-name">
                            Corporación Universitaria Antonio José de Sucre
                        </p>
                        <p className="landing__footer-text">
                            Plataforma Smart Campus para la gestión integral de servicios,
                            comunidad y operaciones del campus universitario.
                        </p>
                    </div>

                    <div>
                        <h5 className="landing__footer-title">Contacto</h5>
                        <ul className="landing__footer-list">
                            <li><strong>Tel:</strong> {INSTITUCIONAL.telefono}</li>
                            <li>
                                <strong>WhatsApp:</strong>{" "}
                                <a href={INSTITUCIONAL.whatsappLink} target="_blank" rel="noopener noreferrer">
                                    {INSTITUCIONAL.whatsapp}
                                </a>
                            </li>
                            <li><strong>Email:</strong> {INSTITUCIONAL.email}</li>
                            <li>{INSTITUCIONAL.direccion}</li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="landing__footer-title">Accesos rápidos</h5>
                        <ul className="landing__footer-list">
                            <li><a href="/login">Iniciar sesión</a></li>
                            <li>
                                <a
                                    href="https://www.uniajs.edu.co"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Sitio web institucional
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://campus.uniajs.edu.co"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Campus virtual
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="landing__footer-legal">
                    <p>
                        © 2026 UNIAJS — Universidad Antonio José de Sucre.{" "}
                        <span className="landing__footer-snies">
                            {INSTITUCIONAL.vigencia} · {INSTITUCIONAL.snies}.
                        </span>
                    </p>
                    <p>Vigilada Mineducación.</p>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
