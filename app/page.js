"use client";

import { useState, useEffect } from "react";
import TasaDisplay from "@/components/TasaDisplay";
import Resultado from "@/components/Resultado";
import ResultadoCalculadora from "@/components/ResultadoCalculadora";
import Tabs from "@/components/Tabs";

export default function Home() {
  const [activeCurrency, setActiveCurrency] = useState("USD");
  const [inputAmounts, setInputAmounts] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentRate, setCurrentRate] = useState(null);

  // Calculator-specific state
  const [monedaCalc, setMonedaCalc] = useState("Bs");
  const [precioCalc, setPrecioCalc] = useState("");
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Get current rate when loading or changing currency
  const getCurrentRate = async (currency) => {
    try {
      const response = await fetch(`/api/tasa?moneda=${currency}`);
      const data = await response.json();
      if (data.success) {
        setCurrentRate(data.data);
      }
    } catch (err) {
      console.error("Error getting rate:", err);
    }
  };

  useEffect(() => {
    if (activeCurrency !== "CALC") {
      getCurrentRate(activeCurrency);
      setResult(null);
      setInputAmounts("");
      setError(null);
    } else {
      setResult(null);
      setCalcResult(null);
      setPrecioCalc("");
      setError(null);
    }
  }, [activeCurrency]);

  const calculate = async () => {
    if (!inputAmounts.trim()) {
      setError(`Por favor ingresa al menos una cantidad en ${activeCurrency}`);
      return;
    }

    if (!currentRate) {
      setError("No se ha podido obtener la tasa. Intenta actualizar la tasa.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Split amounts by comma or space
      const amounts = inputAmounts
        .split(/[,\s]+/)
        .map((val) => val.trim())
        .filter((val) => val !== "")
        .map((val) => parseFloat(val.replace(",", ".")))
        .filter((val) => !isNaN(val) && val > 0);

      if (amounts.length === 0) {
        setError("Por favor ingresa cantidades válidas (números positivos)");
        setLoading(false);
        return;
      }

      // Call calculation API
      const response = await fetch("/api/calcular", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cantidades: amounts,
          tasa: currentRate.tasa,
          moneda: activeCurrency,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setError(null);
      } else {
        setError(data.error || "Error al calcular");
      }
    } catch (err) {
      setError("Error de conexión al calcular");
    } finally {
      setLoading(false);
    }
  };

  const calculateUSDT = async () => {
    // Validate input
    if (!precioCalc.trim()) {
      setError("Debes ingresar un precio");
      return;
    }

    setCalcLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/calcular-usdt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          precioBolivares: monedaCalc === "Bs" ? precioCalc.trim() : null,
          precioMoneda: monedaCalc !== "Bs" ? precioCalc.trim() : null,
          tipoMoneda: monedaCalc,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCalcResult(data.data);
        setError(null);
      } else {
        setError(data.error || "Error al calcular");
      }
    } catch (err) {
      setError("Error de conexión al calcular");
    } finally {
      setCalcLoading(false);
    }
  };

  const clear = () => {
    setInputAmounts("");
    setResult(null);
    setError(null);
  };

  const clearCalc = () => {
    setPrecioCalc("");
    setCalcResult(null);
    setError(null);
  };

  const isCalculatorTab = activeCurrency === "CALC";

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>💰 Calculadora Perse (Personal)</h1>
          <p>Convierte USD/EUR a bolos usando PERSE</p>
        </div>

        <Tabs activeTab={activeCurrency} onTabChange={setActiveCurrency} />

        {!isCalculatorTab && (
          <>
            <TasaDisplay moneda={activeCurrency} onTasaChange={setCurrentRate} />

            <div className="input-group">
              <label htmlFor="cantidades">
                {activeCurrency === "EUR"
                  ? "€"
                  : activeCurrency === "USDT"
                  ? "₮"
                  : "💵"}{" "}
                Cantidades en {activeCurrency}
              </label>
              <input
                id="cantidades"
                type="text"
                placeholder={`Ej: 100, 20, 40 o 100 20 40 (en ${activeCurrency})`}
                value={inputAmounts}
                onChange={(e) => setInputAmounts(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    calculate();
                  }
                }}
                disabled={loading || !currentRate}
              />
              <div className="helper-text">
                Separa múltiples cantidades con comas o espacios
              </div>
            </div>

            {error && (
              <div className="error">
                <strong>Error:</strong> {error}
              </div>
            )}

            <button
              onClick={calculate}
              className="btn btn-primary"
              disabled={loading || !currentRate || !inputAmounts.trim()}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Calculando...
                </>
              ) : (
                "Calcular"
              )}
            </button>

            {result && (
              <button onClick={clear} className="btn btn-secondary">
                Limpiar
              </button>
            )}

            <Resultado resultado={result} />
          </>
        )}

        {isCalculatorTab && (
          <>
            <div style={{ marginTop: "1.5rem" }}>
              <h3 style={{ marginBottom: "1rem", textAlign: "center" }}>
                Calcula cuántos USDT necesitas vender
              </h3>

              {/* Currency selector tabs */}
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginBottom: "1.5rem",
                  borderBottom: "2px solid var(--border)",
                  paddingBottom: "0.5rem",
                }}
              >
                {[
                  { id: "Bs", label: "bolos", icon: "💰" },
                  { id: "USD", label: "USD", icon: "💵" },
                  { id: "EUR", label: "EUR", icon: "€" },
                ].map((currency) => (
                  <button
                    key={currency.id}
                    onClick={() => setMonedaCalc(currency.id)}
                    style={{
                      flex: 1,
                      padding: "0.75rem 1rem",
                      fontSize: "1rem",
                      fontWeight: 600,
                      border: "none",
                      background:
                        monedaCalc === currency.id
                          ? "var(--background)"
                          : "transparent",
                      color:
                        monedaCalc === currency.id
                          ? "var(--primary)"
                          : "var(--text-secondary)",
                      cursor: "pointer",
                      borderRadius: "8px 8px 0 0",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {currency.icon} {currency.label}
                  </button>
                ))}
              </div>

              {/* Single input */}
              <div className="input-group">
                <label htmlFor="precio-calc">
                  {monedaCalc === "Bs"
                    ? "💰"
                    : monedaCalc === "EUR"
                    ? "€"
                    : "💵"}{" "}
                  Precio en {monedaCalc === "Bs" ? "bolos" : monedaCalc}
                </label>
                <input
                  id="precio-calc"
                  type="text"
                  placeholder={
                    monedaCalc === "Bs"
                      ? "Ej: 10000"
                      : `Ej: 100 (en ${monedaCalc})`
                  }
                  value={precioCalc}
                  onChange={(e) => setPrecioCalc(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      calculateUSDT();
                    }
                  }}
                  disabled={calcLoading}
                />
              </div>

              {error && (
                <div className="error">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <button
                onClick={calculateUSDT}
                className="btn btn-primary"
                disabled={calcLoading || !precioCalc.trim()}
              >
                {calcLoading ? (
                  <>
                    <div className="spinner"></div>
                    Calculando...
                  </>
                ) : (
                  "Calcular USDT"
                )}
              </button>

              {calcResult && (
                <button onClick={clearCalc} className="btn btn-secondary">
                  Limpiar
                </button>
              )}

              <ResultadoCalculadora resultado={calcResult} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
