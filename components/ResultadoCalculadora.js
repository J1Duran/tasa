"use client";

import { useState } from "react";

export default function ResultadoCalculadora({ resultado }) {
  const [copiedUSDT, setCopiedUSDT] = useState(false);
  const [copiedBs, setCopiedBs] = useState(false);
  const [copiedTasa, setCopiedTasa] = useState(false);

  if (!resultado) return null;

  const formatNumber = (number) => {
    return new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  const copyToClipboard = async (text, setCopied) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copying:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
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
      <h3>📊 USDT Necesarios</h3>

      {/* Show origin price */}
      <div className="resultado-item">
        <span className="resultado-item-label">Precio ingresado:</span>
        <span className="resultado-item-value">
          {formatNumber(resultado.precioIngresado)}{" "}
          {resultado.monedaOrigen === "Bs"
            ? "bolos"
            : resultado.monedaOrigen === "EUR"
            ? "€"
            : "$"}
        </span>
      </div>

      {/* Show PERSE conversion if applicable */}
      {resultado.tasaBCV && (
        <div className="resultado-item">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <span className="resultado-item-label">Conversión a bolos (PERSE):</span>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <span className="resultado-item-value">
                {formatNumber(resultado.precioBolivares)} bolos
              </span>
              <button
                onClick={() =>
                  copyToClipboard(
                    formatNumber(resultado.precioBolivares),
                    setCopiedBs
                  )
                }
                className="btn-copiar-resultado"
                title="Copiar conversión a bolos"
              >
                {copiedBs ? "✓" : "📋"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show USDT sell rate used */}
      <div className="resultado-item">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span className="resultado-item-label">Tasa de venta USDT:</span>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <span className="resultado-item-value">
              {formatNumber(resultado.tasaVentaUsdt)} bolos/USDT
            </span>
            <button
              onClick={() =>
                copyToClipboard(
                  formatNumber(resultado.tasaVentaUsdt),
                  setCopiedTasa
                )
              }
              className="btn-copiar-resultado"
              title="Copiar tasa de venta USDT"
            >
              {copiedTasa ? "✓" : "📋"}
            </button>
          </div>
        </div>
      </div>

      {/* Main result: USDT needed */}
      <div className="resultado-item resultado-total">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span className="resultado-item-label">USDT a vender:</span>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <span className="resultado-item-value">
              {formatNumber(resultado.usdtNecesarios)} USDT
            </span>
            <button
              onClick={() =>
                copyToClipboard(
                  formatNumber(resultado.usdtNecesarios),
                  setCopiedUSDT
                )
              }
              className="btn-copiar-resultado"
              title="Copiar USDT necesarios"
            >
              {copiedUSDT ? "✓" : "📋"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

