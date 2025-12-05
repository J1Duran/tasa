"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrapingStatus, setScrapingStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [maintenanceStatus, setMaintenanceStatus] = useState(null);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [whatsappLinkInput, setWhatsappLinkInput] = useState("");
  const [showWhatsappInput, setShowWhatsappInput] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    try {
      // Try to fetch stats to verify token
      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setAuthenticated(true);
        loadData();
      } else {
        localStorage.removeItem("admin_token");
        router.push("/admin");
      }
    } catch (err) {
      localStorage.removeItem("admin_token");
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    const token = localStorage.getItem("admin_token");

    try {
      // Fetch scraping status
      const statusResponse = await fetch("/api/admin/scraping-status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Fetch statistics
      const statsResponse = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setScrapingStatus(statusData.data);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Fetch maintenance status
      const maintenanceResponse = await fetch("/api/admin/maintenance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (maintenanceResponse.ok) {
        const maintenanceData = await maintenanceResponse.json();
        setMaintenanceStatus(maintenanceData.data);
        setWhatsappLinkInput(maintenanceData.data.whatsappLink || "");
      }
    } catch (err) {
      setError("Error al cargar datos");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin");
  };

  const handleMaintenanceToggle = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setMaintenanceLoading(true);
    try {
      const newStatus = !maintenanceStatus?.active;
      const response = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          active: newStatus,
          whatsappLink: whatsappLinkInput || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMaintenanceStatus(data.data);
        setWhatsappLinkInput(data.data.whatsappLink || "");
      } else {
        setError("Error al actualizar el estado de mantenimiento");
      }
    } catch (err) {
      setError("Error al actualizar el estado de mantenimiento");
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleWhatsappLinkSave = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setMaintenanceLoading(true);
    try {
      const response = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          active: maintenanceStatus?.active || false,
          whatsappLink: whatsappLinkInput,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMaintenanceStatus(data.data);
        setWhatsappLinkInput(data.data.whatsappLink || "");
        setError(null);
        alert("Link de WhatsApp guardado correctamente");
      } else {
        setError("Error al guardar el link de WhatsApp");
      }
    } catch (err) {
      setError("Error al guardar el link de WhatsApp");
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("es-VE");
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="loading">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="container">
      <div className="card">
        <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>📊 Panel de Administración</h1>
            <p>Monitoreo y estadísticas del sistema</p>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Cerrar Sesión
          </button>
        </div>

        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Scraping Status */}
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>
            🔄 Estado del Scraping
          </h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            {scrapingStatus &&
              Object.entries(scrapingStatus).map(([currency, status]) => {
                const isActive = status.active;
                const source = currency === "USDT" ? "Binance P2P" : "PERSE";

                return (
                  <div
                    key={currency}
                    style={{
                      padding: "1.5rem",
                      borderRadius: "8px",
                      border: `2px solid ${isActive ? "#10b981" : "#ef4444"}`,
                      background: isActive ? "#f0fdf4" : "#fef2f2",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                        {currency} ({source})
                      </h3>
                      <span
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: 700,
                          color: isActive ? "#059669" : "#dc2626",
                        }}
                      >
                        {isActive ? "✅ Activo" : "❌ Inactivo"}
                      </span>
                    </div>

                    {status.lastSuccess && (
                      <div style={{ marginTop: "0.75rem", fontSize: "0.875rem" }}>
                        <strong>Último éxito:</strong> {formatDate(status.lastSuccess)}
                        {status.lastData && (
                          <span style={{ marginLeft: "1rem", color: "#059669" }}>
                            ({status.lastData.valor} Bs)
                          </span>
                        )}
                      </div>
                    )}

                    {status.lastError && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          fontSize: "0.875rem",
                          color: "#dc2626",
                        }}
                      >
                        <strong>Último error:</strong> {status.lastError}
                        {status.lastErrorTime && (
                          <span style={{ marginLeft: "0.5rem" }}>
                            ({formatDate(status.lastErrorTime)})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Maintenance Control */}
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>
            🔧 Control de Mantenimiento
          </h2>
          <div
            style={{
              padding: "1.5rem",
              borderRadius: "8px",
              border: `2px solid ${maintenanceStatus?.active ? "#f59e0b" : "#64748b"}`,
              background: maintenanceStatus?.active ? "#fffbeb" : "#f8fafc",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Estado de Mantenimiento
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                  {maintenanceStatus?.active
                    ? "El sitio está actualmente en modo mantenimiento. Los usuarios serán redirigidos a la página de mantenimiento."
                    : "El sitio está activo y accesible para todos los usuarios."}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: maintenanceStatus?.active ? "#f59e0b" : "#64748b",
                  }}
                >
                  {maintenanceStatus?.active ? "🔒 Activo" : "✅ Inactivo"}
                </span>
                <button
                  onClick={handleMaintenanceToggle}
                  disabled={maintenanceLoading || maintenanceStatus === null}
                  className="btn"
                  style={{
                    background: maintenanceStatus?.active ? "#ef4444" : "#10b981",
                    color: "white",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    cursor: maintenanceLoading || maintenanceStatus === null ? "not-allowed" : "pointer",
                    opacity: maintenanceLoading || maintenanceStatus === null ? 0.6 : 1,
                    fontWeight: 600,
                  }}
                >
                  {maintenanceLoading
                    ? "Cargando..."
                    : maintenanceStatus?.active
                    ? "Desactivar Mantenimiento"
                    : "Activar Mantenimiento"}
                </button>
              </div>
            </div>
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                background: "white",
                borderRadius: "6px",
                fontSize: "0.875rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: showWhatsappInput ? "0.75rem" : "0",
                }}
              >
                <div>
                  <strong>Link de WhatsApp:</strong>{" "}
                  {maintenanceStatus?.whatsappLink ? (
                    <code style={{ color: "#3b82f6" }}>{maintenanceStatus.whatsappLink}</code>
                  ) : (
                    <span style={{ color: "#ef4444" }}>No configurado</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowWhatsappInput(!showWhatsappInput);
                    if (!showWhatsappInput) {
                      setWhatsappLinkInput(maintenanceStatus?.whatsappLink || "");
                    }
                  }}
                  className="btn btn-secondary"
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.875rem",
                  }}
                >
                  {showWhatsappInput ? "Cancelar" : "Editar"}
                </button>
              </div>
              {showWhatsappInput && (
                <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column" }}>
                  <input
                    type="text"
                    value={whatsappLinkInput}
                    onChange={(e) => setWhatsappLinkInput(e.target.value)}
                    placeholder="https://wa.me/584123456789"
                    style={{
                      padding: "0.75rem",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      fontSize: "0.875rem",
                      width: "100%",
                    }}
                  />
                  <button
                    onClick={handleWhatsappLinkSave}
                    disabled={maintenanceLoading}
                    className="btn btn-primary"
                    style={{
                      padding: "0.75rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    {maintenanceLoading ? "Guardando..." : "Guardar Link"}
                  </button>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.5rem 0 0 0" }}>
                    Formato: https://wa.me/[NÚMERO] (ej: https://wa.me/584123456789)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visit Statistics */}
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>
            👥 Estadísticas de Visitas
          </h2>
          {stats && (
            <div style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginBottom: "2rem",
                }}
              >
                <div
                  style={{
                    padding: "1.5rem",
                    borderRadius: "8px",
                    background: "#f0f9ff",
                    border: "2px solid #3b82f6",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "2rem", fontWeight: 700, color: "#3b82f6" }}>
                    {stats.total}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                    Total de Visitas
                  </div>
                </div>

                <div
                  style={{
                    padding: "1.5rem",
                    borderRadius: "8px",
                    background: "#f0fdf4",
                    border: "2px solid #10b981",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "2rem", fontWeight: 700, color: "#10b981" }}>
                    {stats.today}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                    Visitas Hoy
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.25rem", margin: 0 }}>
                  Visitas Recientes
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Mostrar:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to page 1 when changing items per page
                    }}
                    style={{
                      padding: "0.5rem",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      fontSize: "0.875rem",
                      background: "white",
                    }}
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>
              
              {/* Pagination Info */}
              {stats.recent && stats.recent.length > 0 && (
                <div style={{ marginBottom: "1rem", fontSize: "0.875rem", color: "#64748b" }}>
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, stats.recent.length)} de {stats.recent.length} visitas
                </div>
              )}

              <div
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  overflowX: "auto",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead
                    style={{
                      background: "var(--background)",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    <tr>
                      <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid var(--border)" }}>
                        Fecha
                      </th>
                      <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid var(--border)" }}>
                        IP
                      </th>
                      <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid var(--border)" }}>
                        Navegador
                      </th>
                      <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid var(--border)" }}>
                        Dispositivo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent && stats.recent.length > 0 ? (
                      (() => {
                        const totalPages = Math.ceil(stats.recent.length / itemsPerPage);
                        const startIndex = (currentPage - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const paginatedVisits = stats.recent.slice(startIndex, endIndex);
                        
                        return paginatedVisits.map((visit, index) => (
                          <tr
                            key={index}
                            style={{
                              borderBottom: "1px solid var(--border)",
                              background: index % 2 === 0 ? "white" : "var(--background)",
                            }}
                          >
                            <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>
                              {formatDate(visit.timestamp)}
                            </td>
                            <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>
                              {visit.ip}
                            </td>
                            <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>
                              {visit.browser?.name} {visit.browser?.version}
                            </td>
                            <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>
                              {visit.device?.type === "mobile" ? "📱" : "💻"}{" "}
                              {visit.os?.name} {visit.os?.version}
                            </td>
                          </tr>
                        ));
                      })()
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                          No hay visitas registradas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {stats.recent && stats.recent.length > itemsPerPage && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginTop: "1rem",
                  }}
                >
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-secondary"
                    style={{
                      opacity: currentPage === 1 ? 0.5 : 1,
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    ← Anterior
                  </button>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                    Página {currentPage} de {Math.ceil(stats.recent.length / itemsPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(Math.ceil(stats.recent.length / itemsPerPage), p + 1))}
                    disabled={currentPage >= Math.ceil(stats.recent.length / itemsPerPage)}
                    className="btn btn-secondary"
                    style={{
                      opacity: currentPage >= Math.ceil(stats.recent.length / itemsPerPage) ? 0.5 : 1,
                      cursor: currentPage >= Math.ceil(stats.recent.length / itemsPerPage) ? "not-allowed" : "pointer",
                    }}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: "2rem" }}>
          <button onClick={loadData} className="btn btn-primary">
            🔄 Actualizar Datos
          </button>
        </div>
      </div>
    </div>
  );
}

