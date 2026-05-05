import React, { useState } from "react";
import axios from "axios";
import AppShell from "../components/AppShell";
import AppModal from "../components/AppModal";

const ConsultarBienesInmuebles = () => {
  const [inmuebles, setInmuebles] = useState([]);
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });
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

  const showModal = (title, message, type = "info") => {
    setModal({ isOpen: true, title, message, type });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    axios.get(`http://127.0.0.1:8000/api/bienesinmuebles/buscar/?direccion=${direccion}`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then(res => {
        setInmuebles(res.data);
      })
      .catch(err => {
        showModal("Error", "Error al buscar inmuebles", "error");
      })
      .finally(() => setLoading(false));
  };

  return (
    <AppShell
      eyebrow="Búsqueda"
      title="Consultar Bienes Inmuebles"
      subtitle="Encuentra propiedades ingresando una dirección o palabras clave."
    >
      <div className="app-content">
        <section className="app-surface">
          <form onSubmit={handleSearch} className="app-form-grid" autoComplete="off">
            <div className="app-field" style={{ gridColumn: "1 / -1", display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label>Dirección del Inmueble</label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej. K 21B 35 28 Ap 201, C 60 18, K 21B"
                  pattern="^[a-zA-Z]+\s[0-9a-zA-Z]+(?:\s[0-9a-zA-Z]+(?:\s\d+(?:\s.+)?)?)?$"
                  title="Formato de búsqueda: Vía Número [Letra] [Número Letra] [Número] [Complemento]. Ej: C 60, C 60 18, o C 60 18 15"
                  className="app-input"
                  required
                />
                <small style={{ color: "#666", fontSize: "12px", marginTop: "4px", display: "block" }}>
                  Formato de búsqueda: Vía Número [Opcionales: Número Número Complemento]. Ej: C 60 o C 60 18
                </small>
              </div>
              <button className="app-button app-button--primary" type="submit" disabled={loading}>
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </form>
        </section>

        {searched && (
          <section className="app-surface">
            <div className="app-section-title">
              <h2>Resultados de la búsqueda ({inmuebles.length})</h2>
            </div>
            {inmuebles.length === 0 ? (
              <div className="app-empty-state">
                <p>No se encontraron inmuebles cercanos a esa dirección.</p>
              </div>
            ) : (
              <div className="app-grid app-grid--2">
                {inmuebles.map(inmueble => (
                  <div key={inmueble.id} className="app-surface" style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                    <h3 style={{ color: '#2c3e50', marginTop: 0 }}>{inmueble.TBDireccion}</h3>
                    <div style={{ margin: '10px 0', fontSize: '14px' }}>
                      <p><strong>Tipo:</strong> {inmueble.TBTipo}</p>
                      <p><strong>Observaciones:</strong> {inmueble.TBObs || "N/A"}</p>
                      <p><strong>Teléfono de contacto:</strong> {inmueble.telefono_contacto || "No disponible"}</p>
                    </div>

                    {inmueble.fotos && inmueble.fotos.length > 0 ? (
                      <div>
                        <strong>Fotos:</strong>
                        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginTop: '10px', paddingBottom: '10px' }}>
                          {inmueble.fotos.map((foto, index) => (
                            <img 
                              key={foto.id} 
                              src={getMediaUrl(foto.imagen)} 
                              alt="Inmueble" 
                              onClick={() => openImageModal(inmueble.fotos.map(f => getMediaUrl(f.imagen)), index)}
                              style={{ width: '120px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }} 
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: '10px', padding: '20px', backgroundColor: '#f9f9f9', textAlign: 'center', color: '#888', borderRadius: '4px' }}>
                        Sin fotos disponibles
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
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

export default ConsultarBienesInmuebles;
