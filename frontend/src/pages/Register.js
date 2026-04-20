import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import AppModal from "../components/AppModal";

export default function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    tipo_documento: "CC",
    no_documento: "",
    first_name: "",
    last_name: "",
    email: "",
    celular: "",
    role: "ARRENDATARIO",
    password: "",
  });

  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });

  const showModal = (title, message, type = "info") => {
    setModal({ isOpen: true, title, message, type });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Forzar mayúsculas excepto en email y password
    const isSensitive = name === "email" || name === "password";
    setForm({ ...form, [name]: isSensitive ? value : value.toUpperCase() });
  };

  const checkDocument = async () => {
    if (!form.no_documento) return showModal("Atención", "Ingresa tu número de documento", "error");
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/auth/check-document/?no_documento=${form.no_documento}`);
      const data = await response.json();
      if (data.exists) {
        showModal("Registro duplicado", "El número de documento ya está registrado. Por favor inicia sesión.", "error");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setStep(2);
      }
    } catch (err) {
      showModal("Error", "Error al verificar el documento", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        showModal("Éxito", "Usuario creado con éxito", "success");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        showModal("Error", data.error || "No se pudo crear el usuario", "error");
      }
    } catch (err) {
      showModal("Error", "Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow={`Registro - Paso ${step} de 4`}
      title="Crear usuario"
      subtitle="Sigue los pasos para configurar tu cuenta."
      footerLinks={[
        { to: "/login", label: "Volver a iniciar sesion" },
        { to: "/forgot", label: "Recuperar contrasena" },
      ]}
    >
      {step === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); checkDocument(); }} autoComplete="off">
          <div className="app-field">
            <label htmlFor="register-tipo">Tipo de Documento</label>
            <select
              id="register-tipo"
              name="tipo_documento"
              value={form.tipo_documento}
              onChange={handleChange}
              className="app-select"
            >
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="NT">NIT</option>
              <option value="PA">Pasaporte</option>
              <option value="PR">Permiso Temporal de Residencia</option>
            </select>
          </div>

          <div className="app-field">
            <label htmlFor="register-username">No. de Documento</label>
            <input
              id="register-username"
              type="text"
              name="no_documento"
              placeholder="Ej: 10203040"
              value={form.no_documento}
              onChange={handleChange}
              required
              className="app-input"
            />
          </div>

          <button type="submit" disabled={loading} className="app-button app-button--primary">
            {loading ? "Verificando..." : "Continuar"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} autoComplete="off">
          <div className="app-field">
            <label htmlFor="first_name">Primer Nombre</label>
            <input
              id="first_name"
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
              className="app-input"
            />
          </div>
          <div className="app-field">
            <label htmlFor="last_name">Apellidos</label>
            <input
              id="last_name"
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
              className="app-input"
            />
          </div>
          <div className="app-field">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="app-input"
            />
          </div>
          <div className="app-field">
            <label htmlFor="celular">Celular</label>
            <input
              id="celular"
              type="text"
              name="celular"
              value={form.celular}
              onChange={handleChange}
              required
              className="app-input"
            />
          </div>
          <div className="app-field">
            <label htmlFor="register-role">Rol</label>
            <select
              id="register-role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="app-select"
            >
              <option value="ADMINISTRADOR">Usuario Administrador</option>
              <option value="ARRENDADOR">Usuario Arrendador</option>
              <option value="ARRENDATARIO">Usuario Arrendatario</option>
            </select>
          </div>
          <div className="app-actions">
            <button type="button" onClick={() => setStep(1)} className="app-button app-button--secondary">
              Atrás
            </button>
            <button type="submit" className="app-button app-button--primary">
              Crear Contraseña
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div>
          <div className="app-surface" style={{ marginBottom: '20px', padding: '15px' }}>
            <h3 style={{ marginTop: 0 }}>Verifica tus datos</h3>
            <p><strong>Documento:</strong> {form.tipo_documento} - {form.no_documento}</p>
            <p><strong>Nombres:</strong> {form.first_name} {form.last_name}</p>
            <p><strong>Correo:</strong> {form.email}</p>
            <p><strong>Celular:</strong> {form.celular}</p>
            <p><strong>Rol:</strong> {form.role}</p>
          </div>
          <div className="app-actions">
            <button type="button" onClick={() => setStep(2)} className="app-button app-button--secondary">
              Cambiar
            </button>
            <button type="button" onClick={() => setStep(4)} className="app-button app-button--primary">
              Confirmar
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} autoComplete="off">
          <div className="app-field">
            <label htmlFor="register-password">Contraseña</label>
            <input
              id="register-password"
              type="password"
              name="password"
              placeholder="Ingresa tu contraseña secreta"
              value={form.password}
              onChange={handleChange}
              required
              className="app-input"
            />
          </div>
          <div className="app-actions">
            <button type="button" onClick={() => setStep(3)} className="app-button app-button--secondary">
              Atrás
            </button>
            <button type="submit" disabled={loading} className="app-button app-button--primary">
              {loading ? "Creando usuario..." : "Finalizar Registro"}
            </button>
          </div>
        </form>
      )}

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
