import "./Button.css";

function Button({
    children,
    variant = "primary",
    size = "md",
    type = "button",
    onClick,
    disabled = false,
    className = ""
}) {
    const classes = [
        "button",
        `button--${variant}`,
        `button--${size}`,
        className
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type={type}
            className={classes}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export default Button;