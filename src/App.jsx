// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'; // Outlet pode não ser necessário se não houver layout aninhado aqui

// --- Páginas do E-commerce ---
import EcommerceHomePage from './pages/EcommerceHomePage/EcommerceHomePage';
import ProductListPage from './pages/ProductListPage/ProductListPage';
// <<< CORRIGIDO CAMINHO PADRÃO >>>
import ProductDetailPage from './pages/ProducDetailPage/ProductDetailPage'; // Ajuste se seu caminho for diferente
// Adicione outras páginas do e-commerce aqui se precisar (Login, Carrinho, Checkout)
// import LoginEcommercePage from './pages/LoginEcommercePage/LoginEcommercePage';
// import ShoppingCartPage from './pages/ShoppingCartPage/ShoppingCartPage';
import CheckoutPage from './pages/CheckoutCartPage/CheckoutCartPage'; // Se usar checkout específico do carrinho
import AboutUsPage from './pages/AboutUsPage/AboutUsPage'; // <<< NOVA PÁGINA >>>
import AuthPage from './pages/AuthPage/AuthPage';
import AdminDashboardPage from './pages/AdminDashboardPage/AdminDashboardPage';

import MyAccountPage from './pages/MyAccountPage/MyAccountPage';
import MyOrdersPage from './pages/MyOrdersPage/MyOrdersPage';



// --- Componentes Gerais ---
import ScrollToTop from './components/ScrollToTop'; // Assumindo caminho correto

// --- Estilos Globais ---
import './index.css';

// --- Componente Principal App ---
function App() {
  return (
    <>
      {/* Garante scroll para o topo */}
      <ScrollToTop />

      {/* Gerenciador de Rotas */}
      <Routes>
        {/* --- Rotas Principais do E-commerce --- */}

        {/* Home do E-commerce */}
        <Route path="/ecommerce" element={<EcommerceHomePage />} />

        {/* Listagem de Produtos (Geral e por Categoria) */}
        <Route path="/produtos" element={<ProductListPage />} />
        <Route path="/produtos/:categoria" element={<ProductListPage />} />

        {/* Detalhe do Produto */}
        <Route path="/produto/:productId" element={<ProductDetailPage />} />
        {/* Checkout do Carrinho */}
        <Route path="/checkout/cart" element={<CheckoutPage type="cart" />} />
        <Route path="/sobre-nos" element={<AboutUsPage />} /> {/* <<< NOVA ROTA */}
        <Route path="/auth" element={<AuthPage />} /> {/* <<< NOVA ROTA DE AUTENTICAÇÃO */}
        <Route path="/teste" element={<AdminDashboardPage />} />

        <Route path="/minha-conta" element={<MyAccountPage />} />
        <Route path="/meus-pedidos" element={<MyOrdersPage />} />    
            


        {/* Adicione rotas para Carrinho, Checkout, Login E-commerce aqui */}
        {/* Exemplo: */}
        {/* <Route path="/carrinho" element={<ShoppingCartPage />} /> */}
        {/* <Route path="/login-ecommerce" element={<LoginEcommercePage />} /> */}
        {/* <Route path="/checkout-carrinho" element={<CheckoutPage type="cart" />} /> */}


        {/* --- Redirecionamentos e Catch-all --- */}

        {/* Redireciona a raiz "/" para a home do e-commerce */}
        <Route path="/" element={<Navigate to="/ecommerce" replace />} />

        {/* Redireciona qualquer rota não encontrada para a home do e-commerce */}
        <Route path="*" element={<Navigate to="/ecommerce" replace />} />

      </Routes>
    </>
  );
}

export default App;