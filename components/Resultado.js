"use client";

export default function Resultado({ resultado }) {
  if (!resultado) return null;

  const formatearNumero = (numero) => {
    return new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numero);
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
              <span>{formatearNumero(cantidad)} USD</span>
            </div>
          ))}
        </div>
      )}

      <div className="resultado-item">
        <span className="resultado-item-label">Suma total:</span>
        <span className="resultado-item-value">
          ${formatearNumero(resultado.sumaUSD)} USD
        </span>
      </div>

      <div className="resultado-item">
        <span className="resultado-item-label">Tipo de cambio BCV:</span>
        <span className="resultado-item-value">
          {formatearNumero(resultado.tasa)} Bs/USD
        </span>
      </div>

      <div className="resultado-item resultado-total">
        <span className="resultado-item-label">Total en Bolívares:</span>
        <span className="resultado-item-value">
          {formatearNumero(resultado.totalBolivares)} Bs
        </span>
      </div>
    </div>
  );
}
