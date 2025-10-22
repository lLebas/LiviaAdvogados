import React from "react";

export default function Modal({ open, title, message, onConfirm, onCancel, confirmText = "OK", cancelText = "Cancelar", type = "info" }) {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className={`modal-box modal-${type}`}>  
        {title && <h2 className="modal-title">{title}</h2>}
        <div className="modal-message">{message}</div>
        <div className="modal-actions">
          {onCancel && (
            <button className="modal-btn modal-cancel" onClick={onCancel}>{cancelText}</button>
          )}
          <button className="modal-btn modal-confirm" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
