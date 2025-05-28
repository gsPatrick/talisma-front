// src/componentsAgro/FooterAgro/FooterAgro.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Typography, Space, Divider } from 'antd';
import { MailOutlined, WhatsAppOutlined, InstagramOutlined, LinkedinOutlined, YoutubeOutlined } from '@ant-design/icons'; // Ícones sociais
import './FooterAgro.css';

const { Title, Paragraph, Text } = Typography;

// Placeholder Logo - Use a mesma URL do HeaderAgro
const logoUrl = "https://i.imgur.com/xOouAUy.png"; // << Use sua URL real aqui >>

// Dados mockados para contato e links (ajuste conforme seu sistema)
const contactInfo = {
    email: "contato@suaagrostore.com.br", // << Ajuste o email >>
    whatsapp: "41987654321", // << Ajuste o número (apenas números) >>
    whatsappDisplay: "(41) 98765-4321" // << Ajuste o número formatado >>
};

const quickLinks = [
    { name: "Página Inicial", path: "/ecommerce" },
    { name: "Produtos", path: "/produtos" },
    { name: "Sobre Nós", path: "/sobre-nos" }, // Rota adicionada recentemente
    { name: "Minha Conta", path: "/minha-conta" }, // Rota adicionada recentemente
    { name: "Meus Pedidos", path: "/meus-pedidos" }, // Rota adicionada recentemente
    { name: "Termos de Uso", path: "/termos" }, // Placeholder - crie a rota se precisar
    { name: "Política de Privacidade", path: "/privacidade" }, // Placeholder - crie a rota se precisar
    { name: "Perguntas Frequentes", path: "/faq" }, // Placeholder - crie a rota se precisar
];

const socialLinks = [
    { icon: <InstagramOutlined />, url: "https://instagram.com/suaagrostore" }, // << Ajuste URLs >>
    { icon: <LinkedinOutlined />, url: "https://linkedin.com/company/suaagrostore" },
    { icon: <YoutubeOutlined />, url: "https://youtube.com/suaagrostore" },
    // Adicione outros se tiver
];

const FooterAgro = () => {
  return (
    <footer className="agro-footer">
      <div className="agro-footer-container">
        <Row gutter={[32, 32]} className="footer-row"> {/* Adicionada classe para animação */}
          {/* Coluna 1: Logo, Descrição e Redes Sociais */}
          <Col xs={24} md={12} lg={8} className="footer-col"> {/* Adicionada classe para animação */}
            <div className="footer-brand">
                {/* Link do Logo */}
                <Link to="/ecommerce">
                    <img src={logoUrl} alt="AgroStore Logo" className="footer-logo" />
                </Link>
              <Paragraph className="footer-description">
                 Seu parceiro online no agronegócio, oferecendo produtos de qualidade e suporte especializado para impulsionar sua produtividade no campo.
              </Paragraph>
              <Space size="middle" className="footer-social-icons">
                {socialLinks.map((social, index) => (
                  <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={`Visitar AgroStore no ${social.url.includes('instagram') ? 'Instagram' : social.url.includes('linkedin') ? 'LinkedIn' : 'YouTube'}`}>
                    {social.icon}
                  </a>
                ))}
              </Space>
            </div>
          </Col>

          {/* Coluna 2: Links Rápidos */}
          <Col xs={24} sm={12} md={6} lg={8} className="footer-col"> {/* Adicionada classe para animação */}
            <Title level={5} className="footer-section-title">Links Rápidos</Title>
            <Space direction="vertical" size={8} className="footer-links">
              {quickLinks.map((link, index) => (
                <Link key={index} to={link.path} className="footer-link">{link.name}</Link>
              ))}
            </Space>
          </Col>

          {/* Coluna 3: Entre em Contato */}
          <Col xs={24} sm={12} md={6} lg={8} className="footer-col"> {/* Adicionada classe para animação */}
            <Title level={5} className="footer-section-title">Entre em Contato</Title>
            <Space direction="vertical" size={8} className="footer-contact">
              <Space>
                <MailOutlined className="contact-icon" />
                <a href={`mailto:${contactInfo.email}`} className="footer-link">{contactInfo.email}</a>
              </Space>
               <Space>
                 <WhatsAppOutlined className="contact-icon" />
                 {/* Link para WhatsApp Web/App */}
                 <a href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="footer-link">WhatsApp Suporte ({contactInfo.whatsappDisplay})</a>
               </Space>
              {/* Adicione endereço, telefone fixo, etc. se necessário */}
            </Space>
          </Col>
        </Row>

        <Divider className="footer-divider" />

        {/* Seção de Copyright e Desenvolvedor */}
        <div className="footer-bottom">
          <Paragraph className="footer-copyright">
            © {new Date().getFullYear()} Sua AgroStore. Todos os direitos reservados.
          </Paragraph>
          {/* Opcional: Linha de desenvolvedor - LINK ATUALIZADO */}
           <Paragraph className="footer-developer">
             Desenvolvido com <span style={{ color: '#e15947' }}>❤️</span> por <a href="https://codebypatrick.dev" target="_blank" rel="noopener noreferrer">Patrick.Developer</a>
          </Paragraph>
        </div>
      </div>
    </footer>
  );
};

export default FooterAgro;