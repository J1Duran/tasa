"use client";

import { useEffect, useState } from "react";

export default function TasaDisplay({ moneda = "USD", onTasaChange }) {
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [bcvRate, setBcvRate] = useState(null);
  const [savingsPercentage, setSavingsPercentage] = useState(null);

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

  // Get BCV rate when USDT tab is active
  const getBCVRate = async () => {
    if (moneda !== "USDT") {
      setBcvRate(null);
      setSavingsPercentage(null);
      return;
    }

    try {
      const response = await fetch("/api/tasa?moneda=USD");
      const data = await response.json();

      if (data.success && data.data.tasa) {
        setBcvRate(data.data.tasa);
      }
    } catch (err) {
      console.error("Error obteniendo tasa BCV:", err);
      setBcvRate(null);
    }
  };

  // Calculate savings percentage
  // Porcentaje de ganancia por cada USDT con respecto al USD BCV
  const calculateSavingsPercentage = (tasaBCV, tasaUSDT) => {
    if (!tasaBCV || !tasaUSDT || tasaBCV <= 0 || tasaUSDT <= 0) {
      return null;
    }

    // Calcular: porcentaje de ganancia al vender USDT vs vender USD a tasa BCV
    // Si vendes 1 USDT recibes tasaUSDT bolos
    // Si vendes 1 USD a BCV recibes tasaBCV bolos
    // Ganancia = tasaUSDT - tasaBCV
    // Porcentaje de ganancia sobre el precio de venta = (ganancia / tasaUSDT) * 100
    // Esto muestra qué porcentaje del precio de venta es ganancia adicional vs BCV
    const ganancia = tasaUSDT - tasaBCV;
    const porcentaje = (ganancia / tasaUSDT) * 100;

    // Retornar valor positivo
    return parseFloat(Math.abs(porcentaje).toFixed(2));
  };

  useEffect(() => {
    getRate();
    getBCVRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moneda]);

  // Calculate percentage when rates change
  useEffect(() => {
    if (moneda === "USDT" && rate && bcvRate && rate.tasaVenta) {
      const percentage = calculateSavingsPercentage(bcvRate, rate.tasaVenta);
      setSavingsPercentage(percentage);
    } else {
      setSavingsPercentage(null);
    }
  }, [moneda, rate, bcvRate]);

  if (loading) {
    return (
      <div className="tasa-display">
        <div className="spinner"></div>
        <p style={{ marginTop: "1rem" }}>Obteniendo tasa...</p>
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
    // Always use average (valor) for copying
    // Format for clipboard: replace dots with nothing, keep comma for decimals
    const copyValue = rate.valor.replace(/\./g, "");

    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copying:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = copyValue;
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

  const currencyLabel =
    moneda === "EUR" ? "EUR" : moneda === "USDT" ? "USDT" : "USD";

  // Format number for display
  const formatRate = (rateValue) => {
    const num =
      typeof rateValue === "number" ? rateValue : parseFloat(rateValue);
    return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
  };

  return (
    <div className="tasa-display">
      <h2>Tipo de Cambio {currencyLabel}</h2>
      <div className="tasa-valor-container">
        <div className="tasa-valor-group">
          <span className="tasa-numero">{rate.valor}</span>
          <span className="tasa-unidad">bolos</span>
        </div>
        <button onClick={copyRate} className="btn-copiar" title="Copiar tasa">
          {copied ? "✓" : "📋"}
        </button>
        {/* Indicador de porcentaje de diferencia vs BCV */}
        {moneda === "USDT" &&
          savingsPercentage !== null &&
          savingsPercentage !== undefined && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.5rem 0.75rem",
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "6px",
                minWidth: "80px",
              }}
            >
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {typeof savingsPercentage === "number"
                  ? savingsPercentage.toFixed(2)
                  : "0.00"}
                %
              </span>
            </div>
          )}
      </div>

      {/* Show buy and sell rates for USDT (reference only) */}
      {moneda === "USDT" && rate.tasaCompra && rate.tasaVenta && (
        <div style={{ marginTop: "0.75rem" }}>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              fontSize: "0.875rem",
              opacity: 0.9,
              marginBottom: "0.5rem",
            }}
          >
            <span>
              <strong>Compra:</strong> {formatRate(rate.tasaCompra)} bolos
            </span>
            <span>|</span>
            <span>
              <strong>Venta:</strong> {formatRate(rate.tasaVenta)} bolos
            </span>
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              opacity: 0.8,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            Promedio basado en transacciones de 100 USDT
          </div>
        </div>
      )}

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
