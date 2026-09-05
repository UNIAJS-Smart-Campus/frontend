import Modal from "../Modal/Modal";
import "./ConfirmModal.css";

function ConfirmModal({
    isOpen,
    title = "¿Confirmar acción?",
    message = "¿Estás seguro de que quieres continuar?",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "danger",
    onConfirm,
    onClose
}) {
    return (
        <Modal
            isOpen={isOpen}
            title={title}
            onClose={onClose}
        >
            <div className="confirm-modal">
                <p className="confirm-modal__message">{message}</p>
                <div className="confirm-modal__actions">
                    <button
                        type="button"
                        className="button button--ghost button--md"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={
                            variant === "danger"
                                ? "button button--danger button--md"
                                : "button button--accent button--md"
                        }
                        onClick={() => {
                            onConfirm?.();
                            onClose?.();
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmModal;
