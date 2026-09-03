import { useState } from "react";
import Icon from "../../components/Icon/Icon";
import useAuth from "../../context/useAuth";
import { obtenerNotificacionesPorPerfil, guardarNotificaciones } from "../../utils/notificaciones";
import "./Notificaciones.css";

const TIPOS = ["Todas", "Solicitud", "Reserva", "Evento", "PQRS"];

function Notificaciones() {
    const { user } = useAuth();
    const [items, setItems] = useState(() => obtenerNotificacionesPorPerfil(user?.rol));
    const [filtro, setFiltro] = useState("Todas");

    const noLeidas = items.filter((item) => !item.leida).length;

    const filtradas =
        filtro === "Todas"
            ? items
            : items.filter((item) => item.tipo === filtro);

    const conteoTipo = (tipo) =>
        tipo === "Todas" ? items.length : items.filter((i) => i.tipo === tipo).length;

    const marcarLeida = (id) => {
        setItems((prev) => {
            const nueva = prev.map((item) => (item.id === id ? { ...item, leida: true } : item));
            guardarNotificaciones(nueva);
            return nueva;
        });
    };

    const marcarTodasLeidas = () => {
        setItems((prev) => {
            const nueva = prev.map((item) => ({ ...item, leida: true }));
            guardarNotificaciones(nueva);
            return nueva;
        });
    };

    const nuevaNoLeida = (item) => {
        try {
            const dias = Math.floor(
                (new Date() - new Date(item.fecha + "T00:00:00")) / 86400000
            );
            if (dias <= 0) return "Hoy";
            if (dias === 1) return "Ayer";
            return `Hace ${dias} días`;
        } catch {
            return "";
        }
    };

    return (
        <div className="page">
            <div className="page__header">
                <div className="page__title">
                    <p>Revisa los avisos de solicitudes, reservas y eventos.</p>
                </div>

                <button
                    className="button button--outline button--md"
                    onClick={marcarTodasLeidas}
                    disabled={noLeidas === 0}
                >
                    <Icon name="notificaciones" size={14} />
                    Marcar todas como leídas
                </button>
            </div>

            <div className="summary">
                {TIPOS.map((tipo) => (
                    <button
                        key={tipo}
                        className={
                            filtro === tipo
                                ? "summary__card summary__card--active"
                                : "summary__card"
                        }
                        onClick={() => setFiltro(tipo)}
                    >
                        <div className="summary__number">
                            {conteoTipo(tipo)}
                        </div>
                        <div className="summary__label">{tipo}</div>
                    </button>
                ))}
            </div>

            <div className="list-header">
                <h2>Bandeja de notificaciones</h2>
                <span className="list-header__meta">
                    {noLeidas} sin leer · {items.length} en total
                </span>
            </div>

            {filtradas.length === 0 ? (
                <div className="empty">
                    No hay notificaciones {filtro !== "Todas" ? `de tipo ${filtro}` : "disponibles"}.
                </div>
            ) : (
                <div className="notifs__list">
                    {filtradas.map((item) => (
                        <article
                            key={item.id}
                            className={
                                item.leida
                                    ? "notifs__item"
                                    : "notifs__item notifs__item--unread"
                            }
                        >
                            <div
                                className={`notifs__item-icon notifs__item-icon--${item.icono}`}
                            >
                                <Icon name={item.icono} size={19} />
                            </div>

                            <div className="notifs__item-body">
                                <div className="notifs__item-meta">
                                    <span className="notifs__item-tag">
                                        {item.tipo}
                                    </span>
                                    <span className="notifs__item-time">
                                        {nuevaNoLeida(item)}
                                    </span>
                                </div>
                                <p className="notifs__item-message">
                                    {item.mensaje}
                                </p>
                            </div>

                            <div className="notifs__item-side">
                                {!item.leida ? (
                                    <span className="notifs__dot" />
                                ) : null}
                                {!item.leida ? (
                                    <button
                                        className="notifs__read-button"
                                        onClick={() => marcarLeida(item.id)}
                                    >
                                        Marcar leída
                                    </button>
                                ) : (
                                    <span className="notifs__read-label">
                                        Leída
                                    </span>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Notificaciones;
