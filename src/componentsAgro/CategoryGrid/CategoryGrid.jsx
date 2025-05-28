// src/componentsAgro/CategoryGrid.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Typography } from 'antd';
import { BugOutlined, ExperimentOutlined, AppstoreAddOutlined, ToolOutlined, MedicineBoxOutlined, ShoppingOutlined } from '@ant-design/icons'; // Ícones representativos
import './CategoryGrid.css';

const { Title, Paragraph } = Typography;
const { Meta } = Card; // Para usar estrutura de Card do AntD

const CategoryGrid = () => {
  // --- Dados das Categorias ---
  // Substitua por suas categorias reais e ajuste ícones/imagens
  const categories = [
    {
      key: 'medicamentos',
      title: "Saúde Animal",
      // description: "Vacinas, vermífugos e cuidados.",
      icon: <MedicineBoxOutlined />, // Ícone representativo
      // imageUrl: "/images/categories/saude-animal.jpg", // Opcional: caminho para imagem
      link: "/produtos/saude-animal" // Rota da categoria
    },
    {
      key: 'defensivos',
      title: "Defensivos Agrícolas",
      // description: "Proteja sua lavoura.",
      icon: <BugOutlined />,
      // imageUrl: "/images/categories/defensivos.jpg",
      link: "/produtos/defensivos"
    },
    {
      key: 'fertilizantes',
      title: "Fertilizantes",
      // description: "Nutrição para sua plantação.",
      icon: <ExperimentOutlined />, // Pode trocar por outro ícone
      // imageUrl: "/images/categories/fertilizantes.jpg",
      link: "/produtos/fertilizantes"
    },
    {
      key: 'sementes',
      title: "Sementes",
      // description: "Variedades de alta performance.",
      icon: <AppstoreAddOutlined />, // Ícone genérico, pode trocar
      // imageUrl: "/images/categories/sementes.jpg",
      link: "/produtos/sementes"
    },
    {
        key: 'pecas',
        title: "Peças e Acessórios",
        // description: "Para máquinas e implementos.",
        icon: <ToolOutlined />,
        // imageUrl: "/images/categories/pecas.jpg",
        link: "/produtos/pecas"
      },
      {
        key: 'ofertas',
        title: "Ofertas Especiais",
        // description: "Produtos com preços imperdíveis.",
        icon: <ShoppingOutlined />, // Ícone de compras/ofertas
        // imageUrl: "/images/categories/ofertas.jpg",
        link: "/ofertas" // Rota específica de ofertas
      },
    // Adicione mais categorias conforme necessário
  ];
  // --- Fim Dados ---

  return (
    <section className="category-grid-section">
      <Title level={3} className="category-grid-title">Nossas Principais Categorias</Title>
      {/* <Paragraph className="category-grid-subtitle">Encontre rapidamente o que você precisa.</Paragraph> */}

      <div className="category-cards-container">
        {categories.map(category => (
          <Link to={category.link} key={category.key} className="category-card-link">
            <Card
              hoverable // Adiciona efeito hover padrão do AntD
              className="category-card"
              // Opcional: Imagem de capa no card
              // cover={category.imageUrl ? <img alt={category.title} src={category.imageUrl} className="category-card-image"/> : null}
            >
              {/* Usando Meta para estrutura simples Ícone + Título */}
              <Meta
                avatar={React.cloneElement(category.icon, { className: 'category-card-icon' })} // Ícone como avatar
                title={<span className="category-card-title-text">{category.title}</span>} // Título
                // description={category.description} // Descrição opcional
              />
            </Card>
          </Link>
        ))}
      </div>
       {/* Opcional: Botão para ver todas as categorias */}
       {/* <div style={{ textAlign: 'center', marginTop: '2rem' }}>
           <Button type="default">Ver Todas as Categorias</Button>
       </div> */}
    </section>
  );
};

export default CategoryGrid;