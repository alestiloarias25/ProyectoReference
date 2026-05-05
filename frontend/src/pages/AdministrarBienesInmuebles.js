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
    TBTipo: "RESIDENCIAL",
    TBObs: "",
    numero_contrato_energia: "",
    numero_contrato_agua: "",
    numero_contrato_gas: ""
  });

  const [certificadoFile, setCertificadoFile] = useState(null);
  const [direccionesSugeridas, setDireccionesSugeridas] = useState([]);

  const fileInputRef = useRef(null);
  const [uploadingInmuebleId, setUploadingInmuebleId] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalUrls, setImageModalUrls] = useState([]);
  const [imageModalIndex, setImageModalIndex] = useState(0);

  const token = localStorage.getItem("token");

  const getMediaUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return path.startsWith("/") ? `http://127.0.0.1:8000${path}` : `http://127.0.0.1:8000/${path}`;
  };

  const openImageModal = (urls, index) => {
    setImageModalUrls(urls);
    setImageModalIndex(index);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setImageModalUrls([]);
    setImageModalIndex(0);
  };

  const showPreviousImage = (e) => {
    e.stopPropagation();
    setImageModalIndex((prev) => (prev <= 0 ? imageModalUrls.length - 1 : prev - 1));
  };

  const showNextImage = (e) => {
    e.stopPropagation();
    setImageModalIndex((prev) => (prev >= imageModalUrls.length - 1 ? 0 : prev + 1));
  };

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
    setForm(prevForm => ({ ...prevForm, [name]: value.toUpperCase() }));
  };

  const handleMatriculaBlur = (e) => {
    const matricula = e.target.value;
    if (matricula) {
      axios.get(`http://127.0.0.1:8000/api/bienesinmuebles/buscar_por_matricula/?matricula=${matricula}`, {
        headers: { Authorization: `Token ${token}` },
      })
        .then(res => setDireccionesSugeridas(res.data))
        .catch(err => console.error(err));
    } else {
      setDireccionesSugeridas([]);
    }
  };

  const handleCertificadoChange = (e) => {
    setCertificadoFile(e.target.files[0]);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editingId && !certificadoFile) {
      showModal("Error", "El Certificado de Tradición es obligatorio.", "error");
      return;
    }
    setSubmitting(true);

    const formData = new FormData();
    Object.keys(form).forEach(key => {
      formData.append(key, form[key]);
    });
    if (certificadoFile) {
      formData.append("certificado_tradicion", certificadoFile);
    }

    if (editingId) {
      axios.put(`http://127.0.0.1:8000/api/bienesinmuebles/${editingId}/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }).then(() => {
        showModal("Éxito", "Inmueble actualizado correctamente", "success");
        setEditingId(null);
        resetForm();
        fetchInmuebles();
      }).catch(err => {
        const data = err.response?.data;
        let errorMessage = "Error al actualizar el inmueble";
        if (data) {
          if (data.detail) {
            errorMessage = data.detail;
          } else if (typeof data === 'object') {
            const firstKey = Object.keys(data)[0];
            if (Array.isArray(data[firstKey])) {
              errorMessage = `${firstKey}: ${data[firstKey][0]}`;
            } else if (typeof data[firstKey] === 'string') {
              errorMessage = `${firstKey}: ${data[firstKey]}`;
            }
          }
        }
        showModal("Error", errorMessage, "error");
      }).finally(() => setSubmitting(false));
    } else {
      axios.post("http://127.0.0.1:8000/api/bienesinmuebles/", formData, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }).then(() => {
        showModal("Éxito", "Inmueble creado correctamente", "success");
        resetForm();
        fetchInmuebles();
      }).catch(err => {
        const data = err.response?.data;
        let errorMessage = "Error al crear el inmueble";
        if (data) {
          if (data.detail) {
            errorMessage = data.detail;
          } else if (typeof data === 'object') {
            const firstKey = Object.keys(data)[0];
            if (Array.isArray(data[firstKey])) {
              errorMessage = `${firstKey}: ${data[firstKey][0]}`;
            } else if (typeof data[firstKey] === 'string') {
              errorMessage = `${firstKey}: ${data[firstKey]}`;
            }
          }
        }
        showModal("Error", errorMessage, "error");
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
      TBObs: inmueble.TBObs || "",
      numero_contrato_energia: inmueble.numero_contrato_energia || "",
      numero_contrato_agua: inmueble.numero_contrato_agua || "",
      numero_contrato_gas: inmueble.numero_contrato_gas || ""
    });
    setCertificadoFile(null);
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
        showModal("Error", err.response?.data?.detail || "Error al eliminar el inmueble", "error");
      });
    }
  };

  const resetForm = () => {
    setForm({
      TBNoMatricula: "",
      TBDireccion: "",
      TCId: "11001",
      TBTipo: "RESIDENCIAL",
      TBObs: "",
      numero_contrato_energia: "",
      numero_contrato_agua: "",
      numero_contrato_gas: ""
    });
    setCertificadoFile(null);
    setDireccionesSugeridas([]);
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
                onBlur={handleMatriculaBlur}
                required
                data-no-uppercase
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
                list="direcciones-list"
                pattern="^[a-zA-Z]+\s[0-9a-zA-Z]+\s[0-9a-zA-Z]+\s\d+(?:\s.+)?$"
                title="Debe usar el formato: Vía Número Letra Número Letra Número Complemento. Ej: C 60 18 15 o K 21B 35 28 Ap 201"
                placeholder="Ej. K 21B 35 28 Ap 201"
                data-no-uppercase
                className="app-input"
              />
              <datalist id="direcciones-list">
                {direccionesSugeridas.map((dir, idx) => (
                  <option key={idx} value={dir} />
                ))}
              </datalist>
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
                <option value="RESIDENCIAL">RESIDENCIAL</option>
                <option value="COMERCIAL">COMERCIAL</option>
                <option value="INDUSTRIAL">INDUSTRIAL</option>
              </select>
            </div>

            <div className="app-field">
              <label>Certificado de Tradición (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleCertificadoChange}
                className="app-input"
                required={!editingId}
              />
              {editingId && <small style={{ color: "#666", fontSize: "12px" }}>Dejar en blanco para conservar el archivo actual.</small>}
            </div>

            <div className="app-field">
              <label>No. Contrato Energía (Opcional)</label>
              <input
                type="text"
                name="numero_contrato_energia"
                value={form.numero_contrato_energia}
                onChange={handleFormChange}
                data-no-uppercase
                className="app-input"
              />
            </div>
            <div className="app-field">
              <label>No. Contrato Agua (Opcional)</label>
              <input
                type="text"
                name="numero_contrato_agua"
                value={form.numero_contrato_agua}
                onChange={handleFormChange}
                data-no-uppercase
                className="app-input"
              />
            </div>
            <div className="app-field">
              <label>No. Contrato Gas (Opcional)</label>
              <input
                type="text"
                name="numero_contrato_gas"
                value={form.numero_contrato_gas}
                onChange={handleFormChange}
                data-no-uppercase
                className="app-input"
              />
            </div>

            <div className="app-field" style={{ gridColumn: "1 / -1" }}>
              <label>Observaciones</label>
              <textarea
                name="TBObs"
                value={form.TBObs}
                onChange={handleFormChange}
                rows="3"
                data-no-uppercase
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
                  <p>
                    <strong>Estado:</strong>{" "}
                    {inmueble.estado_arrendado ? (
                      <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>Arrendado (Vigente)</span>
                    ) : (
                      <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>Disponible / Contrato Finalizado</span>
                    )}
                  </p>
                  {inmueble.contrato_vigente_info && (
                    <div style={{ padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px', marginTop: '8px', marginBottom: '8px', fontSize: '14px' }}>
                      <strong>Contrato ID:</strong> {inmueble.contrato_vigente_info.id}<br />
                      <strong>Inicio:</strong> {inmueble.contrato_vigente_info.fecha_inicio}<br />
                      <strong>Valor Canon:</strong> ${inmueble.contrato_vigente_info.valor_canon}
                      {inmueble.contrato_vigente_info.duracion != null && (
                        <div style={{ marginTop: '8px' }}>
                          <strong>Duración:</strong> {inmueble.contrato_vigente_info.duracion} {(
                            {
                              DD: 'Días',
                              MM: 'Meses',
                              AA: 'Años'
                            }[inmueble.contrato_vigente_info.tipo_duracion] || inmueble.contrato_vigente_info.tipo_duracion
                          )}
                        </div>
                      )}

                      {inmueble.contrato_vigente_info.personas && inmueble.contrato_vigente_info.personas.length > 0 && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
                          <strong style={{ display: 'block', marginBottom: '5px' }}>Ocupantes / Responsables:</strong>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {inmueble.contrato_vigente_info.personas.map((p, idx) => (
                              <li key={idx} style={{ marginBottom: '4px' }}>
                                <span style={{ fontWeight: '500', color: '#2c3e50' }}>{p.rol}</span>: {p.nombre} <small>({p.contacto})</small>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  {inmueble.numero_contrato_energia && <p><strong>Energía:</strong> {inmueble.numero_contrato_energia}</p>}
                  {inmueble.numero_contrato_agua && <p><strong>Agua:</strong> {inmueble.numero_contrato_agua}</p>}
                  {inmueble.numero_contrato_gas && <p><strong>Gas:</strong> {inmueble.numero_contrato_gas}</p>}
                  {inmueble.certificado_tradicion && (
                    <p>
                      <strong>Certificado:</strong> <a href={getMediaUrl(inmueble.certificado_tradicion)} target="_blank" rel="noopener noreferrer">Ver PDF</a>
                    </p>
                  )}
                  <p><strong>Fotos:</strong> {inmueble.fotos?.length || 0}</p>

                  {inmueble.fotos && inmueble.fotos.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', margin: '10px 0' }}>
                      {inmueble.fotos.map((foto, index) => (
                        <img
                          key={foto.id}
                          src={getMediaUrl(foto.imagen)}
                          alt="Inmueble"
                          onClick={() => openImageModal(inmueble.fotos.map(f => getMediaUrl(f.imagen)), index)}
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
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
      {imageModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px',
          }}
          onClick={closeImageModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={closeImageModal}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >
              ×
            </button>
            <button
              onClick={showPreviousImage}
              style={{
                position: 'absolute',
                left: '12px',
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '20px',
              }}
            >
              ‹
            </button>
            <img
              src={imageModalUrls[imageModalIndex]}
              alt="Vista ampliada"
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              }}
            />
            <button
              onClick={showNextImage}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '20px',
              }}
            >
              ›
            </button>
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
};

export default AdministrarBienesInmuebles;
