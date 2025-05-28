// src/components/Formulario.tsx

import React, { useState } from 'react';
import { useNavigate} from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import './Formulario.css';

// Definindo a interface para os dados do formulário
interface FormData {
  name: string;
  url: string;
  port: string;
  port_client: string;
}

const Formulario: React.FC = () => {
  // Hook para navegação
  const navigate = useNavigate();

  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState<FormData>({
    name: '',
    url: '',
    port: '',
    port_client: '',
  });

  // Função para atualizar o estado conforme o usuário digita
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Função para lidar com o submit do formulário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Dados enviados:', formData);

    try {
      // Chamando a função do backend Tauri
      await invoke('start_server', {
        username: formData.name,
        url: formData.url,
        port: parseInt(formData.port, 10),
        portClient: parseInt(formData.port_client, 10),
      });
      
      // Navega para a página de chat se o servidor iniciar com sucesso
      navigate('/chat', { state: { connectionData: formData } });
    } catch (error) {
      console.error('Erro ao iniciar o servidor:', error);
    }
  };

  return (
    <div className="container">
        <div className="card">
            <div className="form-header">
                <h1>EZ_chats</h1>
            </div>
            <div className="form-body">
                <form onSubmit={handleSubmit}>
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
    </div>
  );
};

export default Formulario;