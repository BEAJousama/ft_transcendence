import React, { createContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export const SocketContext = createContext<Socket | null>(null);

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000/chat", {
      auth: {
        token: "Bearer " + localStorage.getItem("access_token"),
      },
    }
    );
    setSocket(newSocket);
    newSocket.on("connect", () =>
    {
      console.log("Connected");
    }
    )
    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  return (
    <SocketContext.Provider value={socket}> {children} </SocketContext.Provider>
  );
}