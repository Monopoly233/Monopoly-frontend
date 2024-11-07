import React, { useState, useEffect, useRef } from 'react';
import './App.css';
// import Player from './comp/player';
// import MoneySet from './comp/monyset';
import ClientStatus from './comp/ClientStatus';
import Bank from './comp/bank';
import PlayerPool from './comp/playerpool';

const wsUrl = 'ws://192.168.139:8000/ws/player_pool/';

function App() {
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [clientName, setClientName] = useState('Your Name');
  const [clientBalance, setClientBalance] = useState(15150000);  // 恢复初始金钱
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log('WebSocket connection established');
      sendClientStatus();
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Message from server:', data);
      if (data.type === 'player_list') {
        setPlayers(data.players);
        updateClientInfo(data.players);
      } else if (data.type === 'money_request' || data.type === 'money_sent') {
        handleMoneyTransaction(data);
      }
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const sendClientStatus = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'client_status',
        name: clientName,
        balance: clientBalance
      }));
    }
  };

  const updateClientInfo = (playerList) => {
    const clientPlayer = playerList.find(player => player.name === clientName);
    if (clientPlayer) {
      setClientName(clientPlayer.name);
      setClientBalance(clientPlayer.balance);
    }
  };

  const handleMoneyTransaction = (data) => {
    console.log('Money transaction:', data);
    // 处理金钱交易通知，可能需要更新UI或显示通知
  };

  const handleSelectPlayer = (name) => {
    setSelectedPlayers(prev =>
      prev.includes(name) ? prev.filter(player => player !== name) : [...prev, name]
    );
  };

  const handleRequestTransfer = (amount) => {
    if (selectedPlayers.length > 0 && socketRef.current) {
      socketRef.current.send(JSON.stringify({
        type: 'request_money',
        targets: selectedPlayers,
        amount: amount
      }));
    }
  };

  const handleSendTransfer = (amount) => {
    if (selectedPlayers.length > 0 && socketRef.current) {
      socketRef.current.send(JSON.stringify({
        type: 'send_money',
        targets: selectedPlayers,
        amount: amount
      }));
    }
  };

  const handleNameChange = (newName) => {
    setClientName(newName);
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({
        type: 'name_update',
        name: newName
      }));
    }
  };

  return (
    <div className="app-container">
      <div className="players-container">
        <ClientStatus 
          name={clientName} 
          balance={clientBalance}
          onNameChange={handleNameChange}
        />
        <Bank name="Bank" onSelect={handleSelectPlayer} />
        <h1>player pool</h1>
        <PlayerPool 
          players={players.filter(player => player.name !== clientName)} 
          onSelectPlayer={handleSelectPlayer}
          selectedPlayers={selectedPlayers}
        />
        <h1>player pool</h1>
      </div>
    </div>
  );
}

export default App;