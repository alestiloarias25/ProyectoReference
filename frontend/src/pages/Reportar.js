import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import AppModal from "../components/AppModal";

const Reportar = () => {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);
  const [tiposReporte, setTiposReporte] = useState([]);
  const [selectedContrato, setSelectedContrato] = useState(null);
  const [contratoInfo, setContratoInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });

  const [reportesList, setReportesList] = useState([]);
  const [globalFechaEntrega, setGlobalFechaEntrega] = useState("");

  const [form, setForm] = useState({
    TRHTipoReporte: "",
    TRHValorAdeudado: "",
    TRHObservacion: "",
  });

  const showModal = (title, message, type = "info") => {
    setModal({ isOpen: true, title, message, type });
  };

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      showModal("Atención", "No estas logueado", "error");
      navigate("/login");
      return;
    }

    Promise.all([
      axios.get("http://127.0.0.1:8000/api/contratoarriendo/", {
        headers: { Authorization: `Token ${token}` },
      }),
      axios.get("http://127.0.0.1:8000/referencias/api/tiporeporte/", {
        headers: { Authorization: `Token ${token}` },
      }),
    ])
      .then(([resContratos, resTipos]) => {
        setContratos(resContratos.data);
        setTiposReporte(resTipos.data);
        setLoading(false);
      })
      .catch((err) => {
        const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        setError(`Error al cargar datos: ${errorMsg}`);
        setLoading(false);
      });
  }, [token, navigate]);

  const handleContratoChange = (e) => {
    const contratoId = parseInt(e.target.value, 10);
    const contrato = contratos.find((c) => c.TCAIDContrato === contratoId);
    setSelectedContrato(contratoId);
    setContratoInfo(contrato);
    setReportesList([]);
    setGlobalFechaEntrega("");
    setForm({ TRHTipoReporte: "", TRHValorAdeudado: "", TRHObservacion: "" });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value.toUpperCase() });
  };

  const addToList = (e) => {
    e.preventDefault();

    if (!selectedContrato) {
      showModal("Atención", "Debes seleccionar un contrato", "error");
      return;
    }

    if (!form.TRHTipoReporte) {
      showModal("Atención", "Debes seleccionar un tipo de reporte", "error");
      return;
    }

    if (reportesList.some((r) => r.TRHTipoReporte === form.TRHTipoReporte)) {
      showModal("Atención", "Este tipo de reporte ya está en la lista.", "error");
      return;
    }

    setReportesList([...reportesList, { ...form }]);
    setForm({ TRHTipoReporte: "", TRHValorAdeudado: "", TRHObservacion: "" });
  };

  const removeFromList = (tipo) => {
    setReportesList(reportesList.filter((r) => r.TRHTipoReporte !== tipo));
  };

  const isGlobalFechaRequired = reportesList.some((r) =>
    ["AR", "DA", "SE", "US"].includes(r.TRHTipoReporte)
  );

  const handleSubmitAll = () => {
    if (reportesList.length === 0) {
      showModal("Atención", "Debes agregar al menos un reporte a la lista.", "error");
      return;
    }

    if (isGlobalFechaRequired && !globalFechaEntrega) {
      showModal("Atención", "Debes ingresar la Fecha de Entrega del Inmueble para guardar los reportes.", "error");
      return;
    }

    setSubmitting(true);

    const payload = reportesList.map((r) => ({
      TCAIDContrato: selectedContrato,
      TRHTipoReporte: r.TRHTipoReporte,
      TRHValorAdeudado: r.TRHValorAdeudado ? parseFloat(r.TRHValorAdeudado) : null,
      TRHObservacion: r.TRHObservacion,
      ...(isGlobalFechaRequired && { fecha_entrega_inmueble: globalFechaEntrega }),
    }));

    axios
      .post("http://127.0.0.1:8000/referencias/api/historial/", payload, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(() => {
        showModal("Exito", "Reportes ingresados exitosamente", "success");
        navigate("/referencias");
      })
      .catch((err) => {
        const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        showModal("Error", `Error al guardar reporte: ${errorMsg}`, "error");
        setSubmitting(false);
      });
  };

  return (
    <AppShell
      eyebrow="Formulario estandarizado"
      title="Reportar referencia"
      subtitle="El formulario de reportes ahora usa el mismo menu, botones, colores y superficies del menu principal."
    >
      {loading && <div className="app-message app-message--info">Cargando datos del formulario...</div>}

      {error && (
        <section className="app-surface">
          <h2>Error al cargar reportes</h2>
          <div className="app-message app-message--error">{error}</div>
          <div className="app-actions">
            <button className="app-button app-button--secondary" type="button" onClick={() => navigate("/referencias")}>
              Volver al menu
            </button>
            <button className="app-button app-button--primary" type="button" onClick={() => window.location.reload()}>
              Reintentar
            </button>
          </div>
        </section>
      )}

      {!loading && !error && contratos.length === 0 && (
        <section className="app-surface">
          <h2>No hay contratos disponibles</h2>
          <p>Debes crear al menos un contrato antes de ingresar reportes.</p>
          <div className="app-actions">
            <button className="app-button app-button--primary" type="button" onClick={() => navigate("/contratos/nuevo")}>
              Crear contrato
            </button>
          </div>
        </section>
      )}

      {!loading && !error && contratos.length > 0 && (
        <div className="app-content">
          <section className="app-surface">
            <div className="app-section-title">
              <h2>Seleccion del contrato</h2>
              <p>Escoge el contrato que deseas reportar y luego completa la novedad.</p>
            </div>

            <div className="app-form-grid">
              <div className="app-field">
                <label htmlFor="contrato-select">Contrato</label>
                <select
                  id="contrato-select"
                  value={selectedContrato || ""}
                  onChange={handleContratoChange}
                  required
                  className="app-select"
                >
                  <option value="">-- Selecciona un contrato --</option>
                  {contratos.map((contrato) => (
                    <option key={contrato.TCAIDContrato} value={contrato.TCAIDContrato}>
                      Contrato No. {contrato.TCAIDContrato} | {contrato.TBDireccion} | Fecha: {contrato.TCAFechaContrato}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {contratoInfo && (
            <section className="app-surface">
              <div className="app-section-title">
                <h2>Resumen del contrato</h2>
              </div>
              <div className="app-grid app-grid--2">
                <div><strong>ID Contrato:</strong> {contratoInfo.TCAIDContrato}</div>
                <div><strong>Matricula:</strong> {contratoInfo.TBNoMatricula}</div>
                <div><strong>Direccion:</strong> {contratoInfo.TBDireccion}</div>
                <div><strong>Valor Canon:</strong> ${parseFloat(contratoInfo.TCAValorCanonContrato).toLocaleString()}</div>
                <div><strong>Fecha Contrato:</strong> {contratoInfo.TCAFechaContrato}</div>
                <div><strong>Fecha Inicio:</strong> {contratoInfo.TCAFechaInicioContrato}</div>
                <div><strong>Fecha Entrega:</strong> {contratoInfo.TCAFechaEntregaInmueble || "No registrada"}</div>
                <div><strong>Duracion:</strong> {contratoInfo.TCADuracionContrato} {contratoInfo.TCATipoDuracion}</div>
              </div>
            </section>
          )}

          {selectedContrato && (
            <section className="app-surface">
              <div className="app-section-title">
                <h2>Añadir reporte a la lista</h2>
              </div>

              <form onSubmit={addToList} className="app-form-grid" autoComplete="off">
                <div className="app-field">
                  <label htmlFor="tipo-reporte">Tipo de reporte</label>
                  <select
                    id="tipo-reporte"
                    name="TRHTipoReporte"
                    value={form.TRHTipoReporte}
                    onChange={handleFormChange}
                    required
                    className="app-select"
                  >
                    <option value="">-- Selecciona un tipo de reporte --</option>
                    {tiposReporte.map((tipo) => (
                      <option key={tipo.TRHTipoReporte} value={tipo.TRHTipoReporte}>
                        {tipo.TRHTipoReporte} - {tipo.TRDescripcion}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="app-field">
                  <label htmlFor="valor-adeudado">Valor adeudado</label>
                  <input
                    id="valor-adeudado"
                    type="number"
                    name="TRHValorAdeudado"
                    placeholder="Ingrese el valor adeudado"
                    value={form.TRHValorAdeudado}
                    onChange={handleFormChange}
                    step="0.01"
                    min="0"
                    className="app-input"
                  />
                </div>

                <div className="app-field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="observacion">Observacion</label>
                  <textarea
                    id="observacion"
                    name="TRHObservacion"
                    placeholder="Ingrese observaciones adicionales"
                    value={form.TRHObservacion}
                    onChange={handleFormChange}
                    rows="4"
                    className="app-textarea"
                  />
                </div>

                <div className="app-actions" style={{ gridColumn: "1 / -1" }}>
                  <button className="app-button app-button--secondary" type="submit">
                    Añadir a la lista
                  </button>
                </div>
              </form>
            </section>
          )}

          {selectedContrato && (
            <section className="app-surface">
              <div className="app-section-title">
                <h2>Reportes por Guardar ({reportesList.length})</h2>
              </div>
              
              {reportesList.length === 0 ? (
                <div className="app-empty-state">
                  <strong>Aun no has agregado reportes a la lista</strong>
                  <p>Configura un reporte y presiona "Añadir a la lista" para empezar.</p>
                </div>
              ) : (
                <div className="wizard-choice-list" style={{ marginBottom: '20px' }}>
                  {reportesList.map((r, index) => (
                    <div key={index} className="wizard-choice">
                      <div>
                        <strong>{r.TRHTipoReporte}</strong>
                        {r.TRHValorAdeudado && <small>Valor Adeudado: ${r.TRHValorAdeudado}</small>}
                        {r.TRHObservacion && <small>Obs: {r.TRHObservacion}</small>}
                      </div>
                      <button className="app-button app-button--danger" type="button" onClick={() => removeFromList(r.TRHTipoReporte)}>
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {isGlobalFechaRequired && reportesList.length > 0 && (
                <div className="app-form-grid" style={{ marginBottom: "20px", padding: "16px", backgroundColor: "#fdf8e4", borderRadius: "8px", border: "1px solid #f1c40f" }}>
                  <div className="app-field" style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="global-fecha-entrega">
                      <strong>Fecha de Entrega del Inmueble (*)</strong>
                    </label>
                    <p style={{ margin: "4px 0 12px 0", fontSize: "14px", color: "#666" }}>
                      Los tipos de reporte seleccionados requieren que confirmes la fecha en la que se entregó el bien inmueble.
                    </p>
                    <input
                      id="global-fecha-entrega"
                      type="date"
                      value={globalFechaEntrega}
                      onChange={(e) => setGlobalFechaEntrega(e.target.value)}
                      required
                      className="app-input"
                    />
                  </div>
                </div>
              )}

              <div className="app-actions">
                <button className="app-button app-button--primary" type="button" disabled={submitting || reportesList.length === 0} onClick={handleSubmitAll}>
                  {submitting ? "Guardando todos..." : "Guardar todos los reportes"}
                </button>
                <button className="app-button app-button--secondary" type="button" onClick={() => navigate("/referencias")}>
                  Cancelar
                </button>
              </div>
            </section>
          )}
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

export default Reportar;
