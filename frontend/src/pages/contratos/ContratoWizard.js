import React, { useState } from "react";
import PasoPersonas from "./PasoPersonas";
import PasoInmueble from "./PasoInmueble";
import PasoContrato from "./PasoContrato";
import AppShell from "../../components/AppShell";
import "./ContratoWizard.css";

export default function ContratoWizard() {
  const [paso, setPaso] = useState(1);

  const [personaIds, setPersonaIds] = useState([]);
  const [inmuebleId, setInmuebleId] = useState(null);

  const handleContratoExito = () => {
    setPaso(1);
    setPersonaIds([]);
    setInmuebleId(null);
  };

  return (
    <AppShell
      eyebrow="Formulario estandarizado"
      title="Registro de contrato"
      subtitle="Los tres pasos del contrato comparten el mismo menu, colores, superficies y botones del sistema."
    >
      <div className="wizard-shell">
        <div className="wizard-steps">
          <span className={`wizard-step ${paso === 1 ? "wizard-step--active" : ""}`}>1. Personas</span>
          <span className={`wizard-step ${paso === 2 ? "wizard-step--active" : ""}`}>2. Bien inmueble</span>
          <span className={`wizard-step ${paso === 3 ? "wizard-step--active" : ""}`}>3. Contrato</span>
        </div>

        {paso === 1 && (
          <PasoPersonas
            onNext={(personas) => {
              setPersonaIds(personas);
              setPaso(2);
            }}
          />
        )}

        {paso === 2 && (
          <PasoInmueble
            onBack={() => setPaso(1)}
            onSuccess={(id) => {
              setInmuebleId(id);
              setPaso(3);
            }}
          />
        )}

        {paso === 3 && (
          <PasoContrato
            personaIds={personaIds}
            inmuebleId={inmuebleId}
            onBack={() => setPaso(2)}
            onSuccess={handleContratoExito}
          />
        )}
      </div>
    </AppShell>
  );
}
