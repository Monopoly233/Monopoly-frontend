import React, { useState, useEffect, useRef } from 'react';
import { formatBalance } from './utils';
import './clientstatus.css';

function ClientStatus() {
  const [name, setName] = useState('Change Name');
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [balance, setBalance] = useState(15150000);
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connectWebSocket = () => {
      socketRef.current = new WebSocket('ws://192.168.1.138:8000/ws/player_pool/');

      socketRef.current.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        sendClientStatus();
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Message from server:', data);
        if (data.type === 'personal_info') {
          setName(data.name);
          setBalance(data.balance);
        } else if (data.type === 'player_list') {
          // 不再在这里更新本地玩家信息
        }
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
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
  }, []);

  const sendClientStatus = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'client_status',
        name: name,
        balance: balance,
      };
      socketRef.current.send(JSON.stringify(message));
    }
  };

  const handleNameChange = () => {
    if (newName.trim() !== '') {
      setName(newName);
      setIsEditing(false);
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const updateMessage = {
          type: 'update_name',
          name: newName,
        };
        socketRef.current.send(JSON.stringify(updateMessage));
      }
    }
  };

  return (
    <div className="client-status-container">
      <div className="client-info">
        {isEditing ? (
          <div className="edit-container">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
            />
            <button onClick={handleNameChange}>Save</button>
          </div>
        ) : (
          <div className="info-container">
            <h1 className="client-name">{name}</h1>
            <button className="edit-button" onClick={() => {
              setIsEditing(true);
              setNewName(name !== 'Change Name' ? name : '');
            }}>
              {name === 'Change Name' ? 'Change Name' : 'Edit Name'}
            </button>
            <p className="client-balance">Balance: {formatBalance(balance)}</p>
            <p className="connection-status">
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientStatus;