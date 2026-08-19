import { useState } from "react";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import useSearch from "../../hooks/useSearch";
import notificaciones from "../../utils/notificaciones";
import "./Notificaciones.css";

function Notificaciones() {
    const [items, setItems] = useState(notificaciones);
    const [query, setQuery] = useState("");

    const noLeidas = items.filter((item) => !item.leida).length;

    const filtradas = useSearch(items, query, ["tipo", "mensaje"]);

    const marcarLeida = (id) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, leida: true } : item
            )
        );
    };

    const marcarTodasLeidas = () => {
        setItems((prev) => prev.map((item) => ({ ...item, leida: true })));
    };

    return (
        <div className="notificaciones">
            <header className="notificaciones__header">
                <h1 className="notificaciones__title">Notificaciones</h1>
                <p className="notificaciones__subtitle">
                    Comunicaciones de la plataforma: cambios de estado,
                    confirmaciones de reserva y nuevos eventos.
                </p>
            </header>

            <div className="notificaciones__search">
                <Input
                    type="search"
                    placeholder="Buscar por tipo o mensaje…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    id="notificaciones-search"
                />
            </div>

            <div className="notificaciones__toolbar">
                <span className="notificaciones__count">
                    {noLeidas} sin leer
                </span>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={marcarTodasLeidas}
                    disabled={noLeidas === 0}
                >
                    Marcar todas como leídas
                </Button>
            </div>

            <div className="notificaciones__list">
                {filtradas.map((item) => (
                    <article
                        className={
                            item.leida
                                ? "notificaciones__item"
                                : "notificaciones__item notificaciones__item--unread"
                        }
                        key={item.id}
                    >
                        <span className="notificaciones__icon">{item.icono}</span>

                        <div className="notificaciones__body">
                            <div className="notificaciones__top">
                                <span className="notificaciones__tipo">
                                    {item.tipo}
                                </span>
                                <span className="notificaciones__fecha">
                                    {item.fecha}
                                </span>
                            </div>

                            <p className="notificaciones__mensaje">
                                {item.mensaje}
                            </p>
                        </div>

                        {!item.leida && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => marcarLeida(item.id)}
                            >
                                Marcar leída
                            </Button>
                        )}
                    </article>
                ))}
            </div>

            {filtradas.length === 0 && (
                <p className="notificaciones__empty">
                    No se encontraron notificaciones para «{query}».
                </p>
            )}
        </div>
    );
}

export default Notificaciones;