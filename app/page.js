"use client";

import { useState, useEffect } from "react";
import TasaDisplay from "@/components/TasaDisplay";
import Resultado from "@/components/Resultado";
import Tabs from "@/components/Tabs";

export default function Home() {
  const [monedaActiva, setMonedaActiva] = useState("USD");
  const [inputCantidades, setInputCantidades] = useState("");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tasaActual, setTasaActual] = useState(null);

  // Obtener tasa actual al cargar o cambiar de moneda
  const obtenerTasaActual = async (moneda) => {
    try {
      const response = await fetch(`/api/tasa?moneda=${moneda}`);
      const data = await response.json();
      if (data.success) {
        setTasaActual(data.data);
      }
    } catch (err) {
      console.error("Error al obtener tasa:", err);
    }
  };

  useEffect(() => {
    obtenerTasaActual(monedaActiva);
    setResultado(null);
    setInputCantidades("");
    setError(null);
  }, [monedaActiva]);

  const calcular = async () => {
    if (!inputCantidades.trim()) {
      setError(`Por favor ingresa al menos una cantidad en ${monedaActiva}`);
      return;
    }

    if (!tasaActual) {
      setError("No se ha podido obtener la tasa del BCV. Intenta actualizar la tasa.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Separar cantidades por coma o espacio
      const cantidades = inputCantidades
        .split(/[,\s]+/)
        .map((val) => val.trim())
        .filter((val) => val !== "")
        .map((val) => parseFloat(val.replace(",", ".")))
        .filter((val) => !isNaN(val) && val > 0);

      if (cantidades.length === 0) {
        setError("Por favor ingresa cantidades válidas (números positivos)");
        setLoading(false);
        return;
      }

      // Llamar a la API de cálculo
      const response = await fetch("/api/calcular", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cantidades,
          tasa: tasaActual.tasa,
          moneda: monedaActiva,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResultado(data.data);
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

  const limpiar = () => {
    setInputCantidades("");
    setResultado(null);
    setError(null);
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>💰 Calculadora BCV</h1>
          <p>Convierte USD/EUR a Bolívares usando la tasa oficial del BCV</p>
        </div>

        <Tabs activeTab={monedaActiva} onTabChange={setMonedaActiva} />

        <TasaDisplay moneda={monedaActiva} onTasaChange={setTasaActual} />

        <div className="input-group">
          <label htmlFor="cantidades">
            {monedaActiva === "EUR" ? "€" : "💵"} Cantidades en {monedaActiva}
          </label>
          <input
            id="cantidades"
            type="text"
            placeholder={`Ej: 100, 20, 40 o 100 20 40 (en ${monedaActiva})`}
            value={inputCantidades}
            onChange={(e) => setInputCantidades(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                calcular();
              }
            }}
            disabled={loading || !tasaActual}
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
          onClick={calcular}
          className="btn btn-primary"
          disabled={loading || !tasaActual || !inputCantidades.trim()}
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

        {resultado && (
          <button onClick={limpiar} className="btn btn-secondary">
            Limpiar
          </button>
        )}

        <Resultado resultado={resultado} />
      </div>
    </div>
  );
}

