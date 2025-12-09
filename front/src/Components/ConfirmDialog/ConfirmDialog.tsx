import "./ConfirmDialog.css";

type Props = {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmDialog({ message, onConfirm, onCancel }: Props) {

    return (
        <div className="confirm-overlay" id="ConfirmDialog" onClick={onCancel}>
            <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
                <p>{message}</p>
                <div className="confirm-buttons">
                    <button className="btn-cancel" onClick={onCancel}>ביטול</button>
                    <button className="btn-confirm" onClick={onConfirm}>אישור</button>
                </div>
            </div>
        </div>
    );
}
