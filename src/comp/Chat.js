import React, { useState, useEffect, useRef } from 'react';

const wsUrl = 'ws://localhost:8000/ws/chat/';

function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null); // 使用 useRef 管理 WebSocket 实例

  useEffect(() => {
    // 创建 WebSocket 实例并将其保存在 ref 中
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = (event) => {
      console.log('WebSocket connection established');
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, data.message]);
    };

    socketRef.current.onclose = (event) => {
      console.log('WebSocket connection closed');
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // 组件卸载时关闭 WebSocket 连接
    return () => {
      socketRef.current.close();
    };
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();
    if (message !== '') {
      // 使用 ref 中的 WebSocket 实例发送消息
      if (socketRef.current) {
        socketRef.current.send(JSON.stringify({ message }));
        setMessage('');
      }
    }
  };

  return (
    <div>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
