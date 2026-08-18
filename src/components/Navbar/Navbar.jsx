import "./Navbar.css";

function Navbar({ onToggle }) {
    return (
        <header className="navbar">
            <div className="navbar__left">
                <button className="navbar__menu" onClick={onToggle}>
                    ☰
                </button>

                <h1 className="navbar__title">
                    UAJS Smart Campus
                </h1>
            </div>

            <div className="navbar__right">

                <button className="navbar__notification">
                    🔔
                </button>

                <div className="navbar__profile">
                    <div className="navbar__avatar">
                        N
                    </div>

                    <div className="navbar__user">
                        <span className="navbar__name">
                            Natalia
                        </span>

                        <span className="navbar__role">
                            Administrador
                        </span>
                    </div>

                    <button className="navbar__dropdown">
                        ▾
                    </button>
                </div>

            </div>
        </header>
    );
}

export default Navbar;