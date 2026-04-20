import React, { useEffect, useState } from "react";
import axios from "axios";
import AppShell from "./AppShell";
import AppModal from "./AppModal";

export default function Autores() {
  const [autores, setAutores] = useState([]);
  const [profesiones, setProfesiones] = useState([]);
  const [form, setForm] = useState({
    documento: "",
    nombres: "",
    apellidos: "",
    profesion: "",
    pais: "",
    ciudad: "",
  });

  const [modo, setModo] = useState("agregar");
  const token = localStorage.getItem("token");
  const [errores, setErrores] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });

  const showModal = (title, message, type = "info") => {
    setModal({ isOpen: true, title, message, type });
  };

  const cargarAutores = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://127.0.0.1:8000/api/autores/", {
        headers: { Authorization: `Token ${token}` },
      });
      setAutores(res.data);
    } catch (err) {
      console.error("Error al cargar autores:", err);
      setAutores([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarProfesiones = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/profesiones/", {
        headers: { Authorization: `Token ${token}` },
      });
      setProfesiones(res.data);
    } catch (err) {
      console.error("Error cargando profesiones:", err);
      setProfesiones([]);
    }
  };

  useEffect(() => {
    cargarAutores();
    cargarProfesiones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const guardarAutor = async () => {
    try {
      if (modo === "agregar") {
        await axios.post("http://127.0.0.1:8000/api/autores/", form, {
          headers: { Authorization: `Token ${token}` },
        });
      } else {
        await axios.put(`http://127.0.0.1:8000/api/autores/${form.documento}/`, form, {
          headers: { Authorization: `Token ${token}` },
        });
      }

      await cargarAutores();
      limpiarFormulario();
      setModo("agregar");
      showModal("Éxito", modo === "agregar" ? "Autor agregado" : "Autor actualizado", "success");
    } catch (err) {
      console.error(err);
      showModal("Error", "Error en la operacion", "error");
    }
  };

  const eliminarAutor = async () => {
    if (!form.documento) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/autores/${form.documento}/`, {
        headers: { Authorization: `Token ${token}` },
      });

      setShowDeleteModal(false);
      await cargarAutores();
      limpiarFormulario();
      setModo("agregar");
      showModal("Eliminado", "Autor eliminado", "success");
    } catch (err) {
      console.error(err);
      showModal("Error", "Error al eliminar", "error");
    }
  };

  const validarCampo = (name, value) => {
    let msg = "";

    if (!value || !value.toString().trim()) {
      msg = "Este campo es obligatorio";
    } else if (name === "documento" && !/^\d+$/.test(value)) {
      msg = "Solo numeros";
    } else if ((name === "nombres" || name === "apellidos") && value.length < 2) {
      msg = "Minimo 2 caracteres";
    }

    setErrores((prev) => ({ ...prev, [name]: msg }));
    return msg === "";
  };

  const validarFormulario = () => {
    let ok = true;
    Object.keys(form).forEach((campo) => {
      if (!validarCampo(campo, form[campo])) ok = false;
    });
    return ok;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validarCampo(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validarFormulario()) {
      showModal("Atención", "Corrige los errores antes de enviar", "error");
      return;
    }
    guardarAutor();
  };

  const seleccionarAutor = (autor) => {
    setForm(autor);
    setModo("editar");
    setErrores({});
  };

  const limpiarFormulario = () => {
    setForm({
      documento: "",
      nombres: "",
      apellidos: "",
      profesion: "",
      pais: "",
      ciudad: "",
    });
    setErrores({});
  };

  return (
    <AppShell
      eyebrow="Modulo estandarizado"
      title="Gestion de autores"
      subtitle="Este formulario tambien hereda el formato del menu principal para mantener una sola experiencia visual."
    >
      <section className="app-surface">
        <form onSubmit={handleSubmit} className="app-form-grid" autoComplete="off">
          <div className="app-field">
            <label>Documento</label>
            <input name="documento" value={form.documento} onChange={handleChange} disabled={modo === "editar"} className="app-input" placeholder="Solo numeros" />
            {errores.documento && <span className="wizard-note">{errores.documento}</span>}
          </div>
          <div className="app-field">
            <label>Nombres</label>
            <input name="nombres" value={form.nombres} onChange={handleChange} className="app-input" />
            {errores.nombres && <span className="wizard-note">{errores.nombres}</span>}
          </div>
          <div className="app-field">
            <label>Apellidos</label>
            <input name="apellidos" value={form.apellidos} onChange={handleChange} className="app-input" />
            {errores.apellidos && <span className="wizard-note">{errores.apellidos}</span>}
          </div>
          <div className="app-field">
            <label>Profesion</label>
            <select name="profesion" value={form.profesion} onChange={handleChange} className="app-select">
              <option value="">Seleccione profesion</option>
              {profesiones.map((p) => (
                <option key={p.id} value={p.nombre}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div className="app-field">
            <label>Pais</label>
            <input autoComplete="off" name="pais" value={form.pais} onChange={handleChange} className="app-input" />
          </div>
          <div className="app-field">
            <label>Ciudad</label>
            <input autoComplete="off" name="ciudad" value={form.ciudad} onChange={handleChange} className="app-input" />
          </div>
          <div className="app-actions">
            <button className="app-button app-button--secondary" type="button" onClick={() => { limpiarFormulario(); setModo("agregar"); }}>
              Limpiar
            </button>
            <button className="app-button app-button--danger" type="button" onClick={() => setShowDeleteModal(true)} disabled={!form.documento}>
              Eliminar
            </button>
            <button className="app-button app-button--primary" type="submit">
              {modo === "agregar" ? "Agregar" : "Actualizar"}
            </button>
          </div>
        </form>
      </section>

      <section className="app-surface">
        <div className="app-section-title">
          <h2>Lista de autores</h2>
        </div>

        {loading ? (
          <div className="app-message app-message--info">Cargando...</div>
        ) : (
          <div className="app-table-wrap">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Profesion</th>
                  <th>Pais</th>
                  <th>Ciudad</th>
                </tr>
              </thead>
              <tbody>
                {autores.map((a) => (
                  <tr key={a.documento} onClick={() => seleccionarAutor(a)} style={{ cursor: "pointer" }}>
                    <td>{a.documento}</td>
                    <td>{a.nombres}</td>
                    <td>{a.apellidos}</td>
                    <td>{a.profesion}</td>
                    <td>{a.pais}</td>
                    <td>{a.ciudad}</td>
                  </tr>
                ))}
                {autores.length === 0 && (
                  <tr>
                    <td colSpan={6}>No hay autores</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showDeleteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.48)", display: "grid", placeItems: "center", padding: "18px", zIndex: 9998 }}>
          <div className="app-surface" style={{ width: "min(420px, 100%)" }}>
            <h3>Confirmar eliminacion</h3>
            <p>Eliminar al autor <strong>{form.nombres} {form.apellidos}</strong>?</p>
            <div className="app-actions">
              <button className="app-button app-button--secondary" type="button" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </button>
              <button className="app-button app-button--danger" type="button" onClick={eliminarAutor}>
                Si, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <AppModal 
        isOpen={modal.isOpen} 
        title={modal.title} 
        message={modal.message} 
        type={modal.type} 
        onClose={() => setModal({ ...modal, isOpen: false })} 
      />
    </AppShell>
  );
}
