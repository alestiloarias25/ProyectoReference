import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import AppModal from "../components/AppModal";

const AdministrarBienesInmuebles = () => {
  const navigate = useNavigate();
  const [inmuebles, setInmuebles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });
  
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    TBNoMatricula: "",
    TBDireccion: "",
    TCId: "11001", // Default city ID (Bogota)
    TBTipo: "APARTAMENTO",
    TBObs: ""
  });
  
  const fileInputRef = useRef(null);
  const [uploadingInmuebleId, setUploadingInmuebleId] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      showModal("Atención", "No estás logueado", "error");
      navigate("/login");
      return;
    }
    fetchInmuebles();
  }, [token, navigate]);

  const fetchInmuebles = () => {
    setLoading(true);
    axios.get("http://127.0.0.1:8000/api/bienesinmuebles/", {
      headers: { Authorization: `Token ${token}` },
    })
      .then(res => setInmuebles(res.data))
      .catch(err => {
        showModal("Error", "Error al cargar inmuebles", "error");
      })
      .finally(() => setLoading(false));
  };

  const showModal = (title, message, type = "info") => {
    setModal({ isOpen: true, title, message, type });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value.toUpperCase() });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (editingId) {
      axios.put(`http://127.0.0.1:8000/api/bienesinmuebles/${editingId}/`, form, {
        headers: { Authorization: `Token ${token}` }
      }).then(() => {
        showModal("Éxito", "Inmueble actualizado correctamente", "success");
        setEditingId(null);
        resetForm();
        fetchInmuebles();
      }).catch(err => {
        showModal("Error", "Error al actualizar el inmueble", "error");
      }).finally(() => setSubmitting(false));
    } else {
      axios.post("http://127.0.0.1:8000/api/bienesinmuebles/", form, {
        headers: { Authorization: `Token ${token}` }
      }).then(() => {
        showModal("Éxito", "Inmueble creado correctamente", "success");
        resetForm();
        fetchInmuebles();
      }).catch(err => {
        showModal("Error", "Error al crear el inmueble", "error");
      }).finally(() => setSubmitting(false));
    }
  };

  const handleEdit = (inmueble) => {
    setEditingId(inmueble.id);
    setForm({
      TBNoMatricula: inmueble.TBNoMatricula,
      TBDireccion: inmueble.TBDireccion,
      TCId: inmueble.TCId,
      TBTipo: inmueble.TBTipo,
      TBObs: inmueble.TBObs || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este inmueble?")) {
      axios.delete(`http://127.0.0.1:8000/api/bienesinmuebles/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      }).then(() => {
        showModal("Éxito", "Inmueble eliminado correctamente", "success");
        fetchInmuebles();
      }).catch(err => {
        showModal("Error", "Error al eliminar el inmueble", "error");
      });
    }
  };

  const resetForm = () => {
    setForm({
      TBNoMatricula: "",
      TBDireccion: "",
      TCId: "11001",
      TBTipo: "APARTAMENTO",
      TBObs: ""
    });
    setEditingId(null);
  };

  const handleUploadPhotoClick = (inmuebleId) => {
    setUploadingInmuebleId(inmuebleId);
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !uploadingInmuebleId) return;

    const formData = new FormData();
    formData.append('imagen', file);

    axios.post(`http://127.0.0.1:8000/api/bienesinmuebles/${uploadingInmuebleId}/upload_photo/`, formData, {
      headers: { 
        Authorization: `Token ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }).then(() => {
      showModal("Éxito", "Foto subida correctamente", "success");
      fetchInmuebles();
    }).catch(err => {
      showModal("Error", "Error al subir la foto", "error");
    }).finally(() => {
      setUploadingInmuebleId(null);
      e.target.value = null; // reset input
    });
  };

  return (
    <AppShell
      eyebrow="Gestión"
      title="Administrar Bienes Inmuebles"
      subtitle="Crea y administra tus propiedades y sube fotografías para que otros puedan consultarlas."
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleFileChange} 
      />

      <div className="app-content">
        <section className="app-surface">
          <div className="app-section-title">
            <h2>{editingId ? "Modificar Inmueble" : "Registrar Nuevo Inmueble"}</h2>
          </div>
          <form onSubmit={handleSave} className="app-form-grid" autoComplete="off">
            <div className="app-field">
              <label>No. Matrícula</label>
              <input
                type="text"
                name="TBNoMatricula"
                value={form.TBNoMatricula}
                onChange={handleFormChange}
                required
                className="app-input"
              />
            </div>
            <div className="app-field">
              <label>Dirección</label>
              <input
                type="text"
                name="TBDireccion"
                value={form.TBDireccion}
                onChange={handleFormChange}
                required
                pattern="^[a-zA-Z]+\s[0-9a-zA-Z]+\s[0-9a-zA-Z]+\s\d+(?:\s.+)?$"
                title="Debe usar el formato: Vía Número Letra Número Letra Número Complemento. Ej: C 60 18 15 o K 21B 35 28 Ap 201"
                placeholder="Ej. K 21B 35 28 Ap 201"
                className="app-input"
              />
              <small style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>
                Formato: Vía Principal + Número + Número + Número [+ Complemento]. Ej: C 60 18 15
              </small>
            </div>
            <div className="app-field">
              <label>Tipo de Inmueble</label>
              <select
                name="TBTipo"
                value={form.TBTipo}
                onChange={handleFormChange}
                required
                className="app-select"
              >
                <option value="APARTAMENTO">APARTAMENTO</option>
                <option value="CASA">CASA</option>
                <option value="LOCAL">LOCAL</option>
                <option value="OFICINA">OFICINA</option>
              </select>
            </div>
            <div className="app-field" style={{ gridColumn: "1 / -1" }}>
              <label>Observaciones</label>
              <textarea
                name="TBObs"
                value={form.TBObs}
                onChange={handleFormChange}
                rows="3"
                className="app-textarea"
              />
            </div>
            <div className="app-actions" style={{ gridColumn: "1 / -1" }}>
              <button className="app-button app-button--primary" type="submit" disabled={submitting}>
                {editingId ? "Actualizar Inmueble" : "Guardar Inmueble"}
              </button>
              {editingId && (
                <button className="app-button app-button--secondary" type="button" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="app-surface">
          <div className="app-section-title">
            <h2>Mis Bienes Inmuebles</h2>
          </div>
          {loading ? (
            <p>Cargando...</p>
          ) : inmuebles.length === 0 ? (
            <div className="app-empty-state">
              <p>No tienes inmuebles registrados.</p>
            </div>
          ) : (
            <div className="app-grid app-grid--2">
              {inmuebles.map(inmueble => (
                <div key={inmueble.id} className="app-surface" style={{ padding: '16px', border: '1px solid #eee' }}>
                  <h3>{inmueble.TBDireccion}</h3>
                  <p><strong>Matrícula:</strong> {inmueble.TBNoMatricula}</p>
                  <p><strong>Tipo:</strong> {inmueble.TBTipo}</p>
                  <p><strong>Fotos:</strong> {inmueble.fotos?.length || 0}</p>
                  
                  {inmueble.fotos && inmueble.fotos.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', margin: '10px 0' }}>
                      {inmueble.fotos.map(foto => (
                        <img 
                          key={foto.id} 
                          src={`http://127.0.0.1:8000${foto.imagen}`} 
                          alt="Inmueble" 
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} 
                        />
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button className="app-button app-button--secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => handleUploadPhotoClick(inmueble.id)}>
                      Subir Foto
                    </button>
                    <button className="app-button app-button--secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => handleEdit(inmueble)}>
                      Modificar
                    </button>
                    <button className="app-button app-button--danger" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => handleDelete(inmueble.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <AppModal 
        isOpen={modal.isOpen} 
        title={modal.title} 
        message={modal.message} 
        type={modal.type} 
        onClose={() => setModal({ ...modal, isOpen: false })} 
      />
    </AppShell>
  );
};

export default AdministrarBienesInmuebles;
