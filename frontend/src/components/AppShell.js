import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./app-shell.css";

const getNavItems = (role) => {
  const items = [];

  if (role === "ADMINISTRADOR" || role === "ARRENDADOR") {
    items.push({ label: "Contratos", path: "/contratos/nuevo" });
    items.push({ label: "Reportar", path: "/reportar" });
  }

  if (
    role === "ADMINISTRADOR" ||
    role === "ARRENDADOR" ||
    role === "ARRENDATARIO"
  ) {
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

  // ============================
  // 🔥 LECTURA ESTABLE DE STORAGE
  // ============================
  const auth = useMemo(() => {
    return {
      role: localStorage.getItem("role"),
      roleLabel: localStorage.getItem("role_label"),
      userName:
        localStorage.getItem("full_name") ||
        localStorage.getItem("user"),
      token: localStorage.getItem("token"),
    };
  }, []);

  const roleLabel = auth.roleLabel || auth.role;
  const token = auth.token;
  const userName = auth.userName;

  // ============================
  // NAV ESTABLE
  // ============================
  const navItems = useMemo(() => {
    return getNavItems(auth.role);
  }, [auth.role]);

  // ============================
  // ⚠️ IMPORTANTE: QUITAMOS DOM MANIPULATION GLOBAL
  // ============================
  // ❌ ESTE BLOQUE YA NO SE USA
  // porque rompe React controlado
  /*
  useEffect(() => {
    const handleInput = (event) => {
      const { target } = event;
      if (!target || !target.tagName) return;

      if (target.hasAttribute("data-no-uppercase")) return;

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

    return () => {
      document.removeEventListener("input", handleInput, true);
    };
  }, []);
  */

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-ui">
      <div className="app-shell">

        {/* HEADER */}
        <header className="app-topbar">
          <button
            className="app-brand"
            type="button"
            onClick={() =>
              navigate(token ? "/referencias" : "/login")
            }
          >
            <img
              className="app-brand-logo"
              src="/images/logo.png"
              alt="RF Logo"
            />

            <span className="app-brand-copy">
              <small>Panel unificado</small>
              <strong>Sistema de Referencias</strong>
            </span>
          </button>

          <div className="app-topbar-tools">

            {token && userName && (
              <span className="app-user-label">
                {userName}
              </span>
            )}

            {token && roleLabel && (
              <span className="app-role-chip">
                {roleLabel}
              </span>
            )}

            {/* NAV */}
            {navItems.length > 0 && (
              <nav className="app-shortcuts">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={`app-nav-link ${isActive(item.path) ? "active" : ""
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            )}

            {/* ACTIONS */}
            <div className="app-toolbar-actions">

              {token && (
                <button
                  type="button"
                  className="app-button app-button--secondary"
                  onClick={() => navigate("/referencias")}
                >
                  Menu
                </button>
              )}

              <button
                type="button"
                className="app-button app-button--ghost"
                onClick={() => window.history.back()}
              >
                Regresar
              </button>

              <button
                type="button"
                className="app-button app-button--ghost"
                onClick={() => window.history.forward()}
              >
                Adelante
              </button>

              {token && (
                <button
                  type="button"
                  className="app-button app-button--danger"
                  onClick={logout}
                >
                  Salir
                </button>
              )}

            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="app-hero">
          <div className="app-hero-copy">
            <span className="app-eyebrow">
              {eyebrow}
            </span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          {heroActions && (
            <div className="app-hero-actions">
              {heroActions}
            </div>
          )}
        </section>

        {/* CONTENT */}
        <main className={`app-content ${contentClassName}`}>
          {children}
        </main>

        {/* FOOTER */}
        <footer className="app-footer">
          Interfaz unificada del sistema de referencias.
        </footer>

      </div>
    </div>
  );
}