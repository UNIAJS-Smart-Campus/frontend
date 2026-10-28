import useFontSize from "../../hooks/useFontSize";
import "./FontSizeToggle.css";

function FontSizeToggle() {
    const { levels, level, setLevel } = useFontSize();

    return (
        <div className="font-size-toggle" role="group" aria-label="Tamaño de fuente">
            {levels.map((l) => (
                <button
                    key={l.id}
                    type="button"
                    className={
                        "font-size-toggle__btn" +
                        (l.id === level.id ? " font-size-toggle__btn--active" : "")
                    }
                    aria-pressed={l.id === level.id}
                    aria-label={`Tamaño de fuente ${l.label}`}
                    onClick={() => setLevel(l)}
                >
                    {l.label}
                </button>
            ))}
        </div>
    );
}

export default FontSizeToggle;
