"use client";

export default function Tabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: "USD", label: "💵 USD" },
    { id: "EUR", label: "€ EUR" },
    { id: "USDT", label: "₮ USDT" },
    { id: "CALC", label: "🧮 Calculadora" },
  ];

  return (
    <div className="tabs-container">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? "tab-active" : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

