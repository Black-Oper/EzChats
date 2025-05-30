import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import logo from '../../src-tauri/icons/icon.png';
import './Formulario.css';

interface FormData {
  name: string;
  url: string;
  port: string;
  port_client: string;
  ip: string;
}

const Formulario: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    url: '',
    port: '',
    port_client: '',
    ip: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await invoke('start_server', {
        username: formData.name,
        url: formData.url,
        port: parseInt(formData.port, 10),
        portClient: parseInt(formData.port_client, 10),
        ip: formData.ip,
      });
      navigate('/chat', { state: { connectionData: formData } });
    } catch (error) {
      console.error('Erro ao iniciar o servidor:', error);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="form-header">
          <img src={logo} alt="EZ Chats Logo" className="logo" />
        </div>
        <form className="form-body" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Nome"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="ip"
            placeholder="IP"
            value={formData.ip}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="url"
            placeholder="URL"
            value={formData.url}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="port"
            placeholder="Porta"
            value={formData.port}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="port_client"
            placeholder="Porta do Cliente"
            value={formData.port_client}
            onChange={handleChange}
            required
          />
          <button type="submit">Entrar no Chat</button>
        </form>
      </div>
    </div>
  );
};

export default Formulario;
