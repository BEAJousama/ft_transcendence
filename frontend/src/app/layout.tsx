import AppProvider from "@/context/app.context";
import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import GameProvider from "@/context/socket.context";
import SocketProvider from "@/context/game.context";
import ChatProvider from "@/context/chat.context";
import { ToastContainer, toast, Slide } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ft_transcendence",
  // description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    <html lang="en">
      <AppProvider>
        <SocketProvider>
          {/* <ChatProvider> */}
          <GameProvider>
            <body className={montserrat.className} suppressHydrationWarning>{children}</body>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              limit={2}
              hideProgressBar={false}
              newestOnTop
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              transition={Slide}
            />
          </GameProvider>
          {/* </ChatProvider> */}
        </SocketProvider>
      </AppProvider>
    </html>
  );
}
