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

  const [existingReports, setExistingReports] = useState([]);
  const [editingReportId, setEditingReportId] = useState(null);
  const [reportesList, setReportesList] = useState([]);
  const [globalFechaEntrega, setGlobalFechaEntrega] = useState("");

  const NEGATIVE_REPORT_TYPES = ['AR', 'DA', 'SE', 'US', 'OC'];
  const DATE_REQUIRED_REPORT_TYPES = ['AR', 'DA', 'SE', 'US', 'OC', 'CF'];
  const contratoTieneCF = () => existingReports.some((r) => r.TRHTipoReporte === 'CF');
  const contratoTieneEntrega = () => Boolean(contratoInfo?.TCAFechaEntregaInmueble);
  const contratoBloqueaNegativos = () => contratoTieneCF() || contratoTieneEntrega();
  const isNegativeReportType = (tipo) => NEGATIVE_REPORT_TYPES.includes(tipo);
  const isFechaEntregaRequired = () => reportesList.some((r) => DATE_REQUIRED_REPORT_TYPES.includes(r.TRHTipoReporte));
  const requiereFechaEntrega = (tipo) => DATE_REQUIRED_REPORT_TYPES.includes(tipo);

  const role = localStorage.getItem("role");

  const [form, setForm] = useState({
    TRHTipoReporte: "",
    TRHValorAdeudado: "",
    TRHObservacion: "",
  });

  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [pagoModal, setPagoModal] = useState({ isOpen: false, TRHId: null, TRHValorPagado: "", TRHPobservacion: "", TRHFechaPago: "" });

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
      axios.get(`${process.env.REACT_APP_API_URL || ""}/api/contratoarriendo/`, {
        headers: { Authorization: `Token ${token}` },
      }),
      axios.get(`${process.env.REACT_APP_API_URL || ""}/referencias/api/tiporeporte/`, {
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

  const loadExistingReports = (contratoId) => {
    axios.get(`${process.env.REACT_APP_API_URL || ""}/referencias/api/historial/?TCAIDContrato=${contratoId}`, {
      headers: { Authorization: `Token ${token}` },
    }).then(res => {
      setExistingReports(res.data);
    }).catch(err => {
      console.error("Error cargando reportes existentes", err);
    });
  };

  const duracionTipoTexto = (tipo) => {
    const labels = {
      DD: "Días",
      MM: "Meses",
      AA: "Años",
    };
    return labels[tipo] || tipo;
  };

  const handleContratoChange = (e) => {
    const contratoId = parseInt(e.target.value, 10);
    const contrato = contratos.find((c) => c.TCAIDContrato === contratoId);
    setSelectedContrato(contratoId);
    setContratoInfo(contrato);
    setReportesList([]);
    setGlobalFechaEntrega("");
    setEditingReportId(null);
    setForm({ TRHTipoReporte: "", TRHValorAdeudado: "", TRHObservacion: "" });
    if (contratoId) {
      loadExistingReports(contratoId);
    } else {
      setExistingReports([]);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const upperValue = value.toUpperCase();

    if (name === 'TRHTipoReporte' && contratoBloqueaNegativos() && isNegativeReportType(upperValue)) {
      showModal(
        "No permitido",
        "No se pueden ingresar reportes negativos sobre un inmueble con contrato finalizado sin deuda (CF) o con Fecha de Entrega.",
        "error"
      );
      setForm({ ...form, TRHTipoReporte: "" });
      return;
    }

    setForm({ ...form, [name]: upperValue });
  };

  const handleEditReport = (report) => {
    setEditingReportId(report.TRHId);
    setForm({
      TRHTipoReporte: report.TRHTipoReporte,
      TRHValorAdeudado: report.TRHValorAdeudado || "",
      TRHObservacion: report.TRHObservacion || "",
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleDeleteReport = (reportId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este reporte?")) {
      axios.delete(`${process.env.REACT_APP_API_URL || ""}/referencias/api/historial/${reportId}/`, {
        headers: { Authorization: `Token ${token}` }
      }).then(() => {
        showModal("Exito", "Reporte eliminado correctamente", "success");
        loadExistingReports(selectedContrato);
      }).catch(err => {
        const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        showModal("Error", `Error al eliminar: ${errorMsg}`, "error");
      });
    }
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

    if (isNegativeReportType(form.TRHTipoReporte) && contratoBloqueaNegativos()) {
      showModal(
        "No permitido",
        "No se pueden ingresar reportes negativos sobre un inmueble con contrato finalizado sin deuda (CF) o con Fecha de Entrega.",
        "error"
      );
      return;
    }

    if (editingReportId) {
      if (requiereFechaEntrega(form.TRHTipoReporte) && !globalFechaEntrega && !contratoInfo?.TCAFechaEntregaInmueble) {
        showModal("Atención", "Debes ingresar la Fecha de Entrega del Inmueble para actualizar este reporte.", "error");
        return;
      }

      setSubmitting(true);
      axios.put(`${process.env.REACT_APP_API_URL || ""}/referencias/api/historial/${editingReportId}/`, {
        TCAIDContrato: selectedContrato,
        TRHTipoReporte: form.TRHTipoReporte,
        TRHValorAdeudado: form.TRHValorAdeudado ? parseFloat(form.TRHValorAdeudado) : null,
        TRHObservacion: form.TRHObservacion,
        ...(requiereFechaEntrega(form.TRHTipoReporte) && globalFechaEntrega ? { fecha_entrega_inmueble: globalFechaEntrega } : {}),
      }, {
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" }
      }).then(() => {
        showModal("Exito", "Reporte actualizado correctamente", "success");
        setForm({ TRHTipoReporte: "", TRHValorAdeudado: "", TRHObservacion: "" });
        setEditingReportId(null);
        loadExistingReports(selectedContrato);
      }).catch(err => {
        const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        showModal("Error", `Error al actualizar: ${errorMsg}`, "error");
      }).finally(() => {
        setSubmitting(false);
      });
      return;
    }

    if (reportesList.some((r) => r.TRHTipoReporte === form.TRHTipoReporte)) {
      showModal("Atención", "Este tipo de reporte ya está en la lista.", "error");
      return;
    }

    setReportesList([...reportesList, { ...form }]);
    setForm({ TRHTipoReporte: "", TRHValorAdeudado: "", TRHObservacion: "" });
  };

  const cancelEdit = () => {
    setEditingReportId(null);
    setForm({ TRHTipoReporte: "", TRHValorAdeudado: "", TRHObservacion: "" });
  };

  const removeFromList = (tipo) => {
    setReportesList(reportesList.filter((r) => r.TRHTipoReporte !== tipo));
  };

  const isGlobalFechaRequired = reportesList.some((r) =>
    DATE_REQUIRED_REPORT_TYPES.includes(r.TRHTipoReporte)
  );

  const executeSubmitAll = () => {
    setSubmitting(true);

    const payload = reportesList.map((r) => ({
      TCAIDContrato: selectedContrato,
      TRHTipoReporte: r.TRHTipoReporte,
      TRHValorAdeudado: r.TRHValorAdeudado ? parseFloat(r.TRHValorAdeudado) : null,
      TRHObservacion: r.TRHObservacion,
      ...(isGlobalFechaRequired && { fecha_entrega_inmueble: globalFechaEntrega }),
    }));

    axios
      .post(`${process.env.REACT_APP_API_URL || ""}/referencias/api/historial/`, payload, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then(() => {
        showModal("Exito", "Reportes ingresados exitosamente", "success");
        setReportesList([]);
        loadExistingReports(selectedContrato);
      })
      .catch((err) => {
        const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        showModal("Error", `Error al guardar reporte: ${errorMsg}`, "error");
      })
      .finally(() => {
        setSubmitting(false);
        setConfirmModal({ isOpen: false });
      });
  };

  const handleSubmitAll = () => {
    if (reportesList.length === 0) {
      showModal("Atención", "Debes agregar al menos un reporte a la lista.", "error");
      return;
    }

    if (isFechaEntregaRequired() && !globalFechaEntrega) {
      showModal("Atención", "Debes ingresar la Fecha de Entrega del Inmueble para guardar los reportes.", "error");
      return;
    }

    const hasNegative = reportesList.some((r) => ["AR", "DA", "OC", "SE", "US"].includes(r.TRHTipoReporte));
    if (hasNegative && role === "ARRENDADOR") {
      setConfirmModal({ isOpen: true });
    } else {
      executeSubmitAll();
    }
  };

  const handleOpenPagoModal = (report) => {
    setPagoModal({
      isOpen: true,
      TRHId: report.TRHId,
      TCAIDContrato: report.TCAIDContrato,
      TRHValorPagado: "",
      TRHPobservacion: "",
      TRHFechaPago: new Date().toISOString().split("T")[0],
      saldo: report.saldo !== undefined ? report.saldo : report.TRHValorAdeudado
    });
  };

  const handlePagoChange = (e) => {
    const { name, value } = e.target;
    setPagoModal({ ...pagoModal, [name]: value });
  };

  const handleSubmitPago = (e) => {
    e.preventDefault();
    setSubmitting(true);
    axios.post(`${process.env.REACT_APP_API_URL || ""}/referencias/api/pagos/`, {
      TRHId: pagoModal.TRHId,
      TCAIDContrato: pagoModal.TCAIDContrato,
      TRHValorPagado: parseFloat(pagoModal.TRHValorPagado),
      TRHPobservacion: pagoModal.TRHPobservacion,
      TRHFechaPago: pagoModal.TRHFechaPago
    }, {
      headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" }
    }).then(() => {
      showModal("Exito", "Pago registrado correctamente", "success");
      setPagoModal({ isOpen: false, TRHId: null, TRHValorPagado: "", TRHPobservacion: "", TRHFechaPago: "" });
      loadExistingReports(selectedContrato);
    }).catch((err) => {
      const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      showModal("Error", `Error al registrar pago: ${errorMsg}`, "error");
    }).finally(() => {
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
                      Contrato No. {contrato.TCAIDContrato} | Matrícula: {contrato.TBNoMatricula} | {contrato.TBDireccion} | Fecha: {contrato.TCAFechaContrato}
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
              {contratoBloqueaNegativos() && (
                <div className="app-message app-message--warning">
                  Este contrato tiene contrato finalizado sin deuda (CF) o Fecha de Entrega registrada. No se permiten reportes negativos.
                </div>
              )}
              <div className="app-grid app-grid--2">
                <div><strong>ID Contrato:</strong> {contratoInfo.TCAIDContrato}</div>
                <div><strong>Matricula:</strong> {contratoInfo.TBNoMatricula}</div>
                <div><strong>Direccion:</strong> {contratoInfo.TBDireccion}</div>
                <div><strong>Valor Canon:</strong> ${parseFloat(contratoInfo.TCAValorCanonContrato).toLocaleString()}</div>
                <div><strong>Fecha Contrato:</strong> {contratoInfo.TCAFechaContrato}</div>
                <div><strong>Fecha Inicio:</strong> {contratoInfo.TCAFechaInicioContrato}</div>
                <div><strong>Fecha Entrega:</strong> {contratoInfo.TCAFechaEntregaInmueble || "No registrada"}</div>
                <div><strong>Duracion:</strong> {contratoInfo.TCADuracionContrato} {duracionTipoTexto(contratoInfo.TCATipoDuracion)}</div>
              </div>
            </section>
          )}

          {selectedContrato && existingReports.length > 0 && (
            <section className="app-surface">
              <div className="app-section-title">
                <h2>Reportes Existentes ({existingReports.length})</h2>
              </div>
              <div className="wizard-choice-list" style={{ marginBottom: '20px' }}>
                {existingReports.map((r) => (
                  <div key={r.TRHId} className="wizard-choice">
                    <div>
                      <strong>{r.TRHTipoReporte}</strong>
                      {r.TRHValorAdeudado && <small style={{ display: 'block' }}>Valor Adeudado Inicial: ${r.TRHValorAdeudado}</small>}
                      {r.total_pagado !== undefined && <small style={{ display: 'block' }}>Total Pagado: ${r.total_pagado}</small>}
                      {r.saldo !== undefined && <small style={{ display: 'block', color: r.saldo > 0 ? 'red' : 'green' }}>Saldo: ${r.saldo}</small>}
                      {r.TRHObservacion && <small style={{ display: 'block', marginTop: '4px' }}>Obs: {r.TRHObservacion}</small>}
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {["AR", "DA", "OC", "SE", "US"].includes(r.TRHTipoReporte) && (
                        <button
                          className="app-button app-button--primary"
                          type="button"
                          onClick={() => handleOpenPagoModal(r)}
                          disabled={Number(r.saldo) <= 0}
                        >
                          Registrar Pago
                        </button>
                      )}
                      {role !== "ARRENDADOR" && (
                        <>
                          <button className="app-button app-button--secondary" type="button" onClick={() => handleEditReport(r)}>
                            Modificar
                          </button>
                          <button className="app-button app-button--danger" type="button" onClick={() => handleDeleteReport(r.TRHId)}>
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {selectedContrato && !contratoBloqueaNegativos() && (
            <section className="app-surface">
              <div className="app-section-title">
                <h2>{editingReportId ? "Modificar reporte" : "Añadir reporte a la lista"}</h2>
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
                    {tiposReporte.map((tipo) => {
                      const disabled = contratoBloqueaNegativos() && isNegativeReportType(tipo.TRHTipoReporte);
                      return (
                        <option key={tipo.TRHTipoReporte} value={tipo.TRHTipoReporte} disabled={disabled}>
                          {tipo.TRHTipoReporte} - {tipo.TRDescripcion}
                        </option>
                      );
                    })}
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

                {editingReportId && requiereFechaEntrega(form.TRHTipoReporte) && !contratoInfo?.TCAFechaEntregaInmueble && (
                  <div className="app-field" style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="global-fecha-entrega">
                      <strong>Fecha de Entrega del Inmueble</strong>
                    </label>
                    <input
                      id="global-fecha-entrega"
                      type="date"
                      value={globalFechaEntrega}
                      onChange={(e) => setGlobalFechaEntrega(e.target.value)}
                      className="app-input"
                    />
                    <small>Debes registrar la Fecha de Entrega para modificar este reporte.</small>
                  </div>
                )}

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
                    {editingReportId ? "Guardar Cambios" : "Añadir a la lista"}
                  </button>
                  {editingReportId && (
                    <button className="app-button app-button--danger" type="button" onClick={cancelEdit}>
                      Cancelar Edición
                    </button>
                  )}
                </div>
              </form>
            </section>
          )}

          {selectedContrato && !contratoBloqueaNegativos() && (
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

      {confirmModal.isOpen && (
        <div className="app-modal-overlay">
          <div className="app-modal app-surface app-modal--info">
            <div className="app-modal-content">
              <h3 className="app-modal-title">Aviso Preventivo</h3>
              <p className="app-modal-message">
                Aviso: Debio haber enviado un SMS o Email al Arrendatario con 20 dias de anticipacion antes de ingresar estos reportes. Por favor, verifique la informacion antes de proceder.
              </p>
              <div className="app-actions app-modal-actions">
                <button type="button" className="app-button app-button--secondary" onClick={() => setConfirmModal({ isOpen: false })}>
                  Cancelar
                </button>
                <button type="button" className="app-button app-button--primary" onClick={executeSubmitAll}>
                  Entendido y Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {pagoModal.isOpen && (
        <div className="app-modal-overlay">
          <div className="app-modal app-surface">
            <div className="app-modal-content">
              <h3 className="app-modal-title">Registrar Pago</h3>
              <form onSubmit={handleSubmitPago} autoComplete="off">
                <div className="app-field">
                  <label htmlFor="pago-valor">Valor Pagado</label>
                  <input
                    id="pago-valor"
                    type="number"
                    name="TRHValorPagado"
                    value={pagoModal.TRHValorPagado}
                    onChange={handlePagoChange}
                    step="0.01"
                    min="0"
                    max={pagoModal.saldo}
                    required
                    className="app-input"
                  />
                </div>
                <div className="app-field">
                  <label htmlFor="pago-fecha">Fecha de Pago</label>
                  <input
                    id="pago-fecha"
                    type="date"
                    name="TRHFechaPago"
                    value={pagoModal.TRHFechaPago}
                    onChange={handlePagoChange}
                    required
                    className="app-input"
                  />
                </div>
                <div className="app-field">
                  <label htmlFor="pago-obs">Observacion</label>
                  <textarea
                    id="pago-obs"
                    name="TRHPobservacion"
                    value={pagoModal.TRHPobservacion}
                    onChange={handlePagoChange}
                    rows="2"
                    className="app-textarea"
                  />
                </div>
                <div className="app-actions app-modal-actions">
                  <button type="button" className="app-button app-button--secondary" onClick={() => setPagoModal({ ...pagoModal, isOpen: false })}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={submitting} className="app-button app-button--primary">
                    {submitting ? "Guardando..." : "Guardar Pago"}
                  </button>
                </div>
              </form>
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
};

export default Reportar;


