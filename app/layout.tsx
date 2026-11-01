import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContact } from "@/components/Messengers";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-manrope" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "Imobiliare în Moldova — terenuri, case și spații comerciale | REZULTAT",
  description:
    "Vânzare, chirie și schimb de imobile în Moldova. Terenuri, case și spații comerciale cu fotografii, prețuri și condiții. Contactați agenția REZULTAT.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${manrope.variable} ${cormorant.variable}`}>
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
