// src/componentsAgro/BenefitsBar.jsx
import React from 'react';
import './BenefitsBar.css'; // Importa os estilos atualizados
import {
  RocketOutlined,
  SafetyCertificateOutlined,
  CustomerServiceOutlined,
  LockOutlined
} from '@ant-design/icons';

const BenefitsBar = () => {
  const benefits = [
    { icon: <RocketOutlined />, text: "Entrega Rápida no Campo" },
    { icon: <SafetyCertificateOutlined />, text: "Produtos de Confiança" },
    { icon: <CustomerServiceOutlined />, text: "Suporte Técnico Especializado" },
    { icon: <LockOutlined />, text: "Compra 100% Segura" }
  ];

  return (
    <section className="benefits-bar-section modern"> {/* Adicionada classe 'modern' */}
      <div className="benefits-container modern">
        {benefits.map((benefit, index) => (
          // Adiciona um wrapper para o link (se for clicável no futuro)
          // ou apenas a div para estilização e animação
          <div key={index} className="benefit-item modern">
              <span className="benefit-icon modern">
                {benefit.icon}
              </span>
              <span className="benefit-text modern">{benefit.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BenefitsBar;