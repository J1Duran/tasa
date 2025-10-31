import VisitTracker from "@/components/VisitTracker";
import "./globals.css";

export const metadata = {
  title: "Calculadora Perse - Tipo de Cambio USD/EUR/USDT",
  description:
    "Calculadora para convertir USD, EUR y USDT a bolos usando PERSE y Binance P2P",
  keywords:
    "PERSE, calculadora, tipo de cambio, USD, EUR, USDT, bolos, Venezuela",
  authors: [{ name: "Calculadora Perse" }],
  creator: "Calculadora Perse",
  publisher: "Calculadora Perse",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://tasa-blush.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Calculadora Perse - Tipo de Cambio USD/EUR/USDT",
    description:
      "Calculadora para convertir USD, EUR y USDT a bolos usando PERSE y Binance P2P",
    url: "https://bcv-calculator.vercel.app",
    siteName: "Calculadora Perse",
    locale: "es_VE",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Calculadora Perse",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculadora Perse - Tipo de Cambio USD/EUR/USDT",
    description:
      "Calculadora para convertir USD, EUR y USDT a bolos usando PERSE y Binance P2P",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
  themeColor: "#2563eb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Calculadora Perse",
    startupImage: "/apple-icon-180.png",
  },
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
