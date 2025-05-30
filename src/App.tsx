// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Formulario from './components/Formulario';
import Chat from './components/Chat';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Formulario />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
};

export default App;