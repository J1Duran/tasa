"use client";

import { useState, useEffect } from "react";
import {
  obtenerRegistros,
  eliminarRegistro,
  eliminarRegistrosPorMes,
  obtenerRegistrosPorMes,
  obtenerEstadisticasMensuales,
  obtenerMesesDisponibles,
  eliminarTodosLosRegistros,
} from "@/lib/usdt-registros";

export default function RegistrosUSDT({ onClose }) {
  const [registros, setRegistros] = useState([]);
  const [mesesDisponibles, setMesesDisponibles] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState(null);
  const [añoSeleccionado, setAñoSeleccionado] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(null);

  // Cargar registros al montar
  useEffect(() => {
    cargarRegistros();
  }, []);

  // Actualizar registros cuando cambia el mes seleccionado
  useEffect(() => {
    if (mesSeleccionado && añoSeleccionado) {
      const registrosMes = obtenerRegistrosPorMes(mesSeleccionado, añoSeleccionado);
      setRegistros(registrosMes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
      setEstadisticas(obtenerEstadisticasMensuales(mesSeleccionado, añoSeleccionado));
    } else {
      setRegistros([]);
      setEstadisticas(null);
    }
  }, [mesSeleccionado, añoSeleccionado]);

  const cargarRegistros = () => {
    const meses = obtenerMesesDisponibles();
    setMesesDisponibles(meses);
    
    if (meses.length > 0) {
      const ultimoMes = meses[0];
      setMesSeleccionado(ultimoMes.mes);
      setAñoSeleccionado(ultimoMes.año);
    }
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getMonthName = (mes) => {
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return meses[mes - 1];
  };

  const handleEliminarRegistro = (id) => {
    if (confirm("¿Estás seguro de eliminar este registro?")) {
      eliminarRegistro(id);
      cargarRegistros();
    }
  };

  const handleEliminarMes = () => {
    if (
      confirm(
        `¿Estás seguro de eliminar todos los registros de ${getMonthName(mesSeleccionado)} ${añoSeleccionado}?`
      )
    ) {
      eliminarRegistrosPorMes(mesSeleccionado, añoSeleccionado);
      cargarRegistros();
    }
  };

  const handleEliminarTodos = () => {
    if (
      confirm(
        "¿Estás seguro de eliminar TODOS los registros? Esta acción no se puede deshacer."
      )
    ) {
      eliminarTodosLosRegistros();
      cargarRegistros();
      setMesSeleccionado(null);
      setAñoSeleccionado(null);
    }
  };

  if (mesesDisponibles.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)" }}>
          📝 No hay registros guardados
        </p>
        <p style={{ marginTop: "0.5rem", color: "var(--text-secondary)" }}>
          Marca el checkbox "Registrar esta consulta" al calcular USDT para guardar tus consultas.
        </p>
      </div>
    );
  }

  return (
    <div>

      {/* Selector de mes */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <label
          style={{
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Filtrar por mes:
        </label>
        <select
          value={
            mesSeleccionado && añoSeleccionado
              ? `${añoSeleccionado}-${mesSeleccionado}`
              : ""
          }
          onChange={(e) => {
            const [año, mes] = e.target.value.split("-");
            setAñoSeleccionado(parseInt(año));
            setMesSeleccionado(parseInt(mes));
          }}
          style={{
            flex: 1,
            padding: "0.75rem",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            fontSize: "1rem",
            backgroundColor: "var(--background)",
            color: "var(--text-primary)",
            minWidth: "200px",
          }}
        >
          {mesesDisponibles.map((mes) => (
            <option
              key={`${mes.año}-${mes.mes}`}
              value={`${mes.año}-${mes.mes}`}
            >
              {getMonthName(mes.mes)} {mes.año}
            </option>
          ))}
        </select>
        {mesSeleccionado && (
          <button
            onClick={handleEliminarMes}
            className="btn btn-secondary"
            style={{ padding: "0.75rem 1rem" }}
          >
            🗑️ Eliminar mes
          </button>
        )}
      </div>

      {/* Estadísticas del mes */}
      {estadisticas && estadisticas.totalConsultas > 0 && (
        <div
          style={{
            backgroundColor: "var(--background)",
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            border: "1px solid var(--border)",
          }}
        >
          <h4 style={{ marginBottom: "1.25rem", fontSize: "1.25rem", fontWeight: 600 }}>
            📈 Estadísticas de {getMonthName(mesSeleccionado)} {añoSeleccionado}
          </h4>

          {/* Sección: Operaciones */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h5
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Operaciones
            </h5>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "1rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Total consultas
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                  {estadisticas.totalConsultas}
                </div>
              </div>
              {estadisticas.diasConRegistros > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Días con registros
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                    {estadisticas.diasConRegistros}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sección: Montos USDT */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h5
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Montos (USDT)
            </h5>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "1rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Total USDT
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--primary)" }}>
                  {formatNumber(estadisticas.totalUsdt)} USDT
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Promedio por consulta
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                  {formatNumber(estadisticas.promedioUsdt)} USDT
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Mínimo
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                  {formatNumber(estadisticas.usdtMinimo)} USDT
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Máximo
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                  {formatNumber(estadisticas.usdtMaximo)} USDT
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Montos en Bolos */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h5
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Montos (Bolos)
            </h5>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "1rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Total bolos
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                  {formatNumber(estadisticas.totalBolivares)} bolos
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Promedio por consulta
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                  {formatNumber(estadisticas.promedioBolivares)} bolos
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Tasas */}
          {estadisticas.tasaPromedioUsdt > 0 && (
            <div>
              <h5
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Tasas
              </h5>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Tasa promedio USDT
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                    {formatNumber(estadisticas.tasaPromedioUsdt)} bolos/USDT
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lista de registros */}
      {registros.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "var(--text-secondary)" }}>
            No hay registros para este mes.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {registros.map((registro) => (
            <div
              key={registro.id}
              style={{
                backgroundColor: "var(--background)",
                borderRadius: "8px",
                padding: "1rem",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "0.5rem",
                }}
              >
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  {formatDate(registro.fecha)}
                </div>
                <button
                  onClick={() => handleEliminarRegistro(registro.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    padding: "0.25rem 0.5rem",
                  }}
                  title="Eliminar registro"
                >
                  🗑️
                </button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "0.5rem",
                  fontSize: "0.9rem",
                }}
              >
                <div>
                  <span style={{ color: "var(--text-secondary)" }}>Precio:</span>{" "}
                  <strong>
                    {formatNumber(registro.precioIngresado)}{" "}
                    {registro.monedaOrigen === "Bs"
                      ? "bolos"
                      : registro.monedaOrigen}
                  </strong>
                </div>
                {registro.tasaBCV && (
                  <div>
                    <span style={{ color: "var(--text-secondary)" }}>Tasa PERSE:</span>{" "}
                    <strong>{formatNumber(registro.tasaBCV)}</strong>
                  </div>
                )}
                <div>
                  <span style={{ color: "var(--text-secondary)" }}>Tasa USDT:</span>{" "}
                  <strong>{formatNumber(registro.tasaVentaUsdt)} bolos/USDT</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-secondary)" }}>USDT:</span>{" "}
                  <strong style={{ color: "var(--primary)" }}>
                    {formatNumber(registro.usdtNecesarios)} USDT
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón para eliminar todos */}
      {mesesDisponibles.length > 0 && (
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <button
            onClick={handleEliminarTodos}
            className="btn btn-secondary"
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
            }}
          >
            🗑️ Eliminar todos los registros
          </button>
        </div>
      )}
    </div>
  );
}

