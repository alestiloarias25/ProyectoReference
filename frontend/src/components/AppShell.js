import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./app-shell.css";

const getNavItems = (role) => {
  const items = [];

  if (role === "ADMINISTRADOR" || role === "ARRENDADOR") {
    items.push({ label: "Contratos", path: "/contratos/nuevo" });
    items.push({ label: "Reportar", path: "/reportar" });
  }

  if (role === "ADMINISTRADOR" || role === "ARRENDADOR" || role === "ARRENDATARIO") {
    items.push({ label: "Evaluar", path: "/consultar-puntaje" });
  }

  if (role === "ADMINISTRADOR") {
    items.push({ label: "Administracion", path: "/administracion" });
  }

  return items;
};

export default function AppShell({
  eyebrow = "Sistema de Referencias",
  title,
  subtitle,
  children,
  heroActions = null,
  contentClassName = "",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const roleLabel = localStorage.getItem("role_label") || role;
  const userName = localStorage.getItem("full_name") || localStorage.getItem("user");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleInput = (event) => {
      const { target } = event;
      if (!target || !target.tagName) return;
      if (target.hasAttribute('data-no-uppercase')) return;

      const tagName = target.tagName.toUpperCase();
      const type = target.type ? target.type.toLowerCase() : "";

      if (tagName === "INPUT" && (type === "text" || type === "search")) {
        target.value = target.value.toUpperCase();
      }

      if (tagName === "TEXTAREA") {
        target.value = target.value.toUpperCase();
      }
    };

    document.addEventListener("input", handleInput, true);
    return () => document.removeEventListener("input", handleInput, true);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("full_name");
    localStorage.removeItem("role");
    localStorage.removeItem("role_label");
    navigate("/login");
  };

  const navItems = getNavItems(role).filter((item) => item.path !== location.pathname);

  return (
    <div className="app-ui">
      <div className="app-shell">
        <header className="app-topbar">
          <button className="app-brand" type="button" onClick={() => navigate(token ? "/referencias" : "/login")}>
            <img className="app-brand-logo" src="/images/logo.png" alt="RF Logo" />
            <span className="app-brand-copy">
              <small>Panel unificado</small>
              <strong>Sistema de Referencias</strong>
            </span>
          </button>

          <div className="app-topbar-tools">
            {token && userName && <span className="app-user-label">{userName}</span>}
            {token && roleLabel && <span className="app-role-chip">{roleLabel}</span>}

            {navItems.length > 0 && (
              <nav className="app-shortcuts" aria-label="Accesos rapidos">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    className="app-nav-link"
                    type="button"
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            )}

            <div className="app-toolbar-actions">
              {token && (
                <button className="app-button app-button--secondary" type="button" onClick={() => navigate("/referencias")}>
                  Menu
                </button>
              )}
              <button className="app-button app-button--ghost" type="button" onClick={() => window.history.back()}>
                Regresar
              </button>
              <button className="app-button app-button--ghost" type="button" onClick={() => window.history.forward()}>
                Adelante
              </button>
              {token && (
                <button className="app-button app-button--danger" type="button" onClick={logout}>
                  Salir
                </button>
              )}
            </div>
          </div>
        </header>

        <section className="app-hero">
          <div className="app-hero-copy">
            <span className="app-eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {heroActions ? <div className="app-hero-actions">{heroActions}</div> : null}
        </section>

        <main className={`app-content ${contentClassName}`.trim()}>{children}</main>

        <footer className="app-footer">
          Interfaz unificada con la misma navegacion, colores y estilos del menu principal.
        </footer>
      </div>
    </div>
  );
}
