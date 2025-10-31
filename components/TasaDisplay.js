"use client";

import { useState, useEffect } from "react";

export default function TasaDisplay({ onTasaChange }) {
  const [tasa, setTasa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiado, setCopiado] = useState(false);

  const obtenerTasa = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tasa");
      const data = await response.json();

      if (data.success) {
        setTasa(data.data);
        if (onTasaChange) {
          onTasaChange(data.data);
        }
      } else {
        setError(data.error || "Error al obtener la tasa");
      }
    } catch (err) {
      setError("Error de conexión al obtener la tasa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerTasa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="tasa-display">
        <div className="spinner"></div>
        <p style={{ marginTop: "1rem" }}>Obteniendo tasa del BCV...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <strong>Error:</strong> {error}
        <button
          onClick={obtenerTasa}
          className="btn btn-secondary"
          style={{ marginTop: "0.5rem" }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!tasa) {
    return null;
  }

  const copiarTasa = async () => {
    try {
      await navigator.clipboard.writeText(tasa.valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
      // Fallback para navegadores antiguos
      const textArea = document.createElement("textarea");
      textArea.value = tasa.valor;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const fecha = new Date(tasa.fecha);
  const fechaFormateada = fecha.toLocaleDateString("es-VE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="tasa-display">
      <h2>Tipo de Cambio USD</h2>
      <div className="tasa-valor-container">
        <div className="tasa-valor">{tasa.valor} Bs</div>
        <button
          onClick={copiarTasa}
          className="btn-copiar"
          title="Copiar tasa"
        >
          {copiado ? "✓ Copiado" : "📋 Copiar"}
        </button>
      </div>
      <div className="tasa-fecha">{fechaFormateada}</div>
      <button
        onClick={obtenerTasa}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          background: "rgba(255, 255, 255, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
          fontSize: "0.875rem",
        }}
      >
        Actualizar tasa
      </button>
    </div>
  );
}

