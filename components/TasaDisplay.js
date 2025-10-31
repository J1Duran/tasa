"use client";

import { useEffect, useState } from "react";

export default function TasaDisplay({ moneda = "USD", onTasaChange }) {
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const getRate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tasa?moneda=${moneda}`);
      const data = await response.json();

      if (data.success) {
        setRate(data.data);
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
    getRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moneda]);

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
          onClick={getRate}
          className="btn btn-secondary"
          style={{ marginTop: "0.5rem" }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!rate) {
    return null;
  }

  const copyRate = async () => {
    try {
      await navigator.clipboard.writeText(rate.valor);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copying:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = rate.valor;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const date = new Date(rate.fecha);
  const formattedDate = date.toLocaleDateString("es-VE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currencyLabel = moneda === "EUR" ? "EUR" : "USD";

  return (
    <div className="tasa-display">
      <h2>Tipo de Cambio {currencyLabel}</h2>
      <div className="tasa-valor-container">
        <div className="tasa-valor-group">
          <span className="tasa-numero">{rate.valor}</span>
          <span className="tasa-unidad">Bs</span>
        </div>
        <button onClick={copyRate} className="btn-copiar" title="Copiar tasa">
          {copied ? "✓" : "📋"}
        </button>
      </div>
      <div className="tasa-fecha">{formattedDate}</div>
      <button
        onClick={getRate}
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
