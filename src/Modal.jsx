import React from "react";

export default function Modal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Cancelar",
  type = "info",
}) {
  if (!open) return null;

  // Para modais de warning/danger com cancelText, inverter as cores dos botões
  const isWarningWithCancel = (type === "warning" || type === "danger") && cancelText && onCancel;

  // Determinar classe do botão de confirmação
  const confirmClass = isWarningWithCancel ? "modal-danger" : "modal-confirm";

  return (
    <div className="modal-overlay">
      <div className={`modal-box modal-${type}`}>
        {title && <h2 className="modal-title">{title}</h2>}
        <div className="modal-message">{message}</div>
        <div className="modal-actions">
          {onCancel && cancelText && (
            <button className="modal-btn modal-confirm" onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button className={`modal-btn ${confirmClass}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
