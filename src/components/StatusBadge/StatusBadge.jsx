import "./StatusBadge.css";

function StatusBadge({ estado }) {
    const modifier = estado
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-");

    return (
        <span className={`status-badge status-badge--${modifier}`}>
            {estado}
        </span>
    );
}

export default StatusBadge;