import type { Metadata } from "next";
import { Orbitron, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import config from "../../clawtrol.config";
import ThemeProvider from "@/components/ThemeProvider";
import { getThemePreset } from "@/lib/themes";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Clawtrol — Control Center",
  description: "System monitoring & control dashboard",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👾</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const preset = getThemePreset(config.theme?.preset);
  const fontClasses = [
    inter.variable,
    preset.fonts.display === 'orbitron' ? orbitron.variable : '',
    preset.fonts.data === 'jetbrains' ? jetbrainsMono.variable : '',
  ].join(' ');

  return (
    <html lang="en">
      <body className={`${fontClasses} antialiased`}>
        <ThemeProvider
          preset={config.theme?.preset}
          mode={config.theme?.mode}
          accent={config.theme?.accent}
        />
        {children}
      </body>
    </html>
  );
}
