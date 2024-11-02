import React, { useState } from 'react';
import { formatBalance } from './utils';
import './player.css';

function Player({ name, balance, onSelect, isSelected }) {
  const handleClick = () => {
    onSelect(name);
  };

  return (
    <div 
      className={`player-container ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(name)}
    >
      <h1 className="player-title">{name}</h1>
      <p className="player-balance">Balance: {formatBalance(balance)}</p>
    </div>
  );
}

export default Player;