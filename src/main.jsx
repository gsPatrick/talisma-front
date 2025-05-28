

// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { CartProvider } from './context/CartContext.jsx';
// <<< IMPORTAR PROVIDER DE AUTENTICAÇÃO >>>
import { AuthProvider } from './context/AuthContext.jsx'; // Assumindo este caminho
import 'antd/dist/reset.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* <<< ENVOLVER App COM AuthProvider >>> */}
      <AuthProvider>
        {/* CartProvider também deve estar dentro do BrowserRouter */}
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider> {/* <<< FIM WRAPPER AuthProvider >>> */}
    </BrowserRouter>
  </React.StrictMode>,
);