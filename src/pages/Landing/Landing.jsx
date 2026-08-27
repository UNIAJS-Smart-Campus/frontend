import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import Icon from "../../components/Icon/Icon";
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

function Landing() {
    const [seconds, setSeconds] = useState(REDIRECT_SECONDS);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (seconds <= 0) {
            navigate(user ? "/dashboard" : "/login");
        }
    }, [seconds, navigate, user]);

    const handleEnter = () => {
        navigate(user ? "/dashboard" : "/login");
    };

    return (
        <div className="landing">
            <header className="landing__header">
                <div className="landing__brand">
                    <span className="landing__logo">U</span>
                    <h1 className="landing__name">UniAJS</h1>
                </div>
            </header>

            <section className="landing__hero">
                <h2 className="landing__title">
                    Bienvenido a la plataforma de servicios universitarios
                </h2>

                <p className="landing__subtitle">
                    Gestiona solicitudes, reservas, recursos, eventos y más, en
                    un solo lugar para toda la comunidad académica.
                </p>

                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleEnter}
                >
                    Entrar ahora
                </Button>

                <p className="landing__countdown">
                    Acceso automático al panel en{" "}
                    <strong>{seconds}</strong> segundos…
                </p>
            </section>

            <section className="landing__section">
                <h3 className="landing__section-title">Nuestros servicios</h3>

                <div className="landing__grid">
                    {services.map((service) => (
                        <article className="landing__card" key={service.name}>
                            <span className="landing__card-icon">
                                <Icon name={service.icon} size={32} />
                            </span>
                            <h4 className="landing__card-title">{service.name}</h4>
                            <p className="landing__card-text">{service.description}</p>
                        </article>
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

            <footer className="landing__footer">
                <p>Universidad Antonio José de Sucre © 2026 — UniAJS</p>
            </footer>
        </div>
    );
}

export default Landing;
