import useAuth from "../../context/useAuth";
import "./Perfil.css";

function Perfil() {
    const { user } = useAuth();

    const campos = [
        { label: "Nombre completo", value: user?.nombre },
        { label: "Tipo de usuario", value: user?.rol },
        { label: "Programa / Dependencia", value: user?.programa },
        { label: "Correo institucional", value: user?.correo },
        { label: "Usuario", value: user?.usuario }
    ];

    const inicial = (user?.nombre?.charAt(0) ?? "U").toUpperCase();

    return (
        <div className="perfil">
            <div className="perfil__card">
                <div className="perfil__identity">
                    <div className="perfil__avatar">{inicial}</div>

                    <div className="perfil__identity-info">
                        <h2 className="perfil__name">{user?.nombre}</h2>
                        <span className="perfil__role">{user?.rol}</span>
                    </div>
                </div>

                <div className="perfil__grid">
                    {campos.map((campo) => (
                        <div className="perfil__field" key={campo.label}>
                            <span className="perfil__label">{campo.label}</span>
                            <span className="perfil__value">{campo.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Perfil;
