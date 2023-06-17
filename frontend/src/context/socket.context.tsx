import React, { createContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export const SocketContext = createContext<Socket | null>(null);

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io("http://10.11.7.15:3000/chat", {
      auth: {
        token: "Bearer " + localStorage.getItem("access_token"),
      },
    }
    );
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  return (
    <SocketContext.Provider value={socket}> {children} </SocketContext.Provider>
  );
}
