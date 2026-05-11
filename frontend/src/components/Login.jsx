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
      .post(`${process.env.REACT_APP_API_URL || ""}/api/auth/login/`, form)
      .then(async (res) => {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", res.data.user);
        localStorage.setItem("full_name", res.data.name);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("role_label", res.data.role_label);
        localStorage.removeItem("aviso_habeas_data");

        if (res.data.role === "ARRENDADOR") {
          try {
            await axios.get(`${process.env.REACT_APP_API_URL || ""}/api/persona/${res.data.user}/`, {
              headers: { Authorization: `Token ${res.data.token}` }
            });
            navigate("/referencias");
          } catch (error) {
            if (error.response && error.response.status === 404) {
              navigate("/personas/crear");
            } else {
              navigate("/referencias");
            }
          }
        } else {
          navigate("/referencias");
        }
      })
      .catch(() => {
        showModal("Acceso denegado", "Credenciales incorrectas.", "error");
      });
  };

  return (
    <AuthShell
      eyebrow="Acceso principal"
      title="Inicia sesión"
      subtitle="Si eres Arrendador administra tus Bienes Inmuebles y reporta novedades y si eres Arrendatario consulta tu puntaje"
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


