import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Occas Ordi — Informatique reconditionnée à Haguenau",
  description:
    "Achetez des ordinateurs reconditionnés et d'occasion à Haguenau. " +
    "Laptops, desktops, All-in-One — tous testés et garantis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased" style={{ colorScheme: 'light' }}>
      <body className="min-h-full flex flex-col bg-white text-[#1d1d1f]">
        {children}
      </body>
    </html>
  );
}
