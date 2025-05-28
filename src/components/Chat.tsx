// src/components/Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Message } from './types';
import MessageInput from './MessageInput';
import './Chat.css';
import { useLocation } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';

interface FormData {
  name: string;
  url: string;
  port: string;
  port_client: string;
}

interface LocationState {
  connectionData: FormData;
}

const Chat: React.FC = () => {

  const location = useLocation();
  const state = location.state as LocationState | null;
  const connectionData = state?.connectionData;

  if (!connectionData) {
    return <div>Dados de conexão não encontrados. Por favor, volte e preencha o formulário.</div>;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
  const userMessage: Message = {
    id: Date.now(),
    text,
    sender: connectionData.name,
    timestamp: Date.now(),
  };
  setMessages((prevMessages) => [...prevMessages, userMessage]);

  try {
    // Convert timestamp to string (Rust function expects String)
    const timestampStr = userMessage.timestamp?.toString();

    // Call Rust function with proper typing
    const result = await invoke<string>('send_message', {
      username: userMessage.sender,
      text: userMessage.text,
      timestamp: timestampStr,
    });

    console.log('Mensagem enviada com sucesso:', result);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
};

  return (
    <div className="chat-window">
      <div className="message-list" ref={messageListRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`message-container ${msg.sender}`}>
              <div className="message-bubble">{msg.text}</div>
            </div>
          ))}
      </div>
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};


export default Chat;