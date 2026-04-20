import React, { useEffect, useState } from "react";
import axios from "axios";
import AppShell from "../components/AppShell";

const API_BASE = "http://127.0.0.1:8000";

const initialUserForm = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  password: "",
  role: "ARRENDADOR",
};

const initialEmpresaForm = {
  TENit: "",
  TENombre: "",
  TEDireccion: "",
  TECelular: "",
  TETelefono: "",
  TEEmail: "",
  TEContacto: "",
  TEDescripcion: "",
};

const initialCiudadForm = {
  TCNombre: "",
  TCDepartamento: "",
  TCPais: "",
  TCDescripcion: "",
};

const buildAuthConfig = (token) => ({
  headers: {
    Authorization: `Token ${token}`,
    "Content-Type": "application/json",
  },
});

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.error) return data.error;

  const firstKey = Object.keys(data)[0];
  const firstValue = firstKey ? data[firstKey] : null;

  if (Array.isArray(firstValue) && firstValue.length > 0) {
    return `${firstKey}: ${firstValue[0]}`;
  }

  if (typeof firstValue === "string") {
    return `${firstKey}: ${firstValue}`;
  }

  return fallback;
};

export default function AdminPanel() {
  const token = localStorage.getItem("token");
  const currentUsername = localStorage.getItem("user");

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");

  const [users, setUsers] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  const [userForm, setUserForm] = useState(initialUserForm);
  const [empresaForm, setEmpresaForm] = useState(initialEmpresaForm);
  const [ciudadForm, setCiudadForm] = useState(initialCiudadForm);

  const [editingUserId, setEditingUserId] = useState(null);
  const [editingEmpresaId, setEditingEmpresaId] = useState(null);
  const [editingCiudadId, setEditingCiudadId] = useState(null);

  const authConfig = buildAuthConfig(token);

  const showFeedback = (message, type = "success") => {
    setFeedback(message);
    setFeedbackType(type);
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      const [usersRes, empresasRes, ciudadesRes] = await Promise.all([
        axios.get(`${API_BASE}/api/auth/users/`, authConfig),
        axios.get(`${API_BASE}/api/empresas/`, authConfig),
        axios.get(`${API_BASE}/api/ciudades/`, authConfig),
      ]);

      setUsers(usersRes.data || []);
      setEmpresas(empresasRes.data || []);
      setCiudades(ciudadesRes.data || []);
    } catch (error) {
      showFeedback(getErrorMessage(error, "No fue posible cargar la informacion administrativa."), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const resetUserForm = () => {
    setUserForm(initialUserForm);
    setEditingUserId(null);
  };

  const resetEmpresaForm = () => {
    setEmpresaForm(initialEmpresaForm);
    setEditingEmpresaId(null);
  };

  const resetCiudadForm = () => {
    setCiudadForm(initialCiudadForm);
    setEditingCiudadId(null);
  };

  const submitUser = async (event) => {
    event.preventDefault();

    try {
      const payload = { ...userForm, password: userForm.password.trim() };

      if (!editingUserId && !payload.password) {
        showFeedback("La contrasena es obligatoria al crear un usuario.", "error");
        return;
      }

      const url = editingUserId ? `${API_BASE}/api/auth/users/${editingUserId}/` : `${API_BASE}/api/auth/users/`;
      const method = editingUserId ? "put" : "post";
      await axios[method](url, payload, authConfig);

      await loadAll();
      resetUserForm();
      showFeedback(editingUserId ? "Usuario actualizado correctamente." : "Usuario creado correctamente.");
    } catch (error) {
      showFeedback(getErrorMessage(error, "No fue posible guardar el usuario."), "error");
    }
  };

  const submitEmpresa = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        ...empresaForm,
        TEDescripcion: empresaForm.TEDescripcion.trim() || empresaForm.TENombre.trim(),
      };

      const url = editingEmpresaId ? `${API_BASE}/api/empresas/${editingEmpresaId}/` : `${API_BASE}/api/empresas/`;
      const method = editingEmpresaId ? "put" : "post";
      await axios[method](url, payload, authConfig);

      await loadAll();
      resetEmpresaForm();
      showFeedback(editingEmpresaId ? "Empresa actualizada correctamente." : "Empresa creada correctamente.");
    } catch (error) {
      showFeedback(getErrorMessage(error, "No fue posible guardar la empresa."), "error");
    }
  };

  const submitCiudad = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        ...ciudadForm,
        TCDescripcion: ciudadForm.TCDescripcion.trim() || ciudadForm.TCNombre.trim(),
      };

      const url = editingCiudadId ? `${API_BASE}/api/ciudades/${editingCiudadId}/` : `${API_BASE}/api/ciudades/`;
      const method = editingCiudadId ? "put" : "post";
      await axios[method](url, payload, authConfig);

      await loadAll();
      resetCiudadForm();
      showFeedback(editingCiudadId ? "Ciudad actualizada correctamente." : "Ciudad creada correctamente.");
    } catch (error) {
      showFeedback(getErrorMessage(error, "No fue posible guardar la ciudad."), "error");
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Deseas eliminar el usuario ${user.username}?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/auth/users/${user.id}/`, authConfig);
      await loadAll();
      if (editingUserId === user.id) resetUserForm();
      showFeedback("Usuario eliminado correctamente.");
    } catch (error) {
      showFeedback(getErrorMessage(error, "No fue posible eliminar el usuario."), "error");
    }
  };

  const deleteEmpresa = async (empresa) => {
    if (!window.confirm(`Deseas eliminar la empresa ${empresa.TENombre || empresa.TEDescripcion || empresa.TEId}?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/empresas/${empresa.TEId}/`, authConfig);
      await loadAll();
      if (editingEmpresaId === empresa.TEId) resetEmpresaForm();
      showFeedback("Empresa eliminada correctamente.");
    } catch (error) {
      showFeedback(getErrorMessage(error, "No fue posible eliminar la empresa."), "error");
    }
  };

  const deleteCiudad = async (ciudad) => {
    if (!window.confirm(`Deseas eliminar la ciudad ${ciudad.TCNombre || ciudad.TCDescripcion || ciudad.TCId}?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/ciudades/${ciudad.TCId}/`, authConfig);
      await loadAll();
      if (editingCiudadId === ciudad.TCId) resetCiudadForm();
      showFeedback("Ciudad eliminada correctamente.");
    } catch (error) {
      showFeedback(getErrorMessage(error, "No fue posible eliminar la ciudad."), "error");
    }
  };

  return (
    <AppShell
      eyebrow="Administracion"
      title="Panel administrativo"
      subtitle="Usuarios, empresas y ciudades ahora usan el mismo formato de tarjetas, formularios y botones del menu principal."
    >
      {feedback && <div className={`app-message ${feedbackType === "error" ? "app-message--error" : "app-message--success"}`}>{feedback}</div>}

      <section className="app-stat-grid">
        <div className="app-stat">
          <strong>{users.length}</strong>
          <span>Usuarios registrados</span>
        </div>
        <div className="app-stat">
          <strong>{empresas.length}</strong>
          <span>Empresas disponibles</span>
        </div>
        <div className="app-stat">
          <strong>{ciudades.length}</strong>
          <span>Ciudades disponibles</span>
        </div>
      </section>

      {loading ? (
        <div className="app-message app-message--info">Cargando informacion administrativa...</div>
      ) : (
        <>
          <section className="app-surface">
            <div className="app-section-title">
              <h2>Gestion de usuarios</h2>
            </div>
            <form className="app-form-grid" onSubmit={submitUser} autoComplete="off">
              <input autoComplete="off" type="text" placeholder="Usuario" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} required />
              <input autoComplete="off" type="email" placeholder="Correo" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
              <input autoComplete="off" type="text" placeholder="Nombres" value={userForm.first_name} onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })} />
              <input autoComplete="off" type="text" placeholder="Apellidos" value={userForm.last_name} onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })} />
              <input autoComplete="new-password" type="password" placeholder={editingUserId ? "Nueva contrasena opcional" : "Contrasena"} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
              <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                <option value="ADMINISTRADOR">Usuario Administrador</option>
                <option value="ARRENDADOR">Usuario Arrendador</option>
                <option value="ARRENDATARIO">Usuario Arrendatario</option>
              </select>
              <div className="app-actions">
                <button className="app-button app-button--secondary" type="button" onClick={resetUserForm}>Limpiar</button>
                <button className="app-button app-button--primary" type="submit">{editingUserId ? "Guardar cambios" : "Agregar usuario"}</button>
              </div>
            </form>

            <div className="app-table-wrap">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.role_label || user.role_value}</td>
                      <td>
                        <div className="app-inline-actions">
                          <button className="app-table-button" type="button" onClick={() => {
                            setEditingUserId(user.id);
                            setUserForm({
                              username: user.username || "",
                              email: user.email || "",
                              first_name: user.first_name || "",
                              last_name: user.last_name || "",
                              password: "",
                              role: user.role_value || "ARRENDADOR",
                            });
                          }}>Editar</button>
                          <button className="app-table-button app-table-button--danger" type="button" disabled={user.username === currentUsername} onClick={() => deleteUser(user)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="app-surface">
            <div className="app-section-title">
              <h2>Gestion de empresas</h2>
            </div>
            <form className="app-form-grid" onSubmit={submitEmpresa} autoComplete="off">
              <input autoComplete="off" type="text" placeholder="NIT" value={empresaForm.TENit} onChange={(e) => setEmpresaForm({ ...empresaForm, TENit: e.target.value })} />
              <input autoComplete="off" type="text" placeholder="Nombre" value={empresaForm.TENombre} onChange={(e) => setEmpresaForm({ ...empresaForm, TENombre: e.target.value })} />
              <input autoComplete="off" type="text" placeholder="Direccion" value={empresaForm.TEDireccion} onChange={(e) => setEmpresaForm({ ...empresaForm, TEDireccion: e.target.value })} />
              <input autoComplete="off" type="text" placeholder="Celular" value={empresaForm.TECelular} onChange={(e) => setEmpresaForm({ ...empresaForm, TECelular: e.target.value })} />
              <input autoComplete="off" type="text" placeholder="Telefono" value={empresaForm.TETelefono} onChange={(e) => setEmpresaForm({ ...empresaForm, TETelefono: e.target.value })} />
              <input autoComplete="off" type="email" placeholder="Correo" value={empresaForm.TEEmail} onChange={(e) => setEmpresaForm({ ...empresaForm, TEEmail: e.target.value })} />
              <input autoComplete="off" type="text" placeholder="Contacto" value={empresaForm.TEContacto} onChange={(e) => setEmpresaForm({ ...empresaForm, TEContacto: e.target.value })} />
              <input autoComplete="off" type="text" placeholder="Descripcion" value={empresaForm.TEDescripcion} onChange={(e) => setEmpresaForm({ ...empresaForm, TEDescripcion: e.target.value })} />
              <div className="app-actions">
                <button className="app-button app-button--secondary" type="button" onClick={resetEmpresaForm}>Limpiar</button>
                <button className="app-button app-button--primary" type="submit">{editingEmpresaId ? "Guardar empresa" : "Agregar empresa"}</button>
              </div>
            </form>

            <div className="app-table-wrap">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripcion</th>
                    <th>Contacto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empresas.map((empresa) => (
                    <tr key={empresa.TEId}>
                      <td>{empresa.TENombre || "-"}</td>
                      <td>{empresa.TEDescripcion || "-"}</td>
                      <td>{empresa.TEContacto || empresa.TEEmail || "-"}</td>
                      <td>
                        <div className="app-inline-actions">
                          <button className="app-table-button" type="button" onClick={() => {
                            setEditingEmpresaId(empresa.TEId);
                            setEmpresaForm({
                              TENit: empresa.TENit || "",
                              TENombre: empresa.TENombre || "",
                              TEDireccion: empresa.TEDireccion || "",
                              TECelular: empresa.TECelular || "",
                              TETelefono: empresa.TETelefono || "",
                              TEEmail: empresa.TEEmail || "",
                              TEContacto: empresa.TEContacto || "",
                              TEDescripcion: empresa.TEDescripcion || "",
                            });
                          }}>Editar</button>
                          <button className="app-table-button app-table-button--danger" type="button" onClick={() => deleteEmpresa(empresa)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="app-surface">
            <div className="app-section-title">
              <h2>Gestion de ciudades</h2>
            </div>
            <form className="app-form-grid" onSubmit={submitCiudad} autoComplete="off">
              <input autoComplete="off" type="text" placeholder="Nombre" value={ciudadForm.TCNombre} onChange={(e) => setCiudadForm({ ...ciudadForm, TCNombre: e.target.value })} />
              <input autoComplete="off" type="text" placeholder="Departamento" value={ciudadForm.TCDepartamento} onChange={(e) => setCiudadForm({ ...ciudadForm, TCDepartamento: e.target.value })} />
              <input autoComplete="off" type="text" placeholder="Pais" value={ciudadForm.TCPais} onChange={(e) => setCiudadForm({ ...ciudadForm, TCPais: e.target.value })} />
              <input autoComplete="off" type="text" placeholder="Descripcion" value={ciudadForm.TCDescripcion} onChange={(e) => setCiudadForm({ ...ciudadForm, TCDescripcion: e.target.value })} />
              <div className="app-actions">
                <button className="app-button app-button--secondary" type="button" onClick={resetCiudadForm}>Limpiar</button>
                <button className="app-button app-button--primary" type="submit">{editingCiudadId ? "Guardar ciudad" : "Agregar ciudad"}</button>
              </div>
            </form>

            <div className="app-table-wrap">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Departamento</th>
                    <th>Pais</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ciudades.map((ciudad) => (
                    <tr key={ciudad.TCId}>
                      <td>{ciudad.TCNombre || ciudad.TCDescripcion || "-"}</td>
                      <td>{ciudad.TCDepartamento || "-"}</td>
                      <td>{ciudad.TCPais || "-"}</td>
                      <td>
                        <div className="app-inline-actions">
                          <button className="app-table-button" type="button" onClick={() => {
                            setEditingCiudadId(ciudad.TCId);
                            setCiudadForm({
                              TCNombre: ciudad.TCNombre || "",
                              TCDepartamento: ciudad.TCDepartamento || "",
                              TCPais: ciudad.TCPais || "",
                              TCDescripcion: ciudad.TCDescripcion || "",
                            });
                          }}>Editar</button>
                          <button className="app-table-button app-table-button--danger" type="button" onClick={() => deleteCiudad(ciudad)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
