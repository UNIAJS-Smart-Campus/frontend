import "./Modal.css";

function Modal({ isOpen, title, onClose, children }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal" onClick={onClose}>
            <div
                className="modal__content"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal__header">
                    <h3 className="modal__title">{title}</h3>

                    <button className="modal__close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="modal__body">{children}</div>
            </div>
        </div>
    );
}

export default Modal;