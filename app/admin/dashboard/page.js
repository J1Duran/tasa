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
    } catch (err) {
      setError("Error al cargar datos");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin");
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

              <h3 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
                Visitas Recientes (últimas 50)
              </h3>
              <div
                style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
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
                      <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid var(--border)" }}>
                        Path
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent && stats.recent.length > 0 ? (
                      stats.recent.map((visit, index) => (
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
                          <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>
                            {visit.path}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                          No hay visitas registradas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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

