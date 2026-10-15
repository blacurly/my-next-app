import "./globals.css";
import ChatWidget from "@/components/ChatWidget";
import localFont from "next/font/local";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { UserProvider } from "@/context/UserContext";
import { AuthProvider } from "@/context/AuthContext";
import { FavoriteProvider } from "@/context/FavoriteContext";

const fontSans = localFont({
  src: [
    {
      path: "./fonts/PlusJakartaSans-Variable.woff2",
      style: "normal",
    },
    {
      path: "./fonts/PlusJakartaSans-Italic-Variable.woff2",
      style: "italic",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "MyWebsite — Build something meaningful",
  description:
    "We help individuals and businesses build modern, simple, and useful digital experiences.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`dark ${fontSans.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased">
        <UserProvider>
          <AuthProvider>
            <FavoriteProvider>
              <Navbar />

              <main className="flex-1">
                {children}
                <ChatWidget />
              </main>

              <Footer />
            </FavoriteProvider>
          </AuthProvider>
        </UserProvider>
      </body>
    </html>
  );
}