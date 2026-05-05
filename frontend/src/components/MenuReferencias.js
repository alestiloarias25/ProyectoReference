import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "./AppShell";
import AppModal from "./AppModal";
import "./MenuReferencias.css";

export default function MenuReferencias() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const roleLabel = localStorage.getItem("role_label") || role;
  
  const [modalAviso, setModalAviso] = useState(false);

  useEffect(() => {
    if (role === "ARRENDADOR") {
      const visto = localStorage.getItem("aviso_habeas_data");
      if (!visto) {
        setModalAviso(true);
        localStorage.setItem("aviso_habeas_data", "true");
      }
    }
  }, [role]);

  const isAdministrador = role === "ADMINISTRADOR";
  const canManageContracts = role === "ADMINISTRADOR" || role === "ARRENDADOR";
  const canReport = role === "ADMINISTRADOR" || role === "ARRENDADOR";
  const canEvaluate = role === "ADMINISTRADOR" || role === "ARRENDADOR" || role === "ARRENDATARIO";
  const canConsultProperties = role === "ADMINISTRADOR" || role === "ARRENDADOR" || role === "ARRENDATARIO";

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
          {role === "ARRENDADOR" && (
            <a 
              href="/docs/modelo_contrato_generico.pdf" 
              download 
              className="app-button app-button--secondary" 
              style={{ marginLeft: "10px", backgroundColor: "#fff", color: "#10243a", border: "1px solid #c9d3dd" }}
            >
              Descargar Modelo de Contrato
            </a>
          )}
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
              <img src="/images/contratos_img_1776796473125.png" alt="Contratos" className="menu-card-img" />
              <div className="menu-card-content">
                <h3>Contratos</h3>
                <p>Administra contratos y bienes inmuebles segun tu perfil.</p>
              </div>
            </div>
          )}

          {canReport && (
            <div className="menu-card" onClick={() => navigate("/reportar")}>
              <img src="/images/reportar_img_1776796486680.png" alt="Reportar Referencias" className="menu-card-img" />
              <div className="menu-card-content">
                <h3>Reportar Referencias</h3>
                <p>Registra referencias asociadas a contratos y personas.</p>
              </div>
            </div>
          )}

          {canEvaluate && (
            <div className="menu-card" onClick={() => navigate("/consultar-puntaje")}>
              <img src="/images/evaluar_img_1776796502218.png" alt="Evaluar Arrendatario" className="menu-card-img" />
              <div className="menu-card-content">
                <h3>Evaluar Arrendatario</h3>
                <p>Consulta el puntaje y evaluacion de riesgo de un arrendatario.</p>
              </div>
            </div>
          )}

          {canManageContracts && (
            <div className="menu-card" onClick={() => navigate("/inmuebles/administrar")}>
              <img src="/images/admin_inmuebles_img_1776796523959.png" alt="Administrar Inmuebles" className="menu-card-img" />
              <div className="menu-card-content">
                <h3>Administrar Inmuebles</h3>
                <p>Crea, edita y sube fotos de tus bienes inmuebles.</p>
              </div>
            </div>
          )}

          {canConsultProperties && (
            <div className="menu-card" onClick={() => navigate("/inmuebles/consultar")}>
              <img src="/images/consultar_inmuebles_img_1776796538233.png" alt="Consultar Inmuebles" className="menu-card-img" />
              <div className="menu-card-content">
                <h3>Consultar Inmuebles</h3>
                <p>Busca inmuebles por dirección y visualiza sus fotos y contacto.</p>
              </div>
            </div>
          )}
        </div>

        {isAdministrador && (
          <div className="menu-featured-wrap">
            <div className="menu-card menu-card--featured" onClick={() => navigate("/administracion")}>
              <img src="/images/admin_panel_img_1776796554162.png" alt="Usuarios Administrador" className="menu-card-img" />
              <div className="menu-card-content">
                <h3>Usuarios Administrador</h3>
                <p>Accede a la gestion centralizada de usuarios, empresas y ciudades con el mismo formato estandarizado.</p>
                <div className="mr-card-tags">
                  <span>Usuarios</span>
                  <span>Empresas</span>
                  <span>Ciudades</span>
                </div>
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

      <AppModal 
        isOpen={modalAviso} 
        title="Alerta sobre Habeas Data" 
        message="Le recordamos que, en cumplimiento de la Ley de Habeas Data, todo tratamiento de datos personales requiere autorización previa y expresa del titular. Asegúrese de incluir las cláusulas pertinentes en sus contratos." 
        type="info" 
        onClose={() => setModalAviso(false)} 
      />
    </AppShell>
  );
}
