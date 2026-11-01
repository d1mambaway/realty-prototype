import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Montserrat } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContact } from "@/components/Messengers";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-manrope" });
// Заголовки
const montserrat = Montserrat({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
});
// Только для логотипа: повторяет фирменный знак
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "Imobiliare în Moldova — terenuri, case și spații comerciale | REZULTAT",
  description:
    "Vânzare, chirie și schimb de imobile în Moldova. Terenuri, case și spații comerciale cu fotografii, prețuri și condiții. Contactați agenția REZULTAT.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${manrope.variable} ${montserrat.variable} ${cormorant.variable}`}>
      <body className="grain min-h-screen font-sans">
        <I18nProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <FloatingContact />
        </I18nProvider>
      </body>
    </html>
  );
}
