import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import AppModal from "../components/AppModal";

const API_URL = `${process.env.REACT_APP_API_URL || ""}/api/persona/`;
const API_EMPRESAS = `${process.env.REACT_APP_API_URL || ""}/api/empresas/`;
const API_CIUDADES = `${process.env.REACT_APP_API_URL || ""}/api/ciudades/`;

export default function CrearPersona() {
  const navigate = useNavigate();

  // IMPORTANTE:
  // useMemo evita relecturas innecesarias del localStorage
  const token = localStorage.getItem("token");
  const userDoc = localStorage.getItem("user");

  // =========================
  // FORMULARIO UNIFICADO
  // =========================
  const [formData, setFormData] = useState({
    TPTipoDocumento: "CC",
    TPNoDocumento: userDoc || "",
    TPNombres: "",
    TPApellidos: "",
    TPDireccionResidencia: "",
    TPCelular1: "",
    TPCelular2: "",
    TPBarriosZona: "",
    TEId: "",
    TCId: "",
  });

  const [empresas, setEmpresas] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const [loading, setLoading] = useState(false);

  // =========================
  // DEBUG
  // =========================
  useEffect(() => {
    console.log("CrearPersona MONTADO");

    return () => {
      console.log("CrearPersona DESMONTADO");
    };
  }, []);

  // =========================
  // MODAL
  // =========================
  const showModal = useCallback((title, message, type = "info") => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
    });
  }, []);

  // =========================
  // CARGA INICIAL
  // =========================
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [empresasRes, ciudadesRes] = await Promise.all([
          axios.get(API_EMPRESAS, {
            headers: {
              Authorization: `Token ${token}`,
            },
          }),

          axios.get(API_CIUDADES, {
            headers: {
              Authorization: `Token ${token}`,
            },
          }),
        ]);

        setEmpresas(empresasRes.data || []);
        setCiudades(ciudadesRes.data || []);
      } catch (error) {
        console.error("Error cargando datos:", error);

        showModal(
          "Error",
          "No fue posible cargar empresas o ciudades.",
          "error"
        );
      }
    };

    fetchData();
  }, [token, navigate, showModal]);

  // =========================
  // HANDLE CHANGE UNIVERSAL
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        typeof value === "string"
          ? value.toUpperCase()
          : value,
    }));
  };

  // =========================
  // FORMATEO DE ERRORES API
  // =========================
  const formatApiError = (error, fallbackMessage) => {
    const data = error?.response?.data;

    if (!data) return fallbackMessage;

    if (typeof data === "string") {
      return data;
    }

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

  // =========================
  // VALIDACIÓN
  // =========================
  const validateForm = () => {
    if (!formData.TPNombres.trim()) {
      showModal(
        "Faltan datos",
        "El campo Nombres no puede estar vacío.",
        "error"
      );
      return false;
    }

    if (!formData.TPApellidos.trim()) {
      showModal(
        "Faltan datos",
        "El campo Apellidos no puede estar vacío.",
        "error"
      );
      return false;
    }

    if (!formData.TPDireccionResidencia.trim()) {
      showModal(
        "Faltan datos",
        "El campo Dirección de Residencia no puede estar vacío.",
        "error"
      );
      return false;
    }

    if (!formData.TPCelular1.trim()) {
      showModal(
        "Faltan datos",
        "El campo Celular Principal no puede estar vacío.",
        "error"
      );
      return false;
    }

    if (!formData.TEId || !formData.TCId) {
      showModal(
        "Faltan datos",
        "Debes seleccionar Empresa y Ciudad.",
        "error"
      );
      return false;
    }

    return true;
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const dataToSend = {
      TPTipoDocumento: formData.TPTipoDocumento,
      TPNoDocumento: formData.TPNoDocumento.trim(),
      TPNombres: formData.TPNombres.trim(),
      TPApellidos: formData.TPApellidos.trim(),
      TPDireccionResidencia:
        formData.TPDireccionResidencia.trim(),
      TPCelular1: formData.TPCelular1.trim(),
      TPCelular2: formData.TPCelular2.trim(),
      TPBarriosZona: formData.TPBarriosZona.trim(),
      TEId_id: parseInt(formData.TEId, 10),
      TCId_id: parseInt(formData.TCId, 10),
    };

    try {
      await axios.post(API_URL, dataToSend, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      showModal(
        "Éxito",
        "Perfil de Persona creado correctamente",
        "success"
      );

      // El perfil ha sido creado con éxito, actualizamos la sesión
      localStorage.setItem("persona_exists", "true");

      // LIMPIEZA OPCIONAL
      // SOLO SI QUIERES LIMPIAR DESPUÉS DE GUARDAR

      /*
      setFormData({
        ...formData,
        TPNombres: "",
        TPApellidos: "",
        TPDireccionResidencia: "",
        TPCelular1: "",
        TPCelular2: "",
        TPBarriosZona: "",
        TEId: "",
        TCId: "",
      });
      */

      setTimeout(() => {
        navigate("/referencias");
      }, 1500);

    } catch (err) {

      showModal(
        "Error al guardar",
        formatApiError(
          err,
          "Verifica los datos ingresados"
        ),
        "error"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Completa tu perfil">

      <div
        className="app-surface"
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "lightgreen",
        }}
      >

        <div className="app-section-title">
          <h2>Información Personal Requerida</h2>

          <p>
            Para poder crear contratos y reportes,
            debes completar tu perfil como Arrendador.
          </p>
        </div>

        <div className="app-form" autoComplete="off">

          {/* TIPO DOCUMENTO */}
          <div className="app-field">
            <label>Tipo Documento</label>

            <select
              name="TPTipoDocumento"
              value={formData.TPTipoDocumento}
              onChange={handleChange}
              className="app-select"
            >
              <option value="CC">
                Cédula de Ciudadanía
              </option>

              <option value="CE">
                Cédula de Extranjería
              </option>

              <option value="NT">
                NIT
              </option>

              <option value="PA">
                Pasaporte
              </option>

              <option value="PR">
                Permiso Temporal de Residencia
              </option>
            </select>
          </div>

          {/* DOCUMENTO */}
          <div className="app-field">
            <label>No Documento</label>

            <input
              name="TPNoDocumento"
              value={formData.TPNoDocumento}
              className="app-input"
              readOnly
            />

            <small>
              Este número no se puede modificar.
            </small>
          </div>

          {/* NOMBRES */}
          <div className="app-field">
            <label>Nombres</label>

            <input
              name="TPNombres"
              value={formData.TPNombres}
              onChange={handleChange}
              className="app-input"
              autoComplete="off"
            />
          </div>

          {/* APELLIDOS */}
          <div className="app-field">
            <label>Apellidos</label>

            <input
              name="TPApellidos"
              value={formData.TPApellidos}
              onChange={handleChange}
              className="app-input"
              autoComplete="off"
            />
          </div>

          {/* DIRECCION */}
          <div className="app-field">
            <label>Dirección de Residencia</label>

            <input
              name="TPDireccionResidencia"
              value={formData.TPDireccionResidencia}
              onChange={handleChange}
              className="app-input"
              autoComplete="off"
            />
          </div>

          {/* CELULAR */}
          <div className="app-field">
            <label>Celular Principal</label>

            <input
              name="TPCelular1"
              value={formData.TPCelular1}
              onChange={handleChange}
              className="app-input"
              autoComplete="off"
            />
          </div>

          {/* CELULAR ALTERNO */}
          <div className="app-field">
            <label>Celular Alterno</label>

            <input
              name="TPCelular2"
              value={formData.TPCelular2}
              onChange={handleChange}
              className="app-input"
              autoComplete="off"
            />
          </div>

          {/* BARRIO */}
          <div className="app-field">
            <label>Barrio / Zona</label>

            <input
              name="TPBarriosZona"
              value={formData.TPBarriosZona}
              onChange={handleChange}
              className="app-input"
              autoComplete="off"
            />
          </div>

          {/* EMPRESA */}
          <div className="app-field">
            <label>Empresa</label>

            <select
              name="TEId"
              value={formData.TEId}
              onChange={handleChange}
              className="app-select"
            >
              <option value="">
                -- Seleccionar Empresa --
              </option>

              {empresas.map((emp) => (
                <option
                  key={emp.TEId}
                  value={emp.TEId}
                >
                  {emp.TENombre || `Empresa ${emp.TEId}`}
                </option>
              ))}
            </select>
          </div>

          {/* CIUDAD */}
          <div className="app-field">
            <label>Ciudad</label>

            <select
              name="TCId"
              value={formData.TCId}
              onChange={handleChange}
              className="app-select"
            >
              <option value="">
                -- Seleccionar Ciudad --
              </option>

              {ciudades.map((ciu) => (
                <option
                  key={ciu.TCId}
                  value={ciu.TCId}
                >
                  {ciu.TCNombre || `Ciudad ${ciu.TCId}`}
                </option>
              ))}
            </select>
          </div>

          {/* BOTONES */}
          <div className="app-actions">

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="app-button app-button--primary"
            >
              {loading
                ? "Guardando..."
                : "Guardar Perfil"}
            </button>

          </div>

        </div>
      </div>

      <AppModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() =>
          setModal((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
      />

    </AppShell>
  );
}