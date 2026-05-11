import React, { useState } from "react";
import AuthShell from "../components/AuthShell";
import AppModal from "../components/AppModal";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });

  const showModal = (title, message, type = "info") => {
    setModal({ isOpen: true, title, message, type });
  };

  const handleForgot = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/auth/forgot/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        showModal("Enlace enviado", "Si el correo existe, se envio un enlace de recuperacion", "success");
      } else {
        showModal("Error", data.error || "Error al procesar la solicitud", "error");
      }
    } catch (err) {
      showModal("Error", "Error de conexión", "error");
    }
  };

  return (
    <AuthShell
      eyebrow="Recuperacion"
      title="Recuperar contrasena"
      subtitle="La recuperacion tambien usa el mismo formato unificado de campos y botones."
      footerLinks={[
        { to: "/login", label: "Volver a iniciar sesion" },
        { to: "/register", label: "Crear una cuenta" },
      ]}
    >
      <form onSubmit={handleForgot} autoComplete="off">
        <div className="app-field">
          <label htmlFor="forgot-email">Correo</label>
          <input
            id="forgot-email"
            type="email"
            placeholder="Ingresa tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="app-input"
            required
          />
        </div>

        <button type="submit" className="app-button app-button--primary">
          Enviar enlace
        </button>
      </form>

      <AppModal 
        isOpen={modal.isOpen} 
        title={modal.title} 
        message={modal.message} 
        type={modal.type} 
        onClose={() => setModal({ ...modal, isOpen: false })} 
      />
    </AuthShell>
  );
}


