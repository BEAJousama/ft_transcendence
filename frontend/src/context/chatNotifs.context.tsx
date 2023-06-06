import React, { createContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export interface IChatNotifs {
  newMessages: Map<string, number>;
  addNewMessages: (channelId: string) => void;
  resetNewMessages: (channelId: string) => void;
}

export const ChatNotifsContext = createContext<IChatNotifs>({
  newMessages : {} as Map<string, number>,
  addNewMessages: (channelId: string) => {},
  resetNewMessages: (channelId: string) => {},
});

export default function ChatNotifsProvider({ children }: { children: React.ReactNode }) {
  const [newMessages, setNewMessages] = useState<Map<string, number>>(new Map<string, number>());

  const resetNewMessages = (channelId : string) => {
    if (newMessages.has(channelId))
        newMessages.delete(channelId);
  };

  const addNewMessages = (channelId: string) => {
    const updatedMessages = new Map<string, number>(newMessages);
    if (updatedMessages.has(channelId)) {
      updatedMessages.set(channelId, updatedMessages.get(channelId)! + 1);
    } else {
      updatedMessages.set(channelId, 1);
    }
    console.log(updatedMessages);
    setNewMessages(updatedMessages);
  };

  const chatNotifsValue: IChatNotifs = {
    newMessages: newMessages,
    addNewMessages: addNewMessages,
    resetNewMessages: resetNewMessages,
  };

  return <ChatNotifsContext.Provider value={chatNotifsValue}>{children}</ChatNotifsContext.Provider>;
}
