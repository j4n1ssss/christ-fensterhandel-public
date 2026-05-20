import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Zahlung | Muster Fenster",
};

export default function ZahlungLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
