import React, { useEffect, useState } from "react";
import axios from "axios";
import AppModal from "../../components/AppModal";

const API_INMUEBLES = "http://127.0.0.1:8000/api/bienesinmuebles/";
const API_CIUDADES = "http://127.0.0.1:8000/api/ciudades/";

const initialSearch = {
  TBNoMatricula: "",
  TBDireccion: "",
};

const initialForm = {
  TBNoMatricula: "",
  TBDireccion: "",
  TCId: "",
  TBTipo: "",
  TBObs: "",
};

export default function PasoInmueble({ onSuccess, onBack }) {
  const [form, setForm] = useState(initialForm);
  const [searchForm, setSearchForm] = useState(initialSearch);
  const [inmuebles, setInmuebles] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [inmuebleSeleccionado, setInmuebleSeleccionado] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });

  const showModal = (title, message, type = "info") => {
    setModal({ isOpen: true, title, message, type });
  };

  const token = localStorage.getItem("token");

  const formatApiError = (error, fallbackMessage) => {
    const data = error?.response?.data;
    if (!data) return fallbackMessage;
    if (typeof data === "string") return data;

    const firstKey = Object.keys(data)[0];
    const firstValue = firstKey ? data[firstKey] : null;

    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return `${firstKey}: ${firstValue[0]}`;
    }

    if (typeof firstValue === "string") {
      return `${firstKey}: ${firstValue}`;
    }

    return fallbackMessage;
  };

  const getCiudadLabel = (ciudad) => {
    const parts = [ciudad?.TCNombre?.trim(), ciudad?.TCDepartamento?.trim(), ciudad?.TCPais?.trim()].filter(Boolean);
    return parts.length > 0 ? parts.join(" - ") : `Ciudad ${ciudad?.TCId ?? ""}`;
  };

  const resetSearchFlow = () => {
    setSearchResults([]);
    setSearchMessage("");
    setShowCreateForm(false);
    setForm(initialForm);
  };

  useEffect(() => {
    if (!token) {
      setError("No estas logueado. Inicia sesion primero.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      axios.get(API_INMUEBLES, { headers: { Authorization: `Token ${token}` } }),
      axios.get(API_CIUDADES, { headers: { Authorization: `Token ${token}` } }),
    ])
      .then(([inmueblesRes, ciudadesRes]) => {
        setInmuebles(inmueblesRes.data || []);
        setCiudades(ciudadesRes.data || []);
      })
      .catch((err) => {
        setError(formatApiError(err, "No fue posible cargar los inmuebles"));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchForm((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  const buscarInmueble = () => {
    const rawMatricula = String(searchForm.TBNoMatricula ?? "").trim();
    const rawDireccion = String(searchForm.TBDireccion ?? "").trim();

    const actualMatricula = rawMatricula || document.querySelector('input[name="TBNoMatricula"]')?.value || "";
    const actualDireccion = rawDireccion || document.querySelector('input[name="TBDireccion"]')?.value || "";

    const matricula = actualMatricula.trim().toLowerCase();
    const direccion = actualDireccion.trim().toLowerCase();

    if (!matricula && !direccion) {
      showModal("Atención", "Debes ingresar la Matricula, la Direccion o ambas para buscar", "error");
      return;
    }

    if (!rawMatricula && actualMatricula) {
      setSearchForm((prev) => ({ ...prev, TBNoMatricula: actualMatricula.toUpperCase() }));
    }
    if (!rawDireccion && actualDireccion) {
      setSearchForm((prev) => ({ ...prev, TBDireccion: actualDireccion.toUpperCase() }));
    }

    setSearching(true);
    setInmuebleSeleccionado(null);
    setSearchResults([]);
    setSearchMessage("");
    setShowCreateForm(false);

    const results = inmuebles.filter((item) => {
      const matchesMatricula = !matricula || item.TBNoMatricula?.toLowerCase().includes(matricula);
      const matchesDireccion = !direccion || item.TBDireccion?.toLowerCase().includes(direccion);
      return matchesMatricula && matchesDireccion;
    });

    setSearchResults(results);

    if (results.length > 0) {
      setSearchMessage(`Se encontraron ${results.length} inmueble(s). Selecciona el que hara parte del contrato.`);
    } else {
      setShowCreateForm(true);
      setForm((prev) => ({
        ...prev,
        TBNoMatricula: searchForm.TBNoMatricula.trim(),
        TBDireccion: searchForm.TBDireccion.trim(),
      }));
      setSearchMessage("No existe un inmueble con esos datos. Completa el formulario para crearlo.");
    }

    setSearching(false);
  };

  const guardarInmueble = async () => {
    if (!form.TBNoMatricula || !form.TBDireccion || !form.TCId || !form.TBTipo) {
      showModal("Faltan datos", "Llene todos los campos requeridos: Matricula, Direccion, Ciudad y Tipo", "error");
      return;
    }

    try {
      const payload = {
        ...form,
        TBNoMatricula: form.TBNoMatricula.trim(),
        TBDireccion: form.TBDireccion.trim(),
      };

      const res = await axios.post(API_INMUEBLES, payload, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      const nuevoInmueble = res.data;
      setInmuebles((prev) => [...prev, nuevoInmueble]);
      setInmuebleSeleccionado(nuevoInmueble);
      setSearchResults([nuevoInmueble]);
      setShowCreateForm(false);
      setSearchMessage("Inmueble creado y seleccionado para el contrato.");
      setSearchForm({
        TBNoMatricula: nuevoInmueble.TBNoMatricula,
        TBDireccion: nuevoInmueble.TBDireccion,
      });
      setForm(initialForm);
    } catch (err) {
      showModal("Error al guardar inmueble", formatApiError(err, "verifica los datos ingresados"), "error");
    }
  };

  const continuar = () => {
    if (!inmuebleSeleccionado?.id) {
      showModal("Atención", "Debes seleccionar un inmueble valido", "error");
      return;
    }
    onSuccess(inmuebleSeleccionado.id);
  };

  return (
    <div className="wizard-step-content">
      <section className="app-surface">
        <div className="app-section-title">
          <h2>Paso 2. Bien inmueble</h2>
          <p>Busca un inmueble existente o crea uno nuevo como objeto del contrato.</p>
        </div>

        <div className="wizard-form-grid">
          <input
            autoComplete="off"
            name="TBNoMatricula"
            placeholder="Numero de Matricula"
            value={searchForm.TBNoMatricula}
            onInput={handleSearchChange}
          />
          <input
            autoComplete="off"
            name="TBDireccion"
            placeholder="Direccion"
            value={searchForm.TBDireccion}
            onInput={handleSearchChange}
          />
          <button className="app-button app-button--primary" type="button" onClick={buscarInmueble}>
            {searching ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {loading && <div className="app-message app-message--info">Cargando inmuebles...</div>}
        {error && <div className="app-message app-message--error">{error}</div>}
        {searchMessage && <div className="app-message app-message--success">{searchMessage}</div>}

        {searchResults.length > 0 && (
          <div className="wizard-choice-list">
            {searchResults.map((item) => (
              <div
                key={item.id}
                className={`wizard-choice ${inmuebleSeleccionado?.id === item.id ? "wizard-choice--selected" : ""}`}
              >
                <div>
                  <strong>{item.TBNoMatricula}</strong>
                  <small>{item.TBDireccion}</small>
                  <small>{item.TBTipo} - Ciudad {item.TCId}</small>
                </div>
                <button className="app-button app-button--primary" type="button" onClick={() => setInmuebleSeleccionado(item)}>
                  Seleccionar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {showCreateForm && (
        <section className="app-surface">
          <div className="app-section-title">
            <h2>Nuevo bien inmueble</h2>
          </div>

          <div className="wizard-form-grid">
            <input autoComplete="off" name="TBNoMatricula" placeholder="Numero de Matricula" value={form.TBNoMatricula} onInput={handleFormChange} />
            <input autoComplete="off" name="TBDireccion" placeholder="Direccion" value={form.TBDireccion} onInput={handleFormChange} />
            <select name="TCId" value={form.TCId} onChange={handleFormChange}>
              <option value="">-- Seleccionar Ciudad --</option>
              {ciudades.map((ciu) => (
                <option key={ciu.TCId} value={ciu.TCId}>{getCiudadLabel(ciu)}</option>
              ))}
            </select>
            <select name="TBTipo" value={form.TBTipo} onChange={handleFormChange}>
              <option value="">Tipo de Inmueble</option>
              <option value="RESIDENCIAL">RESIDENCIAL</option>
              <option value="COMERCIAL">COMERCIAL</option>
              <option value="INDUSTRIAL">INDUSTRIAL</option>
            </select>
            <textarea name="TBObs" placeholder="Observaciones" value={form.TBObs} onInput={handleFormChange} />
          </div>

          <div className="app-actions">
            <button className="app-button app-button--primary" type="button" onClick={guardarInmueble}>
              Guardar y seleccionar inmueble
            </button>
            <button className="app-button app-button--secondary" type="button" onClick={resetSearchFlow}>
              Cancelar
            </button>
          </div>
        </section>
      )}

      {inmuebleSeleccionado && (
        <section className="app-surface">
          <div className="app-section-title">
            <h2>Bien inmueble seleccionado</h2>
          </div>
          <div className="wizard-summary">
            <div><strong>Matricula:</strong> {inmuebleSeleccionado.TBNoMatricula}</div>
            <div><strong>Direccion:</strong> {inmuebleSeleccionado.TBDireccion}</div>
            <div><strong>Tipo:</strong> {inmuebleSeleccionado.TBTipo}</div>
            <div><strong>Ciudad:</strong> {inmuebleSeleccionado.TCId}</div>
          </div>
        </section>
      )}

      <section className="app-surface">
        <div className="app-actions">
          <button className="app-button app-button--secondary" type="button" onClick={onBack}>
            Regresar a Personas
          </button>
          <button className="app-button app-button--primary" type="button" onClick={continuar} disabled={!inmuebleSeleccionado?.id}>
            Seguir a Contrato
          </button>
        </div>
      </section>

      <AppModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
    </div>
  );
}
