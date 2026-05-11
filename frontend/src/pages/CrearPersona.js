import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import AppModal from "../components/AppModal";

const API_URL = `${process.env.REACT_APP_API_URL || ""}/api/persona/`;
const API_EMPRESAS = `${process.env.REACT_APP_API_URL || ""}/api/empresas/`;
const API_CIUDADES = `${process.env.REACT_APP_API_URL || ""}/api/ciudades/`;

export default function CrearPersona() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userDoc = localStorage.getItem("user");

  const [form, setForm] = useState({
    TPTipoDocumento: "CC",
    TPNoDocumento: userDoc || "",
    TPNombres: "",
    TPApellidos: "",
    TPDireccionResidencia: "",
    TPCelular1: "",
    TPCelular2: "",
    TEId: "",
    TCId: "",
    TPBarriosZona: "",
  });

  const [empresas, setEmpresas] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });
  const [loading, setLoading] = useState(false);

  const showModal = (title, message, type = "info") => {
    setModal({ isOpen: true, title, message, type });
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(API_EMPRESAS, { headers: { Authorization: `Token ${token}` } })
      .then((res) => setEmpresas(res.data))
      .catch((err) => console.error("Error cargando empresas", err));

    axios
      .get(API_CIUDADES, { headers: { Authorization: `Token ${token}` } })
      .then((res) => setCiudades(res.data))
      .catch((err) => console.error("Error cargando ciudades", err));
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value.toUpperCase() });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.TEId || !form.TCId) {
      showModal("Faltan datos", "Debes seleccionar una Empresa y una Ciudad", "error");
      return;
    }

    setLoading(true);

    const dataToSend = {
      ...form,
      TPNoDocumento: form.TPNoDocumento.trim(),
      TEId_id: parseInt(form.TEId, 10),
      TCId_id: parseInt(form.TCId, 10),
    };

    try {
      await axios.post(API_URL, dataToSend, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      showModal("Éxito", "Perfil de Persona creado correctamente", "success");
      setTimeout(() => navigate("/referencias"), 1500);
    } catch (err) {
      showModal("Error al guardar la persona", formatApiError(err, "Verifica los datos ingresados"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Completa tu perfil">
      <div className="app-surface" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div className="app-section-title">
          <h2>Información Personal Requerida</h2>
          <p>Para poder crear contratos y reportes, debes completar tu perfil como Arrendador.</p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="app-field">
            <label>Tipo Documento</label>
            <select name="TPTipoDocumento" value={form.TPTipoDocumento} onChange={handleChange} className="app-select" required>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="NT">NIT</option>
              <option value="PA">Pasaporte</option>
              <option value="PR">Permiso Temporal de Residencia</option>
            </select>
          </div>

          <div className="app-field">
            <label>No Documento</label>
            <input name="TPNoDocumento" value={form.TPNoDocumento} className="app-input" readOnly />
            <small>Este número no se puede modificar.</small>
          </div>

          <div className="app-field">
            <label>Nombres</label>
            <input name="TPNombres" value={form.TPNombres} onChange={handleChange} className="app-input" required />
          </div>

          <div className="app-field">
            <label>Apellidos</label>
            <input name="TPApellidos" value={form.TPApellidos} onChange={handleChange} className="app-input" required />
          </div>

          <div className="app-field">
            <label>Dirección de Residencia</label>
            <input name="TPDireccionResidencia" value={form.TPDireccionResidencia} onChange={handleChange} className="app-input" required />
          </div>

          <div className="app-field">
            <label>Celular Principal</label>
            <input name="TPCelular1" value={form.TPCelular1} onChange={handleChange} className="app-input" required />
          </div>

          <div className="app-field">
            <label>Celular Alterno</label>
            <input name="TPCelular2" value={form.TPCelular2} onChange={handleChange} className="app-input" />
          </div>

          <div className="app-field">
            <label>Barrio / Zona</label>
            <input name="TPBarriosZona" value={form.TPBarriosZona} onChange={handleChange} className="app-input" />
          </div>

          <div className="app-field">
            <label>Empresa</label>
            <select name="TEId" value={form.TEId} onChange={handleChange} className="app-select" required>
              <option value="">-- Seleccionar Empresa --</option>
              {empresas.map((emp) => (
                <option key={emp.TEId} value={emp.TEId}>{emp.TENombre || `Empresa ${emp.TEId}`}</option>
              ))}
            </select>
          </div>

          <div className="app-field">
            <label>Ciudad</label>
            <select name="TCId" value={form.TCId} onChange={handleChange} className="app-select" required>
              <option value="">-- Seleccionar Ciudad --</option>
              {ciudades.map((ciu) => (
                <option key={ciu.TCId} value={ciu.TCId}>{ciu.TCNombre || `Ciudad ${ciu.TCId}`}</option>
              ))}
            </select>
          </div>

          <div className="app-actions">
            <button type="submit" disabled={loading} className="app-button app-button--primary">
              {loading ? "Guardando..." : "Guardar Perfil"}
            </button>
          </div>
        </form>
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
}


