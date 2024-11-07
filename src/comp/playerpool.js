import React, { useReducer, useEffect, useCallback, useState } from 'react';
import Player from './player';
import MoneySet from './monyset';
import useWebSocket from './useWebSocket';
import './player.css';

const initialState = {
  onlinePlayers: [],
  selectedPlayers: [],
  personalInfo: null,
  isEditing: false,
  newName: '',
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ONLINE_PLAYERS':
      return { ...state, onlinePlayers: action.players };
    case 'SET_PERSONAL_INFO':
      return { ...state, personalInfo: action.info };
    case 'UPDATE_PLAYER_INFO':
        const updatedPersonalInfo = state.personalInfo && state.personalInfo.name === action.info.name
        ? { ...state.personalInfo, ...action.info }
        : state.personalInfo;
      console.log('Updating personal info:', updatedPersonalInfo); // 添加日志
      return {
        ...state,
        onlinePlayers: state.onlinePlayers.map(player =>
          player.name === action.info.name ? { ...player, ...action.info } : player
        ),
        personalInfo: state.personalInfo && state.personalInfo.name === action.info.name
          ? { ...state.personalInfo, ...action.info }
          : state.personalInfo
      };
    case 'TOGGLE_PLAYER_SELECTION':
      return {
        ...state,
        selectedPlayers: state.selectedPlayers.includes(action.playerName)
          ? state.selectedPlayers.filter(name => name !== action.playerName)
          : [...state.selectedPlayers, action.playerName]
      };
    case 'SET_EDITING':
      return { ...state, isEditing: action.isEditing, newName: action.newName || state.newName };
    case 'SET_NEW_NAME':
      return { ...state, newName: action.newName };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

function PlayerPool() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { onlinePlayers, selectedPlayers, personalInfo, isEditing, newName, error } = state;
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const forceUpdate = useCallback(() => {
    setUpdateTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (onlinePlayers.length > 0) {
        forceUpdate();
    }
    }, [onlinePlayers, forceUpdate]);

  const handleMessage = useCallback((data) => {
    console.log('Message from server:', data);
    switch(data.type) {
      case 'player_list':
        dispatch({ type: 'SET_ONLINE_PLAYERS', players: data.players });
        break;
      case 'personal_info':
        dispatch({ type: 'SET_PERSONAL_INFO', info: data });
        break;
      case 'broadcast_personal_info':
        dispatch({ type: 'UPDATE_PLAYER_INFO', info: data.info });
        break;
      case 'money_request':
      case 'money_sent':
        console.log(`${data.type === 'money_request' ? 'Request' : 'Sent'}: ${data.amount} from ${data.sender || data.requester} to ${data.target || data.targets.join(', ')}`);
        break;
      case 'error':
        dispatch({ type: 'SET_ERROR', error: data.message });
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }, []);

  const { sendMessage } = useWebSocket('ws://192.168.1.139:8000/ws/player_pool/', handleMessage);

  useEffect(() => {
    sendMessage({ type: 'get_personal_info' });
    sendMessage({ type: 'get_player_list' });
  }, [sendMessage]);

  useEffect(() => {
    console.log('personalInfo updated:', personalInfo);
  }, [personalInfo]);

  const handleSelectPlayer = useCallback((playerName) => {
    if (playerName !== personalInfo?.name) {
      dispatch({ type: 'TOGGLE_PLAYER_SELECTION', playerName });
    }
  }, [personalInfo]);

  const handleRequestTransfer = useCallback((amount) => {
    if (selectedPlayers.length > 0 && personalInfo) {
      sendMessage({
        type: 'request_money',
        targets: selectedPlayers,
        amount: amount,
        whosent: personalInfo.name
      });
      dispatch({ type: 'CLEAR_ERROR' });
    }
  }, [selectedPlayers, personalInfo, sendMessage]);

  const handleSendTransfer = useCallback((amount) => {
    if (selectedPlayers.length > 0 && personalInfo) {
      sendMessage({
        type: 'send_money',
        targets: selectedPlayers,
        amount: amount,
        whosent: personalInfo.name
      });
      dispatch({ type: 'CLEAR_ERROR' });
    }
  }, [selectedPlayers, personalInfo, sendMessage]);

  const handleNameChange = useCallback(() => {
    if (newName.trim() !== '') {
      sendMessage({
        type: 'update_name',
        name: newName
      });
      dispatch({ type: 'SET_EDITING', isEditing: false });
      dispatch({ type: 'CLEAR_ERROR' });
    }
  }, [newName, sendMessage]);

  return (
    <div className="player-pool">
      {error && <div className="error-message">{error}</div>}
      <div className="personal-info">
        <h2>Your Info</h2>
        {personalInfo ? (
          <>
            <p>
              Name: {isEditing ? (
                <input 
                  value={newName} 
                  onChange={(e) => dispatch({ type: 'SET_NEW_NAME', newName: e.target.value })}
                  onBlur={handleNameChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleNameChange()}
                />
              ) : (
                <span onClick={() => dispatch({ type: 'SET_EDITING', isEditing: true, newName: personalInfo.name })}>
                  {personalInfo.name}
                </span>
              )}
            </p>
            <p key={updateTrigger}>Balance: {personalInfo.balance}</p>
          </>
        ) : (
          <p>Loading personal info...</p>
        )}
      </div>
      <h2>Online Players</h2>
      <div className="player-list">
        {onlinePlayers.filter(player => player.name !== personalInfo?.name).map((player) => (
          <Player
            key={player.name}
            name={player.name}
            balance={player.balance}
            onSelect={handleSelectPlayer}
            isSelected={selectedPlayers.includes(player.name)}
          />
        ))}
      </div>
      <MoneySet
        selectedPlayers={selectedPlayers}
        onRequestTransfer={handleRequestTransfer}
        onSendTransfer={handleSendTransfer}
      />
    </div>
  );
}

export default PlayerPool;