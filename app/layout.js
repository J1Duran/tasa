import "./globals.css";
import VisitTracker from "@/components/VisitTracker";

export const metadata = {
  title: "Calculadora BCV - Tipo de Cambio USD",
  description: "Calculadora para convertir USD a Bolívares usando la tasa oficial del BCV",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
        <VisitTracker />
      </body>
    </html>
  );
}

