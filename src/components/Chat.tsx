import React, { useState, useEffect, useRef } from 'react';
import { Message } from './types';
import MessageInput from './MessageInput';
import './Chat.css';
import { useLocation } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

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
  const formatTimestampToHHMM = (timestamp: number | undefined): string => {
    if (!timestamp) {
      return '';
    }

    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

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

  useEffect(() => {
    const unlistenPromise = listen<Array<string>>('new_message', (event) => {

      const payload = event.payload;

      const username = payload[0];
      
      if (username !== connectionData.name) {
        console.log('Nova mensagem recebida:', event.payload);
        const newMessage: Message = {
          id: Date.now(),
          text: payload[2],
          sender: username,
          timestamp: Date.now(),
        };
        
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, [connectionData.name]);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now(),
      text,
      sender: connectionData.name,
      timestamp: Date.now(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const timestampStr = userMessage.timestamp?.toString();
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
    <div className="container">
      <div className="card chat-window">
        <div className="message-list" ref={messageListRef}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-container ${
                msg.sender === connectionData.name ? 'user' : 'client'
              }`}
            >
              <div className="message-bubble">
                <h3>{msg.sender}</h3>
                <p>{msg.text}</p>
                <span className="timestamp">
                  {formatTimestampToHHMM(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default Chat;