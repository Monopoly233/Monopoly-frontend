import React, { useState } from 'react';
import './monyset.css';

function MoneySet({ selectedPlayers, onRequestTransfer, onSendTransfer }) {
  const [millions, setMillions] = useState('');
  const [thousands, setThousands] = useState('');

  const calculateTotalAmount = () => {
    const millionAmount = parseFloat(millions) || 0;
    const thousandAmount = parseFloat(thousands) || 0;
    return millionAmount * 1_000_000 + thousandAmount * 1_000;
  };

  const handleRequest = () => {
    const totalAmount = calculateTotalAmount();
    if (totalAmount > 0) {
      onRequestTransfer(totalAmount);
      setMillions('');
      setThousands('');
    }
  };

  const handleSend = () => {
    const totalAmount = calculateTotalAmount();
    if (totalAmount > 0) {
      onSendTransfer(totalAmount);
      setMillions('');
      setThousands('');
    }
  };

  return (
    <div className="moneyset-container">
      <div className="transfer-amount">
        <label htmlFor="transfer-millions">Amount of Money:</label>
        <div className="amount-inputs">
          <input
            type="number"
            id="transfer-millions"
            value={millions}
            onChange={(e) => setMillions(e.target.value)}
            placeholder="Millions (M)"
            inputMode="numeric"
          />
          <input
            type="number"
            id="transfer-thousands"
            value={thousands}
            onChange={(e) => setThousands(e.target.value)}
            placeholder="Thousands (K)"
            inputMode="numeric"
          />
        </div>
      </div>
      <div className="transfer-buttons">
        <button 
          className="request-button" 
          onClick={handleRequest} 
          disabled={selectedPlayers.length === 0}
        >
          Request
        </button>
        <button 
          className="send-button" 
          onClick={handleSend} 
          disabled={selectedPlayers.length === 0}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default MoneySet;