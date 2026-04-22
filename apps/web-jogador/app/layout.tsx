import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Peladas — Jogador",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
