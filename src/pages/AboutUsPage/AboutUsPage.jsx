// src/pages/AboutUsPage/AboutUsPage.jsx
import React from 'react';
import { Layout, Row, Col, Typography, Card, Avatar, Button } from 'antd';
import { EnvironmentOutlined, TeamOutlined, RocketOutlined, CheckCircleOutlined, WhatsAppOutlined, StarOutlined, UserOutlined } from '@ant-design/icons'; // Adicionado StarOutlined e UserOutlined
import HeaderAgro from '../../componentsAgro/HeaderAgro/HeaderAgro';
// import FooterLP from '../../componentsLP/FooterLP';
import FooterAgro from '../../componentsAgro/FooterAgro/FooterAgro';    // Importando FooterAgro
import './AboutUsPage.css';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

// Placeholder para Imagem Principal (Campo, Fazenda, etc.)
const heroImageUrl = 'https://placehold.co/600x600.png';

// URL do placeholder para a Imagem representativa na seção História/Missão
const historyImageUrl = 'https://placehold.co/600x600.png';

// URL do placeholder para a Imagem na seção "Por que nos Escolher?"
const whyChooseUsImageUrl = 'https://placehold.co/600x600.png';

// URL do placeholder para a Imagem na seção "Nossa Equipe"
const teamImageUrl = 'https://placehold.co/600x600.png';

// Placeholder para Mapa (se usar imagem - atualmente usando iframe)
const mapImageUrl = 'https://placehold.co/600x600.png';


const AboutUsPage = () => {
  return (
    <Layout className="ecommerce-layout about-us-layout">
      {typeof HeaderAgro === 'function' ? <HeaderAgro /> : null}

      <Content className="ecommerce-main-content about-us-content">
        {/* Seção Hero da Página Sobre */}
        <div className="about-hero" style={{ backgroundImage: `url(${heroImageUrl})` }}>
          <div className="about-hero-overlay"></div>
          <Title level={1} className="about-hero-title">Conheça a AgroStore</Title>
          <Paragraph className="about-hero-subtitle">Nossa paixão pelo campo, impulsionando o seu negócio.</Paragraph>
        </div>

        {/* Seção Nossa História e Missão */}
        <section className="about-section history-mission-section">
          <Row gutter={[32, 32]} align="middle">
            {/* Coluna do Texto (Missão e História) */}
            <Col xs={24} md={12}>
              <div className="animated-text-block">
                 <Title level={3} className="section-title"><RocketOutlined /> Nossa Missão</Title>
                 <Paragraph className="section-text">
                    Facilitar o acesso a produtos e soluções inovadoras para o agronegócio brasileiro, combinando tecnologia, conhecimento técnico e um atendimento próximo, ajudando nossos clientes a alcançarem máxima produtividade e rentabilidade de forma sustentável.
                 </Paragraph>
                 <Title level={3} className="section-title" style={{ marginTop: '2rem' }}><TeamOutlined /> Nossa História</Title>
                 <Paragraph className="section-text">
                    Nascemos da união de especialistas apaixonados pelo campo e pela tecnologia. Percebemos a necessidade de um parceiro que fosse além da simples venda, oferecendo suporte real e produtos de confiança para o produtor rural. Desde [Ano de Fundação], trabalhamos lado a lado com agricultores e pecuaristas, entendendo seus desafios e celebrando suas conquistas.
                 </Paragraph>
              </div>
            </Col>
            {/* Coluna da Imagem representativa da História */}
            <Col xs={24} md={12}>
               <img src={historyImageUrl} alt="Imagem Representativa História AgroStore" className="about-section-image animated-image" /> {/* Usando classe genérica e de animação */}
            </Col>
          </Row>
        </section>

        {/* Nova Seção: Por que nos Escolher? */}
        <section className="about-section why-choose-us-section">
            <Row gutter={[32, 32]} align="middle">
                {/* Coluna da Imagem */}
                <Col xs={24} md={12}>
                    <img src={whyChooseUsImageUrl} alt="Imagem Por Que Escolher AgroStore" className="about-section-image animated-image" /> {/* Usando classe genérica e de animação */}
                </Col>
                {/* Coluna do Texto com Tópicos */}
                <Col xs={24} md={12}>
                   <div className="animated-text-block">
                    <Title level={3} className="section-title"><StarOutlined /> Por que nos Escolher?</Title>
                    <Paragraph className="section-text">
                       Somos mais que um e-commerce. Somos seu parceiro no campo, oferecendo:
                    </Paragraph>
                    <ul>
                        <li><CheckCircleOutlined style={{ color: '#005C40', marginRight: '8px' }} /> Ampla variedade de produtos de qualidade.</li>
                        <li><CheckCircleOutlined style={{ color: '#005C40', marginRight: '8px' }} /> Preços competitivos e condições facilitadas.</li>
                        <li><CheckCircleOutlined style={{ color: '#005C40', marginRight: '8px' }} /> Suporte técnico especializado.</li>
                        <li><CheckCircleOutlined style={{ color: '#005C40', marginRight: '8px' }} /> Logística eficiente para todo o Brasil.</li>
                        <li><CheckCircleOutlined style={{ color: '#005C40', marginRight: '8px' }} /> Plataforma fácil de usar e segura.</li>
                    </ul>
                   </div>
                </Col>
            </Row>
        </section>


         {/* Seção Nossos Valores (Exemplo) - Mantida, pode ser reposicionada */}
         <section className="about-section values-section">
             <Title level={3} className="section-title center">Nossos Valores</Title>
             <Row gutter={[24, 24]} justify="center">
                 <Col xs={24} sm={12} md={8} className="value-item">
                    <CheckCircleOutlined className="value-icon" />
                    <Title level={5}>Confiança</Title>
                    <Paragraph>Relações transparentes e produtos de origem comprovada.</Paragraph>
                 </Col>
                 <Col xs={24} sm={12} md={8} className="value-item">
                    <CheckCircleOutlined className="value-icon" />
                    <Title level={5}>Inovação</Title>
                    <Paragraph>Buscamos constantemente as melhores tecnologias e soluções.</Paragraph>
                 </Col>
                 <Col xs={24} sm={12} md={8} className="value-item">
                    <CheckCircleOutlined className="value-icon" />
                    <Title level={5}>Parceria</Title>
                    <Paragraph>Estamos juntos com o produtor, do plantio à colheita.</Paragraph>
                 </Col>
             </Row>
         </section>

         {/* Nova Seção: Nossa Equipe (Simples) */}
         <section className="about-section team-section">
            <Title level={3} className="section-title center"><UserOutlined /> Nossa Equipe</Title>
            <Row gutter={[32, 32]} align="middle" justify="center">
                <Col xs={24} md={16}> {/* Coluna para a imagem da equipe */}
                    <img src={teamImageUrl} alt="Imagem Representativa Nossa Equipe" className="about-section-image animated-image" /> {/* Usando classe genérica e de animação */}
                </Col>
                 {/* Poderia adicionar fotos individuais da equipe aqui, usando Card ou Avatar */}
            </Row>
             <div style={{textAlign: 'center', marginTop: '2rem'}}>
                 <Paragraph className="section-text" style={{ maxWidth: '800px', margin: 'auto' }}>
                     Contamos com um time de profissionais experientes e dedicados, prontos para oferecer o melhor atendimento e suporte técnico para você. Conheça alguns dos nossos especialistas!
                 </Paragraph>
                  {/* Botão opcional para "Conheça o Time" se houver uma página dedicada */}
                  {/* <Button type="primary" style={{ marginTop: '1rem' }}>Conheça o Time Completo</Button> */}
             </div>
         </section>


        {/* Seção Onde Estamos (Opcional) */}
        <section className="about-section location-section">
          <Title level={3} className="section-title center"><EnvironmentOutlined /> Onde Estamos?</Title>
          <Row gutter={[32, 32]} align="middle">
            {/* Coluna do Mapa/Iframe */}
            <Col xs={24} md={12}>
              <div className="map-container animated-map">
                {/* Iframe do Google Maps (Substitua o SRC pela sua localização real) */}
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.145700286007!2d-46.65680008543856!3d-23.56331566750199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c51353!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1678886501234!5m2!1spt-BR!2sbr" // SRC de Exemplo (Av. Paulista) - SUBSTITUA PELA SUA LOCALIZAÇÃO REAL
                    width="100%"
                    height="350"
                    style={{ border: 0, borderRadius: '8px' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização AgroStore" // Título para acessibilidade
                ></iframe>
              </div>
            </Col>
            {/* Coluna do Endereço/Texto */}
            <Col xs={24} md={12}>
                <div className="location-text-block">
                    <Paragraph strong>Nosso Centro de Distribuição:</Paragraph>
                    <Paragraph>
                        Rua Exemplo Agro, 123 - Bairro Rural<br />
                        Cidade Agrícola, AG - 12345-678<br />
                        Brasil
                    </Paragraph>
                    <Paragraph>
                        Venha nos visitar ou entre em contato para saber mais sobre nossas soluções e entregas na sua região.
                    </Paragraph>
                    {/* Exemplo de botão de contato */}
                    {/* <Button type="primary" icon={<WhatsAppOutlined />} href="#" target="_blank" rel="noopener noreferrer">Fale Conosco pelo WhatsApp</Button> */}
                </div>
            </Col>
          </Row>
        </section>

      </Content>


    
      {/* Rodapé */}
      <FooterAgro />
    </Layout>
  );
};

export default AboutUsPage;