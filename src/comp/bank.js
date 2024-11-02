import React, { useState } from 'react';
import './player.css'; // 你可以继续使用相同的样式文件

function Bank({ name, onSelect }) {
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = () => {
    setIsSelected(!isSelected);
    onSelect(name);
  };

  return (
    <div 
      className={`player-container ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <div className="player-info">
        <h1 className="bank-title">{name}</h1>
      </div>
    </div>
  );
}

export default Bank;
