"use client";

import { useState } from "react";

export default function Resultado({ resultado }) {
  const [copiado, setCopiado] = useState(false);

  if (!resultado) return null;

  const formatearNumero = (numero) => {
    return new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numero);
  };

  const copiarTotal = async () => {
    const totalFormateado = formatearNumero(resultado.totalBolivares);
    try {
      await navigator.clipboard.writeText(totalFormateado);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
      // Fallback para navegadores antiguos
      const textArea = document.createElement("textarea");
      textArea.value = totalFormateado;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
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
          {resultado.cantidades.map((cantidad, index) => (
            <div key={index} className="cantidad-item">
              <span>{index + 1}.</span>
              <span>
                {formatearNumero(cantidad)} {resultado.moneda || "USD"}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="resultado-item">
        <span className="resultado-item-label">Suma total:</span>
        <span className="resultado-item-value">
          {resultado.moneda === "EUR" ? "€" : "$"}
          {formatearNumero(resultado.sumaMoneda || resultado.sumaUSD)}{" "}
          {resultado.moneda || "USD"}
        </span>
      </div>

      <div className="resultado-item">
        <span className="resultado-item-label">Tipo de cambio BCV:</span>
        <span className="resultado-item-value">
          {formatearNumero(resultado.tasa)} Bs/{resultado.moneda || "USD"}
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
              {formatearNumero(resultado.totalBolivares)} Bs
            </span>
            <button
              onClick={copiarTotal}
              className="btn-copiar-resultado"
              title="Copiar total en bolívares"
            >
              {copiado ? "✓" : "📋"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
