"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function MaintenancePage() {
  const [whatsappLink, setWhatsappLink] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get WhatsApp link from API (public endpoint)
    fetch("/api/maintenance")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const link = data.data.whatsappLink || "";
          setWhatsappLink(link);
        }
      })
      .catch((err) => {
        console.error("Error loading WhatsApp link:", err);
        // Fallback: try environment variable (only works if set at build time)
        const envLink = process.env.NEXT_PUBLIC_WHATSAPP_LINK || "";
        setWhatsappLink(envLink);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const defaultMessage = "Hola comunicate con soporte por whatsapp";
  const whatsappUrl = whatsappLink
    ? `${whatsappLink}${
        whatsappLink.includes("?") ? "&" : "?"
      }text=${encodeURIComponent(defaultMessage)}`
    : "#";

  return (
    <div className="maintenance-container">
      <div className="maintenance-card">
        <div className="maintenance-header">
          <div className="maintenance-icon">🔧</div>
          <h1 className="maintenance-title">Sitio en Mantenimiento</h1>
          <p className="maintenance-subtitle">
            Estamos realizando mejoras para brindarte un mejor servicio.
            <br />
            Por favor, realiza tu aporte para continuar usando la plataforma.
          </p>
        </div>

        <div className="payment-section">
          <div className="payment-card">
            <h2 className="payment-title">💳 Realiza tu Aporte</h2>
            <p className="payment-description">
              Aporta 5 USDT a través de Binance Pay
            </p>

            <div className="binance-info">
              <div className="binance-id-container">
                <span className="binance-label">ID de Binance Pay:</span>
                <div className="binance-id">
                  <code className="binance-id-code">61207666</code>
                  <button
                    className="copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText("61207666");
                      const btn = document.querySelector(".copy-btn");
                      if (btn) {
                        const original = btn.textContent;
                        btn.textContent = "✓ Copiado";
                        setTimeout(() => {
                          btn.textContent = original;
                        }, 2000);
                      }
                    }}
                    title="Copiar ID"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="qr-container">
                <div className="qr-wrapper">
                  <Image
                    src="/binance.jpeg"
                    alt="QR Code Binance Pay"
                    width={300}
                    height={300}
                    className="qr-image"
                    priority
                  />
                </div>
                <p className="qr-hint">
                  Escanea el código QR con la app de Binance para enviar el pago
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-section">
          {whatsappLink ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-button"
            >
              <span className="whatsapp-icon">💬</span>
              <span>Contáctanos por WhatsApp</span>
            </a>
          ) : (
            <div
              className="whatsapp-button"
              style={{
                opacity: 0.6,
                cursor: "not-allowed",
                pointerEvents: "none",
              }}
            >
              <span className="whatsapp-icon">💬</span>
              <span>Contáctanos por WhatsApp</span>
            </div>
          )}
          <p className="contact-hint">
            {whatsappLink
              ? "Si necesitas comunicarte con nosotros, haz clic en el botón de arriba"
              : "Link de WhatsApp no configurado. Configúralo desde el panel de administración o mediante la variable de entorno WHATSAPP_LINK."}
          </p>
        </div>

        <div className="maintenance-footer">
          <p className="footer-text">
            Gracias por tu paciencia. Estaremos de vuelta pronto.
          </p>
        </div>
      </div>

      <style jsx>{`
        .maintenance-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }

        .maintenance-container::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 70%
          );
          animation: pulse 20s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        .maintenance-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 3rem;
          max-width: 600px;
          width: 100%;
          position: relative;
          z-index: 1;
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .maintenance-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .maintenance-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: rotate 3s linear infinite;
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .maintenance-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .maintenance-subtitle {
          color: #64748b;
          font-size: 1rem;
          line-height: 1.6;
        }

        .payment-section {
          margin-bottom: 2rem;
        }

        .payment-card {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 2px solid #3b82f6;
          border-radius: 16px;
          padding: 2rem;
        }

        .payment-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .payment-description {
          text-align: center;
          color: #64748b;
          margin-bottom: 1.5rem;
          font-size: 1rem;
        }

        .binance-info {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .binance-id-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .binance-label {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .binance-id {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .binance-id-code {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          font-family: "Courier New", monospace;
          letter-spacing: 2px;
        }

        .copy-btn {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.5rem;
          cursor: pointer;
          font-size: 1.25rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
        }

        .copy-btn:hover {
          background: #2563eb;
          transform: scale(1.05);
        }

        .copy-btn:active {
          transform: scale(0.95);
        }

        .qr-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          width: 100%;
        }

        .qr-wrapper {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 300px;
          box-sizing: border-box;
        }

        .qr-image {
          border-radius: 8px;
          width: 100%;
          height: auto;
          max-width: 100%;
          display: block;
          object-fit: contain;
        }

        .qr-hint {
          text-align: center;
          color: #64748b;
          font-size: 0.875rem;
          max-width: 300px;
        }

        .contact-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .whatsapp-button {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: #25d366;
          color: white;
          padding: 1rem 2rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
          margin-bottom: 0.75rem;
        }

        .whatsapp-button:hover {
          background: #20ba5a;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
        }

        .whatsapp-button:active {
          transform: translateY(0);
        }

        .whatsapp-icon {
          font-size: 1.5rem;
        }

        .contact-hint {
          color: #64748b;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .maintenance-footer {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .footer-text {
          color: #64748b;
          font-size: 0.875rem;
        }

        @media (max-width: 640px) {
          .maintenance-container {
            padding: 1rem;
          }

          .maintenance-card {
            padding: 1.5rem 1rem;
          }

          .maintenance-title {
            font-size: 1.5rem;
          }

          .payment-card {
            padding: 1rem;
          }

          .binance-id-code {
            font-size: 1.25rem;
          }

          .binance-id {
            padding: 0.75rem 1rem;
            flex-wrap: wrap;
            justify-content: center;
          }

          .qr-wrapper {
            padding: 1rem;
            max-width: 100%;
          }

          .qr-image {
            width: 100%;
            max-width: 250px;
          }

          .qr-hint {
            max-width: 100%;
            padding: 0 1rem;
          }

          .whatsapp-button {
            padding: 0.875rem 1.5rem;
            font-size: 1rem;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }
        }
      `}</style>
    </div>
  );
}
