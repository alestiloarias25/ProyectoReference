import { useEffect, useState } from "react";
import axios from "axios";
import AppModal from "../../components/AppModal";

const API_URL = `${process.env.REACT_APP_API_URL || ""}/api/persona/`;
const API_EMPRESAS = `${process.env.REACT_APP_API_URL || ""}/api/empresas/`;
const API_CIUDADES = `${process.env.REACT_APP_API_URL || ""}/api/ciudades/`;

const initialEmpresa = {
  TENit: "",
  TENombre: "",
  TEDireccion: "",
  TECelular: "",
  TETelefono: "",
  TEEmail: "",
  TEContacto: "",
  TEDescripcion: "",
};

const initialCiudad = {
  TCNombre: "",
  TCDepartamento: "",
  TCPais: "",
};

const initialPersonaForm = {
  TPTipoDocumento: "",
  TPNoDocumento: "",
  TPNombres: "",
  TPApellidos: "",
  TPDireccionResidencia: "",
  TPCelular1: "",
  TPCelular2: "",
  TEId: "",
  TCId: "",
  TPBarriosZona: "",
};

export default function PasoPersonas({ onNext }) {
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [showNewEmpresa, setShowNewEmpresa] = useState(false);
  const [showNewCiudad, setShowNewCiudad] = useState(false);
  const [newEmpresa, setNewEmpresa] = useState(initialEmpresa);
  const [newCiudad, setNewCiudad] = useState(initialCiudad);
  const [form, setForm] = useState(initialPersonaForm);
  const [searchingPersona, setSearchingPersona] = useState(false);
  const [searchedPersona, setSearchedPersona] = useState(null);
  const [showCreatePersona, setShowCreatePersona] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
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

  const getEmpresaLabel = (empresa) => {
    const nombre = empresa?.TENombre?.trim();
    const descripcion = empresa?.TEDescripcion?.trim();
    if (nombre && descripcion && nombre !== descripcion) {
      return `${nombre} - ${descripcion}`;
    }
    return nombre || descripcion || `Empresa ${empresa?.TEId ?? ""}`;
  };

  const getCiudadLabel = (ciudad) => {
    const parts = [
      ciudad?.TCNombre?.trim(),
      ciudad?.TCDepartamento?.trim(),
      ciudad?.TCPais?.trim(),
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" - ") : `Ciudad ${ciudad?.TCId ?? ""}`;
  };

  const resetPersonaFlow = () => {
    setForm(initialPersonaForm);
    setSearchedPersona(null);
    setShowCreatePersona(false);
    setSearchMessage("");
    setShowNewEmpresa(false);
    setShowNewCiudad(false);
    setNewEmpresa(initialEmpresa);
    setNewCiudad(initialCiudad);
  };

  const addPersonaToContract = (persona) => {
    if (selectedPersonas.some((item) => item.TPNoDocumento === persona.TPNoDocumento)) {
      showModal("Atención", "Esa persona ya fue agregada al contrato", "error");
      return;
    }
    setSelectedPersonas((prev) => [...prev, persona]);
    resetPersonaFlow();
  };

  useEffect(() => {
    axios
      .get(API_EMPRESAS, { headers: { Authorization: `Token ${token}` } })
      .then((res) => setEmpresas(res.data))
      .catch((err) => console.error("Error cargando empresas", err));

    axios
      .get(API_CIUDADES, { headers: { Authorization: `Token ${token}` } })
      .then((res) => setCiudades(res.data))
      .catch((err) => console.error("Error cargando ciudades", err));

    // Auto-load Arrendador
    const role = localStorage.getItem("role");
    const userDoc = localStorage.getItem("user");
    if (role === "ARRENDADOR" && userDoc) {
      axios
        .get(`${process.env.REACT_APP_API_URL || ""}/api/persona/${userDoc}/`, {
          headers: { Authorization: `Token ${token}` }
        })
        .then((res) => {
          setSelectedPersonas((prev) => {
            if (!prev.some((p) => p.TPNoDocumento === res.data.TPNoDocumento)) {
              return [...prev, res.data];
            }
            return prev;
          });
        })
        .catch((err) => console.error("Error auto-cargando arrendador", err));
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const normalizedValue = typeof value === "string" ? value.toUpperCase() : value;
    setForm((prev) => ({ ...prev, [name]: normalizedValue }));
  };

  const buscarPersona = () => {
    const documento = String((form.TPNoDocumento ?? "")).trim();
    const tipoDocumento = String((form.TPTipoDocumento ?? "")).trim();

    const selectedTipoDocumento = tipoDocumento || document.querySelector('select[name="TPTipoDocumento"]')?.value || "";
    const enteredDocumento = documento || document.querySelector('input[name="TPNoDocumento"]')?.value || "";

    const normalizedTipoDocumento = String(selectedTipoDocumento).trim();
    const normalizedDocumento = String(enteredDocumento).trim();

    if (!normalizedTipoDocumento || !normalizedDocumento) {
      showModal("Atención", "Debes seleccionar el Tipo y digitar el No. de Documento para buscar la persona", "error");
      return;
    }

    if (!tipoDocumento && normalizedTipoDocumento) {
      setForm((prev) => ({ ...prev, TPTipoDocumento: normalizedTipoDocumento }));
    }
    if (!documento && normalizedDocumento) {
      setForm((prev) => ({ ...prev, TPNoDocumento: normalizedDocumento.toUpperCase() }));
    }

    setSearchingPersona(true);
    setSearchedPersona(null);
    setShowCreatePersona(false);
    setSearchMessage("");

    axios
      .get(`${API_URL}verificar/?tipo_documento=${encodeURIComponent(normalizedTipoDocumento)}&no_documento=${encodeURIComponent(normalizedDocumento)}`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        setSearchedPersona(res.data);
        setSearchMessage("Persona encontrada. Puedes agregarla al contrato.");
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setSearchedPersona(null);
          setShowCreatePersona(true);
          setSearchMessage("La persona no existe. Completa los datos para crearla y agregarla al contrato.");
          return;
        }

        showModal("Error al buscar persona", formatApiError(err, "no fue posible consultar el registro"), "error");
      })
      .finally(() => {
        setSearchingPersona(false);
      });
  };

  const crearEmpresa = () => {
    const empresaPayload = {
      ...newEmpresa,
      TEDescripcion: newEmpresa.TEDescripcion.trim() || newEmpresa.TENombre.trim(),
    };

    if (!empresaPayload.TEDescripcion) {
      showModal("Faltan datos", "Debes ingresar al menos el Nombre o la Descripcion de la empresa", "error");
      return;
    }

    axios
      .post(API_EMPRESAS, empresaPayload, {
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
      })
      .then((res) => {
        setEmpresas((prev) => [...prev, res.data]);
        setForm((prev) => ({ ...prev, TEId: res.data.TEId }));
        setNewEmpresa(initialEmpresa);
        setShowNewEmpresa(false);
      })
      .catch((err) => {
        showModal("Error al crear empresa", formatApiError(err, "verifica los datos ingresados"), "error");
      });
  };

  const crearCiudad = () => {
    const ciudadPayload = {
      ...newCiudad,
    };

    if (!ciudadPayload.TCNombre?.trim()) {
      showModal("Faltan datos", "Debes ingresar el nombre de la ciudad", "error");
      return;
    }

    axios
      .post(API_CIUDADES, ciudadPayload, {
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
      })
      .then((res) => {
        setCiudades((prev) => [...prev, res.data]);
        setForm((prev) => ({ ...prev, TCId: res.data.TCId }));
        setNewCiudad(initialCiudad);
        setShowNewCiudad(false);
      })
      .catch((err) => {
        showModal("Error al crear ciudad", formatApiError(err, "verifica los datos ingresados"), "error");
      });
  };

  const guardarPersona = () => {
    if (!form.TEId || !form.TCId) {
      showModal("Faltan datos", "Debes seleccionar una Empresa y una Ciudad", "error");
      return;
    }

    const dataToSend = {
      ...form,
      TPNoDocumento: form.TPNoDocumento.trim(),
      TEId_id: parseInt(form.TEId, 10),
      TCId_id: parseInt(form.TCId, 10),
    };

    axios
      .post(API_URL, dataToSend, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        addPersonaToContract(res.data);
      })
      .catch((err) => {
        showModal("Error al guardar la persona", formatApiError(err, "verifica los datos ingresados"), "error");
      });
  };

  const removePersona = (documento) => {
    const role = localStorage.getItem("role");
    const userDoc = localStorage.getItem("user");
    if (role === "ARRENDADOR" && documento === userDoc) {
      showModal("Atención", "No puedes eliminar tu propio registro de Arrendador en los contratos que creas.", "error");
      return;
    }
    setSelectedPersonas((prev) => prev.filter((persona) => persona.TPNoDocumento !== documento));
  };

  return (
    <div className="wizard-step-content">
      <section className="app-surface">
        <div className="app-section-title">
          <h2>Paso 1. Personas del contrato</h2>
          <p>Busca una persona existente o crea una nueva para formar parte del contrato.</p>
        </div>

        <div className="wizard-form-grid">
          <select name="TPTipoDocumento" value={form.TPTipoDocumento} onChange={handleChange} required>
            <option value="">-- Seleccionar Tipo Documento --</option>
            <option value="CC">CC: CEDULA DE CIUDADANIA</option>
            <option value="CE">CE: CEDULA DE EXTRANJERIA</option>
            <option value="NT">NT: NIT</option>
            <option value="PA">PA: PASAPORTE</option>
            <option value="PR">PR: PERMISO TEMPORAL DE RESIDENCIA</option>
          </select>
          <input
            type="text"
            autoComplete="off"
            name="TPNoDocumento"
            placeholder="No Documento"
            value={form.TPNoDocumento}
            onInput={handleChange}
            maxLength="50"
            required
          />
          <button className="app-button app-button--primary" type="button" onClick={buscarPersona}>
            {searchingPersona ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {searchMessage && (
          <div className={`app-message ${showCreatePersona ? "app-message--info" : "app-message--success"}`}>
            {searchMessage}
          </div>
        )}

        {searchedPersona && (
          <div className="wizard-choice wizard-choice--selected">
            <div>
              <strong>{searchedPersona.TPNombres} {searchedPersona.TPApellidos}</strong>
              <small>{searchedPersona.TPTipoDocumento} - {searchedPersona.TPNoDocumento}</small>
              <small>{searchedPersona.TPDireccionResidencia}</small>
            </div>
            <button className="app-button app-button--primary" type="button" onClick={() => addPersonaToContract(searchedPersona)}>
              Agregar al contrato
            </button>
          </div>
        )}
      </section>

      {showCreatePersona && (
        <section className="app-surface">
          <div className="app-section-title">
            <h2>Nueva persona</h2>
          </div>

          <div className="wizard-form-grid">
            <input autoComplete="off" name="TPNombres" placeholder="Nombres" value={form.TPNombres} onChange={handleChange} />
            <input autoComplete="off" name="TPApellidos" placeholder="Apellidos" value={form.TPApellidos} onChange={handleChange} />
            <input autoComplete="off" name="TPDireccionResidencia" placeholder="Direccion" value={form.TPDireccionResidencia} onChange={handleChange} />
            <input autoComplete="off" name="TPCelular1" placeholder="Celular 1" value={form.TPCelular1} onChange={handleChange} />
            <input autoComplete="off" name="TPCelular2" placeholder="Celular 2" value={form.TPCelular2} onChange={handleChange} />
            <input autoComplete="off" name="TPBarriosZona" placeholder="Barrio / Zona" value={form.TPBarriosZona} onChange={handleChange} />
          </div>

          <div className="app-grid app-grid--2">
            <div className="app-surface">
              <h3>Empresa</h3>
              <div className="wizard-form-grid">
                <select name="TEId" value={form.TEId} onChange={handleChange}>
                  <option value="">-- Seleccionar Empresa --</option>
                  {empresas.map((emp) => (
                    <option key={emp.TEId} value={emp.TEId}>{getEmpresaLabel(emp)}</option>
                  ))}
                </select>
                <button className="app-button app-button--secondary" type="button" onClick={() => setShowNewEmpresa(!showNewEmpresa)}>
                  {showNewEmpresa ? "Cancelar empresa" : "Crear empresa"}
                </button>
              </div>

              {showNewEmpresa && (
                <div className="wizard-form-grid">
                  <input autoComplete="off" type="text" placeholder="NIT" value={newEmpresa.TENit} onChange={(e) => setNewEmpresa({ ...newEmpresa, TENit: e.target.value })} />
                  <input autoComplete="off" type="text" placeholder="Nombre" value={newEmpresa.TENombre} onChange={(e) => setNewEmpresa({ ...newEmpresa, TENombre: e.target.value })} />
                  <input autoComplete="off" type="text" placeholder="Direccion" value={newEmpresa.TEDireccion} onChange={(e) => setNewEmpresa({ ...newEmpresa, TEDireccion: e.target.value })} />
                  <input autoComplete="off" type="text" placeholder="Celular" value={newEmpresa.TECelular} onChange={(e) => setNewEmpresa({ ...newEmpresa, TECelular: e.target.value })} />
                  <input autoComplete="off" type="text" placeholder="Telefono" value={newEmpresa.TETelefono} onChange={(e) => setNewEmpresa({ ...newEmpresa, TETelefono: e.target.value })} />
                  <input autoComplete="off" type="email" placeholder="Email" value={newEmpresa.TEEmail} onChange={(e) => setNewEmpresa({ ...newEmpresa, TEEmail: e.target.value })} />
                  <input autoComplete="off" type="text" placeholder="Contacto" value={newEmpresa.TEContacto} onChange={(e) => setNewEmpresa({ ...newEmpresa, TEContacto: e.target.value })} />
                  <input autoComplete="off" type="text" placeholder="Descripcion" value={newEmpresa.TEDescripcion} onChange={(e) => setNewEmpresa({ ...newEmpresa, TEDescripcion: e.target.value })} />
                  <button className="app-button app-button--primary" type="button" onClick={crearEmpresa}>
                    Guardar empresa
                  </button>
                </div>
              )}
            </div>

            <div className="app-surface">
              <h3>Ciudad</h3>
              <div className="wizard-form-grid">
                <select name="TCId" value={form.TCId} onChange={handleChange}>
                  <option value="">-- Seleccionar Ciudad --</option>
                  {ciudades.map((ciu) => (
                    <option key={ciu.TCId} value={ciu.TCId}>{getCiudadLabel(ciu)}</option>
                  ))}
                </select>
                <button className="app-button app-button--secondary" type="button" onClick={() => setShowNewCiudad(!showNewCiudad)}>
                  {showNewCiudad ? "Cancelar ciudad" : "Crear ciudad"}
                </button>
              </div>

              {showNewCiudad && (
                <div className="wizard-form-grid">
                  <input autoComplete="off" type="text" placeholder="Nombre" value={newCiudad.TCNombre} onChange={(e) => setNewCiudad({ ...newCiudad, TCNombre: e.target.value })} />
                  <input autoComplete="off" type="text" placeholder="Departamento" value={newCiudad.TCDepartamento} onChange={(e) => setNewCiudad({ ...newCiudad, TCDepartamento: e.target.value })} />
                  <input autoComplete="off" type="text" placeholder="Pais" value={newCiudad.TCPais} onChange={(e) => setNewCiudad({ ...newCiudad, TCPais: e.target.value })} />
                  <button className="app-button app-button--primary" type="button" onClick={crearCiudad}>
                    Guardar ciudad
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="app-actions">
            <button className="app-button app-button--primary" type="button" onClick={guardarPersona}>
              Guardar y agregar al contrato
            </button>
            <button className="app-button app-button--secondary" type="button" onClick={resetPersonaFlow}>
              Cancelar
            </button>
          </div>
        </section>
      )}

      <section className="app-surface">
        <div className="app-section-title">
          <h2>Personas agregadas</h2>
          <p>{selectedPersonas.length} persona(s) haran parte del contrato.</p>
        </div>

        {selectedPersonas.length === 0 ? (
          <div className="app-empty-state">
            <strong>Aun no has agregado personas</strong>
            <p>Debes agregar minimo 2 personas para continuar al siguiente paso.</p>
          </div>
        ) : (
          <div className="wizard-choice-list">
            {selectedPersonas.map((persona) => (
              <div key={persona.TPNoDocumento} className="wizard-choice">
                <div>
                  <strong>{persona.TPNombres} {persona.TPApellidos}</strong>
                  <small>{persona.TPTipoDocumento} - {persona.TPNoDocumento}</small>
                </div>
                {localStorage.getItem("role") === "ARRENDADOR" && persona.TPNoDocumento === localStorage.getItem("user") ? (
                  <span className="app-badge app-badge--info">Tú (Propietario)</span>
                ) : (
                  <button className="app-button app-button--danger" type="button" onClick={() => removePersona(persona.TPNoDocumento)}>
                    Quitar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="app-actions">
          <button
            className="app-button app-button--primary"
            type="button"
            disabled={selectedPersonas.length < 2}
            onClick={() => {
              if (selectedPersonas.length < 2) {
                showModal("Atención", "Debes agregar como minimo 2 personas para continuar", "error");
                return;
              }
              onNext(selectedPersonas);
            }}
          >
            Siguiente paso
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


