import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "./AppShell";
import "./MenuReferencias.css";

export default function MenuReferencias() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const roleLabel = localStorage.getItem("role_label") || role;

  const isAdministrador = role === "ADMINISTRADOR";
  const canManageContracts = role === "ADMINISTRADOR" || role === "ARRENDADOR";
  const canReport = role === "ADMINISTRADOR" || role === "ARRENDADOR";
  const canEvaluate = role === "ADMINISTRADOR" || role === "ARRENDADOR" || role === "ARRENDATARIO";

  return (
    <AppShell
      eyebrow="Menu principal"
      title="Toma el control de tus referencias"
      subtitle="Centraliza, protege y consulta contratos, referencias y evaluaciones con el mismo lenguaje visual en toda la aplicacion."
      heroActions={
        <>
          <span className="mr-role-pill">Perfil activo: {roleLabel}</span>
          <button className="app-button app-button--primary" type="button" onClick={() => navigate("/consultar-puntaje")}>
            Ingresar al sistema
          </button>
        </>
      }
    >
      <section className="app-surface">
        <div className="app-section-title">
          <h2>Nuestras soluciones</h2>
          <p>Este menu es la referencia visual para el resto de formularios, botones y contenedores del sistema.</p>
        </div>

        <div className={`menu-grid ${isAdministrador ? "menu-grid--admin" : ""}`}>
          {canManageContracts && (
            <div className="menu-card" onClick={() => navigate("/contratos/nuevo")}>
              <h3>Contratos</h3>
              <p>Administra contratos y bienes inmuebles segun tu perfil.</p>
            </div>
          )}

          {canReport && (
            <div className="menu-card" onClick={() => navigate("/reportar")}>
              <h3>Reportar Referencias</h3>
              <p>Registra referencias asociadas a contratos y personas.</p>
            </div>
          )}

          {canEvaluate && (
            <div className="menu-card" onClick={() => navigate("/consultar-puntaje")}>
              <h3>Evaluar Arrendatario</h3>
              <p>Consulta el puntaje y evaluacion de riesgo de un arrendatario.</p>
            </div>
          )}
        </div>

        {isAdministrador && (
          <div className="menu-featured-wrap">
            <div className="menu-card menu-card--featured" onClick={() => navigate("/administracion")}>
              <h3>Usuarios Administrador</h3>
              <p>Accede a la gestion centralizada de usuarios, empresas y ciudades con el mismo formato estandarizado.</p>
              <div className="mr-card-tags">
                <span>Usuarios</span>
                <span>Empresas</span>
                <span>Ciudades</span>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="menu-impact">
        <p>
          <strong>Mas del 80%</strong> de los registros permiten tomar mejores decisiones operativas y administrativas.
        </p>
      </section>
    </AppShell>
  );
}
