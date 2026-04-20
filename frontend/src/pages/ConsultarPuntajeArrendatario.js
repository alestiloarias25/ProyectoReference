import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AppShell from "../components/AppShell";
import "./ConsultarPuntajeArrendatario.css";

const SCORE_SCALE = [
  { nivel: "EXCELENTE", rango: "900 - 1000", color: "#28a745" },
  { nivel: "BUENO", rango: "700 - 899", color: "#17a2b8" },
  { nivel: "REGULAR", rango: "500 - 699", color: "#ffc107" },
  { nivel: "MALO", rango: "300 - 499", color: "#fd7e14" },
  { nivel: "CRITICO", rango: "0 - 299", color: "#dc3545" },
];

const ConsultarPuntajeArrendatario = () => {
  const [documento, setDocumento] = useState("");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const userDoc = localStorage.getItem("user");
  const isArrendatario = userRole === "ARRENDATARIO";

  const buscarPuntaje = useCallback(async (docToSearch) => {
    if (!docToSearch.trim()) {
      setError("Por favor ingresa un numero de documento");
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/referencias/api/consultar-puntaje/por_documento/?tp_no_documento=${docToSearch}`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setResultado(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("No se encontro persona con ese documento");
      } else {
        setError(err.response?.data?.error || "Error al consultar el puntaje");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isArrendatario && userDoc) {
      setDocumento(userDoc);
      buscarPuntaje(userDoc);
    }
  }, [isArrendatario, userDoc, buscarPuntaje]);

  const handleBuscar = (e) => {
    e.preventDefault();
    buscarPuntaje(documento);
  };

  const getNivelInfo = (nivel) => {
    const normalized = (nivel || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();

    const info = {
      EXCELENTE: {
        etiqueta: "Excelente",
        consejo: "Arrendatario de confianza, muy pocas o ninguna deuda registrada.",
      },
      BUENO: {
        etiqueta: "Bueno",
        consejo: "Arrendatario confiable con buen historial de pagos.",
      },
      REGULAR: {
        etiqueta: "Regular",
        consejo: "Arrendatario con algunos problemas, requiere supervision.",
      },
      MALO: {
        etiqueta: "Malo",
        consejo: "Arrendatario problematico, conviene revisar garantias adicionales.",
      },
      CRITICO: {
        etiqueta: "Critico",
        consejo: "Alto riesgo. No se recomienda avanzar sin una validacion extra.",
      },
    };
    return info[normalized] || info.REGULAR;
  };

  const normalizeLevel = (nivel) =>
    (nivel || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();

  const getColorClass = (nivel) => {
    const normalized = normalizeLevel(nivel);

    const colorMap = {
      EXCELENTE: "cp-level--excelente",
      BUENO: "cp-level--bueno",
      REGULAR: "cp-level--regular",
      MALO: "cp-level--malo",
      CRITICO: "cp-level--critico",
    };
    return colorMap[normalized] || "cp-level--regular";
  };

  const getGradeLetter = (nivel) => {
    const normalized = normalizeLevel(nivel);
    const letterMap = {
      EXCELENTE: "E",
      BUENO: "B",
      REGULAR: "R",
      MALO: "M",
      CRITICO: "C",
    };
    return letterMap[normalized] || normalized.charAt(0) || "R";
  };

  const getTextColor = (hexColor) => {
    const normalized = (hexColor || "").replace("#", "");
    if (normalized.length !== 6) {
      return "#10243a";
    }

    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.62 ? "#10243a" : "#ffffff";
  };

  const getNeedleCoordinates = (puntaje) => {
    const safeScore = Math.max(0, Math.min(1000, Number(puntaje) || 0));
    const angle = Math.PI * (safeScore / 1000);
    const radius = 78;

    return {
      x: 100 + radius * Math.cos(angle),
      y: 100 - radius * Math.sin(angle),
    };
  };

  return (
    <AppShell
      eyebrow={isArrendatario ? "Tu evaluacion" : "Consulta estandarizada"}
      title={isArrendatario ? "Mi puntaje de arrendatario" : "Consultar puntaje del arrendatario"}
      subtitle={isArrendatario ? "Consulta tu propio nivel de riesgo y calificacion en el sistema." : "Consulta el nivel de riesgo dentro del mismo formato y colores del menu principal."}
    >
      {!isArrendatario && (
        <section className="app-surface">
          <form onSubmit={handleBuscar} className="cp-search-form" autoComplete="off">
            <div className="app-field">
              <label htmlFor="documento">Numero de documento</label>
              <input
                type="text"
                id="documento"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Ej: 1234567890"
                className="app-input"
                disabled={loading}
              />
            </div>
            <button type="submit" className="app-button app-button--primary" disabled={loading}>
              {loading ? "Buscando..." : "Buscar puntaje"}
            </button>
          </form>

          {error && <div className="app-message app-message--error">{error}</div>}
        </section>
      )}

      {isArrendatario && error && (
        <section className="app-surface">
          <div className="app-message app-message--error">{error}</div>
        </section>
      )}

      {loading && isArrendatario && (
        <div className="app-message app-message--info">Consultando tu evaluacion...</div>
      )}

      {resultado ? (
        <section className={`app-surface cp-result ${getColorClass(resultado.tp_nivel)}`}>
          <div className="cp-summary-grid">
            <div className="cp-score-card">
              <span className="cp-score-label">Puntaje actual</span>
              <strong>{resultado.tp_puntaje}</strong>
              <span>{resultado.tp_porcentaje}% del maximo</span>
            </div>

            <div
              className={`cp-level-card ${getColorClass(resultado.tp_nivel)}`}
              style={{
                backgroundColor: resultado.tp_color,
                color: getTextColor(resultado.tp_color),
              }}
            >
              <span className="cp-score-label">Nivel</span>
              <div className="cp-grade-letter">{getGradeLetter(resultado.tp_nivel)}</div>
              <div className="cp-level-caption">Calificacion asignada</div>
              <span>{resultado.tp_evaluacion || getNivelInfo(resultado.tp_nivel).etiqueta}</span>
            </div>
          </div>

          <div className="cp-gauge-panel">
            <div className="cp-gauge-card">
              <span className="cp-score-label">Indicador tipo aguja</span>
              <div className="cp-gauge-wrap">
                <svg className="cp-gauge-svg" viewBox="0 0 200 120" aria-label="Indicador de puntaje">
                  <defs>
                    <linearGradient id="consultGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#28a745" />
                      <stop offset="25%" stopColor="#17a2b8" />
                      <stop offset="50%" stopColor="#ffc107" />
                      <stop offset="75%" stopColor="#fd7e14" />
                      <stop offset="100%" stopColor="#dc3545" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    stroke="url(#consultGaugeGradient)"
                    strokeWidth="14"
                    fill="none"
                    strokeLinecap="round"
                  />

                  <line
                    x1="100"
                    y1="100"
                    x2={getNeedleCoordinates(resultado.tp_puntaje).x}
                    y2={getNeedleCoordinates(resultado.tp_puntaje).y}
                    stroke="#10243a"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="100" r="7" fill="#10243a" />

                  <text x="20" y="116" fontSize="11" textAnchor="middle" fill="#5b7288">1000</text>
                  <text x="100" y="18" fontSize="11" textAnchor="middle" fill="#5b7288">500</text>
                  <text x="180" y="116" fontSize="11" textAnchor="middle" fill="#5b7288">0</text>
                </svg>

                <div className="cp-gauge-center">
                  <strong>{resultado.tp_puntaje}</strong>
                  <span>{resultado.tp_porcentaje}%</span>
                </div>
              </div>
            </div>

            <div className="cp-scale-card">
              <span className="cp-score-label">Escala aplicada</span>
              <div className="cp-scale-list">
                {SCORE_SCALE.map((item) => (
                  <div
                    key={item.nivel}
                    className={`cp-scale-item ${normalizeLevel(resultado.tp_nivel) === item.nivel ? "is-active" : ""}`}
                  >
                    <span className="cp-scale-swatch" style={{ backgroundColor: item.color }} />
                    <div>
                      <strong>{item.nivel}</strong>
                      <span>{item.rango}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cp-scale-values">
                <span>1000</span>
                <span>900</span>
                <span>700</span>
                <span>500</span>
                <span>300</span>
                <span>0</span>
              </div>
            </div>
          </div>

          <div className="app-grid app-grid--2">
            <div className="cp-panel">
              <h3>Informacion del arrendatario</h3>
              <div className="cp-info-list">
                <div><strong>Documento:</strong> {resultado.tp_tipo_documento} - {resultado.tp_no_documento}</div>
                <div><strong>Nombres:</strong> {resultado.tp_nombres}</div>
                <div><strong>Apellidos:</strong> {resultado.tp_apellidos}</div>
                <div><strong>Celular:</strong> {resultado.tp_celular || "N/A"}</div>
                <div><strong>Direccion:</strong> {resultado.tp_direccion || "N/A"}</div>
              </div>
            </div>

            <div className="cp-panel">
              <h3>Evaluacion detallada</h3>
              <div className="cp-info-list">
                <div><strong>Rango:</strong> {resultado.tp_valor_initial} - {resultado.tp_valor_final}</div>
                
                {resultado.tp_comentario && <div><strong>Comentario:</strong> {resultado.tp_comentario}</div>}
              </div>
            </div>
          </div>

          {!isArrendatario && (
            <div className="app-actions">
              <button
                className="app-button app-button--primary"
                type="button"
                onClick={() => {
                  setDocumento("");
                  setResultado(null);
                }}
              >
                Nueva consulta
              </button>
            </div>
          )}
        </section>
      ) : (
        !error &&
        !loading &&
        !isArrendatario && (
          <div className="app-empty-state">
            <strong>Ingresa un numero de documento</strong>
            <p>Consulta el puntaje y la evaluacion del arrendatario sin salir del mismo sistema visual.</p>
          </div>
        )
      )}
    </AppShell>
  );
};

export default ConsultarPuntajeArrendatario;
