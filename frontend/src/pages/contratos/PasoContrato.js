import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AppModal from "../../components/AppModal";

const API_INMUEBLE = "http://127.0.0.1:8000/api/bienesinmuebles/";
const API_CONTRATO = "http://127.0.0.1:8000/api/contratoarriendo/";

const initialForm = {
  TCAFechaContrato: "",
  TCAFechaInicioContrato: "",
  TCADuracionContrato: "",
  TCATipoDuracion: "MM",
  TCAValorCanonContrato: "",
};

const roleOptions = [
  { value: "ARRENDADOR", label: "ARRENDADOR" },
  { value: "ARRENDATARIO", label: "ARRENDATARIO" },
  { value: "CODEUDOR", label: "CODEUDOR" },
];

const PasoContrato = ({ personaIds, inmuebleId, onBack, onSuccess }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [pdfFile, setPdfFile] = useState(null);
  const [inmueble, setInmueble] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });

  const showModal = (title, message, type = "info") => {
    setModal({ isOpen: true, title, message, type });
  };

  const [roles, setRoles] = useState(
    personaIds.map((p) => ({
      TPTipoDocumento: p.TPTipoDocumento,
      TPNoDocumento: p.TPNoDocumento,
      TCARTipoParticipacion: "",
    }))
  );

  const token = localStorage.getItem("token");

  useEffect(() => {
    setRoles(
      personaIds.map((p) => ({
        TPTipoDocumento: p.TPTipoDocumento,
        TPNoDocumento: p.TPNoDocumento,
        TCARTipoParticipacion: "",
      }))
    );
  }, [personaIds]);

  useEffect(() => {
    if (!token) {
      showModal("Atención", "No estas logueado", "error");
      return;
    }

    axios
      .get(`${API_INMUEBLE}${inmuebleId}/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        setInmueble(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando inmueble", err.response?.data || err);
        setLoading(false);
      });
  }, [inmuebleId, token]);

  const canContinue = useMemo(() => roles.length > 0 && roles.every((item) => item.TCARTipoParticipacion), [roles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleRoleChange = (index, role) => {
    setRoles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], TCARTipoParticipacion: role };
      return updated;
    });
  };

  const handlePdfChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (file && file.type && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showModal("Archivo no válido", "Solo se permiten archivos PDF", "error");
      e.target.value = "";
      setPdfFile(null);
      return;
    }

    setPdfFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inmuebleId) {
      showModal("Atención", "Debe seleccionar un inmueble en el paso anterior", "error");
      return;
    }

    if (!canContinue) {
      showModal("Roles incompletos", "Debe asignar un rol a todas las personas", "error");
      return;
    }

    if (!pdfFile) {
      showModal("PDF Requerido", "Debe adjuntar el archivo PDF del contrato", "error");
      return;
    }

    const payload = new FormData();
    payload.append("bien_inmueble_id", String(parseInt(inmuebleId, 10)));
    payload.append("TCAFechaContrato", form.TCAFechaContrato);
    payload.append("TCAFechaInicioContrato", form.TCAFechaInicioContrato);
    payload.append("TCADuracionContrato", form.TCADuracionContrato);
    payload.append("TCATipoDuracion", form.TCATipoDuracion);
    payload.append("TCAValorCanonContrato", form.TCAValorCanonContrato);
    payload.append("personas", JSON.stringify(roles));

    if (pdfFile) {
      payload.append("TCAArchivoPDF", pdfFile);
    }

    try {
      setSubmitting(true);

      await axios.post(API_CONTRATO, payload, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      showModal("Éxito", "Contrato creado exitosamente", "success");
      setTimeout(() => {
        if (onSuccess) onSuccess();
        navigate("/referencias");
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      let msg = errorMsg;
      if (err.response?.data?.non_field_errors) {
        msg = err.response.data.non_field_errors[0];
      }
      showModal("Error al guardar contrato", msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="app-message app-message--info">Cargando datos del inmueble...</div>;
  }

  return (
    <div className="wizard-step-content">
      <section className="app-surface">
        <div className="app-section-title">
          <h2>Paso 3. Crear contrato de arrendamiento</h2>
          <p>Asigna participantes y completa los datos del contrato dentro del mismo formato unificado.</p>
        </div>

        {inmueble && (
          <div className="wizard-summary">
            <div><strong>Matricula:</strong> {inmueble.TBNoMatricula}</div>
            <div><strong>Direccion:</strong> {inmueble.TBDireccion}</div>
            <div><strong>Tipo:</strong> {inmueble.TBTipo}</div>
            <div><strong>Ciudad:</strong> {inmueble.TCId}</div>
          </div>
        )}
      </section>

      <form onSubmit={handleSubmit} className="wizard-step-content" autoComplete="off">
        <section className="app-surface">
          <div className="app-section-title">
            <h2>Personas participantes</h2>
          </div>

          <div className="wizard-choice-list">
            {personaIds.map((persona, index) => (
              <div key={persona.TPNoDocumento} className="wizard-choice">
                <div>
                  <strong>{persona.TPNombres} {persona.TPApellidos}</strong>
                  <small>{persona.TPTipoDocumento} - {persona.TPNoDocumento}</small>
                </div>
                <select
                  value={roles[index]?.TCARTipoParticipacion || ""}
                  onChange={(e) => handleRoleChange(index, e.target.value)}
                  required
                >
                  <option value="">Seleccionar rol</option>
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>

        <section className="app-surface">
          <div className="app-section-title">
            <h2>Datos del contrato</h2>
          </div>

          <div className="wizard-form-grid">
            <div className="app-field">
              <label htmlFor="fecha-contrato">Fecha del Contrato</label>
              <input id="fecha-contrato" type="date" name="TCAFechaContrato" value={form.TCAFechaContrato} onChange={handleChange} required className="app-input" />
            </div>

            <div className="app-field">
              <label htmlFor="fecha-inicio">Fecha de Inicio</label>
              <input id="fecha-inicio" type="date" name="TCAFechaInicioContrato" value={form.TCAFechaInicioContrato} onChange={handleChange} required className="app-input" />
            </div>

            <div className="app-field">
              <label htmlFor="duracion">Duración (Ej: 12)</label>
              <input id="duracion" type="number" name="TCADuracionContrato" placeholder="Duración" value={form.TCADuracionContrato} onChange={handleChange} required className="app-input" />
            </div>

            <div className="app-field">
              <label htmlFor="tipo-duracion">Tipo de Duración</label>
              <select id="tipo-duracion" name="TCATipoDuracion" value={form.TCATipoDuracion} onChange={handleChange} required className="app-select">
                <option value="DD">Días</option>
                <option value="MM">Meses</option>
                <option value="AA">Años</option>
              </select>
            </div>

            <div className="app-field">
              <label htmlFor="valor-canon">Valor Canon Mensual</label>
              <input id="valor-canon" type="number" name="TCAValorCanonContrato" placeholder="Valor canon" value={form.TCAValorCanonContrato} onChange={handleChange} required className="app-input" />
            </div>
            <div className="app-field">
              <label htmlFor="contrato-pdf">Archivo PDF del contrato</label>
              <input id="contrato-pdf" type="file" name="TCAArchivoPDF" accept="application/pdf,.pdf" onChange={handlePdfChange} required />
              <span className="wizard-note">{pdfFile ? `Archivo seleccionado: ${pdfFile.name}` : "Adjunta el PDF del contrato de forma obligatoria."}</span>
            </div>
          </div>
        </section>

        <section className="app-surface">
          <div className="app-actions">
            <button className="app-button app-button--secondary" type="button" onClick={onBack}>
              Regresar a inmueble
            </button>
            <button className="app-button app-button--primary" type="submit" disabled={submitting || !canContinue}>
              {submitting ? "Guardando..." : "Guardar contrato"}
            </button>
          </div>
        </section>
      </form>

      <AppModal 
        isOpen={modal.isOpen} 
        title={modal.title} 
        message={modal.message} 
        type={modal.type} 
        onClose={() => setModal({ ...modal, isOpen: false })} 
      />
    </div>
  );
};

export default PasoContrato;
