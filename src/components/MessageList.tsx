import React from 'react';
import { Message } from './types';
import './Chat.css';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((msg) => (
        <div key={msg.id} className={`message-container ${msg.sender}`}>
          <div className="message-bubble">{msg.text}</div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;