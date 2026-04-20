import React from "react";
import { Link } from "react-router-dom";
import "./app-shell.css";

export default function AuthShell({ eyebrow, title, subtitle, children, footerLinks = [] }) {
  return (
    <div className="app-ui app-ui--auth">
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-brand">
            <span className="app-brand-mark">RF</span>
            <div className="app-brand-copy">
              <small>Acceso unificado</small>
              <strong>Sistema de Referencias</strong>
            </div>
          </div>

          <span className="app-eyebrow">{eyebrow}</span>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>

          <div className="auth-body">{children}</div>

          {footerLinks.length > 0 && (
            <div className="auth-links">
              {footerLinks.map((link) => (
                <Link key={link.to} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
