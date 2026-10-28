import { useState } from "react";
import "./Input.css";

const iconoVer = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const iconoOcultar = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

function Input({
    type = "text",
    placeholder,
    value,
    onChange,
    name,
    label,
    id,
    rows = 4,
    autoComplete,
    ...rest
}) {
    const [visible, setVisible] = useState(false);

    const esPassword = type === "password";
    const typeReal = esPassword && visible ? "text" : type;

    const classes = `input__field${type === "textarea" ? " input__field--textarea" : ""}${esPassword ? " input__field--password" : ""}`;

    return (
        <div className="input">
            {label && (
                <label className="input__label" htmlFor={id}>
                    {label}
                </label>
            )}

            {type === "textarea" ? (
                <textarea
                    id={id}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    rows={rows}
                    className={classes}
                    {...rest}
                />
            ) : (
                <div className="input__wrap">
                    <input
                        id={id}
                        type={typeReal}
                        name={name}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        autoComplete={autoComplete}
                        className={classes}
                        {...rest}
                    />

                    {esPassword && (
                        <button
                            type="button"
                            className="input__toggle"
                            aria-label={
                                visible
                                    ? "Ocultar contraseña"
                                    : "Mostrar contraseña"
                            }
                            title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                            onClick={() => setVisible((prev) => !prev)}
                        >
                            {visible ? iconoOcultar : iconoVer}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default Input;