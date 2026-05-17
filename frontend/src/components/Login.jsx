import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthShell from "./AuthShell";
import AppModal from "./AppModal";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    no_documento: "",
    password: "",
  });

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showModal = (title, message, type = "info") => {
    setModal({ isOpen: true, title, message, type });
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || ""}/api/auth/login/`,
        form
      );

      // =========================
      // STORE SESSION
      // =========================
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", res.data.user);
      localStorage.setItem("full_name", res.data.name);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("role_label", res.data.role_label);
      localStorage.setItem("persona_exists", res.data.persona_exists);
      localStorage.removeItem("aviso_habeas_data");

      // =========================
      // ROUTING
      // =========================
      if (res.data.role === "ARRENDADOR" && !res.data.persona_exists) {
        navigate("/personas/crear");
      } else {
        navigate("/referencias");
      }

    } catch (error) {
      showModal(
        "Acceso denegado",
        "Credenciales incorrectas.",
        "error"
      );
    }
  };

  return (
    <AuthShell
      eyebrow="Acceso principal"
      title="Inicia sesión"
      subtitle="Accede al sistema de referencias"
      footerLinks={[
        { to: "/register", label: "Crear cuenta" },
        { to: "/forgot", label: "Olvidé mi contraseña" },
      ]}
    >
      <form onSubmit={handleLogin} autoComplete="off">
        <div className="app-field">
          <label>No. de Documento</label>
          <input
            type="text"
            name="no_documento"
            placeholder="No. de Documento"
            value={form.no_documento}
            onChange={handleChange}
            className="app-input"
          />
        </div>

        <div className="app-field">
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className="app-input"
          />
        </div>

        <button
          type="submit"
          className="app-button app-button--primary"
        >
          Iniciar sesión
        </button>
      </form>

      <AppModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() =>
          setModal((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
      />
    </AuthShell>
  );
}

export default Login;