import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem("rol");
  const userName = localStorage.getItem("username") || "Usuario";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const menuItems = [
    { path: '/referencias', label: 'Dashboard', icon: '📊' },
    { path: '/reportar', label: 'Reportar Novedad', icon: '📝', roles: ['ADMINISTRADOR', 'ARRENDADOR'] },
    { path: '/contratos/nuevo', label: 'Nuevo Contrato', icon: '📄', roles: ['ADMINISTRADOR', 'ARRENDADOR'] },
    { path: '/consultar-puntaje', label: 'Consultar Puntaje', icon: '🔍' },
    { path: '/administracion', label: 'Panel Admin', icon: '⚙️', roles: ['ADMINISTRADOR'] },
    { path: '/autores', label: 'Autores', icon: '👥', roles: ['ADMINISTRADOR'] },
  ];

  return (
    <div className="main-layout">
      {/* Sidebar */}
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo-icon">R</span>
            <span className="logo-text">Referenciate</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item, index) => {
              if (item.roles && !item.roles.includes(userRole)) return null;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={index}>
                  <button 
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <span className="user-name">{userName}</span>
              <span className="user-role">{userRole}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>Cerrar Sesión</span>
            <span>🚪</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <header className="topbar glass-panel">
          <div className="topbar-title">
            <h2>{menuItems.find(item => item.path === location.pathname)?.label || 'Referenciate'}</h2>
          </div>
          <div className="topbar-actions">
            <button className="notification-btn">🔔</button>
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
