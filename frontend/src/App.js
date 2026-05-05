import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Autores from "./components/Autores";
import MenuReferencias from "./components/MenuReferencias";
import ProtectedRoute from "./components/ProtectedRoute";

import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ContratoWizard from "./pages/contratos/ContratoWizard";
import Reportar from "./pages/Reportar";
import ConsultarPuntajeArrendatario from "./pages/ConsultarPuntajeArrendatario";
import AdminPanel from "./pages/AdminPanel";
import AdministrarBienesInmuebles from "./pages/AdministrarBienesInmuebles";
import ConsultarBienesInmuebles from "./pages/ConsultarBienesInmuebles";
import CrearPersona from "./pages/CrearPersona";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Página raíz */}
        <Route
          path="/"
          element={
            localStorage.getItem("token")
              ? <Navigate to="/referencias" />
              : <Navigate to="/login" />
          }
        />

        {/* Login / Registro / Recuperación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />

        {/* Autores */}
        <Route
          path="/autores"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
              <Autores />
            </ProtectedRoute>
          }
        />

        {/* Menú principal */}
        <Route
          path="/referencias"
          element={
            <ProtectedRoute>
              <MenuReferencias />
            </ProtectedRoute>
          }
        />

        {/* 🔥 NUEVA RUTA: Crear Contrato */}
        <Route
          path="/contratos/nuevo"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR", "ARRENDADOR"]}>
              <ContratoWizard />
            </ProtectedRoute>
          }
        />

        {/* 🔥 NUEVA RUTA: Reportar Novedad */}
        <Route
          path="/reportar"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR", "ARRENDADOR"]}>
              <Reportar />
            </ProtectedRoute>
          }
        />

        {/* 🔥 NUEVA RUTA: Consultar Puntaje del Arrendatario */}
        <Route
          path="/consultar-puntaje"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR", "ARRENDADOR", "ARRENDATARIO"]}>
              <ConsultarPuntajeArrendatario />
            </ProtectedRoute>
          }
        />

        <Route
          path="/administracion"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inmuebles/administrar"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR", "ARRENDADOR"]}>
              <AdministrarBienesInmuebles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/personas/crear"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR", "ARRENDADOR"]}>
              <CrearPersona />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inmuebles/consultar"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR", "ARRENDADOR", "ARRENDATARIO"]}>
              <ConsultarBienesInmuebles />
            </ProtectedRoute>
          }
        />

      </Routes>
      
    </BrowserRouter>
  );
}

export default App;
