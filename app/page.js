"use client";

import { useState, useEffect, useRef } from "react";
import TasaDisplay from "@/components/TasaDisplay";
import Resultado from "@/components/Resultado";
import ResultadoCalculadora from "@/components/ResultadoCalculadora";
import Tabs from "@/components/Tabs";
import RegistrosUSDT from "@/components/RegistrosUSDT";
import ModalRegistros from "@/components/ModalRegistros";
import { guardarRegistro } from "@/lib/usdt-registros";

export default function Home() {
  const [activeCurrency, setActiveCurrency] = useState("USD");
  const [inputAmounts, setInputAmounts] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentRate, setCurrentRate] = useState(null);
  // Toggle for USD tab: USD or Bs input mode
  const [usdInputMode, setUsdInputMode] = useState("USD");
  
  // Ref for scrolling to results
  const resultadoRef = useRef(null);
  const resultadoCalcRef = useRef(null);

  // Calculator-specific state
  const [monedaCalc, setMonedaCalc] = useState("Bs");
  const [precioCalc, setPrecioCalc] = useState("");
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [shouldRegister, setShouldRegister] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [showRegistrosModal, setShowRegistrosModal] = useState(false);

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
      // Reset input mode to USD when switching away from USD tab
      if (activeCurrency !== "USD") {
        setUsdInputMode("USD");
      }
    } else {
      setResult(null);
      // Don't clear precioCalc here - it might have been set by onNavigateToCalculator
      // Only clear calcResult when entering CALC tab
      setCalcResult(null);
      setError(null);
    }
  }, [activeCurrency]);

  const calculate = async () => {
    if (!inputAmounts.trim()) {
      const currencyLabel = activeCurrency === "USD" && usdInputMode === "Bs" ? "bolos" : activeCurrency;
      setError(`Por favor ingresa al menos una cantidad en ${currencyLabel}`);
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

      // If input mode is Bs (for USD tab), we need to divide by rate to get USD equivalent
      // and then the API will multiply by rate to get back to Bs
      // Actually, we need a different approach: calculate USD from Bs input
      let processedAmounts = amounts;
      let processedMoneda = activeCurrency;
      
      if (activeCurrency === "USD" && usdInputMode === "Bs") {
        // Convert Bs amounts to USD by dividing by rate
        processedAmounts = amounts.map(amount => amount / currentRate.tasa);
        // Keep moneda as USD so the API calculates correctly
        processedMoneda = "USD";
      }

      // Call calculation API
      const response = await fetch("/api/calcular", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cantidades: processedAmounts,
          tasa: currentRate.tasa,
          moneda: processedMoneda,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // If input was in Bs, we need to adjust the result to show the USD equivalent
        if (activeCurrency === "USD" && usdInputMode === "Bs") {
          // The result.totalBolivares is the same as the input (sum of Bs amounts)
          // But we need to show the USD equivalent in sumaMoneda
          const totalBs = amounts.reduce((sum, val) => sum + val, 0);
          const totalUsd = totalBs / currentRate.tasa;
          setResult({
            ...data.data,
            sumaMoneda: totalUsd,
            moneda: "USD",
            totalBolivares: totalBs,
            // Save original Bs amounts for display
            cantidadesOriginales: amounts,
            // Mark that input was in Bs
            inputMode: "Bs",
          });
        } else {
          setResult(data.data);
        }
        setError(null);
        
        // Scroll to results after a short delay to ensure DOM is updated
        setTimeout(() => {
          resultadoRef.current?.scrollIntoView({ 
            behavior: "smooth", 
            block: "start" 
          });
        }, 100);
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
        
        // Guardar registro si el checkbox está marcado
        if (shouldRegister) {
          const guardado = guardarRegistro(data.data);
          if (guardado) {
            setRegisterSuccess(true);
            setTimeout(() => setRegisterSuccess(false), 3000);
          }
        }
        
        // Scroll to calculator results after a short delay to ensure DOM is updated
        setTimeout(() => {
          resultadoCalcRef.current?.scrollIntoView({ 
            behavior: "smooth", 
            block: "start" 
          });
        }, 100);
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

  // Handler for changing currency in calculator tab
  const handleMonedaCalcChange = (newMoneda) => {
    setMonedaCalc(newMoneda);
    setPrecioCalc("");
    setCalcResult(null);
  };

  const isCalculatorTab = activeCurrency === "CALC";

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1>💰 Calculadora Perse (Personal)</h1>
              <p>Convierte USD/EUR a bolos usando PERSE</p>
            </div>
            <button
              onClick={() => setShowRegistrosModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.5rem",
                fontSize: "1.25rem",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                color: "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s",
                marginTop: "0.25rem",
                width: "36px",
                height: "36px",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "var(--background)";
                e.target.style.borderColor = "var(--primary)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.borderColor = "var(--border)";
              }}
              title="Ver mis registros de consultas USDT"
            >
              📊
            </button>
          </div>
        </div>

        <Tabs activeTab={activeCurrency} onTabChange={setActiveCurrency} />

        {!isCalculatorTab && (
          <>
            <TasaDisplay moneda={activeCurrency} onTasaChange={setCurrentRate} />

            {/* Toggle for USD tab only */}
            {activeCurrency === "USD" && (
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                  borderBottom: "2px solid var(--border)",
                  paddingBottom: "0.5rem",
                }}
              >
                <button
                  onClick={() => {
                    setUsdInputMode("USD");
                    setInputAmounts("");
                    setResult(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "0.75rem 1rem",
                    fontSize: "1rem",
                    fontWeight: 600,
                    border: "none",
                    background:
                      usdInputMode === "USD"
                        ? "var(--background)"
                        : "transparent",
                    color:
                      usdInputMode === "USD"
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
                  💵 USD
                </button>
                <button
                  onClick={() => {
                    setUsdInputMode("Bs");
                    setInputAmounts("");
                    setResult(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "0.75rem 1rem",
                    fontSize: "1rem",
                    fontWeight: 600,
                    border: "none",
                    background:
                      usdInputMode === "Bs"
                        ? "var(--background)"
                        : "transparent",
                    color:
                      usdInputMode === "Bs"
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
                  💰 bolos
                </button>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="cantidades">
                {activeCurrency === "EUR"
                  ? "€"
                  : activeCurrency === "USDT"
                  ? "₮"
                  : activeCurrency === "USD" && usdInputMode === "Bs"
                  ? "💰"
                  : "💵"}{" "}
                Cantidades en{" "}
                {activeCurrency === "USD" && usdInputMode === "Bs"
                  ? "bolos"
                  : activeCurrency}
              </label>
              <input
                id="cantidades"
                type="text"
                placeholder={
                  activeCurrency === "USD" && usdInputMode === "Bs"
                    ? "Ej: 10000, 20000, 40000 o 10000 20000 40000 (en bolos)"
                    : `Ej: 100, 20, 40 o 100 20 40 (en ${activeCurrency})`
                }
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

            <div ref={resultadoRef}>
              <Resultado 
                resultado={result} 
                moneda={activeCurrency}
                onNavigateToCalculator={(monto) => {
                  setActiveCurrency("CALC");
                  setMonedaCalc("Bs");
                  // Format number properly: use Spanish format and remove thousand separators
                  const formatted = new Intl.NumberFormat("es-VE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(monto);
                  // Remove dots (thousand separators), keep comma (decimal)
                  const formattedMonto = formatted.replace(/\./g, "");
                  setPrecioCalc(formattedMonto);
                }}
              />
            </div>
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
                    onClick={() => handleMonedaCalcChange(currency.id)}
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

              {registerSuccess && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "#d4edda",
                    color: "#155724",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    border: "1px solid #c3e6cb",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span>✓</span>
                  <span>Consulta registrada correctamente</span>
                </div>
              )}

              {/* Checkbox para registrar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                  padding: "0.75rem",
                  backgroundColor: "var(--background)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              >
                <input
                  type="checkbox"
                  id="register-checkbox"
                  checked={shouldRegister}
                  onChange={(e) => setShouldRegister(e.target.checked)}
                  style={{
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                  }}
                />
                <label
                  htmlFor="register-checkbox"
                  style={{
                    cursor: "pointer",
                    userSelect: "none",
                    flex: 1,
                  }}
                >
                  📝 Registrar esta consulta
                </label>
              </div>

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

              <div ref={resultadoCalcRef}>
                <ResultadoCalculadora 
                  resultado={calcResult}
                  onViewRegistros={() => setShowRegistrosModal(true)}
                />
              </div>
            </div>
          </>
        )}

        {/* Modal de registros */}
        <ModalRegistros
          isOpen={showRegistrosModal}
          onClose={() => setShowRegistrosModal(false)}
        >
          <RegistrosUSDT onClose={() => setShowRegistrosModal(false)} />
        </ModalRegistros>
      </div>
    </div>
  );
}
