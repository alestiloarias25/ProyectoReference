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

  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });

  const showModal = (title, message, type = "info") => {
    setModal({ isOpen: true, title, message, type });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    axios
      .post("http://127.0.0.1:8000/api/auth/login/", form)
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", res.data.user);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("role_label", res.data.role_label);
        navigate("/referencias");
      })
      .catch(() => {
        showModal("Acceso denegado", "Credenciales incorrectas.", "error");
      });
  };

  return (
    <AuthShell
      eyebrow="Acceso principal"
      title="Iniciar sesion"
      subtitle="Ingresa con el mismo estilo de formularios, botones y colores del menu principal."
      footerLinks={[
        { to: "/register", label: "Crear cuenta" },
        { to: "/forgot", label: "Olvide mi contrasena" },
      ]}
    >
      <form onSubmit={handleLogin} autoComplete="off">
        <div className="app-field">
          <label htmlFor="login-username">No. de Documento</label>
          <input
            id="login-username"
            type="text"
            name="no_documento"
            placeholder="No. de Documento"
            value={form.no_documento}
            onChange={handleChange}
            className="app-input"
          />
        </div>

        <div className="app-field">
          <label htmlFor="login-password">Contrasena</label>
          <input
            id="login-password"
            type="password"
            name="password"
            placeholder="Contrasena"
            value={form.password}
            onChange={handleChange}
            className="app-input"
          />
        </div>

        <button type="submit" className="app-button app-button--primary">
          Iniciar sesión
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

export default Login;
