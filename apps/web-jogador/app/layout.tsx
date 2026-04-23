import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { PlayerIdSettings } from "./components/player-id-settings";

export const metadata: Metadata = {
  title: "Peladas — Jogador",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <header className="app-header">
          <h1>
            <Link href="/">Peladas</Link>
          </h1>
          <nav>
            <Link href="/">Partidas</Link>
          </nav>
          <PlayerIdSettings />
        </header>
        {children}
      </body>
    </html>
  );
}
