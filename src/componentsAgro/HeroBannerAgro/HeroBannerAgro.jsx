// src/componentsAgro/HeroBannerAgro.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import './HeroBannerAgro.css';

const { Title, Paragraph } = Typography;

// <<< ***** COLOQUE A URL DA SUA IMAGEM REAL AQUI ***** >>>
// Pode ser um link da web (ex: de um serviço como Unsplash, Pexels ou do seu próprio CDN)
// ou um caminho local se a imagem estiver na pasta 'public' do seu projeto Vite (ex: '/images/banner-agro.jpg')
const backgroundImageUrl = 'https://placehold.co/1000x1000.png'; // <<< SUBSTITUA ESTA LINHA!!!
// Exemplo com placeholder (se ainda não tiver a imagem):
// const backgroundImageUrl = 'https://via.placeholder.com/1600x500/005C40/FFFFFF?text=Banner+Principal+Agro';
// <<< *************************************************** >>>


const HeroBannerAgro = () => {
  return (
    <section
      className="hero-banner-agro"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }} // <<< APLICA A IMAGEM AQUI
      role="banner"
    >
      {/* Overlay escuro */}
      <div className="hero-banner-overlay"></div>

      {/* Conteúdo textual e botão */}
      <div className="hero-banner-content">
        <Title level={1} className="hero-banner-title">
          Inovação e Produtividade para o Seu Agronegócio
        </Title>
        <Paragraph className="hero-banner-description">
          Encontre defensivos, fertilizantes, sementes, peças e tudo que você precisa com entrega rápida e suporte técnico especializado.
        </Paragraph>
        <Link to="/produtos">
          <Button
            type="primary"
            size="large"
            className="hero-banner-cta"
            icon={<ArrowRightOutlined />}
          >
            Ver Todos os Produtos
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default HeroBannerAgro;