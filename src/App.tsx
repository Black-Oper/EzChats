// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Formulario from './components/Formulario';
import Chat from './components/Chat';
import './App.css'; // Importando o CSS global

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Rota inicial que renderiza o formulário */}
        <Route path="/" element={<Formulario />} />

        {/* Rota do chat */}
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
};

export default App;