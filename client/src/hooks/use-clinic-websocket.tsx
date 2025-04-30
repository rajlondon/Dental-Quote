import { useRef, useState } from 'react';

// This is a placeholder hook that completely disables WebSocket functionality
// for the clinic portal to prevent refresh issues
export interface WebSocketMessage {
  type: string;
  payload: any;
  sender?: {
    id: string;
    type: 'patient' | 'clinic' | 'admin';
  };
  target?: string;
  message?: string;
}

type MessageHandler = (message: WebSocketMessage) => void;

interface WebSocketHookResult {
  connected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: WebSocketMessage) => void;
  registerMessageHandler: (type: string, handler: MessageHandler) => void;
  unregisterMessageHandler: (type: string) => void;
}

// Special stub version that doesn't actually connect to WebSocket
export const useClinicWebSocket = (): WebSocketHookResult => {
  console.log('MOCK WebSocket: Using stub WebSocket implementation for clinic portal');
  const [connected] = useState(true); // Always report as connected
  const lastMessageRef = useRef<WebSocketMessage | null>(null);
  
  // Dummy functions that do nothing
  const sendMessage = () => {
    console.log('MOCK WebSocket: Message send prevented in clinic portal');
  };
  
  const registerMessageHandler = () => {
    console.log('MOCK WebSocket: Handler registration ignored in clinic portal');
  };
  
  const unregisterMessageHandler = () => {
    console.log('MOCK WebSocket: Handler unregistration ignored in clinic portal');
  };
  
  return {
    connected,
    lastMessage: lastMessageRef.current,
    sendMessage,
    registerMessageHandler,
    unregisterMessageHandler
  };
};

// Export a compatible hook that looks like the real one but doesn't do anything
export const useWebSocket = useClinicWebSocket;