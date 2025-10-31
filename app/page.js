"use client";

import { useState, useEffect } from "react";
import TasaDisplay from "@/components/TasaDisplay";
import Resultado from "@/components/Resultado";
import Tabs from "@/components/Tabs";

export default function Home() {
  const [activeCurrency, setActiveCurrency] = useState("USD");
  const [inputAmounts, setInputAmounts] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentRate, setCurrentRate] = useState(null);

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
    getCurrentRate(activeCurrency);
    setResult(null);
    setInputAmounts("");
    setError(null);
  }, [activeCurrency]);

  const calculate = async () => {
    if (!inputAmounts.trim()) {
      setError(`Por favor ingresa al menos una cantidad en ${activeCurrency}`);
      return;
    }

    if (!currentRate) {
      setError("No se ha podido obtener la tasa del BCV. Intenta actualizar la tasa.");
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

  const clear = () => {
    setInputAmounts("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>💰 Calculadora BCV</h1>
          <p>Convierte USD/EUR a Bolívares usando la tasa oficial del BCV</p>
        </div>

        <Tabs activeTab={activeCurrency} onTabChange={setActiveCurrency} />

        <TasaDisplay moneda={activeCurrency} onTasaChange={setCurrentRate} />

        <div className="input-group">
          <label htmlFor="cantidades">
            {activeCurrency === "EUR" ? "€" : "💵"} Cantidades en {activeCurrency}
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
      </div>
    </div>
  );
}

