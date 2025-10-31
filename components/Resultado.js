"use client";

import { useState } from "react";

export default function Resultado({ resultado }) {
  const [copied, setCopied] = useState(false);

  if (!resultado) return null;

  const formatNumber = (number) => {
    return new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  const copyTotal = async () => {
    const formattedTotal = formatNumber(resultado.totalBolivares);
    try {
      await navigator.clipboard.writeText(formattedTotal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copying:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = formattedTotal;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="resultado">
      <h3>📊 Resultado del Cálculo</h3>

      {resultado.cantidades && resultado.cantidades.length > 0 && (
        <div className="cantidades-list">
          <strong style={{ display: "block", marginBottom: "0.5rem" }}>
            Cantidades ingresadas:
          </strong>
          {resultado.cantidades.map((amount, index) => (
            <div key={index} className="cantidad-item">
              <span>{index + 1}.</span>
              <span>
                {formatNumber(amount)} {resultado.moneda || "USD"}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="resultado-item">
        <span className="resultado-item-label">Suma total:</span>
        <span className="resultado-item-value">
          {resultado.moneda === "EUR" ? "€" : "$"}
          {formatNumber(resultado.sumaMoneda || resultado.sumaUSD)}{" "}
          {resultado.moneda || "USD"}
        </span>
      </div>

      <div className="resultado-item">
        <span className="resultado-item-label">Tipo de cambio BCV:</span>
        <span className="resultado-item-value">
          {formatNumber(resultado.tasa)} Bs/{resultado.moneda || "USD"}
        </span>
      </div>

      <div className="resultado-item resultado-total">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span className="resultado-item-label">Total en Bolívares:</span>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <span className="resultado-item-value">
              {formatNumber(resultado.totalBolivares)} Bs
            </span>
            <button
              onClick={copyTotal}
              className="btn-copiar-resultado"
              title="Copiar total en bolívares"
            >
              {copied ? "✓" : "📋"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
