import { useEffect, useRef, useCallback } from 'react';

function useWebSocket(url, onMessage) {
  const socketRef = useRef(null);

  useEffect(() => {
    const connectWebSocket = () => {
      socketRef.current = new WebSocket(url);

      socketRef.current.onopen = () => {
        console.log('WebSocket connection established');
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        setTimeout(connectWebSocket, 5000);
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [url, onMessage]);

  const sendMessage = useCallback((message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  return { sendMessage };
}

export default useWebSocket;