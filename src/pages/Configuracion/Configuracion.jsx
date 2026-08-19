import { useEffect, useState } from "react";
import services from "../../utils/services";
import "./Configuracion.css";

const STORAGE_KEY = "uajs_config";

const configBase = {
    institucion: "Universidad Antonio José de Sucre",
    sede: "Sede Principal",
    horario: "7:00 a.m. – 9:00 p.m.",
    servicios: services.reduce(
        (acc, service) => ({ ...acc, [service.name]: true }),
        {}
    ),
    notificaciones: {
        correo: true,
        push: false,
        alertas: true
    }
};

function Configuracion() {
    const [config, setConfig] = useState(() => {
        try {
            const guardada = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return guardada ? { ...configBase, ...guardada } : configBase;
        } catch {
            return configBase;
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }, [config]);

    const toggleServicio = (nombre) => {
        setConfig((prev) => ({
            ...prev,
            servicios: {
                ...prev.servicios,
                [nombre]: !prev.servicios[nombre]
            }
        }));
    };

    const toggleNotificacion = (clave) => {
        setConfig((prev) => ({
            ...prev,
            notificaciones: {
                ...prev.notificaciones,
                [clave]: !prev.notificaciones[clave]
            }
        }));
    };

    return (
        <div className="configuracion">
            <header className="configuracion__header">
                <h1 className="configuracion__title">Configuración</h1>
                <p className="configuracion__subtitle">
                    Ajustes generales del sistema y de la plataforma.
                </p>
            </header>

            <section className="configuracion__card">
                <h2 className="configuracion__card-title">Información general</h2>

                <div className="configuracion__grid">
                    <div className="configuracion__field">
                        <span className="configuracion__label">Institución</span>
                        <span className="configuracion__value">
                            {config.institucion}
                        </span>
                    </div>

                    <div className="configuracion__field">
                        <span className="configuracion__label">Sede</span>
                        <span className="configuracion__value">{config.sede}</span>
                    </div>

                    <div className="configuracion__field">
                        <span className="configuracion__label">Horario de atención</span>
                        <span className="configuracion__value">{config.horario}</span>
                    </div>
                </div>
            </section>

            <section className="configuracion__card">
                <h2 className="configuracion__card-title">
                    Servicios disponibles
                </h2>

                <div className="configuracion__list">
                    {services.map((service) => (
                        <div
                            className="configuracion__toggle"
                            key={service.name}
                        >
                            <span className="configuracion__toggle-text">
                                {service.icon} {service.name}
                            </span>

                            <button
                                className={
                                    config.servicios[service.name]
                                        ? "configuracion__switch configuracion__switch--on"
                                        : "configuracion__switch"
                                }
                                onClick={() => toggleServicio(service.name)}
                                aria-label={`Alternar servicio ${service.name}`}
                            >
                                <span className="configuracion__switch-knob" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="configuracion__card">
                <h2 className="configuracion__card-title">
                    Preferencias de notificaciones
                </h2>

                <div className="configuracion__list">
                    {Object.entries(config.notificaciones).map(
                        ([clave, valor]) => (
                            <div
                                className="configuracion__toggle"
                                key={clave}
                            >
                                <span className="configuracion__toggle-text">
                                    {clave.charAt(0).toUpperCase() + clave.slice(1)}
                                </span>

                                <button
                                    className={
                                        valor
                                            ? "configuracion__switch configuracion__switch--on"
                                            : "configuracion__switch"
                                    }
                                    onClick={() => toggleNotificacion(clave)}
                                    aria-label={`Alternar notificación ${clave}`}
                                >
                                    <span className="configuracion__switch-knob" />
                                </button>
                            </div>
                        )
                    )}
                </div>
            </section>
        </div>
    );
}

export default Configuracion;