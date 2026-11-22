import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider }  from "@/lib/wallet-context";
import { ProfileProvider } from "@/lib/profile-context";

export const metadata: Metadata = {
  title: "CampusPay — Student Payments on Stellar",
  description: "Send, receive and split XLM with Nigerian university students",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <ProfileProvider>
            {children}
          </ProfileProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
