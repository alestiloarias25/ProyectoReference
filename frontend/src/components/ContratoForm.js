import { useState } from "react";
import axios from "axios";

export default function ContratoForm() {

  // ===============================
  // ESTADOS
  // ===============================
  const [contratoId, setContratoId] = useState(null);

  const [contrato, setContrato] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    canon: ""
  });

  const [persona, setPersona] = useState({
    documento: "",
    tipo: "Arrendatario"
  });

  // ===============================
  // HANDLERS
  // ===============================
  const handleContratoChange = (e) => {
    setContrato({
      ...contrato,
      [e.target.name]: e.target.value
    });
  };

  const handlePersonaChange = (e) => {
    setPersona({
      ...persona,
      [e.target.name]: e.target.value
    });
  };

  // ===============================
  // CREAR CONTRATO
  // ===============================
  const crearContrato = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || ""}/api/contratos/`,
        contrato,
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`
          }
        }
      );

      setContratoId(res.data.id);
      alert("Contrato creado correctamente");

    } catch (error) {
      console.error(error.response?.data);
      alert("Error al crear contrato");
    }
  };

  // ===============================
  // AGREGAR PERSONA AL CONTRATO
  // ===============================
  const agregarPersona = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL || ""}/api/contrato-personas/`,
        {
          contrato: contratoId,
          persona: persona.documento,
          TCARTipoParticipacion: persona.tipo
        },
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`
          }
        }
      );

      alert("Persona agregada al contrato");

      setPersona({
        documento: "",
        tipo: "Arrendatario"
      });

    } catch (error) {
      console.error(error.response?.data);
      alert("Error al agregar persona");
    }
  };

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="form-container">

      <h2>Crear contrato</h2>

      <form onSubmit={crearContrato}>
        <input
          type="date"
          name="fecha_inicio"
          value={contrato.fecha_inicio}
          onChange={handleContratoChange}
          required
        />

        <input
          type="date"
          name="fecha_fin"
          value={contrato.fecha_fin}
          onChange={handleContratoChange}
          required
        />

        <input
          type="number"
          name="canon"
          placeholder="Canon mensual"
          value={contrato.canon}
          onChange={handleContratoChange}
          required
        />

        <button type="submit">
          Guardar contrato
        </button>
      </form>

      {/* ========================= */}
      {/* PERSONAS DEL CONTRATO */}
      {/* ========================= */}
      {contratoId && (
        <>
          <hr />
          <h3>Agregar personas al contrato</h3>

          <input
            name="documento"
            placeholder="Documento persona"
            value={persona.documento}
            onChange={handlePersonaChange}
          />

          <select
            name="tipo"
            value={persona.tipo}
            onChange={handlePersonaChange}
          >
            <option value="Arrendador">Arrendador</option>
            <option value="Arrendatario">Arrendatario</option>
            <option value="Codeudor">Codeudor</option>
          </select>

          <button onClick={agregarPersona}>
            Agregar persona
          </button>
        </>
      )}

    </div>
  );
}


