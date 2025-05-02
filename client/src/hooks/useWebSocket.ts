import { useState, useEffect, useRef } from "react";

type WebSocketStatus = "connecting" | "connected" | "disconnected";

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: string;
}

export function useWebSocket() {
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    setStatus("connecting");
    
    socket.onopen = () => {
      console.log("WebSocket connection established");
      setStatus("connected");
    };
    
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    socket.onclose = () => {
      console.log("WebSocket connection closed");
      setStatus("disconnected");
    };
    
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setStatus("disconnected");
    };
    
    // Clean up function
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);
  
  // Function to send message to server
  const sendMessage = (message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  };
  
  return {
    status,
    lastMessage,
    sendMessage
  };
}