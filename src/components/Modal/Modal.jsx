import { createPortal } from "react-dom";

function Modal({ isOpen, title, subtitle, onClose, children }) {
    if (!isOpen) {
        return null;
    }

    return createPortal(
        <div className="modal" onClick={onClose}>
            <div
                className="modal__content"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal__header">
                    <div>
                        <h3 className="modal__title">{title}</h3>
                        {subtitle && (
                            <p className="modal__subtitle">{subtitle}</p>
                        )}
                    </div>

                    <button className="modal__close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="modal__body">{children}</div>
            </div>
        </div>,
        document.body
    );
}

export default Modal;
