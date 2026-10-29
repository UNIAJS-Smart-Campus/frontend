import { useState } from "react";
import Icon from "../../components/Icon/Icon";
import useColeccion from "../../hooks/useColeccion";
import {
    CLAVE_COLECCION,
    obtenerNotificaciones,
    marcarLeida,
    marcarTodasLeidas
} from "../../utils/notificaciones";
import "./Notificaciones.css";

const TIPOS = ["Todas", "Solicitud", "Reserva", "Evento", "PQRS"];

function Notificaciones() {
    const { items: remotas, enLinea } = useColeccion(CLAVE_COLECCION);
    const [filtro, setFiltro] = useState("Todas");
    const [errorAviso, setErrorAviso] = useState("");
    const [enviando, setEnviando] = useState(false);

    // La API ya devuelve solo las notificaciones del usuario en sesión, así
    // que no hace falta filtrar por perfil. Mientras el backend no responde
    // se pintan los datos precargados para no dejar la vista vacía.
    const items = remotas.length > 0 || enLinea ? remotas : obtenerNotificaciones();

    const noLeidas = items.filter((item) => !item.leida).length;

    const filtradas =
        filtro === "Todas"
            ? items
            : items.filter((item) => item.tipo === filtro);

    const conteoTipo = (tipo) =>
        tipo === "Todas" ? items.length : items.filter((i) => i.tipo === tipo).length;

    const mostrarError = (texto) => {
        setErrorAviso(texto);
        setTimeout(() => setErrorAviso(""), 4000);
    };

    const manejarMarcarLeida = async (item) => {
        try {
            await marcarLeida(item);
        } catch (error) {
            mostrarError(error.message || "No se pudo marcar la notificación como leída.");
        }
    };

    const manejarTodasLeidas = async () => {
        setEnviando(true);
        try {
            await marcarTodasLeidas();
        } catch (error) {
            mostrarError(error.message || "No se pudieron marcar las notificaciones como leídas.");
        } finally {
            setEnviando(false);
        }
    };

    const nuevaNoLeida = (item) => {
        if (!item.fecha) return "";
        const fecha = new Date(String(item.fecha).slice(0, 10) + "T00:00:00");
        if (isNaN(fecha)) return "";
        const dias = Math.floor((new Date() - fecha) / 86400000);
        if (dias <= 0) return "Hoy";
        if (dias === 1) return "Ayer";
        return `Hace ${dias} días`;
    };

    return (
        <div className="page">
            <div className="page__header">
                <div className="page__title">
                    <p>Revisa los avisos de solicitudes, reservas y eventos.</p>
                </div>

                <button
                    className="button button--outline button--md"
                    onClick={manejarTodasLeidas}
                    disabled={noLeidas === 0 || enviando}
                >
                    <Icon name="notificaciones" size={14} />
                    Marcar todas como leídas
                </button>
            </div>

            {errorAviso && (
                <div className="toast toast--error">
                    <Icon name="info" size={14} />
                    {errorAviso}
                </div>
            )}

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
                                        onClick={() => manejarMarcarLeida(item)}
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
