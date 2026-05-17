import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/referencias" />;
  }

  // Enforce TPersonas creation for ARRENDADOR
  const personaExists = localStorage.getItem("persona_exists") === "true";
  const currentPath = window.location.pathname;

  if (role === "ARRENDADOR" && !personaExists && currentPath !== "/personas/crear") {
    return <Navigate to="/personas/crear" replace />;
  }

  return children;
};

export default ProtectedRoute;
