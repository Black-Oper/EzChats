import React, { useState } from 'react';
import './Chat.css';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-input-form">
      <input
        type="text"
        className="message-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Digite sua mensagem..."
        aria-label="Digite sua mensagem"
      />
      <button type="submit" className="send-button">
        Enviar
      </button>
    </form>
  );
};

export default MessageInput;