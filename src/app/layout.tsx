import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "SetDrop — Live Song Requests",
  description:
    "Live song requests and hype for indie artists and streamers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-white min-h-screen antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
