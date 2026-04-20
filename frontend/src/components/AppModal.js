import React from "react";
import "./app-shell.css";

/**
 * Componente unificado para reemplazar window.alert().
 * Props:
 * - isOpen: boolean para mostrar/ocultar
 * - title: Título del modal
 * - message: Mensaje principal
 * - type: "error" | "success" | "info" (afecta el color del borde superior o el botón)
 * - onClose: función que se ejecuta al darle "Aceptar" o cerrar.
 */
export default function AppModal({ isOpen, title, message, type = "info", onClose }) {
  if (!isOpen) return null;

  let buttonClass = "app-button app-button--primary";
  if (type === "error") buttonClass = "app-button app-button--danger";
  if (type === "success") buttonClass = "app-button app-button--primary"; // Podría ser verde

  return (
    <div className="app-modal-overlay">
      <div className={`app-modal app-surface app-modal--${type}`}>
        <div className="app-modal-content">
          <h3 className="app-modal-title">{title}</h3>
          <p className="app-modal-message">{message}</p>
          <div className="app-actions app-modal-actions">
            <button type="button" className={buttonClass} onClick={onClose} autoFocus>
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
